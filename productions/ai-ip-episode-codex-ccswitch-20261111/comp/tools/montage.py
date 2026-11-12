#!/usr/bin/env python3
"""把若干静帧横向拼成一张校样图。用法: montage.py out.jpg scale a.png b.png ..."""
import sys
from PIL import Image
out, scale, files = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert('RGB') for f in files]
ims = [im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS) for im in ims]
gap = 8
W = sum(i.width for i in ims) + gap * (len(ims) - 1)
sheet = Image.new('RGB', (W, ims[0].height), (60, 60, 60))
x = 0
for im in ims:
    sheet.paste(im, (x, 0)); x += im.width + gap
sheet.save(out, quality=90)
