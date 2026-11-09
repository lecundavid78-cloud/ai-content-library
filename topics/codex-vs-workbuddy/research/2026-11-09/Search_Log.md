# Search_Log — Codex vs WorkBuddy 抖音内容调研

- 研究基准日：2026-11-09（Asia/Shanghai）
- 工作目录：`/workspace/douyin-codex-workbuddy-research/`
- 原则：只记录可访问证据；不可见数据标「未公开/无法获取」；不为凑数编造

## 时间范围

| 层级 | 窗口 | 说明 |
|------|------|------|
| 重点 | 2026-10-26 ~ 2026-11-09 | 最近 14 天 |
| 扩展 | 最近 30 天 | |
| 补充 | 最近 90 天 | 高热度教程与代表性内容 |

## 检索通道

| 通道 | 状态 | 备注 |
|------|------|------|
| 抖音网页端浏览器 | 搜索 batch1+2 完成；详情深挖 batch1+batch2 共30条完成；最新排序未通 | 无抖音 connector/plugin，走 box 桌面浏览器 |
| 官方文档 / WebFetch | 已完成首轮（Evidence.md）；有变更再复核 | Codex、WorkBuddy 产品事实核查 |
| 网页二手索引（文章/榜单） | 待用 | 仅作线索，视频仍需原始链接核验 |
| 用户本机出口（Route traffic） | 当前离线 | 系统提示用户电脑离线，浏览不经用户网络 |

## 关键词组执行记录

（按批追加）


## 批次 parent-web-seeds（2026-11-09 15:16 CST）

- 方式：WebSearch 公开索引页（非抖音站内排序页）
- 结果：16 条可点开的 douyin.com / jingxuan.douyin.com 视频 URL，写入 `raw/parent_web_seeds.jsonl`
- 缺口：互动数据、作者主页、完整发布时间多数未在搜索摘要中；需网页端核验
- 注意：这些是线索种子，证据状态暂为「网页摘要可见，站内未核验」

## 官方核查与网页种子（2026-11-09 Asia/Shanghai）

### 执行摘要
- 通道：WebSearch + WebFetch（官方站/帮助中心/腾讯云文档/产品站）；抖音直链以公开网页索引为种子，**未**在本批完成抖音 App/完整网页端浏览归档。
- 产出：`Codex_vs_WorkBuddy_Evidence.md`；`raw/web_seed_videos.jsonl`（去重后 **37** 条公开抖音 URL）；`Douyin_Video_Index.csv`（仅表头，待抖音端核验后填行）。
- 原则：不编造视频 ID；不凭标题估算互动数据；不下「谁更好」结论。

### 已抓取 / 已打开的官方与准官方页面

| URL | 访问日 | 用途 |
|-----|--------|------|
| https://openai.com/index/introducing-the-codex-app/ | 2026-11-09 | Codex App 定位、Skills、Automations、安全默认、可用性 |
| https://chatgpt.com/codex/ | 2026-11-09 | Codex 产品卖点、多端、云任务、多 Agent |
| https://chatgpt.com/codex/pricing/ | 2026-11-09 | 含在 ChatGPT 套餐、模型用量区间、Credits |
| https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan | 2026-11-09 | 计划可用性、CLI/Cloud/Desktop、失败模式、数据控制 |
| https://learn.chatgpt.com/docs/computer-use | 2026-11-09 | Computer Use / 权限 / 地区限制（EEA/UK/CH 等） |
| https://developers.openai.com/codex/app → 落到 ChatGPT desktop app 文档 | 2026-11-09 | 桌面端安装与文件/浏览器工作流 |
| https://help.openai.com/en/articles/7947663-chatgpt-supported-countries | 2026-11-09 | 支持国家列表（**不含中国大陆**；含台湾） |
| https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide | 2026-11-09 | WorkBuddy 产品定位与差异化 |
| https://www.workbuddy.cn/docs/workbuddy/Pricing | 2026-11-09 | 体验版/标准/高级/旗舰积分与价格 |
| https://www.workbuddy.cn/llms.txt | 2026-11-09 | 官方 LLM 可读产品摘要：模式、Skills/MCP、免费额度政策、与 CodeBuddy 关系 |
| https://www.codebuddy.cn/work/ | 2026-11-09 | 下载入口、腾讯生态、安全认证表述 |
| https://www.tencentcloud.com/products/workbuddy | 2026-11-09 | 国际站产品能力描述 |
| https://cloud.tencent.com/document/product/1831/134329 | 2026-11-09 | Enterprise 矩阵：**CodeBuddy ≠ WorkBuddy** |
| https://mp.weixin.qq.com/s/jepj-IFv3UR9LpZlt-h82w | 2026-11-09 | 内测期微信公众号介绍与场景 Prompt |

