#!/usr/bin/env python3
"""E 段密钥弹窗内, 各行带的深色(文字)像素横向范围。只输出几何范围, 不输出内容。"""
import subprocess, sys, numpy as np
clip = sys.argv[1]
W, H = 1834, 1032
ext = {}
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', '7.70', '-t', '1.2', '-i', clip, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
n = 0
while True:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    a = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    sub = a[291:654, 522:1022].max(2)
    for y0 in range(0, 363, 12):
        band = sub[y0:y0 + 12]
        cols = np.where((band < 140).sum(0) > 0)[0]
        if len(cols):
            lo, hi = ext.get(y0, (9999, -1)); ext[y0] = (min(lo, cols[0] + 522), max(hi, cols[-1] + 522))
    n += 1
print('frames', n)
for y0 in sorted(ext): print(f'y {y0 + 291}-{y0 + 303}: dark x {ext[y0][0]}..{ext[y0][1]}')
