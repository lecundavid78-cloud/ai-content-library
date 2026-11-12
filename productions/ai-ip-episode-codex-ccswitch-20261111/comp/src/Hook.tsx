import React from 'react';
import { interpolate } from 'remotion';
import { CONTRAST, KLINES, PREVIEW_STEPS, PROMPT, T, type KLine } from './data';
import { C, CheckIcon, Pill, Segs, backOut, cardStyle, clamp01, easeOut, enter, leave, pop, useT } from './ui';

const LEFT = 60;

/** 上半区的大字口播行（钩子、小贴士、片尾共用） */
export const KLines: React.FC = () => {
  const t = useT();
  return (
    <>
      {KLINES.map((k: KLine, i) => {
        const t0 = k.t0 <= 0 ? -0.1 : k.t0;
        if (t < t0 || t > k.t1) return null;
        const u = enter(t, t0, 0.2, backOut);
        const out = leave(t, k.t1, 0.13);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: LEFT,
              top: k.y,
              fontSize: k.size,
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              color: C.ink,
              whiteSpace: 'nowrap',
              opacity: clamp01((t - t0) / 0.07) * out,
              transform: `translateY(${interpolate(u, [0, 1], [k.size * 0.3, 0]) - (1 - out) * 26}px) scale(${interpolate(u, [0, 1], [0.9, 1])})`,
              transformOrigin: 'left center',
            }}
          >
            <Segs segs={k.segs} size={k.size} />
          </div>
        );
      })}
    </>
  );
};

/** 左上角栏目名 */
export const Kicker: React.FC = () => {
  const t = useT();
  const show = (t < 12.05 ? leave(t, 12.05) : 0) + (t >= T.tip + 0.2 ? enter(t, T.tip + 0.2) : 0);
  if (show <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: LEFT, top: 168, opacity: show }}>
      <Pill size={28} outline>
        阿泽 · AI 实操
      </Pill>
    </div>
  );
};

