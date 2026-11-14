# X（Twitter）检索结果 — Codex 实战教程

- 检索日：2026-11-14（Asia/Shanghai）
- 工具：Grok Bot 内置公开 X 工具 `search_posts_all` / `get_posts_by_ids`（`x` 命名空间）
- 窗口：先近 14 天（start_time 2026-11-01T00:00:00Z），中文查询扩大到约 30 天（2026-10-16T00:00:00Z）
- 未编造互动数据。下列指标来自接口 `public_metrics`。时间原文为 UTC，下文化为 Asia/Shanghai。

## 总判断

**近 14–30 天的 X 上，几乎没有适合 Windows 普通用户、带清晰前后对比视频的高质量 Codex 办公实战教程。**

多数英文结果是：开发者讨论、安全新闻（不要在 Downloads 里启动 Codex）、产品营销、或「Office / organize / files」与 Codex 的弱共现。中文侧有若干「可以把 Codex 用来整理文件 / 处理表格 / 做小工具」的**经验帖或提示词**，互动量不大，且大多不是录屏教程。

下面只保留与本期选题真正相关的条目；其余查询记在附录，避免把噪声当成候选。

## 相对最有用的发现

### 1. @ai_suxiaole（苏乐）— 用 Codex 分类多年照片（提示词帖，不是录屏核验）

- 链接：https://x.com/ai_suxiaole/status/2119992425527771638
- 发布时间：2026-11-10 11:15（Asia/Shanghai；原文 2026-11-10T03:15:56Z）
- 互动（接口）：赞 24，转帖 2，回复 3，书签 22，曝光 2112
- 是否有视频：本帖未见视频附件；正文是长提示词
- 正文要点（来自完整 `note_tweet`，非推测）：
  - 场景：电脑里攒了几年、几千张混在一起的照片，按拍摄时间、地点、内容分类
  - 明确警告：不要只说「帮我整理这个文件夹」，范围太大，可能移动或重命名原图
  - 提示词要求：先扫描且不改原文件 → 生成分类建议，不确定进「待确认」→ 先随机 20 张做样本表格请用户确认 → 确认后再**复制**到新目录（原目录不动）→ 重名只改副本、不允许覆盖 → 出路径对照报告
- 可见回复（同对话）：
  - @hajimigz：「这得消耗多少 token，直接买个软件都划算」（赞 1）
  - @JustJingLuo：「外接硬盘也可以帮忙整理吧」
  - @growaiskills：「没有 EXIF 的照片，别用修改时间硬凑日期，先放待确认。」
- 证据标签：公开帖全文。**没有**作者录屏或前后文件夹截图被本轮核验。不能写成「已演示整理了几千张照片」。
- 对本期的价值：选题方向与「批量归档照片」高度同向，而且提示词已经包含可复用的安全护栏（先抽样、只复制、出报告）。适合作为 B 组参考，不适合当作已看过的对标视频。
- 栈兼容：整理照片依赖读 EXIF / 读图内容 / 复制文件。文件操作在 Codex 能调用本地工具时**有可能**在 DeepSeek 路径下工作；读图/视觉分类是否可用取决于所用 DeepSeek 接口是否带视觉，**uncertain，需要实测**。帖中未声明模型。

### 2. @Leo_zhang2018（Better Call AI）— 使用场景清单，不是演示

- 链接：https://x.com/Leo_zhang2018/status/2118448987376427379
- 发布时间：2026-11-06 05:02（Asia/Shanghai；原文 2026-11-05T21:02:52Z）
- 互动：赞 7，书签 1，回复 8，曝光 662
- 全文列举的可尝试场景（作者自己的主张，不是本轮观看的演示）：① 批量整理文件（先分析目录再生成整理脚本）；② 处理 Excel/CSV；③ 搭建个人网页或小工具；④ 协助管理 VPS（同时警告勿直接执行高危操作）；⑤ 把重复工作变成自动流程。并写「AI 能写出代码，不代表代码一定可靠」。
- 一条回复（@clyve2022，2026-11-06 05:07 Asia/Shanghai）提到自己每天几十条视频，希望 Codex 按目录分析再生成整理脚本；这是需求，不是教程。
- 证据标签：公开长帖。无随附演示视频被核验。不可当作「已验证的办公实战片」。

### 3. @kuibenge（亏本哥）— 小工具选题念头

