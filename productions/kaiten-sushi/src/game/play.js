/*
 * 关卡进行场景：把纯逻辑模型(KS.Model)可视化，并处理触摸/鼠标操作。
 * 视觉层只“读取”模型状态并做插值动画，所有规则判断都在模型里，
 * 因此动画再花哨也不会造成寿司复制或丢失。
 */
(function (KS) {
  'use strict';
  var Art = KS.Art, Ease = KS.Ease, INK = Art.INK;
  var TAP_SLOP = 10;          // 移动小于此距离视为“点一下”
  var HOLD_LIFT_Y = 30;       // 拖动时寿司显示在手指上方，避免被手指挡住
  var PRAISE = ['好吃！', '真棒！', '完美！', '鲜美！', '漂亮！'];

  function PlayScene(app, levelIndex, seed) {
    this.app = app;
    this.levelIndex = levelIndex;
    this.level = KS.LEVELS[levelIndex];
    this.seed = seed;
    this.fx = new KS.Fx();
    this.time = 0;
    this.readyT = 0;
    this.result = null;       // {win, stars, t}
    this.buttons = [];
    this.pointer = null;
    this.lastClear = -9; this.combo = 0;
    this.lastTick = -1;
    this.hintDone = this.levelIndex !== 0;
    this.trayFx = [0, 1, 2].map(function () { return { shake: 0, bounce: 0, flash: 0 }; });
    this.ghosts = [];
    this.layoutDone = false;
    this.relayout();
    this.model = new KS.Model(this.level, this.path, { seed: seed, pickRange: this.pickRange });
    this.views = this.model.sushi.map(function () { return { x: 0, y: 0, k: 0, key: null, fl: null, land: 9, shake: 0, lift: 0, rot: 0, vx: 0, vy: 0, show: false }; });
  }

  var P = PlayScene.prototype;

  /** 布局变化（旋转/窗口缩放）时重建路径与静态层。逻辑状态用弧长保存，不受影响。 */
  P.relayout = function () {
    var app = this.app, L = this.L = app.layout;
    var path = KS.Path.fromTrack(this.level.track, L.conveyor);
    if (this.model) {
      // 屏幕尺寸改变：按比例换算弧长（路径形状相同，只是缩放）
      var ratio = path.length / this.path.length;
      this.model.path = path; this.model.L = path.length;
      this.model.speed *= ratio; this.model.spacing *= ratio;
      this.model.sushi.forEach(function (s) { if (s.s >= 0) s.s *= ratio; });
      this.pickRange = path.visibleRange({ x: 0, y: 0, w: L.W, h: L.H }, 22);
      this.model.pickRange = this.pickRange;
    }
    this.path = path;
    var k = path.scale;
    this.beltW = this.level.beltWidth * k;
    this.wallW = this.level.wall * k;
    this.plateK = this.beltW * 0.43 / 50;
    this.sushiK = this.plateK * 0.84;
    this.trayK = 0.6;
    this.bufPlateK = 0.5;
    this.bufK = 0.44;
    this.pickRange = path.visibleRange({ x: 0, y: 0, w: L.W, h: L.H }, 22);
    this.screenRange = path.visibleRange({ x: 0, y: 0, w: L.W, h: L.H }, 0);
    this.buildStatic();
  };

  P.buildStatic = function () {
    var app = this.app, L = this.L, dpr = app.pixelRatio;
    var res = L.scale * dpr;
    Art.setResolution(Math.max(this.plateK, this.trayK) * 1.35 * res);
    var c = this.staticLayer = Art.makeCanvas(L.W * res, L.H * res);
    var ctx = c.getContext('2d');
    ctx.scale(res, res);
    Art.paper(ctx, 0, 0, L.W, L.woodTop);
    Art.wood(ctx, 0, L.woodTop, L.W, L.H - L.woodTop);
    Art.belt(ctx, this.path, this.beltW, this.wallW, L.W, L.H, res);
    Art.beltArrows(ctx, this.path, this.beltW, this.wallW, { w: L.W, y: L.conveyor.y, h: L.conveyor.h });
    this.drawDecorStatic(ctx);
    Art.bufferPanel(ctx, L.buffer, L.bufferSlots);
    for (var i = 0; i < 5; i++) Art.slot(ctx, L.bufferSlots[i].cx, L.bufferSlots[i].cy + 2, 25, 16);
    Art.label(ctx, L.bufferLabel.x, L.bufferLabel.y, '暂存区');
    // 出入口门帘
    var g = this.gateLayer = Art.makeCanvas(L.W * res, L.H * res);
    var gctx = g.getContext('2d'); gctx.scale(res, res);
    var span = this.beltW + this.wallW * 2 + 8, tmp = {};
    if (this.screenRange) {
      var ends = [[this.screenRange.start + 11, '入口'], [this.screenRange.end - 11, '出口']];
      var self = this;
      ends.forEach(function (e) {
        self.path.at(e[0], tmp);
        if (tmp.x > 30 && tmp.x < L.W - 30) return; // 端点不在屏幕边缘时不画
        Art.gate(gctx, tmp.x, tmp.y, Math.atan2(tmp.ty, tmp.tx), span, e[1]);
      });
    }
    this.trays = [0, 1, 2].map(function (i) { return Art.traySprite(i, L.TRAY_W || KS.Layout.TRAY_W, KS.Layout.TRAY_H, res); });
  };

  P.drawDecorStatic = function (ctx) {
    var m = KS.Path.mapping(this.L.conveyor);
    var self = this;
    this.decor = (this.level.decor || []).map(function (d) {
      var p = m.map([d.x, d.y]);
      var o = { kind: d.kind, x: p[0], y: p[1], w: (d.w || 0) * m.scale, h: (d.h || 0) * m.scale, text: d.text };
      if (d.kind === 'menu') {
        var x = o.x - o.w / 2, y = o.y - o.h / 2;
        ctx.save();
        Art.roundRect(ctx, x + 2, y + 4, o.w, o.h, 10); ctx.fillStyle = 'rgba(110,60,25,0.25)'; ctx.fill();
        Art.roundRect(ctx, x, y, o.w, o.h, 10);
        ctx.fillStyle = '#b97b48'; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
        Art.roundRect(ctx, x + 6, y + 6, o.w - 12, o.h - 12, 6);
        ctx.fillStyle = '#fbf0da'; ctx.fill(); ctx.lineWidth = 1.6; ctx.stroke();
        // 挂绳
        ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(x + 18, y + 3, 3, 0, Math.PI * 2); ctx.arc(x + o.w - 18, y + 3, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        Art.text(ctx, '今日菜单', o.x, y + 17, 12, '#8a3b2a');
      } else if (d.kind === 'tip') {
        var lines = (d.text || '').split('\n');
        lines.forEach(function (ln, i) {
          Art.text(ctx, ln, o.x, o.y + (i - (lines.length - 1) / 2) * 22, 13.5, '#7a5236');
        });
        ctx.save();
        ctx.strokeStyle = 'rgba(200,90,60,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        var hw = 132 * m.scale, hh = lines.length * 11 + 6;
        ctx.beginPath();
        ctx.moveTo(o.x - hw + 8, o.y - hh); ctx.lineTo(o.x - hw, o.y - hh); ctx.lineTo(o.x - hw, o.y - hh + 8);
        ctx.moveTo(o.x + hw - 8, o.y + hh); ctx.lineTo(o.x + hw, o.y + hh); ctx.lineTo(o.x + hw, o.y + hh - 8);
        ctx.stroke(); ctx.restore();
      }
      return o;
    });
    void self;
  };

  // ---------------- 位置计算 ----------------

  P.anchorOf = function (sh, out) {
    var L = this.L;
    out.plate = 0;
    switch (sh.loc) {
      case 'belt':
        this.path.at(sh.s, out); out.k = this.sushiK; out.plate = this.plateK; out.show = true; return out;
      case 'tray': {
        var sl = L.trays[sh.tray].slots[sh.slot];
        out.x = sl.x; out.y = sl.y + 4; out.k = this.trayK; out.show = true; return out;
      }
      case 'buffer': {
        var b = L.bufferSlots[sh.slot];
        out.x = b.cx; out.y = b.cy; out.k = this.bufK; out.plate = this.bufPlateK; out.show = true; return out;
      }
      case 'held':
        if (this.pointer) { out.x = this.pointer.x; out.y = this.pointer.y - HOLD_LIFT_Y; }
        out.k = this.sushiK * 1.22; out.plate = 0; out.show = true; return out;
      default:
        out.show = false; return out;
    }
  };

  // ---------------- 更新 ----------------

  P.update = function (dt) {
    this.time += dt;
    var m = this.model;
    if (m.status === 'ready') {
      this.readyT += dt;
      if (this.readyT >= 1.25) { m.start(); KS.Sfx.play('go'); }
    }
    if (!this.app.paused) m.update(dt);
    this.handleEvents(m.drainEvents());
    // 倒计时提示音
    if (m.status === 'playing' && m.timeLeft <= 10) {
      var sec = Math.ceil(m.timeLeft);
      if (sec !== this.lastTick) { this.lastTick = sec; KS.Sfx.play('tick'); }
    }
    this.updateViews(dt);
    this.fx.update(dt);
    for (var i = 0; i < 3; i++) {
      var tf = this.trayFx[i];
      tf.shake = Math.max(0, tf.shake - dt); tf.bounce = Math.max(0, tf.bounce - dt); tf.flash = Math.max(0, tf.flash - dt);
    }
    for (var g = this.ghosts.length - 1; g >= 0; g--) {
      var gh = this.ghosts[g];
      gh.life += dt;
      if (gh.s != null) gh.s += m.isActive() ? m.speed * m.speedMul * dt : 0;
      if (gh.life > 0.35) this.ghosts.splice(g, 1);
    }
    if (this.result) this.result.t += dt;
  };

  P.updateViews = function (dt) {
    var m = this.model, tmp = this._tmp || (this._tmp = {});
    for (var i = 0; i < m.sushi.length; i++) {
      var sh = m.sushi[i], v = this.views[i];
      var key = sh.loc + ':' + sh.tray + ':' + sh.slot;
      this.anchorOf(sh, tmp);
      if (v.key !== key) {
        var prev = v.key ? v.key.split(':')[0] : null;
        if (prev === null || sh.loc === 'kitchen' || sh.loc === 'cleared' || (prev === 'kitchen' && sh.loc === 'belt')) {
          v.fl = null;
          if (sh.loc === 'kitchen' && prev === 'held') this.fx.puff(v.x, v.y);
        } else if (sh.loc === 'held') {
          v.fl = null; v.lift = 0;
          if (prev === 'belt') v.heldFromBelt = true;
          if (prev === 'buffer') this.ghosts.push({ x: v.x, y: v.y, k: this.bufPlateK, life: 0 });
        } else {
          // 从当前位置飞向新目标
          var dist = Math.hypot(tmp.x - v.x, tmp.y - v.y);
          v.fl = { x: v.x, y: v.y, k: v.k, t: 0, dur: KS.clamp(0.16 + dist / 1400, 0.2, 0.42), h: 26 + dist * 0.18, dir: tmp.x > v.x ? 1 : -1, plateFrom: v.plateNow || 0 };
          if (prev === 'belt' && sh.loc !== 'held') {
            // 直接点走：空盘留在传送带上淡出
            var st = this.lastBeltS[i];
            if (st != null) this.ghosts.push({ s: st, k: this.plateK, life: 0 });
          }
          if (prev === 'held' && v.heldFromBelt && sh.loc !== 'belt') {
            if (this.lastBeltS[i] != null && this.lastBeltS[i] >= 0) this.ghosts.push({ s: this.lastBeltS[i], k: this.plateK, life: 0 });
          }
          if (prev === 'buffer' && sh.loc !== 'held') this.ghosts.push({ x: v.x, y: v.y, k: this.bufPlateK, life: 0 });
          if (sh.loc !== 'held') v.heldFromBelt = false;
        }
        v.key = key;
        if (prev === null || (prev === 'kitchen' && sh.loc === 'belt')) { v.x = tmp.x; v.y = tmp.y; v.k = tmp.k; }
      }
      this.lastBeltS = this.lastBeltS || [];
      this.lastBeltS[i] = sh.s >= 0 ? sh.s : this.lastBeltS[i];
      if (sh.loc === 'kitchen') this.lastBeltS[i] = null;
      v.show = tmp.show;
      v.shake = Math.max(0, v.shake - dt);
      if (!tmp.show) continue;
      if (sh.loc === 'held') {
        // 弹簧跟随手指 + 根据速度倾斜
        v.lift = Math.min(1, v.lift + dt * 7);
        var kx = 1 - Math.pow(0.0005, dt);
        var nx = v.x + (tmp.x - v.x) * kx, ny = v.y + (tmp.y - v.y) * kx;
        v.vx = (nx - v.x) / Math.max(dt, 1e-3); v.vy = (ny - v.y) / Math.max(dt, 1e-3);
        v.x = nx; v.y = ny;
        v.rot += (KS.clamp(v.vx * 0.0009, -0.35, 0.35) - v.rot) * Math.min(1, dt * 12);
        v.k += (tmp.k - v.k) * Math.min(1, dt * 14);
        v.plateNow = 0;
        continue;
      }
      v.rot *= Math.pow(0.001, dt);
      v.lift = Math.max(0, v.lift - dt * 5);
      if (v.fl) {
        var f = v.fl;
        f.t += dt;
        var p = Math.min(1, f.t / f.dur), e = Ease.inOutQuad(p);
        var cx = (f.x + tmp.x) / 2, cy = Math.min(f.y, tmp.y) - f.h;
        var a = 1 - e;
        v.x = a * a * f.x + 2 * a * e * cx + e * e * tmp.x;
        v.y = a * a * f.y + 2 * a * e * cy + e * e * tmp.y;
        v.k = KS.lerp(f.k, tmp.k, e) * (1 + 0.16 * Math.sin(Math.PI * p));
        v.flRot = Math.sin(Math.PI * p) * 0.22 * f.dir;
        v.plateNow = tmp.plate ? KS.lerp(f.plateFrom, tmp.plate, e) : 0;
        if (p >= 1) {
          v.fl = null; v.land = 0; v.flRot = 0;
          if (sh.loc === 'tray') { this.fx.puff(tmp.x, tmp.y + 10); KS.Sfx.play('place'); }
          else if (sh.loc === 'buffer') { this.fx.puff(tmp.x, tmp.y + 10); KS.Sfx.play('buffer'); }
        }
      } else {
        v.x = tmp.x; v.y = tmp.y; v.k = tmp.k; v.plateNow = tmp.plate;
      }
      v.land += dt;
    }
  };

  P.handleEvents = function (evs) {
    var m = this.model, L = this.L, self = this;
    evs.forEach(function (e) {
      if (e.type === 'reject') {
        KS.Sfx.play('reject');
        self.views[e.id].shake = 0.35;
        var sh = m.sushi[e.id], name = KS.SUSHI_TYPES[sh.type].name;
        if (e.tray != null) {
          var tr = L.trays[e.tray], mt = m.trays[e.tray];
          self.trayFx[e.tray].shake = 0.4; self.trayFx[e.tray].flash = 0.4;
          var msg = e.reason === 'tray-type' ? '这个托盘只放「' + KS.SUSHI_TYPES[mt.type].name + '」' : e.reason === 'tray-clearing' ? '正在消除，稍等一下' : '托盘满了';
          self.fx.toast(tr.cx, tr.y - 14, msg);
        } else if (e.reason === 'buffer-full') {
          self.fx.toast(L.W / 2, L.buffer.y - 30, '暂存区满了');
        } else if (e.reason === 'all-full') {
          self.fx.toast(L.W / 2, L.trays[0].y - 18, '没有托盘能放「' + name + '」，暂存区也满了');
        } else if (e.reason === 'no-tray') {
          self.fx.toast(L.W / 2, L.buffer.y - 30, '没有可放「' + name + '」的托盘');
        }
      } else if (e.type === 'pick') {
        KS.Sfx.play('pick');
      } else if (e.type === 'place') {
        self.hintDone = true;
      } else if (e.type === 'cleared') {
        var t = L.trays[e.tray];
        var info = KS.SUSHI_TYPES[e.sushiType];
        self.fx.burst(t.cx, t.cy - 6, info.colors.concat(['#f6b3bf', '#9dbb6c']), true);
        if (self.time - self.lastClear < 3) self.combo++; else self.combo = 0;
        self.lastClear = self.time;
        self.fx.text(t.cx, t.cy - 30, self.combo > 0 ? '连击 ×' + (self.combo + 1) : PRAISE[(m.matches - 1) % PRAISE.length], '#fff6e6', self.combo > 0 ? 24 : 22);
        self.fx.text(t.cx + 92, t.cy - 10, '+3', '#ffd25a', 18);
        self.trayFx[e.tray].bounce = 0.45;
        KS.Sfx.play('match', self.combo);
        if (navigator.vibrate) { try { navigator.vibrate(25); } catch (er) { /* ignore */ } }
      } else if (e.type === 'win') {
        var stars = m.timeLeft / m.timeLimit >= 0.4 ? 3 : m.timeLeft / m.timeLimit >= 0.18 ? 2 : 1;
        self.result = { win: true, stars: stars, t: -0.5 };
        self.app.saveBest(self.level.id, stars);
        setTimeout(function () { KS.Sfx.play('win'); }, 350);
        for (var i = 0; i < 4; i++) self.fx.burst(60 + i * 90, L.conveyor.y + 80 + (i % 2) * 60, ['#f58a4b', '#ffcf4a', '#9dbb6c', '#f6b3bf', '#d8394a'], true);
      } else if (e.type === 'lose') {
        self.result = { win: false, stars: 0, t: 0 };
        self.pointer = null;
        KS.Sfx.play('lose');
      }
    });
  };

  // ---------------- 输入 ----------------

  P.hitButton = function (x, y) {
    for (var i = this.buttons.length - 1; i >= 0; i--) {
      var b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  };

  function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  P.findSushiAt = function (x, y) {
    var m = this.model, L = this.L;
    // 暂存区
    for (var b = 0; b < 5; b++) {
      var id = m.buffer[b];
      if (id !== null && inRect(x, y, L.bufferSlots[b])) return id;
    }
    // 传送带：取最近的可拿取寿司（热区比盘子略大）
    var best = -1, bd = Infinity, tmp = {};
    var R = this.plateK * 50 * 1.18;
    for (var i = 0; i < m.belt.length; i++) {
      var sid = m.belt[i];
      if (!m.isPickableOnBelt(sid)) continue;
      this.path.at(m.sushi[sid].s, tmp);
      var dx = x - tmp.x, dy = (y - (tmp.y - 6)) * 1.15;
      var d = dx * dx + dy * dy;
      if (d < R * R && d < bd) { bd = d; best = sid; }
    }
    return best;
  };

  P.onDown = function (x, y) {
    var btn = this.hitButton(x, y);
    if (btn) { this.pressed = btn.id; return; }
    var m = this.model;
    if (m.status !== 'playing' || this.app.paused) return;
    var id = this.findSushiAt(x, y);
    if (id < 0) return;
    this.pointer = { x: x, y: y, sx: x, sy: y, id: id, moved: false, t0: this.time };
    if (m.pick(id)) {
      var v = this.views[id];
      this.fx.sparkle(v.x, v.y - 20, 4);
      this.app.debugLog && this.app.debugLog('pick #' + id);
    } else this.pointer = null;
  };

  P.onMove = function (x, y) {
    if (!this.pointer) return;
    this.pointer.x = x; this.pointer.y = y;
    if (Math.hypot(x - this.pointer.sx, y - this.pointer.sy) > TAP_SLOP) this.pointer.moved = true;
  };

  /** 拖放目标：按寿司显示位置判断（显示在手指上方） */
  P.dropTarget = function () {
    var p = this.pointer, L = this.L;
    if (!p) return null;
    var x = p.x, y = p.y - HOLD_LIFT_Y * 0.6;
    for (var t = 0; t < 3; t++) if (inRect(x, y, L.trays[t].hit)) return { kind: 'tray', index: t };
    if (inRect(x, y, L.bufferHit) || inRect(p.x, p.y, L.bufferHit)) {
      var best = 0, bd = Infinity;
      for (var b = 0; b < 5; b++) { var d = Math.abs(L.bufferSlots[b].cx - x); if (d < bd) { bd = d; best = b; } }
      return { kind: 'buffer', index: best };
    }
    return null;
  };

  P.onUp = function (x, y) {
    var btn = this.hitButton(x, y);
    if (this.pressed) {
      if (btn && btn.id === this.pressed) { KS.Sfx.play('click'); btn.action(); }
      this.pressed = null;
      return;
    }
    var p = this.pointer, m = this.model;
    if (!p) return;
    p.x = x; p.y = y;
    if (m.held) {
      if (!p.moved) m.autoPlaceHeld();
      else m.drop(this.dropTarget());
    }
    this.pointer = null;
  };

  P.onCancel = function () {
    if (this.model.held) this.model.cancelHeld();
    this.pointer = null; this.pressed = null;
  };

  P.onKey = function (k) {
    if (k === 'r' || k === 'R') this.app.startLevel(this.levelIndex);
  };

  // ---------------- 绘制 ----------------

  P.drawSushi = function (ctx, type, x, y, k, sx, sy, rot, alpha) {
    Art.drawSprite(ctx, Art.sushiSprite(type), x, y - 22 * k + 3 * k, k, sx, sy, rot, alpha);
  };

  P.drawPlate = function (ctx, type, x, y, k, alpha) {
    Art.drawSprite(ctx, type ? Art.plateSprite(type) : Art.plainPlateSprite(), x, y - 22 * k, k, 1, 1, 0, alpha);
  };

  P.render = function (ctx) {
    var L = this.L, m = this.model, self = this;
    ctx.drawImage(this.staticLayer, 0, 0, L.W, L.H);
    // 菜单牌动态数字
    this.drawDecorDynamic(ctx);
    // 履带纹
    Art.beltSlats(ctx, this.path, this.beltW, m.beltOffset, 15 * this.path.scale, this.screenRange);

    // ---- 传送带上的盘子与寿司（按 y 排序，下方的遮挡上方的）----
    var items = [], tmp = {};
    for (var i = 0; i < m.belt.length; i++) {
      var sh = m.sushi[m.belt[i]];
      if (this.screenRange && (sh.s < this.screenRange.start - 60 || sh.s > this.screenRange.end + 60)) continue;
      this.path.at(sh.s, tmp);
      items.push({ y: tmp.y, x: tmp.x, sh: sh, held: sh.loc === 'held' });
    }
    this.ghosts.forEach(function (g) {
      if (g.s == null) return;
      self.path.at(g.s, tmp);
      items.push({ y: tmp.y, x: tmp.x, ghost: g });
    });
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) {
      if (it.ghost) {
        var gf = it.ghost.life / 0.35;
        self.drawPlate(ctx, null, it.x, it.y, it.ghost.k * (1 - gf * 0.3), 1 - gf);
        return;
      }
      var v = self.views[it.sh.id];
      self.drawPlate(ctx, it.sh.type, it.x, it.y, self.plateK, it.held ? 0.9 : 1);
      if (it.held || v.fl) return;
      var sk = v.shake > 0 ? Math.sin(v.shake * 60) * 3 * (v.shake / 0.35) : 0;
      var sq = v.land < 0.5 ? Ease.wobble(v.land, 30, 9) * 0.16 : 0;
      self.drawSushi(ctx, it.sh.type, it.x + sk, it.y, self.plateK * 0.84, 1 + sq, 1 - sq);
    });
    ctx.drawImage(this.gateLayer, 0, 0, L.W, L.H);
    this.drawRefill(ctx);

    // ---- 托盘 ----
    var drag = this.pointer && m.held && this.pointer.moved ? this.dropTarget() : null;
    var heldType = m.held ? m.sushi[m.held.id].type : null;
    for (var t = 0; t < 3; t++) this.drawTray(ctx, t, drag, heldType);

    // ---- 暂存区 ----
    if (drag && drag.kind === 'buffer') {
      var full = m.freeBufferSlot() < 0;
      ctx.save();
      Art.roundRect(ctx, L.buffer.x - 3, L.buffer.y - 3, L.buffer.w + 6, L.buffer.h + 6, 20);
      ctx.lineWidth = 4; ctx.strokeStyle = full ? 'rgba(220,80,60,0.8)' : 'rgba(120,190,90,0.9)'; ctx.stroke();
      ctx.restore();
    }
    this.ghosts.forEach(function (g) {
      if (g.s != null) return;
      var gf = g.life / 0.35;
      self.drawPlate(ctx, null, g.x, g.y, g.k, 1 - gf);
    });
    for (var b = 0; b < 5; b++) {
      var bid = m.buffer[b];
      if (bid === null) continue;
      var bv = this.views[bid];
      if (bv.fl) continue;
      var bs = m.sushi[bid];
      var bsk = bv.shake > 0 ? Math.sin(bv.shake * 60) * 3 : 0;
      var bsq = bv.land < 0.5 ? Ease.wobble(bv.land, 30, 9) * 0.18 : 0;
      this.drawPlate(ctx, bs.type, bv.x + bsk, bv.y, this.bufPlateK);
      this.drawSushi(ctx, bs.type, bv.x + bsk, bv.y, this.bufK, 1 + bsq, 1 - bsq);
    }

    // ---- 飞行中的寿司（最上层）----
    for (var f = 0; f < m.sushi.length; f++) {
      var fv = this.views[f];
      if (!fv.fl || !fv.show) continue;
      var fs = m.sushi[f];
      ctx.save();
      ctx.fillStyle = 'rgba(80,45,20,0.18)';
      Art.ellipse(ctx, fv.x, fv.y + 14, 22 * fv.k / 0.6, 6 * fv.k / 0.6); ctx.fill();
      ctx.restore();
      if (fv.plateNow > 0.01) this.drawPlate(ctx, fs.type, fv.x, fv.y, fv.plateNow);
      this.drawSushi(ctx, fs.type, fv.x, fv.y, fv.k, 1, 1, fv.flRot || 0);
    }

    // ---- 手里的寿司 ----
    if (m.held) {
      var hv = this.views[m.held.id], hs = m.sushi[m.held.id];
      var lift = Ease.outBack(Math.min(1, hv.lift));
      ctx.save();
      ctx.fillStyle = 'rgba(70,40,20,' + (0.25 - lift * 0.08).toFixed(3) + ')';
      Art.ellipse(ctx, hv.x + 4, hv.y + 18 + lift * 14, 26 * (1 - lift * 0.15), 8 * (1 - lift * 0.15)); ctx.fill();
      ctx.restore();
      var st = 1 + Math.min(0.12, Math.abs(hv.vy) * 0.00012);
      var hk = hv.k * (0.85 + 0.15 * lift);
      this.drawSushi(ctx, hs.type, hv.x, hv.y - lift * 6, hk, 1 / Math.sqrt(st), st, hv.rot);
    }

    this.fx.draw(ctx);
    this.drawHint(ctx);
    this.drawHUD(ctx);
    this.drawOverlay(ctx);
  };

  /** 补货加速提示：在入口旁显示“加速上菜” */
  P.drawRefill = function (ctx) {
    var m = this.model;
    var a = KS.clamp((m.speedMul - 1.12) / 0.25, 0, 1);
    this.refillA = (this.refillA || 0) + (a - (this.refillA || 0)) * 0.15;
    if (this.refillA < 0.02 || !this.screenRange) return;
    var tmp = this.path.at(this.screenRange.start + 70, {});
    var nx = -tmp.ty, ny = tmp.tx;
    if (ny > 0) { nx = -nx; ny = -ny; }
    var d = this.beltW / 2 + this.wallW + 4;
    var x = KS.clamp(tmp.x + nx * d + 28, 60, this.L.W - 60), y = Math.max(this.L.conveyor.y + 12, tmp.y + ny * d - 4);
    ctx.save();
    ctx.globalAlpha = this.refillA;
    var bob = Math.sin(this.time * 8) * 1.5;
    ctx.font = Art.font(12);
    var w = ctx.measureText('加速上菜').width + 34;
    Art.roundRect(ctx, x - w / 2, y - 12 + bob, w, 22, 11);
    ctx.fillStyle = '#c74a3f'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    // 小箭头
    ctx.strokeStyle = '#fff3dc'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var i = 0; i < 2; i++) {
      var ax = x - w / 2 + 10 + i * 5 + ((this.time * 12) % 4);
      ctx.beginPath(); ctx.moveTo(ax, y - 5 + bob); ctx.lineTo(ax + 4, y - 1 + bob); ctx.lineTo(ax, y + 3 + bob); ctx.stroke();
    }
    Art.text(ctx, '加速上菜', x + 7, y - 1 + bob, 12, '#fff6e6');
    ctx.restore();
  };

  P.drawDecorDynamic = function (ctx) {
    var m = this.model;
    var self = this;
    (this.decor || []).forEach(function (d) {
      if (d.kind !== 'menu') return;
      var types = Object.keys(self.level.sushi);
      var n = types.length, iw = (d.w - 24) / n;
      types.forEach(function (tp, i) {
        var cx = d.x - d.w / 2 + 12 + iw * (i + 0.5), cy = d.y + d.h * 0.12;
        var left = 0;
        m.sushi.forEach(function (s) { if (s.type === tp && s.loc !== 'cleared') left++; });
        var k = Math.min(0.3, d.h / 240) * 1.05;
        self.drawSushi(ctx, tp, cx - 10, cy + 4, k * 0.95, 1, 1, 0, left ? 1 : 0.35);
        Art.text(ctx, left ? '×' + left : '✓', cx + 17, cy + 3, 12, left ? '#5b3a26' : '#5f9a3a');
      });
    });
  };

  P.drawTray = function (ctx, t, drag, heldType) {
    var L = this.L, m = this.model, tr = L.trays[t], mt = m.trays[t], fx = this.trayFx[t];
    var spr = this.trays[t];
    var sx = fx.shake > 0 ? Math.sin(fx.shake * 55) * 6 * (fx.shake / 0.4) : 0;
    var bounce = fx.bounce > 0 ? 1 + Ease.wobble(0.45 - fx.bounce, 22, 7) * 0.06 : 1;
    ctx.save();
    ctx.translate(tr.cx + sx, tr.cy);
    ctx.scale(bounce, 2 - bounce);
    ctx.drawImage(spr.canvas, -spr.ox, -spr.oy, spr.w, spr.h);
    ctx.restore();
    // 拖动高亮
    var over = drag && drag.kind === 'tray' && drag.index === t;
    if (over || fx.flash > 0) {
      var okDrop = over && m.trayAccepts(t, heldType) === 'ok';
      ctx.save();
      Art.roundRect(ctx, tr.x - 5 + sx, tr.y - 5, tr.w + 10, tr.h + 10, 20);
      ctx.lineWidth = 4;
      ctx.strokeStyle = fx.flash > 0 ? 'rgba(220,70,50,' + (fx.flash / 0.4).toFixed(2) + ')' : okDrop ? 'rgba(110,185,80,0.95)' : 'rgba(220,80,60,0.85)';
      ctx.stroke();
      ctx.restore();
    }
    // 空位：虚线椭圆；托盘已锁定种类时在空位显示淡淡的种类剪影
    for (var s = 0; s < 3; s++) {
      if (mt.slots[s] !== null) continue;
      var sl = tr.slots[s];
      Art.slot(ctx, sl.x + sx, sl.y + 4, 27, 15);
      if (mt.type) this.drawSushi(ctx, mt.type, sl.x + sx, sl.y + 4, this.trayK * 0.85, 1, 1, 0, 0.2);
    }
    // 托盘中的寿司（含消除动画）
    var ids = mt.slots;
    for (var j = 0; j < 3; j++) {
      var id = ids[j];
      if (id === null) continue;
      var v = this.views[id];
      if (v.fl) continue;
      var x = v.x + sx, y = v.y, k = v.k, sqx = 1, sqy = 1, alpha = 1;
      if (v.land < 0.5) { var w = Ease.wobble(v.land, 30, 9) * 0.2; sqx = 1 + w; sqy = 1 - w; }
      if (mt.clearing) {
        var ct = mt.clearT;
        // 依次跳起 → 向中间聚拢 → 收缩（爆裂在模型 cleared 事件时触发）
        var hop = KS.clamp((ct - 0.22 - j * 0.05) / 0.2, 0, 1);
        y -= Math.sin(hop * Math.PI) * 16;
        var gather = KS.clamp((ct - 0.38) / 0.24, 0, 1), ge = Ease.inBack(gather);
        x = KS.lerp(x, tr.cx, ge);
        y = KS.lerp(y, tr.cy - 8, ge);
        k *= 1 + 0.12 * Math.sin(hop * Math.PI) - 0.35 * ge;
        alpha = 1 - gather * 0.3;
        if (gather > 0) { sqx = 1 + 0.15 * gather; sqy = 1 - 0.1 * gather; }
      }
      var ssh = v.shake > 0 ? Math.sin(v.shake * 60) * 3 : 0;
      ctx.save();
      ctx.fillStyle = 'rgba(110,70,30,0.14)';
      Art.ellipse(ctx, x + ssh, y + 15, 24 * k / 0.6, 5 * k / 0.6); ctx.fill();
      ctx.restore();
      this.drawSushi(ctx, m.sushi[id].type, x + ssh, y, k, sqx, sqy, 0, alpha);
    }
    if (mt.clearing && mt.clearT > 0.25) {
      // 聚拢时的光晕
      var gl = KS.clamp((mt.clearT - 0.25) / 0.37, 0, 1);
      ctx.save();
      var g = ctx.createRadialGradient(tr.cx, tr.cy - 6, 0, tr.cx, tr.cy - 6, 70);
      g.addColorStop(0, 'rgba(255,245,200,' + (0.7 * gl).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = g; ctx.fillRect(tr.cx - 80, tr.cy - 70, 160, 130);
      ctx.restore();
    }
  };

  P.drawHint = function (ctx) {
    var m = this.model;
    if (this.hintDone || m.status !== 'playing' || m.held) return;
    if (m.elapsed < 0.8) return;
    // 指向最靠近屏幕中部的可拿取寿司
    var best = -1, bd = Infinity, tmp = {};
    for (var i = 0; i < m.belt.length; i++) {
      var id = m.belt[i];
      if (!m.isPickableOnBelt(id)) continue;
      this.path.at(m.sushi[id].s, tmp);
      var d = Math.abs(tmp.x - this.L.W * 0.45);
      if (d < bd) { bd = d; best = id; }
    }
    if (best < 0) return;
    this.path.at(m.sushi[best].s, tmp);
    var ph = (this.time * 1.6) % 1;
    var press = ph > 0.45 && ph < 0.7;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = 'rgba(255,250,235,' + (1 - ph).toFixed(2) + ')'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(tmp.x, tmp.y - 6, 20 + ph * 22, 0, Math.PI * 2); ctx.stroke();
    Art.hand(ctx, tmp.x + 8, tmp.y + 4 - (press ? 0 : 6), 1.05, press);
    ctx.restore();
  };

  P.drawHUD = function (ctx) {
    var L = this.L, m = this.model, self = this;
    this.buttons = [];
    var bRestart = { id: 'restart', x: L.btnRestart.x, y: L.btnRestart.y, w: L.btnRestart.w, h: L.btnRestart.h, action: function () { self.app.startLevel(self.levelIndex); } };
    var bSound = { id: 'sound', x: L.btnSound.x, y: L.btnSound.y, w: L.btnSound.w, h: L.btnSound.h, action: function () { KS.Sfx.toggle(); } };
    this.buttons.push(bRestart, bSound);
    Art.button(ctx, bRestart, 'restart', this.pressed === 'restart');
    Art.button(ctx, bSound, 'sound', this.pressed === 'sound', KS.Sfx.muted);
    Art.banner(ctx, L.title.x, L.title.y, '第 ' + this.level.id + ' 关', 148, 46);
    // 时间
    var frac = m.timeLeft / m.timeLimit;
    var warn = m.timeLeft <= 10 && m.status === 'playing';
    var color = frac > 0.5 ? '#8fc25a' : frac > 0.25 ? '#f0b44a' : '#e0604a';
    var pulse = warn ? (Math.sin(this.time * 10) * 0.5 + 0.5) : 0;
    Art.pill(ctx, L.clockPill);
    Art.clockIcon(ctx, L.clockPill.x + 15, L.clockPill.y + L.clockPill.h / 2, 9, frac <= 0.25);
    var sec = Math.ceil(m.timeLeft);
    var ts = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
    var tsc = warn ? 1 + pulse * 0.12 : 1;
    ctx.save(); ctx.translate(L.clockPill.x + 47, L.clockPill.y + L.clockPill.h / 2 + 1); ctx.scale(tsc, tsc);
    Art.text(ctx, ts, 0, 0, 16, warn ? '#c8392b' : '#4a3122');
    ctx.restore();
    Art.bar(ctx, L.bar, frac, color, pulse);
    // 剩余寿司
    Art.pill(ctx, L.countPill);
    var c = m.counts();
    this.drawSushi(ctx, 'salmon', L.countPill.x + 17, L.countPill.y + L.countPill.h / 2 + 3, 0.22);
    Art.text(ctx, String(c.remaining), L.countPill.x + 46, L.countPill.y + L.countPill.h / 2 + 1, 16, '#4a3122');
  };

  P.drawOverlay = function (ctx) {
    var L = this.L, m = this.model, self = this;
    // 开场
    if (m.status === 'ready' || (m.elapsed < 0.6 && m.status === 'playing')) {
      var t = m.status === 'ready' ? this.readyT : 1.25 + m.elapsed;
      var a = t < 1.25 ? 1 : 1 - (t - 1.25) / 0.6;
      ctx.save();
      ctx.globalAlpha = KS.clamp(a, 0, 1);
      ctx.fillStyle = 'rgba(60,35,20,0.28)'; ctx.fillRect(0, L.conveyor.y, L.W, L.conveyor.h);
      var s = Ease.outBack(KS.clamp(t / 0.35, 0, 1));
      var cy = L.conveyor.y + L.conveyor.h / 2;
      ctx.translate(L.W / 2, cy); ctx.scale(s, s);
      if (t < 1.0) {
        Art.banner(ctx, 0, -14, '第 ' + this.level.id + ' 关 · ' + this.level.name, 250, 56);
        var types = Object.keys(this.level.sushi);
        Art.text(ctx, this.level.shape + '轨道 · ' + types.length + ' 种寿司 · 共 ' + m.total + ' 个 · ' + this.level.time + ' 秒', 0, 34, 14, '#fff6e6', '#5b3418', 'center', 4);
      } else {
        Art.banner(ctx, 0, 0, '开始！', 150, 60, '#7aa84a');
      }
      ctx.restore();
    }
    // 暂停
    if (this.app.paused && !this.result) {
      ctx.save();
      ctx.fillStyle = 'rgba(60,35,20,0.5)'; ctx.fillRect(0, 0, L.W, L.H);
      Art.banner(ctx, L.W / 2, L.H / 2 - 20, '已暂停', 150, 56);
      Art.text(ctx, '点击任意处继续', L.W / 2, L.H / 2 + 30, 15, '#fff6e6', '#5b3418');
      ctx.restore();
    }
    if (!this.result || this.result.t < 0) return;
    // 结算面板
    var r = this.result, tt = r.t;
    ctx.save();
    ctx.fillStyle = 'rgba(55,30,15,' + (0.5 * KS.clamp(tt / 0.3, 0, 1)).toFixed(3) + ')';
    ctx.fillRect(0, 0, L.W, L.H);
    var sc = Ease.outBack(KS.clamp(tt / 0.4, 0, 1));
    var pw = 310, ph = 350, px = L.W / 2, py = L.H / 2 - 10;
    ctx.translate(px, py); ctx.scale(sc, sc);
    Art.roundRect(ctx, -pw / 2 + 4, -ph / 2 + 6, pw, ph, 26); ctx.fillStyle = 'rgba(60,30,10,0.35)'; ctx.fill();
    Art.roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 26);
    var g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
    g.addColorStop(0, '#fff8ea'); g.addColorStop(1, '#f3e1c0');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    Art.roundRect(ctx, -pw / 2 + 8, -ph / 2 + 8, pw - 16, ph - 16, 20); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(190,150,110,0.7)'; ctx.stroke();
    Art.waves(ctx, -pw / 2 + 22, ph / 2 - 20, 8, 'rgba(120,150,120,0.6)');
    Art.waves(ctx, pw / 2 - 58, ph / 2 - 20, 8, 'rgba(120,150,120,0.6)');
    Art.banner(ctx, 0, -ph / 2 + 4, r.win ? '完成！' : '时间到！', 170, 52, r.win ? '#c74a3f' : '#6a7f9a');
    var c = m.counts();
    if (r.win) {
      for (var i = 0; i < 3; i++) {
        var st = KS.clamp((tt - 0.35 - i * 0.18) / 0.3, 0, 1);
        var ss = st > 0 ? Ease.outBack(st) : 0;
        var filled = i < r.stars;
        ctx.save(); ctx.translate((i - 1) * 66, -70 - (i === 1 ? 10 : 0)); ctx.scale(filled ? ss : 1, filled ? ss : 1);
        Art.star(ctx, 0, 0, i === 1 ? 30 : 25, filled, (i - 1) * 0.15);
        ctx.restore();
      }
      Art.text(ctx, '消除了全部 ' + m.total + ' 个寿司', 0, -14, 17, '#4a3122');
      Art.text(ctx, '用时 ' + m.elapsed.toFixed(1) + ' 秒 · 剩余 ' + Math.ceil(m.timeLeft) + ' 秒', 0, 14, 14, '#8a6446', null);
    } else {
      // 失败：展示剩余的寿司
      this.drawSushi(ctx, 'salmon', -40, -64, 0.62, 1, 1, -0.15);
      this.drawSushi(ctx, 'tamago', 30, -60, 0.62, 1, 1, 0.12);
      Art.text(ctx, '还剩 ' + c.remaining + ' 个寿司没消除', 0, -14, 17, '#4a3122');
      Art.text(ctx, '已消除 ' + c.cleared + ' / ' + m.total + '，再快一点就能成功！', 0, 14, 13.5, '#8a6446', null);
    }
    ctx.restore();
    // 按钮（按面板坐标转换为屏幕坐标，便于点击检测）
    var btns = [];
    var hasNext = r.win && this.levelIndex < KS.LEVELS.length - 1;
    var by = py + 54;
    if (r.win && hasNext) {
      btns.push({ label: '下一关', primary: true, action: function () { self.app.startLevel(self.levelIndex + 1); } });
      btns.push({ label: '再玩一次', action: function () { self.app.startLevel(self.levelIndex); } });
    } else if (r.win) {
      btns.push({ label: '再玩一次', primary: true, action: function () { self.app.startLevel(self.levelIndex); } });
    } else {
      btns.push({ label: '重新开始', primary: true, action: function () { self.app.startLevel(self.levelIndex); } });
    }
    btns.push({ label: '返回选关', action: function () { self.app.showMenu(); } });
    if (tt < 0.45) return;
    var bw = 220, bh = 44;
    btns.forEach(function (b, i) {
      b.id = 'r' + i; b.x = px - bw / 2; b.y = by + i * (bh + 10) - (btns.length > 2 ? 4 : 0); b.w = bw; b.h = bh;
      if (btns.length > 2) { b.h = 40; b.y = by - 16 + i * 46; }
      self.buttons.push(b);
      KS.Menu.drawButton(ctx, b, b.label, b.primary, self.pressed === b.id);
    });
  };

  KS.PlayScene = PlayScene;
})(globalThis.KS);
