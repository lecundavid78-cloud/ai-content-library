# Douyin search gaps — 2026-11-17 incremental

- **Codex**: `ok` — cards=25 — https://www.douyin.com/search/Codex?type=video
- **WorkBuddy**: `ok` — cards=25 — https://www.douyin.com/search/WorkBuddy?type=video
- **GrokBot**: `ok` — cards=25 — https://www.douyin.com/search/GrokBot?type=video
- **AI Agent**: `ok` — cards=25 — https://www.douyin.com/search/AI%20Agent?type=video
- **AI 工具**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E5%B7%A5%E5%85%B7?type=video
- **AI 自动化**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video
- **AI 获客**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%8E%B7%E5%AE%A2?type=video
- **一人公司**: `ok` — cards=25 — https://www.douyin.com/search/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8?type=video

## Session
- Collected logged-in-or-not as-is in box Chrome (an account avatar was visible in the header; no login was performed this session). Each keyword URL was opened directly on the 视频 tab; no homepage search box; no /video/ detail pages were opened; Open-Douyin-app / protocol-handler dialogs were cancelled when they appeared. Codex first painted skeleton placeholders, then cards rendered after a short wait (~20–30s). WorkBuddy then hit a ByteDance 验证码中间页 puzzle (“点击两个形状相同的物体”); Playwright clicks did not register selections; the captcha was solved with desktop mouse (first puzzle rejected, second puzzle of two letter m’s succeeded). GrokBot, AI Agent, AI 工具, AI 自动化 (corrected URL https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video), AI 获客, and 一人公司 then loaded without another captcha. When the first paint had ~20 cards, a modest wheel scroll plus a short wait was used; ~30 /video/ links were typically present after preload; the first 25 unique 19-digit IDs in DOM order were kept. Titles/authors/times/likes/durations/合集 are from visible search-card text; likes is a number only when likes_raw is a plain integer, otherwise null. observed_hot_terms are 相关搜索 chips only (top filter chips such as 全部/重置/综合/最新 were excluded). One 一人公司 card (7707932000179171977) had no visible title on the search card, so title is empty.
