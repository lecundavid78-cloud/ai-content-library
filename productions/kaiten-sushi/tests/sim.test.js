/*
 * 纯逻辑自动化测试（Node 直接运行：node tests/sim.test.js）
 *  1. 路径构建：长度、连续性、映射
 *  2. 布局：多种手机尺寸下各区域不重叠
 *  3. 循环：长时间空转，寿司不复制、不丢失、不重叠
 *  4. 随机操作模糊测试：数千次随机拿取/放置/取消，每一帧断言不变量
 *  5. 机器人通关：模拟“人类反应时间”的策略玩家打通三关，统计用时
 *  6. 超时失败、出口不判负
 */
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
['src/core/ns.js', 'src/core/path.js', 'src/core/sushi-types.js', 'src/core/layout.js', 'src/core/model.js',
  'src/levels/level1.js', 'src/levels/level2.js', 'src/levels/level3.js'].forEach(f => require(path.join(ROOT, f)));
const KS = globalThis.KS;

let pass = 0, fail = 0;
const results = [];
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } return cond; }
function section(name) { console.log('\n▶ ' + name); }

function build(level, viewW = 390, viewH = 844, seed = 1) {
  const L = KS.Layout.compute(viewW, viewH, 0, 0);
  const p = KS.Path.fromTrack(level.track, L.conveyor);
  const vis = p.visibleRange({ x: 0, y: 0, w: L.W, h: L.H }, 22);
  const m = new KS.Model(level, p, { seed, pickRange: vis });
  return { L, p, m, vis };
}

// ---------- 1. 路径 ----------
section('路径构建');
for (const lv of KS.LEVELS) {
  const { p, vis } = build(lv);
  let maxJump = 0;
  for (let i = 1; i < p.n; i++) maxJump = Math.max(maxJump, Math.hypot(p.xs[i] - p.xs[i - 1], p.ys[i] - p.ys[i - 1]));
  ok(maxJump <= 1.05, `关卡${lv.id} 路径采样连续 (最大步长 ${maxJump.toFixed(3)})`);
  ok(vis && vis.end - vis.start > 200, `关卡${lv.id} 可见段长度 ${vis && (vis.end - vis.start).toFixed(0)}`);
  console.log(`  关卡${lv.id} ${lv.shape}: 全长 ${p.length.toFixed(0)}，可见 ${vis.start.toFixed(0)}~${vis.end.toFixed(0)}，缩放 ${p.scale.toFixed(2)}`);
  for (const t of Object.keys(lv.sushi)) ok(lv.sushi[t] % 3 === 0, `关卡${lv.id} ${t} 数量是 3 的倍数`);
}
{
  // 平滑曲线 & 多段拼接也能构建（为后续复杂轨道准备）
  const snake = KS.Path.fromTrack({ segments: [
    { type: 'smooth', points: [[-60, 60], [100, 40], [200, 120], [300, 60], [360, 160]] },
    { type: 'polyline', points: [[360, 160], [360, 300], [-60, 300]], radius: 50 }
  ] }, { x: 0, y: 100, w: 390, h: 360 });
  ok(snake.length > 900, '蛇形多段轨道构建成功，长度 ' + snake.length.toFixed(0));
}

// ---------- 2. 布局 ----------
section('布局（不同手机尺寸）');
const sizes = [[360, 640], [375, 667], [375, 812], [390, 844], [390, 760], [393, 852], [412, 915], [414, 896], [430, 932], [360, 780], [768, 1024]];
function overlap(a, b) { const e = 0.01; return a.x < b.x + b.w - e && b.x < a.x + a.w - e && a.y < b.y + b.h - e && b.y < a.y + a.h - e; }
for (const [w, h] of sizes) {
  const L = KS.Layout.compute(w, h, 0, 0);
  const trayBoxes = L.trays.map(t => ({ x: t.x, y: t.y - 4, w: t.w, h: t.h + 14 }));
  let good = true;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) good = good && !overlap(L.trays[i].hit, L.trays[j].hit);
  good = good && !overlap(L.trays[2].hit, L.bufferHit);
  good = good && L.conveyor.y >= L.hud.y + 88 && L.conveyor.y + L.conveyor.h <= L.woodTop;
  good = good && trayBoxes.every(b => b.y > L.woodTop);
  good = good && L.buffer.y + L.buffer.h <= L.H;
  ok(good, `${w}×${h} 区域互不重叠`);
  // 每关传送带（含围挡）不越过木桌
  for (const lv of KS.LEVELS) {
    const p = KS.Path.fromTrack(lv.track, L.conveyor);
    const half = (lv.beltWidth / 2 + lv.wall) * p.scale;
    const b = p.bounds();
    ok(b.y - half >= L.hud.y + 84 && b.y + b.h + half <= L.woodTop + 2, `${w}×${h} 关卡${lv.id} 传送带在区域内`);
  }
  console.log(`  ${w}×${h} → 逻辑高 ${L.H.toFixed(0)}，传送带区 ${L.conveyor.h.toFixed(0)}，缩放 ${Math.min(1.15, L.conveyor.h / 360, 1).toFixed(2)}`);
}

