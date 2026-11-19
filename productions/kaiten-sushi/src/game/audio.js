/*
 * 合成音效（WebAudio 实时合成，无需音频文件）。首次触摸后解锁。
 * 后续若有正式音效素材，只需在 play() 中改为播放 AudioBuffer。
 */
(function (KS) {
  'use strict';
  var Sfx = KS.Sfx = { muted: false, ctx: null };
  try { Sfx.muted = localStorage.getItem('ks_muted') === '1'; } catch (e) { /* 隐私模式 */ }

  Sfx.unlock = function () {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch (e) { this.ctx = null; }
  };
  Sfx.toggle = function () {
    this.muted = !this.muted;
    try { localStorage.setItem('ks_muted', this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
  };

  function tone(freq, t0, dur, type, vol, slideTo) {
    var c = Sfx.ctx;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(Sfx.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  Sfx.play = function (name, arg) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    var t = this.ctx.currentTime + 0.005;
    switch (name) {
      case 'pick': tone(520, t, 0.09, 'triangle', 0.25, 880); break;
      case 'place': tone(300, t, 0.08, 'sine', 0.35, 180); tone(900, t, 0.04, 'triangle', 0.08); break;
      case 'buffer': tone(260, t, 0.08, 'sine', 0.3, 200); break;
      case 'reject': tone(180, t, 0.16, 'square', 0.08, 120); tone(140, t + 0.08, 0.16, 'square', 0.06, 100); break;
      case 'match': {
        var base = 523.25 * Math.pow(2, Math.min(arg || 0, 4) / 12);
        [1, 1.26, 1.5, 2].forEach(function (m, i) { tone(base * m, t + i * 0.06, 0.32, 'triangle', 0.22); });
        tone(base * 4, t + 0.24, 0.25, 'sine', 0.08);
        break;
      }
      case 'tick': tone(1200, t, 0.03, 'square', 0.04); break;
      case 'go': tone(660, t, 0.12, 'triangle', 0.25); tone(990, t + 0.1, 0.2, 'triangle', 0.25); break;
      case 'win': [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, t + i * 0.1, 0.4, 'triangle', 0.22); }); break;
      case 'lose': [392, 330, 262, 196].forEach(function (f, i) { tone(f, t + i * 0.16, 0.35, 'triangle', 0.2); }); break;
      case 'click': tone(700, t, 0.05, 'triangle', 0.18); break;
    }
  };
})(globalThis.KS);
