# 制作交接：《Skill 入门》横屏教程 · 第 3–7 章（给 Codex）

> 这份文档不依赖任何对话记忆。照着它，就能在 `/workspace/skill-intro-demo/` 里逐章做出带口播的 1920×1080 成片。
> 一次只做一章。每章做完、通过第 8 节验收再开始下一章。
> 先看范例：`demo-ch03/preview.mp4`（成片）和 `src-ch03/`（源码），它和第二章用的是同一套引擎，并且已经用上并行 + JPEG 渲染。新章节的运行时从 `src-ch02/` 或 `src-ch03/` 复制都可以（两份完全相同）。
> 实测：`PAR=3 SHOT=jpeg bash tools/compose_chapter.sh NN` 渲染加合成一章约 3 分钟。

---

## 0. 项目与禁区

### 必须原样保留、不准改动 / 覆盖的路径

| 路径 | 说明 |
|---|---|
| `demo/` `demo-v2/` `demo-v3/` | 早期审美样片 |
| `demo-ch01/` `demo-ch02/`（以及之后交付的 `demo-ch03/` …） | 已交付章节 |
| `src/` `src-v2/` `src-v3/` `src-ch01/` `src-ch02/`（及之后交付的 `src-chNN/`） | 对应源码 |
| `制作说明*.md` `问答-速度与复用交接.md` 本文档 | 已交付文档 |
| `refs/` 全部 | 用户原始素材：口播原片 870MB、音轨、文案、参考视频 |
| `asr/口播全片-whisper-base.json` | 全片转写结果，只读 |

另外：
- **不要上传、复制到外部、提交 870MB 的 `refs/用户口播视频.mp4`**，也不要把它整段读进上下文。只用 ffmpeg 按时间截取。
- 不要发布，不要改 GitHub，不要输出密钥。不要使用任何 CDN 或外部字体、脚本，所有资源都必须在本地。

### ⚠️ 两个默认参数会覆盖已交付文件

- `tools/build.py` 不带参数时，会写 `demo/index.html`（第一版样片）。**永远带上 `--src src-chNN --out demo-chNN/index.html`。**
- `tools/render.mjs` 不设 `OUT` 环境变量时，会往 `demo/` 里写静帧和视频。**永远加 `OUT=demo-chNN`。**

---

## 1. 环境

```bash
node -v          # ≥ 22（render.mjs 用 Node 自带的 WebSocket）
python3 -c "import fontTools"            # build.py 需要；系统已有
ffmpeg -version; google-chrome --version
# 可选：装 brotli 后 build.py 才会输出 woff2（否则自动退回 woff，效果一样）
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install -q fonttools brotli   # 之后用 /tmp/fontenv/bin/python 跑 build.py
```

**长任务规则（踩过的坑）**：
- 渲染、合成都在**前台**执行，每条命令控制在 8 分钟以内，靠分段实现。
- 不要丢到会被 10 分钟上限掐断的后台任务里。
- 判断任务完成，看**产物文件是否存在**；不要用 `pgrep -f "xxx"`，它会匹配到自己。

---

## 2. 章节与切点表

章内时间 = 原片秒数 − 本章起点。下面的「起」「止」都是原片秒数，切点都落在小节标题前的静音里。

| 章 | 标题（章节角标） | 起 → 止 | 口播时长 | 成片时长（+0.7s 片尾） | 文案小节 | 状态 |
|---|---|---|---|---|---|---|
| 01 | 为什么需要 Skill | 0.00 → 83.50 | 83.50 | 84.20 | 开场 +「为什么需要 Skill？」 | ✅ 已交付 |
| 02 | Skill 长什么样 | 83.50 → 177.15 | 93.65 | 94.35 | 「Skill 在电脑里…」+「SKILL.md 里面…」 | ✅ 已交付 |
| 03 | 其他文件有什么用 | 177.15 → 268.00 | 90.85 | 91.55 | 「除了 SKILL.md，其他文件有什么用？」 | ✅ 已交付（demo-ch03/） |
| 04 | AI 怎么发现和调用 Skill | 268.00 → 359.95 | 91.95 | 92.65 | 「AI 是怎么发现和调用 Skill 的？」 | ✅ 已交付（demo-ch04/） |
| 05 | 为什么按需加载 | 359.95 → **415.56**（复核后由 415.76 提前，见 制作说明-ch05.md） | 55.61 | 56.31 | 「为什么 Skill 要采用按需加载？」 | ✅ 已交付（demo-ch05/） |
| 06 | Skill 和 Prompt 的区别 | **415.56** → 500.50 | 84.94 | 85.64 | 「Skill 和普通 Prompt 到底有什么区别？」 | ✅ 已交付（demo-ch06/） |
| 07 | 值不值得做 + 总结 | 500.50 → 585.64（原片结尾） | 85.14 | 85.84 | 「什么样的任务值得做成 Skill？」+「总结」 | ✅ 已交付（demo-ch07/，全片最后一章） |