// ---------- 3. 空转循环 ----------
section('长时间循环（不拿取）');
for (const lv of KS.LEVELS) {
  const { m } = build(lv);
  m.start();
  m.timeLeft = 1e9;
  const seenLoops = new Map();
  let errs = [];
  const firstOrder = m.belt.concat(m.kitchen).slice();
  for (let i = 0; i < 60 * 600; i++) {   // 10 分钟
    m.update(1 / 60);
    for (const e of m.drainEvents()) if (e.type === 'exit') seenLoops.set(e.id, (seenLoops.get(e.id) || 0) + 1);
    if (i % 10 === 0) { const e2 = m.checkInvariants(); if (e2.length) { errs = e2; break; } }
  }
  const c = m.counts();
  ok(errs.length === 0, `关卡${lv.id} 10 分钟空转无不变量错误 ${errs.slice(0, 2).join(';')}`);
  ok(c.belt + c.kitchen === m.total, `关卡${lv.id} 总数保持 ${m.total}（带上 ${c.belt} + 厨房 ${c.kitchen}）`);
  ok(seenLoops.size === m.total, `关卡${lv.id} 每个寿司都循环过 (${seenLoops.size}/${m.total})`);
  // 循环顺序保持（先进先出，身份不变）
  const order = m.belt.concat(m.kitchen);
  const rot = order.indexOf(firstOrder[0]);
  const rotated = order.slice(rot).concat(order.slice(0, rot));
  ok(JSON.stringify(rotated) === JSON.stringify(firstOrder), `关卡${lv.id} 循环顺序保持不变（同一批寿司反复出现）`);
}

// ---------- 4. 随机模糊测试 ----------
section('随机操作模糊测试');
for (const lv of KS.LEVELS) {
  let totalSteps = 0, actions = 0, rejects = 0, errs = [];
  for (let seed = 1; seed <= 40 && !errs.length; seed++) {
    const { m } = build(lv, 390, 844, seed);
    const r = KS.rng(seed * 7919);
    m.start();
    for (let i = 0; i < 60 * 200 && m.isActive(); i++) {
      m.update(1 / 60);
      totalSteps++;
      if (r() < 0.12) {
        actions++;
        const cands = m.sushi.filter(s => (s.loc === 'belt' && m.isPickableOnBelt(s.id)) || s.loc === 'buffer');
        if (!m.held && cands.length) {
          const s = r.pick(cands);
          if (m.pick(s.id)) {
            const x = r();
            let res;
            if (x < 0.4) res = m.autoPlaceHeld();
            else if (x < 0.75) res = m.drop({ kind: 'tray', index: r.int(3) });
            else if (x < 0.9) res = m.drop({ kind: 'buffer', index: r.int(5) });
            else if (x < 0.95) res = m.drop(null);
            // 其余情况：保持拿在手里若干帧（测试拿着时寿司经过出口）
            if (res && !res.ok) rejects++;
          }
        } else if (m.held && r() < 0.3) {
          m.drop(r() < 0.5 ? { kind: 'tray', index: r.int(3) } : null);
        }
      }
      m.drainEvents();
      const e = m.checkInvariants();
      if (e.length) { errs = e.map(x => `seed${seed} step${i}: ${x}`); break; }
    }
  }
  ok(errs.length === 0, `关卡${lv.id} ${totalSteps} 帧 / ${actions} 次随机操作（${rejects} 次被拒）不变量全部成立 ${errs.slice(0, 3).join(' | ')}`);
}

