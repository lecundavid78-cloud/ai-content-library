# Douyin search gaps — 2026-11-12 incremental

- **Codex**: `ok` — cards=25 — https://www.douyin.com/search/Codex?type=video
- **WorkBuddy**: `ok` — cards=25 — https://www.douyin.com/search/WorkBuddy?type=video
- **GrokBot**: `ok` — cards=25 — https://www.douyin.com/search/GrokBot?type=video
- **AI Agent**: `ok` — cards=25 — https://www.douyin.com/search/AI%20Agent?type=video
- **AI 工具**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E5%B7%A5%E5%85%B7?type=video
- **AI 自动化**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video
- **AI 获客**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%8E%B7%E5%AE%A2?type=video
- **一人公司**: `ok` — cards=25 — https://www.douyin.com/search/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8?type=video

## Session
- Browsed on this box's own network (the user's computer was offline). All 8 keyword searches were opened directly on the 视频 tab (URL type=video). No login was used. Video detail pages were not opened. Codex search results loaded without a captcha. Navigating to WorkBuddy triggered a ByteDance captcha interstitial (验证码中间页, 点击两个形状相同的物体). The first puzzle (two blue P letters) was submitted but rejected; the second puzzle (two orange X letters) passed after native desktop clicks. After that, the remaining six keywords loaded without another captcha, though result cards often took 30–50 seconds to appear after navigation. A Chrome 'Open xdg-open?' protocol-handler dialog appeared during the captcha and was cancelled; it was not used to open the Douyin app. Per successful keyword, first-screen unique /video/<id> cards were collected (about 25 after a modest scroll when fewer were initially visible); IDs were never guessed. Related-search chips (相关搜索) were recorded; top filter chips such as 全部/重置 were excluded. Author names were kept exactly as shown on the card, including a leading @. One visibly truncated author was recorded as shown: “@Miss发行人（AI版” (closing parenthesis missing on the card). Another author string was recorded exactly as the card text: “@小汉哥ai 素材课 11 月 14”. likes is an integer when likes_raw is a plain number, otherwise null (e.g. 万 units), with likes_raw kept. comments/favorites/plays/shares and author_url/published_at_abs were left empty because they were not visible on search cards.
