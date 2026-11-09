# Search_Coverage_Report — V2 搜索与轻核覆盖

- 基准日：2026-11-09（Asia/Shanghai）
- 依据文件：`search_pass1.md/.json`、`search_pass2.md/.json`、各 `light_verify_*.md/.json`、`Full_Pool_Audit.csv`

## 1. 关键词覆盖

### Pass1（8 + 额外 GrokBot）

Codex教程、Codex入门、Codex实战、WorkBuddy教程、WorkBuddy入门、WorkBuddy办公、Codex和WorkBuddy区别、GrokBot Codex；额外 GrokBot。

- Unique video_ids：**85**
- 已在 429 索引：51；相对 429 可能新：34

### Pass2（11 词 + 8 创作者主页）

关键词：Codex普通人、Codex自动化、Codex Skills、Codex真实案例、腾讯WorkBuddy、WorkBuddy实战、WorkBuddy Skills、WorkBuddy自动化、AI Agent怎么选、普通人如何使用AI Agent、WorkBuddy。

系统打开的创作者主页（仅这 8 个）：一只野生龙、诗诗的Ai视界、Keith今日休息吗、徐老师AI观察、谢慢慢97、非哥黑科技、生姜｜AI实战、FredTalk。

- 关键词 unique：**115**
- 关键词+主页 unique：**145**

### 与 429 池重叠（以 Full_Pool_Audit 为准）

| 口径 | 数量 |
|------|-----:|
| Pass2 抓到的不重复 ID | 145 |
| 已在 429 池 | **41** |
| 不在 429 池（新发现） | **104** |

**纠正**：pass2 文内「131 not in known set」是相对当时下发的 **25 个 ID 样本**，**不是**相对 429 全池。报告与 Decision_Brief 一律使用 **41/145 in pool、104 new**。

## 2. 排序限制（必须写明）

- **最新 / 最热：失败**。Pass1 在「Codex教程」上尝试：筛选 UI **没有** 最新/最热控件；URL `sort_type` / `publish_time` 参数会被剥掉。
- Pass2 **未再假装**切换成功，全部为默认 **综合 / 视频**。
- **因此：不能声称已完成完整「最新」榜覆盖。** 近窗样本仍受综合排序的互动偏向影响。

## 3. 轻量核验计数

| 批次 | 条数 | 说明 |
|------|-----:|------|
| light_verify_must5 | 5 | 强制重审 |
| light_verify_batch2 | 10 | 索引高赞未打开 |
| light_verify_batch3 | 13 | 继续索引未打开 |
| **小计（原库未打开）** | **28** | must5+batch2+batch3 |
| light_verify_search_new | 12 | 搜索高信号 |
| light_verify_pass2_new | 16 | pass2 新候选 |
| **合计（各批无 ID 重叠）** | **56** | 5+10+13+12+16；批间交集为 0 |

规则：不下载、不完整观看/转写、不翻评论、不发明数字；有章节则只抄页面可见「AI章节要点」。

## 4. Full_Pool_Audit.csv 变更说明（仍为 429 行）

**未**把 104 个库外新 ID 静默写进 Full_Pool_Audit 冒充原池。新 ID 只出现在本报告与 Candidate_Competition。

本轮更新了下列**原池内**行的 notes / flags / 详情字段（详见 `_full_pool_audit_changelog.json`）：

| video_id | 主要变更 |
|----------|----------|
| 7699819443685794426 | 安妮：relevance→high；纠正不相关；补详情指标；桶→30d |
| 7704514173656501542 | 徐老师6款：comparison_pool→yes；清掉 deprioritize；补详情 |
| 7652267273159314740 | Ai林爻：首次轻核；comparison_pool→yes；补超高赞藏 |
| 7689005697501179897 | 谢慢慢：桶 30d→**90d**；赞 48.8万；详情齐 |
| 7700093372661204367 | Keith：桶→30d；补藏/评/转 |
| 7696809745184771337 | 方老师：comparison_pool→yes；补详情 |
| 7668834052987784467 | 非哥：桶→**older_90**；补详情 |
| 7662035533354257683 | 珍妮：桶→**older_90**；relevance→high |
| 7700926672538730361 | 话多多：轻核为种草非教程 |
| 7704147659980477561 | 迪达拉：comparison_pool→yes；补详情 |
| 7693111158979003834 | 生姜知识库：comparison_pool→yes；补详情 |

## 5. 剩余覆盖缺口

1. **无「最新」排序**：近窗可能仍漏低互动但主题关键样本。
2. **未系统扫描的主页**：林粒粒、阿川、辰哥、迪达拉、表哥、RabbittuX、张卓仁、安妮说AI、方老师、时光漫记等——仅关键词/单条命中，无主页扫库。
3. **104 个库外新 ID** 大多只有搜索卡片，未全部轻核（只核了高信号子集）。
4. 成本/失败主题仍偏少：秋一「烧 60% 额度」等在 Reserve，传播弱。
