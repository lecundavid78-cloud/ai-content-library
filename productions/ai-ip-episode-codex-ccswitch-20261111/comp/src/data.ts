// V2 内容数据：口播上屏文字、步骤标题、录屏标注。
// 上屏口播文字逐句取自 文案_v2.md（素材 G 的实际口播）；tools/qa_text.mjs 会把这里的文字拼起来逐字比对。
// 时间以剪掉口误后的口播为准（原片 4.055s 之后整体前移 0.12s），锚点来自 audio/v2 的逐字时间戳与静音检测，未经人耳校对。

export const FPS = 30;
export const DURATION = 56.767;
export const FRAMES = 1703;

export type Seg = string | { em: string };
export type Line = { t: number; segs: Seg[] };
export type Cue = { t0: number; t1: number; lines: Line[] };

/** 时间分区 */
export const T = {
  hookEnd: 17.05, // 录屏卡片放大为主画面（第一步）
  stageIn: 13.5, // 录屏小卡片在钩子里出现（三步快闪）
  mock: 45.85, // 第 3 步后半：界面示意（重开 Codex，右下角显示 DeepSeek）
  tip: 49.65, // 录屏卡片退出，数字人回到主画面
  outro: 49.65,
  cta: 53.76, // 「先点关注」
};

/** 钩子、片尾：大字口播行（位于上半区）。y 为行顶，size 为字号。 */
export type KLine = { t0: number; t1: number; y: number; size: number; segs: Seg[] };
export const KLINES: KLine[] = [
  // ── 钩子一：痛点
  { t0: 0.0, t1: 2.42, y: 244, size: 190, segs: ['C盘', { em: '爆满' }] },
  { t0: 1.06, t1: 2.42, y: 462, size: 190, segs: ['不敢乱删？'] },
  // ── 钩子二：承诺 + 效果示意
  { t0: 2.5, t1: 6.95, y: 236, size: 92, segs: ['只发', { em: '一句话' }, '，'] },
  { t0: 3.69, t1: 6.95, y: 722, size: 84, segs: ['AI 就帮你', { em: '清除垃圾' }, '，'] },
  { t0: 5.32, t1: 6.95, y: 836, size: 84, segs: ['把大文件', { em: '挪去其他盘' }, '。'] },
  // ── 钩子四：三步（钩子三的对比卡在 Hook.tsx 里单独排版）
  { t0: 12.1, t1: 13.55, y: 256, size: 100, segs: ['没有账号也', { em: '别慌' }, '，'] },
  { t0: 13.59, t1: 15.14, y: 266, size: 84, segs: ['只需', { em: '三步' }, '，就能给它换上'] },
  { t0: 15.18, t1: 17.0, y: 200, size: 76, segs: ['几块钱就能用的'] },
  { t0: 16.2, t1: 17.0, y: 292, size: 76, segs: [{ em: 'DeepSeek 大脑' }, '。'] },
  // ── 片尾
  { t0: 49.95, t1: 53.62, y: 256, size: 80, segs: ['完整', { em: '一步一图' }, '的实操细节，'] },
  { t0: 51.89, t1: 53.62, y: 384, size: 74, segs: ['我已经放在', { em: '群内配套教程' }, '里。'] },
  { t0: 53.76, t1: 99, y: 236, size: 200, segs: ['先点', { em: '关注' }] },
  { t0: 54.94, t1: 99, y: 500, size: 84, segs: ['下期阿泽教你'] },
  { t0: 55.84, t1: 99, y: 624, size: 120, segs: [{ em: '实战用法' }, '！'] },
];

/** 钩子三：网页 AI vs Codex */
export const CONTRAST = {
  a: { t: 7.1, label: '普通网页 AI', big: '只能陪聊', tBig: 8.04, tail: '，' },
  b: { t: 9.0, l1: '而 Codex', t2: 9.86, l2: '能直接在你电脑里', t3: 10.98, big: '动手干活', tail: '。' },
  t1: 12.05,
};

