# Douyin search gaps — 2026-11-20 incremental

- **Codex**: `ok` — cards=25 — https://www.douyin.com/search/Codex?type=video
- **WorkBuddy**: `ok` — cards=25 — https://www.douyin.com/search/WorkBuddy?type=video
- **GrokBot**: `ok` — cards=25 — https://www.douyin.com/search/GrokBot?type=video
- **AI Agent**: `ok` — cards=25 — https://www.douyin.com/search/AI%20Agent?type=video
- **AI 工具**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E5%B7%A5%E5%85%B7?type=video
- **AI 自动化**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%87%AA%E5%8A%A8%E5%8C%96?type=video
- **AI 获客**: `ok` — cards=25 — https://www.douyin.com/search/AI%20%E8%8E%B7%E5%AE%A2?type=video
- **一人公司**: `ok` — cards=25 — https://www.douyin.com/search/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8?type=video

## Session
Opened existing box Chrome; did not log in or log out (an account avatar was already visible and left as-is). A 下载抖音精选 entry was visible in the left rail but was not clicked. Each keyword used the exact 视频-tab search URL, waited for real cards (not skeletons), then a modest mouse-wheel preload scroll. Cards are first 25 unique 19-digit /video/ IDs in DOM order (or fewer if fewer exist). No /user/ profile links were present on the cards, so author_url is empty. 相关搜索 chips collected into observed_hot_terms (first-seen order, unique); top filter chips such as 全部/重置/综合/最新/视频/用户/直播 were excluded. extra_visible is 合集 only when that badge is a visible standalone label on the card, not when the word merely appears in a title. No captcha and no Open Douyin app / protocol-handler dialog appeared on any of the 8 keywords. Keyword 一人公司 loaded cards on the first visit without a login modal. AI 工具 search box confirmed as “AI 工具” (AI + space + 工具; no extra 工 typo).