各小节标题的开口时间（来自对齐）：268.38 / 360.22 / 415.74 / 500.78 / 542.94；口播在 585.44 结束，原片总长 585.64。

### 每章开工前必须复核切点（RMS 包络）

```bash
ffmpeg -y -i refs/用户口播音频.m4a -ac 1 -ar 16000 /tmp/full.wav        # 一次即可
# 以 ch04 终点 359.95 为例：看前后 ±0.6s 的 20ms RMS，切点必须落在 < −45 dB 的连续静音里
ffmpeg -v error -ss 359.4 -t 1.2 -i /tmp/full.wav -af "asetnsamples=320,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/rms.txt" -f null -
python3 -c "
import re;s=open('/tmp/rms.txt').read()
t=re.findall(r'pts_time:([\d.]+)',s);v=re.findall(r'RMS_level=(\S+)',s)
print('  '.join(f'{359.4+float(a):.2f}:{float(b):.0f}' for a,b in zip(t,v)))"
```

如果表里的切点不在静音中间，就挪到静音中点，并在本章制作说明里写清楚。起点必须等于上一章的终点。

---

## 3. 每章固定参数

| 参数 | 值 |
|---|---|
| 画布 | 1920×1080，30fps（presenter 25fps，合成时转 30） |
| 口播窗口 | 280×498，左上角 (96, 528)，圆角 20px（引擎和遮罩已内置，不要改） |
| 原片裁切 | `crop=540:960:282:14`（从 1080×1350 原片取 9:16 区域，脸完整，眼睛约 40% 高，麦克风只露出顶部） |
| 章首 | **不加任何停顿**：直接从本章起点开始（上一章结尾已有 0.7s 停顿） |
| 章尾 | 声音在终点前 60ms 淡出；画面停在终点那一帧，再停 0.7s（`tpad` 克隆末帧，`apad` 补静音）；最后一个部分 `outro: true`，在成片结束前 0.45s 整组退场 |
| 名牌「阿泽」 | **只在第 1 章**。其余章 `Studio.config.slot.name = ''` |
| 右上角系列标 | `Studio.config.series = 'Skill 入门 · 第 N 章'` |
| 舞台 | 默认浅色（`stage: 'light'`）。前两章结尾都是浅色，保持浅色衔接最稳；确需深色时，引擎会自动做 1.4s 渐变 |

---

## 4. 每章流程（以第 NN 章、起点 S、终点 E 为例）

