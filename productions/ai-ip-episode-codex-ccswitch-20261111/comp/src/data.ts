// 本期内容数据：口播上屏文字、步骤标题、录屏标注。
// 上屏文字逐句取自 文案.md（确认稿）；只在行尾省略逗号/句号。tools/qa.py 会把这里的文字拼起来与文案逐字比对。
// 时间来自 audio/asr_pass2 的逐字时间戳（Whisper small）+ 静音检测，未经人耳校对。

export const FPS = 30;
export const DURATION = 64.4;

export type Seg = string | { em: string };
export type Line = { t: number; segs: Seg[] };
export type Cue = { t0: number; t1: number; lines: Line[] };

/** 时间分区 */
export const T = {
  hookEnd: 18.3, // 录屏卡片放大为主画面
  stageIn: 14.15, // 录屏卡片在钩子里首次出现（三步快闪）
  tip: 54.05, // 录屏退出，进入小贴士
  outro: 57.4,
  cta: 61.4,
};

/** 钩子、小贴士、片尾：大字动效文字（位于上半区）。y 为行顶，size 为字号。 */
export type KLine = { t0: number; t1: number; y: number; size: number; segs: Seg[]; tone?: 'ink' | 'mute' | 'onInk' };
export const KLINES: KLine[] = [
  // ── 钩子一：痛点（0–2.5s）
  { t0: 0.0, t1: 2.5, y: 244, size: 190, segs: ['C盘', { em: '爆满' }] },
  { t0: 1.08, t1: 2.5, y: 462, size: 190, segs: ['不敢乱删？'] },
  // ── 钩子二：承诺（2.54–7.28s）
  { t0: 2.54, t1: 7.24, y: 236, size: 92, segs: ['只发', { em: '一句话' }, '，'] },
  { t0: 3.56, t1: 7.24, y: 610, size: 92, segs: ['AI 就帮你', { em: '清除垃圾' }, '，'] },
  { t0: 5.44, t1: 7.24, y: 752, size: 92, segs: ['把大文件', { em: '挪去其他盘' }, '。'] },
  // ── 钩子四：三步（12.84–18.3s）；钩子三的对比卡在 Hook.tsx 里单独排版
  { t0: 12.84, t1: 14.12, y: 256, size: 100, segs: ['没有账号也', { em: '别慌' }, '，'] },
  { t0: 14.16, t1: 16.22, y: 266, size: 84, segs: ['只需', { em: '三步' }, '，就能给它换上'] },
  { t0: 16.26, t1: 18.25, y: 200, size: 76, segs: ['几块钱就能用的'] },
  { t0: 17.3, t1: 18.25, y: 292, size: 76, segs: [{ em: 'DeepSeek 大脑' }, '。'] },
  // ── 小贴士（54.24–57.06s）
  { t0: 54.3, t1: 57.35, y: 256, size: 92, segs: ['左下角设置里'] },
  { t0: 55.28, t1: 57.35, y: 384, size: 92, segs: ['还能一键调成'] },
  { t0: 56.3, t1: 57.35, y: 512, size: 120, segs: [{ em: '简体中文' }, '。'] },
  // ── 片尾（57.48–64.2s）
  { t0: 57.48, t1: 61.3, y: 256, size: 80, segs: ['完整', { em: '一步一图' }, '的实操细节，'] },
  { t0: 59.4, t1: 61.3, y: 384, size: 74, segs: ['我已经放在', { em: '群内配套教程' }, '里。'] },
  { t0: 61.4, t1: 99, y: 236, size: 200, segs: ['先点', { em: '关注' }] },
  { t0: 62.42, t1: 99, y: 500, size: 84, segs: ['下期阿泽教你'] },
  { t0: 63.4, t1: 99, y: 624, size: 120, segs: [{ em: '实战用法' }, '！'] },
];

/** 钩子三（7.28–12.38s）对比卡里的口播文字，单独排版，这里只登记文字供比对 */
export const CONTRAST = {
  a: { t: 7.28, label: '普通网页 AI', big: '只能陪聊', tBig: 8.58, tail: '，' },
  b: { t: 9.34, l1: '而 Codex', t2: 10.44, l2: '能直接在你电脑里', t3: 11.62, big: '动手干活', tail: '。' },
  t1: 12.7,
};

