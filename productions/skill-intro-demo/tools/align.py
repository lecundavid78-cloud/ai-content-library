#!/usr/bin/env python3
"""
align.py —— 用「文案原文」+「Whisper 逐字时间戳」生成与真实口播对齐的字幕 / 词时间表

  python3 tools/align.py <whisper.json> <文案.md> --from 0 --to 83.5 --out src-ch01/js/timeline.js
  python3 tools/align.py <whisper.json> <文案.md> --sections          # 打印每个小节标题的开口时间（用于分章）

思路
  · 字幕正文一律用文案（Whisper 会把「任务」听成「人物」、「生图」听成「声图」），时间一律用语音。
  · 把文案和识别结果都规整成「只剩汉字 / 字母 / 数字」的字符序列，用 difflib 做最长公共子序列对齐；
    对齐上的字直接拿到时间，没对齐上的字（识别错字）在前后两个已知字之间线性插值。
  · 文案按标点切成短句，再合并成 ≤ MAX 字的字幕行；行尾的，。去掉（参考片的字幕也不带句末标点）。
  · 输出 JS：Studio.TIMELINE = { range, subs:[{from,to,text}], marks:{关键词: 时间} }，供场景文件引用。
"""
import json, re, sys, difflib, argparse

MAX = 20          # 每行字幕最多字数（汉字、英文都按字符计）
LEAD = 0.08       # 字幕比开口提前一点出现
TAIL = 0.25       # 最后一个字之后再停留


def norm_chars(s):
    return [c.lower() for c in s if re.match(r'[一-鿿A-Za-z0-9]', c)]


def whisper_chars(data):
    """把 Whisper 的 token 摊成逐字 (char, start, end)。"""
    out = []
    for seg in data['segments']:
        for w in seg.get('words', []):
            cs = norm_chars(w['word'])
            if not cs:
                continue
            dur = (w['end'] - w['start']) / len(cs)
            for i, c in enumerate(cs):
                out.append((c, w['start'] + i * dur, w['start'] + (i + 1) * dur))
    return out


def script_text(md):
    lines = [l for l in md.splitlines() if l.strip() and not l.startswith('来源')]
    return lines  # 保留标题行（## …）


def align(script_chars, wchars):
    a = [c for c in script_chars]
    b = [c for c, _, _ in wchars]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    t = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            _, s, e = wchars[blk.b + k]
            t[blk.a + k] = (s, e)
    # 插值
    known = [i for i, v in enumerate(t) if v]
    for i in range(len(t)):
        if t[i]:
            continue
        lo = max([k for k in known if k < i], default=None)
        hi = min([k for k in known if k > i], default=None)
        if lo is None:
            t[i] = t[hi]
        elif hi is None:
            t[i] = t[lo]
        else:
            f = (i - lo) / (hi - lo)
            s = t[lo][1] + f * (t[hi][0] - t[lo][1])
            t[i] = (s, s)
    return t


def width(s):
    """显示宽度：汉字 / 全角标点 = 1，英文数字空格 = 0.55。"""
    return sum(0.55 if ord(c) < 0x2E80 else 1 for c in s)


SOFT, HARD = 12, 27   # 两个短句合并后不超过 SOFT 才合并；单行绝不超过 HARD


def split_lines(text):
    """按分句切字幕：句末 / 冒号必断；短分句（≤6 宽）与相邻分句合并；超长分句在「、」处切。"""
    text = text.replace('“', '「').replace('”', '」')
    parts = re.findall(r'[^，。？！；：]+[，。？！；：]?[」）]*', text)
    pieces = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if width(p) <= HARD:
            pieces.append(p); continue
        cur = ''
        for q in re.findall(r'[^、]+、?', p):     # 超长：按顿号切
            if cur and width(cur + q) > HARD * 0.7:
                pieces.append(cur); cur = q
            else:
                cur += q
        if cur:
            pieces.append(cur)
    lines, cur = [], ''
    for p in pieces:
        hard_end = re.search(r'[。？！][」）]*$', cur) or (re.search(r'：$', cur) and width(cur) > 4)
        tail = width(p) <= 5 and not re.search(r'[：:]$', cur)      # 「范围太宽」这类尾巴短句并到上一行
        if cur and not hard_end and (width(cur) <= 6 or width(cur + p) <= SOFT or tail) and width(cur + p) <= HARD:
            cur += p
        else:
            if cur:
                lines.append(cur)
            cur = p
    if cur:
        lines.append(cur)
    return lines