```bash
cd /workspace/skill-intro-demo
NN=04; S=268.00; E=359.95
DUR=$(python3 -c "print(round($E-$S,2))"); TOT=$(python3 -c "print(round($E-$S+0.7,2))")

# ① 复制运行时（引擎 / 组件 / 规范样式）——从第二章复制，不要改第二章本身
mkdir -p src-ch$NN/js/parts src-ch$NN/styles src-ch$NN/fonts demo-ch$NN/media demo-ch$NN/stills
cp src-ch02/js/engine.js src-ch02/js/components.js src-ch$NN/js/
cp src-ch02/styles/tokens.css src-ch02/styles/base.css src-ch02/styles/components.css src-ch$NN/styles/
sed -e "s/第二章 Skill 长什么样/第X章 <本章标题>/" -e "s/demo-ch02/demo-ch$NN/g" -e "s/src-ch02/src-ch$NN/g" \
    -e "s/第 2 章/第 ${NN#0} 章/" -e "s/播放第二章/播放第X章/" src-ch02/index.html > src-ch$NN/index.html
#   然后手动改 index.html：parts 的 <script> 列表换成本章 part 文件；章内时间注释改成「原片秒数 − S」

# ② 字幕 + 关键词时间（正文 = 文案，时间 = 语音；--offset 让输出变成章内时间）
python3 tools/align.py asr/口播全片-whisper-base.json refs/用户口播文案.md \
  --from $S --to $E --offset $S --out src-ch$NN/js/timeline.js \
  --marks "关键词1,关键词2,…"            # 关键词取文案里的原词，用来给卡片变化对点
#   终端会打印每行字幕的章内时间和每个关键词的开口时间——设计 cue 时以这份输出为准
#   注意：marks 取的是范围内第一次出现的位置，常用词（如「打开」）可能对错地方，要对照字幕时间核实

# ③ 裁出本章口播片段（视频 + 声音 + 0.7s 片尾）
ffmpeg -v error -y -ss $S -t $DUR -i refs/用户口播视频.mp4 \
  -vf "crop=540:960:282:14,setsar=1,tpad=stop_mode=clone:stop_duration=0.7" \
  -af "afade=t=out:st=$(python3 -c "print(round($DUR-0.06,2))"):d=0.06,apad=pad_dur=0.7" -t $TOT \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -r 25 -c:a aac -b:a 160k -ar 48000 -movflags +faststart \
  demo-ch$NN/media/presenter.mp4

# ④ 设计并手写 parts（第 5、6 节），以及 src-ch$NN/styles/scenes.css

# ⑤ 构建 + 校验（字体会按本章用到的字重新子集化；改了任何文字都要重跑，不要加 --no-fonts）
python3 tools/build.py --src src-ch$NN --out demo-ch$NN/index.html
OUT=demo-ch$NN node tools/render.mjs check          # 输出 JSON：lint 必须是 []，external 必须是 []

# ⑥ 审查静帧（导出模式，没有口播画面）：每个部分至少看 3 张，拼成 2×2 网格查看
OUT=demo-ch$NN node tools/render.mjs stills 3.0 10.5 22.0 …

# ⑦ 渲染 + 合成（分段渲染；PAR=3 表示同时开 3 个 Chrome，SHOT=jpeg 表示用 JPEG 截图提速）
PAR=3 SHOT=jpeg bash tools/compose_chapter.sh $NN
#   如果单条命令可能超过 8 分钟：先 SKIP_COMPOSE=1 只渲染（可多次执行，已存在的分段会跳过），
#   最后 SKIP_RENDER=1 只拼接 + 合成

# ⑧ 成片校验 + 截取静帧（从 preview.mp4 截，带口播窗口）
ffprobe -v error -show_entries stream=codec_name,width,height,sample_rate,channels -show_entries format=duration -of compact demo-ch$NN/preview.mp4
for t in 02.00 10.00 …; do ffmpeg -v error -y -ss $t -i demo-ch$NN/preview.mp4 -frames:v 1 demo-ch$NN/stills/t$t.png; done
OUT=demo-ch$NN node tools/render.mjs stills <某一时刻> --guides          # 再加一张参考线图

# ⑨ 写 制作说明-ch$NN.md（格式照 制作说明-ch02.md）
```

### 舒适度和音量检查命令

```bash
ffmpeg -v error -i demo-ch$NN/preview.mp4 -vf "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=/tmp/yavg.txt" -an -f null -
python3 -c "
import re;v=[float(x) for x in re.findall(r'YAVG=([\d.]+)',open('/tmp/yavg.txt').read())]
d=[abs(v[i+1]-v[i]) for i in range(len(v)-1)];m=max(d)
print(f'frames={len(v)} max_step={m:.2f} at {d.index(m)/30:.2f}s black={sum(x<16 for x in v)}')"
ffmpeg -i demo-ch$NN/preview.mp4 -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"
ffmpeg -ss $S -t $DUR -i refs/用户口播音频.m4a -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"   # 两组必须相同
```

---

## 5. 引擎与写法（`src-chNN/js/engine.js` 是从第二章复制来的）

### 5.1 一个部分（part）= 文案的一个小节（或小节内一个完整段落）

