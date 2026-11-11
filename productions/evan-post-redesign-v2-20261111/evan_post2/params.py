"""设计参数。单位：1080×1920 成片像素；时间：成片秒（已除以 speed）。

预设文件（presets/*.json）只需写与 DEFAULTS 不同的键，按层级合并。
"""
import copy
import json

DEFAULTS = {
    "canvas": [1080, 1920],
    # 平台 UI 安全框：经验假设，需用真实上传预览核对（见 README「还需发布验证」）
    "safe_frame": {"top": 132, "bottom": 1650, "side": 44},
    "colors": {
        "cream": [255, 247, 232], "cocoa": [58, 38, 24], "cocoa_mid": [112, 82, 60],
        "coral": [238, 122, 92], "yellow": [255, 214, 82], "tan": [226, 210, 186],
        "stroke": [34, 23, 16], "en": [255, 255, 255], "zh": [255, 244, 224],
        "hl_text": [40, 28, 18], "scrim": [22, 15, 10], "panel": [40, 28, 21],
    },
    "sub": {
        "mode": "scrim",            # scrim=羽化暗晕+描边字；panel=暖色半透明底板
        "divider_y": 1492,          # 中线锚定：英文向上长，中文向下长，短句长句都不跳
        "max_w": 944,
        "en_sizes": [54, 51, 48],   # 放不下两行时逐级缩小，到底仍放不下就拒绝出片
        "zh_sizes": [42, 40, 38],
        "en_lh": 1.26, "zh_lh": 1.36, "gap": 10,
        "max_en_lines": 2, "max_zh_lines": 2,
        "stroke": 3, "scrim_alpha": 122, "scrim_blur": 22, "panel_alpha": 172,
        # 逐句自适应：字下背景偏亮时逐级加深暗晕，直到“白字对底色”最差5%分位对比度达标
        "scrim_adaptive": True, "scrim_ladder": [122, 146, 170, 192], "contrast_target": 4.5,
        "fade_in": 0.10, "fade_out": 0.08, "wipe": 0.22,
    },
    "timeline": {
        "lead": 0.08,        # 字幕比声音早出现
        "linger": 0.35,      # 句后有停顿时多留
        "bridge_gap": 0.45,  # 小于此空档就直接接下一句，避免闪
        "min_gap": 0.10,
        "min_dur": 1.0,
        "para_gap": 0.22,    # 段落之间强制留一口气的干净画面
        "tail": 0.70,
        "silence_db": -38, "silence_min": 0.25,
    },
    "reading": {"zh_cps_max": 9.0, "en_cps_max": 20.0},   # 超出只报告，不拦截
    "card": {
        "lane": "top",       # top=上方学习栏；dock=贴在字幕上方的小标签
        "top_y": 236, "gap": 14,
        "preroll": 0.12, "desired_hold": 3.2, "max_hold": 4.6, "end_gap": 0.15,
        # 最短可读 = 注意到卡片 0.6s + 英文 4 词/秒 + 中文 11 字/秒（下限；理想停留仍是 desired_hold）
        "read_base": 0.6, "read_per_en_word": 0.25, "read_per_zh_char": 0.09,
        "fade_in": 0.18, "fade_out": 0.20, "rise": 14,
        "en_size": 56, "zh_size": 38, "compact_en": 44, "compact_zh": 34,
        "dock_gap": 22, "face_margin": 28,
    },
    "chip": {"show": True, "y": 146, "h": 68, "tag_size": 28, "title_size": 34},
    "hook": {"show": True, "seconds": 2.8, "min_seconds": 2.0, "size": 80, "size_2line": 66,
             "max_w": 800, "fade_out": 0.25, "max_card_delay": 1.5},
    "question": {"base": 2.0, "per_word": 0.22, "min": 3.5, "max": 7.0, "accept_ratio": 0.75,
                 "latest_start": 16.0, "sizes": [36, 33, 30], "max_lines": 3, "max_w": 880,
                 "fade": 0.22},
    "twist": {"zoom": 0.06, "ease": 1.1, "lead": 0.10},
    "bookend": {"show": True, "fade": 0.25},
    "outro": {"seconds": 0.0, "blur": 18, "dim": 0.35},   # >0 时片尾定格+7表达回顾（改变片长，需审核）
    "encode": {"fps": 25, "crf": 18, "preset": "fast", "threads": 2, "audio_bitrate": "192k"},
    "supersample": 2,
}


def merge(base, extra):
    out = copy.deepcopy(base)
    for k, v in (extra or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = merge(out[k], v)
        else:
            out[k] = copy.deepcopy(v)
    return out


def load(preset_path=None, overrides=None):
    p = copy.deepcopy(DEFAULTS)
    if preset_path:
        with open(preset_path, encoding="utf-8-sig") as f:
            data = json.load(f)
        data.pop("_说明", None)
        p = merge(p, data)
    return merge(p, overrides)
