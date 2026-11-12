# 阿泽 · Codex 三步换 DeepSeek（v001）

2026-11-12 任务一出片交付。成片：`out/v001/阿泽_Codex三步换DeepSeek_v001.mp4`（1080×1920，30fps，64.33 秒）。

V2 成片已完成：`out/v002/阿泽_Codex三步换DeepSeek_v002.mp4`（1080×1920，30fps，时长 56.77 秒）。SHA256 `5a6d94819342eec9a52389c8a16872786597449e69ce8df194f51a7e5c9aa5a5`。当前 `comp/` 源码和 `comp/public/gen/` 是 V2 可重渲染媒体：压缩后的 `human.mp4`、已打码的 `stage.mp4`，以及口播 `audio/v2/G_vo_cut.wav`、`audio/v2/G_vo_cut.m4a`。v001 压缩数字人和录屏在 `comp/public/gen-v001/`，v001 口播仍是 `audio/F_vo.m4a`。仍然没有收录含密钥的原片 E。不要覆盖 `out/v001/` 或 `out/v002/`。V2 交接见 `给Codex的说明_v002.md`。

本仓库是公开仓库。检出本分支后，做 V2 请读 `给Codex的说明_v002.md`；v001 说明仍是 `给Codex的说明.md`。未压缩数字人原文件超过 GitHub 单文件 100 MB 上限，没有上传。原片 E 和未打码帧仍然没有收录，不要补传。

## 成片文件（`out/v001/`）

| 文件 | 说明 |
|---|---|
| `阿泽_Codex三步换DeepSeek_v001.mp4` | 成片，1080×1920，约 34.7 MB。SHA256 见 `SHA256SUMS` |
| `阿泽_Codex三步换DeepSeek_v001_手机预览360.mp4` | 360×640 预览，方便看手机上的字号 |
| `阿泽_Codex三步换DeepSeek_v001.srt` | 口播字幕，与确认稿 `文案.md` 逐字一致 |
| `阿泽_Codex三步换DeepSeek_v001_前3秒.jpg` | 前 3 秒每 0.2 秒一格 |
| `阿泽_Codex三步换DeepSeek_v001_每秒拼图.jpg` | 全片每秒一格 |
| `制作说明.md` | 怎么拍、用了哪些镜头、缺口怎么处理、密钥怎么打码 |
| `这套做法能否固定为方法.md` | 方法讨论：骨架可以固定，取景和钩子不行 |
| `质检报告.json` | 自动检查结果 |

校验：在本目录执行 `sha256sum -c SHA256SUMS`。

## 一并收录

- `文案.md`、`素材清单.md`、`口播对齐.md`、`给Claude的本轮任务.md`：本期确认稿和任务书。
- `comp/`：本期合成工程的源码、剪辑表和工具脚本。`package.json` 列出 Remotion 4.0.542，在本机执行 `npm install`。不要使用工作站上的 Linux `node_modules`。本包不包含 `node_modules`，也没有改过 `master/`。
- 可重渲染媒体（V2，当前 `comp/public/gen/`）：`human.mp4`（CRF 22，31847875 字节，1080×1920、25fps、1419 帧、56.76 秒）、`stage.mp4`（已打码录屏轨）、口播 `audio/v2/G_vo_cut.wav` 与 `G_vo_cut.m4a`。v001 的 `human.mp4`（34849601 字节）和 `stage.mp4` 在 `comp/public/gen-v001/`，v001 口播 `audio/F_vo.m4a` 仍在原处。说明见 `给Codex的说明_v002.md` 和 `可重渲染媒体说明.md`。

## 未收录（请勿补传）

- **素材 E 原片**（文件名含 `CONTAINS-SECRET`）以及 E 段未打码的临时帧、`secret_scratch/`：里面有完整 DeepSeek API Key。成片 40.45–41.55 秒的密钥栏已经打码（黑底圆点，并有「画面已打码」条）。这把密钥已经进过录屏，发布前请在 DeepSeek 后台删除并重建。
- **全部 raw 原片、未压缩数字人原片、`build/raw.mp4`**：不是给公开仓库用的素材包；其中 E 段原片绝不能上传。已打码的 `comp/public/gen/stage.mp4` 和压缩后的 `human.mp4` 已在本分支，合成只用这两份。
- **未压缩的 `human.mp4`**：约 100.6 MB，超过 GitHub 单文件 100 MB 上限，没有上传。仓库里的 `comp/public/gen/human.mp4` 是 V2 画面的 CRF 22 重压缩（1419 帧、56.76 秒）。v001 的压缩副本在 `comp/public/gen-v001/human.mp4`（1080×1920、25fps、1609 帧、64.36 秒）。

## 质检说明

自动质检总评未过：其中「成片里遮罩为实心深色块」在 40.47–41.53 秒未通过。人工目检同一段：密钥栏是黑底圆点，上方有「画面已打码」条，明文没有露出来，更像是检查坐标没对上，不是打码失败。发布前请再看这一段。

制作方听不了声音，字幕时间来自本地识别，请戴耳机核对。49.8–51.3 秒口播说「最后再重开 Codex」，画面是确认弹窗和打开开关，不同步。第一个真实录屏到 14.2 秒才出现。画面里能看到余额 ¥1.55 和测试名 `asdasd`。没有配乐。详情见 `out/v001/制作说明.md`。

## 怎么重出一版

检出本分支（这一期还没有合并进 `main`）。V2 在 `comp/` 里 `npm install`，按 `给Codex的说明_v002.md` 重渲染，口播用 `audio/v2/G_vo_cut.wav`。不要覆盖 `out/v001/` 或 `out/v002/`。仍然不要补传原片 E 或未打码帧。
