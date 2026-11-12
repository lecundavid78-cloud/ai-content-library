import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { T } from './data';
import { C, FONT, cardStyle, clamp01, easeInOut, lerp, useT } from './ui';

/** 数字人（素材 F，全程 1.0 倍速连续播放，不重排、不重新生成，口型与口播保持同步）。
 *  钩子/片尾：中等大小的卡片（约占画面 1/4）；步骤段：左下画中画。两种状态之间连续变形，没有硬切。 */
const HOOK = { x: 130, y: 962, w: 820, h: 610, s: 820 / 1080, sx: 0, sy: 110 };
const PIP = { x: 36, y: 1226, w: 260, h: 320, s: 260 / 700, sx: 190, sy: 110 };
const MORPH = 0.62;

export const Human: React.FC = () => {
  const t = useT();
  const u = easeInOut(clamp01((t - T.hookEnd) / MORPH)) * (1 - easeInOut(clamp01((t - T.tip) / MORPH)));
  const x = lerp(HOOK.x, PIP.x, u);
  const y = lerp(HOOK.y, PIP.y, u);
  const w = lerp(HOOK.w, PIP.w, u);
  const h = lerp(HOOK.h, PIP.h, u);
  const s = lerp(HOOK.s, PIP.s, u);
  const sx = lerp(HOOK.sx, PIP.sx, u);
  const sy = lerp(HOOK.sy, PIP.sy, u);
  const labelSize = lerp(26, 20, u);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: '#D9CECB', ...cardStyle(lerp(34, 26, u), lerp(10, 7, u), 4) }}>
      <OffthreadVideo
        src={staticFile('gen/human.mp4')}
        muted
        style={{ position: 'absolute', left: -sx * s - 4, top: -sy * s - 4, width: 1080 * s, height: 1920 * s, maxWidth: 'none' }}
      />
      <div
        style={{
          position: 'absolute',
          left: lerp(18, 10, u),
          bottom: lerp(16, 10, u),
          fontFamily: FONT,
          fontSize: labelSize,
          fontWeight: 700,
          color: C.white,
          background: 'rgba(23,20,15,0.62)',
          padding: `${labelSize * 0.28}px ${labelSize * 0.55}px ${labelSize * 0.32}px`,
          borderRadius: labelSize,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {u > 0.5 ? 'AI 数字人' : 'AI 数字人形象'}
      </div>
    </div>
  );
};
