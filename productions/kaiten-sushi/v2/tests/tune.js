/*
 * 调参脚本：为每张地图扫描候选 seed，统计各“模拟玩家画像”的完成用时分布，
 * 按目标首过率反推时间限制，并挑一个“典型”（不过分走运也不过分倒霉）的固定 seed。
 *   node tests/tune.js            → 打印并写入 out/tuning.md
 *   node tests/tune.js main-3     → 只调一张图
 *
 * 校准假设（只是产品假设，不是真人数据）：
 *   “第一次玩”≈ novice 画像（1.7 秒/次、20% 随手点）；“练过几次”≈ average 画像。
 *   目标：第 1 关 novice≈100%；第 2 关 novice≈60%；第 3 关 novice≈10% 且 average≥50%、expert 100%。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('./lib/env');

const TARGET = {       // novice 首过率目标
  'main-1': 0.99, 'main-2': 0.6, 'main-3': 0.1,
  'free-u': 0.65, 'free-z': 0.4, 'free-double': 0.18
};
const RUNS = +process.env.RUNS || 40;
const SEEDS = +process.env.SEEDS || 24;
const only = process.argv[2];

function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * sorted.length)));
  return sorted[i];
}
function times(cfg, seed, profile, runs) {
  const c = Object.assign({}, cfg, { time: 9999, seed });
  const out = [];
  for (let i = 1; i <= runs; i++) out.push(E.play(c, profile, i).used);
  return out.sort((a, b) => a - b);
}

const lines = ['# 调参记录（tests/tune.js 自动生成）', '',
  `每个候选 seed 跑 ${RUNS} 局/画像；“建议时限”= novice 用时分布在目标首过率处的分位数。`, '',
  '画像：' + Object.values(E.PROFILES).map(p => p.label).join('，'), ''];

for (const cfg of E.ALL()) {
  if (only && cfg.key !== only) continue;
  const tgt = TARGET[cfg.key];
  const rows = [];
  for (let k = 0; k < SEEDS; k++) {
    const seed = cfg.seed + k * 1000;   // 候选：配置 seed 及其“同系列”变体
    const nov = times(cfg, seed, E.PROFILES.novice, RUNS);
    const exp = times(cfg, seed, E.PROFILES.expert, Math.max(10, RUNS / 4));
    rows.push({ seed, T: quantile(nov, tgt), novMed: quantile(nov, 0.5), expMed: quantile(exp, 0.5), expMax: exp[exp.length - 1] });
  }
  const Ts = rows.map(r => r.T).sort((a, b) => a - b);
  const medT = quantile(Ts, 0.5);
  rows.sort((a, b) => Math.abs(a.T - medT) - Math.abs(b.T - medT));
  const pick = rows[0];
  const suggest = Math.max(Math.ceil(pick.T / 5) * 5, Math.ceil((pick.expMax + 15) / 5) * 5);
  lines.push(`## ${cfg.key}「${cfg.name}」`, '');
  lines.push(`- 当前配置：seed ${cfg.seed}，时限 ${cfg.time}s，速度 ${cfg.speed}，间距 ${cfg.spacing}，寿司 ${JSON.stringify(cfg.sushi)}`);
  lines.push(`- 目标 novice 首过率 ${(tgt * 100).toFixed(0)}%；${SEEDS} 个候选 seed 的建议时限范围 ${Ts[0].toFixed(0)}–${Ts[Ts.length - 1].toFixed(0)}s，中位 ${medT.toFixed(0)}s`);
  lines.push(`- 典型 seed：${pick.seed}（novice 中位 ${pick.novMed.toFixed(1)}s，expert 中位 ${pick.expMed.toFixed(1)}s / 最慢 ${pick.expMax.toFixed(1)}s）→ 建议时限 ${suggest}s`);
  // 用当前配置的 seed+时限做最终核验
  const res = Object.keys(E.PROFILES).map(k => {
    const s = E.stats(cfg, E.PROFILES[k], RUNS);
    return `${E.PROFILES[k].label} ${(s.rate * 100).toFixed(0)}%（中位 ${isNaN(s.median) ? '-' : s.median.toFixed(1)}s）`;
  });
  lines.push(`- 当前配置核验：${res.join('；')}`, '');
  console.log(lines.slice(-5).join('\n'));
}
if (!only) {
  fs.mkdirSync(path.join(E.ROOT, 'out'), { recursive: true });
  fs.writeFileSync(path.join(E.ROOT, 'out', 'tuning.md'), lines.join('\n') + '\n');
}
