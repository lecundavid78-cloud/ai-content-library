# GPT Image 2.6 / Images 2.6 — 官方模型核对

**核查日期：** 2026-11-06（Asia/Shanghai）  
**原则：** 只采 OpenAI 官网、Help Center、开发者文档；博主帖与第三方评测不作「已证实」。  
**本文件职责：** 名称、模型 ID、发布时间、入口、费用、透明底、GIF/SVG 等能力；不写教程步骤。

---

## 1. 正式名称（已证实）

| 层面 | 官方名称 | 来源 |
|------|----------|------|
| 产品线（ChatGPT / 公告） | **Images 2.6** / **ChatGPT Images 2.6** | [Introducing Images 2.6](https://openai.com/index/introducing-images-2-6/)（2026-11-04）；[Release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) 同日条目；[Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt) |
| API 产品族 | **GPT Image 2.6**，分两个模型：**Sunburst**、**Flare** | 同上公告；[gpt-image-2.6-sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.6-sunburst)；[gpt-image-2.6-flare](https://developers.openai.com/api/docs/models/gpt-image-2.6-flare)；[Image prompting](https://developers.openai.com/api/docs/guides/image-prompting) |

**命名注意（避免视频口误）：**

- 口语「GPT Image 2.6」在官方 API 语境成立，但**不是单一 model ID**。
- ChatGPT 用户侧更常写 **ChatGPT Images 2.6** / **Images 2.6**，帮助中心未要求用户手填 `gpt-image-2.6-*`。
- 博主写作「GPT Image2.6」「GPT-image-2.6」等与官方大小写/空格不完全一致；**以文档 model ID 为准**。

---

## 2. 模型 ID 与快照（已证实）

| 显示名 | Model ID | 定位（官方文案） | 默认 snapshot |
|--------|----------|------------------|---------------|
| GPT-Image-2.6 Sunburst | `gpt-image-2.6-sunburst` | detailed visual work / 细节与精确编辑 | `gpt-image-2.6-sunburst` |
| GPT-Image-2.6 Flare | `gpt-image-2.6-flare` | fast iteration / 快速迭代 | `gpt-image-2.6-flare` |

- 输入模态：text, image；输出模态：image（两模型页一致）。
- **未证实：** 是否还有额外 dated snapshot（如 `…-2026-11-04`）。两模型页「Snapshots」目前只列上述 ID 本身。

---

## 3. 发布时间与可用性（已证实）

| 项 | 内容 | 来源 |
|----|------|------|
| 公开发布日 | **2026-11-04** | openai.com 公告页日期；Help Center Release notes「November 4, 2026」 |
| ChatGPT / Codex | 「available globally today … across **all subscription tiers**」桌面、移动、网页 | [Introducing Images 2.6](https://openai.com/index/introducing-images-2-6/) |
| API | Sunburst / Flare 已在 API 提供；价格链到 pricing 页 | 同上；模型页；[Pricing](https://developers.openai.com/api/docs/pricing) |
| ChatGPT GIF | 「GIF creation is **rolling out**」 | Release notes；Images in ChatGPT |
| 性能主张 | 「50% faster than before」；Flare 在 quality=low 时「as little as six seconds」 | 公告（营销表述，非独立基准） |

**未证实 / 需标注：**

- 具体账号是否已刷到 Images 2.6：公告称全档位全球可用，但 GIF「rolling out」说明**功能也可能分批**。
- 国内网络/支付能否稳定使用 ChatGPT 或 API：官方未在上述页面按中国大陆单独说明；视频应避免写成「国内人人可开」。

---

## 4. 使用入口

### 4.1 ChatGPT（已证实）

- 对话中描述要生成的图，或 **More → Images**。
- 可编辑已生成图或上传图再改；可选区域编辑；可要求透明背景、加字等（帮助中心表述）。
- **Images with thinking**：Plus、Pro、Business；Enterprise/Edu「coming soon」。
- **GIF**：可要求 looping GIF，或上传静图再动画；可调播放速度；**不能编辑用户上传的已有动画 GIF**。
- **Saved reference images**：可保存参考图并以 `@名称` 复用。
- Codex 亦可生成/编辑图像（帮助中心交叉引用）。
- 来源：[Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt)；[Release notes 2026-11-04](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)。

### 4.2 API（已证实）

| 端点 | 2.6 Sunburst / Flare 模型页标注 |
|------|----------------------------------|
| `v1/images/generations` | Supported |
| `v1/images/edits` | Supported |
| `v1/responses` | **Not supported**（两模型页当前表） |
| Chat Completions / Batch / Fine-tuning 等 | Not supported |

**重要文档状态（已证实存在不一致，视频须讲清）：**

- [Image generation guide](https://developers.openai.com/api/docs/guides/image-generation) 正文示例多数仍用 **`gpt-image-2.5-sunburst` / `gpt-image-2.5-flare`**，并另有「GPT Image 2.6」小节说明 2.6 的 complexity、markup、SVG、GIF 等经 **Image API**。
- 2.6 模型页将 **Responses** 标为不支持；因此**不要假设** 2.5 的 Responses 工具路径已原样迁移到 2.6，除非日后官方改表。
- Organization Verification：指南称部分组织可能需完成验证才能用 GPT Image（责任提示，非本轮实测）。

### 4.3 第三方工具（部分证实 / 部分未证实）

| 说法 | 证据等级 |
|------|----------|
| 公告引用 OpenArt、Figma Weave 等「早期客户」使用 Images 2.6 | **已证实存在合作/引用表述**（公告引语）；不等于某一第三方产品已全量对所有用户开放 2.6 |
| 某第三方「已接入 gpt-image-2.6-*」 | **未用该第三方官方文档在本轮核实** → 视频勿点名承诺，除非另查其文档 |
| 种子帖 / GitHub skill 自称用 GPT-image-2.6 | **作者自述**，非 OpenAI 官方背书 |

---

## 5. 费用与开放条件

### 5.1 API 标准价（已证实，单位：USD / 1M tokens）

来源：[Pricing](https://developers.openai.com/api/docs/pricing) 与两模型页（2026-11-06 抓取一致）。

| Model | Text input | Text cached input | Image input | Image cached input | Image output |
|-------|------------|-----------------|-------------|--------------------|--------------|
| `gpt-image-2.6-sunburst` | $5.00 | $1.25 | $8.00 | $2.00 | $30.00 |
| `gpt-image-2.6-flare` | $5.00 | $1.25 | $8.00 | $2.00 | $30.00 |

要点：

- **同价不代表同成本**：官方强调按 token 计费，实际张均成本随 size / quality / complexity / 是否带参考图 / 输出格式变化；应用 image generation guide 中的 calculator 估算。
- Pricing 表附注写明：Cached input rates for GPT Image 2 and 2.5 **only apply to Responses API** 的说明仍在页上；**2.6 是否适用同一缓存规则，官方未在本轮摘录中单独写清** → 标 **待核**，勿断言 2.6 Image API 一定有同等缓存折扣。
- Batch 价表当前摘录中**未见** `gpt-image-2.6-*` 行（有 2 / 2.5 / 1.5 等）→ **未证实** 2.6 已进 Batch 半价。

### 5.2 ChatGPT 订阅（已证实档位；非按张标价）

| 计划 | 官方价格线索 | 与图像关系 |
|------|--------------|------------|
| Free / Go / Plus / Pro 等 | Plus：**$20/month**（[What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)）；Pro：**Pro 100 $100 / Pro 200 $200 / Pro 500 $500**（[About ChatGPT Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)） | Images 2.6 公告称 **all subscription tiers**；帮助中心：ChatGPT Images 全档可用；Pro 定价页文案含「Unlimited and faster image creation」（营销对比，非 API 无限） |
| API | 与 ChatGPT 订阅**分开计费** | Plus 帮助中心明确：API usage is separate |

**未证实：**

- Free/Plus 下 Images 2.6 **精确每日/每周张数上限**（帮助中心称 limits 因系统负载变化；Release notes 对 2.5 曾写「Existing image-generation limits are unchanged」，对 2.6 **未给出新数字**）。
- 「做一套表情包要多少美金」：无官方固定单价表，只能实测 token。

### 5.3 开放条件摘要

- ChatGPT：登录即可按档位使用 Images（受用量与政策约束）。
- API：有效 API key + 可能的组织验证；遵守 usage policies；图像有 `moderation`（`auto`/`low`）。

---

## 6. 透明底、格式与表情包相关能力（已证实）

来源：[Image prompting](https://developers.openai.com/api/docs/guides/image-prompting)；[Image generation](https://developers.openai.com/api/docs/guides/image-generation)；Images in ChatGPT。

| 能力 | API（2.6） | ChatGPT |
|------|------------|---------|
| 透明背景 | `background`: `auto` \| `opaque` \| `transparent`；透明须配合 `png`/`webp`；须检查真实 alpha（棋盘格绘制 ≠ 透明）；SVG 亦支持透明 | 帮助中心：可按指令 **make the background transparent** |
| 输出格式 | `png` / `jpeg` / `webp`；generations 另支持 **`svg`**、**`gif`** | 常规下载图；GIF 正在 rollout |
| GIF | `output_format=gif`；`frame_count` 2–16（默认 9）；`frame_duration_ms` 等；不支持 streaming/partial/mask 等（见指南） | 可生成 looping GIF、调速；不可编辑上传的动画 GIF |
| 质量 | `quality`: auto/low/medium/high/xhigh/max | UI 不暴露 API 同名参数 |
| 复杂度 | `complexity`: low/medium/high；默认 high；**无单独加价**，但可增延迟与多余改动 | ChatGPT 侧无同等参数文档 |
| Markup 编辑 | edits 支持 `markup` 透明叠加层（2.5/2.6） | ChatGPT 已有 markup，现进 API |
| 角色一致性 | 公告与 prompting 强调跨编辑保持角色/产品细节；仍有「consistency 限制」章节 | Release notes：更好保留细节（如换背景时服装） |

**与微信投稿的关系（能力层，非合规结论）：**

- API 透明 PNG 对「透明底表情」有直接帮助。
- 原生 GIF 输出可能缩短「静图→动图」链路，但仍须满足微信尺寸/体积，**不能假设** API GIF 直接等于可过审文件。

---

## 7. 历史模型对照（避免口误）

| Model | 状态（官方） |
|-------|----------------|
| `gpt-image-1` | Shut down **2026-10-23** |
| `gpt-image-1.5` | 文档称计划 **2026-12-01** shutdown（以 deprecations 页为准） |
| `gpt-image-2` / `gpt-image-2.5-*` | 仍在 pricing；指南示例大量仍写 2.5 |
| `chatgpt-image-latest` | 仍在 pricing 表 |

案例若只说「ChatGPT 生图」而未贴 model ID / 产品版本，**不得写成已证实使用 2.6**。

---

## 8. 视频可用的「安全表述」模板

**可说：**

> OpenAI 于 2026-11-04 发布 Images 2.6。ChatGPT 侧叫 ChatGPT Images 2.6；API 提供 `gpt-image-2.6-sunburst`（偏细节）和 `gpt-image-2.6-flare`（偏速度）。官方标准价两者同为文本输入 $5/百万 token、图像输入 $8、图像输出 $30。透明背景在 API 用 `background=transparent` + PNG/WebP，并要检查 alpha。

**勿说（当前证据不足）：**

- 「GPT Image 2.6 只有一个模型」  
- 「API 固定每张 $x」  
- 「国内免费无限用」  
- 「官方保证一套表情零失败过审」  
- 把博主「超千元」「9.9 一单」写成 OpenAI 或腾讯官方数据  

---

## 9. 本轮未证实清单（汇总）

1. 2.6 是否已有独立 dated snapshot ID。  
2. 2.6 在 Responses API 的支持（模型页现为 Not supported）。  
3. 2.6 Batch 半价是否上线。  
4. 2.6 Image API 的 cached input 是否适用与 2/2.5 Responses 相同规则。  
5. ChatGPT Free/Plus 精确生图配额数字。  
6. 具体第三方 SaaS 是否全量暴露 2.6 model ID（需逐家文档）。  
7. 中国大陆网络下的开通与支付路径（非官方页面范围）。
