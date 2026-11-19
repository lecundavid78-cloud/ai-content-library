/*
 * 菜单（V2）：
 *   home  首页：标题 + 装饰用环形小传送带 + 两个入口「经典闯关」「自由选图」
 *   main  经典闯关列表：主线 3 关
 *   free  自由选图列表：3 张独立跑道，默认全部可玩（不以通关主线为前提，不显示锁）
 * 列表卡片上的轨道缩略图直接用关卡配置的 track 生成，与实际玩法形状一致。
 */
(function (KS) {
  'use strict';
  var Art = KS.Art, Ease = KS.Ease, INK = Art.INK;

  var Menu = KS.Menu = {};

  Menu.drawButton = function (ctx, b, label, primary, pressed) {
    ctx.save();
    var dy = pressed ? 3 : 0;
    Art.roundRect(ctx, b.x, b.y + 4, b.w, b.h, b.h / 2);
    ctx.fillStyle = primary ? '#8e3229' : '#b48b62'; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    Art.roundRect(ctx, b.x, b.y + dy, b.w, b.h, b.h / 2);
    var g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    if (primary) { g.addColorStop(0, '#e2685a'); g.addColorStop(1, '#c74a3f'); }
    else { g.addColorStop(0, '#fff8ea'); g.addColorStop(1, '#f1dfbe'); }
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    Art.roundRect(ctx, b.x + 12, b.y + dy + 5, b.w - 24, 6, 3); ctx.fill();
    Art.text(ctx, label, b.x + b.w / 2, b.y + b.h / 2 + dy + 1, 17, primary ? '#fff6e6' : '#5b3a26', primary ? '#7a2a22' : null, 'center', 4);
    ctx.restore();
  };

  /** 轨道缩略图：与游戏内同一套 Path.fromTrack，形状与实际一致 */
  Menu.drawTrackThumb = function (ctx, lv, x, y, w, h) {
    var TS = KS.TRACK_SPACE;
    var p = KS.Path.fromTrack(lv.track, { x: 0, y: 0, w: TS.w, h: TS.h });
    var k = Math.min(w / TS.w, h / TS.h);
    var ox = x + (w - TS.w * k) / 2, oy = y + (h - TS.h * k) / 2;
    ctx.save();
    Art.roundRect(ctx, x - 4, y - 3, w + 8, h + 6, 10); ctx.fillStyle = 'rgba(205,175,135,0.28)'; ctx.fill();
    ctx.beginPath(); ctx.rect(x - 4, y - 3, w + 8, h + 6); ctx.clip();
    ctx.translate(ox, oy); ctx.scale(k, k);
    Art.strokePath(ctx, p);
    ctx.lineJoin = 'round';
    var outer = lv.beltWidth + lv.wall * 2;
    ctx.strokeStyle = '#4b4430'; ctx.lineWidth = outer + 8; ctx.stroke();
    ctx.strokeStyle = '#8f9461'; ctx.lineWidth = outer; ctx.stroke();
    ctx.strokeStyle = '#c7a07a'; ctx.lineWidth = lv.beltWidth; ctx.stroke();
    // 出口端点（画面内时）画个小红点，入口标绿点
    var a = p.at(30, {}), b = p.at(p.length - 30, {});
    var inside = function (q) { return q.x > 0 && q.x < TS.w && q.y > 0 && q.y < TS.h; };
    if (inside(b)) { ctx.fillStyle = '#c74a3f'; ctx.beginPath(); ctx.arc(b.x, b.y, 16, 0, Math.PI * 2); ctx.fill(); }
    if (inside(a)) { ctx.fillStyle = '#7aa84a'; ctx.beginPath(); ctx.arc(a.x, a.y, 16, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };

  function typesOf(cfg) {
    return Object.keys(cfg.sushi).sort(function (a, b) { return KS.SUSHI_ORDER.indexOf(a) - KS.SUSHI_ORDER.indexOf(b); });
  }
  function totalOf(cfg) { var t = 0; Object.keys(cfg.sushi).forEach(function (k) { t += cfg.sushi[k]; }); return t; }

  function MenuScene(app, view) {
    this.app = app;
    this.view = view === 'main' || view === 'free' ? view : 'home';
    this.time = 0;
    this.buttons = [];
    this.relayout();
  }
  var P = MenuScene.prototype;

  P.relayout = function () {
    var L = this.L = this.app.layout;
    var res = L.scale * this.app.pixelRatio;
    Art.setResolution(0.75 * 1.35 * res);
    var c = this.staticLayer = Art.makeCanvas(L.W * res, L.H * res);
    var ctx = c.getContext('2d'); ctx.scale(res, res);
    if (this.view === 'home') {
      this.woodTop = L.H - 300;
      Art.paper(ctx, 0, 0, L.W, this.woodTop);
      Art.wood(ctx, 0, this.woodTop, L.W, L.H - this.woodTop);
      var top = L.top + 150, avail = this.woodTop - 12 - top;
      var lh = KS.clamp(avail - 60, 100, 170), cy = top + avail / 2;
      this.loop = KS.Path.roundedLoop(L.W / 2, cy, 284, lh, 56);
      Art.belt(ctx, this.loop, 54, 11, L.W, L.H, res);
      ctx.save();
      Art.roundRect(ctx, L.W / 2 - 92, cy - 22, 184, 44, 10);
      ctx.fillStyle = '#b97b48'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
      Art.roundRect(ctx, L.W / 2 - 86, cy - 16, 172, 32, 6);
      ctx.fillStyle = '#fbf0da'; ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
      ctx.restore();
      Art.text(ctx, '本店今日营业中', L.W / 2, cy + 1, 15, '#8a3b2a');
      this.loopTypes = ['salmon', 'tuna', 'tamago', 'maki', 'inari', 'ebi', 'ikura', 'hotate', 'salmon', 'tamago', 'tuna', 'maki'];
    } else {
      this.woodTop = L.H - 54;
      Art.paper(ctx, 0, 0, L.W, this.woodTop);
      Art.wood(ctx, 0, this.woodTop, L.W, L.H - this.woodTop);
    }
  };

  P.update = function (dt) { this.time += dt; };

  // ---------- 首页 ----------
  P.homeEntries = function () {
    var L = this.L, self = this, y0 = this.woodTop + 26, h = 104;
    return [
      { id: 'enter-main', x: 26, y: y0, w: L.W - 52, h: h, action: function () { self.app.showMenu('main'); } },
      { id: 'enter-free', x: 26, y: y0 + h + 16, w: L.W - 52, h: h, action: function () { self.app.showMenu('free'); } }
    ];
  };

  P.drawCardBase = function (ctx, c, appear, pressed) {
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + (pressed ? 3 : 0));
    var s = appear * (pressed ? 0.98 : 1);
    ctx.scale(s, s);
    var x = -c.w / 2, y = -c.h / 2;
    Art.roundRect(ctx, x + 3, y + 5, c.w, c.h, 18); ctx.fillStyle = 'rgba(100,50,20,0.3)'; ctx.fill();
    Art.roundRect(ctx, x, y, c.w, c.h, 18);
    var g = ctx.createLinearGradient(0, y, 0, y + c.h);
    g.addColorStop(0, '#fff8ea'); g.addColorStop(1, '#f2e0bf');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    return { x: x, y: y };
  };

  P.renderHome = function (ctx) {
    var L = this.L, self = this;
    var n = this.loopTypes.length, gap = this.loop.length / n, tmp = {};
    var items = [];
    for (var i = 0; i < n; i++) {
      var s = (this.time * 34 + i * gap) % this.loop.length;
      this.loop.at(s, tmp);
      items.push({ x: tmp.x, y: tmp.y, t: this.loopTypes[i] });
    }
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) {
      Art.drawSprite(ctx, Art.plateSprite(it.t), it.x, it.y - 22 * 0.45, 0.45);
      Art.drawSprite(ctx, Art.sushiSprite(it.t), it.x, it.y - 22 * 0.38 - 19 * 0.38 + 3 * 0.38, 0.38);
    });
    var tb = Ease.outBack(KS.clamp(this.time / 0.5, 0, 1));
    ctx.save();
    ctx.translate(L.W / 2, L.top + 70); ctx.scale(tb, tb); ctx.rotate(Math.sin(this.time * 1.5) * 0.015);
    Art.banner(ctx, 0, 0, '回转寿司', 230, 72);
    ctx.restore();
    Art.text(ctx, '把同款寿司放进同一个托盘，凑齐三个就消除', L.W / 2, L.top + 126, 13, '#8a6446');

    var stars = KS.Progress.stars;
    var mainStars = 0, mainDone = 0, freeDone = 0;
    KS.LEVELS.forEach(function (lv) { mainStars += stars[lv.key] || 0; if (stars[lv.key]) mainDone++; });
    KS.FREE_MAPS.forEach(function (mp) { if (stars[mp.key]) freeDone++; });
    this.homeEntries().forEach(function (c, i) {
      self.buttons.push(c);
      var appear = Ease.outBack(KS.clamp((self.time - 0.15 - i * 0.1) / 0.4, 0, 1));
      ctx.save();
      var o = self.drawCardBase(ctx, c, appear, self.pressed === c.id);
      var x = o.x, y = o.y;
      if (i === 0) {
        ctx.beginPath(); ctx.arc(x + 48, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#c74a3f'; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
        Art.text(ctx, '闯', x + 48, 1, 28, '#fff6e6', '#7a2a22');
        Art.text(ctx, '经典闯关', x + 92, -22, 22, '#4a3122', null, 'left');
        Art.text(ctx, '主线 3 关：直线 → S 型 → 终极回转', x + 92, 4, 12.5, '#8a6446', null, 'left');
        for (var k = 0; k < 9; k++) Art.star(ctx, x + 98 + k * 15, 28, 6.5, k < mainStars);
        Art.text(ctx, mainDone + '/3', x + 98 + 9 * 15 + 8, 28, 12, '#a07a58', null, 'left');
      } else {
        ctx.beginPath(); ctx.arc(x + 48, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#7aa84a'; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
        Art.text(ctx, '选', x + 48, 1, 28, '#fff6e6', '#3f5f22');
        Art.text(ctx, '自由选图', x + 92, -22, 22, '#4a3122', null, 'left');
        Art.text(ctx, '3 张跑道随时可玩，不用先通关', x + 92, 4, 12.5, '#8a6446', null, 'left');
        KS.FREE_MAPS.forEach(function (mp, j) { Menu.drawTrackThumb(ctx, mp, x + 96 + j * 52, 18, 40, 30); });
        Art.text(ctx, '已通关 ' + freeDone + '/3', x + c.w - 16, 34, 11, '#a07a58', null, 'right');
      }
      // 右侧箭头
      ctx.strokeStyle = '#b48b62'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x + c.w - 30, -12); ctx.lineTo(x + c.w - 20, -2); ctx.lineTo(x + c.w - 30, 8); ctx.stroke();
      ctx.restore();
    });
    var note = KS.Progress.available === false ? '当前客户端版本较低，成绩暂时无法保存' : '点击寿司自动放入托盘 · 拖动可放到指定位置';
    Art.text(ctx, note, L.W / 2, L.H - 22 - Math.max(0, (this.app.safeBottom || 0) / L.scale), 12, '#fff3dc', '#7a4a26', 'center', 3);
    this.drawSoundButton(ctx);
  };

  P.drawSoundButton = function (ctx) {
    var L = this.L;
    var b = { id: 'sound', x: L.btnSound.x, y: L.btnSound.y, w: L.btnSound.w, h: L.btnSound.h, action: function () { KS.Sfx.toggle(); } };
    this.buttons.push(b);
    Art.button(ctx, b, 'sound', this.pressed === 'sound', KS.Sfx.muted);
  };

  // ---------- 列表页 ----------
  P.listMaps = function () { return this.view === 'main' ? KS.LEVELS : KS.FREE_MAPS; };

  P.cards = function () {
    var L = this.L, self = this;
    var y0 = L.top + 122;
    var avail = this.woodTop - 10 - y0;
    var gap = 14, h = KS.clamp((avail - gap * 2) / 3, 112, 150);
    return this.listMaps().map(function (cfg, i) {
      return { id: 'map-' + cfg.key, x: 22, y: y0 + i * (h + gap), w: L.W - 44, h: h, cfg: cfg, index: i, action: function () { self.app.startGame(cfg); } };
    });
  };

  P.renderList = function (ctx) {
    var L = this.L, self = this;
    var back = { id: 'back', x: L.btnRestart.x, y: L.btnRestart.y, w: L.btnRestart.w, h: L.btnRestart.h, action: function () { self.app.showMenu('home'); } };
    this.buttons.push(back);
    Art.button(ctx, back, 'back', this.pressed === 'back');
    this.drawSoundButton(ctx);
    var isMain = this.view === 'main';
    Art.banner(ctx, L.W / 2, L.top + 33, isMain ? '经典闯关' : '自由选图', 160, 48, isMain ? '#c74a3f' : '#6f9a45');
    Art.text(ctx, isMain ? '主线三关，难度一路升级；第 3 关很难，但一定有解' : '不用通关也能玩 · 每张图都是固定局面，可以反复研究',
      L.W / 2, L.top + 84, 12.5, '#8a6446');
    var best = KS.Progress.stars, times = KS.Progress.times;
    this.cards().forEach(function (c, i) {
      self.buttons.push(c);
      var appear = Ease.outBack(KS.clamp((self.time - 0.05 - i * 0.08) / 0.35, 0, 1));
      ctx.save();
      var o = self.drawCardBase(ctx, c, appear, self.pressed === c.id);
      var x = o.x, y = o.y, cfg = c.cfg;
      // 徽章：主线显示关卡号，自由图显示形状字
      ctx.beginPath(); ctx.arc(x + 32, y + 32, 20, 0, Math.PI * 2);
      ctx.fillStyle = isMain ? '#c74a3f' : '#6f9a45'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
      Art.text(ctx, isMain ? String(cfg.id) : cfg.shape.charAt(0), x + 32, y + 33, isMain ? 21 : 17, '#fff6e6', isMain ? '#7a2a22' : '#3f5f22');
      Art.text(ctx, cfg.name, x + 62, y + 26, 17, '#4a3122', null, 'left');
      Art.text(ctx, cfg.shape + ' · ' + totalOf(cfg) + ' 个 · ' + cfg.time + ' 秒', x + 62, y + 50, 12, '#8a6446', null, 'left');
      // 寿司种类与数量（多于 4 种时分两行）
      var types = typesOf(cfg), perRow = types.length > 4 ? Math.ceil(types.length / 2) : 4;
      types.forEach(function (tp, j) {
        var row = Math.floor(j / perRow), col = j % perRow;
        var ix = x + 30 + col * 44, iy = y + 80 + row * 25;
        Art.drawSprite(ctx, Art.sushiSprite(tp), ix, iy - 22 * 0.2 - 3, 0.2);
        Art.text(ctx, '×' + cfg.sushi[tp], ix + 13, iy - 2, 10.5, '#6b4a33', null, 'left');
      });
      // 难度（实心圆点，避免和成绩星级混淆）
      Art.text(ctx, '难度', x + 18, y + c.h - 17, 11.5, '#a07a58', null, 'left');
      for (var d = 0; d < 4; d++) {
        ctx.beginPath(); ctx.arc(x + 52 + d * 13, y + c.h - 17, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = d < cfg.difficulty ? '#d0603f' : '#e6d4b6'; ctx.fill();
        ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
      }
      // 缩略图 + 最佳成绩
      var tw = 92, th = Math.min(72, c.h - 44);
      Menu.drawTrackThumb(ctx, cfg, x + c.w - tw - 14, y + 12, tw, th);
      var bs = best[cfg.key] || 0;
      for (var k = 0; k < 3; k++) Art.star(ctx, x + c.w - 14 - tw / 2 + (k - 1) * 17, y + c.h - 24, 7, k < bs);
      Art.text(ctx, bs ? '最佳 ' + (times[cfg.key] ? times[cfg.key].toFixed(1) + ' 秒' : '') : '未通关', x + c.w - 14 - tw / 2, y + c.h - 9, 10.5, '#a07a58');
      ctx.restore();
    });
    var tip = isMain ? '卡在第 3 关？去「自由选图」换条跑道练练手' : '默认全部开放，不需要看广告或先通关';
    Art.text(ctx, tip, L.W / 2, this.woodTop + 26 - 6, 12, '#fff3dc', '#7a4a26', 'center', 3);
  };

  P.render = function (ctx) {
    var L = this.L;
    ctx.drawImage(this.staticLayer, 0, 0, L.W, L.H);
    this.buttons = [];
    if (this.view === 'home') this.renderHome(ctx); else this.renderList(ctx);
  };

  P.hit = function (x, y) {
    for (var i = this.buttons.length - 1; i >= 0; i--) {
      var b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  };
  P.onDown = function (x, y) { var b = this.hit(x, y); this.pressed = b ? b.id : null; };
  P.onMove = function () {};
  P.onUp = function (x, y) {
    var b = this.hit(x, y);
    if (b && b.id === this.pressed) { KS.Sfx.play('click'); b.action(); }
    this.pressed = null;
  };
  P.onCancel = function () { this.pressed = null; };
  P.onKey = function () {};

  KS.MenuScene = MenuScene;
})(globalThis.KS);
