import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { FPS, type Seg } from './data';

export const C = {
  paper: '#F2EDE4',
  paperDeep: '#E7E0D3',
  ink: '#17140F',
  mute: '#8E867A',
  red: '#E8432A',
  white: '#FFFFFF',
  green: '#16A34A',
};
export const FONT = `"Inter Tight", "Noto Sans SC", sans-serif`;
export const W = 1080;
export const H = 1920;

/** 当前时间（秒） */
export const useT = () => useCurrentFrame() / FPS;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const backOut = Easing.out(Easing.back(1.7));

/** 入场进度 0→1 */
export const enter = (t: number, t0: number, dur = 0.2, e: (x: number) => number = easeOut) => e(clamp01((t - t0) / dur));
/** 退场进度 1→0 */
export const leave = (t: number, t1: number, dur = 0.14) => 1 - clamp01((t - (t1 - dur)) / dur);

/** 弹入：返回 transform 用的 scale 与 opacity */
export function pop(t: number, t0: number, dur = 0.24) {
  const u = clamp01((t - t0) / dur);
  return { scale: interpolate(backOut(u), [0, 1], [0.6, 1]), opacity: clamp01((t - t0) / 0.07) };
}

/** 一行带重点词的文字。重点词 = 朱红底白字 */
export const Segs: React.FC<{ segs: Seg[]; size: number; emColor?: string; emText?: string }> = ({ segs, size, emColor = C.red, emText = C.white }) => (
  <>
    {segs.map((s, i) =>
      typeof s === 'string' ? (
        <span key={i}>{s}</span>
      ) : (
        <span
          key={i}
          style={{
            background: emColor,
            color: emText,
            padding: `${size * 0.02}px ${size * 0.14}px ${size * 0.06}px`,
            margin: `0 ${size * 0.06}px`,
            borderRadius: size * 0.16,
            display: 'inline-block',
            lineHeight: 1.12,
          }}
        >
          {s.em}
        </span>
      ),
    )}
  </>
);

/** 墨线硬投影卡片：全片统一的容器语言 */
export const cardStyle = (radius = 30, shadow = 10, border = 4, shadowColor = C.ink): React.CSSProperties => ({
  border: `${border}px solid ${C.ink}`,
  borderRadius: radius,
  boxShadow: `${shadow}px ${shadow}px 0 ${shadowColor}`,
  overflow: 'hidden',
  boxSizing: 'border-box',
});

export const Pill: React.FC<{ children: React.ReactNode; size?: number; bg?: string; color?: string; outline?: boolean; style?: React.CSSProperties }> = ({ children, size = 30, bg = C.ink, color = C.white, outline, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.3,
      background: outline ? 'transparent' : bg,
      color: outline ? C.ink : color,
      border: outline ? `3px solid ${C.ink}` : 'none',
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1,
      padding: `${size * 0.36}px ${size * 0.6}px ${size * 0.4}px`,
      borderRadius: size * 1.2,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const LockIcon: React.FC<{ s: number; color?: string }> = ({ s, color = C.white }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" fill={color} stroke="none" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const CheckIcon: React.FC<{ s: number; color?: string; bg?: string }> = ({ s, color = C.white, bg = C.green }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={bg} />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
