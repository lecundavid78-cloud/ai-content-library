/*
 * 第 2 关：U 形轨道，寿司种类和数量增加。
 * 折线三个点 + 圆角半径 = 一个 180° 回转；竖直边长度 = 2×半径时正好是半圆。
 */
KS.registerLevel({
  id: 2,
  name: 'U 形回转',
  shape: 'U 形',
  track: {
    type: 'polyline',
    points: [[-80, 92], [338, 92], [338, 268], [-80, 268]],
    radius: 88
  },
  beltWidth: 72,
  wall: 14,
  spacing: 82,
  speed: 46,
  time: 85,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6 },
  decor: [
    { kind: 'menu', x: 150, y: 180, w: 236, h: 70 }
  ]
});
