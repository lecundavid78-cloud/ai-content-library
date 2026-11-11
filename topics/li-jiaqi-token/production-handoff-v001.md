# 李佳琦卖 Token：正式视频制作交接

2026-11-04。用户已认可本轮完整口播，已选择 Desktop Flythrough。此前明确授权在文案就绪后创建新会话直接用 Lemo-Opuscar 做视频。请接管制作并完成可观看成片，不继续征集选题或重写文案；常规制作判断自主完成。

## 当前唯一口播

本目录 copy/approved-voiceover-v001.txt 原样使用，来源与验收在 reviews/copy-approval-v001.md。仅为配音和字幕拆句，不改实质文字、不添结尾。旧 copy/codex-script-v001.md 至 v003.md、旧 Gemini 回稿、营销利益稿都是历史。

## 接管入口

工作区：D:\各种资源\crispr\组会\202392\2024624\little_program。

先读根 AGENTS.md、productions/ai-lead-notes/AGENTS.md、project.json、本目录 state.json。根目录共用且有大量无关改动，保留，不修改 WeChat、IELTS、Day 01、旧 Day 02 与图文 V1。只提交本片清楚列出的文件，不 stage all、不换分支。

原生库 external/lemo-opuscar 固定提交 b5e8ef93930b6d828f352055a689320f138237b1；先读 references/lemo-opuscar/WORKFLOW_MAP.md、ENVIRONMENT_ACCEPTANCE.md、env.sh，再读 external/lemo-opuscar 的 AGENTS.md、DIRECTOR.md、TECHNIQUE.md。已有 WSL Ubuntu20.04LTS 的 Node22.22/Python3.12/Chrome156/FFmpeg8.1 核心环境；WebGL 必须显式 LEMO_ANGLE=swiftshader。不要因旧 Ubuntu 的 setup deps 浏览器安装失败重装工具链；已有文档支持手动补齐。voice/music 按实际检查后按需安装，不能冒称已验收。

## 本片风格

本目录 references/desktop-flythrough/STYLE.upstream.md 是已读的真实上游 STYLE 快照，来自 bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00，blob eff8195659042f164054d87c975b738eea6aeaed；方向说明 reviews/desktop-flythrough-direction-v001.md。本机旧库尚无这一风格，不能假称已可直接渲染。先独立写 TREATMENT.md，再从该已知上游取得匹配 DEMO 与 engine 到本片私有工程，不更新 core/styles 或整库。首选复用风格 engine，不自创平面 PPT 替代品；treatment 后再读 demo 故事，避免照搬。

核心观感：浅木桌、点阵纸垫、有厚度与柔影的纸卡、原创像素立体引导角色，一镜连续飞行，从热点到词元示意、工作记录输入与周报输出、会员权益，最后全桌收束。关键词落桌面，完整解释靠旁白字幕；字清晰、摄影读字角度足够，不能堆满正文。遵循 STYLE 的 30fps 与声音/节奏要求。中文旁白字幕；不为凑固定时长删稿或加快到难听，实际配音决定时长。画幅与声线未由用户锁定，可自主选择适合本片和手机观看的配置并明确记为制作选择。不要停等用户批准常规分镜/风格帧。

拟用原生影片路径 external/lemo-opuscar/films/li-jiaqi-token-desktop/；该路径可能被上游忽略，交付时务必把源码、素材清单、配置、build 脚本另行备份到本目录 production/ 或交付包。不要仅把唯一工程留在忽略目录。

## 事实和素材

读 facts/codex-reviewed-facts-v001.md、research/codex-review-v001.md、research/manifest.json、research/file-provenance.md、research/sources.md。事实已独立核查，不把 Grok 摘要当验证。共享私库 lecundavid78-cloud/ai-content-library 的 topics/li-jiaqi-token/ 有原件，研究快照 9baf980e23a44c8444f5c1c547b2922127c26115。优先 GitHub 插件直接读，不重复要求用户下载。

Token 文本分块只能概念示意，除非实用明确分词器核验，不给精确块数、不逐字对应；AI 生成周报不是输入块压扁后原样搬运。热点卡/会员卡为原创信息示意，不仿造商品原页、报价承诺或李佳琦对白。

严禁用 research/screenshots/bjnews-cover-20261103.jpg（已查明无关政务海报）。qwenwork-pricing.png 为两段截图拼接，保留出处说明；需要时可取相关局部。凤凰短视频仓库 media/ifeng-20261102-li-jiaqi-qwenwork-token.mp4，2186259 字节，SHA256 10e6e1b6538414ed26e9cac1bb6c8c9af9e74775b8475c92996fb6bc54696aaa，blob 6165e7c0a48ff893befd1aef264a928b2eb098aa。此前公开直链 HTTP567，Codex 未实际播放/转写；若用必须先取回、核对、审看。可以不使用这段媒体，以真实已核资料与原创示意完成风格，不因素材缺失造截图。

## 产出与检查

沿原生工作流：treatment → 风格 engine → 中文配音与实际校时 → 原创画面、音乐、拟音、字幕 → 渲染 → 全片检查修改 → 交付。两个风格帧、角色转面、关键动作条带与 contact sheet 都要实际代码渲染，内部审查无需逐项问用户。带声正常速度审片、检查字形遮挡、分词示意含义、字幕时序、音画衔接、黑帧/完整解码/响度。记录真正审看与未验证项，不把退出0当美术合格。

交付一条完整 MP4、封面/预览、可编辑工程备份、字幕与简短真实检查记录。源链接留 CREDITS/发布说明，不往口播塞“根据某报道”的研究过程。未授权对外发布或网站部署。Grok/Gemini 始终由用户操作，不调用它们；不要因本次提及就启动额外外部模型。按实际进度更新本目录 state.json、production/ 和完成回执，不覆盖归档原件。