/** 步骤段字幕（数字人右侧，两行以内） */
export const CUES: Cue[] = [
  { t0: 18.66, t1: 21.3, lines: [{ t: 18.66, segs: ['第一步，'] }, { t: 19.58, segs: ['浏览器搜 ', { em: 'Codex' }, '，'] }] },
  { t0: 21.38, t1: 23.5, lines: [{ t: 21.38, segs: ['进', { em: '官方入口' }] }, { t: 22.54, segs: ['下载安装；'] }] },
  { t0: 23.66, t1: 25.4, lines: [{ t: 23.66, segs: ['再搜 ', { em: 'CC Switch' }, '，'] }] },
  { t0: 25.44, t1: 28.14, lines: [{ t: 25.44, segs: ['进官方入口'] }, { t: 26.68, segs: ['下载', { em: '对应系统' }, '的版本。'] }] },
  { t0: 28.18, t1: 30.95, lines: [{ t: 28.18, segs: ['第二步，'] }, { t: 29.44, segs: ['打开 ', { em: 'CC Switch' }, '，'] }] },
  { t0: 31.16, t1: 33.45, lines: [{ t: 31.16, segs: ['点顶部', { em: '第三个' }] }, { t: 32.18, segs: ['OpenAI 图标，'] }] },
  { t0: 33.6, t1: 35.4, lines: [{ t: 33.6, segs: ['点', { em: '加号' }] }, { t: 34.3, segs: ['选 ', { em: 'DeepSeek' }, '。'] }] },
  { t0: 35.58, t1: 37.95, lines: [{ t: 35.58, segs: ['直接点右下角'] }, { t: 36.62, segs: [{ em: '“获取 API Key”' }, '，'] }] },
  { t0: 38.18, t1: 39.72, lines: [{ t: 38.18, segs: ['在后台', { em: '充几块钱' }, '、'] }] },
  { t0: 39.88, t1: 41.6, lines: [{ t: 39.88, segs: [{ em: '新建密钥' }] }, { t: 40.56, segs: ['复制回来，'] }] },
  { t0: 41.82, t1: 43.35, lines: [{ t: 41.82, segs: ['粘贴进去'] }, { t: 42.52, segs: ['点', { em: '添加' }, '。'] }] },
  { t0: 43.6, t1: 45.1, lines: [{ t: 43.6, segs: ['第三步'] }, { t: 44.22, segs: [{ em: '最关键' }, '：'] }] },
  { t0: 45.34, t1: 47.55, lines: [{ t: 45.34, segs: ['去 CC Switch'] }, { t: 46.38, segs: [{ em: '左上角设置' }, '里，'] }] },
  { t0: 47.72, t1: 49.6, lines: [{ t: 47.72, segs: ['打开', { em: '本地路由' }] }, { t: 48.78, segs: ['总开关。'] }] },
  { t0: 49.8, t1: 51.6, lines: [{ t: 49.8, segs: ['最后再'] }, { t: 50.4, segs: [{ em: '重开 Codex' }, '，'] }] },
  { t0: 51.84, t1: 54.02, lines: [{ t: 51.84, segs: ['右下角显示 ', { em: 'DeepSeek' }] }, { t: 53.2, segs: ['就连上了！'] }] },
];

/** 步骤标题栏 */
export const STEPS = [
  { n: 1, t0: 18.3, t1: 28.2, title: '下载两个软件' },
  { n: 2, t0: 28.2, t1: 43.5, title: '添加 DeepSeek' },
  { n: 3, t0: 43.5, t1: 54.05, title: '打开本地路由' },
];

/** 录屏上的标注。rect/at 用源画面坐标（1834×1032，对应该时刻的原片画面），随取景自动换算。
 *  这些文字是操作提示，不是口播；只标注画面里真实存在的控件。 */
