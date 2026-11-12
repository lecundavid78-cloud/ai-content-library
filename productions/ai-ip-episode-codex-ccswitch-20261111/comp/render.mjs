#!/usr/bin/env node
// 本期渲染入口（只输出无声画面，声音由 tools/finish.sh 合入）。
//   node render.mjs --stills 0,1.5,3 [--draft] [--out dir]   出静帧校样
//   node render.mjs --video build/raw.mp4                      出整片画面
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const draft = args.includes('--draft');
const bundleDir = path.join(ROOT, '..', 'build', 'bundle');
fs.rmSync(bundleDir, { recursive: true, force: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts'), publicDir: path.join(ROOT, 'public'), outDir: bundleDir });
const inputProps = { draft };
const browserExecutable = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
const composition = await selectComposition({ serveUrl, id: 'Film', inputProps, browserExecutable });
const fps = composition.fps;

if (opt('stills')) {
  const dir = path.resolve(opt('out') ?? path.join(ROOT, '..', 'build', 'stills'));
  fs.mkdirSync(dir, { recursive: true });
  for (const s of opt('stills').split(',').map(Number)) {
    const file = path.join(dir, `t${s.toFixed(2).padStart(5, '0')}${draft ? '_draft' : ''}.png`);
    await renderStill({ composition, serveUrl, inputProps, frame: Math.min(composition.durationInFrames - 1, Math.round(s * fps)), output: file, browserExecutable });
    console.log('still', file);
  }
  process.exit(0);
}
const out = path.resolve(opt('video') ?? path.join(ROOT, '..', 'build', 'raw.mp4'));
const t0 = Date.now();
let last = -1;
await renderMedia({
  composition, serveUrl, inputProps, browserExecutable,
  codec: 'h264', crf: 16, pixelFormat: 'yuv420p', muted: true, outputLocation: out,
  timeoutInMilliseconds: 180000,
  concurrency: Number(process.env.CONCURRENCY || 4),
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`render ${p * 5}%`); } },
});
console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
process.exit(0);
