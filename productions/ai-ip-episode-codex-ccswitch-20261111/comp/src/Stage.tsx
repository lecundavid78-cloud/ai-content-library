import React from 'react';
import { OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import camData from '../public/gen/stage_cam.json';
import { FPS, T, TAGS, type Tag } from './data';
import { C, CheckIcon, FONT, LockIcon, Pill, cardStyle, clamp01, easeInOut, easeOut, enter, leave, lerp, pop, useT } from './ui';

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

/** 第 3 步后半（V2）：用 UI 组件画出「聊天窗口右下角局部」，对齐口播「再重开 Codex，右下角显示 DeepSeek 就连上了」。
 *  这是界面示意，不是录屏：素材里没有 Codex 窗口镜头，画面左上角标「界面示意」。 */
const Mock: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.mock;
  if (t < t0 - 0.05) return null;
  const inU = easeInOut(clamp01((t - t0) / 0.32));
  const relaunch = t < 46.75; // 「再重开 Codex」：短暂的重启加载
  const appear = pop(t, 46.75, 0.3);
  const frameU = easeOut(clamp01((t - 47.5) / 0.25)); // 「右下角」红框
  const lens = pop(t, 47.96, 0.3); // 「显示 DeepSeek」放大镜
  const ok = pop(t, 48.74, 0.26); // 「就连上了」
  const spin = (t * 360 * 1.4) % 360;
  const dot = 0.6 + 0.4 * Math.abs(Math.sin((t - 48.74) * Math.PI * 1.6));
  // 芯片（模型标签）在卡片坐标系里的位置
  const chip = { x: 556, y: 846, w: 236, h: 64 };
  const Chip: React.FC<{ k?: number }> = ({ k = 1 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 * k, height: chip.h * k, padding: `0 ${20 * k}px`, borderRadius: chip.h * k, background: '#F1EFEA', border: `${2 * k}px solid #DDD8CF`, fontSize: 30 * k, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
      <div style={{ width: 16 * k, height: 16 * k, borderRadius: '50%', background: t >= 48.74 ? C.green : '#9AA0A6', opacity: t >= 48.74 ? dot : 1 }} />
      DeepSeek
      <span style={{ fontSize: 22 * k, color: '#7B756B' }}>▾</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E9E6E0', opacity: inU, fontFamily: FONT }}>
      {/* 窗口：只画右下角局部，左上方延伸出画 */}
      <div style={{ position: 'absolute', left: -60, top: -60, width: 1052, height: 1010, background: C.white, borderRadius: 34, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '2px solid #DCD7CE', overflow: 'hidden', transform: `scale(${relaunch ? 0.985 : appear.scale * 0.015 + 0.985})` }}>
        {relaunch ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
            <svg width={84} height={84} viewBox="0 0 50 50" style={{ transform: `rotate(${spin}deg)` }}>
              <circle cx="25" cy="25" r="20" fill="none" stroke="#E4E0D8" strokeWidth="6" />
              <path d="M25 5a20 20 0 0 1 20 20" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#5F584E' }}>正在重新启动 Codex…</div>
          </div>
        ) : (
          <div style={{ opacity: appear.opacity }}>
            {/* 对话区：示意占位条 */}
            <div style={{ position: 'absolute', right: 70, top: 200, width: 520, height: 92, borderRadius: 28, background: '#F1EFEA' }} />
            <div style={{ position: 'absolute', left: 120, top: 340, width: 640, height: 34, borderRadius: 17, background: '#EEEBE5' }} />
            <div style={{ position: 'absolute', left: 120, top: 396, width: 520, height: 34, borderRadius: 17, background: '#EEEBE5' }} />
            <div style={{ position: 'absolute', left: 120, top: 452, width: 580, height: 34, borderRadius: 17, background: '#EEEBE5' }} />
            {/* 输入框 */}
            <div style={{ position: 'absolute', left: 100, top: 700, width: 892, height: 270, borderRadius: 34, border: '3px solid #D6D1C7', background: C.white, boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', left: 36, top: 36, fontSize: 36, fontWeight: 600, color: '#A8A196' }}>输入任务，让 Codex 动手…</div>
              <div style={{ position: 'absolute', left: 30, bottom: 30, width: 64, height: 64, borderRadius: '50%', border: '3px solid #D6D1C7', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#7B756B', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', right: 30, bottom: 30, width: 72, height: 72, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </div>
            </div>
          </div>
        )}
      </div>
      {!relaunch ? (
        <>
          {/* 模型标签（卡片坐标） */}
          <div style={{ position: 'absolute', left: chip.x, top: chip.y, opacity: appear.opacity }}>
            <Chip />
          </div>
          {/* 红框 */}
          {t >= 47.5 ? (
            <div style={{ position: 'absolute', left: chip.x - 14, top: chip.y - 14, width: chip.w + 28, height: chip.h + 28, border: `7px solid ${C.red}`, borderRadius: 26, boxSizing: 'border-box', boxShadow: '0 0 0 4px rgba(255,255,255,0.9)', opacity: frameU, transform: `scale(${1.4 - 0.4 * frameU})` }} />
          ) : null}
          {/* 放大镜：镜片在标签正上方，放大显示模型标签；手柄朝右上，避开输入框 */}
          {t >= 47.96 ? (
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1032, height: 1000, opacity: lens.opacity }}>
              <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1032} height={1000}>
                <line x1={chip.x + chip.w / 2} y1={chip.y - 16} x2={600} y2={736} stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" />
                <line x1={760} y1={420} x2={880} y2={300} stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', left: 400, top: 340, width: 400, height: 400, borderRadius: '50%', background: C.white, border: `14px solid ${C.ink}`, boxShadow: `10px 10px 0 ${C.red}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transform: `scale(${lens.scale})` }}>
                <Chip k={1.42} />
              </div>
            </div>
          ) : null}
          {/* 就连上了 */}
          {t >= 48.74 ? (
            <div style={{ position: 'absolute', left: 60, top: 150, opacity: ok.opacity, transform: `scale(${ok.scale})`, transformOrigin: 'left center' }}>
              <Pill size={44} bg={C.green} style={{ border: `4px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}` }}>
                <CheckIcon s={50} color={C.green} bg={C.white} />
                已连上 DeepSeek
              </Pill>
            </div>
          ) : null}
        </>
      ) : null}
      <div style={{ position: 'absolute', left: 26, top: 26 }}>
        <Pill size={30} bg={C.paper} color={C.ink} style={{ border: `3px solid ${C.ink}` }}>界面示意</Pill>
      </div>
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
        {t >= T.mock - 0.05 ? <Mock t={t} /> : null}
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
