# 抖音等平台视频素材总池

长期、可增量扩展的视频素材库。底层按 `platform + video_id` 去重；主题通过 `topic-links/` 多对多引用，不复制底层记录。

原始专题研究包仍保留在 `topics/`（例如 `topics/codex-vs-workbuddy/research/2026-11-09/`），本目录不覆盖、不删除那些原件。

## 路径

| 路径 | 用途 |
|---|---|
| `videos.csv` | 当前权威快照（表格友好） |
| `videos.jsonl` | 与 CSV 同行内容，便于追加/脚本 |
| `history/events.jsonl` | 追加式变更事件（创建/update），永不改写旧行 |
| `topic-links/<topic>.jsonl` | 主题 → 视频引用 |
| `import/<date>-*/` | 某次导入的报告与统计 |
| `SCHEMA.md` | 字段与证据等级 |
| `MAINTENANCE.md` | 日常增量与 Codex 调度流程 |

## 规则（硬性）

1. 以 `platform + video_id` 为唯一键；保留原始 `video_url`。
2. 平台显示什么记什么；不可见写空或「未公开/无法获取」语义（CSV 用空字段，`provenance_note` 可注明）。
3. 不编造互动数、时长、发布时间。
4. 证据等级只升不降（除非人工复核降级并写 event）。
5. 多主题可引用同一视频；不在主题侧复制底层行。
6. 每次变更追加 `history/events.jsonl`；禁止静默覆盖历史。
7. 不在本池决定正式选题、精选名单或口播稿。

## 与既有 `library/` / `sources/` 的关系

- `library/index.json` + `sources/`：用户亲选样本（X 等），偏单条深档。
- `video-pool/`：平台检索型视频总池，规模更大、证据分层，服务自媒体选题研究。
- 二者并存；亲选样本若来自抖音，可后续用 topic-link 或 provenance 互指，本轮未合并。

## 首批导入

见 [import/2026-11-09-codex-workbuddy/Import_Report.md](import/2026-11-09-codex-workbuddy/Import_Report.md)。
