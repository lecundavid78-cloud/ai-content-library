// 快速截图（开发用）：node tests/shot.js "<query>" out.png [w h] [steps]
const puppeteer = require('../tools/node_modules/puppeteer-core');
const path = require('path');
(async () => {
  const [q = '', out = '/tmp/shot.png', w = 390, h = 844, steps = 60] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?manual=1&' + q);
  await page.evaluate(n => KSDebug.step(n, 1 / 30), +steps);
  await page.screenshot({ path: out });
  if (errs.length) console.log('ERRORS:', errs.join('\n'));
  await browser.close();
})();
