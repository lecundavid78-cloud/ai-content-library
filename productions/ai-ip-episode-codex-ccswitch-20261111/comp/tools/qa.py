#!/usr/bin/env python3
"""成片质检。不读取、不识别、不输出任何密钥文字；只做几何与格式检查。
用法: qa.py <final.mp4> <report.json>
检查项：
  1. 剪辑表：没有片段 D；片段 E 的取用区间不越过安全边界。
  2. 遮罩几何：成片里每一帧用到的 E 段密钥弹窗帧，其弹窗外接框都在遮罩假设的位置（±4px）。
  3. 文本扫描：本期目录（raw/ 除外）所有文本文件里没有形如 sk-<长串> 的密钥样式字符串。
  4. 成片像素：遮罩区域在成片对应帧里确实是深色实心块（没有被缩放/叠化露出底下的浅色字栏）。
  5. 技术规格、口播起始、响度、静止段、前 3 秒运动量。
"""
import json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); COMP = os.path.dirname(HERE); EP = os.path.dirname(COMP)
sys.path.insert(0, HERE)
final, report_path = sys.argv[1], sys.argv[2]
R = {'checks': [], 'ok': True}
def check(name, ok, detail=''):
    R['checks'].append({'name': name, 'ok': bool(ok), 'detail': detail}); R['ok'] &= bool(ok)
    print(('✓' if ok else '✖'), name, '—', detail)

edit = json.load(open(os.path.join(COMP, 'data', 'edit.json')))
cam = json.load(open(os.path.join(COMP, 'public', 'gen', 'stage_cam.json')))
E_KEY_FROM, E_MAX = 7.56, 8.90
E_KEY_BOX = (522, 291, 1022, 654); E_KEY_MASK = (538, 481, 869, 539)
SW, SH = 1834, 1032

# 1 剪辑表
clips = {s['clip'] for s in edit['shots']}
check('未使用片段 D', 'D' not in clips and not any('/D_' in v for v in edit['clips'].values()), f'用到的片段: {sorted(clips)}')
e_sts = sorted({f['st'] for f in cam['frames'].values() if f['clip'] == 'E'})
check('E 段取用区间安全', all(st <= E_MAX for st in e_sts) and not any(7.56 <= st < 7.70 for st in e_sts), f'E 段源时间 {e_sts[0]:.2f}–{e_sts[-1]:.2f}s，共 {len(e_sts)} 个取样点')

# 2 遮罩几何（读原片，只取白色弹窗外接框）
key_sts = [st for st in e_sts if st >= E_KEY_FROM]
clipE = os.path.join(EP, edit['clips']['E'])
bad = 0; n = 0
if key_sts:
    s0 = min(key_sts)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{s0:.4f}', '-t', f'{max(key_sts) - s0 + 0.05:.3f}', '-i', clipE, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    want = {int(round((st - s0) * 60)) for st in key_sts}; i = 0
    while True:
        b = p.stdout.read(SW * SH * 3)
        if len(b) < SW * SH * 3: break
        if i in want:
            a = np.frombuffer(b, np.uint8).reshape(SH, SW, 3)
            white = a.min(2) > 246
            rows = np.where(white.sum(1) > 200)[0]; cols = np.where(white.sum(0) > 100)[0]
            box = (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)
            n += 1
            if max(abs(box[k] - E_KEY_BOX[k]) for k in range(4)) > 4: bad += 1
        i += 1
check('密钥弹窗位置与遮罩假设一致', n > 0 and bad == 0, f'核对 {n} 个原片帧，偏移超过 4px 的 {bad} 帧')

# 3 文本扫描
pat = re.compile(rb'sk-[0-9A-Za-z]{16,}')
hits = []
for root, dirs, files in os.walk(EP):
    dirs[:] = [d for d in dirs if d not in ('raw', 'node_modules', 'bundle', '.git')]
    for fn in files:
        if fn.lower().endswith(('.mp4', '.png', '.jpg', '.jpeg', '.wav', '.woff', '.woff2')): continue
        fp = os.path.join(root, fn)
        try:
            if pat.search(open(fp, 'rb').read()): hits.append(os.path.relpath(fp, EP))
        except OSError: pass
check('文本文件里没有密钥样式字符串', not hits, '命中文件: ' + (', '.join(hits) if hits else '无'))

