#!/usr/bin/env python3
"""在原片指定时间点找蓝色链接文字的外接框（CC Switch 列表里的 https:// 链接是蓝色小字）。
只输出几何位置。用法: find_links.py <clip> t1 t2 ...  [--roi x0,y0,x1,y1]"""
import subprocess, sys, numpy as np
clip = sys.argv[1]; args = sys.argv[2:]
roi = None
if '--roi' in args:
    k = args.index('--roi'); roi = [int(v) for v in args[k + 1].split(',')]; args = args[:k] + args[k + 2:]
W, H = 1834, 1032
def runs(mask1d, gap):
    idx = np.where(mask1d)[0]
    if not len(idx): return []
    out = []; s = idx[0]; p = idx[0]
    for i in idx[1:]:
        if i - p > gap: out.append((s, p)); s = i
        p = i
    out.append((s, p)); return out
for t in map(float, args):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', clip, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    a = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(int)
    r, g, bl = a[..., 0], a[..., 1], a[..., 2]
    m = (bl > 170) & (bl - r > 70) & (g > 90) & (g < 200)
    if roi:
        mm = np.zeros_like(m); x0, y0, x1, y1 = roi; mm[y0:y1, x0:x1] = m[y0:y1, x0:x1]; m = mm
    boxes = []
    for (y0, y1) in runs(m.sum(1) > 0, 3):
        band = m[y0:y1 + 1]
        for (x0, x1) in runs(band.sum(0) > 0, 14):
            sub = band[:, x0:x1 + 1]
            h = y1 - y0 + 1; w = x1 - x0 + 1; fill = sub.mean()
            if 4 <= h <= 40 and w >= 30 and fill < 0.45:
                boxes.append((x0, y0, x1 + 1, y1 + 1, round(float(fill), 2)))
    print(f't={t:.2f}', boxes)
