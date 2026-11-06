# 官方与一手来源链接表

**核查日期：** 2026-11-06（Asia/Shanghai，UTC+8）  
**用法：** 视频脚注与事实核对；非官方链接不得写成「OpenAI/腾讯官方」。

---

## A. OpenAI — Images 2.6 / GPT Image 2.6

| 标题 | URL | 核查日 | 本轮用途 |
|------|-----|--------|----------|
| Introducing Images 2.6 | https://openai.com/index/introducing-images-2-6/ | 2026-11-06 | 发布日 2026-11-04；ChatGPT/Codex/API 可用性；Flare/Sunburst 命名；GIF；定价入口 |
| GPT-Image-2.6 Sunburst 模型页 | https://developers.openai.com/api/docs/models/gpt-image-2.6-sunburst | 2026-11-06 | Model ID、价、端点支持表 |
| GPT-Image-2.6 Flare 模型页 | https://developers.openai.com/api/docs/models/gpt-image-2.6-flare | 2026-11-06 | 同上 |
| API Pricing | https://developers.openai.com/api/docs/pricing | 2026-11-06 | 2.6 token 价表 |
| Image generation guide | https://developers.openai.com/api/docs/guides/image-generation | 2026-11-06 | Image API vs Responses；2.6 能力；GIF/SVG/complexity；示例仍多写 2.5 |
| Image prompting guide | https://developers.openai.com/api/docs/guides/image-prompting | 2026-11-06 | transparent / quality / complexity / GIF 参数 |
| Images in ChatGPT（Help） | https://help.openai.com/en/articles/11084440-images-in-chatgpt | 2026-11-06 | ChatGPT 入口、透明底、GIF rollout、参考图 |
| ChatGPT release notes | https://help.openai.com/en/articles/6825453-chatgpt-release-notes | 2026-11-06 | 2026-11-04 Images 2.6 条目 |
| What is ChatGPT Plus? | https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus | 2026-11-06 | Plus $20/月；API 单独计费 |
| About ChatGPT Pro tiers | https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers | 2026-11-06 | Pro 100/200/500 价格 |
| ChatGPT Plans and Pricing | https://openai.com/chatgpt/pricing/ 或 https://chatgpt.com/pricing/ | 2026-11-06 | 档位对比（页上金额展示可能因地区/实验变化，引用时再打开确认） |
| GPT Image 1 模型页（退役对照） | https://developers.openai.com/api/docs/models/gpt-image-1 | 2026-11-06 | 2026-10-23 shutdown |

**抓取备注：** 本环境对部分 `developers.openai.com/.../*.md` 直连 curl 返回 Forbidden；正文以 WebFetch 官方 HTML/文档页为准。本地摘录索引：`sources/openai-official-excerpts.md`；公告 HTML：`sources/openai-introducing-images-2-6.html`；Help：`sources/openai-help-images-in-chatgpt.html`。

---

## B. 微信表情开放平台（腾讯）

| 标题 | URL | 核查日 | 本轮用途 |
|------|-----|--------|----------|
| 平台首页/登录 | https://sticker.weixin.qq.com/ | 2026-11-06 | 入口 |
| 平台指南（制作规范/FAQ/审核导航，SPA） | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=guide%2Findex.html | 2026-11-06 | 规格、赞赏条件、审核周期、原创要求等；前端构建路径含 `sticker_platform/26052800` |
| 制作规范深链（种子帖引用） | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=guide/index.html#/makingSpecifications#specifications_stickers | 2026-11-06 | 表情制作规范锚点 |
| 赞赏功能使用协议 | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=deal%2Freward | 2026-11-06 | 赞赏定义、扣除成本、结算、禁止用途；本地：`sources/wechat-reward-agreement.html` / `.txt` |
| 企业账号绑定商户号指引 | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=faq%2Fenterp | 2026-11-06 | 费率≥1%、主体一致；本地：`sources/wechat-enterprise-faq.*` |
| 截屏表情及真人表情投稿指南 | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=guide%2Freal | 2026-11-06 | 粉丝/指数门槛；普通人勿走真人通道 |
| 【新功能】表情单品（2015-11-03 公告） | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=bulletin%2Fbulletin_9 | 2026-11-06 | **历史**单品规格（含 ≤100KB 等）；勿与 2026 专辑表混用 |
| 服务协议链（赞赏协议内链） | https://sticker.weixin.qq.com/cgi-bin/mmemoticon-bin/readtemplate?t=deal/service | 2026-11-06 | 本轮直抓正文几乎为空/跳转；**待补抓**完整服务协议正文 |

**指南 SPA 资源（用于规格原文摘录，非用户阅读页）：**

- JS：`https://res.wxqcloud.qq.com.cn/t/wx_fed/base/sticker_platform/26052800/static/js/pages/guide/index.f84d77217115a9c8a0ed.js`  
- 摘录文本：`sources/wechat-guide-js-excerpts.txt`

**登墙说明（写进视频口播）：** 须中国大陆个人/企业资质；作品审 + 可选赞赏资格；非「上传即分成卖货」。

---

## C. 一手公开案例帖（非官方，变现自述）

| 作者 | 帖 | 核查日 | 证据等级 |
|------|-----|--------|----------|
| @ama_huangama | https://x.com/ama_huangama/status/2118154620744708599 | 2026-11-06 | B：自称变现超千元 + 上架步骤 |
| @wangray | https://x.com/wangray/status/2118332972659245163 | 2026-11-06 | B：定制 9.9 观察 + skill 开源 |
| ray-sticker-shop | https://github.com/imraywang/ray-sticker-shop | 2026-11-06 | 开源工具；本地副本见 `sources/ray-sticker-shop*`（若已克隆） |

---

## D. 明确不要当官方的来源类型

- 攻略站「月入 3000+」、未附订单的报价文（C）  
- 二手媒体对微信规格的转述（若与 SPA 表冲突，以 sticker.weixin.qq.com 为准）  
- 声称「OpenAI 官方定价每张 $x」但未链到 developers.openai.com/pricing 的图文  

---

## E. 本地归档路径

```
/workspace/gpt-image-sticker-research-20261106/
  notes/official-model.md
  notes/monetization.md
  sources/official-links.md          ← 本文件
  sources/openai-introducing-images-2-6.html
  sources/openai-help-images-in-chatgpt.html
  sources/openai-official-excerpts.md
  sources/wechat-reward-agreement.html / .txt
  sources/wechat-enterprise-faq.html / .txt
  sources/wechat-guide-js-excerpts.txt
```
