"""素材读取、内容校验、词级对齐和统一展示时间轴。字幕文字只来自确认稿，ASR 只提供时间。"""
import difflib
import hashlib
import json
import re
import subprocess
from pathlib import Path

from .text import display_en, find_all, words


class ContentError(ValueError):
    pass


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def probe(path):
    meta = json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]))
    v = next(s for s in meta["streams"] if s["codec_type"] == "video")
    a = next(s for s in meta["streams"] if s["codec_type"] == "audio")
    return {"width": v["width"], "height": v["height"], "duration": float(meta["format"]["duration"]),
            "video_duration": float(v["duration"]), "audio_duration": float(a["duration"]),
            "fps": v.get("r_frame_rate"), "color_space": v.get("color_space")}


def silences(path, db, min_len):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-nostdin", "-i", str(path), "-vn", "-af",
                          f"silencedetect=noise={db}dB:d={min_len}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return [(max(0.0, a), b) for a, b in zip(st, en)]


def load_episode(ep_dir, config_path=None):
    ep_dir = Path(ep_dir)
    raw = ep_dir / "raw.mp4"
    sha = sha256(raw)
    cache = ep_dir / f"asr-{sha}.json"
    if not cache.is_file():
        raise ContentError(f"没有与本原片对应的识别缓存 {cache.name}；换了音频必须重新识别，不能复用旧缓存")
    cfg_path = Path(config_path) if config_path else ep_dir / "subtitles.json"
    return {
        "dir": ep_dir, "raw": raw, "raw_sha256": sha, "asr": read_json(cache),
        "cfg": read_json(cfg_path), "cfg_path": cfg_path, "cfg_sha256": sha256(cfg_path),
        "english": (ep_dir / "english.txt").read_text("utf-8-sig"),
        "chinese": (ep_dir / "chinese.txt").read_text("utf-8-sig"),
        "draft": read_json(ep_dir / "draft.json"),
        "question": read_json(ep_dir / "source_question.json")["question"]["original_text"],
        "media": probe(raw),
    }


def validate_content(ep, default_speed=0.85, allow_legacy_speed=False):
    """沿用生产适配器的硬校验，并补上中文全文和释义校验。返回 warnings；硬错误直接抛出。"""
    cfg, warn = ep["cfg"], []
    m = ep["media"]
    if (m["width"], m["height"]) != (1080, 1920):
        raise ContentError("原片不是 1080×1920")
    speed = cfg.get("speed")
    if speed != default_speed:
        if speed == 0.9 and allow_legacy_speed:
            warn.append("本期沿用历史 0.9 倍（仅第30期）；新片默认 0.85")
        else:
            raise ContentError(f"速度 {speed} 不是默认 0.85；历史 0.9 须显式加 --allow-legacy-speed")
    cues = cfg.get("cues") or []
    if not cues or any(not c.get("zh", "").strip() or not words(c.get("en", "")) for c in cues):
        raise ContentError("双语字幕缺段")
    if words(cfg["header"]["title_en"]) != words(ep["question"]):
        raise ContentError("原题与题库原文不一致")
    if words(" ".join(c["en"] for c in cues)) != words(ep["english"]):
        raise ContentError("字幕英文与确认口播不一致")
    squash = lambda s: re.sub(r"\s+", "", s)
    if squash("".join(c["zh"] for c in cues)) != squash(ep["chinese"]):
        msg = "字幕中文与 chinese.txt 不完全一致"
        if cfg.get("zh_matches_delivered_subtitles"):
            warn.append(msg + "（沿用已交付字幕的中文，未改动）")
        else:
            raise ContentError(msg + "；若是沿用已交付字幕，请在配置里写 zh_matches_delivered_subtitles=true")
    locks = ep["draft"]["expressions"]
    vocab = cfg.get("vocab") or []
    if len(locks) != 7 or [words(v["match"]) for v in vocab] != [words(x[0]) for x in locks]:
        raise ContentError("七组表达与确认清单不符")
    if [v["zh"] for v in vocab] != [x[1] for x in locks]:
        raise ContentError("表达释义与确认清单不符")
    for v in vocab:
        if not any(find_all(display_en(c["en"]), display_en(v["match"])) for c in cues):
            raise ContentError(f"表达 {v['match']!r} 没有完整落在某一句字幕里（可能被分句拆开）")
    return warn


