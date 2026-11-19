/*
 * 上传前静态核验（node tests/static-validate.js [产物目录]，默认 v2 根目录下的 index.html + src/）
 *  - index.html 根入口、zh-CN、viewport-fit=cover、无内联脚本/行内事件/外链/base/iframe/CSP meta
 *  - 20 个经典外置脚本（相对路径 ./src/…、defer、无 type=module），依赖顺序正确
 *  - 产物目录只含白名单文件（21 个）
 *  - 每个 JS 用 acorn 按 ES2017 + script 模式解析（Chrome 61 基线），无 import/export
 *  - 能力扫描清单（device-capabilities.md §6）：fetch/XHR/WebSocket/Worker/eval/new Function/window.open …
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const acorn = require('../../tools/node_modules/acorn');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const onlyPayload = !!process.argv[2];
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [];
let m;
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
while ((m = scriptRe.exec(html))) {
  assert.strictEqual(m[2].trim(), '', 'inline script is forbidden');
  assert(!/type\s*=\s*["']module/i.test(m[1]), 'module script is forbidden');
  assert(/\bdefer\b/.test(m[1]), 'script should be defer: ' + m[1]);
  const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(m[1]);
  assert(src, 'script must have a local src');
  assert(src[1].startsWith('./src/'), 'script path must be package-relative');
  scripts.push(src[1]);
  assert(fs.existsSync(path.join(root, src[1])), 'missing file: ' + src[1]);
}
const EXPECTED = [
  './src/core/ns.js', './src/core/path.js', './src/core/sushi-types.js', './src/core/layout.js', './src/core/model.js',
  './src/levels/level1.js', './src/levels/level2.js', './src/levels/level3.js',
  './src/levels/free-u.js', './src/levels/free-z.js', './src/levels/free-double.js',
  './src/art/sushi-art.js', './src/art/scene-art.js',
  './src/game/platform.js', './src/game/progress.js', './src/game/audio.js', './src/game/fx.js',
  './src/game/menu.js', './src/game/play.js', './src/main.js'
];
assert.deepStrictEqual(scripts, EXPECTED, 'script list/order changed');
assert(/<html\s+lang="zh-CN"/i.test(html), 'missing Chinese document language');
assert(/<meta\s+charset="utf-8"/i.test(html), 'missing charset');
assert(/viewport-fit=cover/.test(html) && /width=device-width/.test(html), 'missing mobile viewport');
assert(!/<(?:base|iframe|object)\b/i.test(html), 'forbidden element');
assert(!/http-equiv\s*=\s*["']Content-Security-Policy/i.test(html), 'self-made CSP meta');
assert(!/\b(?:src|href)\s*=\s*["']https?:\/\//i.test(html), 'external resource');
assert(!/\son[a-z]+\s*=/i.test(html), 'inline DOM event');
assert(/<div id="boot"/.test(html), 'static first screen (boot text) missing');

const allowed = new Set(['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.json']);
const files = [];
function walk(folder) {
  for (const name of fs.readdirSync(folder)) {
    const p = path.join(folder, name);
    const rel = path.relative(root, p).split(path.sep).join('/');
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p); else files.push(rel);
  }
}
// 源码模式（无参数）只检查会进入上传包的 index.html + src/；产物模式检查整个目录
if (onlyPayload) walk(root); else { files.push('index.html'); walk(path.join(root, 'src')); }
for (const f of files) assert(allowed.has(path.extname(f)), 'forbidden extension: ' + f);
assert.strictEqual(files.length, EXPECTED.length + 1, 'unexpected payload file count: ' + files.length);

const BANNED = [/\bfetch\s*\(/, /XMLHttpRequest/, /new\s+WebSocket\s*\(/, /new\s+EventSource\s*\(/, /RTCPeerConnection/,
  /navigator\.geolocation/, /navigator\.clipboard/, /execCommand\s*\(/, /navigator\.(?:bluetooth|usb|hid|serial|getBattery|connection|credentials|locks)/,
  /navigator\.storage\.persist/, /serviceWorker/, /new\s+(?:Shared)?Worker\s*\(/, /DeviceMotionEvent|DeviceOrientationEvent|devicemotion|deviceorientation/,
  /requestFullscreen/, /\beval\s*\(/, /new\s+Function\s*\(/, /WebAssembly\./, /window\.open\s*\(/, /window\.prompt\s*\(/,
  /location\.href\s*=/, /location\.assign\s*\(/, /https?:\/\//, /\bimport\s*\(/, /sessionStorage|indexedDB|document\.cookie|caches\./];
let jsBytes = 0;
for (const f of files.filter(x => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  jsBytes += Buffer.byteLength(src);
  try { acorn.parse(src, { ecmaVersion: 2017, sourceType: 'script' }); }
  catch (e) { throw new Error(`${f} 不是合法 ES2017 经典脚本：${e.message}`); }
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  for (const re of BANNED) assert(!re.test(code), `${f} 命中禁用能力 ${re}`);
}
// localStorage 只允许出现在 platform.js（普通浏览器预览回退 + 一次性迁移）
for (const f of files.filter(x => x.endsWith('.js') && x !== 'src/game/platform.js')) {
  const code = fs.readFileSync(path.join(root, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  assert(!/localStorage/.test(code), f + ' 不应直接使用 localStorage');
}
console.log(`静态核验通过：index.html 根入口；${scripts.length} 个经典外置脚本（ES2017 解析通过、顺序正确）；${files.length} 个白名单文件；JS 共 ${(jsBytes / 1024).toFixed(1)} KiB；无外链、无禁用能力、无内联脚本。`);
