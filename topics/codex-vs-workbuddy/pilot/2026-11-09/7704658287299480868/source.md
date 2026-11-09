# source.md — 7704658287299480868

## Basic info
- **URL:** https://www.douyin.com/video/7704658287299480868
- **video_id:** 7704658287299480868
- **Label:** A02 WorkBuddy学霸大脑
- **Exact title (page):** 给你的workbuddy装上学霸大脑#workbudyy #ai教学 #agent #ai教程
- **Author name:** 诗诗的Ai视界
- **Author profile URL:** https://www.douyin.com/user/MS4wLjABAAAArEQWJ7rz6IZ0gE1JkBRxqxIQq73RGTFSZdmZAisWWGk
- **Author stats (visible on page):** 粉丝2967；获赞2.5万
- **Publish time (visible):** 2026-11-05 20:09
- **Player duration (visible):** 01:23
- **Description/caption (exact as shown under video):** 给你的workbuddy装上学霸大脑#workbudyy #ai教学 #agent #ai教程
- **Author disclaimer (visible):** 内容由AI生成
- **Visible metrics:**
  - 赞: 1.8万
  - 评论: 213
  - 收藏: 2.2万
  - 分享: 3650
  - 播放量: not shown on this page layout
- **Related search chip visible:** github怎么用

## Capture session
- **Capture time (Asia/Shanghai):** 2026-11-09 20:56–21:03 CST (session); markdown pack finalized ~21:03 CST
- **Raw AV / MP4 / CDN media file obtained:** **no** (official in-page download not used; third-party downloaders forbidden)
- **Watched start-to-end WITH audible sound:** **no — cannot claim**
  - UI unmute succeeded (volume slider reached **100**, `.xg-volume-mute` became hidden / full volume icon shown).
  - This capture agent has **no microphone/speaker verification channel**; speech was **not** independently confirmed as heard.
  - Evidence of content comes from **on-screen burned-in captions + visible slides/UI** while scrubbing/pausing across 00:00→01:22, plus one continuous-play attempt that hit automation 30s timeouts before full 1x monitoring completed.
  - Last timestamp reached on player UI during end capture: **01:22 / 01:23** (paused before last ~1s to avoid autoplay jump). Autoplay 「即将播放下一个视频」 was **not** observed during this session.
- **Subtitle / ASR source:**
  - No separate 「完整文稿 / 字幕」 panel found on page (searched 文稿 / 字幕).
  - Burned-in captions on video frames used as caption-verified spoken-line candidates.
  - Platform 「章节要点」 copied separately and labeled as AI summary — **not** used as transcript.
- **Playback limits:**
  - First load showed 「视频数据加载中」; refreshed once; then loaded.
  - Captcha iframe present in frame tree (`rmc-nocaptcha`) but did not block playback after load.
  - `page.evaluate` blocked in automation; mute/currentTime checked via DOM class visibility + UI time text.
  - Continuous 1x monitoring scripts timed out at ~30s tool limit when reading full page text; coverage completed via dense keyframe scrub instead.

## Unmute attempts and result
1. Clicked video canvas (user-gesture).
2. Hovered bottom player bar / `.xgplayer-volume`.
3. Clicked volume control; initially toggled; then dragged/clicked vertical `.xgplayer-volume .xgplayer-slider` to top.
4. No 「点击取消静音」 overlay text found.
5. Keyboard `m` + ArrowUp also tried earlier in sequence.
6. Screenshot saved: `assets/volume_control_state.png` showing volume **100**.
7. **Result:** UI unmuted (mute icon gone, volume 100). **Heard speech: no / not verifiable in this agent environment.** Captions visible during playback frames.

## Research purpose (context only)
Collect evidence on how this short video hooks from a concrete WorkBuddy usage pain point and shows a solution. No scoring/recommendation in this capture pack.
