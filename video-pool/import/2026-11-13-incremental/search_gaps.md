# Douyin search gaps — 2026-11-13 incremental

- **Codex**: `ok` — cards=25 — https://www.douyin.com/search/Codex?type=video
- **WorkBuddy**: `ok` — cards=25 — https://www.douyin.com/search/WorkBuddy?type=video
- **GrokBot**: `ok` — cards=25 — https://www.douyin.com/search/GrokBot?type=video
- **AI Agent**: `ok` — cards=25 — https://www.douyin.com/search/AI%20Agent?type=video
- **AI 工具**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E5%B7%A5%E5%85%B7?type=video
- **AI 自动化**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video
- **AI 获客**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%8E%B7%E5%AE%A2?type=video
- **一人公司**: `ok` — cards=25 — https://www.douyin.com/search/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8?type=video

## Session
- Collected in the box Chrome browser, not logged in to Douyin, without opening the Douyin app or any individual /video/ detail pages. No 'Open Douyin app?' protocol-handler dialog appeared. All 8 keyword URLs were opened directly on the 视频 tab and remained usable; no ByteDance captcha interstitial appeared on any keyword, and results were not empty or blocked. Network to www.douyin.com was reachable. The first keyword (Codex) initially showed 加载中, then the search chrome/sidebar without cards for roughly 20–30 seconds, after which video-tab cards rendered. Later keywords typically showed about 20 /video/ links first, then about 30 unique cards preloaded in the DOM without deep-scrolling. Per keyword, the first 25 unique cards in DOM order were kept (about first-screen plus modest preload). On WorkBuddy a modest wheel scroll after the first pass loaded additional cards (up to 49); only the first 25 in DOM order were kept, and no keyword was deep-scrolled for hundreds of results. Card fields were taken only from visible search-card text and the card's real /video/<19-digit-id> href; likes is a number only when likes_raw is a plain integer, otherwise null (万 units kept in likes_raw). Author names were kept exactly as shown, including a leading @, truncation (e.g. '@Miss发行人（AI版' without a closing parenthesis), spaces, emoji, and unusual punctuation. observed_hot_terms are 相关搜索 / suggested chips only (filter chips such as 全部 / 重置 / 综合 / 最新 and other top filter tags were excluded). A few videos appeared under more than one keyword; the same video could show a slightly different like count on a later keyword page, and each page's visible value was recorded as shown.
