#!/usr/bin/env python3
"""放大查看原片某区域并画 20px 源坐标网格。用法: zoomgrid.py <clip> <out.jpg> <scale> t:x0,y0,x1,y1 [t:...]"""
import subprocess, sys, io
from PIL import Image, ImageDraw, ImageFont
clip, out, sc = sys.argv[1], sys.argv[2], float(sys.argv[3])
F = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 13)
tiles = []
for spec in sys.argv[4:]:
    t, r = spec.split(':'); t = float(t); x0, y0, x1, y1 = map(int, r.split(','))
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', clip, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    im = Image.open(io.BytesIO(raw)).convert('RGB').crop((x0, y0, x1, y1))
    im = im.resize((round((x1 - x0) * sc), round((y1 - y0) * sc)), Image.LANCZOS)
    d = ImageDraw.Draw(im, 'RGBA')
    for x in range((x0 // 20 + 1) * 20, x1, 20):
        X = (x - x0) * sc; strong = x % 100 == 0
        d.line([(X, 0), (X, im.height)], fill=(255, 0, 0, 120 if strong else 40))
        if strong: d.text((X + 2, 2), str(x), font=F, fill=(220, 0, 0, 255))
    for y in range((y0 // 20 + 1) * 20, y1, 20):
        Y = (y - y0) * sc; strong = y % 100 == 0
        d.line([(0, Y), (im.width, Y)], fill=(255, 0, 0, 120 if strong else 40))
        if strong: d.text((2, Y + 2), str(y), font=F, fill=(220, 0, 0, 255))
    d.rectangle((im.width - 70, 0, im.width, 18), fill=(0, 0, 0, 200)); d.text((im.width - 66, 1), f't={t:.2f}', font=F, fill=(255, 255, 0, 255))
    tiles.append(im)
W = max(i.width for i in tiles); Ht = sum(i.height for i in tiles) + 6 * len(tiles)
sheet = Image.new('RGB', (W, Ht), (50, 50, 50)); y = 0
for im in tiles: sheet.paste(im, (0, y)); y += im.height + 6
sheet.save(out, quality=88)