/** 钩子一：C 盘已满的示意条（图形示意，不是系统界面，也不演示清理结果） */
const DiskBar: React.FC<{ t: number }> = ({ t }) => {
  if (t > 2.42) return null;
  const out = leave(t, 2.42, 0.13);
  const fill = interpolate(easeOut(clamp01(t / 0.85)), [0, 1], [58, 97]);
  const shake = t > 0.85 && t < 1.1 ? Math.sin((t - 0.85) * 80) * 5 * (1 - (t - 0.85) / 0.25) : 0;
  return (
    <div style={{ position: 'absolute', left: LEFT, top: 700, width: 960, opacity: out, transform: `translateX(${shake}px)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 40, fontWeight: 800, marginBottom: 14 }}>
        <span>本地磁盘 (C:)</span>
        <span style={{ color: C.red, fontWeight: 900, opacity: clamp01((t - 0.8) / 0.1) }}>空间不足</span>
      </div>
      <div style={{ height: 84, background: C.white, ...cardStyle(24, 8, 5) }}>
        <div
          style={{
            width: `${fill}%`,
            height: '100%',
            background: `repeating-linear-gradient(-55deg, ${C.red} 0 26px, #D63A22 26px 52px)`,
            borderRight: `5px solid ${C.ink}`,
          }}
        />
      </div>
    </div>
  );
};

/** 钩子二：「一句话」示意输入框 + 绿色效果示意卡（用户 V2 要求）。只是示意，不是真实运行结果 */
const PromptBubble: React.FC<{ t: number }> = ({ t }) => {
  const P = PROMPT;
  if (t < P.t0 || t > P.t1) return null;
  const a = pop(t, P.t0, 0.24);
  const out = leave(t, P.t1, 0.13);
  const n = Math.floor(interpolate(t, [P.typeFrom, P.typeTo], [0, P.text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const caret = Math.floor(t * 3) % 2 === 0;
  const sent = pop(t, P.send, 0.2);
  const done = pop(t, P.done, 0.3);
  return (
    <div style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: LEFT, top: 372, width: 960, opacity: a.opacity, transform: `scale(${a.scale})`, transformOrigin: 'left top' }}>
        <div style={{ height: 150, background: C.white, display: 'flex', alignItems: 'center', padding: '0 26px 0 36px', ...cardStyle(40, 10, 5), overflow: 'visible' }}>
          <div style={{ flex: 1, fontSize: 44, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            {P.text.slice(0, n)}
            <span style={{ opacity: caret && n < P.text.length ? 1 : 0, color: C.red }}>|</span>
          </div>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: t >= P.send ? C.red : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t >= P.send ? sent.scale : 1})` }}>
            <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>
      {t >= P.done ? (
        <div
          style={{
            position: 'absolute', left: LEFT, top: 552, width: 960, height: 132,
            background: C.green, color: C.white,
            display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px',
            ...cardStyle(30, 10, 5), overflow: 'visible',
            opacity: done.opacity, transform: `translateY(${(1 - done.scale) * -40}px) scale(${done.scale})`, transformOrigin: 'center top',
          }}
        >
          <CheckIcon s={78} color={C.green} bg={C.white} />
          <div style={{ fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            <Segs segs={P.doneText} size={46} emColor={C.white} emText={C.green} />
          </div>
          <div style={{ position: 'absolute', right: 18, top: -26 }}>
            <Pill size={24} bg={C.white} color={C.green} style={{ border: `3px solid ${C.ink}` }}>
              效果示意
            </Pill>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** 钩子三：网页 AI vs Codex */
const Contrast: React.FC<{ t: number }> = ({ t }) => {
  const { a, b, t1 } = CONTRAST;
  if (t < a.t || t > t1) return null;
  const out = leave(t, t1, 0.14);
  const pa = pop(t, a.t, 0.24);
  const pBig = pop(t, a.tBig, 0.2);
  const pb = pop(t, b.t, 0.26);
  const dim = clamp01((t - b.t) / 0.2);
  const strike = easeOut(clamp01((t - (a.tBig + 0.42)) / 0.22));
  const p2 = enter(t, b.t2, 0.2, backOut);
  const p3 = pop(t, b.t3, 0.24);
  return (
    <div style={{ opacity: out }}>
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: 236,
          width: 960,
          height: 252,
          background: C.paperDeep,
          border: `4px dashed ${C.mute}`,
          borderRadius: 30,
          boxSizing: 'border-box',
          opacity: pa.opacity * (1 - dim * 0.35),
          transform: `scale(${pa.scale * (1 - dim * 0.03)})`,
          transformOrigin: 'left top',
        }}
      >
        <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 52, fontWeight: 800, color: '#5F584E' }}>{a.label}</div>
        <div style={{ position: 'absolute', left: 40, top: 96, fontSize: 124, fontWeight: 900, color: C.mute, lineHeight: 1.1, opacity: pBig.opacity, transform: `scale(${pBig.scale})`, transformOrigin: 'left center' }}>
          {a.big}
          <div style={{ position: 'absolute', left: -8, top: '54%', height: 12, width: `${strike * 104}%`, background: C.red, borderRadius: 6 }} />
        </div>
        <svg style={{ position: 'absolute', right: 44, top: 50 }} width={170} height={150} viewBox="0 0 170 150" fill="none" stroke={C.mute} strokeWidth={8} strokeLinejoin="round">
          <path d="M10 14h96a10 10 0 0 1 10 10v48a10 10 0 0 1-10 10H50l-24 22V82H10A6 6 0 0 1 4 76V20a6 6 0 0 1 6-6z" />
          <path d="M132 58h22a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10h-6v20l-22-20H92" />
        </svg>
      </div>
      {t >= b.t ? (
        <div
          style={{
            position: 'absolute',
            left: LEFT,
            top: 522,
            width: 960,
            height: 404,
            background: C.ink,
            color: C.white,
            ...cardStyle(30, 12, 4, C.red),
            opacity: pb.opacity,
            transform: `scale(${pb.scale})`,
            transformOrigin: 'left center',
          }}
        >
          <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 64, fontWeight: 900 }}>{b.l1}</div>
          <div style={{ position: 'absolute', left: 40, top: 120, fontSize: 70, fontWeight: 800, opacity: clamp01((t - b.t2) / 0.07), transform: `translateY(${(1 - p2) * 22}px)` }}>{b.l2}</div>
          {t >= b.t3 ? (
            <div style={{ position: 'absolute', left: 34, top: 216, fontSize: 142, fontWeight: 900, lineHeight: 1.1, opacity: p3.opacity, transform: `scale(${p3.scale})`, transformOrigin: 'left center' }}>
              <Segs segs={[{ em: b.big }]} size={142} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** 钩子四：录屏小卡片左侧的三步预告，与实拍快闪逐一对应 */
const PreviewSteps: React.FC<{ t: number }> = ({ t }) => {
  if (t < 12.1 || t > T.hookEnd + 0.3) return null;
  const out = leave(t, T.hookEnd + 0.25, 0.25);
  return (
    <>
      {PREVIEW_STEPS.map((s, i) => {
        const a = pop(t, 12.15 + i * 0.08, 0.22);
        const lit = t >= s.t;
        const hit = pop(t, s.t, 0.2);
        return (
          <div
            key={s.n}
            style={{
              position: 'absolute',
              left: LEFT,
              top: 400 + i * 186,
              width: 376,
              height: 160,
              background: lit ? C.red : C.white,
              color: lit ? C.white : C.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '0 20px',
              ...cardStyle(28, 8, 4),
              opacity: a.opacity * out,
              transform: `translateX(${(1 - out) * -60}px) scale(${a.scale * (lit ? hit.scale * 0.5 + 0.5 : 1)})`,
              transformOrigin: 'left center',
            }}
          >
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: lit ? C.white : C.ink, color: lit ? C.red : C.white, fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: s.label.length > 4 ? 38 : 54, fontWeight: 900, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{s.label}</div>
          </div>
        );
      })}
    </>
  );
};

export const Hook: React.FC = () => {
  const t = useT();
  if (t > T.hookEnd + 0.4) return null;
  return (
    <>
      <DiskBar t={t} />
      <PromptBubble t={t} />
      <Contrast t={t} />
      <PreviewSteps t={t} />
    </>
  );
};
