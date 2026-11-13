#!/usr/bin/env python3
"""成片质检（V2）。不读取、不识别、不输出任何密钥文字；只做几何、像素统计与格式检查。
用法: qa.py <final.mp4> <report.json>
检查项：
  1. 剪辑表：没有片段 C、D；E 取用区间安全；H 只用 0–3.08 秒（远早于 4.0 秒出现的下载列表）。
  2. 遮罩几何：成片用到的 E 段密钥弹窗帧，弹窗外接框都在遮罩假设的位置（±4px）。
  3. 成片像素：密钥遮罩区在成片里是深色实心块（叠化帧另行说明，见 detail）。
  4. 网址模糊：录屏轨里登记的每个网址框，映射到成片坐标后测清晰度（拉普拉斯能量），必须明显低于正常文字。
  5. 文本扫描：本期目录（raw/ 除外）文本文件里没有密钥样式字符串。
  6. 口误：成片 2.2–5.3 秒重新识别的文字含「AI就帮你」且不含「你就」。
  7. 技术规格、响度、口播起始、静止段。
"""
import json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); COMP = os.path.dirname(HERE); EP = os.path.dirname(COMP)
sys.argv_backup = list(sys.argv); sys.argv = [sys.argv[0]]
sys.path.insert(0, HERE)
import build_media as BM          # 复用安全规则常量与网址框（只导入，不渲染）
sys.argv = sys.argv_backup
final, report_path = sys.argv[1], sys.argv[2]
R = {'checks': [], 'ok': True}
def check(name, ok, detail=''):
    R['checks'].append({'name': name, 'ok': bool(ok), 'detail': detail}); R['ok'] &= bool(ok)
    print(('✓' if ok else '✖'), name, '—', detail)

edit = json.load(open(os.path.join(COMP, 'data', 'edit.json')))
cam = json.load(open(os.path.join(COMP, 'public', 'gen', 'stage_cam.json')))
frames = {int(k): v for k, v in cam['frames'].items()}
SW, SH = 1834, 1032
ST = {'x': 24, 'y': 250}; AR = 1032 / 1000

# 1 剪辑表
clips = {s['clip'] for s in edit['shots']}
check('未使用片段 C、D', not ({'C', 'D'} & clips), f'用到的片段: {sorted(clips)}')
e_sts = sorted({f['st'] for f in frames.values() if f['clip'] == 'E'})
check('E 段取用区间安全', all(st <= BM.E_MAX for st in e_sts) and not any(7.56 <= st < 7.70 for st in e_sts),
      f'E 段源时间 {e_sts[0]:.2f}–{e_sts[-1]:.2f}s')
h_sts = sorted({f['st'] for f in frames.values() if f['clip'] == 'H'})
check('H 段只用 3.5 秒之前（实际 ≤3.08s）', max(h_sts) <= 3.08, f'H 段源时间 {h_sts[0]:.2f}–{h_sts[-1]:.2f}s；下载列表约 4.0s 起出现')

# 2 遮罩几何
key_sts = [st for st in e_sts if st >= BM.E_KEY_FROM]
clipE = os.path.join(EP, edit['clips']['E'])
bad = n = 0
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
            box = (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1); n += 1
            if max(abs(box[k] - BM.E_KEY_BOX[k]) for k in range(4)) > 4: bad += 1
        i += 1
check('密钥弹窗位置与遮罩假设一致', n > 0 and bad == 0, f'核对 {n} 个原片帧，偏移超过 4px 的 {bad} 帧')

def to_final(c, r):
    s = 1032 / c['w']; h = c['w'] / AR
    return (ST['x'] + (r[0] - (c['cx'] - c['w'] / 2)) * s, ST['y'] + (r[1] - (c['cy'] - h / 2)) * s,
            ST['x'] + (r[2] - (c['cx'] - c['w'] / 2)) * s, ST['y'] + (r[3] - (c['cy'] - h / 2)) * s)

def read_gray(f0, count):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{f0 / 30:.4f}', '-i', final, '-frames:v', str(count), '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    out = []
    for _ in range(count):
        b = p.stdout.read(1080 * 1920)
        if len(b) < 1080 * 1920: break
        out.append(np.frombuffer(b, np.uint8).reshape(1920, 1080).astype(np.int16))
    p.kill(); return out

