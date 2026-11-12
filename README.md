# AI 内容样本资料库

用途：用户亲选帖子，Grok 保存原始资料和用户关注点，Codex 读取、核查并整理为国内 AI 小白能理解的内容。支持后续科普、视频和六图笔记。

## 当前内容

首批两条用户样本已于 2026-11-03 合入 main，见 [样本索引](library/index.json)。Grok 与 Codex 的文字及 PNG 跨端交接已验证；Codex 已读取原文、用户评价和分析，并查看样本图片。详见 [两条样本初审](reviews/codex-two-samples-20261103-v001.md)。归档标签不代表工具已实测或正式内容已验收，选帖偏好仍随用户反馈修正。

2026-11-12 新增一期 AI 个人 IP 成片：阿泽 · Codex 三步换 DeepSeek（v001）。
成片、字幕、合成源码和质检说明在 [productions/ai-ip-episode-codex-ccswitch-20261111](productions/ai-ip-episode-codex-ccswitch-20261111/)。

## 文件位置

- sources/：每条帖子一个独立目录，保留原文、真实截图、原始附件和来源表。
- library/index.json：样本索引。收到真实帖子后增量添加，保留既有 ID。
- preferences/：用户明确表达的关注点与模型推测分开保存。
- reviews/：Codex 的核查和选题判断。
- productions/：后续文案与制作文件。
- handoff/：读写测试和交接回执。

未收到材料时不造空帖子凑数。用户没有解释选帖理由时可以先收录，用户评价留空，不由模型编写为用户意见。

## 交接测试

handoff/codex-check-v001.md 和 handoff/fixture-original-post.png 是测试文件。PNG 是既有历史原帖的逐字节副本，只用于验证图片读写，不是本轮两条样本之一，也不计入索引。

请 Grok 实际读取文字和 PNG，再新建 handoff/grok-check-v001.md，写明文字中的校验标识、图片里原帖的第一句、实际读取方式及是否成功读到图像。不能读取图片时如实报告。提交成功后返回仓库链接、提交 SHA 和新增文件路径。

确认两端读写成功后，再把已整理的两条帖子原文、原始截图、用户评价和分析分别放入 sources/，更新索引并写交接回执。文件缺失项写明原因，不生成仿截图。

GitHub 更新后，由用户告知 Codex 读取；此初始化包不配置自动触发、定时任务或付费服务。
