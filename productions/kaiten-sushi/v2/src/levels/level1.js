/*
 * 主线第 1 关「开张啦」：超简单直线，9 个 / 2 种。
 * 坐标单位：轨道空间 390×360（运行时等比映射到屏幕上的传送带区域）。
 * 起点/终点在画面外，寿司从左侧厨房出来、右侧回厨房，再从入口循环出现。
 * seed 固定：每次开局/重试都是同一个局面（调试可用 ?seed= 覆盖）。
 * 参数由 tests/tune.js 校准，记录见 制作说明-v2.md。
 */
KS.registerLevel({
  id: 1,
  key: 'main-1',
  name: '开张啦',
  shape: '直线',
  difficulty: 1,
  seed: 101,
  track: { type: 'polyline', points: [[-80, 190], [470, 190]], radius: 0 },
  beltWidth: 80,
  wall: 15,
  spacing: 90,
  speed: 40,
  time: 50,
  sushi: { salmon: 6, tamago: 3 },
  decor: [{ kind: 'menu', x: 195, y: 62, w: 260, h: 84 }]
});