### 网页种子检索（公开抖音 URL）

关键词/查询（节选）：
- `site:douyin.com/video Codex OR WorkBuddy OR 腾讯龙虾`
- `"douyin.com/video" WorkBuddy OR Codex 教程`
- `site:douyin.com/video Codex 教程 OR Skill OR 额度`
- `site:douyin.com/video WorkBuddy PPT OR Excel OR 办公 OR 积分 OR 崩溃`
- `site:douyin.com/shipin WorkBuddy OR Codex OR 龙虾`
- `"douyin.com/video/" Codex WorkBuddy` 对比类

结果：
- 去重后写入 **37** 条 `raw/web_seed_videos.jsonl`。
- 其中部分条目仅有数字 ID、标题摘要缺失（已在 JSONL `title_or_snippet` 标明待核验）。
- 若干条目经 WebFetch 可读到口播/字幕类文本（例如 `shipin/7645490372877191222`、`shipin/7642179852850087977`、`shipin/7617642990248724489`）；多数 `video/` 页抓取为空或需登录/客户端，**互动数据未写入索引**。
- 覆盖主题：Codex 教程/Skill、WorkBuddy 入门/办公/踩坑、WorkBuddy vs Codex、WorkBuddy vs QClaw、腾讯产品矩阵、额度/稳定性抱怨。
- **时间窗口缺口**：公开网页索引返回的日期多落在 2026-03～09；**重点窗口 2026-10-26～11-09 的高互动新片本批几乎未从网页索引命中**，需抖音端「最新」排序补搜。

### 缺口
1. 抖音网页端登录后搜索、最新/热门排序、创作者主页扩展——本批未完成。
2. 评论区结构化抓取、完整字幕转写批量归档——仅个别 shipin 页有可读正文。
3. Codex 在中国大陆的「实际连通性/社区绕行方案」仅能引用官方支持地区列表；具体第三方教程不作为产品事实。
4. WorkBuddy `llms.txt` 与 Pricing 页对免费积分数字（首登赠送 vs 体验版月 500）表述维度不同，需在证据文中并列注明，勿混为一谈。
5. 第三方对比文（如 toolvori.com、171host.com）仅作线索，不写入产品证据主表结论。


## 批次 merge-index-v1（2026-11-09 ~15:20 CST）

- 合并 `batch1_videos.jsonl` + 网页种子 → `Douyin_Video_Index.csv`
- 浏览器端搜索页可访问（无登录墙/验证码挡住结果），见 `raw/batch1_douyin_search.md`
- 排序：默认综合/视频；最新/最热控件本轮未稳定点到，记入缺口

## 关键词组执行记录 — Batch1（2026-11-09）

| # | 关键词 | URL | 状态 | 卡片数(含重复跨搜索) | 截图 |
|---|---|---|---|---|---|
| 1 | Codex 教程 | /search/Codex%20教程?type=video | OK | 40 | screenshots/batch1_codex_教程.png |
| 2 | WorkBuddy | /search/WorkBuddy?type=video | OK | 28 | screenshots/batch1_workbuddy.png |
| 3 | 腾讯龙虾 | /search/腾讯龙虾?type=video | OK | 30 | screenshots/batch1_腾讯龙虾.png |
| 4 | Codex WorkBuddy | /search/Codex%20WorkBuddy?type=video | OK | 29 | screenshots/batch1_codex_workbuddy.png |
| 5 | AI智能体哪个好 | /search/AI智能体哪个好?type=video | OK | 30 | screenshots/batch1_ai智能体哪个好.png |

- 原始记录：`raw/batch1_douyin_search.md`、`raw/batch1_videos.jsonl`
- 去重后约 157 条视频 URL；作者约 142 个
- 排序：默认综合/视频；筛选「最新」未成功切换
- 已知链接：1 条加载失败(404/卡住)，2 条详情页成功
- 产品区分注意：@未来博士wepon 一条把 CodeBuddy 与 WorkBuddy 说成「一个产品两个版本」——已标记，不可混用


