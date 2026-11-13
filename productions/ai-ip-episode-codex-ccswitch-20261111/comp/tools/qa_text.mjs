#!/usr/bin/env node
// 1) 把全部上屏口播文字按时间拼起来，与 文案.md 逐字比对（忽略空白和标点）。
// 2) 输出 SRT（供平台字幕或复核用）。
// 用法: node tools/qa_text.mjs [out.srt]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KLINES, CONTRAST, CUES } from '../src/data.ts';

const EP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const seg = (s) => (typeof s === 'string' ? s : s.em);
const items = [];
for (const k of KLINES) items.push({ t: k.t0, t1: Math.min(k.t1, 64.3), text: k.segs.map(seg).join('') });
const { a, b } = CONTRAST;
items.push({ t: a.t, t1: a.tBig, text: a.label }, { t: a.tBig, t1: b.t, text: a.big + a.tail });
items.push({ t: b.t, t1: b.t2, text: b.l1 }, { t: b.t2, t1: b.t3, text: b.l2 }, { t: b.t3, t1: CONTRAST.t1, text: b.big + b.tail });
for (const c of CUES) c.lines.forEach((l, i) => items.push({ t: l.t, t1: c.lines[i + 1]?.t ?? c.t1, text: l.segs.map(seg).join('') }));
items.sort((x, y) => x.t - y.t);

const strip = (s) => s.replace(/[\s，。、；：？！“”"「」,.;:?!·]/g, '');
const script = fs.readFileSync(path.join(EP, process.env.SCRIPT_MD || '文案_v2.md'), 'utf8').split('\n').filter((l) => !l.startsWith('#') && !l.startsWith('>')).join('');
const A = strip(script);
const B = strip(items.map((i) => i.text).join(''));
let ok = A === B;
if (!ok) {
  let i = 0;
  while (i < Math.min(A.length, B.length) && A[i] === B[i]) i++;
  console.log(`✖ 上屏文字与文案不一致，第 ${i} 字起：\n  文案: …${A.slice(Math.max(0, i - 8), i + 16)}\n  上屏: …${B.slice(Math.max(0, i - 8), i + 16)}`);
} else console.log(`✓ 上屏口播文字与文案.md 逐字一致（${A.length} 字，忽略空白与标点）`);

const out = process.argv[2];
if (out) {
  const ts = (x) => { const ms = Math.round(x * 1000); const p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
  // SRT 的结束时间取下一条开始，避免重叠
  const srt = items.map((it, i) => `${i + 1}\n${ts(it.t)} --> ${ts(Math.min(it.t1, items[i + 1]?.t ?? it.t1))}\n${it.text}\n`).join('\n');
  fs.writeFileSync(out, srt);
  console.log('SRT', out, items.length, '条');
}
process.exit(ok ? 0 : 1);
