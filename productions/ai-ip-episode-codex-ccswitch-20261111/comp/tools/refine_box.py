#!/usr/bin/env python3
"""在原片某时刻的大致区域内，找文字像素（深色或蓝色，非白底）的紧外框。只输出几何。
用法: refine_box.py <clip> t:x0,y0,x1,y1 ..."""
import subprocess, sys, numpy as np
clip = sys.argv[1]; W, H = 1834, 1032
cache = {}
for spec in sys.argv[2:]:
    t, r = spec.split(':'); t = float(t); x0, y0, x1, y1 = map(int, r.split(','))
    if t not in cache:
        b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', clip, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
        cache[t] = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(int)
    a = cache[t][y0:y1, x0:x1]
    bg = np.median(a.reshape(-1, 3), 0)
    diff = np.abs(a - bg).max(2)
    m = diff > 60
    ys, xs = np.where(m)
    if len(xs) == 0: print(spec, 'none'); continue
    # 去掉孤立点：要求行/列至少 2 个像素
    print(f'{spec} -> text bbox ({x0 + xs.min()},{y0 + ys.min()},{x0 + xs.max() + 1},{y0 + ys.max() + 1}) n={len(xs)} bg={bg.astype(int).tolist()}')