```js
Studio.scene({
  id: 'pA-xxx', stage: 'light',
  span: [0, 30.20],                    // 章内绝对时间段；下一个部分的 span[0] 必须等于它
  outro: true,                         // 仅本章最后一个部分加：章末整组退场
  chapter: { no: '04', title: 'AI 怎么调用 Skill' },
  html: `…`,
  cues: [ { at: 12.34, sel: '.k1', fx: 'tilt' }, … ],   // at = 章内绝对秒数，必须来自 align.py 的输出
});
```

- 字幕不写在 part 里，由 `timeline.js` 统一提供。
- `index.html` 里依次 `<script src="js/parts/xxx.js">`，最后 `Studio.boot()`。

### 5.2 动效（fx）

| fx | 用途 | 注意 |
|---|---|---|
| `type` | 带 `.c-type` 的文字逐字浮现 | 用于标题的第一个状态：`sel: '.hero-wrap [data-state=a]'` |
| `in` / `soft` / `tilt` | 入场：上浮去模糊 / 只去模糊 / 卡片带纵深立起 | 卡片用 `tilt` |
| `state` + `to:'b'` | **原地换状态**（`.c-morph` 里的 `[data-state]` 子元素） | 第一个状态默认可见，其余开场自动隐藏 |
| `move` + `to:{x,y,w,h,o,s}` | **卡片移动、改尺寸、改透明度、缩放** | **只能用在 `position:absolute` 的元素上**（卡片、hero-wrap）；流式布局的元素会被打乱 |
| `fill` / `fillLight` | 虚线占位行被填满（深卡 / 白卡） | 行内要有 `.fill` 子元素 |
| `mark` | 荧光笔（`.c-mark` 内的 `.hl`） | |
| `badge` / `unbadge` | 打上 / 撤掉 √× 小徽标（`.c-badge`，红色加 `.is-red`） | |
| `recede` / `restore` | 退后（变淡、模糊）/ 恢复 | |
| `out` | 退场 | **主卡片只能在部分结束时退场**；部分内只对次要元素（标注、芯片、换面时的旧面）用 |

### 5.3 常用结构（直接照抄第二章）

- **大字 → 上移成标题**：`<div class="hero-wrap ttl"><div class="c-morph"> <div data-state="a" class="c-hero c-type">…</div> … </div></div>`。
  - 先 `type` 状态 a；讲到正文时 `move` 到 `{y:130, s:0.68}`，同时 `state` 换句；之后每次换句都在同一位置 `state`。
- **一张卡多个面**：`<div class="c-card is-morph box"><div class="face f-1">…</div><div class="face f-2">…</div></div>`。
  - 换面时同时做三件事：旧面 `out`，新面 `soft`，卡片 `move` 到新尺寸。
- **白色文档卡**：`.c-card.is-white` 或在 face 上设白底（见 `src-ch02/styles/scenes.css` 的 `#pB-skillmd .doc .face`）。
- **标注胶囊**：`<div class="l-at callout c1"><span class="c-pill is-sm">…</span></div>`，压在卡片右边缘，用 `in` / `out` / `state`。
- **任务小卡**：`.c-chip`（白色、带阴影），里面放 `<span class="ok">✓图标</span>`，打勾用 `badge`。

### 5.4 可参考的卡片模板（都在已交付的源码里）

| 模板 | 出处 | 适合 |
|---|---|---|
| 叠压交代卡（第 1/2/3 次，后面的退后、最后合并） | `src-ch01/js/parts/pA-why.js` | 「重复 / 版本 / 累积」 |
| 三张问号卡 → 逐张揭晓 → 点名其中一张 → 原地放大成清单 | `src-ch01/js/parts/pB-three.js` | 「分几类 / 三件事 / 选出重点」 |
| 新同事 → 手册 → 任务 √（三联 + 箭头） | `src-ch01/js/parts/pC-sop.js` | 「流程 / 先 A 再 B」 |
| 代码卡 → 文件夹卡（加一行虚线可选项再收回） | `src-ch02/js/parts/pA-folder.js` | 「目录结构 / 可选项」 |
| 文档卡：前置区填值 → 错误写法 × → 改写 √ → 翻到正文、逐行填满 | `src-ch02/js/parts/pB-skillmd.js` | 「对比好坏写法 / 逐步展开」 |
| 同一张文件夹卡逐行点亮（其余退后）+ 下方例子区原地换内容（`.ex .c-morph`） | `src-ch03/js/parts/pA-extras.js` | 「逐个讲解几项 + 每项举例」 |
| 两张卡并列对比 → 一张淡出、另一张移到中间 → 下方环境提示 → 红 × | `src-ch03/js/parts/pB-limits.js` | 「两种形态 / 限制条件」 |

