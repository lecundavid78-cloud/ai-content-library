/*
 * V2 端到端测试 + 截图 + 录屏（无头 Chrome，模拟手机竖屏触摸）
 *   node tests/e2e.js [--no-video]
 * 手动时钟(?manual=1)：每帧由测试推进，结果可复现。对局操作全部通过 page.touchscreen 真实触摸完成。
 * 注意：这是普通浏览器里的自动化试玩，不能代替小红书模拟器 / Android / iOS 真机验证。
 */
'use strict';
const puppeteer = require('../../tools/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const E = require('./lib/env');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const SHOTS = path.join(OUT, 'screenshots');
const FRAMES = path.join(OUT, '.frames');
const VIDEO = !process.argv.includes('--no-video');
fs.mkdirSync(SHOTS, { recursive: true });
const URL0 = 'file://' + path.join(ROOT, 'index.html');

const report = [];
let failures = 0;
function check(cond, msg) { report.push((cond ? '✓ ' : '✗ ') + msg); if (!cond) failures++; console.log((cond ? '  ✓ ' : '  ✗ ') + msg); }

let page, browser, frameNo = 0, recording = false;

async function open(query, w = 390, h = 844, keepStorage = true) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL0 + '?manual=1&' + query);
  if (!keepStorage) await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => KSDebug.step(1, 1 / 30));
  await injectBot();
}
async function injectBot() {
  // 把 Node 端同一份策略函数注入页面（tests/lib/env.js 的 decide）
  await page.evaluate(src => { window.__decide = (0, eval)('(' + src + ')'); }, E.decide.toString().replace(/^function decide/, 'function'));
  await page.evaluate(() => {
    window.countBy = function (ids, m) { const c = {}; ids.forEach(id => { if (id !== null) { const t = m.sushi[id].type; c[t] = (c[t] || 0) + 1; } }); return c; };
  });
}
async function step(n = 1) {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => KSDebug.step(1, 1 / 30));
    if (recording) await page.screenshot({ path: path.join(FRAMES, String(frameNo++).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 82 });
  }
}
async function shot(name) { await page.screenshot({ path: path.join(SHOTS, name) }); console.log('  📷 ' + name); }
const S = () => page.evaluate(() => {
  const m = KSDebug.model(); if (!m) return null;
  return { key: m.level.key, seed: m.seed, status: m.status, counts: m.counts(), trays: m.trays.map(t => ({ type: t.type, n: t.slots.filter(x => x !== null).length })), buffer: m.buffer.slice(), timeLeft: m.timeLeft, elapsed: m.elapsed, inv: m.checkInvariants(), order: m.sushi.map(s => s.type).join(',') };
});
const sceneInfo = () => page.evaluate(() => { const s = KSDebug.scene(); return { menu: !s.model, view: s.view || null, key: s.model ? s.model.level.key : null }; });
async function tap(x, y, hold = 2) { await page.touchscreen.touchStart(x, y); await step(hold); await page.touchscreen.touchEnd(); await step(1); }
async function drag(x0, y0, x1, y1, frames = 12) {
  await page.touchscreen.touchStart(x0, y0); await step(2);
  for (let i = 1; i <= frames; i++) {
    const t = i / frames, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.touchscreen.touchMove(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e); await step(1);
  }
  await step(2); await page.touchscreen.touchEnd(); await step(1);
}
async function tapButton(pred) {
  const p = await page.evaluate(src => {
    const f = (0, eval)('(' + src + ')');
    const b = KSDebug.scene().buttons.find(f);
    return b ? KSDebug.toScreen(b.x + b.w / 2, b.y + b.h / 2) : null;
  }, pred.toString());
  if (!p) return false;
  await tap(p.x, p.y);
  return true;
}
/** 用真实触摸打完当前对局（页面内策略 = Node 测试同一策略，但不随手犯错） */
async function playCurrent(opts = {}) {
  const gap = opts.gap || 8, midShots = opts.midShots || {};
  let actions = 0, guard = 0, invErr = 0;
  while (guard++ < 8000) {
    const st = await S();
    if (st.inv.length) invErr++;
    if (st.status === 'won' || st.status === 'lost') break;
    if (st.status !== 'playing') { await step(1); continue; }
    const id = await page.evaluate(() => { const m = KSDebug.model(); return m.held ? -1 : window.__decide(m, Math.random, 0); });
    if (id < 0) { await step(3); continue; }
    const p = await page.evaluate(i => KSDebug.screenPos(i), id);
    await tap(p.x, p.y);
    actions++;
    for (const k of Object.keys(midShots)) if (actions === +k) { await step(midShots[k].wait || 0); await shot(midShots[k].name); }
    await step(gap);
  }
  await step(40);
  return { st: await S(), actions, invErr };
}

