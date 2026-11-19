/*
 * 寿司种类目录。关卡里用 key 引用。
 * name   ：界面显示
 * plate  ：传送带瓷盘的边沿颜色（辅助辨识）
 * colors ：消除时粒子颜色
 * 画法在 src/art/sushi-art.js 中按 key 实现。
 */
(function (KS) {
  'use strict';
  KS.SUSHI_TYPES = {
    salmon: { name: '三文鱼', plate: '#f2b8a8', colors: ['#f58a4b', '#ffd2b0', '#fff6e8'] },
    tuna:   { name: '金枪鱼', plate: '#bcd39a', colors: ['#d8394a', '#f27b84', '#fff6e8'] },
    tamago: { name: '玉子烧', plate: '#f2d48a', colors: ['#f7cf55', '#3b4a35', '#fff6e8'] },
    maki:   { name: '黄瓜卷', plate: '#b9d5c8', colors: ['#8cc152', '#2f3a2c', '#fff6e8'] },
    ebi:    { name: '甜虾',   plate: '#f4c6cf', colors: ['#f6875f', '#ffe1d2', '#e2463a'] },
    ikura:  { name: '三文鱼籽', plate: '#d8c3e6', colors: ['#ff7a2f', '#ffb36b', '#2f3a2c'] },
    inari:  { name: '豆皮寿司', plate: '#d6b98f', colors: ['#c98636', '#f2c27a', '#fff6e8'] },
    hotate: { name: '扇贝',     plate: '#a9c9e6', colors: ['#fff4e2', '#f4cdb8', '#bfe0f2'] }
  };
  /** 固定的类型顺序：开局洗牌前先按此排序，保证不同内核下同一 seed 得到同一局面（不依赖对象键顺序） */
  KS.SUSHI_ORDER = ['salmon', 'tuna', 'tamago', 'maki', 'ebi', 'ikura', 'inari', 'hotate'];
})(globalThis.KS);