# 4 成片像素：E 密钥帧对应的成片帧，遮罩区域应为深色块
ST = {'x': 24, 'y': 250, 'w': 1032, 'h': 1000}; AR = 1032 / 1000
frames = sorted(int(k) for k, v in cam['frames'].items() if v['clip'] == 'E' and v['st'] >= E_KEY_FROM)
dark_bad = 0; lum = []
if frames:
    f0, f1 = frames[0], frames[-1]
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{f0 / 30:.4f}', '-i', final, '-frames:v', str(f1 - f0 + 4), '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    for f in range(f0, f1 + 4):          # 多看 3 帧，覆盖切到下一镜头的叠化
        b = p.stdout.read(1080 * 1920)
        if len(b) < 1080 * 1920: break
        g = np.frombuffer(b, np.uint8).reshape(1920, 1080)
        c = cam['frames'].get(str(min(f, f1)))
        s = 1032 / c['w']; h = c['w'] / AR
        x0 = ST['x'] + (E_KEY_MASK[0] - (c['cx'] - c['w'] / 2)) * s; x1 = ST['x'] + (E_KEY_MASK[2] - (c['cx'] - c['w'] / 2)) * s
        y0 = ST['y'] + (E_KEY_MASK[1] - (c['cy'] - h / 2)) * s; y1 = ST['y'] + (E_KEY_MASK[3] - (c['cy'] - h / 2)) * s
        if f <= f1:
            core = g[int(y0) + 8:int(y1) - 8, int(x0) + 8:int(x1) - 8]
            frac_dark = float((core < 90).mean()); lum.append(frac_dark)
            if frac_dark < 0.80: dark_bad += 1
check('成片里遮罩为实心深色块', frames and dark_bad == 0, f'{len(frames)} 帧（{frames[0] / 30:.2f}–{frames[-1] / 30:.2f}s），深色占比最低 {min(lum):.2f}' if lum else '无 E 密钥帧')

# 5 技术规格
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', final], capture_output=True, text=True).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); au = next((s for s in pr['streams'] if s['codec_type'] == 'audio'), None)
dur = float(pr['format']['duration'])
check('画面 1080×1920 / 30fps / H.264', (v['width'], v['height'], v['r_frame_rate'], v['codec_name']) == (1080, 1920, '30/1', 'h264'), f"{v['width']}x{v['height']} {v['r_frame_rate']} {v['codec_name']} {v['pix_fmt']} 时长 {dur:.2f}s")
check('有音轨 AAC 48k', au is not None and au['codec_name'] == 'aac' and au['sample_rate'] == '48000', f"{au['codec_name']} {au['sample_rate']}Hz {au['channels']}ch" if au else '无音轨')
ln = subprocess.run(['ffmpeg', '-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', ln)[-1]; TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', ln)[-1]
check('响度约 -14 LUFS，真峰值 ≤ -1 dBTP', abs(float(I) + 14) <= 1.0 and float(TP) <= -1.0, f'I={I} LUFS, TP={TP} dBFS')
sd = subprocess.run(['ffmpeg', '-hide_banner', '-i', final, '-af', 'silencedetect=noise=-35dB:d=0.05', '-f', 'null', '-'], capture_output=True, text=True).stderr
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]; starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]
voice0 = ends[0] if starts and starts[0] < 0.02 else 0.0
check('口播在 0.1s 内开口', voice0 <= 0.1, f'首个有声时刻约 {voice0:.3f}s（-35dB 门限）')

# 运动量：逐帧灰度差（缩到 108×192）
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', final, '-vf', 'scale=108:192', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
prev = None; diffs = []
while True:
    b = p.stdout.read(108 * 192)
    if len(b) < 108 * 192: break
    g = np.frombuffer(b, np.uint8).astype(np.int16)
    if prev is not None: diffs.append(float(np.abs(g - prev).mean()))
    prev = g
diffs = np.array(diffs)
still = diffs < 0.05; run = best = 0
for s in still:
    run = run + 1 if s else 0; best = max(best, run)
R['motion'] = {'first3s_mean': round(float(diffs[:90].mean()), 3), 'whole_mean': round(float(diffs.mean()), 3), 'longest_static_s': round(best / 30, 2)}
check('没有超过 1 秒的完全静止段', best / 30 <= 1.0, f"最长静止 {best / 30:.2f}s；前 3 秒平均帧差 {diffs[:90].mean():.2f}，全片 {diffs.mean():.2f}")
R['frames'] = len(diffs) + 1; R['duration'] = dur
json.dump(R, open(report_path, 'w'), ensure_ascii=False, indent=1)
print('总体:', '通过' if R['ok'] else '有未通过项')
