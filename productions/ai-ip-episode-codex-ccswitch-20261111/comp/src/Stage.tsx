import React from 'react';
import { OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import camData from '../public/gen/stage_cam.json';
import { FPS, T, TAGS, type Tag } from './data';
import { C, CheckIcon, FONT, LockIcon, Pill, cardStyle, clamp01, easeInOut, enter, leave, lerp, pop, useT } from './ui';

/** 录屏卡片的两种位置：钩子里的小卡片 / 步骤段的主画面 */
export const STAGE_MINI = { x: 470, y: 400, w: 550, h: 533 };
export const STAGE_FULL = { x: 24, y: 250, w: 1032, h: 1000 };
const SRC_W = 1032;
const AR = 1032 / 1000;
const GROW = 0.62;

type Cam = { cx: number; cy: number; w: number };
const cams = (camData as unknown as { f0: number; f1: number; frames: Record<string, Cam> });

export function stageRect(t: number) {
  const u = easeInOut(clamp01((t - T.hookEnd) / GROW));
  return {
    x: lerp(STAGE_MINI.x, STAGE_FULL.x, u),
    y: lerp(STAGE_MINI.y, STAGE_FULL.y, u),
    w: lerp(STAGE_MINI.w, STAGE_FULL.w, u),
    h: lerp(STAGE_MINI.h, STAGE_FULL.h, u),
    u,
  };
}

/** 源画面坐标 → 录屏卡片内坐标（按 1032×1000 计） */
function toStage(cam: Cam, x: number, y: number) {
  const s = SRC_W / cam.w;
  const h = cam.w / AR;
  return { x: (x - (cam.cx - cam.w / 2)) * s, y: (y - (cam.cy - h / 2)) * s, s };
}

const TagView: React.FC<{ tag: Tag; cam: Cam; t: number }> = ({ tag, cam, t }) => {
  const a = pop(t, tag.t0, 0.22);
  const out = leave(t, tag.t1, 0.12);
  const opacity = a.opacity * out;
  if (opacity <= 0) return null;
  const label = tag.text ? (
    <Pill size={40} style={{ boxShadow: `5px 5px 0 ${C.red}`, border: `3px solid ${C.white}` }}>
      {tag.icon === 'lock' ? <LockIcon s={36} /> : tag.icon === 'check' ? <CheckIcon s={40} /> : null}
      {tag.text}
    </Pill>
  ) : null;

  if (tag.pin) {
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, [tag.pin === 'top' ? 'top' : 'bottom']: 26, display: 'flex', justifyContent: 'center', opacity, transform: `scale(${a.scale})` }}>
        {label}
      </div>
    );
  }
  const r = tag.rect!;
  const p0 = toStage(cam, r[0], r[1]);
  const p1 = toStage(cam, r[2], r[3]);
  const pad = 10;
  const box = { x: p0.x - pad, y: p0.y - pad, w: p1.x - p0.x + pad * 2, h: p1.y - p0.y + pad * 2 };
  const pulse = 1 + 0.035 * Math.sin((t - tag.t0) * Math.PI * 2 * 1.6);
  const gap = 20;
  const dx = tag.dx ?? 0;
  const dy = tag.dy ?? 0;
  let ls: React.CSSProperties = {};
  if (tag.side === 'below') ls = { left: box.x + box.w / 2 + dx, top: box.y + box.h + gap + dy, transform: `translateX(-50%) scale(${a.scale})`, transformOrigin: 'top center' };
  if (tag.side === 'above') ls = { left: box.x + box.w / 2 + dx, top: box.y - gap + dy, transform: `translate(-50%,-100%) scale(${a.scale})`, transformOrigin: 'bottom center' };
  if (tag.side === 'left') ls = { left: box.x - gap + dx, top: box.y + box.h / 2 + dy, transform: `translate(-100%,-50%) scale(${a.scale})`, transformOrigin: 'right center' };
  if (tag.side === 'right') ls = { left: box.x + box.w + gap + dx, top: box.y + box.h / 2 + dy, transform: `translateY(-50%) scale(${a.scale})`, transformOrigin: 'left center' };
  return (
    <div style={{ opacity }}>
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          border: `7px solid ${C.red}`,
          borderRadius: tag.round ? '50%' : 18,
          boxShadow: `0 0 0 4px rgba(255,255,255,0.9), 0 0 0 4px rgba(255,255,255,0.9) inset`,
          transform: `scale(${pulse * interpolate(a.scale, [0.6, 1], [1.5, 1])})`,
          boxSizing: 'border-box',
        }}
      />
      {label ? <div style={{ position: 'absolute', ...ls }}>{label}</div> : null}
    </div>
  );
};

/** 「实测连通」印章：只在真实的连通提示出现后盖下 */
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 53.42;
  if (t < t0) return null;
  const u = clamp01((t - t0) / 0.16);
  const scale = interpolate(u, [0, 1], [2.4, 1]);
  const out = leave(t, 54.08, 0.1);
  return (
    <div
      style={{
        position: 'absolute',
        right: 70,
        top: 250,
        width: 300,
        height: 300,
        borderRadius: '50%',
        border: `12px solid ${C.red}`,
        color: C.red,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        transform: `rotate(-12deg) scale(${scale})`,
        opacity: clamp01(u * 2) * out * 0.94,
        boxShadow: `0 0 0 5px ${C.white}, inset 0 0 0 5px ${C.white}, inset 0 0 0 9px ${C.red}`,
        background: 'rgba(255,255,255,0.86)',
      }}
    >
      <div style={{ fontSize: 96, lineHeight: 1.02, letterSpacing: 6 }}>实测</div>
      <div style={{ fontSize: 96, lineHeight: 1.02, letterSpacing: 6 }}>连通</div>
    </div>
  );
};

export const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useT();
  if (t < T.stageIn || t > T.tip + 0.5) return null;
  const r = stageRect(t);
  const k = r.w / STAGE_FULL.w;
  const inn = pop(t, T.stageIn, 0.26);
  const outU = clamp01((t - T.tip) / 0.28);
  const opacity = inn.opacity * (1 - outU);
  const cam = cams.frames[String(Math.min(cams.f1 - 1, Math.max(cams.f0, frame)))];
  const full = r.u > 0.98 && outU === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y - outU * 70,
        width: r.w,
        height: r.h,
        opacity,
        transform: `scale(${inn.scale * (1 - outU * 0.08)})`,
        background: C.white,
        ...cardStyle(lerp(22, 30, r.u), lerp(7, 10, r.u), 4),
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: STAGE_FULL.w, height: STAGE_FULL.h, transform: `scale(${k})`, transformOrigin: '0 0', fontFamily: FONT }}>
        <Sequence from={cams.f0} layout="none">
          <OffthreadVideo src={staticFile('gen/stage.mp4')} muted style={{ position: 'absolute', left: -4, top: -4, width: STAGE_FULL.w, height: STAGE_FULL.h }} />
        </Sequence>
        {full && cam ? TAGS.map((tag, i) => (t >= tag.t0 - 0.02 && t <= tag.t1 ? <TagView key={i} tag={tag} cam={cam} t={t} /> : null)) : null}
        {full ? <Stamp t={t} /> : null}
        {/* 钩子里的小卡片：标明这是实拍预告 */}
        {r.u < 0.5 ? (
          <div style={{ position: 'absolute', left: 30, top: 30, opacity: 1 - r.u * 2, transform: 'scale(1.7)', transformOrigin: '0 0' }}>
            <Pill size={30} bg={C.red}>
              实拍
            </Pill>
          </div>
        ) : null}
      </div>
    </div>
  );
};
