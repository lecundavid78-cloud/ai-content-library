#!/usr/bin/env node
/* render.mjs —— 用本机 Chrome（headless）逐帧渲染：静帧 / 预览视频 / 校验报告
   无 npm 依赖（Node ≥ 22 自带 WebSocket）。用完自动关闭 Chrome，不占端口。

   node tools/render.mjs stills 1.0 2.4 8.0 ...  → demo/stills/*.png（不传时间则用默认关键帧）
   node tools/render.mjs video [fps]             → demo/preview.mp4（需要 ffmpeg）
   node tools/render.mjs check                   → 打印 lint / 时长 / 口播框坐标（JSON）
   附加：--guides 叠加参考线   --slot=key 口播框填绿   --nosubs 去字幕
*/
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = join(ROOT, process.env.OUT || 'demo');   // OUT=demo-v2 → 渲染 v2
const HTML = process.env.HTML ? resolve(process.env.HTML) : join(OUTDIR, 'index.html');  // HTML=src/index.html 可直接检查开发入口
const CHROME = process.env.CHROME || 'google-chrome';
const args = process.argv.slice(2);
const mode = args[0] || 'check';
const flags = new Set(args.filter((a) => a.startsWith('--')));
const nums = args.slice(1).filter((a) => !a.startsWith('--')).map(Number);

const qs = new URLSearchParams({ capture: '1', autoplay: '0' });
if (flags.has('--guides')) qs.set('guides', '1');
if (flags.has('--nosubs')) qs.set('subs', '0');
for (const f of flags) if (f.startsWith('--slot=')) qs.set('slot', f.slice(7));
const url = pathToFileURL(HTML).href + '?' + qs;

const port = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'studio-chrome-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
  '--force-device-scale-factor=1', '--window-size=1920,1080', '--allow-file-access-from-files',
  'about:blank',
], { stdio: 'ignore' });

const cleanup = () => { try { chrome.kill('SIGKILL'); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} };
process.on('exit', cleanup);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(100);
  }
  throw new Error('Chrome 启动失败');
}

const ws = new WebSocket(await connect());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url });
for (let i = 0; i < 100 && !(await evaluate('!!(window.Studio && Studio.ready)')); i++) await sleep(100);

const info = await evaluate(`({ duration: Studio.duration, lint: Studio.lint, slot: Studio.slotRect,
  scenes: Studio.scenes.map(s => ({ id: s.id, start: s.start, end: s.end })),
  canvas: [document.getElementById('stage').offsetWidth, document.getElementById('stage').offsetHeight],
  external: [...document.querySelectorAll('[src],[href]')].map(e => e.getAttribute('src') || e.getAttribute('href')).filter(u => /^(https?:)?\\/\\//.test(u)),
  fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family) })`);

const shot = async (t) => {
  await evaluate(`Studio.frame(${t})`);
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
  return Buffer.from(data, 'base64');
};

if (mode === 'overlay') {
  // 透明背景截图：name = 只有口播窗口名牌；mask = 口播窗口的白色圆角形状（做视频遮罩）
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  mkdirSync(OUTDIR + '/media', { recursive: true });
  for (const kind of ['name', 'mask']) {
    await evaluate(`document.body.classList.remove('ov-name','ov-mask'); document.body.classList.add('ov','ov-${kind}'); Studio.frame(0)`);
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
    writeFileSync(join(OUTDIR, 'media', `slot-${kind}.png`), Buffer.from(data, 'base64'));
    console.log(`  media/slot-${kind}.png`);
  }
} else if (mode === 'check') {
  console.log(JSON.stringify(info, null, 2));
} else if (mode === 'stills') {
  const times = nums.length ? nums : [1.0, 2.6, 7.6, 11.5, 14.9];
  const dir = join(OUTDIR, 'stills');
  mkdirSync(dir, { recursive: true });
  const tag = [...flags].map((f) => f.replace(/^--/, '').replace('=', '-')).join('_');
  for (const t of times) {
    const name = `t${t.toFixed(2).padStart(5, '0')}${tag ? '_' + tag : ''}.png`;
    writeFileSync(join(dir, name), await shot(t));
    console.log('  ' + name);
  }
} else if (mode === 'video') {
  const fps = nums[0] || 30;
  const out = process.env.VIDEO_OUT ? resolve(process.env.VIDEO_OUT) : join(OUTDIR, 'preview.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(info.duration * fps);
  // 分段渲染：F0 ≤ f < F1（默认整片）。分段文件编码参数相同，可直接 concat -c copy
  const f0 = +(process.env.F0 || 0), f1 = Math.min(+(process.env.F1 || total + 1), total + 1);
  for (let f = f0; f < f1; f++) {
    const buf = await shot(f / fps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`\n→ ${out}`);
}
ws.close();
cleanup();
process.exit(0);