export type Tag = {
  t0: number; t1: number;
  rect?: [number, number, number, number]; // x0,y0,x1,y1 目标框（画红圈）
  round?: boolean;
  text?: string;
  side?: 'below' | 'above' | 'left' | 'right';
  dx?: number; dy?: number;
  pin?: 'top' | 'bottom'; // 不跟随目标，钉在录屏卡片顶部/底部
  icon?: 'lock' | 'check';
};
export const TAGS: Tag[] = [
  { t0: 18.75, t1: 20.4, pin: 'top', icon: 'lock', text: '官方入口　learn.chatgpt.com' },
  { t0: 21.25, t1: 22.25, rect: [768, 472, 1049, 534], text: '点这里下载', side: 'left' },
  { t0: 23.0, t1: 23.6, rect: [1412, 135, 1727, 275], text: '安装包开始下载', side: 'below' },
  { t0: 23.95, t1: 25.5, pin: 'top', icon: 'lock', text: '官方入口　cc-switch.cc' },
  { t0: 27.55, t1: 28.25, pin: 'top', text: '按自己的系统选' },
  { t0: 31.0, t1: 33.35, rect: [1076, 106, 1132, 162], round: true, text: '第 3 个：OpenAI', side: 'below', dx: 60 },
  { t0: 33.85, t1: 34.15, rect: [1672, 106, 1728, 162], round: true },
  { t0: 35.4, t1: 35.95, rect: [604, 602, 778, 644], text: '选 DeepSeek', side: 'below' },
  { t0: 36.75, t1: 38.2, rect: [118, 528, 240, 558], text: '点这里去官网拿 Key', side: 'right' },
  { t0: 38.5, t1: 39.75, rect: [614, 268, 1010, 352], text: '几块钱就够用', side: 'below' },
  { t0: 40.7, t1: 41.55, pin: 'top', icon: 'lock', text: '密钥只显示一次 · 画面已打码' },
  { t0: 41.75, t1: 42.45, pin: 'bottom', text: '粘贴到 API Key 一栏' },
  { t0: 42.6, t1: 43.35, rect: [1634, 902, 1706, 948], text: '点「添加」', side: 'left' },
  { t0: 43.6, t1: 45.15, rect: [170, 330, 500, 392], text: 'DeepSeek 已加入', side: 'right' },
  { t0: 45.3, t1: 45.95, rect: [232, 108, 274, 150], round: true, text: '左上角设置', side: 'below', dx: 40 },
  { t0: 47.55, t1: 48.25, rect: [523, 190, 926, 222], text: '切到「路由」', side: 'below' },
  { t0: 49.05, t1: 49.95, rect: [1612, 524, 1684, 564], text: '路由总开关', side: 'left' },
  { t0: 50.1, t1: 50.85, rect: [508, 610, 716, 660], text: '确认启用', side: 'below' },
  { t0: 51.0, t1: 51.75, rect: [822, 448, 884, 484], text: 'Codex 也打开', side: 'below' },
  { t0: 51.85, t1: 52.6, pin: 'bottom', icon: 'check', text: 'Codex 路由已启用' },
  { t0: 53.2, t1: 54.05, pin: 'bottom', icon: 'check', text: 'DeepSeek 连通正常 · 316ms' },
];

/** 钩子里录屏小卡片左侧的三步预告，与快闪镜头对应 */
export const PREVIEW_STEPS = [
  { n: 1, t: 14.2, label: '下载' },
  { n: 2, t: 14.93, label: '加 DeepSeek' },
  { n: 3, t: 15.56, label: '开路由' },
];

/** 收集全部上屏口播文字，供字体预加载 */
export function allText(): string {
  const segText = (s: Seg) => (typeof s === 'string' ? s : s.em);
  const a = KLINES.flatMap((k) => k.segs.map(segText));
  const b = CUES.flatMap((c) => c.lines.flatMap((l) => l.segs.map(segText)));
  const c = TAGS.map((t) => t.text ?? '');
  const d = STEPS.map((s) => s.title);
  const e = PREVIEW_STEPS.map((s) => s.label);
  const x = Object.values(CONTRAST.a).concat(Object.values(CONTRAST.b)).filter((v) => typeof v === 'string') as string[];
  return [...a, ...b, ...c, ...d, ...e, ...x, '阿泽 · AI 实操 示意 帮我清理 C 盘垃圾，把大文件挪到其他盘 本地磁盘 空间不足 实拍 第步 0123456789/ AI 数字人形象 顺手一提 三步回顾 实测连通 关注 +✓'].join('');
}
