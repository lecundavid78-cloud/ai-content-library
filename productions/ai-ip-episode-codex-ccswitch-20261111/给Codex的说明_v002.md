# 给 Codex 的说明（V2，可直接发给 Codex）

工程在公开仓库 `lecundavid78-cloud/ai-content-library` 的拉取请求 #15 分支上：

- PR：https://github.com/lecundavid78-cloud/ai-content-library/pull/15
- 分支：`cursor/ai-ip-episode-codex-ccswitch-20261111-8c42`
- 目录：`productions/ai-ip-episode-codex-ccswitch-20261111/`

请检出**这一分支**（不要只拉 `main`，这一期还没有合并）。

## 当前成片

V2 已经出好，不要覆盖 `out/v001/` 或 `out/v002/` 里的已有成片。若要再改，请写到 `out/v003/`。

- 成片：`out/v002/阿泽_Codex三步换DeepSeek_v002.mp4`
- 规格：1080×1920、30fps、56.77 秒、约 31.4 MB
- SHA256：`5a6d94819342eec9a52389c8a16872786597449e69ce8df194f51a7e5c9aa5a5`
- 同目录还有字幕、360 预览、每秒拼图、关键静帧、`制作说明.md`、`待确认问题.md`、`质检报告.json`

本目录的合成源码和中间媒体已经是 **V2**：

- 数字人：`comp/public/gen/human.mp4`（CRF-22 压缩，1080×1920、25fps、1419 帧、56.76 秒；SHA256 `b953315d629650e9d374a587110639ace1d9e764717b9f0e7a95a04797e384a2`）
- 打码后的录屏轨：`comp/public/gen/stage.mp4`（SHA256 `de701099abb595f666ec8e3fda1177d4489c452f70f38d22f0a0a792642c40c8`）
- 口播：`audio/v2/G_vo_cut.wav`（已剪掉 0.12 秒口误「你」，约 56.78 秒）。同目录还有 `G_vo_cut.m4a`。
- v001 的压缩数字人和录屏轨若还在，应在 `comp/public/gen-v001/`；v001 口播在 `audio/F_vo.m4a`。v001 成片仍在 `out/v001/`。

口播以新数字人视频 G 为准（剪口误后），不要再按旧的 `文案.md` 去改第二步、第三步或「调成简体中文」那句。V2 文案见 `文案_v2.md` 和 `out/v002/制作说明.md`。

## 这是什么工程

竖屏教程片，账号名「阿泽」，视觉是「阿泽·AI实操」红黑米白。合成是 Remotion 4.0.542，入口 `comp/render.mjs`，组件 id 为 `Film`。V2 时长约 56.77 秒、1703 帧、30fps。

- 钩子：模拟输入后弹出绿色「效果示意」完成卡；数字人左下角已去掉「AI 数字人」标签
- 第 1 步：新录屏 H（只用点击「下载 Windows 版」之前，不用 3.5 秒后的下载列表），浏览器框已裁，胶囊是「Codex 官方下载页」「CC Switch 官方下载页」（无域名）
- 第 2 步：按新口播（第三个图标、获取 API Key）；网址已模糊，密钥已打码
- 第 3 步：设置 → 路由总开关 → 勾选 Codex（没有「我已了解，继续启用」弹窗）；后半是画出的聊天窗右下角 DeepSeek，带放大镜和「界面示意」
- 片尾：三步打勾总结 +「先点关注，下期阿泽教你实战用法」，没有「调成简体中文」

## 怎么出片（再改请写 v003）

在 `comp/` 下：

```bash
npm install
CONCURRENCY=3 node render.mjs --video ../build/raw_v2.mp4
RAW=../build/raw_v2.mp4 tools/finish.sh v003
```

`render.mjs` 只出无声画面。`finish.sh` 会合入口播（默认 `audio/v2/G_vo_cut.wav`）、响度约 -14 LUFS、预览、拼图、SRT 和质检。不要重配音、不要变速口播。

注意：

- `package.json` 已写好可在本机安装的依赖。**不要**使用 Linux 工作站上的 `node_modules`（含 Linux 专用 Remotion compositor）。本机 `npm install` 会安装对应系统的组件。
- `render.mjs` 默认找 `/usr/bin/google-chrome`，在 Windows / macOS 上请改成本机 Chrome，或设环境变量 `CHROME`。
- `finish.sh` 是 bash；拼图用了 Linux 字体路径。在 Windows 上用 Git Bash，或改成本机字体。不要覆盖旧版本目录。
- 改字幕和标注在 `comp/src/data.ts`；改取景和镜头在 `comp/data/edit.json`；改版式在 `comp/src/`。
- 口误剪切已定在原片 3.935–4.055 秒（0.12 秒），对应画面第 98–101 帧，见 `comp/data/voice_cut.json`。不要擅自改成 0.2 秒（会切到「就」的开头），除非用户听过剪口后要求加长。

若只需改字幕、版式或数字人位置，请直接用已经打码的 `comp/public/gen/stage.mp4` 重新合成。**不要**重新跑 `tools/build_media.py`，那一步需要含完整 API Key 的原片 E。本包故意不含原片 E、未打码帧和录屏原片。不要把这些文件补进来再提交到公开仓库。

改完后必须目检：密钥栏是黑底圆点并有「画面已打码」；成片里没有网址域名；没有 3.5 秒后的下载列表；没有「AI 数字人」标签。不要把密钥写进任何文件、命令、注释或日志。

## 待用户确认（见 `out/v002/待确认问题.md`）

- 请用户听 00:03–00:05 的 0.12 秒剪口是否自然
- 字幕时间未经人耳校对
- 第 3 步「界面示意」角标要不要保留
- 背景音乐尚未加
- 发布前请在抖音勾选 AI 生成内容声明，并在 DeepSeek 后台删掉重建那把已经进过录屏的密钥
