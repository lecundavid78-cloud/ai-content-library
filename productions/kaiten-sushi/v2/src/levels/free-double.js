/*
 * 自由选图「双层折返」：上层是竖向梳齿折返（3 列上下往返），下层是横向回头弯，
 * 两层由同一条轨道连起来——是一条连续跑道，不是两条独立传送带。
 */
KS.registerFreeMap({
  key: 'free-double',
  order: 3,
  name: '双层折返',
  shape: '双层',
  difficulty: 4,
  seed: 606,
  track: {
    type: 'polyline',
    points: [[-80, 44], [76, 44], [76, 152], [156, 152], [156, 44], [236, 44], [236, 152], [316, 152], [316, 232], [52, 232], [52, 312], [470, 312]],
    radius: 40
  },
  beltWidth: 56,
  wall: 12,
  spacing: 64,
  speed: 46,
  time: 87,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6, ebi: 3, ikura: 3, inari: 3, hotate: 3 },
  decor: []
});
