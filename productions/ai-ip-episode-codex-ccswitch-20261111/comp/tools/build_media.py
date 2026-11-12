#!/usr/bin/env python3
"""按 data/edit.json 生成录屏轨 public/gen/stage.mp4（竖屏取景 + 变速 + 叠化 + 密钥遮罩 + 网址模糊），
以及逐帧取景参数 public/gen/stage_cam.json，供合成里的标注定位。

安全规则（硬编码，不依赖剪辑表）：
  * 片段 C、D 不允许出现在剪辑表里（D 不是教程镜头；C 在 V2 被 H 替换）。
  * 片段 E：源时间 >= E_BLUR_FROM 的帧，弹窗以外整体模糊；源时间 >= E_KEY_FROM 的帧，密钥栏用实心块覆盖；
    源时间 > E_MAX 的帧禁止使用。E 的用量页只允许 E_DASH_MAX 之前（之后页面开始缩放，地址栏位置不稳定）。
  * 片段 H：源时间 > H_MAX 禁止使用（3.1s 起画面拉回、浏览器栏重新露出；约 4.0s 起出现下载列表）。
  * 网址：URL_BLURS 里登记的每一处网址，在对应源时间段内一律高斯模糊（按源时间插值位置）。
  * 浏览器顶栏：B/E/H 每个镜头的取景上沿必须低于 CHROME_BOTTOM（标签页、地址栏、书签栏不入画）。
  * 本脚本不读取、不识别、不输出任何密钥文字。
用法: build_media.py [--proof out.jpg] [--only-proof] [--boxes]   (--boxes 在校样里画出模糊框)
"""
import json, subprocess, sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
COMP = os.path.dirname(HERE)
EP = os.path.dirname(COMP)
SW, SH = 1834, 1032
SRC_FPS = 60

E_BLUR_FROM = 1.3          # 之后可能出现 API keys 列表
E_KEY_FROM = 7.56          # 密钥弹窗最早出现在 7.68；提前覆盖
E_MAX = 8.90               # 8.92 起弹窗随缩放移动
E_DASH_MAX = 0.75
H_MAX = 3.08
# 浏览器顶栏下沿（源坐标）与录屏自身「未推近」的时段（源时间上限）。推近后的帧由校样人工核对
CHROME_GUARD = {'B': (128, 5.3), 'E': (130, 0.9), 'H': (135, 1.95)}
# 网址模糊：clip -> [ {from, to, keys:[[st, x0,y0,x1,y1], ...]} ]，位置按源时间线性插值（源坐标，已含余量）
URL_BLURS = {
    'A': [
        # 主界面 Claude Official 链接（0–1.6s 之后被缩放推出画面）
        {'from': 0.0, 'to': 1.65, 'keys': [[0.0, 158, 186, 412, 224], [1.12, 158, 186, 412, 224], [1.25, 0, 176, 440, 236], [1.65, 0, 176, 440, 236]]},
        # 添加表单：官网链接
        {'from': 7.8, 'to': 11.2, 'keys': [[7.8, 20, 325, 400, 425], [8.2, 20, 325, 410, 425], [8.3, 132, 362, 409, 407], [8.6, 140, 362, 417, 407],
                                           [8.7, 138, 366, 408, 411], [8.75, 135, 374, 392, 418], [8.8, 131, 382, 375, 426], [8.85, 127, 390, 360, 432],
                                           [8.9, 124, 396, 348, 438], [10.1, 104, 398, 311, 448], [11.2, 104, 398, 311, 448]]},
        # 添加表单：API 请求地址
        {'from': 7.8, 'to': 11.2, 'keys': [[7.8, 20, 595, 410, 705], [8.2, 20, 595, 360, 705], [8.3, 132, 641, 364, 687], [8.6, 140, 641, 372, 687],
                                           [8.7, 138, 638, 364, 683], [8.75, 135, 632, 351, 676], [8.8, 131, 626, 336, 669], [8.85, 127, 621, 323, 663],
                                           [8.9, 124, 617, 313, 658], [10.1, 113, 580, 280, 638], [11.2, 113, 580, 280, 638]]},
        # 供应商列表：OpenAI Official / DeepSeek 链接（添加成功后）
        {'from': 13.8, 'to': 15.2, 'keys': [[13.8, 196, 240, 466, 302], [14.95, 196, 240, 466, 302], [15.2, 140, 210, 580, 330]]},
        {'from': 13.8, 'to': 15.2, 'keys': [[13.8, 196, 369, 494, 432], [14.95, 196, 369, 494, 432], [15.2, 140, 340, 600, 460]]},
        # 路由页：服务地址 http://127.0.0.1:15721
        {'from': 23.0, 'to': 24.5, 'keys': [[23.0, 112, 576, 302, 628], [24.5, 112, 576, 302, 628]]},
        # 连通提示时的列表链接（取景本已避开，仍然模糊）
        {'from': 31.5, 'to': 34.0, 'keys': [[31.5, 140, 182, 352, 222], [34.0, 140, 182, 352, 222]]},
        {'from': 31.5, 'to': 34.0, 'keys': [[31.5, 140, 272, 372, 308], [34.0, 140, 272, 372, 308]]},
    ],
}
E_NAME_BOX = (512, 330, 1050, 618)     # 命名弹窗（7.10–7.60）外接框，留余量
E_KEY_BOX = (522, 291, 1022, 654)      # 密钥弹窗（7.68–8.91）
E_KEY_MASK = (538, 481, 869, 539)      # 密钥文字栏（复制按钮左侧整栏）

