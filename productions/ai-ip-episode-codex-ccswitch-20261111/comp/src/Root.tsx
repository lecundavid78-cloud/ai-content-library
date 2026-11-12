import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/800.css';
import '@fontsource/noto-sans-sc/900.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/inter-tight/900.css';
import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './data';
import { Film } from './Film';

// 成片 1930 帧 = 64.33s（数字人素材 F 为 64.36s，口播在 64.2s 结束）
export const Root: React.FC = () => (
  <Composition id="Film" component={Film as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920} fps={FPS} durationInFrames={1930} defaultProps={{ draft: false }} />
);
