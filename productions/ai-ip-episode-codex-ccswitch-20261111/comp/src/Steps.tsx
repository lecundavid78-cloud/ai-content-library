import React from 'react';
import { CUES, STEPS, T } from './data';
import { C, Pill, Segs, backOut, clamp01, enter, leave, pop, useT } from './ui';

/** 步骤标题栏：第 n 步 + 标题 + 三段进度 */
export const StepHeader: React.FC = () => {
  const t = useT();
  if (t < T.hookEnd + 0.15 || t > T.tip + 0.3) return null;
  const step = STEPS.find((s) => t >= s.t0 && t < s.t1) ?? STEPS[STEPS.length - 1];
  const a = pop(t, Math.max(step.t0, T.hookEnd + 0.15), 0.24);
  const show = enter(t, T.hookEnd + 0.15, 0.2) * leave(t, T.tip + 0.3, 0.2);
  return (
    <div style={{ position: 'absolute', left: 30, right: 30, top: 158, height: 76, display: 'flex', alignItems: 'center', opacity: show }}>
      <div style={{ transform: `scale(${a.scale})`, transformOrigin: 'left center' }}>
        <Pill size={42} bg={C.red}>第 {step.n} 步</Pill>
      </div>
      <div style={{ marginLeft: 20, fontSize: 52, fontWeight: 900, letterSpacing: '-0.01em', whiteSpace: 'nowrap', opacity: a.opacity, transform: `translateX(${(1 - a.scale) * 60}px)` }}>{step.title}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{ width: 58, height: 16, borderRadius: 8, border: `3px solid ${C.ink}`, background: s.n <= step.n ? C.red : 'transparent', boxSizing: 'border-box' }} />
        ))}
      </div>
    </div>
  );
};

/** 步骤段字幕：数字人右侧，逐行跟着口播出现 */
export const Captions: React.FC = () => {
  const t = useT();
  const cue = CUES.find((c) => t >= c.t0 && t <= c.t1);
  if (!cue) return null;
  const out = leave(t, cue.t1, 0.1);
  return (
    <div style={{ position: 'absolute', left: 326, top: 1272, width: 640, opacity: out }}>
      {cue.lines.map((l, i) => {
        if (t < l.t) return null;
        const u = enter(t, l.t, 0.16, backOut);
        return (
          <div key={i} style={{ fontSize: 56, fontWeight: 900, lineHeight: '82px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', opacity: clamp01((t - l.t) / 0.06), transform: `translateY(${(1 - u) * 18}px)` }}>
            <Segs segs={l.segs} size={56} />
          </div>
        );
      })}
    </div>
  );
};

/** 底栏：落在抖音文案/底栏遮挡区内，只放可有可无的路线信息；深色底保证平台白字可读 */
export const Footer: React.FC = () => {
  const t = useT();
  const inSteps = t >= T.hookEnd + 0.3 && t < T.tip + 0.2;
  const step = STEPS.find((s) => t >= s.t0 && t < s.t1);
  const labels = ['下载', '加 DeepSeek', '开路由'];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1604, bottom: 0, background: C.ink, borderTop: `6px solid ${C.red}` }}>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 34, height: 64, display: 'flex', alignItems: 'center', gap: 18, color: '#B9B0A2', fontSize: 34, fontWeight: 800, whiteSpace: 'nowrap' }}>
        {inSteps && step ? (
          labels.map((l, i) => {
            const on = step.n === i + 1;
            const done = step.n > i + 1;
            return (
              <React.Fragment key={l}>
                {i > 0 ? <div style={{ width: 34, height: 4, background: done || on ? C.red : '#4A443B', borderRadius: 2 }} /> : null}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: on ? C.white : done ? '#B9B0A2' : '#6F685D' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: on ? C.red : 'transparent', border: on ? 'none' : `3px solid ${done ? '#B9B0A2' : '#6F685D'}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: on ? C.white : 'inherit', lineHeight: 1 }}>{done ? '✓' : i + 1}</div>
                  {l}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <>
            <span style={{ color: C.white }}>阿泽 · AI 实操</span>
            <div style={{ width: 34, height: 4, background: C.red, borderRadius: 2 }} />
            <span>三步给 Codex 换上 DeepSeek</span>
          </>
        )}
      </div>
    </div>
  );
};
