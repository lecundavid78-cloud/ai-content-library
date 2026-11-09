# Douyin Search Pass1 — 2026-11-09 audit-v2

## Coverage

- Keywords searched (8): Codex教程, Codex入门, Codex实战, WorkBuddy教程, WorkBuddy入门, WorkBuddy办公, Codex和WorkBuddy区别, GrokBot Codex
- Extra: GrokBot
- 最新/最热 worked: **NO** (UI FAIL on Codex教程; remaining keywords default-only)
- Captcha/login on search: none observed
- Unique video_ids: **85**
- Already in 429-index: 51
- Possibly new vs 429-index: **34**

### Sort-switch evidence (first keyword Codex教程)

| Attempt | Result | Evidence |
|---|---|---|
| Click/hover 筛选 | FAIL | Panel never shows 最新/最热; screenshots under `screenshots/sort_attempt_*` |
| URL `sort_type=1/2` / `publish_time` | NOT counted success | Params stripped; list order changed but no labeled UI |

**Limitation (once):** Because 最新 failed, all keyword tables are default 综合/视频 only.

## High-signal possibly-new titles

- [Codex速通教程，从入门到精通实战（上篇）](https://www.douyin.com/video/7647450246863228166) | @Java小叮当 | 4.3万 | 5月前 | why=Codex_tutorial_new | ids=7647450246863228166
- [GROK BOT对比CODEX #ai实战技巧 #GROKBOT #CODEX#ai视频工作流](https://www.douyin.com/video/7703970772696533226) | @十三十三个三 | 33 | 5天前 | why=GrokBot+Codex,comparison | ids=7703970772696533226
- [100个WorkBuddy实战技能分享 自动批量复刻并二创电商爆款…](https://www.douyin.com/video/7704944575751687478) | @辰哥 | 4824 | 3天前 | why=WorkBuddy_case_or_tutorial | ids=7704944575751687478
- [AI 剪辑 Motion模板，喂饭级教程来了！ #Workbuddy](https://www.douyin.com/video/7705673659838369060) | @阿杜Next | 1844 | 1天前 | why=WorkBuddy_case_or_tutorial | ids=7705673659838369060
- [WorkBuddy保姆级教程来了 今天教的是ai短剧制作](https://www.douyin.com/video/7688985958934431098) | @教你正确用AI | 55 | 1月前 | why=WorkBuddy_case_or_tutorial | ids=7688985958934431098
- [AI 视频不是生成的，是四步拼出来的 #workbuddy](https://www.douyin.com/video/7702725983639604490) | @拆包的阿林 | 292 | 1周前 | why=WorkBuddy_case_or_tutorial | ids=7702725983639604490
- [WorkBuddy Skill 怎么上架赚钱？创建、二开、定价全讲清楚](https://www.douyin.com/video/7703881167900444666) | @夺冠AI落地 | 220 | 6天前 | why=WorkBuddy_case_or_tutorial | ids=7703881167900444666
- [3分钟装好 WorkBuddy 开源插件市场](https://www.douyin.com/video/7699505058316094739) | @鲸鱼日报 | 129 | 2周前 | why=WorkBuddy_case_or_tutorial | ids=7699505058316094739
- [WorkBuddy 教师版 01 | 指令不清，AI白干](https://www.douyin.com/video/7632932527979760930) | @王老师的记录课 | 415 | 6月前 | why=WorkBuddy_case_or_tutorial | ids=7632932527979760930
- [WorkBuddy AI 漫剧制作全流程干货](https://www.douyin.com/video/7696082281525546280) | @菠萝Ai漫剧教程（没回复👀竹叶） | 128 | 3周前 | why=WorkBuddy_case_or_tutorial | ids=7696082281525546280
- [《叶开老师的WorkBuddy系统课》Mac安装](https://www.douyin.com/video/7694307421069528335) | @叶开老师的AI应用课 | 100 | 1月前 | why=WorkBuddy_case_or_tutorial | ids=7694307421069528335
- [GrokBot跟Codex的使用方法跟区别](https://www.douyin.com/video/7699913121674104090) | @张滚滚AI出海 | 181 | 2周前 | why=GrokBot+Codex,comparison | ids=7699913121674104090
- [Grokbot可以接入你的Codex、Claudecode、Gemini](https://www.douyin.com/video/7702481499660986085) | @Gina跨境AI提效 | 493 | 1周前 | why=GrokBot+Codex | ids=7702481499660986085
- [把 Grokbot接入到各家 agent #codex#Claude#agent](https://www.douyin.com/video/7698943253144273509) | @悲伤的菠萝🍍 | 2985 | 2周前 | why=GrokBot+Codex | ids=7698943253144273509
- [GrokBot 太强了，剪辑视频比 codex 简单多了. #Workbuddy](https://www.douyin.com/video/7701973831434423578) | @AI智能体开发工坊 | 17 | 1周前 | why=GrokBot+Codex | ids=7701973831434423578
- [Codex额度用不完？交给GrokBot 三步接上](https://www.douyin.com/video/7704868157042739675) | @Andy代充Ai | 28 | 3天前 | why=GrokBot+Codex | ids=7704868157042739675
- [告别PPT感！Grok Bot审美杀疯了 …以前让 Codex 用 Remotion…](https://www.douyin.com/video/7702299256983506210) | @相旭有想 | 5596 | 1周前 | why=GrokBot+Codex,comparison | ids=7702299256983506210
- [马斯克的 GrokBot，开始接管我的工作和生活（对比Codex）](https://www.douyin.com/video/7688176625988455720) | @杜耶Pro | 3221 | 1月前 | why=GrokBot+Codex | ids=7688176625988455720

## Per-keyword results

### Codex教程
- URL: https://www.douyin.com/search/Codex%E6%95%99%E7%A8%8B?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1月前 | 48.8万 | 16:15 | @谢慢慢97 | 人人都能看懂的16分钟Codex速通教程 #ai #codex #gpt #ai教程 | `7689005697501179897` | Codex,tutorial | Y |
| 2 | 2月前 | 22.4万 | 57:58 | @林粒粒呀 | 【最新版】小白速通 Codex 教程合集 最新版 Codex 保姆级速通教程 #AI新星计划 #VibeCoding大赏 #Codex #A | `7672375866457935155` | Codex,tutorial | Y |
| 3 | 1月前 | 6.1万 | 32:12 | @阿川同学 | 最新版Codex保姆级教程🔥从入门到精通，看这一条就够啦！ #codex #ai #agent #智能体 #AI新星计划 | `7690777735500729640` | Codex,tutorial | Y |
| 4 | 4月前 | 16.6万 | 06:00 | @Ai林爻 | 6分钟：普通人也能用上codex（安装教程） | `7652267273159314740` | Codex,tutorial,cost_fail | Y |
| 5 | 5月前 | 60.0万 | 40:28 | @秋芝2046 | 40分钟学会Codex！“零基础”终级教程～ | `7640385127511641382` | Codex,tutorial | Y |
| 6 | 1月前 | 2.4万 | 15:23 | @张卓仁 | 都能看懂的Codex零基础15分钟速通手把手教程 | `7691168527419493647` | Codex,tutorial | Y |
| 7 | 3周前 | 1.7万 | 07:27 | @大闪电布莱 | Codex安装教程 从下载到配置一步步操作。 | `7697251037132425594` | Codex,tutorial | Y |
| 8 | 5天前 | 6662 | 06:51 | @迪达拉AI | codex 保姆级安装教程！ Codex装好了，打开却还是全英文？…CC Switch接入DeepSeek，再完成界面汉化。 | `7704147659980477561` | Codex,tutorial | Y |
| 9 | 4天前 | 3.3万 | 05:24 | @一只野生龙 | 人人都能看懂的codex更新版 喂饭级教程 | `7704557313692011818` | Codex,tutorial | Y |
| 10 | 2月前 | 3.2万 | 27:43 | @RabbittuX | vibecoding大赏｜Codex 从入门到精通 | `7680368728127747067` | Codex,tutorial | Y |
| 11 | 6月前 | 10.4万 | 22:05 | @木子不写代码 | Codex 零基础终极教程：功能、办公、编程、自动化一次讲透 | `7634145036032085298` | Codex,tutorial,case | Y |
| 12 | 6月前 | 11.4万 | 38:12 | @技术爬爬虾 | Codex (APP) 保姆级攻略，海量实战教程，一期精通 | `7633766904699604287` | Codex,tutorial,case,cost_fail | Y |

### Codex入门
- URL: https://www.douyin.com/search/Codex%E5%85%A5%E9%97%A8?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1月前 | 48.8万 | 16:15 | @谢慢慢97 | 人人都能看懂的16分钟Codex速通教程 | `7689005697501179897` | Codex,tutorial | Y |
| 2 | 1月前 | 6.1万 | 32:12 | @阿川同学 | 最新版Codex保姆级教程🔥从入门到精通，看这一条就够啦！ | `7690777735500729640` | Codex,tutorial | Y |
| 3 | 2月前 | 22.4万 | 57:58 | @林粒粒呀 | 【最新版】小白速通 Codex 教程合集 | `7672375866457935155` | Codex,tutorial | Y |
| 4 | 5月前 | 60.0万 | 40:28 | @秋芝2046 | 40分钟学会Codex！“零基础”终级教程～ | `7640385127511641382` | Codex,tutorial | Y |
| 5 | 1月前 | 7477 | 19:39 | @Dragon的Al视界 | Codex 自动剪辑保姆级教程，它来了！ | `7690516349092711715` | Codex,tutorial | Y |
| 6 | 1月前 | 2.4万 | 15:23 | @张卓仁 | 都能看懂的Codex零基础15分钟速通手把手教程 | `7691168527419493647` | Codex,tutorial | Y |
| 7 | 5天前 | 6662 | 06:51 | @迪达拉AI | codex 保姆级安装教程！…CC Switch接入DeepSeek | `7704147659980477561` | Codex,tutorial | Y |
| 8 | 6月前 | 10.4万 | 22:05 | @木子不写代码 | Codex 零基础终极教程：功能、办公、编程、自动化一次讲透 | `7634145036032085298` | Codex,tutorial,case | Y |
| 9 | 5月前 | 45.4万 | 09:23 | @林粒粒呀 | 小白速通 Codex 安装 + 国产大模型接入 | `7649026123325672714` | Codex,tutorial | Y |
| 10 | 3天前 | 5709 | 13:26 | @FredTalk | Codex超全教程！新手看这一期就够了 从下载安装…Skill、MCP、定时任务…四个实操案例 | `7704954966380743951` | Codex,tutorial,case | Y |
| 11 | 3周前 | 1.7万 | 07:27 | @大闪电布莱 | Codex安装教程 从下载到配置一步步操作。 | `7697251037132425594` | Codex,tutorial | Y |
| 12 | 4天前 | 3.3万 | 05:24 | @一只野生龙 | 人人都能看懂的codex更新版 喂饭级教程 | `7704557313692011818` | Codex,tutorial | Y |

### Codex实战
- URL: https://www.douyin.com/search/Codex%E5%AE%9E%E6%88%98?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 5月前 | 60.0万 | 40:28 | @秋芝2046 | 40分钟学会Codex！“零基础”终级教程～ | `7640385127511641382` | Codex,tutorial | Y |
| 2 | 6月前 | 75 | 00:59 | @孔你起哇 | 实测codex操作一把金铲铲 | `7637545948247297280` | Codex | N |
| 3 | 5月前 | 4.3万 | 02:26:14 | @Java小叮当 | Codex速通教程，从入门到精通实战（上篇） | `7647450246863228166` | Codex,tutorial,case | N |
| 4 | 5月前 | 3.0万 | 31:52 | @程序员鱼皮 | Codex 零基础实战教程，夯爆了！带你速通 15 种玩法 | `7643808859605224730` | Codex,tutorial,case | Y |
| 5 | 1月前 | 5.5万 | 03:45 | @嘿！锤哥 | Codex用着不顺手？试试这10个小技巧 | `7692664113733963058` | Codex | Y |
| 6 | 4月前 | 3.6万 | 05:13 | @Lucas吴 | Codex不是拿来学的，是拿来用的，没用过也不必焦虑 | `7656364675735784305` | Codex,tutorial | Y |
| 7 |  | 2149 | 08:51 |  | Codex 保姆级安装教程 …Windows…CC Switch…DeepSeek | `7705101945198873891` | Codex,tutorial | Y |
| 8 | 5天前 | 33 | 03:13 | @十三十三个三 | GROK BOT对比CODEX #ai实战技巧 #GROKBOT #CODEX#ai视频工作流 | `7703970772696533226` | Codex,GrokBot,comparison,case | N |
| 9 | 5月前 | 2.3万 | 00:34 | @橙光Lab | codex接管剪映，简单粗剪没问题… | `7646767331772159603` | Codex | N |
| 10 | 4月前 | 35.9万 | 21:28 | @知雪 | Codex零基础使用教程他来了！ | `7649814497578251953` | Codex,tutorial | Y |
| 11 | 2周前 | 1780 | 00:40 | @木白 | codex能帮你代打王者了… | `7699334666817468307` | Codex | N |
| 12 | 5月前 | 13.3万 | 58:37 | @马克的技术工作坊 | Codex 从 0 到 1 全攻略 | `7648838418205641994` | Codex | Y |

### WorkBuddy教程
- URL: https://www.douyin.com/search/WorkBuddy%E6%95%99%E7%A8%8B?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 3月前 | 10.2万 | 12:33 | @非哥黑科技 | WorkBuddy丨新手入门教学 WorkBuddy 新手入门全流程 | `7668834052987784467` | WorkBuddy,tutorial | Y |
| 2 | 3月前 | 4.5万 | 06:34 | @查老师并不渣 | 「保姆级」WorkBuddy零基础从入门到精通10集全攻略 | `7666544308782255403` | WorkBuddy,tutorial,case,cost_fail | Y |
| 3 | 3天前 | 4824 | 16:13 | @辰哥 | 100个WorkBuddy实战技能分享 自动批量复刻并二创电商爆款… | `7704944575751687478` | WorkBuddy,tutorial,case | N |
| 4 | 3月前 | 2.7万 | 04:23 | @何锦成本人 | WorkBuddy 小白终极教程 | `7670792113979346219` | WorkBuddy,tutorial,cost_fail | Y |
| 5 | 1天前 | 1844 | 07:14 | @阿杜Next | AI 剪辑 Motion模板，喂饭级教程来了！ #Workbuddy | `7705673659838369060` | WorkBuddy,tutorial | N |
| 6 | 3天前 | 1.7万 | 01:23 | @诗诗的Ai视界 | 给你的workbuddy装上学霸大脑 | `7704658287299480868` | WorkBuddy,tutorial | Y |
| 7 | 1月前 | 55 | 01:31 | @教你正确用AI | WorkBuddy保姆级教程来了 今天教的是ai短剧制作 | `7688985958934431098` | WorkBuddy,tutorial | N |
| 8 | 1周前 | 292 | 03:05 | @拆包的阿林 | AI 视频不是生成的，是四步拼出来的 #workbuddy | `7702725983639604490` | WorkBuddy,tutorial | N |
| 9 | 6天前 | 220 | 04:15 | @夺冠AI落地 | WorkBuddy Skill 怎么上架赚钱？创建、二开、定价全讲清楚 | `7703881167900444666` | WorkBuddy,case | N |
| 10 | 3周前 | 90 | 01:49 | @花花爱睡觉 | WorkBuddy接入GPT-6astr 自定义模型配置 | `7697630100921895846` | WorkBuddy,case | Y |
| 11 | 2周前 | 129 | 03:47 | @鲸鱼日报 | 3分钟装好 WorkBuddy 开源插件市场 | `7699505058316094739` | WorkBuddy,tutorial,case | N |
| 12 | 3周前 | 4570 | 02:03 | @清醒的鲸鱼 | WorkBuddy 免费使用 DeepSeek magpie… | `7697577968696151331` | WorkBuddy,cost_fail | Y |

### WorkBuddy入门
- URL: https://www.douyin.com/search/WorkBuddy%E5%85%A5%E9%97%A8?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 3月前 | 10.2万 | 12:33 | @非哥黑科技 | WorkBuddy丨新手入门教学 | `7668834052987784467` | WorkBuddy,tutorial | Y |
| 2 | 3月前 | 4.5万 | 06:34 | @查老师并不渣 | 「保姆级」WorkBuddy零基础从入门到精通10集全攻略 | `7666544308782255403` | WorkBuddy,tutorial,case,cost_fail | Y |
| 3 | 3天前 | 4824 | 16:13 | @辰哥 | 100个WorkBuddy实战技能分享… | `7704944575751687478` | WorkBuddy,tutorial,case | N |
| 4 | 1周前 | 292 | 03:05 | @拆包的阿林 | AI 视频不是生成的，是四步拼出来的 | `7702725983639604490` | WorkBuddy,tutorial | N |
| 5 | 3月前 | 2.7万 | 04:23 | @何锦成本人 | WorkBuddy 小白终极教程 | `7670792113979346219` | WorkBuddy,tutorial,cost_fail | Y |
| 6 | 6月前 | 415 | 08:01 | @王老师的记录课 | WorkBuddy 教师版 01 / 指令不清，AI白干 | `7632932527979760930` | WorkBuddy,case | N |
| 7 | 3周前 | 93 | 03:04 | @AI视频-漫剧短剧制作～FY | 最全最细WorkBuddy完整安装教学及保姆级教程（偏漫剧） | `7696727299755887891` | WorkBuddy,tutorial | Y |
| 8 | 1月前 | 3.3万 | 02:54 | @生姜｜AI实战 | 装好WorkBuddy，第一件事就做这个（个人AI知识库） | `7693111158979003834` | WorkBuddy,case | Y |
| 9 | 3周前 | 128 | 56:34 | @菠萝Ai漫剧教程（没回复👀竹叶） | WorkBuddy AI 漫剧制作全流程干货 | `7696082281525546280` | WorkBuddy,tutorial,case | N |
| 10 | 3天前 | 1906 | 04:02 | @刘橙绿（AI 版） | 如何用WorkBuddy操作你的浏览器！解锁六种用法 | `7704968045617270035` | WorkBuddy | Y |
| 11 | 6天前 | 220 | 04:15 | @夺冠AI落地 | WorkBuddy Skill 怎么上架赚钱？ | `7703881167900444666` | WorkBuddy,case | N |
| 12 | 1月前 | 100 | 01:57 | @叶开老师的AI应用课 | 《叶开老师的WorkBuddy系统课》Mac安装 | `7694307421069528335` | WorkBuddy,tutorial | N |

### WorkBuddy办公
- URL: https://www.douyin.com/search/WorkBuddy%E5%8A%9E%E5%85%AC?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1月前 | 1663 | 09:52 | @老樊AI | 机关工作人员用 AI 导致泄密！…到底能不能用 WorkBuddy 办公？ | `7690195345774681999` | WorkBuddy,case | Y |
| 2 | 2天前 | 113 | 01:43 | @红烧小白 | workbuddy+GitHub=王炸 | `7705095117179000249` | WorkBuddy,tutorial,case,cost_fail | Y |
| 3 | 6天前 | 220 | 04:15 | @夺冠AI落地 | WorkBuddy Skill 怎么上架赚钱？ | `7703881167900444666` | WorkBuddy,case | N |
| 4 | 5天前 | 1644 | 03:11 | @大陆最强模匠 | 深度锐评 AI Agent 从夯到拉，到底用哪个？ | `7704017247395859748` | WorkBuddy | Y |
| 5 | 2天前 | 219 | 03:34 | @佳伟讲AI | workbuddy如何连接企微 | `7705086303091576073` | WorkBuddy,tutorial | Y |
| 6 | 3天前 | 1.5万 | 01:32 | @时光漫记 | WorkBuddy必装的8个Skill✨ | `7704655895666121371` | WorkBuddy,tutorial,case | Y |
| 7 | 3天前 | 4824 | 16:13 | @辰哥 | 100个WorkBuddy实战技能分享… | `7704944575751687478` | WorkBuddy,tutorial,case | N |
| 8 | 21小时前 | 93 | 01:20 | @碳基阿生 | 装了WorkBuddy觉得没用？你可能少了这一步！（GitHub） | `7705787106811503507` | WorkBuddy,tutorial,case,cost_fail | Y |
| 9 | 2天前 | 57 | 01:47 | @庚子说 | WorkBuddy模型怎么选 倍率怎么算…性价比排名 | `7705314967737699624` | WorkBuddy,tutorial | Y |
| 10 | 1天前 | 342 | 01:07 | @超人学AI | 装完 WorkBuddy 嫌它笨？你八成漏了这步！ | `7705714039204138282` | WorkBuddy,case | Y |
| 11 | 2周前 | 1.5万 | 01:53 | @瑶的AI指南 | 离谱！一个AI工作台直接顶替4个APP | `7697210815450991908` | WorkBuddy,case | Y |
| 12 | 5天前 | 1479 | 02:11 | @秋实KL | 零成本用上 Opus 5.5！WorkBuddy积分几乎不花 | `7704045181674278170` | WorkBuddy,cost_fail | N |

### Codex和WorkBuddy区别
- URL: https://www.douyin.com/search/Codex%E5%92%8CWorkBuddy%E5%8C%BA%E5%88%AB?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 2月前 | 899 | 03:42 | @小龙Yic | DeepSeek harness、Codex、work buddy这三个工具的区别是什么？ | `7677590695808426746` | Codex,WorkBuddy,comparison | Y |
| 2 | 2月前 | 259 | 06:43 | @小博的AI产品笔记 | Codex和WorkBuddy怎么选？定位详细对比 | `7680194960607600357` | Codex,WorkBuddy,comparison | Y |
| 3 | 2月前 | 130 | 02:02 | @ZZ coding | WorkBuddy和Codex到底怎么选 实测拆解 | `7681300935750058816` | Codex,WorkBuddy,case | Y |
| 4 | 4月前 | 1161 | 02:14 | @灵鲸科技袁亮 | 豆包Workbuddy和codex有什么区别 | `7656019087939643259` | Codex,WorkBuddy,comparison | Y |
| 5 | 1月前 | 262 | 01:50 | @林子（广州有课） | Codex 和 WorkBuddy，老板到底怎么选 | `7685065566646610025` | Codex,WorkBuddy | Y |
| 6 | 3月前 | 14.9万 | 10:21 | @珍妮丁丁说 | 6款Agent工具实测：国内小白第一款到底选谁？ | `7662035533354257683` | Codex,WorkBuddy | Y |
| 7 | 5天前 | 1644 | 03:11 | @大陆最强模匠 | 深度锐评 AI Agent 从夯到拉，到底用哪个？ | `7704017247395859748` | WorkBuddy,comparison | Y |
| 8 | 4天前 | 4667 | 07:39 | @徐老师AI观察 | 6款Agent，到底选谁？…Codex #WorkBuddy… | `7704514173656501542` | Codex,WorkBuddy,tutorial,case | Y |
| 9 | 3天前 | 30 | 02:34 | @阿良学AI（AI创业版） | AI会员只能开一个，WorkBuddy、Codex到底选谁 | `7704987087409253674` | Codex,WorkBuddy | Y |
| 10 | 2周前 | 1470 | 04:01 | @大白画AI | Chat,Work,Codex的区别？（ChatGPT三模式，非腾讯WB） | `7699013831612111994` | Codex,comparison,tutorial,case | Y |
| 11 | 3周前 | 1657 | 01:10 | @卡皮码 | workbuddy也能和codex合作了？ | `7695731896411573558` | Codex,WorkBuddy | N |
| 12 | 1月前 | 7668 | 02:07 | @阿尔法猎手 | AI工具怎么选？今天叫你联动起来。用workbuddy还是其他工具？ | `7687594754972776374` | Codex,WorkBuddy | Y |

### GrokBot Codex
- URL: https://www.douyin.com/search/GrokBot%20Codex?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 12

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 2周前 | 3.7万 | 04:09 | @Keith今日休息吗 | 如何让 GrokBot 用上 codex 有闲置的额度，也不要浪费！ | `7700093372661204367` | Codex,GrokBot,cost_fail | Y |
| 2 | 2周前 | 181 | 02:37 | @张滚滚AI出海 | GrokBot跟Codex的使用方法跟区别 | `7699913121674104090` | Codex,GrokBot,comparison | N |
| 3 | 1周前 | 493 | 04:41 | @Gina跨境AI提效 | Grokbot可以接入你的Codex、Claudecode、Gemini | `7702481499660986085` | Codex,GrokBot | N |
| 4 | 2周前 | 2985 | 00:28 | @悲伤的菠萝🍍 | 把 Grokbot接入到各家 agent #codex#Claude#agent | `7698943253144273509` | Codex,GrokBot,cost_fail | N |
| 5 | 3周前 | 2.9万 | 04:31 | @小冯不意why | Grok Bot 零基础教程｜在手机上指挥你的AI 团队 | `7696563682817494299` | GrokBot,tutorial,cost_fail | Y |
| 6 | 1周前 | 17 | 02:44 | @AI智能体开发工坊 | GrokBot 太强了，剪辑视频比 codex 简单多了. #Workbuddy | `7701973831434423578` | Codex,WorkBuddy,GrokBot | N |
| 7 | 1周前 | 4372 | 02:36 |  | 一定不能让你的老板发现 Grokbot#电商 | `7701569555194213795` | GrokBot | N |
| 8 | 1周前 | 1382 | 07:46 | @Keith今日休息吗 | GrokBot视频工作流大公开 | `7703439581777883121` | GrokBot,tutorial,case | N |
| 9 | 3天前 | 28 | 02:22 | @Andy代充Ai | Codex额度用不完？交给GrokBot 三步接上 | `7704868157042739675` | Codex,GrokBot,cost_fail | N |
| 10 | 1月前 | 7996 | 09:44 | @子鱼在此 | Grok bot保姆级安装和使用教程！ | `7683842715221544202` | GrokBot,tutorial | N |
| 11 | 1周前 | 1.5万 | 03:29 | @奥美拉 | Grok bot 下zai及用zfb订yue | `7702612119590274404` | GrokBot | N |
| 12 | 1周前 | 5596 | 03:12 | @相旭有想 | 告别PPT感！Grok Bot审美杀疯了 …以前让 Codex 用 Remotion… | `7702299256983506210` | Codex,GrokBot,comparison,case,cost_fail | N |

### GrokBot (extra)
- URL: https://www.douyin.com/search/GrokBot?type=video
- Sort: 综合/视频/用户/直播/筛选 / default_综合视频
- Cards captured: 10

| # | time | likes | dur | author | title | video_id | tags | in_429 |
|---|---|---|---|---|---|---|---|---|
| 1 | 3周前 | 2.9万 | 04:31 | @小冯不意why | Grok Bot 零基础教程｜在手机上指挥你的AI 团队 | `7696563682817494299` | GrokBot,tutorial,cost_fail | Y |
| 2 | 1周前 | 1.5万 | 03:29 | @奥美拉 | Grok bot 下zai及用zfb订yue | `7702612119590274404` | GrokBot | N |
| 3 | 1月前 | 3221 | 07:04 | @杜耶Pro | 马斯克的 GrokBot，开始接管我的工作和生活（对比Codex） | `7688176625988455720` | Codex,GrokBot,case | N |
| 4 | 5天前 | 848 | 08:41 | @一页枝鸥 | grokbot零基础小白使用指南… | `7704256242407034131` | GrokBot,tutorial,case | N |
| 5 | 1周前 | 90 | 02:56 | @深潜AI | Grok 会员五档，新手直接上 Premium！ | `7702709035866328383` | GrokBot | N |
| 6 | 1天前 | 56 | 08:07 | @林百万AI | 适合新手的Grok Bot保姆级教程 | `7705645815340492134` | GrokBot,tutorial | N |
| 7 | 3周前 | 100 | 02:22 | @小爷开启🔛疯狂模式 | 我的Grokbot小团队 | `7697669029560929590` | GrokBot | N |
| 8 | 6天前 | 215 | 05:39 | @新同学95 | Grok bot目前存在大坑，大家一定要注意！！ | `7703820378426051890` | GrokBot,cost_fail | N |
| 9 | 4天前 | 418 | 04:52 | @菲戈传输 | GrokBot 偷偷砍了 Opus？…还值不值得冲？ | `7704432857363945835` | GrokBot,cost_fail | N |
| 10 | 3天前 | 131 | 06:39 | @深深聊玩法 | 如何用Grok Bot做闲鱼？实操版来了！ | `7704636649354890534` | GrokBot | N |

## All unique video_ids

```
7689005697501179897
7672375866457935155
7690777735500729640
7652267273159314740
7640385127511641382
7691168527419493647
7697251037132425594
7704147659980477561
7704557313692011818
7680368728127747067
7634145036032085298
7633766904699604287
7690516349092711715
7649026123325672714
7704954966380743951
7637545948247297280
7647450246863228166
7643808859605224730
7692664113733963058
7656364675735784305
7705101945198873891
7703970772696533226
7646767331772159603
7649814497578251953
7699334666817468307
7648838418205641994
7668834052987784467
7666544308782255403
7704944575751687478
7670792113979346219
7705673659838369060
7704658287299480868
7688985958934431098
7702725983639604490
7703881167900444666
7697630100921895846
7699505058316094739
7697577968696151331
7632932527979760930
7696727299755887891
7693111158979003834
7696082281525546280
7704968045617270035
7694307421069528335
7690195345774681999
7705095117179000249
7704017247395859748
7705086303091576073
7704655895666121371
7705787106811503507
7705314967737699624
7705714039204138282
7697210815450991908
7704045181674278170
7677590695808426746
7680194960607600357
7681300935750058816
7656019087939643259
7685065566646610025
7662035533354257683
7704514173656501542
7704987087409253674
7699013831612111994
7695731896411573558
7687594754972776374
7700093372661204367
7699913121674104090
7702481499660986085
7698943253144273509
7696563682817494299
7701973831434423578
7701569555194213795
7703439581777883121
7704868157042739675
7683842715221544202
7702612119590274404
7702299256983506210
7688176625988455720
7704256242407034131
7702709035866328383
7705645815340492134
7697669029560929590
7703820378426051890
7704432857363945835
7704636649354890534
```

## Possibly new video_ids (not in Douyin_Video_Index.csv 429)

```
7637545948247297280
7647450246863228166
7703970772696533226
7646767331772159603
7699334666817468307
7704944575751687478
7705673659838369060
7688985958934431098
7702725983639604490
7703881167900444666
7699505058316094739
7632932527979760930
7696082281525546280
7694307421069528335
7704045181674278170
7695731896411573558
7699913121674104090
7702481499660986085
7698943253144273509
7701973831434423578
7701569555194213795
7703439581777883121
7704868157042739675
7683842715221544202
7702612119590274404
7702299256983506210
7688176625988455720
7704256242407034131
7702709035866328383
7705645815340492134
7697669029560929590
7703820378426051890
7704432857363945835
7704636649354890534
```