# Evan 小猫学雅思 · 后期升级 v2（2026-11-11）

用第 33 期已有原片、同一配音、同一确认稿做的后期对比实验。仓库里放的是可复用代码、两套方案的成片和对照，以及第 30–32 期的稳健性抽帧。

本目录不含第 30–33 期已交付成片，也不含原片；那些文件没有被覆盖。第 34 期仍暂停。完整《交付说明》还要等 2026-11-11 18:00（Asia/Shanghai）额度重置后补上。

这里只说明文件怎么找。两套新方案改善完播率与否，目前没有测量，不能当成已经验证的效果。

## 先看这些

- [out/ep33-A/sample.mp4](out/ep33-A/sample.mp4)：方案 A「上学下讲」成片，约 40.1 秒，1080×1920。题目和表达卡在上方，中间留给小猫，下方是不带底板的双语字幕。
- [out/ep33-B/sample.mp4](out/ep33-B/sample.mp4)：方案 B「贴字幕小标签」成片，同样时长和画幅。字幕保留暖色底板，表达变成贴在字幕上方的小标签。
- [out/ep33-A/compare_side_by_side.mp4](out/ep33-A/compare_side_by_side.mp4)：方案 A 与现有版左右对照，1440×1352，约 40.1 秒。
- [out/ep33-B/compare_side_by_side.mp4](out/ep33-B/compare_side_by_side.mp4)：方案 B 与现有版左右对照。
- [out/三方静帧对比_旧版_A_B.jpg](out/三方静帧对比_旧版_A_B.jpg)：上排现有版，中排方案 A，下排方案 B。
- [out/ep33-A/静帧对比/手机实际宽度390px_左旧右新.png](out/ep33-A/静帧对比/手机实际宽度390px_左旧右新.png)：按手机宽度并排看方案 A。

可选：`out/ep33-A-recap/sample.mp4` 是方案 A 片尾补了七张表达回顾的变体，约 43.7 秒。

GitHub 网页预览可用各目录下的 `sample_手机预览360.mp4`，对照视频用 `compare_side_by_side_预览720.mp4`。正式文件请下载完整版 mp4。

## 方案摘要

- 方案 A（推荐，`presets/A.json`）：`sub.mode=scrim`，`card.lane=top`。
- 方案 B（保守，`presets/B.json`）：`sub.mode=panel`，`card.lane=dock`。

字幕文本只来自已确认稿；语音识别只用来对齐时间。默认倍速 0.85×（第 30 期历史 0.9× 不作为默认）。

## 代码与命令

入口是 `render_v2.py`。它只读本目录 `episodes/<期号>/` 的字幕时间轴配置，并依赖本地 Evan 资料包里的原片和配音（不在本仓库）。结果写到 `out/`，不覆盖已交付成片，同名输出默认拒绝覆盖。不调用付费生成。

```bash
python3 render_v2.py check   --episode 33 --preset A
python3 render_v2.py still   --episode 33 --preset A --t 3.0 --t 32.9
python3 render_v2.py sheet   --episode 33 --preset A
python3 render_v2.py render  --episode 33 --preset A
python3 render_v2.py compare --episode 33 --preset A
python3 render_v2.py detect-safe --episode 33
python3 render_v2.py baseline-metrics --episode 33
```

## 其余文件

- `evan_post2/`：后期模块（绘制、时间轴、安全区、合成、检查）。
- `episodes/30`–`33/subtitles.v2.json`：各期字幕时间轴。
- `out/ep33-A/`、`out/ep33-B/`：成片、对照视频、中/英/双语字幕、时间轴、渲染回执、检查报告、七张表达卡、静帧对比。
- `out/ep30-*-稳健性/` 到 `out/ep32-*-稳健性/`：第 30–32 期在长句、长题目、不同背景和脸部位置上的抽帧与检查报告。
- `SHA256SUMS`：本目录所有文件的校验和。
