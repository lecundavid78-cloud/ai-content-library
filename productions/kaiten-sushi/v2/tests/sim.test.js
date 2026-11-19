/*
 * V2 纯逻辑自动化测试（node tests/sim.test.js）
 * 由 V1 的 107 项测试升级而来：保留全部不变量 / 长时间循环 / 多尺寸 / 模糊测试，扩展到 6 张地图；
 * V1 第 5 节“所有关卡机器人 30/30 必过”与 V2“第 3 关很难”的目标矛盾，改为：
 *   官方固定 seed 的可完成性（高手画像全部通关且有余量）+ 难度梯度统计。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('./lib/env');
const KS = E.KS;

let pass = 0, fail = 0;
const results = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error('  ✗ ' + msg); } return cond; }
function section(name) { console.log('\n▶ ' + name); }
const total = cfg => Object.keys(cfg.sushi).reduce((a, k) => a + cfg.sushi[k], 0);
const ntypes = cfg => Object.keys(cfg.sushi).length;

// ---------- 0. 配置与模式隔离 ----------
section('关卡/地图配置');
const ALL = E.ALL();
ok(KS.LEVELS.length === 3, '主线严格 3 关');
ok(KS.FREE_MAPS.length === 3, '自由地图 3 张');
ok(KS.LEVELS.every(c => c.mode === 'main') && KS.FREE_MAPS.every(c => c.mode === 'free'), 'mode 标记正确');
ok(KS.LEVELS.every(c => c.key.indexOf('main-') === 0) && KS.FREE_MAPS.every(c => c.key.indexOf('free-') === 0), '主线与自由地图 key 前缀隔离');
ok(new Set(ALL.map(c => c.key)).size === 6, '6 个 key 互不相同');
ok(KS.LEVELS.map(c => c.id).join() === '1,2,3', '主线 id 为 1,2,3（KS.LEVELS 下标 = id-1）');
ok(KS.findMap('free-z') && KS.findMap('free-z').mode === 'free' && KS.findMap('nope') === null && KS.findMap('') === null, 'findMap 能查到有效 key、拒绝无效值');
const artSrc = fs.readFileSync(path.join(E.ROOT, 'src/art/sushi-art.js'), 'utf8');
for (const cfg of ALL) {
  ok(Number.isInteger(cfg.seed), `${cfg.key} 有固定整数 seed (${cfg.seed})`);
  for (const t of Object.keys(cfg.sushi)) {
    ok(cfg.sushi[t] > 0 && cfg.sushi[t] % 3 === 0, `${cfg.key} ${t}×${cfg.sushi[t]} 是 3 的倍数`);
    ok(!!KS.SUSHI_TYPES[t] && KS.SUSHI_ORDER.indexOf(t) >= 0 && new RegExp('\\b' + t + ': draw').test(artSrc), `${cfg.key} ${t} 有类型登记和绘制函数`);
  }
}
const spec = { 'main-1': [9, 2], 'main-2': [24, 4], 'main-3': [42, 7], 'free-u': [24, 4], 'free-z': [30, 5], 'free-double': [36, 8] };
for (const k of Object.keys(spec)) {
  const c = KS.findMap(k);
  ok(total(c) === spec[k][0] && ntypes(c) === spec[k][1], `${k} 组合 ${total(c)} 个 / ${ntypes(c)} 种（规格 ${spec[k][0]}/${spec[k][1]}）`);
}
ok(KS.findMap('main-3').sushi.inari === 6, '第 3 关含新寿司豆皮寿司');
const dbl = KS.findMap('free-double').sushi;
ok(Object.values(dbl).filter(n => n === 6).length === 4 && Object.values(dbl).filter(n => n === 3).length === 4 && dbl.hotate === 3, '双层折返：4 种×6 + 4 种×3，含扇贝');
ok(JSON.stringify(KS.findMap('main-2').track.points) === JSON.stringify([[-80, 76], [338, 76], [338, 180], [52, 180], [52, 284], [470, 284]]), '第 2 关沿用 V1 的 S 型轨道');
ok(JSON.stringify(KS.findMap('free-u').track.points) === JSON.stringify([[-80, 92], [338, 92], [338, 268], [-80, 268]]), '自由图 U 型复用 V1 第 2 关轨道');
ok(ALL.filter(c => c.mode === 'main').every((c, i, a) => i === 0 || c.difficulty > a[i - 1].difficulty), '主线难度标注逐关递增');

// ---------- 1. 路径 ----------
section('路径几何（6 张地图）');
for (const cfg of ALL) {
  const { p, pr, L } = E.build(cfg);
  let maxJump = 0;
  for (let i = 1; i < p.n; i++) maxJump = Math.max(maxJump, Math.hypot(p.xs[i] - p.xs[i - 1], p.ys[i] - p.ys[i - 1]));
  ok(maxJump <= 1.05, `${cfg.key} 采样连续 (最大步长 ${maxJump.toFixed(3)})`);
  ok(pr.end - pr.start > 300, `${cfg.key} 可拿取段 ${pr.start.toFixed(0)}~${pr.end.toFixed(0)}`);
  // 非相邻轨道段不重叠：弧长相距较远的两点，带面中心距至少 = 带宽 + 0.9 围挡
  const W = cfg.beltWidth * p.scale, wall = cfg.wall * p.scale;
  let minD = Infinity;
  const step = 4;
  for (let i = 0; i < p.n; i += step) {
    for (let j = i + Math.ceil(3 * W); j < p.n; j += step) {
      const d = Math.hypot(p.xs[i] - p.xs[j], p.ys[i] - p.ys[j]);
      if (d < minD) minD = d;
    }
  }
  ok(minD >= W + 0.9 * wall, `${cfg.key} 非相邻车道不重叠（最近 ${minD.toFixed(1)} ≥ ${(W + 0.9 * wall).toFixed(1)}）`);
  // 点击热区：盘子热区半径 < 车道间距的一半 → 不同车道的盘子热区不重叠
  const R = W * 0.43 * 1.18;
  ok(2 * R <= minD + 0.5, `${cfg.key} 相邻车道盘子热区不重叠（2R=${(2 * R).toFixed(1)}）`);
  ok(L.W === 390, `${cfg.key} 布局宽度`);
  console.log(`  ${cfg.key} ${cfg.shape}: 全长 ${p.length.toFixed(0)}，缩放 ${p.scale.toFixed(2)}，车道最近距离 ${minD.toFixed(0)}`);
}
{
  const snake = KS.Path.fromTrack({ segments: [
    { type: 'smooth', points: [[-60, 60], [100, 40], [200, 120], [300, 60], [360, 160]] },
    { type: 'polyline', points: [[360, 160], [360, 300], [-60, 300]], radius: 50 }
  ] }, { x: 0, y: 100, w: 390, h: 360 });
  ok(snake.length > 900, '平滑曲线+折线多段拼接仍可构建，长度 ' + snake.length.toFixed(0));
}
{
  // 回字螺旋：出口在画面内（中心门帘），入口在屏幕左边缘
  const { p, L } = E.build(KS.findMap('main-3'));
  const end = p.at(p.length, {}), start = p.at(0, {});
  ok(end.x > 40 && end.x < L.W - 40 && start.x < 0, '第 3 关入口在屏外、出口在画面中部');
  const { pr } = E.build(KS.findMap('main-3'));
  ok(pr.end <= p.length - 26, '画面内出口门帘下 26px 不可拿取');
}

// ---------- 2. 布局 ----------
section('布局（不同手机尺寸 × 6 张地图）');
const sizes = [[360, 640], [375, 667], [375, 812], [390, 844], [390, 760], [393, 852], [412, 915], [414, 896], [430, 932], [360, 780], [768, 1024]];
function overlap(a, b) { const e = 0.01; return a.x < b.x + b.w - e && b.x < a.x + a.w - e && a.y < b.y + b.h - e && b.y < a.y + a.h - e; }
for (const [w, h] of sizes) {
  for (const [st, sb] of [[0, 0], [47, 34]]) {
    const L = KS.Layout.compute(w, h, st, sb);
    let good = true;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) good = good && !overlap(L.trays[i].hit, L.trays[j].hit);
    good = good && !overlap(L.trays[2].hit, L.bufferHit);
    good = good && L.conveyor.y >= L.hud.y + 88 && L.conveyor.y + L.conveyor.h <= L.woodTop;
    good = good && L.buffer.y + L.buffer.h <= L.H;
    ok(good, `${w}×${h} 安全区(${st},${sb}) 区域互不重叠`);
    for (const cfg of ALL) {
      const p = KS.Path.fromTrack(cfg.track, L.conveyor);
      const half = (cfg.beltWidth / 2 + cfg.wall) * p.scale;
      const b = p.bounds();
      ok(b.y - half >= L.hud.y + 84 && b.y + b.h + half <= L.woodTop + 2, `${w}×${h}(${st},${sb}) ${cfg.key} 传送带在区域内`);
    }
  }
}

// ---------- 3. 长时间循环 ----------
section('长时间循环（不拿取，每张图 2 个 seed × 10 分钟）');
for (const cfg of ALL) {
  for (const seed of [undefined, 77]) {
    const { m } = E.build(cfg, { seed });
    m.start(); m.timeLeft = 1e9;
    const seen = new Map();
    let errs = [];
    const firstOrder = m.belt.concat(m.kitchen).slice();
    for (let i = 0; i < 60 * 600; i++) {
      m.update(1 / 60);
      for (const e of m.drainEvents()) if (e.type === 'exit') seen.set(e.id, (seen.get(e.id) || 0) + 1);
      if (i % 10 === 0) { const e2 = m.checkInvariants(); if (e2.length) { errs = e2; break; } }
    }
    const c = m.counts();
    const tag = `${cfg.key} seed=${seed === undefined ? cfg.seed + '(官方)' : seed}`;
    ok(errs.length === 0, `${tag} 无不变量错误 ${errs.slice(0, 2).join(';')}`);
    ok(c.belt + c.kitchen === m.total, `${tag} 总数保持 ${m.total}`);
    ok(seen.size === m.total, `${tag} 每个寿司都循环过 (${seen.size}/${m.total})`);
    const order = m.belt.concat(m.kitchen);
    const rot = order.indexOf(firstOrder[0]);
    ok(JSON.stringify(order.slice(rot).concat(order.slice(0, rot))) === JSON.stringify(firstOrder), `${tag} 循环顺序不变（出口→厨房→入口）`);
  }
}

// ---------- 4. 随机模糊测试 ----------
section('随机操作模糊测试（每张图 25 个 seed）');
for (const cfg of ALL) {
  let steps = 0, actions = 0, rejects = 0, errs = [];
  for (let seed = 1; seed <= 25 && !errs.length; seed++) {
    const { m } = E.build(cfg, { seed });
    const r = KS.rng(seed * 7919);
    m.start();
    for (let i = 0; i < 60 * 200 && m.isActive(); i++) {
      m.update(1 / 60); steps++;
      if (r() < 0.12) {
        actions++;
        const cands = m.sushi.filter(s => (s.loc === 'belt' && m.isPickableOnBelt(s.id)) || s.loc === 'buffer');
        if (!m.held && cands.length) {
          const s = r.pick(cands);
          if (m.pick(s.id)) {
            const x = r(); let res;
            if (x < 0.4) res = m.autoPlaceHeld();
            else if (x < 0.75) res = m.drop({ kind: 'tray', index: r.int(3) });
            else if (x < 0.9) res = m.drop({ kind: 'buffer', index: r.int(5) });
            else if (x < 0.95) res = m.drop(null);
            if (res && !res.ok) rejects++;
          }
        } else if (m.held && r() < 0.3) m.drop(r() < 0.5 ? { kind: 'tray', index: r.int(3) } : null);
      }
      m.drainEvents();
      const e = m.checkInvariants();
      if (e.length) { errs = e.map(x => `seed${seed} step${i}: ${x}`); break; }
    }
  }
  ok(errs.length === 0, `${cfg.key} ${steps} 帧 / ${actions} 次随机操作（${rejects} 次被拒）不变量全部成立 ${errs.slice(0, 3).join(' | ')}`);
}

// ---------- 5. 固定局面 ----------
section('固定 seed / 可复现');
for (const cfg of ALL) {
  const a = E.build(cfg).m, b = E.build(cfg).m;
  const order = m => m.sushi.map(s => s.type).join(',');
  ok(a.seed === cfg.seed && order(a) === order(b), `${cfg.key} 正常开局两次局面完全相同（seed ${cfg.seed}）`);
  const c = E.build(cfg, { seed: cfg.seed + 1 }).m;
  ok(c.seed === cfg.seed + 1 && order(c) !== order(a), `${cfg.key} 调试 ?seed= 覆盖后局面不同，且不改动配置 seed`);
  ok(cfg.seed === E.build(cfg).m.seed, `${cfg.key} 覆盖后再次正常开局仍用配置 seed`);
  // 类型顺序不依赖对象键顺序
  const shuffledKeys = Object.assign({}, cfg, { sushi: Object.keys(cfg.sushi).reverse().reduce((o, k) => (o[k] = cfg.sushi[k], o), {}) });
  ok(order(E.build(shuffledKeys).m) === order(a), `${cfg.key} 同 seed 下局面不依赖配置里寿司键的书写顺序`);
}
// 同一局两次相同操作序列 → 结果完全一致（确定性）
{
  const cfg = KS.findMap('main-3');
  const r1 = E.play(cfg, E.PROFILES.average, 5), r2 = E.play(cfg, E.PROFILES.average, 5);
  ok(JSON.stringify(r1) === JSON.stringify(r2), '相同 seed + 相同操作 → 完全相同结果');
}

// ---------- 6. 可通关性与难度梯度 ----------
section('官方 seed 可通关性与难度梯度（模拟玩家，非真人数据）');
const N = 40;
const table = {};
for (const cfg of ALL) {
  table[cfg.key] = {};
  const parts = [];
  for (const k of Object.keys(E.PROFILES)) {
    const s = E.stats(cfg, E.PROFILES[k], N, { checkInvariants: k === 'average' });
    table[cfg.key][k] = s;
    parts.push(`${E.PROFILES[k].label} ${(s.rate * 100).toFixed(0)}% 中位 ${isNaN(s.median) ? '-' : s.median.toFixed(1)}s`);
  }
  const line = `${cfg.key}（seed ${cfg.seed}，${cfg.time}s）：${parts.join('；')}`;
  console.log('  ' + line); results.push(line);
  const ex = table[cfg.key].expert;
  ok(ex.rate === 1 && ex.minLeft >= 15, `${cfg.key} 高手画像 ${N}/${N} 通关，最少剩余 ${ex.minLeft.toFixed(1)}s ≥ 15s（可通关，非必输）`);
  ok(table[cfg.key].skilled.rate >= 0.9, `${cfg.key} 熟练画像通关率 ≥ 90%（练习后能过）`);
}
{
  const nv = k => table[k].novice.rate;
  ok(nv('main-1') === 1 && table['main-1'].novice.median <= 25, `第 1 关新手画像全部通过，中位 ${table['main-1'].novice.median.toFixed(1)}s ≤ 25s`);
  ok(nv('main-1') >= nv('main-2') && nv('main-2') > nv('main-3'), `主线难度梯度：新手通关率 ${nv('main-1')} ≥ ${nv('main-2')} > ${nv('main-3')}`);
  ok(nv('main-3') <= 0.35, `第 3 关新手画像通关率 ${(nv('main-3') * 100).toFixed(0)}% ≤ 35%（多数人第一次过不去）`);
  ok(table['main-3'].average.rate >= 0.5, `第 3 关普通画像通关率 ${(table['main-3'].average.rate * 100).toFixed(0)}% ≥ 50%（可复盘重试通关）`);
  ok(nv('free-u') >= nv('free-z') && nv('free-z') >= nv('free-double'), '自由图难度标注与模拟结果一致：U ≥ Z ≥ 双层');
}

// ---------- 7. 胜负判定 ----------
section('胜负判定');
for (const cfg of ALL) {
  const { m } = E.build(cfg);
  m.start();
  let exits = 0, lost = false, early = false;
  for (let i = 0; i < 60 * (cfg.time + 2); i++) {
    m.update(1 / 60);
    for (const e of m.drainEvents()) { if (e.type === 'exit') exits++; if (e.type === 'lose') { lost = true; if (i < 60 * cfg.time - 2) early = true; } }
  }
  ok(exits > 0 && m.status === 'lost' && lost && !early, `${cfg.key} 寿司出口 ${exits} 次不判负，${cfg.time}s 超时才失败`);
}
{
  const cfg = KS.LEVELS[0];
  const { m } = E.build(cfg);
  m.start();
  m.pick(m.belt.find(i => m.isPickableOnBelt(i)));
  for (let i = 0; i < 60 * (cfg.time + 1); i++) m.update(1 / 60);
  ok(m.status === 'lost' && !m.held && m.checkInvariants().length === 0, '拿在手里时超时，寿司被放回且不变量成立');
}
{
  const { m } = E.build(KS.findMap('main-2'), { seed: 5 });
  m.start();
  const vis = m.belt.filter(i => m.isPickableOnBelt(i));
  const a = vis[0], b = vis.find(i => m.sushi[i].type !== m.sushi[a].type);
  m.pick(a); m.drop({ kind: 'tray', index: 0 });
  m.pick(b); const r = m.drop({ kind: 'tray', index: 0 });
  ok(!r.ok && r.reason === 'tray-type' && m.sushi[b].loc === 'belt', '不同种类放入已锁定托盘被拒绝，寿司回到传送带');
  m.pick(b); m.drop({ kind: 'buffer', index: 3 });
  ok(m.buffer[3] === b, '可放入指定暂存格');
  ok(m.tap(b).ok && m.sushi[b].loc === 'tray' && m.sushi[b].tray !== 0, '暂存区寿司可移动到空托盘');
  ok(m.trays.length === 3 && m.trays.every(t => t.slots.length === 3) && m.buffer.length === 5, '保持 3 个托盘 × 3 格 + 5 格暂存');
}
{
  const { m } = E.build(KS.findMap('main-3'));
  m.start(); m.timeLeft = 1e6;
  let cleared = 0;
  for (let i = 0; i < 60 * 200 && cleared === 0; i++) {
    m.update(1 / 60);
    for (const e of m.drainEvents()) if (e.type === 'cleared') cleared++;
    const v = m.belt.filter(id => m.isPickableOnBelt(id) && m.sushi[id].type === 'inari');
    if (v.length && !m.trays[0].clearing) { m.pick(v[0]); m.drop({ kind: 'tray', index: 0 }); }
  }
  ok(cleared === 1 && m.clearedCount === 3 && m.trays[0].type === null, '新寿司豆皮寿司凑齐 3 个后正常消除，托盘解锁');
}

console.log(`\n结果：${pass} 通过，${fail} 失败`);
if (process.env.SIM_SUMMARY) fs.writeFileSync(process.env.SIM_SUMMARY, results.join('\n') + '\n');
process.exit(fail ? 1 : 0);
