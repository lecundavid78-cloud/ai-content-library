#!/usr/bin/env python3
"""数值检查 E 段弹窗几何（不输出任何画面文字）：每帧白色弹窗包围盒 + 密钥行是否出现。"""
import subprocess, sys, numpy as np
clip, s0, s1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
W, H = 1834, 1032
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(s0), '-t', str(s1 - s0), '-i', clip, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
k = 0; prev = None
while True:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    a = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    white = (a.min(2) > 246)
    rows = np.where(white.sum(1) > 200)[0]; cols = np.where(white.sum(0) > 100)[0]
    box = (cols[0], rows[0], cols[-1], rows[-1]) if len(rows) and len(cols) else None
    frac = white.mean()
    if box != prev or k % 15 == 0:
        print(f'{s0 + k / 60:.3f} box={box} whitefrac={frac:.3f}')
    prev = box; k += 1
