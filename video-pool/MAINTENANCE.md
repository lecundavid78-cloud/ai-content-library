# 长期增量维护机制

## 谁跑什么

| 节奏 | 执行方 | 做什么 |
|---|---|---|
| 每个工作日上午 | Grok Bot「抖音发现」例行任务 | 抖音网页增量检索（优先关键词见下），只追加新 `platform+video_id`，更新 `last_seen_at` |
| 每周一 | 同上 | 对重点视频（L2+ 或近 14 天高赞候选）刷新详情互动；写 `metrics_update` 事件 |
| 发现新热词/创作者 | 例行任务可记入缺口 | **扩展搜索词可以**；**不自主定正式选题/精选名单** |
| 合入仓库 | Cloud Agent / PR | 把本机变更推到 `ai-content-library` 的 `video-pool/` |

## 优先关键词（可增补，非选题）

AI 工具、AI Agent、Codex、WorkBuddy、GrokBot、AI 自动化、AI 获客、一人公司、以及既有对比/教程变体。

## 增量写入步骤（每次）

1. 读取仓库最新 `video-pool/videos.jsonl`（或 CSV）。
2. 检索只收集平台可见字段；不可见留空。
3. 对新 ID：追加一行到 `videos.jsonl`/`videos.csv`，并追加一条 `create` 事件。
4. 对已有 ID：若互动或标题等变化，更新当前快照对应字段，追加 `metrics_update` 或 `field_update`（带旧值→新值）。
5. 需要挂主题时只改 `topic-links/`，不复制底层行。
6. **禁止**整库重生成后覆盖；禁止删除 `history/events.jsonl` 旧行；禁止覆盖 `topics/` 原始研究包。
7. 提交 PR（默认不自动合 main，除非用户明确要求）。

## Grok Bot 例行任务

本代理可创建定时 routine（工作日检索 + 周一互动刷新）。例行跑在对话侧，**不会**在无浏览器会话时凭空 invent 数据；若抖音页打不开，当次只写缺口报告，不造行。

## 给 Codex 的调度流程（无 Grok 例行或需补跑时）

把下面当作可复制的 Codex / Cloud Agent 任务说明：

```text
目标：增量更新 https://github.com/lecundavid78-cloud/ai-content-library 的 video-pool/
约束：
- 只追加新 platform+video_id；已有记录仅更新变化字段并写 history/events.jsonl
- 不重生成整库；不删历史；不覆盖 topics/ 研究原件
- 不写口播稿；不定正式选题；不自定精选名单
- 不可见字段留空，不编造
步骤：
1. 拉最新 main 或指定分支上的 video-pool/
2. 按 MAINTENANCE.md 关键词做抖音网页检索（或消费 Grok 交来的 JSONL 增量包）
3. 合并进 videos.csv / videos.jsonl
4. 追加 events；必要时更新 topic-links
5. 写 import/<date>-incremental/Import_Report.md（新增条数、更新条数、缺口）
6. 开 PR，正文附路径清单；默认不合 main
验收：Import_Report 数字与 events 条数一致；唯一键无重复。
```

若只有 Grok 产出的增量包（CSV/JSONL），Codex 可跳过浏览器，只做合并与 PR。

## 本阶段明确不做

- 口播稿、最终选题、精选视频名单
- 用标题或 AI 章节摘要冒充完整内容分析
- 为凑数编造数据
