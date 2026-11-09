# transcript.md

Capture time (Asia/Shanghai): 2026-11-09 ~21:17 CST  
Method: dense keyframe seek (~10–20s steps via keyboard ArrowLeft/ArrowRight + short play) on official Douyin page; burned-in captions read from screenshots when legible.  
Layers: (1) burned-in caption / spoken-candidate (2) on-screen graphics text (3) platform AI 章节要点 (4) inference — kept separate.

**Honesty:** Speech was not ear-verified. Lines under “caption” are burned-in subtitle text visible in frames, or marked 「不确定」/「no caption visible」.

---

## A) Timestamped burned-in caption / spoken-candidate sampling

Format: `mm:ss | chapter UI (if shown) | caption`

| time | chapter UI | caption / note |
|------|------------|----------------|
| 00:00 | (start) | no burned-in caption clearly readable in opening UI card crop; on-screen product UI for 豆包 visible (see section B) |
| 00:02–00:03 | 第1章：引言 (nearby) | burned-in caption visible in Computer screenshot: **Codex Claude Code OpenClaw** |
| 00:09 | 第1章：引言 | **今天把三件事讲清楚** |
| 00:16–00:20 | 第2章：豆包 | no separate burned-in caption line confidently isolated in crop; slide text dominates (section B) |
| 00:27 | 第2章：豆包 | no burned-in caption confidently readable in crop |
| 00:37–00:48 | 第2章：豆包 | no burned-in caption confidently readable in crop |
| 00:54 | 第2章：豆包 | no burned-in caption confidently readable; presenter + speech-bubble graphic |
| 00:59 | chapter jump target Workbuddy | seek overlay text: 已定位至 00:59 (player UI, not video caption) |
| 01:12–01:46 | 第3章：Workbuddy | (sampled via chapter UI while seeking; dense caption OCR incomplete — see gaps) |
| 01:38–01:39 | 第3章：Workbuddy | no burned-in caption visible in presenter close-up frame |
| 01:49 | 第3章：Workbuddy | no burned-in caption confidently isolated; slide “WorkBuddy · 任务说明” etc. (section B) |
| 02:00–02:11 | 第4章：Codex和Claude... | on-screen demo text heavier than caption; caption line 「不确定」 in cropped frames |
| 02:21 | 第4章：Codex和Claude... | no burned-in caption confidently readable in UI crop (定时任务 interface visible) |
| 02:33–02:41 | 第4章：Codex和Claude... | caption 「不确定」 in crop |
| 02:56 | 第4章：Codex和Claude... | caption 「不确定」; large on-screen **Claude Code** |
| 03:03 | 第4章：Codex和Claude... | caption 「不确定」; slide text about 改过程 / 核对改动 |
| 03:06 | 第4章：Codex和Claude... | **如果使用终端版本** |
| 03:09–03:10 | 第4章：Codex和Claude... | **执行过程和输出结果** ; also **也更方便接近已有的开发流程** |
| 03:14–03:49 | 第4章：Codex和Claude... | additional burned-in lines in this stretch: many frames caption 「不确定」 due to crop; on-screen Codex×Claude Code comparison text recorded in B |
| 04:01–04:08 | 第5章：OpenClaw | caption 「不确定」 in crop; on-screen: 搭一个持续运行的助理? / 连接与运行 |
| 04:24–04:51 | 第5章：OpenClaw | caption 「不确定」; on-screen ops text: 行以后，还要继续照看 / 运行位置 本机还是服务器? |
| 05:02–05:16 | 第6章：DeepSeek Har... | caption 「不确定」; plugin market UI on screen |
| 05:34–06:04 | 第6章：DeepSeek Har... → approaching 选择建议 | large on-screen **自己拓展工作环境** / **工作环境**; burned-in caption 「不确定」 in crop |
| 06:29–06:56 | 第7章：选择建议 | presenter + decision cards; burned-in at ~07:02 cluster below |
| 07:02 | 第7章：选择建议 | **为了让它正常干活** (one Computer frame) |
| 07:02 | 第7章：选择建议 | **我愿意花多少时间学习和维护** (another Computer frame at same mm:ss cluster) |
| 07:01–07:39 | 第7章：选择建议 | ending decision framework on screen; last ~3s not used as evidence beyond avoiding autoplay-next |

### Missing / weak caption intervals (explicit)

Large stretches where burned-in caption text was **not** legibly captured even though video was sampled:

- ~00:14–00:50 (豆包 section): slides/UI readable; burned-in caption mostly not isolated
- ~01:00–01:50 (WorkBuddy early–mid): structure slides readable; burned-in caption sparse in saved crops
- ~02:00–02:55 (Codex/Claude demos): heavy UI; captions often 「不确定」
- ~04:10–05:30 (OpenClaw / DeepSeek Harness): diagram text captured; burned-in captions often 「不确定」
- ~06:00–06:50: decision cards readable; burned-in sparse until ~07:02

These are **gaps**, not silence claims: absence of readable burned-in text in screenshots ≠ “no speech”.

---

## B) On-screen text / graphics (selected, verbatim where readable)

### Opening / 引言 (~00:00–00:14)

- Slide branding: 六款热门 Agent ; 用途 · 上手 · 维护
- Tool card example: **Claude Code** ; **04 / 06** ; **按任务来选择**
- Hook question style text: **到底怎么选？** ; 热门 Agent ; 工作出发 (partial in crop)
- Burned-in cluster naming: Codex Claude Code OpenClaw

