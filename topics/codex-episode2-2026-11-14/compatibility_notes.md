# Codex + CC Switch + DeepSeek 兼容性备忘（无实测，禁止当成结论）

一期栈是 **Codex + CC Switch + DeepSeek**。下面只根据公开产品常识、候选视频自己的说法、以及用户反馈来标注风险。 **本轮没有做任何复现测试。** 标签含义：

- **likely**：主要依赖 Codex 读改本地文件、跑命令、写 HTML/脚本等通用 agent 能力，第三方模型若仍能走工具调用，成功的可能性相对高（仍需验证）。
- **uncertain**：可能依赖视觉、浏览器/MCP 连接器、Skill 生态或模型质量，在 DeepSeek 路径下成败未知。
- **likely-OpenAI-native**：视频或产品界面明确绑定 ChatGPT 账号、官方模型档位、Image Gen、官方额度/记忆等，改接 DeepSeek 后很可能不可用或表现不同。

## 对本期常见实战类型的判断

| 实战类型 | 标签 | 理由（非测试） |
|---|---|---|
| 一句话整理文件夹、按规则复制/分类、批量重命名（不删原文件） | uncertain，略偏 likely | 核心是文件系统工具调用，理论上不绑定官方模型名。但分类质量、是否遵守「先抽样 / 不覆盖」取决于模型指令遵循；读照片内容可能要视觉能力。 |
| 根据 EXIF/地点/画面内容归档照片 | uncertain | 无 EXIF 时不能靠修改时间硬凑（X 回复已指出）。内容分类依赖读图。DeepSeek 接口若无视觉，只能走文件名和时间。 |
| 处理 Excel / CSV / 生成统计（通过写脚本，而不是官方「附加 xlsx 到对话」） | uncertain，脚本路径相对更可能 | 写 Python 改表格不必然依赖官方模型。但 2026-11-03 起已有用户在 X 反馈 **Codex 桌面端发送 .xlsx 附件卡住**（Windows）。那是官方附件路径，与「让 agent 在磁盘上改文件」不是同一机制，不要混为一谈，也不要保证附件功能可用。 |
| 做可编辑 PPT / Word / PDF | uncertain | 常见做法是技能包或脚本来写 office 文件。能否在第三方模型下稳定调用这些 skill，未验证。更早的「Codex 一键 PPT」视频也未在本栈复核。 |
| 一句话做网页、旅游攻略站、记账本、作品集 | uncertain，略偏 likely | 写本地 HTML/JS 或小网站是典型编码任务，DeepSeek 作为编码模型有可能完成。官方「四种工作模式 / 指定 Terra·Sol·Astra·Luna」等档位在 CC Switch 下会变或消失。 |
| 照截图复刻网页 | uncertain | 通常需要读图。第三方模型无视觉则这条会断。FredTalk 案例 3 属于此类。 |
| Image Gen、做 GIF、官方生图生视频、接 Agnes 等图像 API | likely-OpenAI-native 或依赖另一套 API | FredTalk 章节有「Image Gen 生图，在图上圈着改」；旗哥视频是给 Codex 接 Agnes AI。这些都不是 DeepSeek 默认能力。 |
| 官方模型选择、ChatGPT 桌面登录、记忆开关、账号用量 | likely-OpenAI-native | FredTalk 前半明确「官网下载 ChatGPT 桌面 App，左上角切到 Codex」，并讲 Terra/Sol/Astra/Luna 与记忆。一期观众走的是 CC Switch + DeepSeek，界面和计费会不同。 |
| MCP、定时任务、Skill 市场 | uncertain | 能否用、哪些能用，取决于 CC Switch 是否转发这些协议，以及 DeepSeek 是否遵守 skill 指令。未验证。不要默认「视频里的 MCP / 定时任务在我们这套也能跑」。 |
| 浏览器控制、电商自动化、接入 AE | uncertain / 可能偏官方或插件 | 通常要额外连接器或专用插件，不是开箱办公能力。 |
| 多 agent 互相对话、纸飞机调度、云桌面 Box | 超出本栈 | 与「普通人用已装好的 Codex+DeepSeek 做一件可见的事」不是同一产品路径。 |

## 对已有高相关候选的逐条标注

- **FredTalk（四案例）**：案例 1–2（整理下载、重命名照片）和案例 4（记账本）→ uncertain，有可能在本栈复现，必须实测。案例 3（截图复刻网页）→ uncertain（视觉）。前半安装与 Image Gen / 官方模型 / 记忆 / MCP / 定时任务 → 多数 likely-OpenAI-native 或 uncertain。不能把 13 分钟官方套餐教程整段搬到 DeepSeek 路径上讲。
- **周周的旅游攻略站**：uncertain，略偏 likely（写网站 + 本地测试）。章节提到 Codex 是 OpenAI 自主编码 agent、有四种工作模式——这些表述对官方产品成立，不自动等于 CC Switch 配置。加「真实风景图片」的来源未知（本地文件还是官方生图）。
- **X 苏乐照片分类提示词**：uncertain（视觉 + 工具遵循）。提示词本身的护栏（先 20 张、只复制、出报告）与栈无关，建议保留。
- **地球支线 unslop、野生阿呆做 Skill**：uncertain。Skill 格式若通用，第三方模型或许能用，未验证。
- **嘟嘟 / 旗哥 / 官方 Pro 额度剪辑或生视频**：likely 依赖官方额度或第三方图像视频 API，不是 DeepSeek 默认能力。
- **Lucas吴 投研文件夹系统、LeoLiu 读 Obsidian 文件夹**：uncertain，偏文件读写，可能可做；「定时跟踪」若用官方定时任务则另算。

## 安全：不要在 Downloads 里直接开工

2026-10 下旬英文 X 大量转载 Forever Security 一类报告：网页可把 `AGENTS.md` 丢进 Downloads，在该目录启动 Codex 时，测试中出现高比例遵从恶意指令的情况（报道口径，本轮未复核实验）。若第二期做「整理下载文件夹」，必须加护栏，例如：

- 不要把 Codex 的工作目录直接设在系统 Downloads；
- 先把待整理文件复制到空的专用文件夹再处理；
- 禁止删除/覆盖原件，先出方案再执行（与苏乐提示词一致）；
- 不要把这条写成恐吓，只陈述风险与操作纪律。

这与模型是 GPT 还是 DeepSeek 关系不大，是 agent 读目录指令文件的机制问题。

## 写作与拍摄时不要说过头的话

- 不要说「官方 Codex 有的功能，接上 DeepSeek 都能用」。
- 不要用 FredTalk 里的 Terra/Sol 档位或 Image Gen 当本栈卖点。
- 凡是视觉、MCP、定时任务、浏览器、附件上传，先标「需验证」，拍之前用本栈跑一遍。
- 一期评论里已有「若用 DeepSeek，为什么不用 WorkBuddy 直接调 DeepSeek」（野生龙详情页高赞）。第二期若展示的任务在本栈上不稳定，会把这个问题再点燃。优先选**本栈能稳定跑出前后对比**的任务，而不是官方演示里最好看但不兼容的功能。
