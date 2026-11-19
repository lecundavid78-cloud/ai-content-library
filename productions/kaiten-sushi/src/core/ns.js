/* 全局命名空间。所有模块挂在 KS 下，使用普通 <script> 加载，file:// 直接打开也能运行。 */
(function (g) {
  'use strict';
  g.KS = g.KS || {};
  var KS = g.KS;
  KS.version = '0.1.0';
  KS.LEVELS = KS.LEVELS || [];
  /** 关卡注册：src/levels/*.js 调用 */
  KS.registerLevel = function (cfg) {
    KS.LEVELS.push(cfg);
    KS.LEVELS.sort(function (a, b) { return a.id - b.id; });
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