- 链接：https://x.com/kuibenge/status/2119354305073262698
- 发布时间：2026-11-08 17:00（Asia/Shanghai；原文 2026-11-08T09:00:16Z）
- 互动：赞 1，回复 1，曝光 45
- 主张：用 Codex 做网页小工具（尺寸换算、报价计算、发票整理、PDF 批量处理）比一上来做大型 SaaS 更合适。
- 无演示、几乎无传播。只作选题灵感，不进 16 条视频候选。

## 有提及、但质量不够或偏题的中文帖

| 链接 | 时间（Asia/Shanghai） | 互动 | 说明 |
|---|---|---|---|
| https://x.com/helen_yu16159/status/2116883370353524997 | 2026-11-01 21:21 | 赞 0，曝光 2 | 「不会写代码，Codex 能拿来干什么」列出网页原型、小工具、整理 Excel。账号几乎无粉丝，无演示。 |
| https://x.com/MasoNKai720/status/2115999697106293197 | 2026-10-30 10:50 | 赞 1 | 回复中提到自己在用 Codex 打磨开源小工具；对方场景是达芬奇素材按日期归档。非教程。 |
| https://x.com/sulaiman1566/status/2113902077525066119 | 2026-10-24 15:55 | 赞 2 | 声称 Codex 可批量整理文件、检查编号；带 @GamsGo_Global，像推广。无独立演示核验。 |
| https://x.com/idoplz/status/2115671485872226322 | 2026-10-29 13:06 | 赞 0 | 夸克网盘「Codex+多维表格+WorkBuddy」课程广告，不是单条可引用的优质教程。 |
| https://x.com/lindanyster/status/2120055036583788903 | 2026-11-10 15:24 | 赞 0 | 类似「零基础智能体课」导流，WorkBuddy + Codex。 |
| https://x.com/gankuaisuxing/status/2117626134863241490 与 https://x.com/itiswwd/status/2117491679024320721 | 2026-11-03 | 赞 2 / 0 | 用户反馈 Codex 桌面端发送 Excel 附件失败（Windows）。不是教程，但说明官方桌面+Excel 附件路径近期有故障投诉，和「让 Codex 处理表格」不是同一件事，却提示不要假设官方附件功能稳定。 |

## 英文检索的主要噪声（不是本期候选）

用 `("OpenAI Codex" OR "ChatGPT Codex")` 加 Excel/PDF/organize，以及 `Codex organize/rename/Downloads` 等查询后，高曝光结果几乎都是：

- **安全警报**：Forever Security 等报告称，Downloads 里的恶意 `AGENTS.md` 可能劫持 Codex / Claude Code。例如 https://x.com/The_Cyber_News/status/2114771540352893196（2026-10-27 01:30 Asia/Shanghai；赞 759，转 237，书签 955，曝光 416925）。这对「整理下载文件夹」选题是**风险提示**（见 `compatibility_notes.md`），不是教程。
- Simular Box、Vercel agent-desktop、开源 Office skill 仓库等产品帖：例如 https://x.com/SakshamCodes01/status/2120516342336123106 称 Claude Code 或 Codex 可向磁盘写 docx/xlsx/pptx，但互动极低（赞 2），且不是面向普通 Windows 用户的分步教程。
- 额度、登录 bug、模型名称、假冒 App Store 应用等。

没有找到一条近期、高互动、带完整办公任务前后对比的英文 Codex 录屏教程，可诚实写入 16 条。

## 检索式（便于复查）

1. `Codex (file OR files OR excel OR spreadsheet OR PDF OR organize OR rename OR "office" OR folder) (tutorial OR demo OR how) -is:retweet lang:en`，start 2026-11-01
2. `("OpenAI Codex" OR "ChatGPT Codex" OR "Codex app" OR "Codex desktop") (Excel OR spreadsheet OR PDF OR Word OR "organize files" OR rename OR paperwork) -is:retweet`，start 2026-11-01
3. `Codex (整理文件 OR 批量 OR Excel OR 表格 OR PDF OR 办公 OR 小工具 OR 重命名 OR 归档 OR 实战教程 OR 不用编程) -is:retweet`，start 2026-10-16
4. `Codex ("organize" OR "rename" OR "Downloads folder" OR "batch rename" OR "sort my files" OR "photo folder") (files OR folder OR photos OR desktop) -is:retweet`，start 2026-10-16
5. 对关键帖做了 `conversation_id:2119992425527771638` 和 `get_posts_by_ids`

未再做更大规模翻页；当前结果已经足以判断「X 侧偏薄」。