### 豆包 (~00:14–00:59)

- 豆包 · 日常使用
- 日常问答，先从熟悉的工具开始
- User bubble: 这段话能说得更自然吗？
- 豆包 capabilities chips: 解释知识、改文案、讨论选题
- Doubao sidebar labels: 新工作任务 / 新对话 / 项目 / API 服务 / 更多 / 最近
- 上手门槛 ; 把问题说清楚 ; 把要求交代清楚 ; 帮我改一下
- Partial labels: 终端 ; 代码仓库

### WorkBuddy (~00:59–01:57)

- WorkBuddy home greeting: 今天有什么工作要处理？
- Toggle: 对话 | 工作
- WorkBuddy · 任务说明
- 工作交代成一张任务单
- 资料范围 items: DIR 指定文件夹 ; DOC 选定的资料文件
- List: 01 从哪些文件里找 ; 02 提取哪几项信息
- UI demo: 定时任务 ; + 新建任务 ; 暂无已安排的任务
- Presenter example bubble fragments about 销售表 / 做成汇报文件 (partial)

### Codex and Claude Code (~01:57–04:01)

- Demo registration site: 本体验课报名 ; 姓名 / 联系方式 / 场次 ; 提交报名
- 城市创意公开课 / CITY CREATIVE CLASS ; 演示报名网站，仅使用虚构信息。 ; 填写报名信息 ; 姓名 ; 手机号 ; localhost preview hint `127.0.0.1:0709`
- Overlay lines: ...同一个报名网站，继续改 ; 一版之后，还有这些工作
- Claude Code terminal card: Claude Code · Terminal / Claude Code v2.0.0 / improve test coverage
- Claude Code | 终端 ; 看见命令如何执行，也看见输出
- Terminal demo labels: Test Coverage ; 项目读取 · 工具调用 · 执行记录
- Right rail: 项目文件 ; 终端执行 ; 输出记录
- Codex × Claude Code ; 怎么选，先试哪套操作更好理解 ; 我们要构建什么?
- Claude Code · 桌面图形界面 ; 改过程，再核对改动 (partial)

### OpenClaw (~04:01–05:02)

- OpenClaw · 连接与运行
- 搭一个持续运行的助理?
- 消息渠道 / 从常用入口派任务 → OpenClaw
- 运行 / 运维 ; 行以后，还要继续照看 ; 运行位置 ; 本机还是服务器?

### DeepSeek Harness (~05:02–06:01)

- 社区插件市场 ; 从你选择的来源发现 DeepSeek Harness 插件
- Plugin card: dsh-plugin-browserskill ; Tencent ; 通过 CLI 与扩展让智能体操控真实登录的浏览器，无干扰地自动化任务。 ; 来源: DSH 1024Store
- 自己拓展工作环境 ; 工作环境

### 选择建议 (~06:01–end)

- 01 具体是哪件工作? ; 交给 AI 的任务
- 02 资料和工具范围 ; 哪些资料可以访问? ; 需要操作哪些工具?
- 03 学习与维护投入 ; 我愿意投入多少? ; 少—多 ; 按自己的情况判断 ; 学习时间

---

## C) Platform AI summary / 章节要点 (NOT a transcript)

**Label: platform AI 章节要点 — do not treat as verified speech.**

Summary paragraph (visible):

6款热门AI工具的使用场景、上手门槛和维护成本。豆包适合日常问答和写作，Workbuddy适合办公文件处理，Codex和Claude Code适合项目开发，OpenClaw适合连接消息渠道和工具，DeepSeek Harness适合调整工作环境。选择时需考虑用途、上手难度和维护成本，先完成真实工作，再逐步补充能力。

Chapter list (visible):

| ts | title | AI blurb |
|----|-------|----------|
| 00:01 | 引言 | 介绍豆包、WorkBuddy、Codex、Claude、Code、OpenClaw、DeepSeek和Harness等热门AI工具的选择问题。 |
| 00:14 | 豆包 | 适合日常问答、写作和讨论，上手门槛低，需明确问题需求。 |
| 00:59 | Workbuddy | 适合整理文档、处理表格、做PPT、查资料，需学习任务说明、文件权限和验收。 |
| 01:57 | Codex和Claude... | 适合网站程序和小工具开发，需学习项目运行和错误检查。 |
| 04:01 | OpenClaw | 适合连接消息渠道和工具，需学习连接部署和维护。 |
| 05:02 | DeepSeek Har... | 适合调整Agent工作环境，需学习插件配置和运行环境。 |
| 06:01 | 选择建议 | 根据用途、上手门槛和维护成本选择合适的工具，先完成真实工作，再补充能力。 |

---

## D) Inference (labeled)

- Inference: the “6 agents” structured by this video’s own chapter/UI cards appear to be: 豆包, WorkBuddy, Codex, Claude Code, OpenClaw, DeepSeek Harness.
- Inference: WorkBuddy here is presented as office/file/task-oriented (任务单/资料范围/定时任务), consistent with Tencent WorkBuddy framing requested by research brief — but the page does not always print the word “Tencent” on every WorkBuddy slide; one DeepSeek plugin card does show author **Tencent**.
- Inference: comparison axes repeatedly shown on-screen: 用途 · 上手 · 维护 / 按任务来选择 / three ending questions.
