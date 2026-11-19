# Douyin search gaps — 2026-11-19 incremental

- **Codex**: `ok` — cards=25 — https://www.douyin.com/search/Codex?type=video
- **WorkBuddy**: `ok` — cards=25 — https://www.douyin.com/search/WorkBuddy?type=video
- **GrokBot**: `ok` — cards=25 — https://www.douyin.com/search/GrokBot?type=video
- **AI Agent**: `ok` — cards=25 — https://www.douyin.com/search/AI%20Agent?type=video
- **AI 工具**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E5%B7%A5%E5%85%B7?type=video
- **AI 自动化**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video
- **AI 获客**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%8E%B7%E5%AE%A2?type=video
- **一人公司**: `ok` — cards=25 — https://www.douyin.com/search/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8?type=video

## Session
Opened existing box Chrome; did not log in or log out (an account avatar was already visible and left as-is). A 下载抖音精选 entry was visible in the left rail but was not clicked. Each keyword used the exact 视频-tab search URL, waited for real cards, then a modest mouse-wheel preload scroll. Cards are first 25 unique 19-digit /video/ IDs in DOM order (or fewer if fewer exist). No /user/ profile links were present on the cards unless noted, so author_url is empty when no visible /user/ link. 相关搜索 chips collected in first-seen order; top filter chips such as 全部/重置 and adjacent filter pills were excluded. extra_visible=合集 only when the 合集 badge was on the card. Codex: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. WorkBuddy: ok, 25 cards, unique_ids_in_dom=29, skipped_no_id=0. GrokBot: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. AI Agent: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. AI 工具: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. AI 自动化: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. AI 获客: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. 一人公司: ok, 25 cards, unique_ids_in_dom=30, skipped_no_id=0. On first open of 一人公司, a login modal (登录后即可搜索更多精彩视频, QR/code login) appeared over skeleton placeholders and Escape/backdrop click did not dismiss it. Did not log in or log out. A reload of the same 视频-tab URL then showed real search cards with no captcha and no Open Douyin app dialog. No puzzle captcha was seen on any of the 8 keywords.