// ---------- 5. 机器人通关 ----------
section('策略机器人通关（模拟人类反应时间）');
function botPlay(lv, seed, reaction) {
  const { m } = build(lv, 390, 844, seed);
  m.start();
  let cd = 0.6, errs = 0, acts = 0;
  const dt = 1 / 60;
  while (m.isActive()) {
    m.update(dt);
    m.drainEvents();
    if (m.checkInvariants().length) errs++;
    cd -= dt;
    if (cd > 0 || m.status !== 'playing') continue;
    // 1) 暂存区里有能进托盘的 → 先挪
    let did = false;
    for (let b = 0; b < 5 && !did; b++) {
      const id = m.buffer[b];
      if (id === null) continue;
      const t = m.autoTray(m.sushi[id].type);
      // 只挪到“已锁定同类”的托盘，或空托盘且该类在暂存区里≥2个
      if (t >= 0 && (m.trays[t].type !== null || m.buffer.filter(x => x !== null && m.sushi[x].type === m.sushi[id].type).length >= 2)) {
        did = m.tap(id).ok;
      }
    }
    if (!did) {
      // 2) 传送带上（越靠近出口越优先）找能直接进同类托盘的
      const vis = m.belt.filter(id => m.isPickableOnBelt(id));
      let target = vis.find(id => { const t = m.autoTray(m.sushi[id].type); return t >= 0 && m.trays[t].type !== null; });
      // 3) 有空托盘：选一个
      if (target === undefined) target = vis.find(id => m.autoTray(m.sushi[id].type) >= 0);
      // 4) 存暂存区（留 1 格余量）
      if (target === undefined && m.buffer.filter(x => x === null).length > 1 && vis.length) target = vis[0];
      if (target !== undefined) did = m.tap(target).ok;
    }
    if (did) { acts++; cd = reaction; } else cd = 0.1;
  }
  return { won: m.status === 'won', used: m.elapsed, left: m.timeLeft, errs, acts, limit: lv.time };
}
for (const lv of KS.LEVELS) {
  for (const reaction of [0.6, 1.0, 1.4, 2.0]) {
    let wins = 0, used = [], errs = 0;
    const N = 30;
    for (let seed = 1; seed <= N; seed++) {
      const r = botPlay(lv, seed, reaction);
      if (r.won) { wins++; used.push(r.used); }
      errs += r.errs;
    }
    used.sort((a, b) => a - b);
    const med = used.length ? used[Math.floor(used.length / 2)] : NaN;
    const max = used.length ? used[used.length - 1] : NaN;
    const line = `关卡${lv.id} 反应 ${reaction}s：胜率 ${wins}/${N}，用时中位 ${med.toFixed(1)}s，最长 ${max.toFixed(1)}s（限时 ${lv.time}s）`;
    console.log('  ' + line);
    results.push(line);
    ok(errs === 0, `关卡${lv.id} 机器人对局不变量无错误`);
    if (reaction <= 1.0) ok(wins === N, `关卡${lv.id} 反应 ${reaction}s 的机器人应全部通关`);
  }
}

// ---------- 6. 失败与出口 ----------
section('胜负判定');
for (const lv of KS.LEVELS) {
  const { m } = build(lv);
  m.start();
  let exits = 0, lost = false;
  for (let i = 0; i < 60 * (lv.time + 2); i++) {
    m.update(1 / 60);
    for (const e of m.drainEvents()) { if (e.type === 'exit') exits++; if (e.type === 'lose') lost = true; if (e.type === 'lose' && i < 60 * lv.time - 2) ok(false, '提前失败'); }
  }
  ok(exits > 0 && m.status === 'lost' && lost, `关卡${lv.id} 寿司出口 ${exits} 次不判负，${lv.time}s 超时才失败`);
}
{
  // 拿着寿司时超时：寿司应被放回，数量守恒
  const lv = KS.LEVELS[0];
  const { m } = build(lv);
  m.start();
  const id = m.belt.find(i => m.isPickableOnBelt(i));
  m.pick(id);
  for (let i = 0; i < 60 * (lv.time + 1); i++) m.update(1 / 60);
  ok(m.status === 'lost' && !m.held && m.checkInvariants().length === 0, '拿在手里时超时，寿司被放回且不变量成立');
}
{
  // 托盘类型锁定 & 拒绝
  const lv = KS.LEVELS[1];
  const { m } = build(lv, 390, 844, 5);
  m.start();
  const vis = m.belt.filter(i => m.isPickableOnBelt(i));
  const a = vis[0];
  const b = vis.find(i => m.sushi[i].type !== m.sushi[a].type);
  m.pick(a); m.drop({ kind: 'tray', index: 0 });
  m.pick(b); const r = m.drop({ kind: 'tray', index: 0 });
  ok(!r.ok && r.reason === 'tray-type' && m.sushi[b].loc === 'belt', '不同种类放入已锁定托盘被拒绝，寿司回到传送带');
  ok(m.trays[0].type === m.sushi[a].type, '托盘锁定第一种放入的类型');
  m.pick(b); m.drop({ kind: 'buffer', index: 3 });
  ok(m.buffer[3] === b, '可放入指定暂存格');
  const r2 = m.tap(b);
  ok(r2.ok && m.sushi[b].loc === 'tray' && m.sushi[b].tray !== 0, '暂存区寿司可移动到空托盘');
  ok(m.checkInvariants().length === 0, '操作后不变量成立');
}
{
  // 第三个同类放入 → 消除，计数 +3，托盘解锁
  const lv = KS.LEVELS[0];
  const { m } = build(lv, 390, 844, 3);
  m.start();
  m.timeLeft = 1e6;
  let cleared = 0;
  for (let i = 0; i < 60 * 120 && cleared === 0; i++) {
    m.update(1 / 60);
    for (const e of m.drainEvents()) if (e.type === 'cleared') cleared++;
    const vis = m.belt.filter(id => m.isPickableOnBelt(id) && m.sushi[id].type === 'tuna');
    if (vis.length && !m.trays[0].clearing) { m.pick(vis[0]); m.drop({ kind: 'tray', index: 0 }); }
  }
  ok(cleared === 1 && m.clearedCount === 3 && m.trays[0].type === null, '凑齐 3 个后自动消除，托盘解锁');
}

console.log(`\n结果：${pass} 通过，${fail} 失败`);
if (process.env.SIM_SUMMARY) require('fs').writeFileSync(process.env.SIM_SUMMARY, results.join('\n'));
process.exit(fail ? 1 : 0);
