#!/usr/bin/env python3
"""V2：从素材 G 剪掉口误，生成口播音轨和数字人视频，两者剪掉同一段时长，保证口型同步。
  口误：原片 3.935–4.055s 多念的「你」（频谱上是 AI 之后、「就」的声母之前的一段鼻音弱能量）。
  音频：48kHz 立体声，接点做 12ms 等功率交叉淡化，总长恰好减少 0.120s。
  视频：25fps，删掉原片第 98–100 帧（3.92–4.04s，同样 0.120s），接点前后各 1 帧做混合过渡。
输出: ../audio/v2/G_vo_cut.wav, public/gen/human.mp4, data/voice_cut.json"""
import json, os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); COMP = os.path.dirname(HERE); EP = os.path.dirname(COMP)
G = [os.path.join(EP, 'raw', f) for f in os.listdir(os.path.join(EP, 'raw')) if f.startswith('G_')][0]
CUT_A, CUT_B = 3.935, 4.055          # 音频剪切区间（原片时间）
DROP = (98, 101)                       # 视频删除帧 [98, 101)
OV = 0.012
assert abs((CUT_B - CUT_A) - (DROP[1] - DROP[0]) / 25) < 1e-9

# ── 音频
src_wav = os.path.join(EP, 'audio', 'v2', 'G_vo48k_stereo.wav')
w = wave.open(src_wav); sr = w.getframerate(); n = w.getnframes()
a = np.frombuffer(w.readframes(n), np.int16).reshape(-1, 2).astype(np.float64)
i, j, o = int(round(CUT_A * sr)), int(round(CUT_B * sr)), int(round(OV * sr))
th = np.linspace(0, np.pi / 2, o)[:, None]
x = a[i:i + o] * np.cos(th) + a[j:j + o] * np.sin(th)
y = np.concatenate([a[:i], x, a[j + o:]])
out_wav = os.path.join(EP, 'audio', 'v2', 'G_vo_cut.wav')
ww = wave.open(out_wav, 'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(sr)
ww.writeframes(np.clip(np.round(y), -32768, 32767).astype(np.int16).tobytes()); ww.close()
print('audio', n / sr, '->', len(y) / sr)

# ── 视频
Wd, Hd = 1080, 1920
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', G, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{Wd}x{Hd}', '-r', '25', '-i', '-',
                        '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-g', '10', '-pix_fmt', 'yuv420p',
                        '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                        '-movflags', '+faststart', os.path.join(COMP, 'public', 'gen', 'human.mp4')], stdin=subprocess.PIPE)
frames = []
k = 0; written = 0; keep_prev = None
buf = {}
while True:
    b = dec.stdout.read(Wd * Hd * 3)
    if len(b) < Wd * Hd * 3: break
    buf[k] = np.frombuffer(b, np.uint8).reshape(Hd, Wd, 3)
    k += 1
n_in = k
order = [f for f in range(n_in) if not (DROP[0] <= f < DROP[1])]
pre, post = DROP[0] - 1, DROP[1]      # 97 与 101 相邻
for f in order:
    fr = buf[f]
    if f == pre:   fr = (buf[pre] * 0.67 + buf[post] * 0.33).astype(np.uint8)
    if f == post:  fr = (buf[pre] * 0.33 + buf[post] * 0.67).astype(np.uint8)
    enc.stdin.write(fr.tobytes()); written += 1
enc.stdin.close(); enc.wait()
print('video frames', n_in, '->', written, f'({written / 25:.3f}s)')
json.dump({'source': os.path.basename(G), 'audio_cut': [CUT_A, CUT_B], 'video_drop_frames': list(DROP), 'removed_s': CUT_B - CUT_A,
           'audio_s': len(y) / sr, 'video_s': written / 25,
           '说明': '原片时间 t>4.055 的口播在成片里对应 t-0.12'}, open(os.path.join(COMP, 'data', 'voice_cut.json'), 'w'), ensure_ascii=False, indent=1)
