# capture_gaps.md

## Environment limitations (must-read)

- **No local AV file** was saved (hard rule: no raw MP4/CDN media download).
- **Speech not ear-verifiable** in this capture environment, even when player UI appears unmuted.
- Do **not** write or imply “fully watched with audio.”
- **Gemini (or similar) cannot get a complete picture+sound package from saved files alone** and would need the **original Douyin URL**: https://www.douyin.com/video/7704514173656501542

## Unmute / audio

- UI unmute attempts performed (canvas click, `m`, ArrowUp, volume icon hover/click).
- Computer screenshots described volume control as unmuted / slider visible at times.
- **Heard-audio: no / not verifiable.**

## Caption coverage gaps

- Dense seeking across 00:00–07:39 was performed (~10–20s steps + chapter boundaries).
- Many intervals have **on-screen slide/UI text** captured, but **burned-in caption lines** were often cropped, blurry, or absent in stills → marked 「不确定」 or listed as missing intervals in transcript.md.
- No separate full-page 「文稿」/「字幕」 panel was found to copy a complete official transcript.
- Platform 「章节要点」 exists (7 chapters) and was copied under a **separately labeled** section; it is **not** a verified speech transcript.

## Playback / site blockers encountered

- Initial 「视频数据加载中」; required refresh / alternate tab.
- One navigation hit **ERR_TIMED_OUT**; resumed on the still-loaded tab.
- Progress-bar click/drag unreliable; seeking worked via **ArrowLeft/ArrowRight**.
- Playback sometimes stuck after chapter clicks until Space/play resumed.
- 连播 control present; avoided using autoplay-next videos as evidence.
- Speed UI sometimes showed 2.0x during capture; sampling used short play + seek rather than continuous 1x watch.

## Comments gaps

- Platform shows **89** comments; collected **47** visible top-level rows until「暂时没有更多评论」.
- No 最热/最新 sort control found on this layout.
- Nested replies mostly not expanded; high-reply threads (e.g., 栢林 展开17条回复) not fully harvested.

## Screenshot gaps

- ~29 asset files covering opening, each major tool section, demos, ending, volume UI.
- Not every 10s stop has a dedicated screenshot (repetitive talking-head frames skipped intentionally).
- Some filenames’ mm:ss are approximate to the player time at capture; chapter UI labels can lag/lead visual content near boundaries.

## What was NOT done (compliance)

- No inventing titles, metrics, comments, or spoken words.
- No scoring/recommendation of tools.
- No bypass of login/paywall beyond normal page load; no captcha solve required after content loaded.
