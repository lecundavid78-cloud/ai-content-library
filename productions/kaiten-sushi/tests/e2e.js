/*
 * 端到端测试 + 截图 + 录屏（无头 Chrome，模拟手机竖屏触摸）
 *   node tests/e2e.js            全部
 *   node tests/e2e.js --no-video 跳过录屏
 * 使用手动时钟(?manual=1)：每一帧由测试推进，录屏帧率稳定、结果可复现。
 * 所有操作都通过 page.touchscreen 发出真实触摸事件（不是直接调用模型）。
 */
'use strict';
const puppeteer = require('../tools/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const SHOTS = path.join(OUT, 'screenshots');
const FRAMES = path.join(OUT, '.frames');
const VIDEO = !process.argv.includes('--no-video');
fs.mkdirSync(SHOTS, { recursive: true });

const report = [];
let failures = 0;
function check(cond, msg) { report.push((cond ? '✓ ' : '✗ ') + msg); if (!cond) failures++; console.log((cond ? '  ✓ ' : '  ✗ ') + msg); }

let page, browser, frameNo = 0, recording = false;

async function open(query, w = 390, h = 844) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?manual=1&' + query);
  await page.evaluate(() => KSDebug.step(1, 1 / 30));
}
async function step(n = 1) {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => KSDebug.step(1, 1 / 30));
    if (recording) {
      await page.screenshot({ path: path.join(FRAMES, String(frameNo++).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 82 });
    }
  }
}
async function shot(name) { await page.screenshot({ path: path.join(SHOTS, name) }); console.log('  📷 ' + name); }
const S = () => page.evaluate(() => {
  const m = KSDebug.model(); if (!m) return null;
  return { status: m.status, counts: m.counts(), trays: m.trays.map(t => ({ type: t.type, n: t.slots.filter(x => x !== null).length, clearing: t.clearing })), buffer: m.buffer.slice(), held: m.held, timeLeft: m.timeLeft, elapsed: m.elapsed, inv: m.checkInvariants() };
});

