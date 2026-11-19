/*
 * 自由选图「U 型回转」：复用 V1 第 2 关的 U 形轨道。不需要通关主线即可进入。
 */
KS.registerFreeMap({
  key: 'free-u',
  order: 1,
  name: 'U 型回转',
  shape: 'U 型',
  difficulty: 2,
  seed: 404,
  track: {
    type: 'polyline',
    points: [[-80, 92], [338, 92], [338, 268], [-80, 268]],
    radius: 88
  },
  beltWidth: 72,
  wall: 14,
  spacing: 82,
  speed: 46,
  time: 48,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6 },
  decor: [{ kind: 'menu', x: 150, y: 180, w: 236, h: 70 }]
});
