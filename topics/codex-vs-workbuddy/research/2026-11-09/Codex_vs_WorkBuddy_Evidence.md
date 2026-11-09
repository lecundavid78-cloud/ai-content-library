# Codex vs WorkBuddy — 官方与可核验证据对照

- 访问基准日：`2026-11-09`（Asia/Shanghai）
- 原则：只记录本批 WebFetch/官方页面可见内容；**不下「谁更好」结论**；与 CodeBuddy IDE 严格区分。
- 证据状态：产品宣传页 ≠ 独立实测；互动类抖音内容另见视频索引/种子文件。

---

## 0. 产品身份澄清（必须先读）

| 名称 | 出品 | 官方定位摘要 | 证据 |
|------|------|--------------|------|
| **OpenAI Codex** | OpenAI | 编码 Agent / 多端「用代码把事做完」的 agent；已扩展到 Skills、办公文档技能、Computer Use、Automations | [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)（文内标 Feb 2, 2026；含 Mar 4, 2026 Windows 更新）；[chatgpt.com/codex](https://chatgpt.com/codex/) |
| **腾讯 WorkBuddy** | 腾讯云 CodeBuddy 团队 | 「全场景职场 AI 智能体桌面工作台」；自然语言下达任务、本地文件实操、可验收交付 | [产品介绍](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide)；[llms.txt](https://www.workbuddy.cn/llms.txt) |
| **腾讯 CodeBuddy** | 同团队另一产品线 | 「AI 原生全流程编程工具」（IDE / 插件 / CLI） | [WorkBuddy Enterprise 产品概述](https://cloud.tencent.com/document/product/1831/134329)（更新 2026-09-21）明确三产品矩阵：CodeBuddy / WorkBuddy / Managed Agents |
| **「腾讯龙虾」** | 俗称，非独立官方产品名 | `llms.txt` 写明 WorkBuddy 中文俗称「小龙虾」；社区亦用「龙虾」指 OpenClaw/QClaw 等，**检索时易混** | [llms.txt](https://www.workbuddy.cn/llms.txt)；社区视频种子另见 `raw/web_seed_videos.jsonl` |

> 结论性事实（非优劣判断）：**WorkBuddy ≠ CodeBuddy IDE**；官方矩阵里二者并列、积分可共享（见定价页说明）。

---

## 1. 定位与目标用户

### Codex
- 官网叙事：从「写代码的 agent」演进为「用代码在电脑上把事做完」；Codex app 定位为并行管理多 agent、长时任务的「command center」。
- 目标用户表述偏开发者与构建者，但 Skills 文档示例已覆盖文档/表格/图像等知识工作。
- **来源**：https://openai.com/index/introducing-the-codex-app/ ；访问 2026-11-09。页面原文要点：*“Codex is evolving from an agent that writes code into one that uses code to get work done on your computer.”*；并列出 Create documents（PDF / spreadsheet / docx）等 Skills。

### WorkBuddy
- 一句话定位：腾讯推出的全场景职场 AI 智能体桌面工作台，适配全职场角色；可自主规划执行多模态复杂办公任务。
- 微信内测文强调「尤其面向技术小白职场群体」。
- Enterprise 文档目标用户：职场全职能（产品、运营、研发、职能等）。
- **来源**：https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide ；https://mp.weixin.qq.com/s/jepj-IFv3UR9LpZlt-h82w ；https://cloud.tencent.com/document/product/1831/134329 ；均访问 2026-11-09。

---

## 2. 国内（中国大陆）注册与访问

### Codex / ChatGPT
- Codex 通过 ChatGPT 账号登录使用（Help Center）。
- OpenAI《ChatGPT Supported Countries》列表（访问 2026-11-09）包含大量国家/地区，**可见列表中无 “China” / 中国大陆；含 “Taiwan”**。页面声明：在列表外访问可能导致账号封禁或暂停。
- **来源**：https://help.openai.com/en/articles/7947663-chatgpt-supported-countries ；https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan 。
- **本批未核验**：用户实际跨境网络路径、第三方代充等——不写入产品能力表。

### WorkBuddy
- 国内站可下载客户端；`codebuddy.cn/work` 提供 macOS / Windows（及页面可见 Linux）下载；登录侧为腾讯云账号体系（`llms.txt` 指向 workbuddy.cn/login）。
- 公测时间：`llms.txt` 写「2026 年 3 月 9 日正式公测」。
- **来源**：https://www.codebuddy.cn/work/ ；https://www.workbuddy.cn/llms.txt ；访问 2026-11-09。

---

## 3. 安装与学习曲线（官方表述）

### Codex
- 入口：ChatGPT desktop app（Codex 模式）、Codex CLI、IDE extension、Codex web、Codex Cloud（资格因计划而异）。
- 桌面端：下载 ChatGPT for macOS / Windows / Linux → 登录 → 选 Codex / 打开文件夹。
- 学习成本官方未量化；能力面含 sandbox 权限、Skills、Computer Use、Automations，对非技术用户有配置面。
- **来源**：Help Center Codex 文；https://developers.openai.com/codex/app（落地为 ChatGPT desktop app 文档）；访问 2026-11-09。

### WorkBuddy
- 官方主张「零部署、开箱即用」；`llms.txt`：「下载安装到接入企业微信最快 1 分钟」。
- 三种模式：Craft / Plan / Ask（执行 / 先计划后执行 / 只问答不改文件）。
- **来源**：https://www.workbuddy.cn/llms.txt ；产品介绍页；访问 2026-11-09。

---

## 4. 免费额度 / 定价 / 限制

### Codex（随 ChatGPT 套餐）
- Pricing 页：Codex included in Free, Go, Plus, Pro, Business, Enterprise。
- Plus：Expanded Codex usage；Codex app for macOS and Windows；Plugins（Slack/GitHub/Figma 等）。
- Pro：Maximum Codex tasks；更高档位模型额度。
- 有模型用量区间表（如 Plus 上不同模型 5–3000 不等的区间数字，页面为表格）；Local messages 与 cloud chats 共享 allowance；可购 Credits。
- Help Center：Free/Go 含 Codex；**Codex Cloud 不含 Free/Go**（Plus 等视 rollout）。
- App 发布文：限时 Free/Go 含 Codex，并曾对付费计划加倍 rate limits（时效以原文「limited time」为准，本批无法确认是否仍有效）。
- **来源**：https://chatgpt.com/codex/pricing/ ；https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan ；https://openai.com/index/introducing-the-codex-app/ ；访问 2026-11-09。
- **美元标价**：Pricing 页 FAQ 提到 Pro $100/$200、Business $20/$100 等与 GPT-6 Astra 配额关系——以该页当日展示为准。

### WorkBuddy（人民币积分）
- 定价页（国内个人版，标注自 2026-07-01 订阅升级）：

| 版本 | 月付 | 连续包月 | 连续包年 | 每月基础积分 | 说明页「每月实得（限时）」 |
|------|------|----------|----------|--------------|---------------------------|
| 体验版 | 免费 | — | — | 500 | 500 |
| 标准版 | 99 元 | 70 元 | 672 元/年 | 2,000 | 4,000（含限时加赠） |
| 高级版 | 199 元 | 140 元 | 1,344 元/年 | 4,000 | 9,000 |
| 旗舰版 | 999 元 | 700 元 | 6,720 元/年 | 20,000 | 50,000 |

- 另有：自动任务数量档位、项目数、资料库容量、CLI 访问（体验版无 CLI；标准版起有）、代码实时补全等。
- **明确说明**：WorkBuddy 与 CodeBuddy **同一账号积分共享，无需分别订阅**。
- 加量包：付费会员可购 1,000 积分 / 50 元 / 1 个月有效。
- `llms.txt` 另列「新用户首登 2300 积分」等活动向免费额度政策——**与定价页「体验版月 500」维度不同**，并存记录，勿直接相加当作长期保证。
- **来源**：https://www.workbuddy.cn/docs/workbuddy/Pricing ；https://www.workbuddy.cn/llms.txt ；访问 2026-11-09。

---

## 5. Office 文件（Word / Excel / PPT）

### Codex
- App 介绍明确 Skills：reading/creating/editing **PDF、spreadsheet、docx**（professional formatting）。
- Computer Use 文档：可对接 Microsoft Excel / PowerPoint add-in「for additional control」（设置页控件描述）。
- Desktop app 文档：可创建与检查 documents、spreadsheets 等。
- **来源**：Codex app 介绍；https://learn.chatgpt.com/docs/computer-use ；desktop app 文档；访问 2026-11-09。

### WorkBuddy
- 产品介绍：文档/表格/PPT 生成；本地文件夹授权后批量处理。
- 微信文场景 1：深度研究并本地生成 PPT；并写可生成 Docx/XLSX/PDF/MD。
- 国际站：多模态含 tables、code；本地读写文件。
- Enterprise：PPT/报告制作、文档生成、数据分析等。
- **来源**：产品介绍；微信文；https://www.tencentcloud.com/products/workbuddy ；Enterprise 概述；访问 2026-11-09。

---

## 6. 代码与软件开发

### Codex
- 核心叙事仍是软件工程：多文件编辑、PR review、cloud 环境、并行 agents、worktrees。
- **不是「只能写代码」**：官方明确 beyond code generation。
- **来源**：chatgpt.com/codex ；Codex app 介绍。

### WorkBuddy
- 定位主打办公，但能力描述含 code；`llms.txt` 典型场景含「Python 爬虫、自动化脚本、网页生成、API 联调」。
- 定价页含「代码实时补全」「注释生成代码」「CLI 访问支持（付费档）」。
- **不是「完全不能编程」**；与 **CodeBuddy**（专业编程产品线）分工不同。
- **来源**：llms.txt；Pricing；Enterprise 矩阵文。

---

## 7. 浏览器 / 桌面自动化

### Codex
- Browser use：内置浏览器 + Chrome extension；可点击、输入、截图验证；敏感操作需确认；文档写明内置浏览器**不能自动化文件上传**。
- Computer Use：在支持地区，macOS/Windows 上操控已授权桌面应用；需系统权限（macOS Screen Recording + Accessibility）；Windows 前台占用指针键盘。
- Record & Replay：把演示录成可复用 Skill（需 Computer Use；初始可用性排除 EU/瑞士/英国——Help Center）。
- Computer Use 文档：功能在 **EEA、英国、瑞士 launch 时不可用**（Codex app settings 搜索摘要亦提及）。
- **来源**：https://learn.chatgpt.com/docs/computer-use ；Help Center Codex 文；访问 2026-11-09。

### WorkBuddy
- 官方强调授权目录内本地文件读写、工具调用、云端任务（国际站：关闭客户端后云端可继续）。
- `llms.txt`：本地沙箱 + 云端沙箱；定时任务/自动化；企业微信/腾讯文档/会议集成。
- 微信文场景：桌面整理、垃圾文件清理（需授权）。
- **本批官方页未等同于「完整 GUI Computer Use」规格说明书**；桌面操控深度以实测/后续文档为准。
- **来源**：tencentcloud 产品页；llms.txt；微信文。

---

## 8. 多步骤与长时任务

### Codex
- 多 agent 并行、长时任务（小时/天/周量级叙事）、Automations 定时后台跑、Cloud 任务合盖后继续、review queue。
- **来源**：Codex app 介绍；chatgpt.com/codex。

### WorkBuddy
- 自主拆解多步骤；多 Agent 并行；Cloud Assistant「7x24 任务托管」（国际站文案）；Enterprise Managed Agents 面向托管运行。
- 模式上 Plan 模式支持先方案后执行。
- **来源**：产品介绍；tencentcloud；llms.txt；Enterprise 概述。

---

## 9. Skills / MCP / 扩展

### Codex
- Skills：指令+资源+脚本包；App 内管理；可进 repo 团队共享；示例含 Figma、Linear、部署、图像、文档技能。
- Plugins / MCP：Help Center 与开发者设置描述 Integrations & MCP（config.toml 共享 CLI/IDE）。
- Automations：计划任务 + 可选 skills。
- **来源**：Codex app 介绍；Help Center；开发者设置搜索摘要指向 developers.openai.com。

### WorkBuddy
- 产品介绍：主流 MCP Server 适配、Skills 技能包、模型切换、高危指令拦截。
- `llms.txt`：兼容 OpenClaw Skills；称接入 5000+ 技能包；可挂 MCP Server；自定义 API Key。
- **来源**：产品介绍；llms.txt。

---

## 10. 安全与权限

### Codex
- 默认系统级 sandbox；默认限制在工作文件夹/分支 + cached web search；提权需批准。
- Computer Use：按应用授权；Always allow 列表；截图与界面内容进入模型上下文；数据训练控制对 Business/Enterprise 默认不用于训练（Help Center FAQ）。
- Auto-review：安全检查不计入用量（ChatGPT 登录时）。
- **来源**：Codex app 介绍；Computer Use 文档；Help Center。

### WorkBuddy
- 文件操作需用户授权目录。
- `llms.txt`：本地模式数据不离开终端；云端由腾讯云机房；企业可私有化/SSO/审计。
- codebuddy.cn/work 安全区：TLS/AES-256、RBAC、称通过 ISO 27001、SOC 2、等保三级（**认证表述来自营销页，本批未独立审计证书原文**）。
- 产品介绍：高危指令拦截。
- **来源**：llms.txt；codebuddy.cn/work；产品介绍。

---

## 11. 已知限制 / 失败模式（仅官方文档已写明者）

### Codex（Help Center 明示）
- 反复 “Context automatically compacted” 无进展：停任务、新开 chat 并摘要目标。
- Windows 桌面「Trusted RPC dependency」导致能开站但不能控 tab：新开 Codex chat。
- `approval_policy = "untrusted"` 已不支持（CLI ≥0.149.0 等）：需改配置。
- GPT-5.4 / 5.4 mini 自 2026-08-31 起在 ChatGPT 登录的 Codex 中不可用，需迁到 GPT-5.6 Terra/Luna。
- Computer Use：不能自动化 terminal apps 或 ChatGPT 自身；不能以管理员身份认证或点系统安全权限弹窗；内置浏览器不能自动上传文件。
- Record & Replay / 部分 Computer Use：地区限制。
- 用量耗尽：Support **不会**重置限额；可选等重置、加 credits、升级等。

### WorkBuddy
- 官方产品页本批未系统列出「失败模式」FAQ；定价页提示积分耗尽后的加量包规则（付费会员）、加量包不退款。
- 稳定性/崩溃等用户抱怨出现在抖音种子评论摘要中——**属用户报告，非官方确认**，见后续 Audience 文档，不升格为产品事实。

---

## 12. 关键事实差异（仅对照，不做推荐）

| 维度 | Codex（官方可见） | WorkBuddy（官方可见） |
|------|-------------------|------------------------|
| 大陆官方支持地区 | ChatGPT 支持列表**未含中国大陆** | 国内站下载 + 人民币定价 + 腾讯云账号 |
| 产品主叙事 | 工程 agent → 扩展知识工作 Skills | 职场办公智能体桌面工作台 |
| 与「编程产品」关系 | 自身即 coding-first agent | 同矩阵另有 **CodeBuddy**；WorkBuddy 亦可代码相关任务 |
| 计费 | ChatGPT 订阅（USD 体系）+ Credits | 体验版积分 + 标准/高级/旗舰（CNY）+ 加量包；与 CodeBuddy 共享积分 |
| Office 文件 | Skills：docx/spreadsheet/PDF；可选 Excel/PPT add-in | 官方主打 PPT/表格/文档生成与本地文件批处理 |
| 扩展 | Skills、Plugins、MCP、Automations | Skills、MCP、专家/连接器生态（产品文案）、OpenClaw 兼容声明 |
| 桌面 GUI 操控 | 文档化的 Computer Use + Browser | 强调本地文件与工具调用；GUI 深度规格本批官方页较弱 |

---

## 13. 证据缺口（产品事实侧）

1. Codex 中国大陆「能否稳定登录」除地区列表外，无官方「支持」声明；社区绕行不收录为能力。
2. WorkBuddy 免费积分：Pricing vs llms.txt 活动数字需以客户端当日展示为准再核一次。
3. WorkBuddy 浏览器/桌面 GUI 自动化的边界缺少与 Codex Computer Use 同级别的公开英文/中文规格页。
4. 双方「实际失败率、幻觉、文件损坏」无官方公开基准测试被本批抓取。
5. 等保/ISO 等证书未拉取证书正文，仅记录官网陈述。

---

## 14. 本批引用清单（URL → 访问日）

1. https://openai.com/index/introducing-the-codex-app/ — 2026-11-09  
2. https://chatgpt.com/codex/ — 2026-11-09  
3. https://chatgpt.com/codex/pricing/ — 2026-11-09  
4. https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan — 2026-11-09  
5. https://learn.chatgpt.com/docs/computer-use — 2026-11-09  
6. https://developers.openai.com/codex/app （落地 desktop app 文档）— 2026-11-09  
7. https://help.openai.com/en/articles/7947663-chatgpt-supported-countries — 2026-11-09  
8. https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide — 2026-11-09  
9. https://www.workbuddy.cn/docs/workbuddy/Pricing — 2026-11-09  
10. https://www.workbuddy.cn/llms.txt — 2026-11-09  
11. https://www.codebuddy.cn/work/ — 2026-11-09  
12. https://www.tencentcloud.com/products/workbuddy — 2026-11-09  
13. https://cloud.tencent.com/document/product/1831/134329 — 2026-11-09  
14. https://mp.weixin.qq.com/s/jepj-IFv3UR9LpZlt-h82w — 2026-11-09  