/** 钩子二：模拟输入框与效果示意卡（不是口播，不参与字幕比对） */
export const PROMPT = {
  t0: 2.6, typeFrom: 2.72, typeTo: 3.42, send: 3.52,
  text: '帮我清理 C 盘垃圾，把大文件挪到其他盘',
  done: 4.2, // 绿色完成卡片弹出
  doneText: ['已清理 C盘 ', { em: '3.2 GB' }, '，转移 ', { em: '8.4 GB' }, ' 至 F 盘。'] as Seg[],
  t1: 6.95,
};

/** 步骤段字幕（数字人右侧，两行以内） */
export const CUES: Cue[] = [
  { t0: 17.39, t1: 19.62, lines: [{ t: 17.39, segs: ['第一步，'] }, { t: 18.29, segs: ['浏览器搜 ', { em: 'Codex' }, '，'] }] },
  { t0: 19.89, t1: 21.4, lines: [{ t: 19.89, segs: ['进', { em: '官方入口' }] }, { t: 20.66, segs: ['下载安装；'] }] },
  { t0: 21.6, t1: 23.36, lines: [{ t: 21.6, segs: ['再搜 ', { em: 'CC Switch' }, '，'] }] },
  { t0: 23.51, t1: 25.62, lines: [{ t: 23.51, segs: ['进官方入口'] }, { t: 24.24, segs: ['下载', { em: '对应系统' }, '的版本。'] }] },
  { t0: 25.85, t1: 27.98, lines: [{ t: 25.85, segs: ['第二步，'] }, { t: 26.82, segs: ['打开 ', { em: 'CC Switch' }, '，'] }] },
  { t0: 28.18, t1: 29.86, lines: [{ t: 28.18, segs: ['点顶部', { em: '第三个' }, '图标，'] }] },
  { t0: 29.93, t1: 31.5, lines: [{ t: 29.93, segs: ['点', { em: '加号' }] }, { t: 30.46, segs: ['选 ', { em: 'DeepSeek' }, '。'] }] },
  { t0: 31.66, t1: 34.3, lines: [{ t: 31.66, segs: ['直接点这里的'] }, { t: 32.7, segs: [{ em: '“获取 API Key”' }, '，'] }] },
  { t0: 34.39, t1: 35.72, lines: [{ t: 34.39, segs: ['在后台', { em: '充几块钱' }, '、'] }] },
  { t0: 35.81, t1: 37.24, lines: [{ t: 35.81, segs: [{ em: '新建密钥' }] }, { t: 36.44, segs: ['复制回来，'] }] },
  { t0: 37.36, t1: 38.7, lines: [{ t: 37.36, segs: ['粘贴进去'] }, { t: 37.98, segs: ['点', { em: '添加' }, '。'] }] },
  { t0: 38.9, t1: 40.5, lines: [{ t: 38.9, segs: ['第三步'] }, { t: 39.54, segs: [{ em: '最关键' }, '：'] }] },
  { t0: 40.66, t1: 42.6, lines: [{ t: 40.66, segs: ['去 CC Switch'] }, { t: 41.52, segs: [{ em: '左上角设置' }, '里，'] }] },
  { t0: 42.75, t1: 44.3, lines: [{ t: 42.75, segs: ['打开', { em: '本地路由' }] }, { t: 43.62, segs: ['总开关'] }] },
  { t0: 44.4, t1: 45.68, lines: [{ t: 44.4, segs: ['并', { em: '勾选 Codex' }, '。'] }] },
  { t0: 45.78, t1: 47.42, lines: [{ t: 45.78, segs: ['再', { em: '重开 Codex' }, '，'] }] },
  { t0: 47.5, t1: 49.62, lines: [{ t: 47.5, segs: ['右下角显示 ', { em: 'DeepSeek' }] }, { t: 48.74, segs: ['就连上了！'] }] },
];

/** 步骤标题栏 */
export const STEPS = [
  { n: 1, t0: 17.05, t1: 25.75, title: '下载两个软件' },
  { n: 2, t0: 25.75, t1: 38.75, title: '添加 DeepSeek' },
  { n: 3, t0: 38.75, t1: 49.65, title: '打开本地路由' },
];

/** 录屏上的标注。rect 用源画面坐标（1834×1032，对应该时刻的原片画面），随取景自动换算。
 *  只标注画面里真实存在的控件；任何标注都不含网址。 */