## 批次 deliverables-v1（2026-11-09 ~15:22 CST）

- 动作：仅基于已有文件撰写/更新交付文，**未**新开抖音搜索、**未**编造评论/指标
- 新增/更新：
  - `Top_Videos_Analysis.md` — 方法论 L1/L2/L3；徐老师 `7645490372877191222` 完整拆解（L2 页面互动 + L3 AI文稿）；`top_candidates_v1.json` 28 条 L1 stub；CodeBuddy 混用旗标
  - `Audience_Pain_Points.md` — 标题+唯一转写主题分层（A 观察 / B 假设 / C 付费信号）；全库无「六六六领资料」命中，未引用
  - `First_Episode_Opportunities.md` — 三个角度（交付物框架 / 上路成本 / 身份澄清）；不下谁更好结论
  - `Research_Gaps.md` — WebFetch/video 空页、已知 shipin 404 样例、最新排序未切、评论缺失、积分双口径、用户机离线出口等
- 仍阻塞：浏览器批量深挖详情与评论、「最新」排序补搜、客户端积分当日截图

## 关键词组执行记录 — Batch2（2026-11-09）

| # | 关键词 | URL | 状态 | 卡片数 | 截图 |
|---|---|---|---|---|---|
| 1 | Codex vs WorkBuddy | Codex%20vs%20WorkBuddy?type=video | OK | 29 | screenshots/batch2_codex_vs_workbuddy.png |
| 2 | Codex 和 WorkBuddy 区别 | Codex%20和%20WorkBuddy%20区别?type=video | OK | 30 | screenshots/batch2_codex_和_workbuddy_区别.png |
| 3 | WorkBuddy 教程 | WorkBuddy%20教程?type=video | OK | 28 | screenshots/batch2_workbuddy_教程.png |
| 4 | WorkBuddy 入门 | WorkBuddy%20入门?type=video | OK | 27 | screenshots/batch2_workbuddy_入门.png |
| 5 | AI 自动制作 PPT | AI%20自动制作%20PPT?type=video | OK | 30 | screenshots/batch2_ai_自动制作_ppt.png |
| 6 | AI 一人公司 | AI%20一人公司?type=video | OK | 30 | screenshots/batch2_ai_一人公司.png |
| 7 | AI 智能体 落地 | AI%20智能体%20落地?type=video | OK | 29 | screenshots/batch2_ai_智能体_落地.png |
| 8 | Codex 普通人 | Codex%20普通人?type=video | OK | 30 | screenshots/batch2_codex_普通人.png |
| 9 | WorkBuddy 办公 | WorkBuddy%20办公?type=video | OK | 28 | screenshots/batch2_workbuddy_办公.png |
| 10 | 电脑 AI 智能体 | 电脑%20AI%20智能体?type=video | OK | 30 | screenshots/batch2_电脑_ai_智能体.png |

- 原始记录：`raw/batch2_douyin_search.md`、`raw/batch2_videos.jsonl`
- 本批写入 JSONL（相对 batch1 去重新增）约 **236** 条唯一 URL
- 10 次搜索合计观察到卡片（含跨搜索重复）**291**；搜索集合内唯一约 **262**
- 排序：默认综合/视频；筛选「最新」**未成功**（面板未暴露 最新/最热/最新发布）
- 创作者轻探：徐老师AI观察、林粒粒呀、时光漫记、嘟嘟DuDu（video search；主页 user 链误入 self，已改）
- 产品区分：结果中出现 WorkBuddy VS CodeBuddy 条目，已按标题如实记录，不与 WorkBuddy 办公智能体混同

## 批次 merge-index-v2（2026-11-09 ~15:27 CST）

- 合并 batch1+batch2+网页种子 → 更新 `Douyin_Video_Index.csv`
- 刷新 `raw/top_candidates_v2.json`（30 条深挖候选）
- Batch2：「最新」排序仍不可用



## Deep dive batch1 — VIDEO DETAIL pages（2026-11-09 Asia/Shanghai）

