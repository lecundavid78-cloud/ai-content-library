/*
 * 第 3 关：S 形轨道（三排往返），更多种类、更快速度。
 * 行距(104) 等于 带宽+两侧围挡(74+2×15)，相邻两排共用一道围挡，接近设定图效果。
 */
KS.registerLevel({
  id: 3,
  name: 'S 形蛇行',
  shape: 'S 形',
  track: {
    type: 'polyline',
    points: [[-80, 76], [338, 76], [338, 180], [52, 180], [52, 284], [470, 284]],
    radius: 52
  },
  beltWidth: 74,
  wall: 15,
  spacing: 78,
  speed: 54,
  time: 105,
  sushi: { salmon: 9, tuna: 6, tamago: 6, maki: 6, ebi: 6, ikura: 3 },
  decor: []
});
