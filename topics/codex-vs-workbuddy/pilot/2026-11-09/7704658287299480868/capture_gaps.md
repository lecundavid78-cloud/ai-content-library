# capture_gaps.md — 7704658287299480868

## Missing / incomplete
1. **No local video/audio file.** Official page watch + screenshots only. No yt-dlp / third-party downloader / CDN MP4 save.
2. **No ear-verified full oral transcript.** UI unmute succeeded (volume 100, mute icon cleared), but this agent **cannot confirm audible speech**. Transcript is **PARTIAL**, built from **burned-in captions** + on-screen slide text. No separate 「完整文稿」 panel existed to copy.
3. **Not “fully watched with audible sound.”** Dense scrubbed coverage 00:00→01:22 with keyframes; continuous 1x monitoring attempts hit automation 30s timeouts. Last UI time seen near end: 01:22/01:23 (paused to avoid autoplay).
4. **Comments:** Displayed metric **213**; collected a large visible sample (70+ rows tabulated including author replies) via deep scroll, but not a guaranteed exhaustive dump of all 213 + nested replies. 「最热」 sort was not cleanly confirmed as applied.
5. **Some mid-video spoken captions** between keyframes (e.g. exact wording around ~00:38–00:45) marked **不确定** rather than guessed.
6. **Play count** not shown on this layout.

## Reliability limits
- Distinguish layers carefully: (1) caption-candidate speech, (2) on-screen graphics, (3) platform 章节要点 AI summary, (4) inference — as separated in `transcript.md`.
- Author disclaimer 「内容由AI生成」 is on-page; do not over-claim human oral originality.
- Comment likes/times are as rendered at capture time and may change.

## Can Gemini access complete picture + sound from saved files?
- **From saved local files alone: NO.** There is **no** local AV file. Screenshots + partial caption transcript are insufficient for complete audiovisual analysis.
- **Needed for full AV:** open/play the original Douyin URL `https://www.douyin.com/video/7704658287299480868` (subject to Douyin access/login/region limits).
- **What Gemini *can* use now:** keyframe screenshots in `assets/`, structure in `visual_timeline.md`, caption-partial `transcript.md`, and `comments.md` evidence — with gaps above disclosed.
