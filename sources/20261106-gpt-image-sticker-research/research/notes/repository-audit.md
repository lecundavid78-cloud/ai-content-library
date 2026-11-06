# ray-sticker-shop 仓库审计笔记

- 仓库：https://github.com/imraywang/ray-sticker-shop
- 默认分支：`main`
- Commit（读取时唯一提交）：`d274a8831b73a9f41504c66d330ca90119582119`
- Commit 时间：2026-11-05T13:08:59Z → Asia/Shanghai **2026-11-05 21:08:59**
- 作者署名：wangzhuc / imraywang；message 含 `Co-Authored-By: Claude Opus 5.5`
- LICENSE：MIT（Copyright 2026 Ray Wang）
- 读取日：Asia/Shanghai **2026-11-06**
- 读取方式：**未克隆**；仅用 cursor-github `get_repository` / `list_commits` / `get_file_contents`
- 本轮未读取、未下载任何密钥；仓库内未见 `.env` / key 文件（根目录仅 `.gitignore`、`LICENSE`、`README.md`、`SKILL.md`、`scripts/`、`references/`）

本地原文存档：
- `sources/ray-sticker-shop-README.md`
- `sources/ray-sticker-shop-SKILL.md`

---

## 1. 仓库结构（公开文件清单）

| 路径 | 作用 |
|---|---|
| `README.md` | 安装、依赖、花费宣传、权利声明 |
| `SKILL.md` | Claude Code / Codex skill：完整人工流程 |
| `LICENSE` | MIT |
| `.gitignore` | `__pycache__/`、`*.pyc`、`.DS_Store` |
| `scripts/sticker.py` | **唯一可执行流水线**（约 22KB，全流程在此） |
| `references/pack.example.json` | pack.json 示例（仅 3 条 sticker 示范） |
| `references/writing.md` | 选题、英文 action、中文配字规范 |
| `references/wechat.md` | 微信上架步骤/规格/收入（作者称 2026-11-05 核对） |
| `references/custom-order.md` | 定制接单 SOP（无成交数字） |

**缺失文件（安装风险）：**
- 无 `requirements.txt` / `pyproject.toml`：依赖只写在 README「`pip install pillow`」
- 无示例角色图、无样例 `sheets/`、无测试
- 无 `package.json` 等其它运行时

---

## 2. 宣传 vs 代码能证实

| 说法来源 | 内容 | 代码/文件能否证实 |
|---|---|---|
| SKILL 描述 | 「用 GPT Image 2.6」 | **部分**：CLI 默认模型字符串为 `gpt-image-2.6-flare`（gen）/ `gpt-image-2.6-sunburst`（character），经 `images/edits`；**不能**单独从本仓库证明这是 OpenAI 对外正式商品名或公开定价档位 |
| README / SKILL | 约 $0.7 / $0.65 出 8+5 张 | **估算**：`gen --dry-run` 用 `张数 × 0.052`；token 记账常数 `PRICE`；**非**实跑账单 |
| SKILL | 「几分钟出完」 | **未证实**：取决于 API 延迟与并发；默认 `--jobs 4` 并行 |
| README | ChatGPT 可手工出图再合成 | **能**：`prompts` 子命令打印提示词；`build` 只读本地 `sheets/` |
| README | 自动压到 ≤500KB、微信投稿包 | **能**：`build_gif` + `cmd_check` + `submit/` 命名 |
| custom-order | 接单流程 | **流程文档**；**无**成交价、收入截图、订单样本 |
| wechat.md | 赞赏全额到账、付费每套 10 微信豆 | **作者二次整理**；需对照官方页面再核（见主研究任务） |

---

## 3. 图像模型与 API（代码实证）

### 3.1 入口

- HTTP：`POST {OPENAI_BASE_URL|/https://api.openai.com/v1}/images/edits`
- Auth：`Authorization: Bearer $OPENAI_API_KEY`
- 可选：`OPENAI_BASE_URL`（中转站）
- 实现：stdlib `urllib` 手写 multipart，**不**依赖 openai SDK

### 3.2 请求字段（multipart）

- `model`（见下）
- `prompt`
- `size`（如 `960x960`、`1024x1024`、`1504x800`、`1504x1120`）
- `quality`（默认 `medium`）
- `complexity`：**硬编码** `"medium"`
- `background`：`"transparent"` 或 `"opaque"`
- 参考图字段名：`image[]`，filename `ref.png`，Content-Type `image/png`
- 响应：取 `data[0].b64_json` 解码写文件
- 失败重试：最多 4 次；对 429/5xx 与网络错误退避

### 3.3 默认模型名（仅代码默认，待官方核验）

| 子命令 | `--model` 默认值 |
|---|---|
| `character` | `gpt-image-2.6-sunburst` |
| `gen` | `gpt-image-2.6-flare` |

说明：仓库文案统称「GPT Image 2.6」；**flare / sunburst 后缀是否为公开 API 模型 id，本仓库无法证明**。视频脚本应写「作者脚本默认模型字符串为 …」，勿直接等同官方文档商品名，除非另有 OpenAI 官方页核对。

