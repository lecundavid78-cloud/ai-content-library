/*
 * 开始画面 / 选关。顶部有一条装饰用的环形小传送带，寿司持续循环。
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

  function MenuScene(app) {
    this.app = app;
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
    this.woodTop = L.H - 330;
    Art.paper(ctx, 0, 0, L.W, this.woodTop);
    Art.wood(ctx, 0, this.woodTop, L.W, L.H - this.woodTop);
    // 装饰环形传送带
    var top = L.top + 150, avail = this.woodTop - 12 - top;
    var lh = KS.clamp(avail - 70, 110, 170), cy = top + avail / 2;
    this.loop = KS.Path.roundedLoop(L.W / 2, cy, 284, lh, 58);
    Art.belt(ctx, this.loop, 56, 11, L.W, L.H, res);
    // 中间的小牌子
    ctx.save();
    Art.roundRect(ctx, L.W / 2 - 92, cy - 22, 184, 44, 10);
    ctx.fillStyle = '#b97b48'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
    Art.roundRect(ctx, L.W / 2 - 86, cy - 16, 172, 32, 6);
    ctx.fillStyle = '#fbf0da'; ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    Art.text(ctx, '本店今日营业中', L.W / 2, cy + 1, 15, '#8a3b2a');
    this.loopTypes = ['salmon', 'tuna', 'tamago', 'maki', 'ebi', 'ikura', 'salmon', 'tamago', 'tuna', 'maki', 'ebi', 'salmon'];
  };

  P.update = function (dt) { this.time += dt; };

  P.cards = function () {
    var L = this.L, self = this;
    var y0 = this.woodTop + 22;
    return KS.LEVELS.map(function (lv, i) {
      return { id: 'lv' + i, x: 30, y: y0 + i * 88, w: L.W - 60, h: 76, level: lv, index: i, action: function () { self.app.startLevel(i); } };
    });
  };

  P.render = function (ctx) {
    var L = this.L, self = this;
    ctx.drawImage(this.staticLayer, 0, 0, L.W, L.H);
    // 环形带上的寿司
    var n = this.loopTypes.length, gap = this.loop.length / n, tmp = {};
    var items = [];
    for (var i = 0; i < n; i++) {
      var s = (this.time * 34 + i * gap) % this.loop.length;
      this.loop.at(s, tmp);
      items.push({ x: tmp.x, y: tmp.y, t: this.loopTypes[i] });
    }
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) {
      Art.drawSprite(ctx, Art.plateSprite(it.t), it.x, it.y - 22 * 0.47, 0.47);
      Art.drawSprite(ctx, Art.sushiSprite(it.t), it.x, it.y - 22 * 0.4 - 19 * 0.4 + 3 * 0.4, 0.4);
    });
    // 标题
    var tb = Ease.outBack(KS.clamp(this.time / 0.5, 0, 1));
    ctx.save();
    ctx.translate(L.W / 2, L.top + 70); ctx.scale(tb, tb); ctx.rotate(Math.sin(this.time * 1.5) * 0.015);
    Art.banner(ctx, 0, 0, '回转寿司', 230, 72);
    ctx.restore();
    Art.text(ctx, '把同款寿司放进同一个托盘，凑齐三个就消除', L.W / 2, L.top + 126, 13, '#8a6446');

    // 选关卡片
    this.buttons = [];
    var best = this.app.bestStars();
    this.cards().forEach(function (c, i) {
      var appear = Ease.outBack(KS.clamp((self.time - 0.15 - i * 0.08) / 0.4, 0, 1));
      self.buttons.push(c);
      var pressed = self.pressed === c.id;
      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + (pressed ? 3 : 0));
      ctx.scale(appear * (pressed ? 0.98 : 1), appear * (pressed ? 0.98 : 1));
      var x = -c.w / 2, y = -c.h / 2;
      Art.roundRect(ctx, x + 3, y + 5, c.w, c.h, 18); ctx.fillStyle = 'rgba(100,50,20,0.3)'; ctx.fill();
      Art.roundRect(ctx, x, y, c.w, c.h, 18);
      var g = ctx.createLinearGradient(0, y, 0, y + c.h);
      g.addColorStop(0, '#fff8ea'); g.addColorStop(1, '#f2e0bf');
      ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
      // 关卡号
      ctx.beginPath(); ctx.arc(x + 36, 0, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#c74a3f'; ctx.fill(); ctx.lineWidth = 2.4; ctx.stroke();
      Art.text(ctx, String(c.level.id), x + 36, 1, 22, '#fff6e6', '#7a2a22');
      Art.text(ctx, c.level.name, x + 70, -16, 17, '#4a3122', null, 'left');
      var total = 0; Object.keys(c.level.sushi).forEach(function (t) { total += c.level.sushi[t]; });
      Art.text(ctx, total + ' 个 · ' + c.level.time + ' 秒', x + 70, 5, 12, '#8a6446', null, 'left');
      // 种类小图
      Object.keys(c.level.sushi).forEach(function (t, j) {
        Art.drawSprite(ctx, Art.sushiSprite(t), x + 80 + j * 25, 26 - 22 * 0.22, 0.22);
      });
      // 轨道形状缩略
      self.drawTrackThumb(ctx, c.level, x + c.w - 70, -24, 54, 44);
      Art.text(ctx, c.level.shape, x + c.w - 43, 28, 10, '#a07a58');
      // 星级（最佳成绩）
      var bs = best[c.level.id] || 0;
      for (var k = 0; k < 3; k++) Art.star(ctx, x + 185 + k * 18, -16, 7.5, k < bs);
      ctx.restore();
    });
    Art.text(ctx, '点击寿司自动放入托盘 · 拖动可放到指定位置', L.W / 2, L.H - 26 - Math.max(0, (this.app.safeBottom || 0) / L.scale), 12, '#fff3dc', '#7a4a26', 'center', 3);
  };

  P.drawTrackThumb = function (ctx, lv, x, y, w, h) {
    var TS = KS.TRACK_SPACE;
    var p = KS.Path.fromTrack(lv.track, { x: 0, y: 0, w: TS.w, h: TS.h });
    var sx = w / TS.w, sy = h / TS.h;
    ctx.save();
    Art.roundRect(ctx, x - 4, y - 2, w + 8, h + 4, 8); ctx.fillStyle = 'rgba(200,170,130,0.25)'; ctx.fill();
    ctx.beginPath(); ctx.rect(x - 4, y - 2, w + 8, h + 4); ctx.clip();
    ctx.translate(x, y); ctx.scale(sx, sy);
    Art.strokePath(ctx, p);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4b4430'; ctx.lineWidth = (lv.beltWidth + lv.wall * 2) * 0.55 + 10; ctx.stroke();
    ctx.strokeStyle = '#8f9461'; ctx.lineWidth = (lv.beltWidth + lv.wall * 2) * 0.55; ctx.stroke();
    ctx.strokeStyle = '#c7a07a'; ctx.lineWidth = lv.beltWidth * 0.45; ctx.stroke();
    ctx.restore();
  };

  P.hit = function (x, y) {
    for (var i = 0; i < this.buttons.length; i++) {
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
