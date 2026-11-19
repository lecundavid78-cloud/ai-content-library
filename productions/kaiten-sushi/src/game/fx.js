/*
 * 特效：粒子、冲击环、飘字、提示气泡、缓动函数。
 */
(function (KS) {
  'use strict';
  var Art = KS.Art;

  var Ease = KS.Ease = {
    outBack: function (t) { var c = 1.70158 + 1; return 1 + c * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2); },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    inBack: function (t) { return 2.7 * t * t * t - 1.7 * t * t; },
    /** 弹簧回弹：返回衰减振荡（0 → 振动 → 0） */
    wobble: function (t, freq, decay) { return Math.exp(-t * (decay || 9)) * Math.sin(t * (freq || 28)); }
  };

  function Fx() { this.parts = []; this.texts = []; this.toasts = []; }

  Fx.prototype.clear = function () { this.parts.length = 0; this.texts.length = 0; this.toasts.length = 0; };

  /** 三消爆裂：彩纸 + 米粒 + 星星 + 冲击环 */
  Fx.prototype.burst = function (x, y, colors, big) {
    var n = big ? 34 : 24;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 220;
      var kind = i % 4 === 0 ? 'star' : i % 4 === 1 ? 'grain' : 'confetti';
      this.parts.push({
        kind: kind, x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14,
        size: kind === 'star' ? 5 + Math.random() * 4 : 3 + Math.random() * 3.5,
        color: kind === 'grain' ? '#fffaf0' : colors[i % colors.length],
        life: 0, max: 0.7 + Math.random() * 0.5, g: kind === 'star' ? 120 : 520
      });
    }
    this.parts.push({ kind: 'ring', x: x, y: y, life: 0, max: 0.45, size: 18, color: '#fff3d6' });
    this.parts.push({ kind: 'ring', x: x, y: y, life: -0.06, max: 0.5, size: 10, color: colors[0] });
    this.parts.push({ kind: 'flash', x: x, y: y, life: 0, max: 0.25, size: 60 });
  };

  /** 落地小烟尘 */
  Fx.prototype.puff = function (x, y) {
    for (var i = 0; i < 5; i++) {
      var a = Math.PI + (i / 4) * Math.PI;
      this.parts.push({ kind: 'puff', x: x + Math.cos(a) * 10, y: y, vx: Math.cos(a) * 40, vy: -10 - Math.random() * 15, life: 0, max: 0.35, size: 3 + Math.random() * 2.5, g: 0 });
    }
  };

  /** 拿起时的小星光 */
  Fx.prototype.sparkle = function (x, y, n) {
    for (var i = 0; i < (n || 4); i++) {
      var a = Math.random() * Math.PI * 2;
      this.parts.push({ kind: 'star', x: x, y: y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70 - 30, rot: 0, vr: 4, size: 3.5, color: '#fff2b8', life: 0, max: 0.4, g: 60 });
    }
  };

  Fx.prototype.text = function (x, y, str, color, size) {
    this.texts.push({ x: x, y: y, str: str, color: color || '#fff6e6', size: size || 22, life: 0, max: 1.0 });
  };

  Fx.prototype.toast = function (x, y, str) {
    // 同一时刻只保留一条，避免叠字
    this.toasts.length = 0;
    this.toasts.push({ x: x, y: y, str: str, life: 0, max: 1.5 });
  };

  Fx.prototype.update = function (dt) {
    var p = this.parts;
    for (var i = p.length - 1; i >= 0; i--) {
      var q = p[i];
      q.life += dt;
      if (q.life >= q.max) { p.splice(i, 1); continue; }
      if (q.vx !== undefined) {
        q.vx *= Math.pow(0.12, dt); q.vy += (q.g || 0) * dt; q.vy *= Math.pow(0.5, dt);
        q.x += q.vx * dt; q.y += q.vy * dt; q.rot = (q.rot || 0) + (q.vr || 0) * dt;
      }
    }
    for (var j = this.texts.length - 1; j >= 0; j--) { var t = this.texts[j]; t.life += dt; if (t.life >= t.max) this.texts.splice(j, 1); }
    for (var k = this.toasts.length - 1; k >= 0; k--) { var o = this.toasts[k]; o.life += dt; if (o.life >= o.max) this.toasts.splice(k, 1); }
  };

  Fx.prototype.draw = function (ctx) {
    var p = this.parts;
    for (var i = 0; i < p.length; i++) {
      var q = p[i];
      if (q.life < 0) continue;
      var f = q.life / q.max;
      ctx.save();
      if (q.kind === 'ring') {
        ctx.globalAlpha = 1 - f;
        ctx.strokeStyle = q.color; ctx.lineWidth = 6 * (1 - f) + 1;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.size + Ease.outCubic(f) * 70, 0, Math.PI * 2); ctx.stroke();
      } else if (q.kind === 'flash') {
        var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.size);
        g.addColorStop(0, 'rgba(255,250,230,' + (0.9 * (1 - f)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,250,230,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
      } else if (q.kind === 'puff') {
        ctx.globalAlpha = 0.7 * (1 - f);
        ctx.fillStyle = '#fff4e0';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1 + f), 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = f > 0.7 ? (1 - f) / 0.3 : 1;
        ctx.translate(q.x, q.y); ctx.rotate(q.rot);
        if (q.kind === 'star') {
          ctx.fillStyle = q.color; ctx.beginPath();
          for (var s = 0; s < 8; s++) { var a = s * Math.PI / 4, r = s % 2 ? q.size * 0.35 : q.size; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(74,49,34,0.6)'; ctx.lineWidth = 1; ctx.stroke();
        } else if (q.kind === 'grain') {
          ctx.fillStyle = q.color; ctx.strokeStyle = 'rgba(74,49,34,0.55)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(0, 0, q.size, q.size * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillStyle = q.color;
          ctx.fillRect(-q.size, -q.size * 0.55, q.size * 2, q.size * 1.1);
        }
      }
      ctx.restore();
    }
    for (var j = 0; j < this.texts.length; j++) {
      var t = this.texts[j], tf = t.life / t.max;
      var sc = tf < 0.18 ? Ease.outBack(tf / 0.18) : 1;
      ctx.save();
      ctx.globalAlpha = tf > 0.7 ? (1 - tf) / 0.3 : 1;
      ctx.translate(t.x, t.y - Ease.outCubic(tf) * 44);
      ctx.scale(sc, sc);
      Art.text(ctx, t.str, 0, 0, t.size, t.color, '#6b2a1c', 'center', 5);
      ctx.restore();
    }
    for (var k = 0; k < this.toasts.length; k++) {
      var o = this.toasts[k], of = o.life / o.max;
      var s2 = of < 0.12 ? Ease.outBack(of / 0.12) : 1;
      ctx.save();
      ctx.globalAlpha = of > 0.8 ? (1 - of) / 0.2 : 1;
      ctx.font = Art.font(14);
      var w = ctx.measureText(o.str).width + 26, h = 30;
      var x = KS.clamp(o.x, w / 2 + 8, KS.Layout.W - w / 2 - 8), y = o.y;
      ctx.translate(x, y); ctx.scale(s2, s2);
      Art.roundRect(ctx, -w / 2, -h / 2, w, h, 15);
      ctx.fillStyle = '#4a3122'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6, h / 2 - 1); ctx.lineTo(0, h / 2 + 7); ctx.lineTo(6, h / 2 - 1); ctx.fill();
      ctx.fillStyle = '#fff3dc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.str, 0, 1);
      ctx.restore();
    }
  };

  KS.Fx = Fx;
})(globalThis.KS);