/** 真实触摸：点击 */
async function tap(x, y, hold = 2) {
  await page.touchscreen.touchStart(x, y);
  await step(hold);
  await page.touchscreen.touchEnd();
  await step(1);
}
/** 真实触摸：拖动（逐帧移动，带缓动） */
async function drag(x0, y0, x1, y1, frames = 12) {
  await page.touchscreen.touchStart(x0, y0);
  await step(2);
  for (let i = 1; i <= frames; i++) {
    const t = i / frames, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.touchscreen.touchMove(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
    await step(1);
  }
  await step(2);
  await page.touchscreen.touchEnd();
  await step(1);
}

/** 浏览器端策略：选出下一步要点的寿司（返回屏幕坐标和方式） */
async function decide() {
  return page.evaluate(() => {
    const m = KSDebug.model();
    if (m.status !== 'playing' || m.held) return null;
    const L = KSDebug.layout();
    for (let b = 0; b < 5; b++) {
      const id = m.buffer[b]; if (id === null) continue;
      const t = m.autoTray(m.sushi[id].type);
      if (t >= 0 && (m.trays[t].type !== null || m.buffer.filter(x => x !== null && m.sushi[x].type === m.sushi[id].type).length >= 2)) {
        return { id, from: 'buffer', p: KSDebug.screenPos(id) };
      }
    }
    // 只选在屏幕中段（不在门帘下）的寿司，更像真人
    const vis = m.belt.filter(id => m.isPickableOnBelt(id) && m.sushi[id].s > m.pickRange.start + 20 && m.sushi[id].s < m.pickRange.end - 40);
    let target = vis.find(id => { const t = m.autoTray(m.sushi[id].type); return t >= 0 && m.trays[t].type !== null; });
    if (target === undefined) target = vis.find(id => m.autoTray(m.sushi[id].type) >= 0);
    if (target !== undefined) return { id: target, from: 'belt', p: KSDebug.screenPos(target) };
    if (m.buffer.filter(x => x === null).length > 1 && vis.length) {
      const b = m.buffer.indexOf(null);
      const bs = L.bufferSlots[b];
      return { id: vis[0], from: 'belt', p: KSDebug.screenPos(vis[0]), toBuffer: KSDebug.toScreen(bs.cx, bs.cy) };
    }
    return null;
  });
}

/** 用真实触摸打完一关。gap：两次操作之间的帧数（模拟人的反应） */
async function playLevel(levelNo, opts = {}) {
  const gap = opts.gap || 8;
  let actions = 0, drags = 0, guard = 0, invErr = 0;
  const midShots = opts.midShots || {};
  while (guard++ < 6000) {
    const st = await S();
    if (st.inv.length) invErr++;
    if (st.status === 'won' || st.status === 'lost') break;
    if (st.status !== 'playing') { await step(1); continue; }
    const d = await decide();
    if (!d) { await step(3); continue; }
    if (d.toBuffer) { await drag(d.p.x, d.p.y, d.toBuffer.x, d.toBuffer.y + 20); drags++; }
    else await tap(d.p.x, d.p.y);
    actions++;
    for (const k of Object.keys(midShots)) {
      if (actions === +k) { await step(midShots[k].wait || 0); await shot(midShots[k].name); }
    }
    await step(gap);
  }
  await step(40);
  const st = await S();
  return { st, actions, drags, invErr };
}

(async () => {
  browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') pageErrors.push(m.text()); });

  // ---------- 1. 开始画面 ----------
  console.log('\n▶ 开始画面与选关');
  await open('');
  await step(30);
  await shot('01_开始画面.png');
  const cardPos = await page.evaluate(() => { const c = KSDebug.scene().cards()[0]; return KSDebug.toScreen(c.x + c.w / 2, c.y + c.h / 2); });
  await tap(cardPos.x, cardPos.y);
  check(await page.evaluate(() => !!KSDebug.model() && KSDebug.model().level.id === 1), '点击关卡卡片进入第 1 关');

  // ---------- 2. 第 1 关：点击、拖动、拒绝反馈 ----------
  console.log('\n▶ 第 1 关交互');
  await open('level=1&seed=7');
  await step(20);
  await shot('02_第1关_开场.png');
  await step(70);
  await shot('03_第1关_新手提示.png');
  let st = await S();
  check(st.status === 'playing', '开场倒计时后进入进行状态');
  // 点一下 → 自动进托盘
  let d = await page.evaluate(() => { const m = KSDebug.model(); const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].s > m.pickRange.start + 40); return { id, type: m.sushi[id].type, p: KSDebug.screenPos(id) }; });
  await tap(d.p.x, d.p.y);
  st = await S();
  check(st.trays[0].type === d.type && st.trays[0].n === 1, `点击传送带寿司（${d.type}）→ 自动放入托盘 1`);
  // 拿起时的弹跳效果截图
  d = await page.evaluate(() => { const m = KSDebug.model(); const t0 = m.trays[0].type; const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].type !== t0 && m.sushi[i].s > m.pickRange.start + 40); return { id, type: m.sushi[id].type, p: KSDebug.screenPos(id) }; });
  const tray0 = await page.evaluate(() => { const t = KSDebug.layout().trays[0]; return KSDebug.toScreen(t.cx, t.cy); });
  await page.touchscreen.touchStart(d.p.x, d.p.y); await step(2);
  for (let i = 1; i <= 10; i++) { await page.touchscreen.touchMove(d.p.x + (tray0.x - d.p.x) * i / 10, d.p.y + (tray0.y + 10 - d.p.y) * i / 10); await step(1); }
  await step(3);
  await shot('04_拖动寿司_托盘高亮拒绝.png');
  await page.touchscreen.touchEnd(); await step(4);
  st = await S();
  check(st.trays[0].n === 1 && st.counts.belt + st.counts.kitchen + st.counts.tray === st.counts.total, '拖不同种类到已锁定托盘被拒绝，寿司退回传送带');
  await shot('05_拒绝提示.png');
  // 拖到暂存区
  await step(10);
  d = await page.evaluate(() => { const m = KSDebug.model(); const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].s > m.pickRange.start + 40); return { id, p: KSDebug.screenPos(id) }; });
  const buf2 = await page.evaluate(() => { const s = KSDebug.layout().bufferSlots[2]; return KSDebug.toScreen(s.cx, s.cy); });
  await drag(d.p.x, d.p.y, buf2.x, buf2.y + 24);
  st = await S();
  check(st.buffer[2] === d.id, '拖动寿司放到暂存区第 3 格');
  // 暂存区 → 托盘
  await step(10);
  await tap(buf2.x, buf2.y);
  st = await S();
  check(st.buffer[2] === null && st.counts.tray === 2, '点击暂存区寿司 → 移到可放的托盘');
  check(st.inv.length === 0, '交互后不变量成立');

  // ---------- 3. 三关通关 ----------
  const results = [];
  for (const lv of [1, 2, 3]) {
    console.log(`\n▶ 第 ${lv} 关完整对局（真实触摸）`);
    await open(`level=${lv}&seed=${10 + lv}`);
    const mid = lv === 3 ? { 6: { name: '07_第3关_进行中.png' }, 9: { name: '08_第3关_三消动画.png', wait: 13 }, 22: { name: '09_第3关_托盘与暂存区.png' } }
      : lv === 2 ? { 8: { name: '06_第2关_进行中.png' } } : {};
    const r = await playLevel(lv, { gap: 10, midShots: mid });
    results.push(r);
    check(r.st.status === 'won', `第 ${lv} 关通关：${r.actions} 次操作（其中拖动 ${r.drags} 次），用时 ${r.st.elapsed.toFixed(1)}s，剩余 ${r.st.timeLeft.toFixed(1)}s`);
    check(r.st.counts.cleared === r.st.counts.total, `第 ${lv} 关 已消除 ${r.st.counts.cleared} = 总数 ${r.st.counts.total}`);
    check(r.invErr === 0, `第 ${lv} 关 对局中每帧不变量成立`);
    await step(30);
    await shot(`1${lv}_第${lv}关_胜利.png`);
  }
  // 胜利面板按钮：下一关
  await open('level=1&seed=3');
  await playLevel(1, { gap: 6 });
  await step(30);
  const nextBtn = await page.evaluate(() => { const b = KSDebug.scene().buttons.find(b => b.label === '下一关'); return b && KSDebug.toScreen(b.x + b.w / 2, b.y + b.h / 2); });
  await tap(nextBtn.x, nextBtn.y);
  check(await page.evaluate(() => KSDebug.model().level.id === 2), '胜利面板「下一关」进入第 2 关');

  // ---------- 4. 失败与重新开始 ----------
  console.log('\n▶ 超时失败与重新开始');
  await open('level=2&seed=5');
  await step(40);
  let exits = 0;
  await page.evaluate(() => { window.__exits = 0; const m = KSDebug.model(); const orig = m.emit.bind(m); m.emit = e => { if (e.type === 'exit') window.__exits++; orig(e); }; });
  await page.evaluate(() => KSDebug.step(30 * 86, 1 / 30));
  await step(20);
  st = await S();
  exits = await page.evaluate(() => window.__exits);
  check(st.status === 'lost' && exits > 0, `寿司经过出口 ${exits} 次未判负，时间耗尽后失败`);
  check(st.counts.total === 24 && st.inv.length === 0, '失败时数量守恒');
  await shot('14_失败画面.png');
  const retry = await page.evaluate(() => { const b = KSDebug.scene().buttons.find(b => b.label === '重新开始'); return KSDebug.toScreen(b.x + b.w / 2, b.y + b.h / 2); });
  await tap(retry.x, retry.y);
  st = await S();
  check(st.status === 'ready' && st.counts.cleared === 0 && st.timeLeft === 85, '失败面板「重新开始」重置关卡');
  const back = await page.evaluate(() => KSDebug.scene().buttons.find(b => b.id === 'restart'));
  check(!!back, 'HUD 刷新按钮存在');
  // 返回选关
  await page.evaluate(() => KSDebug.step(30 * 90, 1 / 30));
  await step(20);
  const menuBtn = await page.evaluate(() => { const b = KSDebug.scene().buttons.find(b => b.label === '返回选关'); return KSDebug.toScreen(b.x + b.w / 2, b.y + b.h / 2); });
  await tap(menuBtn.x, menuBtn.y);
  check(await page.evaluate(() => !KSDebug.model()), '「返回选关」回到开始画面');

  // ---------- 5. 多尺寸截图 ----------
  console.log('\n▶ 不同手机尺寸');
  for (const [w, h, name] of [[375, 667, 'iPhoneSE'], [390, 760, '小红书内嵌'], [430, 932, 'ProMax'], [360, 780, 'Android']]) {
    await open('level=3&seed=2', w, h);
    await step(60);
    const ok = await page.evaluate(() => {
      const L = KSDebug.layout(); const sc = KSDebug.scene();
      const b = sc.path.bounds(); const half = sc.beltW / 2 + sc.wallW;
      return b.y - half >= L.hud.y + 84 && b.y + b.h + half <= L.woodTop + 2 && L.buffer.y + L.buffer.h <= L.H;
    });
    check(ok, `${w}×${h}（${name}）传送带/托盘/暂存区无重叠`);
    await shot(`20_尺寸_${name}_${w}x${h}.png`);
  }

  // ---------- 6. 性能（真实 RAF，4 倍 CPU 降速模拟中端手机） ----------
  console.log('\n▶ 性能');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?level=3&seed=4');
  const cdp = await page.target().createCDPSession();
  for (const rate of [1, 4]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => KSDebug.resetPerf());
    await new Promise(r => setTimeout(r, 4000));
    const p = await page.evaluate(() => KSDebug.perf());
    check(p.workAvg < 8, `CPU×${rate}：每帧逻辑+绘制平均 ${p.workAvg.toFixed(2)}ms（P95 ${p.workP95.toFixed(2)}ms），帧间隔平均 ${p.frameAvg.toFixed(1)}ms`);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // ---------- 7. 录屏 ----------
  if (VIDEO) {
    console.log('\n▶ 录制操作视频');
    fs.rmSync(FRAMES, { recursive: true, force: true });
    fs.mkdirSync(FRAMES, { recursive: true });
    await open('');
    recording = true;
    await step(45);
    const c3 = await page.evaluate(() => { const c = KSDebug.scene().cards()[2]; return KSDebug.toScreen(c.x + c.w / 2, c.y + c.h / 2); });
    await tap(c3.x, c3.y);
    // 换成固定种子以保证录屏内容稳定
    await page.evaluate(() => KSDebug.start(2, 21));
    await step(1);
    let n = 0;
    // 录 ~30 秒：前半段用拖动和点击混合
    while (n++ < 60 && frameNo < 30 * 34) {
      const st2 = await S();
      if (st2.status === 'won' || st2.status === 'lost') break;
      if (st2.status !== 'playing') { await step(1); continue; }
      const dd = await decide();
      if (!dd) { await step(4); continue; }
      if (dd.toBuffer) await drag(dd.p.x, dd.p.y, dd.toBuffer.x, dd.toBuffer.y + 20, 14);
      else if (n % 3 === 0 && dd.from === 'belt') {
        // 拖到目标托盘（演示拖拽手感）
        const tgt = await page.evaluate(id => { const m = KSDebug.model(); const t = m.autoTray(m.sushi[id].type); const tr = KSDebug.layout().trays[t]; return KSDebug.toScreen(tr.cx, tr.cy + 16); }, dd.id);
        await drag(dd.p.x, dd.p.y, tgt.x, tgt.y, 16);
      } else await tap(dd.p.x, dd.p.y, 3);
      await step(12);
    }
    // 快进到结尾并录胜利画面
    recording = false;
    let g = 0;
    while (g++ < 400) {
      const st3 = await S();
      if (st3.status === 'won' || st3.status === 'lost') break;
      const dd = await decide();
      if (dd) { if (dd.toBuffer) await drag(dd.p.x, dd.p.y, dd.toBuffer.x, dd.toBuffer.y + 20, 6); else await tap(dd.p.x, dd.p.y); }
      await step(6);
    }
    recording = true;
    await step(90);
    recording = false;
    const mp4 = path.join(OUT, 'preview.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(FRAMES, '%05d.jpg'),
      '-vf', 'scale=780:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', mp4]);
    fs.rmSync(FRAMES, { recursive: true, force: true });
    const size = fs.statSync(mp4).size;
    check(size > 100000, `录屏 out/preview.mp4（${frameNo} 帧，约 ${(frameNo / 30).toFixed(0)} 秒，${(size / 1e6).toFixed(1)}MB）`);
  }

  check(pageErrors.length === 0, '页面无 JS 错误' + (pageErrors.length ? '：' + pageErrors.slice(0, 3).join(' | ') : ''));
  const inv = await page.evaluate(() => KSDebug.invariantErrors()).catch(() => 0);
  check(inv === 0, '运行期不变量断言 0 次失败');
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'e2e-report.txt'), report.join('\n') + '\n');
  console.log(`\n结果：${report.length - failures} 通过，${failures} 失败（报告 out/e2e-report.txt）`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
