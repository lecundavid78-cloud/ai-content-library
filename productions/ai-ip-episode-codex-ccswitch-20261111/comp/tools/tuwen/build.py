#!/usr/bin/env python3
"""图文教程 tuwen-v001：从已打码/已模糊的录屏轨 stage.mp4、V2 成片、raw/A（只取不含密钥的设置页）截帧，排成一步一图。
禁止读取 raw/E。H/B 只经由 stage.mp4 使用（H 只到 3.05s，地址栏已裁掉）。
用法: build.py [--only NN]"""
import io, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); COMP = os.path.dirname(os.path.dirname(HERE)); EP = os.path.dirname(COMP)
OUT = os.path.join(EP, 'out', 'tuwen-v001')
STAGE = os.path.join(COMP, 'public', 'gen', 'stage.mp4')
FILM = os.path.join(EP, 'out', 'v002', '阿泽_Codex三步换DeepSeek_v002.mp4')
RAWA = [os.path.join(EP, 'raw', f) for f in os.listdir(os.path.join(EP, 'raw')) if f.startswith('A_')][0]
F0 = json.load(open(os.path.join(COMP, 'public', 'gen', 'stage_cam.json')))['f0']
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FONTR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(s, bold=True): return ImageFont.truetype(FONT if bold else FONTR, s, index=2)
PAPER = (242, 237, 228); INK = (23, 20, 15); RED = (232, 67, 42); MUTE = (120, 112, 100); WHITE = (255, 255, 255); GREEN = (22, 163, 74)
W = 1080; M = 54