edit = json.load(open(os.path.join(COMP, 'data', 'edit.json')))
BOXES = '--boxes' in sys.argv
FPS = edit['fps']
ST = edit['stage']
OW, OH = ST['w'], ST['h']
AR = OW / OH

for s in edit['shots']:
    assert s['clip'] in edit['clips'], f"未知片段 {s['clip']}"
    assert s['clip'] not in ('C', 'D'), f"{s['id']}: 片段 {s['clip']} 禁止使用"
    lo, hi = s['src']
    if s['clip'] == 'E':
        assert max(s['src']) <= E_MAX, f"{s['id']}: E 段 {E_MAX}s 之后禁止使用"
        assert not (lo < 7.60 and hi > 7.60), f"{s['id']}: 不允许跨越密钥弹窗出现的时刻"
        assert hi <= E_DASH_MAX or lo >= 7.0, f"{s['id']}: E 用量页只允许 {E_DASH_MAX}s 之前"
    if s['clip'] == 'H':
        assert hi <= H_MAX, f"{s['id']}: H 段 {H_MAX}s 之后禁止使用（下载列表、浏览器栏）"
for name in edit['clips'].values():
    assert '/D_' not in name and '/C_' not in name


def ease(u):
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def cam_at(shot, t):
    ks = shot['cam']
    if t <= ks[0][0]: return ks[0][1:]
    for a, b in zip(ks, ks[1:]):
        if t <= b[0]:
            u = ease((t - a[0]) / (b[0] - a[0]))
            return [a[i] + (b[i] - a[i]) * u for i in (1, 2, 3)]
    return ks[-1][1:]


def clamp_cam(cx, cy, w):
    w = min(w, SW, SH * AR)
    h = w / AR
    cx = min(max(cx, w / 2), SW - w / 2)
    cy = min(max(cy, h / 2), SH - h / 2)
    return cx, cy, w


def src_at(shot, t):
    a, b = shot['src']
    u = (t - shot['t0']) / (shot['t1'] - shot['t0'])
    return a + (b - a) * min(max(u, 0), 1)


class Reader:
    """顺序读取某片段从 s0 起的 60fps 帧。"""
    def __init__(self, clip, s0):
        self.s0 = s0
        self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{s0:.4f}', '-i', os.path.join(EP, edit['clips'][clip]),
                                   '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        self.i = -1
        self.cur = None

    def get(self, st):
        idx = max(0, int(round((st - self.s0) * SRC_FPS)))
        while self.i < idx:
            b = self.p.stdout.read(SW * SH * 3)
            if len(b) < SW * SH * 3: break
            self.cur = Image.frombuffer('RGB', (SW, SH), b, 'raw', 'RGB', 0, 1).copy()
            self.i += 1
        return self.cur

    def close(self):
        self.p.kill()


def protect_e(im, st):
    """片段 E 的隐私处理。返回新图。"""
    if st < E_BLUR_FROM:
        # 用量页：只遮「累计消费金额」卡片（与教程无关的账户信息）
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((1034, 262, 1440, 356), 10, fill=(246, 246, 247))
        return im
    box = E_KEY_BOX if st >= E_KEY_FROM else E_NAME_BOX
    blurred = im.filter(ImageFilter.GaussianBlur(16))
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, 18, fill=255)
    out = Image.composite(im, blurred, m)
    if st >= E_KEY_FROM:
        d = ImageDraw.Draw(out)
        x0, y0, x1, y1 = E_KEY_MASK
        d.rounded_rectangle((x0, y0, x1, y1), 12, fill=(28, 26, 24))
        cy = (y0 + y1) // 2
        for k in range(14):                      # 装饰圆点，与密钥内容无关
            cx = x0 + 28 + k * 21
            d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=(245, 240, 232))
    return out


def url_rects(clip, st):
    out = []
    for b in URL_BLURS.get(clip, []):
        if not (b['from'] <= st <= b['to']): continue
        ks = b['keys']
        if st <= ks[0][0]: r = ks[0][1:]
        elif st >= ks[-1][0]: r = ks[-1][1:]
        else:
            for k0, k1 in zip(ks, ks[1:]):
                if k0[0] <= st <= k1[0]:
                    u = (st - k0[0]) / (k1[0] - k0[0]); r = [k0[i] + (k1[i] - k0[i]) * u for i in range(1, 5)]; break
        out.append(tuple(int(round(v)) for v in r))
    return out