---

## 6. 版式与审美硬约束（违反就不能交付）

1. **出现 - 变化 - 消失 - 出现**：同一小节内，一张（组）卡片原地变化（state / move / fill / badge / mark…），不准「放完一张就消失、再弹出一张新的」；只有小节结束时，整个部分才一起退场。每个部分开场 1.5s 之后至少要有 2 次变化（引擎会检查）。
2. **居中**：标题和字幕的中心在 x=960（引擎检查 ±4px）。口播窗口在左下，**不要因为它把整页往右推**。画面下半部（y>488，与窗口同高）的大字和卡片只能放在对称安全列 **x 416 → 1504** 内；上半部的标题区可以用满全宽。
3. **不挡口播窗口**：窗口外扩 40px 是禁区（引擎逐帧检查）。
4. **主句 ≤14 字**（`.c-hero` / `.c-title` 去空格计数），从口播里提炼，**不要和当前字幕逐字相同**。
5. **一屏只用一种强调色**：浅舞台用紫 `#7B5CF0`（`<em>`）；深舞台用金。**红色 `#E5484D` 只用于「出问题 / 错误写法」**，每章最多出现一两次。
6. **动效要柔和**：不要砸入、震屏、闪白、快速闪烁；不要大段可读正文。需要表示「正文」时，用骨架条或 1–2 行关键字。
7. **节奏**：每 3–5 秒要有一次可见的变化，对准口播关键词；不要连续 6 秒以上画面没有任何动作，也不要一秒内堆好几个变化。
8. **字幕**：只能用 `align.py` 生成（文案原文 + 语音时间），不要用 Whisper 识别出来的文字，不要手改时间。

---

## 7. Codex 容易做错的地方（前两章真实踩过或差点踩的坑）

| 坑 | 后果 | 正确做法 |
|---|---|---|
| 把某个元素命名为 `.slot` | 和口播窗口的 `.slot` 撞名：元素被绝对定位到左下角，导出叠加层还会把它藏起来（第二章踩过） | 自定义类名避开 `.slot` `.ttl` `.face` `.c-*` `.sub` `.chapter` `.series` 等引擎和组件已占用的名字 |
| 用 `:nth-of-type` 选卡片 | 会把同级的其他 div 也算进去，选错元素 | 给每张卡加独立类名，例如 `.k1` `.k2` |
| 对流式布局元素用 `move` | 布局错乱 | `move` 只用于绝对定位的元素；流式元素用 `recede` / `restore` / `state` |
| `.c-lead` 这类文字写成块级元素 | 宽度撑满 1920，lint 报「越出安全区」 | 放进居中容器，或者用 inline-block |
| 忘记 `--offset` | 字幕和 cue 整体晚了 S 秒 | `--from S --to E --offset S` 三个参数一起用 |
| 不带参数跑 `build.py`，或没设 `OUT` 跑 `render.mjs` | **覆盖第一版样片 `demo/`** | 见第 0 节 |
| 在章首加停顿，或第 2 章以后还显示名牌 | 章与章之间停顿翻倍；名牌重复出现 | 章首不加停顿；`slot.name = ''` |
| 最后一个部分漏了 `outro: true` | 章末卡片不退场，和下一章硬切 | 加上 |
| 渲染丢到后台、单条命令超过 10 分钟 | 被掐断，`visual.mp4` 损坏、整段作废 | 前台分段渲染；分段跳过已有文件 |
| 用 `pgrep -f` 判断任务结束 | 匹配到自己，永远在等 | 看产物文件 |
| 改了文字却用 `--no-fonts` 构建 | 新字回落到系统字体 | 文字有变动就完整跑 `build.py` |
| marks 里的常用词 | 对到范围内第一次出现的位置（第二章的「打开」就对错了） | cue 时间以字幕行时间为准核实 |
| 代码等需要缩进的文字 | 空格被 HTML 折叠，看起来不像代码 | 设 `white-space: pre` |
| 合成后不检查音轨 | 可能没声音或音量变了 | ffprobe 确认有 aac 音轨，volumedetect 结果与原片同一段一致 |

