/*
 * 入口：画布适配、主循环、输入分发、场景切换、调试接口。
 * URL 参数：
 *   ?level=1..3        直接进入主线某关
 *   ?map=free-u|free-z|free-double   直接进入自由地图（无效值回到首页）
 *   ?seed=123          调试：覆盖地图的固定 seed（正常游玩不会出现）
 *   ?debug=1     显示开发者面板（数量守恒断言、帧率）
 *   ?manual=1    手动时钟（自动化录屏用，由 KSDebug.step 驱动）
 */
(function (KS) {
  'use strict';
  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === '1';
  var MANUAL = params.get('manual') === '1';

  var App = {
    canvas: null, ctx: null, layout: null, scene: null,
    pixelRatio: 1, paused: false, safeTop: 0, safeBottom: 0,
    hostTop: 0, hostBottom: 0, guard: false,
    debugSeed: params.get('seed') != null && isFinite(parseInt(params.get('seed'), 10)) ? parseInt(params.get('seed'), 10) : undefined,
    invariantErrors: 0, lastInvariant: [],
    perf: { frames: [], work: [] }
  };
  KS.App = App;

  App.init = function () {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.measureSafe();
    this.resize();
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('orientationchange', this.onResize.bind(this));
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && App.scene instanceof KS.PlayScene && App.scene.model.status === 'playing') {
        App.scene.onCancel(); App.paused = true;
      }
    });
    this.bindInput();
    this.bindBack();
    var lv = parseInt(params.get('level'), 10);
    var mapKey = params.get('map');
    var mapCfg = mapKey ? KS.findMap(mapKey) : null;
    if (lv >= 1 && lv <= KS.LEVELS.length) this.startLevel(lv - 1);
    else if (mapCfg) this.startGame(mapCfg);
    else this.showMenu('home');
    this.loadBestStars();
    this.refreshHostInsets();
    this.last = performance.now();
    if (!MANUAL) requestAnimationFrame(this.loop.bind(this));
    else this.frame(0);
    var boot = document.getElementById('boot');
    if (boot) boot.remove();
  };

  App.measureSafe = function () {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;padding-top:0;padding-bottom:0;padding-top:var(--safe-area-inset-top, env(safe-area-inset-top, 0px));padding-bottom:var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))';
    document.body.appendChild(d);
    var cs = getComputedStyle(d);
    this.safeTop = Math.max(parseFloat(cs.paddingTop) || 0, this.hostTop || 0);
    this.safeBottom = Math.max(parseFloat(cs.paddingBottom) || 0, this.hostBottom || 0);
    d.remove();
  };

  App.refreshHostInsets = function () {
    if (!KS.Platform) return;
    KS.Platform.windowInfo().then(function (info) {
      if (!info || !App.canvas) return;
      var safe = info.safeArea || {};
      var top = Math.max(0, Number(safe.top) || 0);
      var h = Number(info.windowHeight) || 0;
      var bottom = h && isFinite(Number(safe.bottom)) ? Math.max(0, h - Number(safe.bottom)) : 0;
      var buttons = info.menuButtons || {};
      ['back', 'me', 'share'].forEach(function (key) {
        var b = buttons[key];
        if (b && Number(b.top) < 120 && isFinite(Number(b.bottom))) {
          top = Math.max(top, Number(b.bottom) + 5);
        }
      });
      top = Math.min(96, top);
      bottom = Math.min(72, bottom);
      if (Math.abs(top - App.hostTop) < 2 && Math.abs(bottom - App.hostBottom) < 2) return;
      App.hostTop = top;
      App.hostBottom = bottom;
      App.measureSafe();
      App.resize();
      if (App.scene) App.scene.relayout();
    });
  };

  App.onResize = function () {
    clearTimeout(this._rt);
    var self = this;
    this._rt = setTimeout(function () {
      self.measureSafe(); self.resize(); if (self.scene) self.scene.relayout();
      self.refreshHostInsets();
    }, 60);
  };

  App.resize = function () {
    var vw = window.innerWidth, vh = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(vw * this.pixelRatio);
    this.canvas.height = Math.round(vh * this.pixelRatio);
    this.canvas.style.width = vw + 'px';
    this.canvas.style.height = vh + 'px';
    this.layout = KS.Layout.compute(vw, vh, this.safeTop, this.safeBottom);
  };

  /** 菜单：view = 'home' 首页 | 'main' 经典闯关列表 | 'free' 自由选图列表 */
  App.showMenu = function (view) {
    this.paused = false;
    this.scene = new KS.MenuScene(this, view || 'home');
    if (this.scene.view !== 'home') this.ensureGuard();
  };

  /** 统一开局入口：cfg 为主线关卡或自由地图配置；seed 仅调试覆盖 */
  App.startGame = function (cfg, seed) {
    if (!cfg) { this.showMenu('home'); return; }
    this.paused = false;
    if (seed === undefined) seed = this.debugSeed;
    this.scene = new KS.PlayScene(this, cfg, seed);
    this.ensureGuard();
    this.debugLog('开始 ' + cfg.key + ' seed=' + this.scene.model.seed);
  };

  /** 兼容 V1：按主线下标开局 */
  App.startLevel = function (index, seed) { this.startGame(KS.LEVELS[index], seed); };
  App.startMap = function (key, seed) { this.startGame(KS.findMap(key), seed); };

  // ---------- 返回键 / 系统返回手势 ----------
  // 不在首页时保留一条 history 记录；系统返回会触发 popstate，游戏内返回上一级而不是直接退出。
  App.ensureGuard = function () {
    if (this.guard || MANUAL || !window.history || typeof history.pushState !== 'function') return;
    try { history.pushState({ ks: 1 }, ''); this.guard = true; } catch (e) { /* ignore */ }
  };
  App.bindBack = function () {
    var self = this;
    window.addEventListener('popstate', function () { self.guard = false; self.back(); });
  };
  /** 返回上一级：对局 → 所属列表；列表 → 首页 */
  App.back = function () {
    var sc = this.scene;
    if (sc instanceof KS.PlayScene) { sc.onCancel(); this.showMenu(sc.cfg.mode); }
    else if (sc instanceof KS.MenuScene && sc.view !== 'home') this.showMenu('home');
  };

  App.allMapKeys = function () {
    return KS.LEVELS.concat(KS.FREE_MAPS).map(function (c) { return c.key; });
  };
  App.loadBestStars = function () {
    return KS.Progress.load(this.allMapKeys());
  };
  App.bestStars = function () { return KS.Progress.stars; };

  App.toLogical = function (cx, cy) {
    var r = this.canvas.getBoundingClientRect(), L = this.layout;
    return { x: (cx - r.left - L.offX) / L.scale, y: (cy - r.top - L.offY) / L.scale };
  };

  App.bindInput = function () {
    var self = this, c = this.canvas, active = null;
    function down(e) {
      KS.Sfx.unlock();
      if (active !== null) return;
      active = e.pointerId;
      try { c.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      e.preventDefault();
      if (self.paused) { self.paused = false; return; }
      var p = self.toLogical(e.clientX, e.clientY);
      self.scene.onDown(p.x, p.y);
    }
    function move(e) {
      if (e.pointerId !== active) return;
      e.preventDefault();
      var p = self.toLogical(e.clientX, e.clientY);
      self.scene.onMove(p.x, p.y);
    }
    function up(e) {
      if (e.pointerId !== active) return;
      active = null;
      e.preventDefault();
      var p = self.toLogical(e.clientX, e.clientY);
      self.scene.onUp(p.x, p.y);
    }
    function cancel(e) {
      if (e.pointerId !== active) return;
      active = null;
      self.scene.onCancel();
    }
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', cancel);
    c.addEventListener('lostpointercapture', cancel);
    c.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    window.addEventListener('keydown', function (e) {
      if (e.key >= '1' && e.key <= String(KS.LEVELS.length)) self.startLevel(parseInt(e.key, 10) - 1);
      else if (e.key === 'Escape') self.back();
      else if (e.key === 'm' || e.key === 'M') KS.Sfx.toggle();
      else self.scene.onKey(e.key);
    });
  };

  App.loop = function (now) {
    var dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.perf.frames.push(now - this.last);
    if (this.perf.frames.length > 240) this.perf.frames.shift();
    this.last = now;
    this.frame(dt);
    requestAnimationFrame(this.loop.bind(this));
  };

  App.frame = function (dt) {
    var t0 = performance.now();
    this.scene.update(dt);
    if (this.scene.model) {
      var errs = this.scene.model.checkInvariants();
      if (errs.length) {
        this.invariantErrors++;
        if (this.invariantErrors < 5) console.error('[不变量] ', errs);
        this.lastInvariant = errs;
      }
    }
    this.render();
    this.perf.work.push(performance.now() - t0);
    if (this.perf.work.length > 240) this.perf.work.shift();
  };

  App.render = function () {
    var ctx = this.ctx, L = this.layout, pr = this.pixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (L.offX > 0.5 || L.offY > 0.5) {
      ctx.fillStyle = '#d9b48a';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    ctx.setTransform(L.scale * pr, 0, 0, L.scale * pr, L.offX * pr, L.offY * pr);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, L.W, L.H); ctx.clip();
    this.scene.render(ctx);
    ctx.restore();
    if (DEBUG) this.drawDebug(ctx);
  };

  App.drawDebug = function (ctx) {
    var s = this.scene, L = this.layout;
    var lines = [];
    var fr = this.perf.frames, wk = this.perf.work;
    var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
    lines.push('FPS ' + (1000 / (avg(fr) || 16.7)).toFixed(0) + '  渲染 ' + avg(wk).toFixed(2) + 'ms');
    if (s.model) {
      var c = s.model.counts();
      lines.push('带' + c.belt + ' 厨' + c.kitchen + ' 手' + c.held + ' 盘' + c.tray + ' 暂' + c.buffer + ' 消' + c.cleared + ' = ' + (c.belt + c.kitchen + c.held + c.tray + c.buffer + c.cleared) + '/' + c.total);
      lines.push(this.invariantErrors ? '不变量错误 ' + this.invariantErrors + ': ' + this.lastInvariant[0] : '不变量 ✓  seed ' + s.model.seed);
    }
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(4, L.H - 16 - lines.length * 14, 300, lines.length * 14 + 8);
    ctx.font = '11px monospace'; ctx.fillStyle = this.invariantErrors ? '#ff8080' : '#b0ffb0';
    lines.forEach(function (ln, i) { ctx.fillText(ln, 10, L.H - 14 - (lines.length - 1 - i) * 14 + 2); });
    ctx.restore();
  };

  App.debugLog = function (msg) { if (DEBUG) console.log('[KS] ' + msg); };

  // ---------- 自动化测试接口 ----------
  window.KSDebug = {
    app: App,
    step: function (n, dt) { for (var i = 0; i < (n || 1); i++) App.frame(dt || 1 / 30); },
    model: function () { return App.scene.model; },
    scene: function () { return App.scene; },
    /** 寿司在页面上的 CSS 像素坐标（用于真实触摸点击） */
    screenPos: function (id) {
      var sc = App.scene, sh = sc.model.sushi[id], t = {};
      sc.anchorOf(sh, t);
      var L = App.layout, r = App.canvas.getBoundingClientRect();
      return { x: r.left + L.offX + t.x * L.scale, y: r.top + L.offY + (t.y - 6) * L.scale };
    },
    toScreen: function (x, y) {
      var L = App.layout, r = App.canvas.getBoundingClientRect();
      return { x: r.left + L.offX + x * L.scale, y: r.top + L.offY + y * L.scale };
    },
    layout: function () { return App.layout; },
    perf: function () {
      var f = App.perf.frames.slice().sort(function (a, b) { return a - b; }), w = App.perf.work.slice().sort(function (a, b) { return a - b; });
      var avg = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / (a.length || 1); };
      return { frameAvg: avg(f), frameP95: f[Math.floor(f.length * 0.95)] || 0, workAvg: avg(w), workP95: w[Math.floor(w.length * 0.95)] || 0, n: f.length };
    },
    resetPerf: function () { App.perf.frames = []; App.perf.work = []; },
    invariantErrors: function () { return App.invariantErrors; },
    start: function (i, seed) { App.startLevel(i, seed); },
    startMap: function (key, seed) { App.startMap(key, seed); },
    menu: function (view) { App.showMenu(view); },
    back: function () { App.back(); },
    progress: function () { return KS.Progress; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { App.init(); });
  else App.init();
})(globalThis.KS);
