#!/usr/bin/env python3
"""Evan 小猫学雅思 · 本地后期 v2 实验入口。只读 episodes/<期号>/ 的已确认素材，结果写到本目录 out/。
不提交任何云端任务；不覆盖已交付成片；同名输出默认拒绝覆盖。

  python render_v2.py check   --episode 33 --preset A
  python render_v2.py still   --episode 33 --preset A --t 3.0 --t 32.9 [--debug]
  python render_v2.py sheet   --episode 33 --preset A
  python render_v2.py render  --episode 33 --preset A
  python render_v2.py compare --episode 33 --preset A
  python render_v2.py detect-safe --episode 33
  python render_v2.py baseline-metrics --episode 33
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
# 解码成 RGB 时必须用精确取整，否则 swscale 默认截断会让整片亮度低约 1 级（实测 dY=-1.08 → 0.00）
TO_RGB = "scale=in_color_matrix=bt709:in_range=tv:flags=accurate_rnd+full_chroma_int+full_chroma_inp,format=rgb24"
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from evan_post2 import __version__, checks, compose, draw, params, safezone, text, timeline  # noqa: E402


def out_dir(args):
    d = HERE / "out" / f"ep{args.episode}-{args.preset_name}{('-' + args.label) if args.label else ''}"
    d.mkdir(parents=True, exist_ok=True)
    return d


def prepare(args):
    text.set_font_dir(ROOT / "assets/fonts")
    preset = Path(args.preset)
    if not preset.is_file():
        preset = HERE / "presets" / f"{args.preset}.json"
    args.preset_name = preset.stem.split("_")[0]
    over = {}
    if getattr(args, "outro", None):
        over["outro"] = {"seconds": args.outro}
    P = params.load(preset, over)
    ep_dir = Path(args.episode_dir) if args.episode_dir else ROOT / "episodes" / args.episode
    cfg = Path(args.config) if args.config else HERE / "episodes" / args.episode / "subtitles.v2.json"
    if not cfg.is_file():
        cfg = ep_dir / "subtitles.json"
    ep = timeline.load_episode(ep_dir, cfg)
    warnings = timeline.validate_content(ep, allow_legacy_speed=args.allow_legacy_speed)
    safe = (ep["cfg"].get("safe") or {}).get("face")
    if not safe:
        det = safezone.detect(ep["raw"])
        safe = det["face"]
        warnings.append(f"配置里没有 safe.face，本次用自动估计 {safe}；确认后请写进配置固定")
    plan = timeline.build(ep, P, safe)
    ref = grab(ep, min(1.0, plan["total"] / 2), plan["speed"])      # 机位固定：用一帧代表字幕区背景
    scene = compose.Scene(plan, P, ep["cfg"]["vocab"], ref)
    return ep, P, plan, scene, warnings, preset


def grab(ep, t_out, speed):
    with tempfile.TemporaryDirectory() as td:
        f = Path(td) / "f.png"
        t_src = min(max(0.0, t_out * speed), ep["media"]["video_duration"] - 0.12)
        subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-ss", f"{t_src:.3f}", "-i",
                        str(ep["raw"]), "-frames:v", "1", "-vf", TO_RGB, str(f)], check=True)
        with Image.open(f) as im:
            return im.convert("RGB")


def frame_at(ep, plan, scene, t, debug=False, P=None):
    img = scene.paste(scene.zoom(grab(ep, t, plan["speed"]), t), t)
    if debug:
        d = ImageDraw.Draw(img)
        SF = P["safe_frame"]
        d.rectangle([SF["side"], SF["top"], 1080 - SF["side"], SF["bottom"]], outline=(0, 220, 255), width=3)
        d.rectangle(timeline.face_at(plan, t), outline=(255, 40, 40), width=4)
        for name, _, _, _, a, b in scene.items(t):
            if a > 0.05:
                d.rectangle(b, outline=(60, 255, 90), width=2)
    return img


def report(ep, P, plan, scene, warnings, preset):
    audit = checks.audit(scene, plan, P)
    rows, flags = checks.reading(scene, plan, P)
    card_rows, card_err = checks.cards(scene, plan)
    q = plan["question"]
    if q and q["t0"] > 8:
        flags.append(f"原题英文在 {q['t0']:.1f}s 才展开（开头表达卡密集）；提示条里的中文题意全程可见。如需更早可设 question_at")
    if q and q["t1"] - q["t0"] < 0.85 * q["wanted"]:
        flags.append(f"原题展开 {q['t1'] - q['t0']:.1f}s，短于按词数估算的 {q['wanted']:.1f}s")
    return {
        "tool": f"evan_post2 {__version__}", "episode_dir": str(ep["dir"].relative_to(ROOT)) if ep["dir"].is_relative_to(ROOT) else str(ep["dir"]),
        "raw_sha256": ep["raw_sha256"], "config": ep["cfg_path"].name, "config_sha256": ep["cfg_sha256"],
        "preset": preset.name, "preset_sha256": timeline.sha256(preset),
        "code_sha256": {f.name: timeline.sha256(f) for f in sorted((HERE / "evan_post2").glob("*.py")) + [HERE / "render_v2.py"]},
        "speed": plan["speed"], "speed_application_count": 1, "output_seconds": round(plan["total"], 3),
        "cue_count": len(plan["cues"]), "card_count": len(plan["cards"]),
        "errors": audit["errors"] + card_err, "warnings": warnings, "review_flags": flags,
        "min_clearance_px": audit["min_clearance_px"], "mean_covered_ratio": audit["mean_covered_ratio"],
        "face_safe_box": plan["face"], "silence_refinements": plan["silence_fixes"],
        "hook": plan["hook"], "question": plan["question"], "bookend": plan["bookend"], "twist": plan["twist"],
        "card_groups": [{"t0": round(g["t0"], 2), "t1": round(g["t1"], 2), "style": g.get("style"),
                         "cards": [plan["cards"][k]["en"] for k in g["members"]]} for g in plan["groups"]],
        "cards": card_rows, "cues": rows,
        "note": "结构检查不等于画面好看、口型正确或留存更高。",
    }


def cmd_check(args):
    ep, P, plan, scene, warnings, preset = prepare(args)
    rep = report(ep, P, plan, scene, warnings, preset)
    if args.contrast:
        rep["contrast_white_text_vs_backdrop"] = contrast(ep, P, plan, scene)
    if args.save:
        (out_dir(args) / "check-report.json").write_text(json.dumps(rep, ensure_ascii=False, indent=2) + "\n", "utf-8")
    slim = {k: v for k, v in rep.items() if k not in ("cues",)} if not args.full else rep
    print(json.dumps(slim, ensure_ascii=False, indent=2))
    return 1 if rep["errors"] else 0


def contrast(ep, P, plan, scene):
    """每句字幕中点取真实画面，只叠字幕底（不画字），量白字相对底色的对比度。"""
    worst, rows = None, []
    for i, (c, lay) in enumerate(zip(plan["cues"], scene.lays), 1):
        t = (c["show"] + c["hide"]) / 2
        p5, med = scene.backdrop_contrast(scene.zoom(grab(ep, t, plan["speed"]), t), lay)
        rows.append({"cue": i, "worst5pct": p5, "median": med, "scrim_alpha": lay.get("scrim_alpha")})
        worst = p5 if worst is None else min(worst, p5)
    return {"min_of_worst5pct": worst, "per_cue": rows,
            "note": "未计入深色描边和投影，实际可读性高于此数。WCAG：大号粗体字 ≥3，正文 ≥4.5。"}


def cmd_still(args):
    ep, P, plan, scene, _, _ = prepare(args)
    d = out_dir(args) / "stills"
    d.mkdir(exist_ok=True)
    for t in args.t:
        dest = d / f"{'debug-' if args.debug else ''}t{t:06.2f}.jpg"
        frame_at(ep, plan, scene, t, args.debug, P).save(dest, quality=93)
        print(dest)


def key_times(plan):
    ts = [0.0]
    if plan["hook"]:
        ts.append(min(1.2, plan["hook"]["t1"] - 0.4))
    if plan["question"]:
        ts.append((plan["question"]["t0"] + plan["question"]["t1"]) / 2)
    for g in plan["groups"]:
        last = plan["cards"][g["members"][-1]]
        ts.append(min(g["t1"] - 0.3, last["t0"] + 0.9))
    longest = max(plan["cues"], key=lambda c: len(c["en"]) + 2 * len(c["zh"]))
    ts.append((longest["show"] + longest["hide"]) / 2)
    if plan["bookend"]:
        ts.append(min(plan["total"] - 0.1, plan["bookend"]["t0"] + 0.8))
    return sorted(set(round(t, 2) for t in ts))


def tile(frames, labels, cols, cell_w=360, label_h=44):
    fnt = text.font("bold", 26)
    cell_h = cell_w * 1920 // 1080
    rows = -(-len(frames) // cols)
    sheet = Image.new("RGB", (cols * cell_w + (cols + 1) * 8, rows * (cell_h + label_h) + 8), (245, 240, 232))
    d = ImageDraw.Draw(sheet)
    for i, (f, lab) in enumerate(zip(frames, labels)):
        x = 8 + (i % cols) * (cell_w + 8)
        y = 8 + (i // cols) * (cell_h + label_h)
        d.text((x + 2, y + 6), lab, font=fnt, fill=(58, 38, 24))
        sheet.paste(f.resize((cell_w, cell_h), Image.LANCZOS), (x, y + label_h - 4))
    return sheet


def cmd_sheet(args):
    ep, P, plan, scene, _, _ = prepare(args)
    ts = args.t or key_times(plan)
    frames = [frame_at(ep, plan, scene, t, args.debug, P) for t in ts]
    dest = out_dir(args) / f"sheet{'-debug' if args.debug else ''}.jpg"
    tile(frames, [f"{t:.2f}s" for t in ts], min(len(ts), args.cols)).save(dest, quality=90)
    print(dest)


def cmd_render(args):
    ep, P, plan, scene, warnings, preset = prepare(args)
    rep = report(ep, P, plan, scene, warnings, preset)
    if rep["errors"]:
        print(json.dumps(rep["errors"], ensure_ascii=False, indent=2))
        sys.exit("检查未通过，拒绝出片")
    d = out_dir(args)
    dest = d / "sample.mp4"
    if dest.exists() and not args.force:
        sys.exit(f"{dest} 已存在；换 --label 保留版本，或加 --force 覆盖本实验目录内的旧样片")
    E, speed, total = P["encode"], plan["speed"], plan["total"]
    outro = float(P["outro"]["seconds"])
    W, H = P["canvas"]
    fps = E["fps"]
    with tempfile.TemporaryDirectory(prefix="render-", dir=d) as td:
        staged = Path(td) / "sample.mp4"
        dec = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-nostdin", "-threads", str(E["threads"]), "-i", str(ep["raw"]), "-an", "-vf",
             f"setpts=(PTS-STARTPTS)/{speed},{TO_RGB}",
             "-r", str(fps), "-t", f"{total:.6f}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
            stdout=subprocess.PIPE)
        afilter = f"[1:a]atempo={speed},asetpts=PTS-STARTPTS" + (f",apad=pad_dur={outro}" if outro else "") + "[a]"
        enc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-nostdin", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
             "-framerate", str(fps), "-i", "-", "-i", str(ep["raw"]), "-filter_complex",
             f"[0:v]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[v];{afilter}",
             "-map", "[v]", "-map", "[a]", "-t", f"{total + outro:.6f}", "-r", str(fps),
             "-c:v", "libx264", "-threads", str(E["threads"]), "-preset", E["preset"], "-crf", str(E["crf"]),
             "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
             "-color_range", "tv", "-c:a", "aac", "-b:a", E["audio_bitrate"], "-movflags", "+faststart", str(staged)],
            stdin=subprocess.PIPE)
        size, n, last = W * H * 3, 0, None
        while True:
            buf = dec.stdout.read(size)
            if len(buf) < size:
                break
            t = n / fps
            frame = Image.frombuffer("RGB", (W, H), buf, "raw", "RGB", 0, 1).copy()
            frame = scene.zoom(frame, t)
            if outro:
                clean = frame.copy()
            frame = scene.paste(frame, t)
            enc.stdin.write(frame.tobytes())
            last, n = frame, n + 1
        if outro:
            clean = clean.filter(ImageFilter.GaussianBlur(P["outro"]["blur"]))
            clean = Image.blend(clean, Image.new("RGB", clean.size, tuple(P["colors"]["scrim"])), P["outro"]["dim"])
            rc = draw.recap(P, plan["header"], ep["cfg"]["vocab"])
            x, y = (W - rc.w) // 2 - draw.M, (H - rc.h) // 2 - 60 - draw.M
            for m in range(int(round(outro * fps))):
                a = min(1.0, (m + 1) / (0.3 * fps))
                f = Image.blend(last, clean, a)
                spr = compose.Scene._faded(rc.img, a)
                f.paste(spr, (x, y + int(16 * (1 - a))), spr)
                enc.stdin.write(f.tobytes())
        enc.stdin.close()
        if dec.wait() or enc.wait():
            sys.exit("FFmpeg 失败")
        m = timeline.probe(staged)
        want = total + outro
        if (m["width"], m["height"]) != (W, H) or abs(m["duration"] - want) > .16 or abs(m["video_duration"] - m["audio_duration"]) > .12:
            sys.exit(f"输出尺寸/时长/音画差未通过：{m}")
        subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-nostdin", "-i", str(staged), "-f", "null", "-"], check=True)
        rep.update(output="sample.mp4", output_sha256=timeline.sha256(staged), actual_seconds=m["duration"],
                   video_seconds=m["video_duration"], audio_seconds=m["audio_duration"], frames_written=n,
                   outro_seconds=outro, decode="passed", human_review="pending", publication="not_published")
        os.replace(staged, dest)
    (d / "render-receipt.json").write_text(json.dumps(rep, ensure_ascii=False, indent=2) + "\n", "utf-8")
    (d / "timeline.json").write_text(json.dumps(
        {"note": "show/hide 是烧录字幕与 SRT 共用的唯一展示时间轴（成片秒）；speech 是词级对齐的发声区间。",
         "cues": [{"n": i, "en": c["en_source"], "zh": c["zh"].replace("\n", ""), "speech": [round(v, 3) for v in c["speech"]],
                   "show": round(c["show"], 3), "hide": round(c["hide"], 3)} for i, c in enumerate(plan["cues"], 1)],
         "cards": rep["cards"]}, ensure_ascii=False, indent=2) + "\n", "utf-8")
    for mode, name in (("en", "英文字幕.srt"), ("zh", "中文字幕.srt"), ("bi", "双语字幕.srt")):
        (d / name).write_text(timeline.srt(plan, mode), "utf-8")
    cd = d / "七张表达卡"
    cd.mkdir(exist_ok=True)
    for c in plan["cards"]:
        s = draw.card(P, c, len(plan["cards"]))
        s.img.save(cd / f"card{c['vi'] + 1}.png")
    print(dest)


def _label_band(w, h, labels):
    band = Image.new("RGB", (w, h), (250, 244, 234))
    d = ImageDraw.Draw(band)
    f = text.font("bold", int(h * .5))
    for i, lab in enumerate(labels):
        d.text((w * (2 * i + 1) / (2 * len(labels)), h / 2), lab, font=f, fill=(58, 38, 24), anchor="mm")
    return band


def cmd_compare(args):
    text.set_font_dir(ROOT / "assets/fonts")
    preset = Path(args.preset)
    args.preset_name = (preset.stem if preset.is_file() else args.preset).split("_")[0]
    d = out_dir(args)
    new, old = d / "sample.mp4", ROOT / "episodes" / args.episode / "final.mp4"
    if not new.is_file():
        sys.exit("先运行 render")
    cw, ch, bh = 720, 1280, 72
    labels = ["现有版（已交付成片，未改动）", f"新版 方案{args.preset_name}（同一原片·同一配音·同一确认稿）"]
    with tempfile.TemporaryDirectory(dir=d) as td:
        band = Path(td) / "band.png"
        _label_band(cw * 2, bh, labels).save(band)
        dest = d / "compare_side_by_side.mp4"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-nostdin", "-y", "-i", str(old), "-i", str(new), "-loop", "1", "-i", str(band),
             "-filter_complex",
             f"[0:v]scale={cw}:{ch}[l];[1:v]scale={cw}:{ch}[r];[l][r]hstack[v0];[2:v][v0]vstack=shortest=1[v]",
             "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(dest)], check=True)
        print(dest)
        sd = d / "静帧对比"
        sd.mkdir(exist_ok=True)
        ts = args.t or [0.6, 3.1, 7.5, 10.4, 18.9, 20.9, 27.9, 33.0, 35.6, 39.4]
        pairs = []
        for t in ts:
            ims = []
            for k, src in enumerate((old, new)):
                f = Path(td) / f"{k}.png"
                subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-y", "-ss", f"{t:.3f}", "-i", str(src),
                                "-frames:v", "1", str(f)], check=True)
                with Image.open(f) as im:
                    ims.append(im.convert("RGB"))
            both = Image.new("RGB", (2160 + 24, 1920 + 96), (250, 244, 234))
            both.paste(_label_band(2184, 96, [f"现有版  {t:.1f}s", f"新版 方案{args.preset_name}  {t:.1f}s"]), (0, 0))
            both.paste(ims[0], (0, 96))
            both.paste(ims[1], (1104, 96))
            both.resize((1092, 1008), Image.LANCZOS).save(sd / f"对比_{t:05.1f}s.jpg", quality=92)
            pairs.append(both.resize((546, 504), Image.LANCZOS))
        cols = 5
        rows = -(-len(pairs) // cols)
        sheet = Image.new("RGB", (cols * 546, rows * 504), (250, 244, 234))
        for i, p in enumerate(pairs):
            sheet.paste(p, ((i % cols) * 546, (i // cols) * 504))
        sheet.save(sd / "对比总览.jpg", quality=90)
        # 手机实际大小：把两版缩到 390px 宽并排，检验小屏可读性
        phone = Image.new("RGB", (390 * 2 + 30, 693 * 2 + 30), (30, 30, 30))
        for r, t in enumerate(ts[1:3] if len(ts) > 2 else ts[:2]):
            for k, src in enumerate((old, new)):
                f = Path(td) / "p.png"
                subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-y", "-ss", f"{t:.3f}", "-i", str(src),
                                "-frames:v", "1", str(f)], check=True)
                with Image.open(f) as im:
                    phone.paste(im.convert("RGB").resize((390, 693), Image.LANCZOS), (10 + k * 400, 10 + r * 703))
        phone.save(sd / "手机实际宽度390px_左旧右新.png")
        print(sd)


def cmd_detect(args):
    ep_dir = Path(args.episode_dir) if args.episode_dir else ROOT / "episodes" / args.episode
    det = safezone.detect(ep_dir / "raw.mp4")
    print(json.dumps(det, ensure_ascii=False, indent=2))


def cmd_baseline(args):
    """读旧模板的图层规划（不渲染、不改任何文件），量同样的指标，供新旧对照。"""
    sys.path.insert(0, str(ROOT / "source"))
    from types import ModuleType
    import evan_render as R
    for wgt in ("Bold", "Medium", "Black"):
        os.environ["SUB_FONT_" + wgt.upper()] = str(ROOT / "assets/fonts" / f"NotoSansSC-{wgt}.otf")
    kit = ModuleType("old_template")
    path = ROOT / "source/template_effective.py"
    exec(compile(path.read_text("utf-8-sig"), str(path), "exec"), kit.__dict__)
    R.template = lambda project: kit
    job = ROOT / "episodes" / args.episode
    sha = timeline.sha256(job / "raw.mp4")
    rj = timeline.read_json
    w, h, dur, _, _ = R.media(job / "raw.mp4")
    cfg = rj(job / "subtitles.json")
    layers, timing = R.prepare(ROOT, cfg, (job / "english.txt").read_text("utf-8-sig"), rj(job / "draft.json")["expressions"],
                               rj(job / "source_question.json")["question"]["original_text"], rj(job / f"asr-{sha}.json"), w, h, dur)
    total = dur / cfg["speed"]
    face = safezone.detect(job / "raw.mp4")["face"]
    rows, area = [], 0.0
    for name, im, a, b, fade in layers:
        solid = im.getchannel("A").point(lambda v: 255 if v > 64 else 0)     # 不算阴影，只算看得见的底板/文字
        bb = solid.getbbox()
        area += solid.histogram()[255] * max(0.0, b - a)
        rows.append({"name": name, "from": round(a, 2), "to": round(b, 2), "seconds": round(b - a, 2), "bbox": list(bb),
                     "hits_face_box": checks._hit(bb, face)})
    zh_lines = [len(kit.cue_layout(c, w / 720)[3]) for c in cfg["cues"]]
    print(json.dumps({
        "episode": int(args.episode), "face_box_auto": face, "output_seconds": round(total, 2),
        "mean_covered_ratio": round(area / total / (w * h), 4),
        "cards": [r for r in rows if r["name"].startswith("vocab")],
        "zero_second_cards": [r["name"] for r in rows if r["name"].startswith("vocab") and r["seconds"] <= 0],
        "header": next(r for r in rows if r["name"] == "header"),
        "max_zh_lines": max(zh_lines), "cues_over_2_zh_lines": sum(n > 2 for n in zh_lines),
        "note": "遮盖面积=不透明度>25%的像素×显示时长，与新版 check 的 mean_covered_ratio 同口径。"}, ensure_ascii=False, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--episode", required=True)
        p.add_argument("--episode-dir", help="默认 <包>/episodes/<期号>")
        p.add_argument("--config", help="默认本目录 episodes/<期号>/subtitles.v2.json，没有则读原 subtitles.json")
        p.add_argument("--preset", default="A", help="A / B 或预设 JSON 路径")
        p.add_argument("--label", default="")
        p.add_argument("--allow-legacy-speed", action="store_true", help="仅第30期历史 0.9 倍使用")
        return p

    p = common(sub.add_parser("check")); p.add_argument("--full", action="store_true"); p.add_argument("--save", action="store_true")
    p.add_argument("--contrast", action="store_true"); p.set_defaults(fn=cmd_check)
    p = common(sub.add_parser("still")); p.add_argument("--t", type=float, action="append", required=True)
    p.add_argument("--debug", action="store_true"); p.set_defaults(fn=cmd_still)
    p = common(sub.add_parser("sheet")); p.add_argument("--t", type=float, action="append"); p.add_argument("--cols", type=int, default=6)
    p.add_argument("--debug", action="store_true"); p.set_defaults(fn=cmd_sheet)
    p = common(sub.add_parser("render")); p.add_argument("--force", action="store_true")
    p.add_argument("--outro", type=float, help="片尾定格回顾秒数（改变片长，需审核）"); p.set_defaults(fn=cmd_render)
    p = common(sub.add_parser("compare")); p.add_argument("--t", type=float, action="append"); p.set_defaults(fn=cmd_compare)
    p = sub.add_parser("detect-safe"); p.add_argument("--episode", required=True); p.add_argument("--episode-dir"); p.set_defaults(fn=cmd_detect)
    p = sub.add_parser("baseline-metrics"); p.add_argument("--episode", required=True); p.set_defaults(fn=cmd_baseline)
    args = ap.parse_args()
    for name in ("ffmpeg", "ffprobe"):
        if shutil.which(name) is None:
            ap.error(f"{name} 不在 PATH")
    sys.exit(args.fn(args) or 0)


if __name__ == "__main__":
    main()