# 3 遮罩像素（叠化帧：E2→E3 的 3 帧叠化，E2 的帧在 7.55s 之前、弹窗出现(7.68s)之前，画面里没有密钥）
shot_by_id = {s['id']: s for s in edit['shots']}
kf = sorted(f for f, v in frames.items() if v['clip'] == 'E' and v['st'] >= BM.E_KEY_FROM)
xf_skip = set()
for sid, sh in shot_by_id.items():
    if sh['clip'] == 'E' and sh['src'][0] >= BM.E_KEY_FROM and sh.get('xfade'):
        f_start = min(f for f, v in frames.items() if v['id'] == sid)
        xf_skip |= set(range(f_start, f_start + sh['xfade']))
lum = []; dark_bad = 0
if kf:
    g = read_gray(kf[0], kf[-1] - kf[0] + 1)
    for k, f in enumerate(kf):
        if f in xf_skip or k >= len(g): continue
        x0, y0, x1, y1 = to_final(frames[f], BM.E_KEY_MASK)
        core = g[k][int(y0) + 8:int(y1) - 8, int(x0) + 8:int(x1) - 8]
        d = float((core < 90).mean()); lum.append(d)
        if d < 0.80: dark_bad += 1
prev_ok = all(st < 7.68 for st in sorted({frames[f]['st'] for f in frames if frames[f]['id'] == 'E2'}))
check('成片里密钥遮罩为实心深色块', kf and dark_bad == 0 and prev_ok,
      f'{len(lum)} 个非叠化帧（{kf[0] / 30:.2f}–{kf[-1] / 30:.2f}s）深色占比最低 {min(lum):.2f}；另有 {len(xf_skip)} 个叠化帧与 E2 混合，E2 源时间全部早于密钥弹窗出现的 7.68s')

# 4 网址模糊：在录屏轨 stage.mp4（叠标注之前、即成片里录屏卡片的底图）上测网址框清晰度。
#   在成片上测会被红色标注框的边缘干扰，所以改测底图；底图与成片录屏卡片逐帧对应。
def lap(a):
    return np.abs(4 * a[1:-1, 1:-1] - a[:-2, 1:-1] - a[2:, 1:-1] - a[1:-1, :-2] - a[1:-1, 2:]).mean()
blur_frames = sorted(f for f, v in frames.items() if v.get('blur'))
# 叠化帧：底图是两个镜头的混合，前一个镜头（未必是 CC Switch）的清晰文字会混进网址框，单独列出、不计入门槛
xfade_frames = set()
for sh in edit['shots']:
    if sh.get('xfade'):
        fs = [f for f, v in frames.items() if v['id'] == sh['id']]
        if fs: xfade_frames |= set(range(min(fs), min(fs) + sh['xfade']))
xf_vals = []
vals = []; worst = (0, None); top = []
stage_frames = sorted(frames)
def read_stage():
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', os.path.join(COMP, 'public', 'gen', 'stage.mp4'), '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    out = []
    while True:
        b = p.stdout.read(1032 * 1000)
        if len(b) < 1032 * 1000: break
        out.append(np.frombuffer(b, np.uint8).reshape(1000, 1032).astype(np.int16))
    return out
def to_stage(c, r):
    x0, y0, x1, y1 = to_final(c, r)
    return x0 - ST['x'], y0 - ST['y'], x1 - ST['x'], y1 - ST['y']
if blur_frames:
    g = read_stage()
    for f in blur_frames[::2]:
        v = frames[f]; k = f - stage_frames[0]
        if k >= len(g): continue
        for r in BM.url_rects(v['clip'], v['st']):
            pad = 10
            x0, y0, x1, y1 = to_stage(v, (r[0] + pad, r[1] + pad, r[2] - pad, r[3] - pad))
            x0, y0 = max(int(x0), 0), max(int(y0), 0); x1, y1 = min(int(x1), 1032), min(int(y1), 1000)
            if x1 - x0 < 12 or y1 - y0 < 8: continue
            e = float(lap(g[k][y0:y1, x0:x1]))
            if f in xfade_frames: xf_vals.append((round(e, 2), round(f / 30, 2))); continue
            vals.append(e); top.append((round(e, 2), round(f / 30, 2), v['id']))
            if e > worst[0]: worst = (e, f)
# 参照：同一时段正常显示的界面文字（字幕区是排版大字，不可比；用录屏卡片里未模糊区域的 95 分位作参照）
ref = []
for f in blur_frames[::10]:
    k = f - stage_frames[0]
    if k < len(g):
        blk = g[k][40:960, 40:990]
        for yy in range(0, blk.shape[0] - 40, 40):
            for xx in range(0, blk.shape[1] - 160, 160):
                ref.append(float(lap(blk[yy:yy + 40, xx:xx + 160])))
