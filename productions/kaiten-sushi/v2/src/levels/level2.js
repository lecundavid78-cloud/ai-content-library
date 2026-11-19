/*
 * 主线第 2 关「S 型绕绕」：沿用 V1 第 3 关的 S 型三排折返轨道，24 个 / 4 种。
 * 行距 104 = 带宽 74 + 两侧围挡 2×15，相邻两排共用一道围挡。
 */
KS.registerLevel({
  id: 2,
  key: 'main-2',
  name: 'S 型绕绕',
  shape: 'S 型',
  difficulty: 2,
  seed: 202,
  track: {
    type: 'polyline',
    points: [[-80, 76], [338, 76], [338, 180], [52, 180], [52, 284], [470, 284]],
    radius: 52
  },
  beltWidth: 74,
  wall: 15,
  spacing: 78,
  speed: 50,
  time: 48,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6 },
  decor: []
});
