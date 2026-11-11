"""可由代码验证的部分：遮挡、安全框、可读时间、卡片时长、底色对比度。
这些检查不能证明“好看”或“留存更高”，只保证版式规则被遵守。"""
import re

from .timeline import face_at


def _hit(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


def audit(scene, plan, P, step=0.04):
    W, H = P["canvas"]
    SF = P["safe_frame"]
    errors, seen, solid = [], set(), {}
    clear = {"above_face": None, "below_face": None}
    area_sum, n = 0.0, 0
    t = 0.0
    while t < plan["total"]:
        face = face_at(plan, t)
        items = [it for it in scene.items(t) if it[4] > 0.05]
        boxes = [(it[0], it[5]) for it in items]
        frame_area = 0.0
        for it in items:
            if id(it[1]) not in solid:
                solid[id(it[1])] = it[1].getchannel("A").point(lambda v: 255 if v > 64 else 0).histogram()[255]
            frame_area += solid[id(it[1])]
        for name, b in boxes:
            if b[0] < SF["side"] or b[2] > W - SF["side"] or b[1] < SF["top"] or b[3] > SF["bottom"]:
                key = ("frame", name)
                if key not in seen:
                    seen.add(key)
                    errors.append(f"{name} 超出平台安全框 @ {t:.2f}s: {[round(v) for v in b]}")
            if _hit(b, face):
                key = ("face", name)
                if key not in seen:
                    seen.add(key)
                    errors.append(f"{name} 压到脸部安全框 @ {t:.2f}s")
            elif b[0] < face[2] and face[0] < b[2]:
                if b[3] <= face[1]:
                    d = face[1] - b[3]
                    clear["above_face"] = d if clear["above_face"] is None else min(clear["above_face"], d)
                elif b[1] >= face[3]:
                    d = b[1] - face[3]
                    clear["below_face"] = d if clear["below_face"] is None else min(clear["below_face"], d)
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                if _hit(boxes[i][1], boxes[j][1]):
                    key = ("pair", boxes[i][0], boxes[j][0])
                    if key not in seen:
                        seen.add(key)
                        errors.append(f"{boxes[i][0]} 与 {boxes[j][0]} 互相重叠 @ {t:.2f}s")
        area_sum += frame_area / (W * H)
        n += 1
        t += step
    return {"errors": errors, "min_clearance_px": {k: (round(v) if v is not None else None) for k, v in clear.items()},
            "mean_covered_ratio": round(area_sum / max(n, 1), 4)}


def reading(scene, plan, P):
    R = P["reading"]
    rows, flags = [], []
    for i, (c, lay) in enumerate(zip(plan["cues"], scene.lays), 1):
        dur = c["hide"] - c["show"]
        n_zh = len(re.findall(r"[一-鿿]", c["zh"]))
        row = {"cue": i, "show": round(c["show"], 3), "hide": round(c["hide"], 3), "seconds": round(dur, 2),
               "en_lines": lay["n_en"], "zh_lines": lay["n_zh"], "en_px": lay["en_size"], "zh_px": lay["zh_size"],
               "en_cps": round(len(c["en"]) / dur, 1), "zh_cps": round(n_zh / dur, 1),
               "zh_break_needs_eyeball": lay["zh_soft_break"], "en": c["en"]}
        rows.append(row)
        if row["zh_cps"] > R["zh_cps_max"] or row["en_cps"] > R["en_cps_max"]:
            flags.append(f"第{i}句偏快：{dur:.2f}s，英 {row['en_cps']} 字符/秒，中 {row['zh_cps']} 字/秒")
        if dur < P["timeline"]["min_dur"] - 1e-6:
            flags.append(f"第{i}句只显示 {dur:.2f}s")
        if lay["zh_soft_break"]:
            flags.append(f"第{i}句中文在非标点处自动换行，请看一眼；不合适可在稿内用 \\n 指定")
    return rows, flags


def cards(scene, plan):
    rows, errors = [], []
    for c in sorted(plan["cards"], key=lambda x: x["vi"]):
        hold = c["t1"] - c["t0"]
        s = scene.cards[c["vi"]][0]
        rows.append({"n": c["vi"] + 1, "en": c["en"], "zh": c["zh"], "spoken_at": round(c["onset"], 2),
                     "from": round(c["t0"], 2), "to": round(c["t1"], 2), "seconds": round(hold, 2),
                     "min_read_seconds": round(c["read"], 2), "style": s.extra.get("kind"),
                     "group_size": len(plan["groups"][c["group"]]["members"])})
        if hold < c["read"] - 1e-6:
            errors.append(f"表达卡 {c['vi'] + 1}「{c['en']}」只显示 {hold:.2f}s，低于最短可读 {c['read']:.2f}s")
    if len(rows) != 7:
        errors.append("表达卡不是七张")
    return rows, errors


def _lin(v):
    v /= 255
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def contrast_of_region(img_rgb, box):
    """白字对该区域底色的 WCAG 对比度：返回 (最差5%分位, 中位)。用亮度直方图近似。"""
    hist = img_rgb.crop([int(v) for v in box]).convert("L").histogram()
    total = sum(hist)
    out, acc, want = [], 0, [0.95, 0.5]      # 越亮对比越差，所以取亮端分位
    for q in want:
        acc = 0
        for level, cnt in enumerate(hist):
            acc += cnt
            if acc >= q * total:
                out.append(round(1.05 / (_lin(level) + 0.05), 2))
                break
    return out[0], out[1]
