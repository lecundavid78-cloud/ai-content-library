import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/800.css';
import '@fontsource/noto-sans-sc/900.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/inter-tight/900.css';
import React from 'react';
import { Composition } from 'remotion';
import { FPS, FRAMES } from './data';
import { Film } from './Film';

// V2 成片 1703 帧 = 56.77s（素材 G 剪掉 0.12s 口误后：口播 56.78s，画面 56.76s）
export const Root: React.FC = () => (
  <Composition id="Film" component={Film as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920} fps={FPS} durationInFrames={FRAMES} defaultProps={{ draft: false }} />
);
