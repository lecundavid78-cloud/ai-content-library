/*
 * 上传 ZIP 冒烟测试（node tests/zip-smoke.js [zip]）：
 * 解压最终 ZIP 到临时目录 → 无头 Chrome 打开 → 首页、主线/自由图入口、第 3 关与双层折返可进入并运行；
 * 并用 evaluateOnNewDocument 注入“模拟的” window.xhs.miniTool，验证容器存储路径与低版本不回退。
 * 注意：这是模拟桥接，不等于创服平台模拟器或真机。
 */
'use strict';
const puppeteer = require('../../tools/node_modules/puppeteer-core');
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const zip = path.resolve(process.argv[2] || path.join(__dirname, '../release/kaiten-sushi-v2-xhs-minitool.zip'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ks-zip-'));
execFileSync('python3', ['-I', '-c', 'import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])', zip, dir]);
const url = 'file://' + path.join(dir, 'index.html');
let pass = 0, fail = 0;
const check = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); c ? pass++ : fail++; };

function mockBridge(build) {
  return `(() => {
    const store = {}; window.__store = store; window.__calls = [];
    window.xhs = { launchOptions: { miniToolEnv: { buildVersion: ${build} } }, miniTool: {
      getStorage({ key }) { __calls.push('get:' + key); return Promise.resolve({ data: store[key] !== undefined ? store[key] : '' }); },
      setStorage({ key, data }) { __calls.push('set:' + key); store[key] = data; return Promise.resolve({ errMsg: 'setStorage:ok' }); },
      getWindowInfo() { return Promise.resolve({ windowHeight: 844, safeArea: { top: 30, bottom: 810 }, menuButtons: { share: { top: 40, bottom: 72 } } }); },
      vibrateShort() { __calls.push('vibrate'); return Promise.resolve({}); }
    } };
  })();`;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  for (const mode of ['browser', 'xhs-9533', 'xhs-9451']) {
    const ctx = await browser.createBrowserContext();   // 每种模式独立的无痕存储
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    if (mode !== 'browser') await page.evaluateOnNewDocument(mockBridge(mode === 'xhs-9533' ? 9533001 : 9451001));
    await page.goto(url + '?manual=1');
    await page.evaluate(() => KSDebug.step(10, 1 / 30));
    await new Promise(r => setTimeout(r, 300));
    const boot = await page.evaluate(() => !document.getElementById('boot'));
    check(boot && await page.evaluate(() => KSDebug.scene().view === 'home'), `[${mode}] ZIP 产物启动到首页（启动提示已移除）`);
    for (const k of ['main-3', 'free-double']) {
      await page.evaluate(key => { KSDebug.startMap(key); KSDebug.step(90, 1 / 30); }, k);
      const ok = await page.evaluate(() => { const m = KSDebug.model(); return m.status === 'playing' && m.checkInvariants().length === 0; });
      check(ok, `[${mode}] ${k} 可进入并运行`);
    }
    // 记录一次成绩
    await page.evaluate(() => KSDebug.progress().record('free-z', 2, 50));
    await new Promise(r => setTimeout(r, 100));
    if (mode === 'browser') {
      check(await page.evaluate(() => localStorage.getItem('ks2_best_free-z') === '2'), '[browser] 普通浏览器预览用 localStorage 保存');
    } else if (mode === 'xhs-9533') {
      const r = await page.evaluate(() => ({ s: window.__store['ks2_best_free-z'], ls: localStorage.getItem('ks2_best_free-z'), top: KSDebug.app.safeTop }));
      check(r.s === '2' && r.ls === null, '[xhs 9.53 模拟] 成绩写入 xhs.miniTool.setStorage，不写 localStorage');
      check(r.top >= 72, `[xhs 9.53 模拟] 读取 getWindowInfo 避让原生按钮（safeTop ${r.top}）`);
    } else {
      const r = await page.evaluate(() => ({ avail: KSDebug.progress().available, ls: localStorage.getItem('ks2_best_free-z'), calls: window.__calls.length }));
      check(r.avail === false && r.ls === null && r.calls === 0, '[xhs 9.45 模拟] 存储不可用：不调用 Storage、不回退 localStorage，首页提示无法保存');
    }
    check(errs.length === 0, `[${mode}] 无 JS 错误 ${errs.slice(0, 2).join(' | ')}`);
    if (mode === 'xhs-9451') {
      await page.evaluate(() => { KSDebug.menu('home'); KSDebug.step(30, 1 / 30); });
      await page.screenshot({ path: path.join(__dirname, '../out/screenshots/50_模拟低版本客户端_首页提示.png') });
    }
    await ctx.close();
  }
  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\nZIP 冒烟：${pass} 通过，${fail} 失败`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
