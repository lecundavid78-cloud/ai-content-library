/*
 * 主线第 3 关「终极回转」：新的「回字」螺旋单一路径，42 个 / 7 种（含新寿司豆皮寿司）。
 * 寿司从左上入口进入，顺时针绕外圈一周后转入内圈，出口在画面中部的厨房门帘下。
 * 车道间距 86 = 带宽 60 + 两侧围挡 2×13，相邻车道共用围挡；整条仍是一条开放轨迹，
 * 出口的寿司进入厨房队列，再从入口重新出现（循环由 Model 完成）。
 */
KS.registerLevel({
  id: 3,
  key: 'main-3',
  name: '终极回转',
  shape: '回字螺旋',
  difficulty: 4,
  seed: 303,
  track: {
    type: 'polyline',
    points: [[-80, 46], [346, 46], [346, 314], [44, 314], [44, 132], [260, 132], [260, 228], [128, 228]],
    radius: 40
  },
  beltWidth: 60,
  wall: 13,
  spacing: 84,
  speed: 58,
  time: 97,
  sushi: { salmon: 6, tuna: 6, tamago: 6, maki: 6, ebi: 6, ikura: 6, inari: 6 },
  decor: []
});