### 3.4 费用记账（代码）

```text
PRICE = {"text": 5e-6, "image": 8e-6, "out": 30e-6}  # USD / token
cost = out_tokens*out + image_tokens*image + text_tokens*text
```

- 写入项目目录 `costs.jsonl`
- `dry-run` 粗估：`len(todo) * 0.052` 美元
- README ≈ $0.7；SKILL ≈ $0.65：与「8 张 sheet + 5 张 asset ≈ 13 × 0.052」量级一致
- 中转站：作者注明「以中转站账单为准」

**本审计未调用任何付费 API，未验证真实账单。**

---

## 4. 实际生成策略：多宫格还是逐张？

**结论：按「表情张」逐次调用 API；每一次生成的是该表情的 4×4（16 帧）精灵图，再本地切帧合成一张 GIF。**

不是：
- 一张超大图里摆满整套 8 个表情；
- 也不是对每一帧单独调 16 次 API。

是：
1. （可选）`character`：1 次 edits → `character.png`
2. `gen`：对 `pack["stickers"]` **每条 1 次** edits → `sheets/01.png` …（默认 size `960x960`，transparent）
3. 同时（除非 `--no-assets`）再生成 5 张配套：`cover/icon/banner/reward_guide/reward_thanks`
4. 默认线程池 `--jobs 4` **并行**（与部分「严格顺序防 502」教程不同）
5. `build`：本地切 4×4 → 16 帧 → 240×240 GIF

一致性锚：所有 edits 都把同一张 `pack["character"]` 作为 `image[]` 参考；prompt 强制 “Use the character in the input image exactly…”

---

## 5. Prompt 怎么写（中英分工）

### 5.1 精灵图 `_prompt_sheet`（代码模板，英文骨架 + 可嵌入中文配字）

核心结构（意译要点）：
- 锁定参考图：同脸、体型、颜色、服装、线稿风格
- 可选 `pack.style`
- **画 4×4 animation sprite sheet**：16 等大方格，左→右、上→下为帧序
- 无网格线、无边框、无序号；**全透明底**
- 每格角色大小与落点一致；夸张表情；实心清晰；无运动模糊；末帧接回首帧
- `Action: {s['action']}` ← **writing.md 要求用英文写具体身体动作**
- 若有 `caption`：要求每格底部同一句手写粗体配字，**原文精确等于 caption**（可为中文），并给角色与字加白色贴纸描边；否则 No text

### 5.2 角色图 `character`

英文：照片 → cute cartoon sticker character；保留识别特征；非写实；正面全身；透明底；默认 style `cute chibi, two-head-tall, thick clean dark outlines, flat soft colors`

### 5.3 配套素材 `ASSET_PROMPTS`

英文；cover/icon 透明无描边；banner/reward 不透明、禁止白底与文字/二维码

### 5.4 pack 字段（中文交付文案）

- `name` / `intro` / `copyright` / `reward_line` / 每张 `word`（含义词）/ `caption`（画面配字）
- `action`：英文动作描述
- 示例见 `references/pack.example.json`（仅 3 条示范，正式需 8–24）

---

## 6. 切图 / 去底 / 动图 / 微信规格 / ZIP（算法）

### 6.1 切图 `_slice`

- 打开 sheet → RGBA
- `w,h = width//4, height//4`（非严格要求源图必须 960；非正方形也会按格切）
- 16 格 crop → 各 resize 到 **240×240** LANCZOS
- 额外统计每格 alpha 是否「顶到边缘」；`border>8` 时 build 打印警告（可能切断）

### 6.2 去底

- **无 rembg / 无抠图库**；依赖模型 `background=transparent` 与 PNG alpha
- GIF 编码时：先把帧合成到白底上做调色板；透明模式用 alpha&lt;128 把像素标成透明索引色
- cover/icon：`_fit_png` 按 alpha bbox 裁切后居中铺方再缩放到目标尺寸

### 6.3 GIF `_encode` / `build_gif`

- 全局调色板：所有帧拼成长条再 `quantize`，再套到各帧（体积更小）
- 默认 `frame_ms` 来自 pack（示例 120）
- 体积目标：`MAX_GIF = 500KB`
- 策略：先全帧；若超限则抽一半帧并把 duration×2；颜色档 128→96→64→48
- 透明：`transparency` + `disposal=2`；`loop=0`
- 可选 `keep_frames: [start, end]`（1-based 闭区间语义：`frames[start-1:end]`）修循环跳帧

### 6.4 微信提交目录 `submit/`（`build` 产出）

| 产出 | 尺寸/限制（代码） |
|---|---|
| `表情图/01.gif`… | 240×240，≤500KB，动图 |
| `封面图.png` | 240×240，透明，≤500KB |
| `聊天面板图标.png` | 50×50，透明，≤100KB |
| `详情页横幅.png` | 750×400，不透明，≤500KB |
| `赞赏引导图.png` | 750×560 |
| `赞赏致谢图.png` | 750×750 |

另：`预览.png`（联系表）、`预览.html`（可切深色聊天底）、`上架文案.md`、`交付给客户.zip`（仅 GIF，按含义词命名，`ZIP_STORED`）

