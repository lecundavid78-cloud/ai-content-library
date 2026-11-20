#!/usr/bin/env python3
"""
build.py —— 字体子集化 + 打包成自包含的 demo/index.html

  python3 tools/build.py            # v1：src/ → demo/index.html
  python3 tools/build.py --no-fonts # 只打包（字体已是最新时）
  python3 tools/build.py --src src-v2 --out demo-v2/index.html   # v2

1) 扫描 src/ 下所有 .html/.js/.css 里出现的字符 + 常用标点/ASCII，
   从 assets/fonts/source/ 的 OFL 原字体中子集化，写到 src/fonts/*.woff2
   （环境里没有 brotli 时自动退回 .woff）。可变字重轴保留（100–900）。
2) 把 src/index.html 里的 <link rel=stylesheet> 与 <script src> 全部内联，
   字体转成 data URI，输出 demo/index.html —— 双击即可打开，无任何外部请求。

改了任何文案后都要重跑一次，否则新字会回落到系统字体。
"""
import base64, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
def _arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


SRC = ROOT / _arg("--src", "src")
OUT = ROOT / _arg("--out", "demo/index.html")
FONT_SRC = ROOT / "assets" / "fonts" / "source"

FONTS = [  # (family, source file, output stem, extra chars)
    ("SkillSans", "NotoSansSC[wght].ttf", "skill-sans", ""),
    ("SkillMono", "JetBrainsMono[wght].ttf", "skill-mono", "├─└│→←↑↓●×·…"),
]
BASE = "".join(chr(c) for c in range(0x20, 0x7F)) + "，。、？！：；“”‘’（）《》【】…—·→←×"


def collect_chars():
    chars = set(BASE)
    for p in SRC.rglob("*"):
        if p.suffix in {".html", ".js", ".css"}:
            chars |= set(p.read_text(encoding="utf-8"))
    return "".join(sorted(c for c in chars if c.isprintable()))


def subset_fonts():
    from fontTools import subset
    from fontTools.ttLib import TTFont
    try:
        import brotli  # noqa: F401
        flavor, ext, fmt = "woff2", ".woff2", "woff2"
    except ImportError:
        flavor, ext, fmt = "woff", ".woff", "woff"
        print("! 未安装 brotli，输出 .woff（体积稍大，效果相同）")
    text = collect_chars()
    out_dir = SRC / "fonts"
    out_dir.mkdir(exist_ok=True)
    for old in out_dir.glob("skill-*.*"):
        old.unlink()
    css = ["/* 由 tools/build.py 生成，勿手改。来源：assets/fonts/source（SIL OFL 1.1） */"]
    for family, src, stem, extra in FONTS:
        opts = subset.Options()
        opts.flavor = flavor
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = TTFont(FONT_SRC / src)
        sub = subset.Subsetter(opts)
        sub.populate(text=text + extra)
        sub.subset(font)
        dst = out_dir / (stem + ext)
        font.flavor = flavor
        font.save(dst)
        print(f"  {family}: {len(text + extra)} chars → {dst.name} {dst.stat().st_size/1024:.0f} KB")
        css.append(
            f'@font-face {{ font-family: "{family}"; src: url("{dst.name}") format("{fmt}");'
            f" font-weight: 100 900; font-style: normal; font-display: block; }}"
        )
    (out_dir / "fonts.css").write_text("\n".join(css) + "\n", encoding="utf-8")


def inline_css(path: pathlib.Path) -> str:
    css = path.read_text(encoding="utf-8")

    def font_url(m):
        f = (path.parent / m.group(1)).resolve()
        mime = "font/woff2" if f.suffix == ".woff2" else "font/woff"
        return f'url("data:{mime};base64,{base64.b64encode(f.read_bytes()).decode()}")'

    return re.sub(r'url\("?([^")]+\.woff2?)"?\)', font_url, css)


def bundle():
    html = (SRC / "index.html").read_text(encoding="utf-8")
    html = re.sub(
        r'<link rel="stylesheet" href="([^"]+)">',
        lambda m: f"<style>/* {m.group(1)} */\n{inline_css(SRC / m.group(1))}</style>",
        html,
    )
    html = re.sub(
        r'<script src="([^"]+)"></script>',
        lambda m: f"<script>/* {m.group(1)} */\n{(SRC / m.group(1)).read_text(encoding='utf-8')}</script>",
        html,
    )
    html = html.replace("<!-- 开发入口", "<!-- 构建产物（请改 src/ 后重跑 tools/build.py）。原注释：开发入口", 1)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    ext = re.findall(r'(?:src|href)="(?:https?:)?//[^"]+"|url\((?:"|\')?https?://', html)
    print(f"→ {OUT.relative_to(ROOT)}  {OUT.stat().st_size/1024:.0f} KB  外部引用: {len(ext)}")


if __name__ == "__main__":
    if "--no-fonts" not in sys.argv:
        subset_fonts()
    bundle()
