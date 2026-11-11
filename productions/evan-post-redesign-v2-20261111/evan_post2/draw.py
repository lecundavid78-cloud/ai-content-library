"""各图层的绘制。全部先按 supersample 倍绘制再缩小，圆角和小字边缘更干净。
每个函数返回 Sprite：带阴影外边距的 RGBA 图 + 内容矩形（成片像素）。"""
from dataclasses import dataclass, field

from PIL import Image, ImageDraw, ImageFilter

from . import text as T

M = 40  # 每个 sprite 四周给阴影留的外边距（成片像素）


class LayoutError(ValueError):
    pass


@dataclass
class Sprite:
    img: Image.Image
    w: int            # 内容宽高（不含外边距）
    h: int
    extra: dict = field(default_factory=dict)


def rgba(c, a=255):
    return (int(c[0]), int(c[1]), int(c[2]), int(a))


def mix(a, b, t):
    return [a[i] + (b[i] - a[i]) * t for i in range(3)]


def _new(w, h, k):
    return Image.new("RGBA", (int((w + 2 * M) * k), int((h + 2 * M) * k)), (0, 0, 0, 0))


def _finish(img, k, shadow=None):
    """shadow=(blur, alpha, dy) 以成片像素计。"""
    if shadow:
        blur, alpha, dy = shadow
        a = img.getchannel("A").point(lambda v: v * alpha // 255)
        sh = Image.new("RGBA", img.size, (30, 18, 10, 0))
        sh.putalpha(a)
        sh = sh.filter(ImageFilter.GaussianBlur(blur * k))
        base = Image.new("RGBA", img.size, (0, 0, 0, 0))
        base.alpha_composite(sh, (0, int(dy * k)))
        base.alpha_composite(img)
        img = base
    if k != 1:
        img = img.resize((img.width // k, img.height // k), Image.LANCZOS)
    return img


def paw(d, cx, cy, s, fill):
    d.ellipse([cx - .30 * s, cy - .04 * s, cx + .30 * s, cy + .44 * s], fill=fill)
    for dx, dy in ((-.37, -.10), (-.14, -.34), (.14, -.34), (.37, -.10)):
        r = .125 * s
        d.ellipse([cx + dx * s - r, cy + dy * s - r * 1.15, cx + dx * s + r, cy + dy * s + r * 1.15], fill=fill)


def _text(d, x, base, s, fnt, fill, **kw):
    d.text((x, base), s, font=fnt, fill=fill, anchor="ls", **kw)


# ------------------------------------------------------------------ 提示条
def chip(P, header):
    k, C, col = P["supersample"], P["chip"], P["colors"]
    tag_size, title_size = C["tag_size"], C["title_size"]
    maxw = P["canvas"][0] - 2 * P["safe_frame"]["side"]
    while True:
        ft, fz = T.font("bold", tag_size * k), T.font("bold", title_size * k)
        tag_w = ft.getlength(header["tag"]) / k
        title_w = fz.getlength(header["title_zh"]) / k
        pill_w = 16 + 26 + 8 + tag_w + 18
        w = 10 + pill_w + 16 + title_w + 26
        if w <= maxw or title_size <= 26:
            break
        title_size -= 2
        tag_size = max(22, tag_size - 1)
    if w > maxw:
        raise LayoutError("提示条放不下：中文题意过长，请给 header.title_zh 一个更短的写法")
    w, h = int(round(w)), C["h"]
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    d.rounded_rectangle([o, o, o + w * k, o + h * k], radius=h * k / 2, fill=rgba(col["cream"], 242))
    ph = h - 20
    px0, py0 = o + 10 * k, o + 10 * k
    d.rounded_rectangle([px0, py0, px0 + pill_w * k, py0 + ph * k], radius=ph * k / 2, fill=rgba(col["coral"]))
    paw(d, px0 + (16 + 13) * k, py0 + ph * k / 2 - 1 * k, 26 * k, rgba((255, 255, 255)))
    _text(d, px0 + (16 + 26 + 8) * k, py0 + ph * k / 2 + tag_size * .36 * k, header["tag"], ft, rgba((255, 255, 255)))
    _text(d, px0 + (pill_w + 16) * k, o + h * k / 2 + title_size * .37 * k, header["title_zh"], fz, rgba(col["cocoa"]))
    return Sprite(_finish(img, k, (10, 70, 4)), w, h)


# ------------------------------------------------------------------ 原题展开
def question(P, header, min_w):
    k, Q, col = P["supersample"], P["question"], P["colors"]
    text = header["title_en"]
    for size in Q["sizes"]:
        f = T.font("bold", size * k)
        lines = _wrap_balanced(text, f, Q["max_w"] * k, Q["max_lines"])
        if lines:
            break
    else:
        raise LayoutError("原题英文超过三行：请检查题目长度或调小 question.sizes")
    fl = T.font("bold", 26 * k)
    lh = int(size * 1.34)
    tw = max(f.getlength(s) for s in lines) / k
    w = int(max(min_w, tw + 2 * 44))
    h = 18 + 30 + len(lines) * lh + 22
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    d.rounded_rectangle([o, o, o + w * k, o + h * k], radius=30 * k, fill=rgba(col["cream"], 245))
    cx = o + w * k / 2
    d.text((cx, o + (18 + 15) * k), "原题", font=fl, fill=rgba(col["coral"]), anchor="mm")
    y = o + (18 + 30) * k
    for s in lines:
        d.text((cx, y + lh * k / 2 + size * .36 * k), s, font=f, fill=rgba(col["cocoa"]), anchor="ms")
        y += lh * k
    return Sprite(_finish(img, k, (12, 80, 5)), w, h, {"lines": lines, "size": size})


def _wrap_balanced(text, f, maxw, max_lines):
    ws = text.split()
    for n in range(1, max_lines + 1):
        best = None

        def rec(start, left, acc):
            nonlocal best
            if left == 1:
                line = " ".join(ws[start:])
                if f.getlength(line) <= maxw:
                    cand = acc + [line]
                    widths = [f.getlength(s) for s in cand]
                    cost = max(widths) - min(widths)
                    if best is None or cost < best[0]:
                        best = (cost, cand)
                return
            for j in range(start + 1, len(ws) - left + 2):
                line = " ".join(ws[start:j])
                if f.getlength(line) > maxw:
                    break
                rec(j, left - 1, acc + [line])
        if len(ws) >= n:
            rec(0, n, [])
        if best:
            return best[1]
    return None


# ------------------------------------------------------------------ 开场气泡
def hook(P, text, tail_x_rel=0.5):
    k, H, col = P["supersample"], P["hook"], P["colors"]
    size = H["size"]
    f = T.font("black", size * k)
    lines = [text]
    if f.getlength(text) / k > H["max_w"] - 96:
        size = H["size_2line"]
        cut = [i + 1 for i, ch in enumerate(text[:-1]) if ch in "，、；：？！,"]
        while True:
            f = T.font("black", size * k)
            if cut:
                c = min(cut, key=lambda i: abs(f.getlength(text[:i]) - f.getlength(text[i:])))
            else:
                c = min(range(2, len(text) - 1), key=lambda i: abs(f.getlength(text[:i]) - f.getlength(text[i:])))
            lines = [text[:c], text[c:]]
            if max(f.getlength(s) for s in lines) / k <= H["max_w"] - 96 or size <= 48:
                break
            size -= 4
        if max(f.getlength(s) for s in lines) / k > H["max_w"] - 96:
            raise LayoutError("开场钩子太长，两行也放不下")
    lh = int(size * 1.22)
    w = int(max(f.getlength(s) for s in lines) / k + 96)
    body_h = len(lines) * lh + 44
    tail = 24
    h = body_h + tail
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    fill = rgba(col["cream"], 247)
    d.rounded_rectangle([o, o, o + w * k, o + body_h * k], radius=40 * k, fill=fill)
    tx = o + min(max(tail_x_rel * w, 70), w - 70) * k
    d.polygon([(tx - 24 * k, o + body_h * k - 2 * k), (tx + 24 * k, o + body_h * k - 2 * k),
               (tx, o + (body_h + tail) * k)], fill=fill)
    y = o + 22 * k
    for s in lines:
        d.text((o + w * k / 2, y + lh * k / 2 + size * .37 * k), s, font=f, fill=rgba(col["cocoa"]), anchor="ms")
        y += lh * k
    return Sprite(_finish(img, k, (12, 85, 5)), w, h, {"lines": lines, "size": size, "body_h": body_h})


# ------------------------------------------------------------------ 表达卡
def _dots(d, cx, cy, k, n, total, col):
    step = 26 * k
    x = cx - step * (total - 1) / 2
    for i in range(1, total + 1):
        r = (8 if i == n else 6) * k
        fill = rgba(col["coral"]) if i <= n else rgba(col["tan"])
        d.ellipse([x - r, cy - r, x + r, cy + r], fill=fill)
        x += step


def _phrase(d, x, base, s, f, size, k, col, marker=True, color=None):
    w = f.getlength(s)
    if marker:
        d.rounded_rectangle([x - 12 * k, base - .82 * size * k, x + w + 12 * k, base + .26 * size * k],
                            radius=12 * k, fill=rgba(col["yellow"]))
    _text(d, x, base, s, f, rgba(color or col["cocoa"]))
    return w


def card(P, c, total, ghost=None):
    """标准卡：进度点 + 英文（黄色记号笔）+ 中文释义。ghost=成对出现时左侧淡显的上一组表达。"""
    k, C, col = P["supersample"], P["card"], P["colors"]
    es, zs = C["en_size"], C["zh_size"]
    maxw = P["canvas"][0] - 2 * P["safe_frame"]["side"]
    while True:
        fe, fz = T.font("black", es * k), T.font("bold", zs * k)
        cols = [(c, max(fe.getlength(c["en"]), fz.getlength(c["zh"])) / k)]
        if ghost:
            cols.insert(0, (ghost, max(fe.getlength(ghost["en"]), fz.getlength(ghost["zh"])) / k))
        inner = sum(wd for _, wd in cols) + (84 if ghost else 0)
        w = max(inner + 2 * 46, 26 * (total - 1) + 2 * 46, 380)
        if w <= maxw or es <= 40:
            break
        es, zs = es - 4, zs - 2
    if w > maxw:
        raise LayoutError(f"表达卡放不下：{c['en']}")
    w = int(round(w))
    en_box, zh_box = int(es * 1.26), int(zs * 1.36)
    h = 20 + 18 + 10 + en_box + zh_box + 20
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    d.rounded_rectangle([o, o, o + w * k, o + h * k], radius=34 * k, fill=rgba(col["cream"], 247))
    _dots(d, o + w * k / 2, o + (20 + 9) * k, k, c["vi"] + 1, total, col)
    y_en = o + (20 + 18 + 10) * k
    base_en = y_en + en_box * k / 2 + es * .36 * k
    base_zh = y_en + en_box * k + zh_box * k / 2 + zs * .37 * k
    x = o + (w * k - inner * k) / 2
    for item, wd in cols:
        is_ghost = ghost is not None and item is ghost
        cxm = x + wd * k / 2
        ink = mix(col["cocoa"], col["cream"], .52) if is_ghost else col["cocoa"]
        ink2 = mix(col["cocoa_mid"], col["cream"], .45) if is_ghost else col["cocoa_mid"]
        _phrase(d, cxm - fe.getlength(item["en"]) / 2, base_en, item["en"], fe, es, k, col, marker=not is_ghost, color=ink)
        d.text((cxm, base_zh), item["zh"], font=fz, fill=rgba(ink2), anchor="ms")
        x += wd * k
        if is_ghost:
            ax, ay = x + 24 * k, y_en + en_box * k / 2 + 2 * k
            d.line([ax, ay, ax + 30 * k, ay], fill=rgba(col["coral"]), width=int(5 * k))
            d.polygon([(ax + 26 * k, ay - 11 * k), (ax + 42 * k, ay), (ax + 26 * k, ay + 11 * k)], fill=rgba(col["coral"]))
            x += 84 * k
    return Sprite(_finish(img, k, (12, 85, 5)), w, h, {"en_size": es, "zh_size": zs, "kind": "pair" if ghost else "standard"})


def card_compact(P, c, total):
    """一行小标签：序号 + 英文 + 中文。用于贴字幕（方案B）和上方栏放不下两张标准卡时。"""
    k, C, col = P["supersample"], P["card"], P["colors"]
    es, zs = C["compact_en"], C["compact_zh"]
    maxw = P["canvas"][0] - 2 * P["safe_frame"]["side"]
    while True:
        fe, fz, fn = T.font("black", es * k), T.font("bold", zs * k), T.font("black", 26 * k)
        we, wz = fe.getlength(c["en"]) / k, fz.getlength(c["zh"]) / k
        w = 20 + 46 + 26 + we + 30 + wz + 34
        if w <= maxw or es <= 34:
            break
        es, zs = es - 2, zs - 2
    if w > maxw:
        raise LayoutError(f"小标签放不下：{c['en']} / {c['zh']}")
    w, h = int(round(w)), 84
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    d.rounded_rectangle([o, o, o + w * k, o + h * k], radius=h * k / 2, fill=rgba(col["cream"], 247))
    cy = o + h * k / 2
    bx = o + (20 + 23) * k
    d.ellipse([bx - 23 * k, cy - 23 * k, bx + 23 * k, cy + 23 * k], fill=rgba(col["coral"]))
    d.text((bx, cy + 26 * .36 * k), str(c["vi"] + 1), font=fn, fill=rgba((255, 255, 255)), anchor="ms")
    x = o + (20 + 46 + 26) * k
    _phrase(d, x, cy + es * .36 * k, c["en"], fe, es, k, col)
    _text(d, x + (we + 30) * k, cy + zs * .37 * k, c["zh"], fz, rgba(col["cocoa_mid"]))
    return Sprite(_finish(img, k, (10, 80, 4)), w, h, {"en_size": es, "zh_size": zs, "kind": "compact"})


# ------------------------------------------------------------------ 双语字幕
def cue_back(P, lay, k, y_org, hgt):
    """字幕底：panel=暖色半透明底板；scrim=羽化暗晕（强度可按背景亮度逐句自适应）。"""
    S, col = P["sub"], P["colors"]
    W = P["canvas"][0]
    bx0, by0, bx1, by1 = lay["bbox"]
    back = Image.new("RGBA", (W * k, hgt * k), (0, 0, 0, 0))
    if S["mode"] == "panel":
        d = ImageDraw.Draw(back)
        d.rounded_rectangle([(bx0 - 34) * k, (by0 - y_org - 16) * k, (bx1 + 34) * k, (by1 - y_org + 14) * k],
                            radius=30 * k, fill=rgba(col["panel"], S["panel_alpha"]))
        return back
    m = Image.new("L", back.size, 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [(bx0 - 46) * k, (by0 - y_org - 26) * k, (bx1 + 46) * k, (by1 - y_org + 26) * k],
        radius=44 * k, fill=int(lay.get("scrim_alpha", S["scrim_alpha"])))
    m = m.filter(ImageFilter.GaussianBlur(S["scrim_blur"] * k))
    back = Image.new("RGBA", back.size, rgba(col["scrim"], 0))
    back.putalpha(m)
    return back


def cue_origin(lay, pad_y=70):
    return int(lay["bbox"][1] - pad_y), int(lay["bbox"][3] - lay["bbox"][1] + 2 * pad_y)


def layout_cue(P, cue):
    """只做测量：字号、断行、每行位置、高亮区间。放不下抛 LayoutError。"""
    S = P["sub"]
    en, zh_raw = cue["en"], cue["zh"]
    glue_en = [m["en_span"] for m in cue["marks"]]
    glue_zh = [m["zh_span"] for m in cue["marks"] if m["zh_span"]]
    es, en_lines = T.fit_en(en, glue_en, S["en_sizes"], S["max_w"], S["max_en_lines"])
    if not en_lines:
        raise LayoutError(f"英文超出两行，应重新分句：{en!r}")
    zs, zh, zh_lines, soft = T.fit_zh(zh_raw, glue_zh, S["zh_sizes"], S["max_w"], S["max_zh_lines"])
    if not zh_lines:
        raise LayoutError(f"中文超出两行，应重新分句：{zh_raw!r}")
    lh_e, lh_z = round(es * S["en_lh"]), round(zs * S["zh_lh"])
    D, g = S["divider_y"], S["gap"]
    fe, fz = T.font("bold", es), T.font("medium", zs)
    W = P["canvas"][0]
    rows = []
    for i, (a, b) in enumerate(en_lines):
        s = en[a:b]
        w = fe.getlength(s)
        top = D - g / 2 - (len(en_lines) - i) * lh_e
        rows.append({"lang": "en", "text": s, "span": (a, b), "x": (W - w) / 2, "w": w, "top": top,
                     "base": top + lh_e / 2 + es * .36, "lh": lh_e})
    for i, (a, b) in enumerate(zh_lines):
        s = zh[a:b]
        w = fz.getlength(s)
        top = D + g / 2 + i * lh_z
        rows.append({"lang": "zh", "text": s, "span": (a, b), "x": (W - w) / 2, "w": w, "top": top,
                     "base": top + lh_z / 2 + zs * .37, "lh": lh_z})
    x0 = min(r["x"] for r in rows)
    x1 = max(r["x"] + r["w"] for r in rows)
    y0 = min(r["top"] for r in rows)
    y1 = max(r["top"] + r["lh"] for r in rows)
    return {"en_size": es, "zh_size": zs, "rows": rows, "zh": zh, "bbox": [x0, y0, x1, y1],
            "zh_soft_break": soft and len(zh_lines) > 1, "n_en": len(en_lines), "n_zh": len(zh_lines)}


def cue_sprites(P, cue, lay):
    """返回 (未高亮图, 已高亮图, 原点y, 每个高亮的擦入矩形)。两张图只有高亮处不同。"""
    k, S, col = P["supersample"], P["sub"], P["colors"]
    W = P["canvas"][0]
    y_org, hgt = cue_origin(lay)
    fe, fz = T.font("bold", lay["en_size"] * k), T.font("medium", lay["zh_size"] * k)
    stroke = int(round(S["stroke"] * k))

    back = cue_back(P, lay, k, y_org, hgt)

    def spans_in(row, key):
        out = []
        for mi, mk in enumerate(cue["marks"]):
            sp = mk[key]
            if not sp:
                continue
            a, b = max(sp[0], row["span"][0]), min(sp[1], row["span"][1])
            if a < b:
                a, b = a - row["span"][0], b - row["span"][0]
                if key == "en_span" and b < len(row["text"]) and row["text"][b] in ".,!?;:":
                    b += 1          # 句末标点并进记号笔里，避免被色块边缘压住
                out.append((mi, a, b))
        return out

    def draw(on):
        img = back.copy()
        ink = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(ink)
        rects = {}
        for row in lay["rows"]:
            f, size = (fe, lay["en_size"]) if row["lang"] == "en" else (fz, lay["zh_size"])
            base, x = (row["base"] - y_org) * k, row["x"] * k
            color = col["en"] if row["lang"] == "en" else col["zh"]
            _text(d, x, base, row["text"], f, rgba(color), stroke_width=stroke, stroke_fill=rgba(col["stroke"], 235))
            for mi, a, b in spans_in(row, "en_span" if row["lang"] == "en" else "zh_span"):
                sx0 = x + f.getlength(row["text"][:a])
                sub = row["text"][a:b]
                sx1 = sx0 + f.getlength(sub)
                if row["lang"] == "en":
                    box = [sx0 - 10 * k, base - .86 * size * k, sx1 + 10 * k, base + .29 * size * k]
                    if on:
                        d.rounded_rectangle(box, radius=11 * k, fill=rgba(col["yellow"]))
                        _text(d, sx0, base, sub, f, rgba(col["hl_text"]))
                else:
                    box = [sx0 - 5 * k, base - .98 * size * k, sx1 + 5 * k, base + .22 * size * k]
                    if on:
                        _text(d, sx0, base, sub, f, rgba(col["yellow"]), stroke_width=stroke, stroke_fill=rgba(col["stroke"], 235))
                rects.setdefault(mi, []).append([int(v // k) for v in box[:2]] + [int(-(-v // k)) for v in box[2:]])
        sh = Image.new("RGBA", img.size, (20, 12, 6, 0))
        sh.putalpha(ink.getchannel("A").point(lambda v: v * 150 // 255).filter(ImageFilter.GaussianBlur(5 * k)))
        img.alpha_composite(sh, (0, int(3 * k)))
        img.alpha_composite(ink)
        return img.resize((W, hgt), Image.LANCZOS), rects

    off, rects = draw(False)
    on, _ = draw(True)
    return off, on, y_org, rects


# ------------------------------------------------------------------ 片尾回顾（可选，改变片长）
def recap(P, header, vocab):
    k, col = P["supersample"], P["colors"]
    es, zs = 42, 32
    maxw = 960
    while True:
        fe, fz, fn = T.font("black", es * k), T.font("medium", zs * k), T.font("black", 24 * k)
        row_w = max(48 + 20 + fe.getlength(v["en"]) / k + 26 + fz.getlength(v["zh"]) / k for v in vocab)
        if row_w + 2 * 48 <= maxw or es <= 34:
            break
        es, zs = es - 2, zs - 2
    ft = T.font("black", 40 * k)
    title = header["title_zh"]
    w = int(max(row_w, ft.getlength(title) / k) + 2 * 48)
    row_h = 78
    h = 34 + 54 + 26 + len(vocab) * row_h + 26
    img = _new(w, h, k)
    d = ImageDraw.Draw(img)
    o = M * k
    d.rounded_rectangle([o, o, o + w * k, o + h * k], radius=40 * k, fill=rgba(col["cream"], 250))
    d.text((o + w * k / 2, o + (34 + 27) * k + 40 * .37 * k), title, font=ft, fill=rgba(col["cocoa"]), anchor="ms")
    y = o + (34 + 54 + 26) * k
    x0 = o + (w * k - row_w * k) / 2
    for i, v in enumerate(vocab, 1):
        cy = y + row_h * k / 2
        d.ellipse([x0, cy - 22 * k, x0 + 44 * k, cy + 22 * k], fill=rgba(col["coral"]))
        d.text((x0 + 22 * k, cy + 24 * .36 * k), str(i), font=fn, fill=rgba((255, 255, 255)), anchor="ms")
        x = x0 + (48 + 20) * k
        we = _phrase(d, x, cy + es * .36 * k, T.display_en(v["en"]), fe, es, k, col)
        _text(d, x + we + 26 * k, cy + zs * .37 * k, v["zh"], fz, rgba(col["cocoa_mid"]))
        y += row_h * k
    return Sprite(_finish(img, k, (16, 90, 6)), w, h)
