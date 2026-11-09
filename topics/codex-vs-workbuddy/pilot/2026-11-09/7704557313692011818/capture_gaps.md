# capture_gaps.md — 7704557313692011818

## Missing / incomplete
1. **No local raw video/audio file** — only official URL + screenshots + caption notes. Not downloaded (policy).
2. **Audio not unmuted** — mute icon state persisted despite volume UI attempts. Spoken transcript is **caption-based**, not ear-verified. Any non-captioned oral nuance is unavailable → mark 不确定.
3. **No platform「完整文稿/字幕」side panel** found; only in-video captions +「章节要点」.
4. **Not claiming “fully watched with audio.”** Continuous play was observed roughly 00:08→05:04 on this URL; opening/ending also seek-sampled including 05:22 CTA. Gaps in continuous monitoring exist at the very start seconds before the timed play pass and if the player looped after end.
5. **Some caption intervals sparse** (~00:15–00:24, ~02:40–02:50, ~03:00–03:15, ~04:50–05:03) — not every 15s has a verbatim caption line.
6. **Comment metric flicker** — observed 352 and briefly 353; shares 6714→6733 during session. Use values recorded in source.md/comments.md with timestamps.
7. **Sort control** — did not successfully switch to a distinct「最热」mode; harvested default panel through 「暂时没有更多评论」.
8. **Third-item title in「三个部分」slide** — not fully readable from the 00:25 screenshot description used in notes.
9. **Transient wrong-video risk** — once progress interaction landed on a recommended ~47:07 video; immediately returned to official URL; that content is excluded from transcript/visual evidence.

## Reliability limits for downstream (Gemini etc.)
- **Can Gemini access complete picture+sound from our saved files?** **No.** There is no local AV file with synced audio. Saved materials are screenshots + markdown. To hear/see full motion+sound they need the **original Douyin URL** (and a working player session), subject to Douyin access limits.
- **What Gemini *can* use from this package:** keyframe screenshots in `assets/`; caption-based partial transcript; structure timeline; comment sample; page metrics/disclaimers.
- **Do not treat「章节要点」as verbatim speech.**
- **Do not invent** missing spoken lines, metrics, or comments.

## Relative to prior raw notes
`raw/transcripts/7704557313692011818_一只野生龙.md` and `raw/comments/7704557313692011818.md` were chapter summary + first-screen comments only. This pilot folder is a **fresh** capture and supersedes them for A01 analysis inputs, while remaining explicitly PARTIAL on audio-verified transcript.
