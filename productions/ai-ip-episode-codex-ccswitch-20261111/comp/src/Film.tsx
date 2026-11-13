import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { allText } from './data';
import { Hook, KLines, Kicker } from './Hook';
import { Human } from './Human';
import { Outro } from './Outro';
import { Stage } from './Stage';
import { Captions, Footer, StepHeader } from './Steps';
import { C, FONT } from './ui';

function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const text = allText();
    const fams = [900, 800, 700].flatMap((w) => [`${w} 100px "Noto Sans SC"`, `${w} 100px "Inter Tight"`]);
    Promise.all(fams.map((f) => document.fonts.load(f, text)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
}

/** 抖音界面大致遮挡区（经验估计，未经真机核对），仅 draft 校样时叠加 */
const ZONES = [
  { name: '顶部栏', x: 0, y: 0, w: 1080, h: 150 },
  { name: '右侧按钮', x: 936, y: 780, w: 144, h: 760 },
  { name: '文案/音乐/底栏', x: 0, y: 1560, w: 1080, h: 360 },
];

export const Film: React.FC<{ draft?: boolean }> = ({ draft }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, color: C.ink, overflow: 'hidden' }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(rgba(23,20,15,0.10) 2px, transparent 2.6px)`, backgroundSize: '36px 36px' }} />
      <Footer />
      <Kicker />
      <KLines />
      <Hook />
      <Outro />
      <StepHeader />
      <Stage />
      <Human />
      <Captions />
      {draft ? ZONES.map((z) => (
        <div key={z.name} style={{ position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, background: 'rgba(0,120,255,0.16)', border: '3px dashed rgba(0,90,255,0.8)', color: '#0050d0', fontSize: 24, padding: 6, boxSizing: 'border-box' }}>{z.name}</div>
      )) : null}
    </AbsoluteFill>
  );
};