### 6.5 `check` 机器校验（摘要）

- 名称 1–8 字无标点；介绍≤80；版权≤10；赞赏语 5–15
- 禁用词：微信/wechat/腾讯/官方/认证/正版
- 张数 8–24；含义词≤4、不重复
- GIF 尺寸/体积/帧数≥2/loop=0；帧差过小→WARN；首尾差大→WARN；dHash 过近→差异不足 WARN
- 素材尺寸、透明/非透明、近白底 WARN
- **明确不做**：错别字、角色变形、权利审核——留给人眼 + `预览.html`

---

## 7. 外部依赖与安装风险

| 依赖 | 说明 |
|---|---|
| Python 3.9+ | README 要求 |
| Pillow | `from PIL import Image, ImageChops, ImageOps, ImageStat`；**无版本钉扎** |
| 网络 + API Key | 真实 `gen`/`character` 需要；中转需 `OPENAI_BASE_URL` |
| Claude Code / Codex | skill 宿主；本流水线核心是 CLI，不强制 |
| 无 openai SDK / 无 ffmpeg / 无 rembg | 降低依赖，但透明质量完全押在模型 |

风险：
1. 缺 `requirements.txt` → 新手环境漂移
2. 默认模型 id（flare/sunburst）若账号侧不存在 → HTTP 失败（代码会打印错误并允许重跑补缺）
3. 默认 **4 并发** 可能触发限流（有 429 重试，但仍可能慢/贵）
4. ChatGPT 手工路径：用户需自备「1:1 透明底」sheet，否则切帧易坏
5. `pack.example.json` 只有 3 条 → 直接 `check` 会因张数 FAIL（需补到 ≥8）
6. 权利/过审/收入：**文档明确不保证**

---

## 8. 适合演示、且本机不调付费 API 的命令

前置：把仓库文件放到本地 skill 目录后（研究机可只演示帮助/干跑逻辑；**本审计未执行付费调用**）。

```bash
# 仅看帮助（无网络、无 key）
python3 scripts/sticker.py -h
python3 scripts/sticker.py gen -h
python3 scripts/sticker.py character -h

# 在已有 pack.json 的项目目录上：只报价，不调用 API
python3 scripts/sticker.py gen 项目目录 --dry-run

# 打印完整提示词（无 key 路径）；把输出给 ChatGPT 手工出图
python3 scripts/sticker.py prompts 项目目录

# 若已有 sheets/*.png 与 assets_raw/*.png：本地切帧/检查（不调 OpenAI）
python3 scripts/sticker.py build 项目目录
python3 scripts/sticker.py check 项目目录
```

**不要在演示脚本里默认执行（会扣费）**：
```bash
python3 scripts/sticker.py character --photo ... --out ...
python3 scripts/sticker.py gen 项目目录          # 去掉 --dry-run
python3 scripts/sticker.py gen 项目目录 --redo 3,7
```

---

## 9. 对视频「推荐路线」的直接含义

1. **路线标签**：参考角色锚 + **每表情一张 4×4 精灵图** + 本地切帧压 GIF + 微信规格包 —— 不是「整套表情一张九宫格切完」。
2. **一致性**：靠同一张 `character.png` + 强制同角色 prompt；动作差异靠每张不同英文 `action`。
3. **中文**：画面配字/含义词/上架文案用中文；动作描述用英文写进 prompt。
4. **静态 vs 动态**：本仓库默认产出 **动态 GIF**；无单独静态表情分支。
5. **变现文档**：`custom-order.md` 是接单 SOP（素材→确认角色→交付 zip）；`wechat.md` 是上架/赞赏/付费豆说明（待官方页交叉核验）。**仓库内无真实成交金额证据。**

---

## 10. 读取命令与工具记录

| 步骤 | 工具 | 参数要点 |
|---|---|---|
| 仓库元数据 | cursor-github `get_repository` | owner=`imraywang` repo=`ray-sticker-shop` |
| 提交 | cursor-github `list_commits` | sha=`main` per_page=5 → 唯一 `d274a883…` |
| 列目录 | cursor-github `get_file_contents` | path=`""` / `scripts` / `references` ref=`main` |
| 读文件 | 同上 | `README.md` `SKILL.md` `LICENSE` `.gitignore` `scripts/sticker.py` 及 references 下 4 文件 |
| 未使用 | `git clone`、Shell 拉 raw、付费 API | 按任务禁止克隆；未下载 secret |

---

## 11. 一句话结论

公开源码**确实包含**从参考图到微信投稿素材的完整可执行流水线；图像侧默认走 OpenAI 兼容 **`/v1/images/edits`**，模型字符串写死为 **`gpt-image-2.6-flare` / `gpt-image-2.6-sunburst`**；生成单元是 **「每表情一张 4×4 透明精灵图」**，本地 Pillow 切帧、全局调色板压 GIF、缩放配套图并 `check`；无 key 时可用 `prompts`+ChatGPT 手工补图。宣传中的「几分钟 / $0.65–0.7 / GPT Image 2.6 正式名」需与官方模型页和实跑账单分开表述。