export type Tag = {
  t0: number; t1: number;
  rect?: [number, number, number, number];
  round?: boolean;
  text?: string;
  side?: 'below' | 'above' | 'left' | 'right';
  dx?: number; dy?: number;
  pin?: 'top' | 'bottom';
  icon?: 'lock' | 'check';
};
export const TAGS: Tag[] = [
  { t0: 17.35, t1: 19.85, pin: 'top', text: 'Codex 官方下载页' },
  { t0: 20.45, t1: 21.5, rect: [775, 474, 985, 530], text: '点「下载 Windows 版」', side: 'below', dy: 40 },
  { t0: 21.75, t1: 23.45, pin: 'top', text: 'CC Switch 官方下载页' },
  { t0: 25.0, t1: 25.75, pin: 'top', text: '按自己的系统选' },
  { t0: 28.35, t1: 29.8, rect: [1076, 106, 1132, 162], round: true, text: '第 3 个图标', side: 'below', dx: 60 },
  { t0: 30.0, t1: 30.35, rect: [1672, 106, 1728, 162], round: true },
  { t0: 30.95, t1: 31.6, rect: [604, 602, 778, 644], text: '选 DeepSeek', side: 'below' },
  { t0: 32.35, t1: 33.85, rect: [118, 528, 240, 558], text: '点这里获取 API Key', side: 'right' },
  { t0: 34.75, t1: 35.75, rect: [614, 268, 1010, 352], text: '充几块钱就够用', side: 'below' },
  { t0: 36.45, t1: 37.3, pin: 'top', icon: 'lock', text: '密钥只显示一次 · 画面已打码' },
  { t0: 37.4, t1: 37.95, pin: 'bottom', text: '粘贴到 API Key 一栏' },
  { t0: 38.0, t1: 38.75, rect: [1634, 902, 1706, 948], text: '点「添加」', side: 'left' },
  { t0: 38.95, t1: 40.6, rect: [170, 330, 500, 392], text: 'DeepSeek 已加入', side: 'right' },
  { t0: 41.35, t1: 42.1, rect: [232, 108, 274, 150], round: true, text: '左上角设置', side: 'below', dx: 40 },
  { t0: 42.8, t1: 43.3, rect: [523, 190, 926, 222], text: '切到「路由」', side: 'below' },
  { t0: 43.35, t1: 43.8, rect: [1598, 522, 1658, 558], text: '路由总开关', side: 'left' },
  { t0: 43.85, t1: 44.3, rect: [1594, 284, 1654, 320], text: '已打开', side: 'left' },
  { t0: 44.5, t1: 45.3, rect: [822, 448, 884, 484], text: '勾选 Codex', side: 'below' },
  { t0: 45.35, t1: 45.85, pin: 'bottom', icon: 'check', text: 'Codex 路由已启用' },
];

/** 三步预告/回顾 */
export const PREVIEW_STEPS = [
  { n: 1, t: 13.6, label: '下载' },
  { n: 2, t: 14.2, label: '加 DeepSeek' },
  { n: 3, t: 14.75, label: '开路由' },
];

/** 收集全部上屏文字，供字体预加载 */
export function allText(): string {
  const segText = (s: Seg) => (typeof s === 'string' ? s : s.em);
  const a = KLINES.flatMap((k) => k.segs.map(segText));
  const b = CUES.flatMap((c) => c.lines.flatMap((l) => l.segs.map(segText)));
  const c = TAGS.map((t) => t.text ?? '');
  const d = STEPS.map((s) => s.title);
  const e = PREVIEW_STEPS.map((s) => s.label);
  const x = Object.values(CONTRAST.a).concat(Object.values(CONTRAST.b)).filter((v) => typeof v === 'string') as string[];
  const p = [PROMPT.text, ...PROMPT.doneText.map(segText)];
  return [...a, ...b, ...c, ...d, ...e, ...x, ...p,
    '阿泽 · AI 实操 示意 效果示意 界面示意 本地磁盘 空间不足 实拍 第步 0123456789/ 三步给 Codex 换上 DeepSeek ①②③ 关注 +✓● 输入任务，让 Codex 动手… 正在重新启动 已连上 模型 本地 新对话 ▾'].join('');
}
