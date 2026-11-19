/*
 * Node 测试环境：加载 V2 的核心逻辑与全部 6 张地图配置（与浏览器同一份源码）。
 * 并提供“模拟玩家”机器人，供 sim.test.js / tune.js 共用。
 */
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FILES = ['src/core/ns.js', 'src/core/path.js', 'src/core/sushi-types.js', 'src/core/layout.js', 'src/core/model.js',
  'src/levels/level1.js', 'src/levels/level2.js', 'src/levels/level3.js',
  'src/levels/free-u.js', 'src/levels/free-z.js', 'src/levels/free-double.js'];
if (!globalThis.KS || !globalThis.KS.FREE_MAPS || !globalThis.KS.FREE_MAPS.length) {
  FILES.forEach(f => require(path.join(ROOT, f)));
}
const KS = globalThis.KS;
const ALL = () => KS.LEVELS.concat(KS.FREE_MAPS);

/** 与 play.js 相同的可拿取范围计算（屏幕内 22 边距，避开画面内门帘 26） */
function pickRangeOf(p, L) {
  const screen = { x: 0, y: 0, w: L.W, h: L.H };
  const vis = p.visibleRange(screen, 22) || { start: 0, end: p.length };
  return { start: Math.max(vis.start, 26), end: Math.min(vis.end, p.length - 26) };
}

function build(cfg, opts = {}) {
  const L = KS.Layout.compute(opts.w || 390, opts.h || 844, 0, 0);
  const p = KS.Path.fromTrack(cfg.track, L.conveyor);
  const pr = pickRangeOf(p, L);
  const m = new KS.Model(cfg, p, { seed: opts.seed, pickRange: pr });
  return { L, p, m, pr };
}

/**
 * 模拟玩家画像（只用于发现必输/节奏问题，不等于真人胜率）
 *   reaction：两次操作的平均间隔（秒，含看清、伸手、点中）
 *   mistake ：每次操作有多大概率“随手点一个”而不是按策略
 *   另有“视觉搜索成本”：种类越多反应越慢（每多 1 种 +8%）——这是建模假设，不是实测
 */
const PROFILES = {
  expert:  { reaction: 0.55, mistake: 0.0,  label: '高手(0.55s/0%)' },
  skilled: { reaction: 0.85, mistake: 0.05, label: '熟练(0.85s/5%)' },
  average: { reaction: 1.2,  mistake: 0.12, label: '普通(1.2s/12%)' },
  novice:  { reaction: 1.7,  mistake: 0.2,  label: '新手(1.7s/20%)' }
};

function countBy(ids, m) {
  const c = {};
  ids.forEach(id => { if (id !== null) { const t = m.sushi[id].type; c[t] = (c[t] || 0) + 1; } });
  return c;
}

/** 选择一个操作；返回要 tap 的寿司 id 或 -1 */
function decide(m, rnd, mistake) {
  const vis = m.belt.filter(id => m.isPickableOnBelt(id));   // 按 s 从大到小（离出口近的在前）
  if (mistake && rnd() < mistake && vis.length) return vis[Math.floor(rnd() * vis.length)];
  const locked = {};
  m.trays.forEach((t, i) => { if (t.type && !t.clearing && t.slots.indexOf(null) >= 0) locked[t.type] = i; });
  // a) 暂存区 → 已锁定同类托盘
  for (let b = 0; b < 5; b++) { const id = m.buffer[b]; if (id !== null && locked[m.sushi[id].type] !== undefined) return id; }
  // b) 传送带 → 已锁定同类托盘
  const hit = vis.find(id => locked[m.sushi[id].type] !== undefined);
  if (hit !== undefined) return hit;
  // c) 有空托盘：选“暂存区里最多 + 传送带上最多”的类型开新盘
  const empty = m.trays.some(t => t.type === null && !t.clearing);
  const bufC = countBy(m.buffer, m), visC = countBy(vis, m);
  if (empty) {
    let best = null, bs = -1;
    Object.keys(Object.assign({}, bufC, visC)).forEach(t => {
      if (locked[t] !== undefined) return;
      const sc = (bufC[t] || 0) * 2 + (visC[t] || 0);
      if (sc > bs) { bs = sc; best = t; }
    });
    if (best) {
      const fromBuf = m.buffer.find(id => id !== null && m.sushi[id].type === best);
      if (fromBuf !== undefined) return fromBuf;
      const fromBelt = vis.find(id => m.sushi[id].type === best);
      if (fromBelt !== undefined) return fromBelt;
    }
  }
  // d) 存暂存区（保留 1 格余量），优先凑对
  const free = m.buffer.filter(x => x === null).length;
  if (free >= 2 && vis.length) {
    const pair = vis.find(id => bufC[m.sushi[id].type] && locked[m.sushi[id].type] === undefined);
    if (pair !== undefined) return pair;
    if (free >= 3) return vis[0];
  }
  return -1;
}

/** 跑一局；返回 {won, used, left, actions, rejects, invErr, bufferFullTime} */
function play(cfg, profile, botSeed, opts = {}) {
  const { m } = build(cfg, opts);
  const rnd = KS.rng(botSeed * 7919 + 13);
  // 视觉搜索成本假设：种类越多，人找到目标越慢（每多 1 种 +8%），2 种为基准
  const slow = 1 + 0.08 * (Object.keys(cfg.sushi).length - 2);
  m.start();
  const dt = 1 / 30;
  let cd = 0.8, actions = 0, rejects = 0, invErr = 0, bufferFullTime = 0;
  while (m.isActive()) {
    m.update(dt);
    m.drainEvents();
    if (opts.checkInvariants && m.checkInvariants().length) invErr++;
    if (m.freeBufferSlot() < 0) bufferFullTime += dt;
    cd -= dt;
    if (cd > 0 || m.status !== 'playing') continue;
    const id = decide(m, rnd, profile.mistake);
    if (id < 0) { cd = 0.15; continue; }
    const r = m.tap(id);
    if (!r.ok) rejects++;
    actions++;
    cd = profile.reaction * slow * (0.7 + 0.6 * rnd());
  }
  return { won: m.status === 'won', used: m.elapsed, left: m.timeLeft, actions, rejects, invErr, bufferFullTime };
}

function stats(cfg, profile, runs, opts = {}) {
  let wins = 0; const used = [], lefts = [];
  for (let i = 1; i <= runs; i++) {
    const r = play(cfg, profile, i, opts);
    if (r.won) { wins++; used.push(r.used); lefts.push(r.left); }
  }
  used.sort((a, b) => a - b); lefts.sort((a, b) => a - b);
  return {
    runs, wins, rate: wins / runs,
    median: used.length ? used[Math.floor(used.length / 2)] : NaN,
    minLeft: lefts.length ? lefts[0] : NaN
  };
}

module.exports = { KS, ALL, build, pickRangeOf, PROFILES, play, stats, decide, ROOT };
