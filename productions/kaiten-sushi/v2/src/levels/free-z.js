/*
 * 自由选图「Z 字折返」：上排向右 → 斜线折回左下 → 下排向右，单一路径。
 * 两个锐角拐弯用较大圆角，避免相邻车道的盘子互相遮挡。
 */
KS.registerFreeMap({
  key: 'free-z',
  order: 2,
  name: 'Z 字折返',
  shape: 'Z 字',
  difficulty: 3,
  seed: 505,
  track: {
    type: 'polyline',
    points: [[-80, 58], [318, 58], [72, 302], [470, 302]],
    radius: 56
  },
  beltWidth: 70,
  wall: 14,
  spacing: 76,
  speed: 48,
  time: 63,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6, ebi: 6 },
  decor: []
});
