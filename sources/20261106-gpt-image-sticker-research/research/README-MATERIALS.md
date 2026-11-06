# 材料包说明（视频制作前审阅）

- **根目录**：`/workspace/gpt-image-sticker-research-20261106/`
- **压缩包**：`/workspace/gpt-image-sticker-research-20261106.zip`
- **整合日**：2026-11-06（Asia/Shanghai）
- **原则**：仅真实下载/摘录；无替代截图；对照表摘要 ≠ 原文全文
- **精选条目数**：**9**（S1、S2 + #1–#7）。web30708 / Adam 仅补充，不凑数
- **媒体归属**：本包多为原帖**附件图/动图**，作者归属以 `file-manifest.csv` + 原帖 URL 证明；**未取得**精选帖的 X 整帖 UI 截图。勿声称「截图保留作者身份」

## 先读

1. `RESEARCH-REPORT.md` — 结论、推荐路线、9 帖对照（2 种子 + 7 案例）、官方与变现、缺项
2. `notes/x-research.md` — X 案例与路线细节
3. `notes/official-model.md` / `notes/monetization.md` / `notes/repository-audit.md`
4. `sources/file-manifest.csv` — 每个可交付文件的来源与 sha256

## 目录结构

```
RESEARCH-REPORT.md
README-MATERIALS.md
notes/          研究笔记
sources/        原文、官方摘录、url-map、ray-sticker-shop 源码副本、manifest
media/          原帖图片与视频（seed-* / selected/*）
video-frames/   Ray 演示视频真实抽帧（非伪造整帖截图）
```

## 关键原图 / 视频路径（优先打开）

| 用途 | 路径 |
|------|------|
| 种子：赞赏/投稿 UI（注意图内日期 2025-09） | `media/seed-ama_huangama/01_*.jpg` … `04_*.jpg` |
| 种子：Ray 84s 演示 | `media/seed-wangray/demo_1080x1920.mp4` |
| 演示抽帧联系表 | `video-frames/contact-sheet.jpg` |
| 歸藏：参考图 + 动图预览（X 为 MP4） | `media/selected/op7418/ref1.jpg` `ref2.jpg` `gif1.mp4`… |
| Gorden：参考↔结果 | `media/selected/Gorden_Sun/ref.jpg` `gif_result.mp4` |
| 路飞示例（短 MP4） | `media/selected/0xluffy_eth/` |
| 变现反证数据图 | `media/selected/blune66/stats.jpg` |
| 杰哥长文全文 | `sources/jev_chat-article-full.txt` |
| 麻酱长文全文 | `sources/zhongying14-article-full.txt`（生成提示词仍缺） |
| 杰哥封面 | `media/selected/jev_chat/cover_HWYC4gMacAAHHHL.jpg` |
| 麻酱后台/封面 | `media/selected/zhongying14/` |

## 原文完整性（raw-posts）

- 短帖：`sources/raw-posts.md` 已嵌入 API `text` / `note_tweet` **正文全文**。
- 两篇 X Article（杰哥、麻酱）：`raw-posts.md` 内已嵌入 `article.plain_text` 全文，并另存独立文件；**不等于**已抓取全部回复线程。
- 回复多为摘录；未宣称「所有回复完整抓取」。

## 格式提醒

- X「GIF」附件在本包中多为 **MP4**，不可直接当微信上传文件。
- `video-frames/` 仅来自 Ray 演示视频抽帧。
- zip **已排除**：根目录与 seed 重复的 `media/211815*` / `media/211833*`、`.git`、59 字节 Forbidden 失败文件、空/跳转的服务协议抓取、无正文的 OpenAI JS 壳 HTML。

## 未取得（详见报告 §7）

杰哥/麻酱文内全部配图、Adam 玩法 2–6 全量、过审后台与真实订单、服务协议全文、付费 API 实测账单等。

## 禁止

- 把黄啊码 2025-09 赞赏数据说成 Image 2.6 上线收益
- 把官方「已发布 2.6」写成某帖已证实用了 2.6
- 上屏旧规「必须 16 张 / ≤100KB」而不核对现行 8–24 / ≤500KB
- 生成替代截图或调用付费 API「补证据」