def grab(src, t):
    if src == 'stage':
        n = round(t * 30) - F0
        cmd = ['ffmpeg', '-v', 'error', '-i', STAGE, '-vf', f'select=eq(n\\,{n})', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-']
    else:
        path = {'film': FILM, 'rawA': RAWA}[src]
        cmd = ['ffmpeg', '-v', 'error', '-ss', f'{t}', '-i', path, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-']
    im = Image.open(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout)).convert('RGB')
    if src == 'rawA' and t >= 22.0:   # 只有路由页（22s 后）有本地地址
        # 路由页的本地服务地址 127.0.0.1 一律模糊（原片坐标，与成片的模糊框一致）
        for r in [(110, 580, 312, 636)]:
            reg = im.crop(r).filter(ImageFilter.GaussianBlur(9)); im.paste(reg, r[:2])
    return im

def rr(d, box, r, **kw): d.rounded_rectangle(box, r, **kw)

def pill(d, xy, text, size=34, bg=INK, fg=WHITE, anchor='lt', outline=None):
    f = font(size); tw = d.textlength(text, font=f); ph = int(size * 1.7); pw = int(tw + size * 1.2)
    x, y = xy
    if anchor[0] == 'm': x -= pw / 2
    if anchor[0] == 'r': x -= pw
    if anchor[1] == 'm': y -= ph / 2
    if anchor[1] == 'b': y -= ph
    rr(d, (x, y, x + pw, y + ph), ph // 2, fill=bg, outline=outline, width=3 if outline else 0)
    d.text((x + pw / 2, y + ph / 2), text, font=f, fill=fg, anchor='mm')
    return (x, y, x + pw, y + ph)

def badge(d, cx, cy, n, r=30, bg=RED):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=bg, outline=WHITE, width=4)
    d.text((cx, cy + 1), str(n), font=font(int(r * 1.15)), fill=WHITE, anchor='mm')

def panel(spec, width=W - 2 * M):
    """截帧→裁切→缩放→画标注。标注坐标用截帧原图坐标。"""
    im = grab(spec['src'], spec['t'])
    x0, y0, x1, y1 = spec['crop']
    segs = spec.get('splice') or [[x0, x1]]           # 横向拼接：只保留几段 x 范围，去掉中间空白
    GAP = 14
    parts = [im.crop((a, y0, b, y1)) for a, b in segs]
    sw = sum(p.width for p in parts) + GAP * (len(parts) - 1)
    cat = Image.new('RGB', (sw, y1 - y0), PAPER); xo = 0; offs = []
    for (a, b), p in zip(segs, parts):
        cat.paste(p, (xo, 0)); offs.append((a, b, xo)); xo += p.width + GAP
    cd = ImageDraw.Draw(cat)
    for a, b, o in offs[1:]:
        for yy in range(0, cat.height, 18): cd.line([(o - GAP // 2, yy), (o - GAP // 2, yy + 9)], fill=(160, 150, 136), width=3)
    def mx(x):
        for a, b, o in offs:
            if a <= x <= b: return x - a + o
        return x - offs[0][0]
    s = width / sw
    im = cat.resize((width, round((y1 - y0) * s)), Image.LANCZOS)
    if s > 1.15: im = im.filter(ImageFilter.UnsharpMask(1.4, 50, 2))
    d = ImageDraw.Draw(im)
    for a in spec.get('marks', []):
        bx = [mx(a['box'][0]) * s, (a['box'][1] - y0) * s, mx(a['box'][2]) * s, (a['box'][3] - y0) * s]
        if a.get('round'):
            d.ellipse(bx, outline=WHITE, width=12); d.ellipse(bx, outline=RED, width=7)
        else:
            rr(d, [bx[0] - 3, bx[1] - 3, bx[2] + 3, bx[3] + 3], 16, outline=WHITE, width=11); rr(d, bx, 14, outline=RED, width=7)
        if a.get('text'):
            side = a.get('side', 'below'); g = 18
            if side == 'below': pill(d, ((bx[0] + bx[2]) / 2 + a.get('dx', 0), bx[3] + g), a['text'], 32, anchor='mt')
            if side == 'above': pill(d, ((bx[0] + bx[2]) / 2 + a.get('dx', 0), bx[1] - g), a['text'], 32, anchor='mb')
            if side == 'left': pill(d, (bx[0] - g, (bx[1] + bx[3]) / 2), a['text'], 32, anchor='rm')
            if side == 'right': pill(d, (bx[2] + g, (bx[1] + bx[3]) / 2), a['text'], 32, anchor='lm')
        if a.get('n'):
            badge(d, bx[0] - 6, bx[1] - 6, a['n'], 24)
    for tag in spec.get('tags', []):        # 角标（例如「官方下载页」「画面已打码」）
        if isinstance(tag, str): tag = {'text': tag}
        pos = tag.get('pos', 'tl'); sz = tag.get('size', 30)
        xy = {'tl': (18, 18), 'tr': (im.width - 18, 18), 'tc': (im.width / 2, 18)}[pos]
        pill(d, xy, tag['text'], sz, bg=INK if tag.get('dark', True) else PAPER, fg=WHITE if tag.get('dark', True) else INK,
             anchor={'tl': 'lt', 'tr': 'rt', 'tc': 'mt'}[pos], outline=None if tag.get('dark', True) else INK)
    return im

def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for ch in text:
        if d.textlength(cur + ch, font=f) > maxw and cur:
            lines.append(cur); cur = ch
        else: cur += ch
    if cur: lines.append(cur)
    return lines

def page(no, total, step, title, items, tip=None, sub=None):
    blocks = []
    for it in items:
        im = panel(it)
        blocks.append((it, im))
    # 估算高度
    tmp = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    h = 250 + (70 if sub else 0)
    for it, im in blocks: h += 92 + len(wrap(tmp, it.get('note', ''), font(30, False), W - 2 * M)) * 44 + im.height + 34 + 48
    if tip: h += 60 + len(wrap(tmp, tip, font(32), W - 2 * M - 150)) * 48 + 40
    h += 110
    H = max(1440, min(1920, h)); assert h <= 1920, f'{no}: 内容过长 {h}'
    pg = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(pg)
    for yy in range(18, H, 36):
        for xx in range(18, W, 36): d.ellipse((xx - 2, yy - 2, xx + 2, yy + 2), fill=(222, 215, 203))
    pill(d, (M, 44), '阿泽 · AI 实操', 26, bg=PAPER, fg=INK, outline=INK)
    d.text((W - M, 64), f'{no:02d} / {total - 1:02d}', font=font(28), fill=MUTE, anchor='rm')
    y = 128
    if step:
        b = pill(d, (M, y), step, 40, bg=RED); d.text((b[2] + 22, (b[1] + b[3]) / 2), title, font=font(54), fill=INK, anchor='lm')
    else:
        d.text((M, y + 34), title, font=font(54), fill=INK, anchor='lm')
    y += 104
    if sub:
        for ln in wrap(d, sub, font(32, False), W - 2 * M): d.text((M, y), ln, font=font(32, False), fill=MUTE); y += 46
        y += 20
    for it, im in blocks:
        badge(d, M + 30, y + 32, it['n'], 30)
        d.text((M + 76, y + 32), it['cap'], font=font(42), fill=INK, anchor='lm')
        y += 78
        for ln in wrap(d, it.get('note', ''), font(30, False), W - 2 * M - 10):
            d.text((M + 4, y), ln, font=font(30, False), fill=(80, 74, 66)); y += 44
        y += 14
        rr(d, (M + 10, y + 10, M + 10 + im.width + 8, y + 10 + im.height + 8), 26, fill=INK)
        card = Image.new('RGB', (im.width + 8, im.height + 8), INK); card.paste(im, (4, 4))
        mask = Image.new('L', card.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, card.width - 1, card.height - 1), 24, fill=255)
        pg.paste(card, (M - 4, y - 4), mask)
        y += im.height + 34 + 34
    if tip:
        lines = wrap(d, tip, font(32), W - 2 * M - 150)
        th = len(lines) * 48 + 44
        rr(d, (M, y, W - M, y + th), 22, fill=INK)
        d.text((M + 28, y + 22), '提示', font=font(32), fill=RED)
        yy = y + 22
        for ln in lines: d.text((M + 120, yy), ln, font=font(32), fill=WHITE); yy += 48
    d.rectangle((0, H - 84, W, H), fill=INK); d.rectangle((0, H - 90, W, H - 84), fill=RED)
    d.text((M, H - 42), '三步给 Codex 换上 DeepSeek', font=font(30), fill=WHITE, anchor='lm')
    d.text((W - M, H - 42), '阿泽 · AI 实操', font=font(30), fill=(185, 176, 162), anchor='rm')
    return pg

PAGES = json.load(open(os.path.join(HERE, 'pages.json')))

def main():
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    total = len(PAGES) + 2   # + 封面 + 回顾
    for p in PAGES:
        if only and p['no'] != int(only): continue
        pg = page(p['no'], total, p.get('step'), p['title'], p['items'], p.get('tip'), p.get('sub'))
        fn = os.path.join(OUT, f"{p['no']:02d}_{p['file']}.png"); pg.save(fn, optimize=True); print(fn, pg.size)

if __name__ == '__main__':
    main()


def thumb(src, t, crop, w, h):
    im = grab(src, t).crop(crop)
    im = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
    return im.crop((0, 0, w, min(h, im.height)))

def check_icon(d, cx, cy, r):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=GREEN, outline=WHITE, width=4)
    d.line([(cx - r * .45, cy + r * .02), (cx - r * .1, cy + r * .38), (cx + r * .48, cy - r * .35)], fill=WHITE, width=max(5, r // 4), joint='curve')

def card(pg, im, x, y, radius=22):
    d = ImageDraw.Draw(pg)
    rr(d, (x + 10, y + 10, x + im.width + 18, y + im.height + 18), radius + 2, fill=INK)
    c = Image.new('RGB', (im.width + 8, im.height + 8), INK); c.paste(im, (4, 4))
    m = Image.new('L', c.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, c.width - 1, c.height - 1), radius, fill=255)
    pg.paste(c, (x - 4, y - 4), m)

def base(H, no, total):
    pg = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(pg)
    for yy in range(18, H, 36):
        for xx in range(18, W, 36): d.ellipse((xx - 2, yy - 2, xx + 2, yy + 2), fill=(222, 215, 203))
    pill(d, (M, 44), '阿泽 · AI 实操', 26, bg=PAPER, fg=INK, outline=INK)
    d.text((W - M, 64), f'{no:02d} / {total - 1:02d}', font=font(28), fill=MUTE, anchor='rm')
    d.rectangle((0, H - 84, W, H), fill=INK); d.rectangle((0, H - 90, W, H - 84), fill=RED)
    d.text((M, H - 42), '群内配套 · 一步一图', font=font(30), fill=WHITE, anchor='lm')
    d.text((W - M, H - 42), '阿泽 · AI 实操', font=font(30), fill=(185, 176, 162), anchor='rm')
    return pg, d

STEPS3 = [('下载', 'stage', 20.75, (0, 160, 1032, 700)), ('加 DeepSeek', 'stage', 31.4, (0, 240, 1032, 780)), ('开路由', 'stage', 45.6, (0, 90, 1032, 630))]

def cover(total):
    H = 1440; pg, d = base(H, 0, total)
    y = 150
    b = pill(d, (M, y), '三步', 118, bg=RED); d.text((b[2] + 26, (b[1] + b[3]) / 2), '给 Codex', font=font(118), fill=INK, anchor='lm')
    d.text((M, b[3] + 20), '换上 DeepSeek', font=font(118), fill=INK)
    y = b[3] + 200
    d.text((M, y), '几块钱就能用的 AI 大脑，一步一图，跟着点就能做完。', font=font(36, False), fill=(80, 74, 66))
    y += 90
    tw = 300
    for i, (lab, src, t, cr) in enumerate(STEPS3):
        im = thumb(src, t, cr, tw, 300)
        x = M + i * (tw + 36)
        card(pg, im, x, y)
        d.rectangle((x, y + im.height - 64, x + tw, y + im.height), fill=INK)
        d.text((x + tw / 2, y + im.height - 32), f"{'①②③'[i]} {lab}", font=font(36), fill=WHITE, anchor='mm')
    y += 300 + 70
    rr(d, (M, y, W - M, y + 230), 26, fill=INK)
    d.text((M + 36, y + 40), '你需要准备', font=font(36), fill=RED)
    for k, ln in enumerate(['一台 Windows 或 Mac 电脑', '一个 DeepSeek 开放平台账号（充几块钱）', '跟着图点，大约十几步']):
        d.text((M + 36, y + 96 + k * 44), '· ' + ln, font=font(32), fill=WHITE)
    return pg

def recap(total):
    H = 1440; pg, d = base(H, total - 1, total)
    d.text((M, 160), '三步回顾', font=font(80), fill=INK, anchor='lm')
    rows = [('第 1 步', '官方下载页装好 Codex 和 CC Switch'),
            ('第 2 步', 'CC Switch：第三个图标 → 加号 → 选 DeepSeek → 获取 API Key → 充值、新建密钥、复制 → 粘贴 → 添加。'),
            ('第 3 步', 'CC Switch 左上角设置 → 路由 → 打开路由总开关、勾选 Codex → 重开 Codex，右下角显示 DeepSeek。')]
    y = 250
    for i, (s, t) in enumerate(rows):
        lines = wrap(d, t, font(34), W - 2 * M - 300)
        hh = max(130, 52 + len(lines) * 50)
        rr(d, (M, y, W - M, y + hh), 26, fill=WHITE, outline=INK, width=4)
        check_icon(d, M + 60, y + hh / 2, 34)
        pill(d, (M + 112, y + 26), s, 30, bg=RED)
        yy = y + 26
        for ln in lines: d.text((M + 270, yy + 4), ln, font=font(34), fill=INK); yy += 50
        y += hh + 26
    y += 20
    tips = ['密钥只显示一次，自己保存，别发给任何人。', '连不上先查：路由总开关和 Codex 开关是不是都绿了。', '下载只认官方下载页。']
    rr(d, (M, y, W - M, y + 60 + len(tips) * 50), 22, fill=INK)
    d.text((M + 30, y + 22), '注意', font=font(34), fill=RED)
    for k, t in enumerate(tips): d.text((M + 140, y + 22 + k * 50), t, font=font(32), fill=WHITE)
    y += 60 + len(tips) * 50 + 40
    b = pill(d, (M, y), '先点关注', 56, bg=RED)
    d.text((b[2] + 24, (b[1] + b[3]) / 2), '下期阿泽教你实战用法！', font=font(46), fill=INK, anchor='lm')
    return pg

if '--extras' in sys.argv:
    total = len(PAGES) + 2
    c = cover(total); c.save(os.path.join(OUT, '00_封面.png'), optimize=True)
    r = recap(total); r.save(os.path.join(OUT, f'{total - 1:02d}_三步回顾.png'), optimize=True)
    print('extras ok', total)