ref95 = float(np.percentile(ref, 95)) if ref else 0
top.sort(reverse=True)
R['url_blur_top5'] = top[:5]; R['url_blur_xfade_frames'] = sorted(xf_vals, reverse=True)[:5]
R['url_blur'] = {'boxes_checked': len(vals), 'max_energy': round(max(vals), 2) if vals else None, 'worst_frame_s': round(worst[1] / 30, 2) if worst[1] else None, 'ref_text_p95': round(ref95, 2)}
check('网址框处于模糊状态（录屏轨底图）', vals and max(vals) < max(2.5, ref95 * 0.35),
      f'检查 {len(vals)} 个网址框（另有 {len(xf_vals)} 个在叠化帧里单列），最高清晰度 {max(vals):.2f}（{worst[1] / 30:.2f}s）；同段界面文字 95 分位 {ref95:.2f}')

# 5 文本扫描
pat = re.compile(rb'sk-[0-9A-Za-z]{16,}')
hits = []
for root, dirs, files in os.walk(EP):
    dirs[:] = [d for d in dirs if d not in ('raw', 'node_modules', 'bundle', '.git')]
    for fn in files:
        if fn.lower().endswith(('.mp4', '.png', '.jpg', '.jpeg', '.wav', '.woff', '.woff2', '.pt')): continue
        try:
            if pat.search(open(os.path.join(root, fn), 'rb').read()): hits.append(os.path.relpath(os.path.join(root, fn), EP))
        except OSError: pass
check('文本文件里没有密钥样式字符串', not hits, '命中文件: ' + (', '.join(hits) if hits else '无'))

# 6 口误
asr = os.path.join(EP, 'build', 'qa_asr', 'slip.txt')
txt = open(asr).read().replace(' ', '').replace('\n', '') if os.path.exists(asr) else ''
check('口误「你」已剪掉（成片 2.2–5.3s 重新识别）', ('AI就帮你' in txt) and ('你就' not in txt), f'识别结果：{txt or "（无）"}')

# 7 技术规格
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', final], capture_output=True, text=True).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); au = next((s for s in pr['streams'] if s['codec_type'] == 'audio'), None)
dur = float(pr['format']['duration'])
check('画面 1080×1920 / 30fps / H.264', (v['width'], v['height'], v['r_frame_rate'], v['codec_name']) == (1080, 1920, '30/1', 'h264'), f"{v['width']}x{v['height']} {v['r_frame_rate']} {v['codec_name']} 时长 {dur:.3f}s")
check('有音轨 AAC 48k', au is not None and au['codec_name'] == 'aac' and au['sample_rate'] == '48000', f"{au['codec_name']} {au['sample_rate']}Hz {au['channels']}ch 音轨 {float(au['duration']):.3f}s" if au else '无音轨')
ln = subprocess.run(['ffmpeg', '-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', ln)[-1]; TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', ln)[-1]
check('响度约 -14 LUFS，真峰值 ≤ -1 dBTP', abs(float(I) + 14) <= 1.0 and float(TP) <= -1.0, f'I={I} LUFS, TP={TP} dBFS')
sd = subprocess.run(['ffmpeg', '-hide_banner', '-i', final, '-af', 'silencedetect=noise=-35dB:d=0.05', '-f', 'null', '-'], capture_output=True, text=True).stderr
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]; starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]
voice0 = ends[0] if starts and starts[0] < 0.02 else 0.0
check('口播在 0.1s 内开口', voice0 <= 0.1, f'首个有声时刻约 {voice0:.3f}s')
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', final, '-vf', 'scale=108:192', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
prev = None; diffs = []
while True:
    b = p.stdout.read(108 * 192)
    if len(b) < 108 * 192: break
    gg = np.frombuffer(b, np.uint8).astype(np.int16)
    if prev is not None: diffs.append(float(np.abs(gg - prev).mean()))
    prev = gg
diffs = np.array(diffs); run = best = 0
for s in diffs < 0.05:
    run = run + 1 if s else 0; best = max(best, run)
R['motion'] = {'first3s_mean': round(float(diffs[:90].mean()), 3), 'whole_mean': round(float(diffs.mean()), 3), 'longest_static_s': round(best / 30, 2)}
check('没有超过 1 秒的完全静止段', best / 30 <= 1.0, f"最长静止 {best / 30:.2f}s；前 3 秒平均帧差 {diffs[:90].mean():.2f}")
R['duration'] = dur
R['未能自动检查'] = ['画面里是否还有其他网址或域名文字：本机没有文字识别工具，靠逐镜头校样和每秒拼图人工核对', '字幕与口播是否对齐：时间来自本地识别，未经人耳校对']
json.dump(R, open(report_path, 'w'), ensure_ascii=False, indent=1)
print('总体:', '通过' if R['ok'] else '有未通过项')
