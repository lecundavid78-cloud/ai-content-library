/* 全局命名空间。所有模块挂在 KS 下，使用普通 <script> 加载，file:// 直接打开也能运行。 */
/* Chrome 61 尚无 globalThis：先给旧 WebView 提供局部兼容入口。 */
if (typeof globalThis === 'undefined' && typeof window !== 'undefined') window.globalThis = window;
(function (g) {
  'use strict';
  g.KS = g.KS || {};
  var KS = g.KS;
  KS.version = '2.0.0';
  /** 主线三关（只放主线；按 id 1..3 排序，下标 = id-1） */
  KS.LEVELS = KS.LEVELS || [];
  /** 自由选图（独立列表，不并入主线，避免第三关后误进自由地图） */
  KS.FREE_MAPS = KS.FREE_MAPS || [];
  /** 主线关卡注册：src/levels/level*.js 调用 */
  KS.registerLevel = function (cfg) {
    cfg.mode = 'main';
    if (!cfg.key) cfg.key = 'main-' + cfg.id;
    KS.LEVELS.push(cfg);
    KS.LEVELS.sort(function (a, b) { return a.id - b.id; });
  };
  /** 自由地图注册：src/levels/free-*.js 调用；order 决定列表顺序 */
  KS.registerFreeMap = function (cfg) {
    cfg.mode = 'free';
    KS.FREE_MAPS.push(cfg);
    KS.FREE_MAPS.sort(function (a, b) { return a.order - b.order; });
  };
  /** 按 key（main-1 / free-u …）查找任意地图；无效 key 返回 null */
  KS.findMap = function (key) {
    var all = KS.LEVELS.concat(KS.FREE_MAPS);
    for (var i = 0; i < all.length; i++) if (all[i].key === key) return all[i];
    return null;
  };
  /** 可复现随机数（mulberry32） */
  KS.rng = function (seed) {
    var a = (seed >>> 0) || 1;
    var f = function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = function (n) { return Math.floor(f() * n); };
    f.range = function (lo, hi) { return lo + f() * (hi - lo); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.shuffle = function (arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(f() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    };
    return f;
  };
  KS.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  KS.lerp = function (a, b, t) { return a + (b - a) * t; };
})(typeof window !== 'undefined' ? window : globalThis);
