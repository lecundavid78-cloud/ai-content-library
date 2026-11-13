#!/usr/bin/env python3
"""把某段原片在若干时间点的帧拼成带源坐标网格的拼图，用来量取景坐标。
用法: gridsheet.py <clip.mp4> <out.jpg> t1 t2 ...   (最多 6 帧一张, 2 列)"""
import subprocess, sys, io
from PIL import Image, ImageDraw, ImageFont
clip, out, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]]
F = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 22)
tiles = []
for t in ts:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t}', '-i', clip, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    d = ImageDraw.Draw(im, 'RGBA')
    for x in range(0, im.width, 100):
        d.line([(x, 0), (x, im.height)], fill=(255, 0, 0, 110 if x % 200 == 0 else 45), width=1)
        if x % 200 == 0: d.text((x + 3, 2), str(x), font=F, fill=(255, 0, 0, 255))
    for y in range(0, im.height, 100):
        d.line([(0, y), (im.width, y)], fill=(255, 0, 0, 110 if y % 200 == 0 else 45), width=1)
        if y % 200 == 0: d.text((3, y + 2), str(y), font=F, fill=(255, 0, 0, 255))
    d.rectangle([im.width - 190, im.height - 44, im.width, im.height], fill=(0, 0, 0, 200))
    d.text((im.width - 180, im.height - 40), f't={t:.2f}', font=F, fill=(255, 255, 0, 255))
    tiles.append(im.resize((im.width * 2 // 3, im.height * 2 // 3), Image.LANCZOS))
cols = 2
rows = (len(tiles) + 1) // 2
W, H = tiles[0].size
sheet = Image.new('RGB', (W * cols, H * rows))
for i, im in enumerate(tiles):
    sheet.paste(im, ((i % cols) * W, (i // cols) * H))
sheet.save(out, quality=88)