(async () => {
  browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') pageErrors.push(m.text()); });

  // ---------- 1. 首页与导航 ----------
  console.log('\n▶ 首页与导航');
  await open('', 390, 844, false);
  await step(30);
  await shot('01_首页.png');
  check(await tapButton(b => b.id === 'enter-main'), '首页「经典闯关」入口可点');
  await step(20);
  let sc = await sceneInfo();
  check(sc.menu && sc.view === 'main', '进入经典闯关列表');
  check(await page.evaluate(() => KSDebug.scene().cards().length === 3), '主线列表只有 3 关');
  await shot('02_经典闯关列表.png');
  await tapButton(b => b.id === 'back'); await step(5);
  check((await sceneInfo()).view === 'home', '列表「返回」回到首页');
  await tapButton(b => b.id === 'enter-free'); await step(20);
  sc = await sceneInfo();
  check(sc.view === 'free' && await page.evaluate(() => KSDebug.scene().cards().map(c => c.cfg.key).join() === 'free-u,free-z,free-double'), '自由选图列表 3 张图（未通关主线也全部可点）');
  await shot('03_自由选图列表.png');

  // ---------- 2. 第 1 关：教学一次 + 交互 ----------
  console.log('\n▶ 第 1 关教学与交互');
  await tapButton(b => b.id === 'back'); await step(3);
  await tapButton(b => b.id === 'enter-main'); await step(10);
  await tapButton(b => b.id === 'map-main-1'); await step(15);
  let st = await S();
  check(st.key === 'main-1' && st.seed === 101 && st.counts.total === 9, '点卡片进入第 1 关（seed 101，9 个）');
  await shot('04_第1关_首次教学.png');
  await step(60);
  check((await S()).status === 'ready', '教学卡出现时不自动开始计时');
  await tap(195, 400); await step(45);
  check((await S()).status === 'playing', '点一下教学卡后开始');
  await step(40);
  await shot('05_第1关_手指提示.png');
  let d = await page.evaluate(() => { const m = KSDebug.model(); const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].s > m.pickRange.start + 40); return { id, type: m.sushi[id].type, p: KSDebug.screenPos(id) }; });
  await tap(d.p.x, d.p.y);
  st = await S();
  check(st.trays[0].type === d.type && st.trays[0].n === 1, `点击寿司（${d.type}）→ 自动放入托盘 1`);
  d = await page.evaluate(() => { const m = KSDebug.model(); const t0 = m.trays[0].type; const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].type !== t0 && m.sushi[i].s > m.pickRange.start + 30); return id === undefined ? null : { id, p: KSDebug.screenPos(id) }; });
  if (d) {
    const tray0 = await page.evaluate(() => { const t = KSDebug.layout().trays[0]; return KSDebug.toScreen(t.cx, t.cy + 16); });
    await drag(d.p.x, d.p.y, tray0.x, tray0.y);
    st = await S();
    check(st.trays[0].n === 1 && st.inv.length === 0, '拖不同种类到已锁定托盘被拒绝，寿司退回');
    await shot('06_拒绝提示.png');
  }
  await step(10);
  d = await page.evaluate(() => { const m = KSDebug.model(); const id = m.belt.find(i => m.isPickableOnBelt(i) && m.sushi[i].s > m.pickRange.start + 30); return { id, p: KSDebug.screenPos(id) }; });
  const buf2 = await page.evaluate(() => { const s = KSDebug.layout().bufferSlots[2]; return KSDebug.toScreen(s.cx, s.cy); });
  await drag(d.p.x, d.p.y, buf2.x, buf2.y + 24);
  check((await S()).buffer[2] === d.id, '拖动寿司放到暂存区第 3 格');
  await step(10);
  await tap(buf2.x, buf2.y);
  check((await S()).buffer[2] === null, '点击暂存区寿司 → 移到托盘');
  // 再次进入第 1 关：教学不再出现
  await page.evaluate(() => KSDebug.start(0)); await step(50);
  check((await S()).status === 'playing', '教学只出现一次：再次进入第 1 关直接开场');

  // ---------- 3. 六张地图完整对局 ----------
  const keys = ['main-1', 'main-2', 'main-3', 'free-u', 'free-z', 'free-double'];
  const shotsFor = {
    'main-2': { 10: { name: '10_第2关_S型进行中.png' } },
    'main-3': { 6: { name: '11_第3关_回字螺旋进行中.png' }, 9: { name: '12_第3关_三消动画.png', wait: 13 }, 24: { name: '13_第3关_托盘与暂存区.png' } },
    'free-u': { 8: { name: '14_自由图U型进行中.png' } },
    'free-z': { 8: { name: '15_自由图Z字进行中.png' } },
    'free-double': { 8: { name: '16_自由图双层折返进行中.png' } }
  };
  const winTimes = {};
  for (const k of keys) {
    console.log(`\n▶ ${k} 完整对局（真实触摸）`);
    await open(k.startsWith('main') ? 'level=' + k.slice(5) : 'map=' + k);
    const s0 = await S();
    const r = await playCurrent({ gap: 8, midShots: shotsFor[k] || {} });
    winTimes[k] = r.st.elapsed;
    check(r.st.key === k && s0.seed === E.KS.findMap(k).seed, `${k} 使用固定 seed ${s0.seed}`);
    check(r.st.status === 'won', `${k} 通关：${r.actions} 次点击，用时 ${r.st.elapsed.toFixed(1)}s，剩余 ${r.st.timeLeft.toFixed(1)}s`);
    check(r.st.counts.cleared === r.st.counts.total, `${k} 已消除 ${r.st.counts.cleared} = 总数 ${r.st.counts.total}`);
    check(r.invErr === 0, `${k} 每帧不变量成立`);
    await step(30);
    if (k === 'main-3' || k === 'free-double' || k === 'main-1') await shot(`2${keys.indexOf(k)}_${k}_胜利.png`);
    const saved = await page.evaluate(key => KSDebug.progress().stars[key] || 0, k);
    check(saved >= 1, `${k} 胜利后记录星级 ${saved}`);
  }

  // ---------- 4. 结算去向 ----------
  console.log('\n▶ 结算面板去向');
  await open('level=1'); await playCurrent({ gap: 6 }); await step(30);
  check(await tapButton(b => b.label === '下一关'), '第 1 关胜利有「下一关」');
  check((await S()).key === 'main-2', '「下一关」进入第 2 关');
  await open('level=3'); await playCurrent({ gap: 6 }); await step(30);
  check(await tapButton(b => b.label === '去自由选图'), '第 3 关胜利有「去自由选图」');
  check((await sceneInfo()).view === 'free', '第 3 关胜利后可直接去自由选图');
  await open('map=free-z'); await playCurrent({ gap: 6 }); await step(30);
  await tapButton(b => b.label === '选其他地图');
  check((await sceneInfo()).view === 'free', '自由图胜利「选其他地图」回到自由选图列表');
  // 失败：第 3 关
  await open('level=3'); await step(40);
  const order0 = (await S()).order;
  await page.evaluate(() => KSDebug.step(30 * 100, 1 / 30)); await step(20);
  st = await S();
  check(st.status === 'lost' && st.inv.length === 0 && st.counts.total === 42, '第 3 关超时失败（数量守恒）');
  await shot('30_第3关_失败.png');
  const labels = await page.evaluate(() => KSDebug.scene().buttons.map(b => b.label).filter(Boolean));
  check(['再试一次', '换张地图', '返回首页'].every(l => labels.includes(l)), '失败面板有「再试一次 / 换张地图 / 返回首页」');
  await tapButton(b => b.label === '再试一次');
  st = await S();
  check(st.status === 'ready' && st.order === order0 && st.seed === 303, '「再试一次」重开同一固定局面');
  await page.evaluate(() => KSDebug.step(30 * 100, 1 / 30)); await step(20);
  await tapButton(b => b.label === '换张地图');
  check((await sceneInfo()).view === 'free', '第 3 关失败「换张地图」直达自由选图（不形成死胡同）');
  await open('map=free-double'); await page.evaluate(() => KSDebug.step(30 * 90, 1 / 30)); await step(20);
  await tapButton(b => b.label === '返回首页');
  check((await sceneInfo()).view === 'home', '自由图失败「返回首页」');
  // HUD 重开按钮：同一局面
  await open('map=free-u'); await step(60);
  const o1 = (await S()).order;
  await tapButton(b => b.id === 'restart');
  check((await S()).order === o1 && (await S()).seed === 404, 'HUD 刷新按钮重开同一固定局面');
  // URL 参数
  await open('map=bad-map'); check((await sceneInfo()).view === 'home', '?map= 无效值回到首页');
  await open('map=free-z&seed=9'); st = await S();
  check(st.key === 'free-z' && st.seed === 9, '调试 ?seed= 覆盖固定 seed');

  // ---------- 5. 存档持久化 / 系统返回 ----------
  console.log('\n▶ 存档与返回手势');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL0 + '?manual=1');
  await page.evaluate(() => KSDebug.step(5, 1 / 30));
  await new Promise(r => setTimeout(r, 200));
  const prog = await page.evaluate(() => ({ s: Object.assign({}, KSDebug.progress().stars), t: KSDebug.progress().tutorialDone }));
  check(['main-1', 'main-2', 'main-3', 'free-u', 'free-z', 'free-double'].every(k => prog.s[k] >= 1) && prog.t, '刷新页面后星级与教学标记仍在（浏览器预览走 localStorage）');
  await page.evaluate(() => KSDebug.menu('main')); await page.evaluate(() => KSDebug.step(30, 1 / 30));
  await shot('31_经典闯关列表_有成绩.png');
  // 真实 history：非手动模式下进入对局后按系统返回
  await page.goto(URL0 + '?map=free-z');
  await new Promise(r => setTimeout(r, 400));
  await page.goBack();
  await new Promise(r => setTimeout(r, 400));
  const after = await page.evaluate(() => { const s = KSDebug.scene(); return { menu: !s.model, view: s.view }; }).catch(() => null);
  check(after && after.menu && after.view === 'free', '对局中按系统返回 → 回到所属地图列表（不直接退出）');

  // ---------- 6. 不同手机尺寸 + 安全区 ----------
  console.log('\n▶ 不同手机尺寸');
  for (const [w, h, name, st0, sb0] of [[360, 640, '小屏', 0, 0], [375, 812, 'iPhoneX安全区', 44, 34], [390, 844, '标准', 0, 0], [430, 932, 'ProMax', 47, 34]]) {
    for (const q of ['level=3', 'map=free-double', '']) {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.goto(URL0 + '?manual=1&' + q);
      await page.evaluate((a, b) => {
        document.documentElement.style.setProperty('--safe-area-inset-top', a + 'px');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', b + 'px');
        KSDebug.app.measureSafe(); KSDebug.app.resize(); KSDebug.scene().relayout();
      }, st0, sb0);
      await page.evaluate(() => KSDebug.step(60, 1 / 30));
      const okLayout = await page.evaluate(() => {
        const L = KSDebug.layout(), s = KSDebug.scene();
        if (!s.model) {
          const cards = s.view === 'home' ? s.homeEntries() : s.cards();
          return cards.every(c => c.y >= L.top && c.y + c.h <= L.H - 4);
        }
        const b = s.path.bounds(), half = s.beltW / 2 + s.wallW;
        return b.y - half >= L.hud.y + 84 && b.y + b.h + half <= L.woodTop + 2 && L.buffer.y + L.buffer.h <= L.H && L.hud.y >= L.top - 0.01;
      });
      check(okLayout, `${w}×${h}（${name}，安全区 ${st0}/${sb0}）${q || '首页'} 布局无重叠、卡片可点`);
      if (q !== 'map=free-double') await shot(`40_尺寸_${name}_${w}x${h}_${q ? q.replace('=', '') : 'home'}.png`);
    }
  }

  // ---------- 7. 性能 ----------
  console.log('\n▶ 性能（真实 RAF，第 3 关）');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(URL0 + '?level=3');
  const cdp = await page.target().createCDPSession();
  for (const rate of [1, 4]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => KSDebug.resetPerf());
    await new Promise(r => setTimeout(r, 4000));
    const p = await page.evaluate(() => KSDebug.perf());
    check(p.workAvg < 8, `CPU×${rate}：每帧 JS 逻辑+绘制提交 平均 ${p.workAvg.toFixed(2)}ms（P95 ${p.workP95.toFixed(2)}ms），帧间隔平均 ${p.frameAvg.toFixed(1)}ms（无头软件光栅化，仅供参考）`);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // ---------- 8. 录屏 ----------
  if (VIDEO) {
    console.log('\n▶ 录制操作视频');
    fs.rmSync(FRAMES, { recursive: true, force: true });
    fs.mkdirSync(FRAMES, { recursive: true });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(URL0 + '?manual=1');
    await injectBot();
    recording = true;
    await step(40);
    await tapButton(b => b.id === 'enter-main'); await step(25);
    await tapButton(b => b.id === 'map-main-3'); await step(2);
    let n = 0;
    while (n++ < 70 && frameNo < 30 * 30) {
      const s2 = await S();
      if (s2.status === 'won' || s2.status === 'lost') break;
      if (s2.status !== 'playing') { await step(1); continue; }
      const id = await page.evaluate(() => { const m = KSDebug.model(); return m.held ? -1 : window.__decide(m, Math.random, 0); });
      if (id < 0) { await step(4); continue; }
      const p = await page.evaluate(i => KSDebug.screenPos(i), id);
      const where = await page.evaluate(i => { const m = KSDebug.model(); const sh = m.sushi[i]; const t = m.autoTray(sh.type); return { loc: sh.loc, t }; }, id);
      if (n % 3 === 0 && where.loc === 'belt' && where.t >= 0) {
        const tgt = await page.evaluate(t => { const tr = KSDebug.layout().trays[t]; return KSDebug.toScreen(tr.cx, tr.cy + 16); }, where.t);
        await drag(p.x, p.y, tgt.x, tgt.y, 14);
      } else await tap(p.x, p.y, 3);
      await step(10);
    }
    recording = false;
    await playCurrent({ gap: 5 });
    recording = true;
    await step(80);
    await tapButton(b => b.label === '去自由选图'); await step(30);
    await tapButton(b => b.id === 'map-free-double'); await step(70);
    recording = false;
    const mp4 = path.join(OUT, 'preview-v2.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(FRAMES, '%05d.jpg'),
      '-vf', 'scale=780:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', mp4]);
    fs.rmSync(FRAMES, { recursive: true, force: true });
    const size = fs.statSync(mp4).size;
    check(size > 100000, `录屏 out/preview-v2.mp4（${frameNo} 帧，约 ${(frameNo / 30).toFixed(0)} 秒，${(size / 1e6).toFixed(1)}MB）`);
  }

  check(pageErrors.length === 0, '页面无 JS 错误' + (pageErrors.length ? '：' + pageErrors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'e2e-report.txt'), report.join('\n') + '\n');
  console.log(`\n结果：${report.length - failures} 通过，${failures} 失败（报告 out/e2e-report.txt）`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