def blur_urls(im, clip, st):
    rects = url_rects(clip, st)
    if not rects: return im, rects
    blurred = im.filter(ImageFilter.GaussianBlur(9))
    m = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(m)
    for r in rects: d.rounded_rectangle(r, 8, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(2))
    return Image.composite(blurred, im, m), rects


def render_frame(shot, t, readers):
    st = src_at(shot, t)
    key = shot['id']
    if key not in readers:
        for r in readers.values(): r.close()
        readers.clear()
        readers[key] = Reader(shot['clip'], min(shot['src']))
    im = readers[key].get(st)
    if shot['clip'] == 'E':
        im = protect_e(im.copy(), st)
    im, rects = blur_urls(im, shot['clip'], st)
    cx, cy, w = clamp_cam(*cam_at(shot, t))
    h = w / AR
    if shot['clip'] in CHROME_GUARD and st < CHROME_GUARD[shot['clip']][1]:
        assert cy - h / 2 >= CHROME_GUARD[shot['clip']][0], f"{shot['id']} t={t:.2f}: 取景上沿 {cy - h / 2:.0f} 进入浏览器顶栏"
    if BOXES:
        im = im.copy(); dd = ImageDraw.Draw(im)
        for r in rects: dd.rectangle(r, outline=(0, 160, 255), width=3)
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    out = im.resize((OW, OH), Image.LANCZOS, box=box)
    if OW / w > 1.25:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    return out, {'id': shot['id'], 'clip': shot['clip'], 'cx': round(cx, 2), 'cy': round(cy, 2), 'w': round(w, 2), 'st': round(st, 3), 'blur': len(rects)}


def shot_at(t):
    for s in edit['shots']:
        if s['t0'] - 1e-6 <= t < s['t1'] - 1e-6: return s
    return edit['shots'][-1] if t >= edit['shots'][-1]['t0'] else edit['shots'][0]


def main():
    f0, f1 = round(ST['t0'] * FPS), round(ST['t1'] * FPS)
    proof = None
    if '--proof' in sys.argv: proof = sys.argv[sys.argv.index('--proof') + 1]
    only_proof = '--only-proof' in sys.argv
    gen = os.path.join(COMP, 'public', 'gen')
    os.makedirs(gen, exist_ok=True)
    enc = None
    if not only_proof:
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OW}x{OH}', '-r', str(FPS), '-i', '-',
                                '-c:v', 'libx264', '-crf', '10', '-preset', 'medium', '-g', '10', '-pix_fmt', 'yuv420p',
                                '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                                '-movflags', '+faststart', os.path.join(gen, 'stage.mp4')], stdin=subprocess.PIPE)
    cams = {}
    readers = {}
    prev_out = None; fade_from = None; fade_left = 0; fade_n = 0; last_id = None
    thumbs = []
    still_frames = {round(v * FPS): k for k, v in edit.get('stills', {}).items()}
    for f in range(f0, f1):
        t = f / FPS
        s = shot_at(t)
        out, cam = render_frame(s, t, readers)
        if s['id'] != last_id:
            if s.get('xfade') and prev_out is not None:
                fade_from, fade_n, fade_left = prev_out, s['xfade'], s['xfade']
            last_id = s['id']
        if f in still_frames and not only_proof:
            out.save(os.path.join(gen, f'{still_frames[f]}.png'))
        final = out
        if fade_left > 0:
            a = 1 - fade_left / (fade_n + 1)
            final = Image.blend(fade_from, out, a)
            fade_left -= 1
        prev_out = out
        cams[f] = cam
        if enc: enc.stdin.write(final.tobytes())
        if proof and (f - f0) % 6 == 0:
            th = final.resize((258, 250), Image.BILINEAR)
            d = ImageDraw.Draw(th)
            d.rectangle((0, 0, 150, 22), fill=(0, 0, 0))
            d.text((4, 3), f"{t:5.2f} {s['id']} {cam['st']:.2f}", fill=(255, 255, 0))
            thumbs.append(th)
    for r in readers.values(): r.close()
    if enc:
        enc.stdin.close(); enc.wait()
        json.dump({'f0': f0, 'f1': f1, 'w': OW, 'h': OH, 'frames': cams}, open(os.path.join(gen, 'stage_cam.json'), 'w'))
    if proof:
        cols = 10; per = 60
        for k in range(0, len(thumbs), per):
            part = thumbs[k:k + per]
            rows = math.ceil(len(part) / cols)
            sheet = Image.new('RGB', (cols * 258, rows * 250), (40, 40, 40))
            for i, th in enumerate(part): sheet.paste(th, ((i % cols) * 258, (i // cols) * 250))
            sheet.save(proof.replace('.jpg', f'_{k // per + 1:02d}.jpg'), quality=85)
    print('stage frames', f1 - f0)


if __name__ == '__main__':
    main()
