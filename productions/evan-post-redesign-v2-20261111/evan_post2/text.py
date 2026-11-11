"""文字测量与断行。英文按词、中文按字；两者都最多两行，放不下由调用方缩字号或拒绝。"""
import re
from pathlib import Path

from PIL import ImageFont

FONT_FILES = {"bold": "NotoSansSC-Bold.otf", "medium": "NotoSansSC-Medium.otf", "black": "NotoSansSC-Black.otf"}
_font_dir = None
_fonts = {}


def set_font_dir(path):
    global _font_dir
    _font_dir = Path(path)
    for name in FONT_FILES.values():
        if not (_font_dir / name).is_file():
            raise FileNotFoundError(_font_dir / name)


def font(kind, size):
    key = (kind, int(size))
    if key not in _fonts:
        # 固定 BASIC 排版引擎：有无 libraqm 的机器测量结果一致
        _fonts[key] = ImageFont.truetype(str(_font_dir / FONT_FILES[kind]), int(size),
                                         layout_engine=ImageFont.Layout.BASIC)
    return _fonts[key]


def words(s):
    """与生产适配器 evan_flow.words 相同的词元归一化。"""
    return re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)*", s.lower().replace("’", "'").replace("‘", "'"))


def display_en(s):
    """NotoSansSC 把弯引号画成全角（旧片里的 “I’ d”）。只改显示，不改稿：等长替换成直引号。"""
    return s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')


WEAK_END = set("a an the to of in on at for with and but or so my her his their your its i i'd i'm i've "
               "she he it we they that this as by from if when whenever she'd he'd was were is be been "
               "into than then just very".split())
ZH_NO_START = set("，。！？；：、”’）》】…—·,.!?;:)")
ZH_NO_END = set("“‘（《【(")
ZH_PUNCT_END = set("，。！？；：、”’）")
ZH_SOFT_BEFORE = set("我你他她它把被在从对给和与跟就才都也还又再却而但并等")
ZH_SOFT_AFTER = set("的地得了着过")


def find_all(haystack, needle):
    out, low, n = [], haystack.lower(), needle.lower()
    if not n:
        return out
    i = low.find(n)
    while i >= 0:
        out.append((i, i + len(n)))
        i = low.find(n, i + len(n))
    return out


def _inside(spans, pos):
    """断点 pos（在字符 pos 之前断）是否落在某个不可断区间内部。"""
    return any(a < pos < b for a, b in spans)


def break_en(text, fnt, maxw, glue, max_lines=2):
    """返回 [(start, end)] 行区间（字符下标）；放不下返回 None。glue=不可拆的高亮短语区间。"""
    toks = [(m.start(), m.end()) for m in re.finditer(r"\S+", text)]
    if not toks:
        return None
    if fnt.getlength(text.strip()) <= maxw:
        return [(toks[0][0], toks[-1][1])]
    if max_lines < 2:
        return None
    best = None
    for allow_glue_break in (False, True):
        for k in range(1, len(toks)):
            a = (toks[0][0], toks[k - 1][1])
            b = (toks[k][0], toks[-1][1])
            w1, w2 = fnt.getlength(text[a[0]:a[1]]), fnt.getlength(text[b[0]:b[1]])
            if w1 > maxw or w2 > maxw:
                continue
            split_glue = _inside(glue, toks[k][0])
            if split_glue and not allow_glue_break:
                continue
            last = text[a[0]:a[1]].split()[-1]
            cost = abs(w1 - w2) / maxw
            if last[-1] in ",;:.!?\"'":
                cost -= 0.25
            elif last.lower().strip("\"'") in WEAK_END:
                cost += 0.30
            if text[b[0]] in ",.;:!?)":
                cost += 5
            if split_glue:
                cost += 1.0
            if best is None or cost < best[0]:
                best = (cost, [a, b])
        if best:
            break
    return best[1] if best else None


def break_zh(text, fnt, maxw, glue, max_lines=2):
    """中文断行。优先标点后；否则找虚词边界；绝不拆释义/英文词，不让标点落在行首。
    返回 (行区间, 是否为非标点处自动断行)；放不下返回 (None, False)。"""
    if "\n" in text:
        raise ValueError("手动换行应在调用前处理")
    if fnt.getlength(text) <= maxw:
        return [(0, len(text))], False
    if max_lines < 2:
        return None, False
    ascii_runs = [(m.start(), m.end()) for m in re.finditer(r"[A-Za-z0-9']+", text)]
    protected = list(glue) + ascii_runs
    best = None
    for k in range(2, len(text) - 1):
        if text[k] in ZH_NO_START or text[k - 1] in ZH_NO_END or _inside(protected, k):
            continue
        w1, w2 = fnt.getlength(text[:k]), fnt.getlength(text[k:])
        if w1 > maxw or w2 > maxw:
            continue
        cost = abs(w1 - w2) / maxw
        soft = True
        if text[k - 1] in ZH_PUNCT_END:
            soft = False
        elif text[k] in ZH_SOFT_BEFORE or text[k - 1] in ZH_SOFT_AFTER or any(k in (a, b) for a, b in glue):
            cost += 0.18
        else:
            cost += 0.40
        if min(k, len(text) - k) < 4:
            cost += 0.5
        if best is None or cost < best[0]:
            best = (cost, [(0, k), (k, len(text))], soft)
    if not best:
        return None, False
    return best[1], best[2]


def fit_en(text, glue, sizes, maxw, max_lines, kind="bold"):
    for size in sizes:
        lines = break_en(text, font(kind, size), maxw, glue, max_lines)
        if lines:
            return size, lines
    return None, None


def fit_zh(text, glue, sizes, maxw, max_lines, kind="medium"):
    """支持稿内用 \\n 指定断行。返回 (字号, 显示文本, 行区间, soft)。"""
    if "\n" in text:
        parts = text.split("\n")
        if len(parts) > max_lines:
            return None, None, None, False
        flat = "".join(parts)
        for size in sizes:
            if all(font(kind, size).getlength(p) <= maxw for p in parts):
                spans, pos = [], 0
                for p in parts:
                    spans.append((pos, pos + len(p)))
                    pos += len(p)
                return size, flat, spans, False
        return None, None, None, False
    for size in sizes:
        lines, soft = break_zh(text, font(kind, size), maxw, glue, max_lines)
        if lines:
            return size, text, lines, soft
    return None, None, None, False
