# 素材总池字段与证据等级

## 唯一键

`platform` + `video_id`

`platform` 取值示例：`douyin`、`douyin_jingxuan`。未知写 `unknown` 并在 notes 说明。

## `videos.csv` / `videos.jsonl` 字段

| 字段 | 说明 |
|---|---|
| platform | 平台 |
| video_id | 平台侧 ID |
| video_url | 原始链接（保留导入时 URL 形态） |
| title | 标题 |
| author | 作者显示名 |
| author_url | 作者主页；未知留空 |
| published_at_raw | 页面原文时间（含「3周前」等相对时间） |
| published_at_abs | 仅当页面给出绝对时间时填写（如 `2026-11-05 17:20`） |
| duration | 时长 |
| likes / comments / favorites / plays / shares | 互动；不可见留空 |
| evidence_level | 见下表 |
| collected_at | 本条当前字段写入/刷新时间（ISO，Asia/Shanghai） |
| first_seen_at | 首次入库时间 |
| last_seen_at | 最近一次在检索中再次见到 |
| last_metrics_at | 最近一次刷新互动数据的时间 |
| source_batch | 检索批次标签 |
| source_kind | `web_seed` / `douyin_search_card` / `douyin_detail` 等 |
| provenance_note | 采集来源说明 |
| core_points | 仅详情核验后填写的要点；搜索卡片勿用标题冒充 |
| notes | 备注、混称旗标等 |
| has_transcript_file | 研究包内是否有转写文件 |
| has_comments_file | 研究包内是否有评论文件 |
| research_ref | 关联研究日目录（若有） |

## 证据等级（由低到高）

| 等级 | 含义 | 允许写什么 |
|---|---|---|
| L0_web_seed | 网页摘要/外链种子，站内未核验 | URL、摘要标题线索；互动多不可信 |
| L1_search_card | 抖音搜索卡片可见 | 卡片上的标题、作者、相对时间、时长、点赞等 |
| L2_detail_verified | 详情页已人工/浏览器核验 | 详情页可见字段；可记评论/收藏等 |
| L3a_transcript_partial | 有章节要点/ASR/部分文稿 | 标明非全文；不可冒充完整分析 |
| L3b_transcript_full | 有完整可见文稿（如 AI 文稿全文） | 可引用全文要点 |
| L4_video_analyzed | 完整视频已观看分析 | 本阶段默认不用；需明确观影记录 |

升级规则：只升不降（人工复核降级必须写 `history/events.jsonl`，`event_type=evidence_downgrade`）。

## 主题链接 `topic-links/<slug>.jsonl`

每行一个 JSON：

- topic_slug
- platform, video_id
- link_role（如 `research_candidate`；**不是**精选）
- source_batch, legacy_category（研究包原分类，可空）
- linked_at, research_path, note

同一 video 可出现在多个 topic 文件中。

## 历史事件 `history/events.jsonl`

追加专用。常见 `event_type`：`create`、`metrics_update`、`field_update`、`evidence_upgrade`、`evidence_downgrade`、`topic_link_add`。

禁止改写或删除已有事件行。