- 通道：抖音网页端详情页（box Chrome / Playwright），逐条打开 Priority URL
- 产出：
  - `raw/deep_dive_batch1.md`（结构化笔记）
  - `raw/deep_dive_batch1.jsonl`（每视频一行摘要）
  - `raw/transcripts/*`（章节要点 / AI文稿可见文本）
  - `raw/comments/*`（可见评论摘录）
  - `screenshots/deep1_*.png`
- 结果计数：尝试 **14** 条；成功 OK **14**；404 **0**；登录/验证码阻断 **0**（#9 首次导航超时后重试成功）
- 文稿：有独立/章节文本文件 **14**（其中 #8 含完整 AI文稿粘贴；其余多为「章节要点」）
- 评论文件：**14**（含 0 评占位）
- 原则复核：未编造互动数；播放量页面均未展示→「未公开/无法获取」；未见 CodeBuddy IDE 与 WorkBuddy 混称；#3 的 ChatGPT Work 模式已标注≠WorkBuddy
- 站内隐藏 agent 文案：页面 DOM 存在面向 AI agent 的隐藏说明，已忽略未执行



## 批次 deliverables-v2-deep1（2026-11-09 ~15:40+ CST）

- 动作：仅消费 `raw/deep_dive_batch1.*`、transcripts、comments；**不**编造指标；batch2 深挖文件为空 → 标明 pending
- 更新：
  - `Douyin_Video_Index.csv` — 14 条：`evidence_status=详情页已核验`；回填评/藏/绝对时间/core_points/is_howto
  - `Top_Videos_Analysis.md` — 14 条升为完整拆解；其余保持 stub
  - `Audience_Pain_Points.md` — 按主题聚类真实评论（含赞 295「为何不用 WB 调 DeepSeek」）
  - `First_Episode_Opportunities.md` — 三角度按新评论刷新；仍不下谁更好
  - `Research_Gaps.md` — 深挖进度、播放量仍隐、章节要点≠全文、batch2 pending、最新排序仍缺、隐藏 agent 文案已忽略（不引正文）
  - `exports/README.md` + 打包 zip
- 未改：`Codex_vs_WorkBuddy_Evidence.md` 产品事实表（本轮无新官方抓取）
- 检索通道状态刷新：抖音浏览器深挖 batch1 **完成**；batch2 **未开始**；「最新」排序 **仍不可用**


## Deep dive batch2 — VIDEO DETAIL pages（2026-11-09 Asia/Shanghai）

- 通道：抖音网页端详情页（box Chrome / Playwright），逐条打开 Priority URL（16）
- 产出：
  - `raw/deep_dive_batch2.md`（结构化笔记）
  - `raw/deep_dive_batch2.jsonl`（每视频一行摘要，schema 同 batch1）
  - `raw/transcripts/*`（章节要点 / caption；短片无面板则记 none）
  - `raw/comments/*`（可见评论摘录；优先安装/付费/网络/区别/稳定性/用途）
  - `screenshots/deep2_*.png`
- 结果计数：尝试 **16** 条；成功 OK **16**；404 **0**；登录/验证码阻断 **0**
- 文稿：有文本文件 **16**（其中短片 #11/#14/#15 及 #16 无独立章节要点，记 caption/none）
- 评论文件：**16**
- 原则复核：未编造互动数；播放量均「未公开/无法获取」；隐藏 agent 文案已忽略
- CodeBuddy 混称：仅 **#1** 章节要点出现「Codex或CodeBuddy」→ 标是；其余未见 CodeBuddy 字符串（#15 标题「cc」更像 Claude Code，证据不足不记混称）
- 评论主题线索：GitHub 连不上、Codex 翻墙/登录不稳、积分/付费、WorkBuddy 本土化/普通人够用


## Deep dive batch2 — VIDEO DETAIL pages（2026-11-09 Asia/Shanghai）

- 结果：尝试并成功 OK **16**；产出 `raw/deep_dive_batch2.md/.jsonl`、对应 transcripts/comments、`screenshots/deep2_*.png`
- CodeBuddy 混称：**仅** `7697803412368280866`
- 播放量：均未展示
- 「最新」排序：仍不可用

## 批次 deliverables-v3-deep1+2（2026-11-09）

- CSV：30 条 `详情页已核验`
- Top / Pain / Opportunities / Gaps / Search_Log / exports README + zip 已按 30 条刷新
- Evidence.md 产品事实表未改（无新官方抓取）