def clean(line):
    line = line.strip().replace('“', '「').replace('”', '」')
    line = re.sub(r'^[、，]', '', line)
    line = re.sub(r'[，。、；：]+(?=[」）]*$)', '', line)   # 去掉句末标点（保留？）
    if line.count('「') > line.count('」'): line += '」'
    if line.count('」') > line.count('「'): line = '「' + line
    return line


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('whisper'); ap.add_argument('md')
    ap.add_argument('--from', dest='t0', type=float, default=0)
    ap.add_argument('--to', dest='t1', type=float, default=1e9)
    ap.add_argument('--out'); ap.add_argument('--sections', action='store_true')
    ap.add_argument('--marks', default='')
    ap.add_argument('--offset', type=float, default=0, help='输出时间减去该值（章内时间 = 原片秒数 - offset）')
    args = ap.parse_args()

    data = json.load(open(args.whisper, encoding='utf-8'))
    wchars = whisper_chars(data)
    lines = script_text(open(args.md, encoding='utf-8').read())

    # 全文逐字
    flat, owner = [], []          # owner[i] = (line_idx, char_pos_in_line)
    for li, l in enumerate(lines):
        for ci, c in enumerate(l):
            if norm_chars(c):
                flat.append(c.lower()); owner.append((li, ci))
    times = align(flat, wchars)
    tmap = {owner[i]: times[i] for i in range(len(flat))}

    def span_of(li, start_ci, end_ci):
        ts = [tmap[(li, c)] for c in range(start_ci, end_ci) if (li, c) in tmap]
        return (ts[0][0], ts[-1][1]) if ts else None

    if args.sections:
        for li, l in enumerate(lines):
            if l.startswith('## ') or li == 0:
                sp = span_of(li, 0, len(l))
                print(f"{sp[0]:8.2f}  {l.strip('# ')[:40]}")
        print(f"{wchars[-1][2]:8.2f}  （口播结束）")
        return

    subs = []
    for li, l in enumerate(lines):
        if l.startswith('# '):
            continue                      # 文件标题，不是口播
        if l.startswith('#'):
            body = l.strip('# ').strip()
            sp = span_of(li, 0, len(l))
            if sp and args.t0 - 0.01 <= sp[0] < args.t1:
                subs.append({'from': sp[0], 'to': sp[1], 'text': body})
            continue
        pos = 0
        ln = l.replace('“', '「').replace('”', '」')     # 等长替换，字符位置不变
        for seg in split_lines(l):
            i = ln.find(seg, pos)
            if i < 0:
                raise SystemExit(f'定位失败：{seg!r}')
            pos = i + len(seg)
            sp = span_of(li, i, i + len(seg))
            if not sp or not (args.t0 - 0.01 <= sp[0] < args.t1):
                continue
            subs.append({'from': sp[0], 'to': sp[1], 'text': clean(seg)})

    # 显示时间：提前 LEAD 出现，停到下一行出现前（最多停 TAIL）
    subs.sort(key=lambda s: s['from'])
    for k, s in enumerate(subs):
        nxt = subs[k + 1]['from'] - LEAD if k + 1 < len(subs) else args.t1
        s['from'] = round(max(args.t0, s['from'] - LEAD), 2)
        s['to'] = round(min(s['to'] + TAIL, nxt - 0.02, args.t1), 2)

    marks = {}
    for kw in [k for k in args.marks.split(',') if k]:
        text = ''.join(lines)
        for li, l in enumerate(lines):
            i = l.find(kw)
            if i >= 0:
                sp = span_of(li, i, i + len(kw))
                if sp and args.t0 <= sp[0] < args.t1:
                    marks[kw] = round(sp[0], 2)
                    break

    js = ('/* 由 tools/align.py 生成，勿手改：字幕正文 = 文案，时间 = 真实口播（Whisper 逐字时间戳对齐）*/\n'
          'window.Studio = window.Studio || {};\nStudio.TIMELINE = ' +
          json.dumps({'range': [args.t0, args.t1], 'offset': args.offset,
                      'subs': [{**x, 'from': round(x['from'] - args.offset, 2), 'to': round(x['to'] - args.offset, 2)} for x in subs],
                      'marks': {k: round(v - args.offset, 2) for k, v in marks.items()}},
                     ensure_ascii=False, indent=1) + ';\n')
    if args.out:
        open(args.out, 'w', encoding='utf-8').write(js)
        print(f'→ {args.out}  {len(subs)} 行字幕')
        print('marks(章内):', json.dumps({k: round(v - args.offset, 2) for k, v in marks.items()}, ensure_ascii=False))
    for s in subs:
        print(f"{s['from'] - args.offset:7.2f}–{s['to'] - args.offset:7.2f}  {s['text']}")


if __name__ == '__main__':
    main()