def align(ep, P):
    """把确认稿词元对到 ASR 词时间。返回每句 {start,end,words:[(start,end)]}（原片秒）。"""
    cues = ep["cfg"]["cues"]
    asr = [(tok, float(w["start"]), float(w["end"])) for seg in ep["asr"] for w in seg["words"]
           for tok in words(w["word"])]
    script = [t for c in cues for t in words(c["en"])]
    matched = {}
    sm = difflib.SequenceMatcher(None, script, [x[0] for x in asr], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for j in range(n):
            matched[a + j] = (asr[b + j][1], asr[b + j][2])
    dur = ep["media"]["duration"]
    times = [matched.get(i) for i in range(len(script))]
    known = [i for i, t in enumerate(times) if t]
    if not known:
        raise ContentError("识别结果与确认稿完全对不上")
    for i, t in enumerate(times):          # 未匹配的词在前后已知词之间均分
        if t:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        lo = times[prev][1] if prev is not None else 0.0
        hi = times[nxt][0] if nxt is not None else dur
        span = (nxt if nxt is not None else len(times)) - (prev if prev is not None else -1)
        step = (hi - lo) / span
        pos = i - (prev if prev is not None else -1)
        times[i] = (lo + step * (pos - 1), lo + step * pos)
    out, offset = [], 0
    for i, cue in enumerate(cues):
        n = len(words(cue["en"]))
        hits = [j for j in range(offset, offset + n) if j in matched]
        if len(hits) / n <= 0.65:
            raise ContentError(f"第 {i + 1} 句与实际声音无法可靠对齐")
        start, end = matched[hits[0]][0], matched[hits[-1]][1]
        if not 0 <= start < end <= dur + 0.1 or (out and start < out[-1]["end"] - 0.08):
            raise ContentError("识别时间不属于本次素材")
        out.append({"start": start, "end": end, "words": times[offset:offset + n],
                    "match_ratio": len(hits) / n})
        offset += n
    # 静音修正：ASR 常把句首词的起点粘到上一句句尾。若句首词内部包着一段静音，
    # 真正开口在静音结束处；上一句的声音则持续到静音开始处。
    sil = silences(ep["raw"], P["timeline"]["silence_db"], P["timeline"]["silence_min"])
    fixes = []
    for i in range(1, len(out)):
        ws, we = out[i]["words"][0]
        for a, b in sil:
            if a > ws - 0.10 and b < we and b - ws > 0.25:
                new = b - 0.06
                fixes.append({"cue": i + 1, "asr_start": round(ws, 3), "refined_start": round(new, 3)})
                out[i - 1]["end"] = max(out[i - 1]["end"], min(a, new))
                out[i]["start"] = new
                out[i]["words"][0] = (new, we)
                break
    return out, fixes


def paragraph_ends(english, cues):
    """确认稿的空行就是故事的段落；返回段尾所在的字幕序号集合。"""
    ends, total = set(), 0
    bounds = set()
    for para in re.split(r"\n\s*\n", english.strip()):
        total += len(words(para))
        bounds.add(total)
    count = 0
    for i, c in enumerate(cues):
        count += len(words(c["en"]))
        if count in bounds and i < len(cues) - 1:
            ends.add(i)
    return ends


def phrase_onset(cue_en, cue_words, match, occurrence_start):
    """短语在句内第一个词的时间（原片秒）。"""
    before = len(words(cue_en[:occurrence_start]))
    idx = min(before, len(cue_words) - 1)
    return cue_words[idx][0], idx


def build(ep, P, face_box):
    cfg = ep["cfg"]
    speed = cfg["speed"]
    total = ep["media"]["duration"] / speed
    TL, C = P["timeline"], P["card"]
    aligned, fixes = align(ep, P)
    para = paragraph_ends(ep["english"], cfg["cues"])
    n = len(aligned)
    s = [a["start"] / speed for a in aligned]
    e = [a["end"] / speed for a in aligned]
    show = [max(0.0, x - TL["lead"]) for x in s]
    show[0] = 0.0 if s[0] < 0.6 else show[0]
    hide = [0.0] * n
    for i in range(n):
        if i + 1 < n:
            gap = show[i + 1] - e[i]
            if i in para:
                hide[i] = min(e[i] + TL["linger"], show[i + 1] - TL["para_gap"])
                hide[i] = max(hide[i], min(e[i], show[i + 1]))
            elif gap < TL["bridge_gap"]:
                hide[i] = show[i + 1]
            else:
                hide[i] = min(e[i] + TL["linger"], show[i + 1] - TL["min_gap"])
            if hide[i] - show[i] < TL["min_dur"] and i not in para:
                hide[i] = min(show[i] + TL["min_dur"], show[i + 1])
        else:
            hide[i] = min(total, e[i] + TL["tail"])
    vocab = cfg["vocab"]
    cues, first_seen = [], {}
    for i, c in enumerate(cfg["cues"]):
        en = display_en(c["en"])
        zh_raw = c["zh"]
        zh_flat = zh_raw.replace("\n", "")
        marks = []
        for vi, v in enumerate(vocab):
            for a, b in find_all(en, display_en(v["match"])):
                src, _ = phrase_onset(en, aligned[i]["words"], v["match"], a)
                onset = max(show[i], src / speed - C["preroll"]) if a > 0 else show[i]
                zh_span = None
                for cand in list(c.get("zh_hl", [])) + [v["zh"]] + re.split(r"[／/]", v["zh"]):
                    hit = find_all(zh_flat, cand)
                    if cand and hit:
                        zh_span = hit[0]
                        break
                marks.append({"vi": vi, "en_span": (a, b), "zh_span": zh_span, "onset": onset})
                first_seen.setdefault(vi, (i, onset))
        cues.append({"en": en, "en_source": c["en"], "zh": zh_raw, "speech": (s[i], e[i]), "show": show[i], "hide": hide[i],
                     "marks": marks, "para_end": i in para, "match_ratio": aligned[i]["match_ratio"]})
    if len(first_seen) != len(vocab):
        raise ContentError("未得到全部七张表达卡")
    # ---- 表达卡：按“说到这个短语的时刻”出现；挨得太近的并排成一组，绝不出现 0 秒卡 ----
    cards = []
    for vi, v in enumerate(vocab):
        ci, onset = first_seen[vi]
        n_zh = len(re.findall(r"[一-鿿]", v["zh"]))
        read = C["read_base"] + C["read_per_en_word"] * len(v["en"].split()) + C["read_per_zh_char"] * n_zh
        cards.append({"vi": vi, "en": display_en(v["en"]), "zh": v["zh"], "cue": ci, "onset": onset,
                      "t0": onset, "read": read,
                      "desired": min(C["max_hold"], max(C["desired_hold"], 1.25 * read)), "pair_with": None})
    cards.sort(key=lambda x: x["onset"])
    story = cfg.get("story") or {}
    for a, b in story.get("pairs", []):
        ia = next(k for k, c in enumerate(cards) if words(vocab[c["vi"]]["match"]) == words(a))
        ib = next(k for k, c in enumerate(cards) if words(vocab[c["vi"]]["match"]) == words(b))
        cards[ib]["pair_with"] = cards[ia]["vi"]
    # ---- 开场钩子（已确认的封面文案）----
    H = P["hook"]
    hook_cfg = cfg.get("hook", {})
    hook_text = None
    if H["show"] and hook_cfg is not False:
        hook_text = (hook_cfg or {}).get("text") or ep["draft"].get("cover")
    hook = None
    top_lane = C["lane"] == "top"
    if hook_text:
        t1 = H["seconds"]
        first = cards[0]["onset"]
        if top_lane and first < t1:
            if first - 0.1 >= H["min_seconds"]:
                t1 = first - 0.1
            elif H["min_seconds"] + 0.1 - first <= H["max_card_delay"]:
                t1 = H["min_seconds"]
                cards[0]["t0"] = t1 + 0.1          # 首卡略晚于口播，字幕内高亮仍准时
            else:
                t1 = max(1.2, first - 0.1)
        hook = {"text": hook_text, "t0": 0.0, "t1": t1}
    groups = []
    for k, c in enumerate(cards):
        prev = cards[groups[-1]["members"][-1]] if groups else None
        # 若上一张在本张出现前读不完（可用时间 < 最短可读），两张并排同屏，而不是把上一张截短
        if prev and c["t0"] - C["end_gap"] - prev["t0"] < prev["read"]:
            groups[-1]["members"].append(k)
        else:
            groups.append({"members": [k]})
    for gi, g in enumerate(groups):
        g["t0"] = cards[g["members"][0]]["t0"]
        want = max(cards[k]["t0"] + cards[k]["desired"] for k in g["members"])
        limit = total - 0.05
        if gi + 1 < len(groups):
            limit = min(limit, cards[groups[gi + 1]["members"][0]]["t0"] - C["end_gap"])
        g["t1"] = min(want, limit)
        for row, k in enumerate(g["members"]):
            cards[k].update(group=gi, row=row, t1=g["t1"])
    # ---- 故事反转：轻推近 ----
    twist = None
    if story.get("twist_at") and P["twist"]["zoom"] > 0:
        key = words(story["twist_at"])
        hit = [i for i, c in enumerate(cfg["cues"]) if words(c["en"])[:len(key)] == key]
        if len(hit) != 1:
            raise ContentError("story.twist_at 应恰好对上一句字幕的开头")
        twist = {"cue": hit[0], "t": max(0.0, cues[hit[0]]["show"] - P["twist"]["lead"]),
                 "zoom": P["twist"]["zoom"], "ease": P["twist"]["ease"],
                 "center": [(face_box[0] + face_box[2]) / 2, (face_box[1] + face_box[3]) / 2]}
    # ---- 原题展开：放进上方栏最早的空档 ----
    Q = P["question"]
    q_words = len(words(cfg["header"]["title_en"]))
    q_dur = min(Q["max"], max(Q["min"], Q["base"] + Q["per_word"] * q_words))
    busy = [(g["t0"], g["t1"]) for g in groups] if top_lane else []
    start = (hook["t1"] if hook else 0.0) + 0.15
    question = None
    if "question_at" in cfg:
        question = {"t0": float(cfg["question_at"]), "t1": float(cfg["question_at"]) + q_dur, "wanted": q_dur}
    else:
        edges, cur = [], start
        for a, b in sorted(busy):
            if a - 0.15 > cur:
                edges.append((cur, a - 0.15))
            cur = max(cur, b + 0.15)
        edges.append((cur, total - 0.3))
        ok = [g for g in edges if g[1] - g[0] >= Q["accept_ratio"] * q_dur and g[0] <= Q["latest_start"]]
        pick = ok[0] if ok else max((g for g in edges if g[1] - g[0] >= 2.5), key=lambda g: g[1] - g[0], default=None)
        if pick is None:
            raise ContentError("上方栏没有足够空档展示原题；请在配置里写 question_at 或改用 dock 卡片")
        question = {"t0": pick[0], "t1": min(pick[0] + q_dur, pick[1]), "wanted": q_dur,
                    "fallback": not ok}
    # ---- 片尾呼应：钩子在最后一句回来 ----
    bookend = None
    if hook and P["bookend"]["show"] and story.get("bookend", True):
        t0 = cues[-1]["show"]
        if top_lane and groups and groups[-1]["t1"] + 0.15 > t0:
            t0 = groups[-1]["t1"] + 0.15
        if question and question["t1"] + 0.15 > t0:
            t0 = question["t1"] + 0.15
        if total - t0 >= 1.0:
            bookend = {"text": hook_text, "t0": t0, "t1": total}
    return {"total": total, "speed": speed, "cues": cues, "cards": cards, "groups": groups, "hook": hook,
            "question": question, "bookend": bookend, "twist": twist, "face": list(face_box),
            "silence_fixes": fixes, "header": {"tag": cfg["header"]["tag"], "title_zh": cfg["header"]["title_zh"],
                                               "title_en": " ".join(cfg["header"]["title_en"].split())}}


def zoom_at(plan, t):
    tw = plan.get("twist")
    if not tw or t <= tw["t"]:
        return 1.0
    x = min(1.0, (t - tw["t"]) / tw["ease"])
    return 1.0 + tw["zoom"] * (x * x * (3 - 2 * x))       # smoothstep


def face_at(plan, t):
    """推近后脸部安全框同步放大。"""
    z = zoom_at(plan, t)
    x0, y0, x1, y1 = plan["face"]
    if z == 1.0:
        return [x0, y0, x1, y1]
    cx, cy = plan["twist"]["center"]
    return [cx + (x0 - cx) * z, cy + (y0 - cy) * z, cx + (x1 - cx) * z, cy + (y1 - cy) * z]


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def srt(plan, mode):
    out = []
    for i, c in enumerate(plan["cues"], 1):
        zh = c["zh"].replace("\n", "")
        en = c["en_source"]          # SRT 保留确认稿原文（含弯引号）；只有烧录画面换成直引号
        body = {"en": en, "zh": zh, "bi": en + "\n" + zh}[mode]
        out.append(f"{i}\n{srt_time(c['show'])} --> {srt_time(c['hide'])}\n{body}\n")
    return "\n".join(out)