---

## 8. 每章验收清单（全部满足才算交付）

- [ ] 切点做过 RMS 复核，落在静音里；起点 = 上一章终点；有改动就写进说明
- [ ] `demo-chNN/index.html` 能打开，点「播放」有声，声画同步；`render.mjs check` 输出 `lint: []`、`external: []`
- [ ] `demo-chNN/preview.mp4`：h264 1920×1080 30fps + aac 48kHz 立体声；时长 = 口播时长 + 0.7s（±0.05s）
- [ ] 音量和原片同一段的 volumedetect 结果相同
- [ ] 黑场 0 帧；相邻两帧亮度变化 < 20
- [ ] 口播窗口：裁切参数正确，脸完整，没有被任何卡片、字幕遮挡；第 2 章以后没有名牌
- [ ] 标题和字幕居中；下半部内容都在 416–1504 之间
- [ ] 每个部分都是「出现 - 变化 - 消失」，部分内部没有硬切换卡；部分数量与文案小节、段落相符
- [ ] 抽查 6 张以上成片静帧：不拥挤、不和字幕逐字重复、没有空白超过 6 秒的画面、没有错别字
- [ ] `demo-chNN/stills/`：至少 12 张成片截图 + 1 张参考线图
- [ ] `制作说明-chNN.md`：范围与切点复核、衔接、对齐、部分表（出现 / 变化 / 消失）、校验结果、已知问题
- [ ] 已交付目录、`refs/` 的修改时间没有变化；没有残留的 Chrome 或 ffmpeg 进程

---

## 9. 第 4–7 章分镜建议（供参考，可以调整，但要守住第 6 节）

每章先按文案小节或段落划分部分，再在每个部分里找 3–8 个关键词做变化点。

- **第 4 章 · AI 怎么发现和调用 Skill**（一个小节，约 92s，可分 2 个部分）
  - A：「先放进指定目录才能被识别」——桌面文件夹（灰、AI 看不见）原地移动进「Skills 目录」卡，然后亮起。
  - B：五步调用流程——一张流程卡，五个步骤依次点亮：看目录（只读 name + description 清单）→ 按任务匹配（「封面 Skill」被选中 √）→ 读取 SKILL.md 正文 → 按需调取 references / assets / scripts → 调用工具交付。讲到「串联起来就是…」时，压缩成一行「匹配目录 → 读说明书 → 按需调资源 → 工具执行」；讲到「自动触发并不是百分百靠谱」时，在匹配步骤上打一个红色提醒（全章唯一的红）。
- **第 5 章 · 为什么按需加载**（约 56s，1–2 个部分）
  - 「上下文容量有限」用一条容量条表示；「装了 50 个 Skill 全塞进去」时容量条被塞满、变红；然后换成「查字典」三层：目录 → 说明书 → 参考资料，逐层展开，容量条回落。最后注明「不是零消耗」。
- **第 6 章 · Skill 和 Prompt 的区别**（约 85s，2 个部分）
  - A：「只有纯文字的 Skill」——SKILL.md 和聊天框左右并排，内容可以复制过去，结论是「价值在于存下来、按需调用」。
  - B：「带配套资源的 Skill」——同一张卡长出资料、模板、脚本，聊天框复制不过去；讲到「改一次规范，所有任务同步生效」时连线全部点亮。结尾一句：「Prompt 是这一次，Skill 是这一类」。
- **第 7 章 · 值不值得做 + 总结**（约 85s，2 个部分，全片结尾）
  - A：两条标准（高频重复 / 流程和标准明确），四个适合的例子依次打 √；两个不适合的例子（一次性任务、模糊口号）打 ×。
  - B：总结和「三个问题」清单逐条出现；结尾「我是阿泽，下期直接拆解 Skill」。片尾可以把 `outro` 的停顿拉长到约 1.5s，做全片收尾。
