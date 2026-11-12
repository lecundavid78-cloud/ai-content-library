import React from 'react';
import { Img, staticFile } from 'remotion';
import { PREVIEW_STEPS, T } from './data';
import { C, CheckIcon, cardStyle, leave, pop, useT } from './ui';

/** 三步打勾总结（真实录屏静帧，已打码/模糊）+ 片尾关注引导 */
export const Outro: React.FC = () => {
  const t = useT();
  if (t < T.tip) return null;
  const recapOut = leave(t, T.cta - 0.05, 0.16);
  const ring = 1 + 0.06 * Math.sin((t - T.cta) * Math.PI * 2 * 1.4);
  const plus = pop(t, T.cta + 0.35, 0.26);
  return (
    <>
      {t < T.cta
        ? PREVIEW_STEPS.map((s, i) => {
            const a = pop(t, T.tip + 0.35 + i * 0.12, 0.24);
            const ck = pop(t, T.tip + 0.75 + i * 0.16, 0.22);
            return (
              <div key={s.n} style={{ position: 'absolute', left: 60 + i * 338, top: 676, width: 284, height: 252, opacity: a.opacity * recapOut, transform: `scale(${a.scale}) translateY(${(1 - recapOut) * 30}px)` }}>
                <div style={{ position: 'absolute', inset: 0, background: C.white, ...cardStyle(22, 7, 4) }}>
                  <Img src={staticFile(`gen/recap${s.n}.png`)} style={{ position: 'absolute', left: -4, top: -4, width: 284, height: 275 }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: C.ink, color: C.white, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                    {'①②③'[s.n - 1]} {s.label}
                  </div>
                </div>
                <div style={{ position: 'absolute', right: -18, top: -22, opacity: ck.opacity, transform: `scale(${ck.scale})` }}>
                  <CheckIcon s={68} />
                </div>
              </div>
            );
          })
        : null}
      {t >= T.cta + 0.35 ? (
        <div
          style={{
            position: 'absolute',
            left: 912,
            top: 190,
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: C.ink,
            border: `6px solid ${C.white}`,
            color: C.white,
            fontSize: 92,
            fontWeight: 900,
            lineHeight: '86px',
            textAlign: 'center',
            boxSizing: 'border-box',
            opacity: plus.opacity,
            transform: `scale(${plus.scale * ring})`,
          }}
        >
          +
        </div>
      ) : null}
    </>
  );
};
