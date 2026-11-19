/*
 * 场景美术：纸纹背景、木桌、传送带、托盘、暂存区、HUD 按钮/标题/进度条。
 * 全部为程序化原创绘制，静态部分会预渲染到离屏画布。
 */
(function (KS) {
  'use strict';
  var Art = KS.Art;
  var INK = Art.INK;
  var FONT = '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei",sans-serif';
  Art.FONT = FONT;
  Art.font = function (size, weight) { return (weight || 900) + ' ' + size + 'px ' + FONT; };

  Art.roundRect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  var roundRect = Art.roundRect;

  // ---------- 纹理 ----------
  var noiseCache = {};
  Art.noise = function (key, size, color, density, alphaMax) {
    if (noiseCache[key]) return noiseCache[key];
    var c = Art.makeCanvas(size, size), ctx = c.getContext('2d');
    var r = KS.rng(key.length * 9973 + size);
    for (var i = 0; i < size * size * density; i++) {
      ctx.fillStyle = 'rgba(' + color + ',' + (r() * alphaMax).toFixed(3) + ')';
      var s = r() < 0.85 ? 1 : 2;
      ctx.fillRect(r() * size, r() * size, s, s);
    }
    noiseCache[key] = c;
    return c;
  };

  /** 奶油色纸张背景 */
  Art.paper = function (ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var g = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 20, x + w / 2, y + h * 0.5, Math.max(w, h) * 0.8);
    g.addColorStop(0, '#fbebd2'); g.addColorStop(1, '#f1d6b2');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ctx.createPattern(Art.noise('paper', 128, '120,80,40', 0.35, 0.09), 'repeat');
    ctx.fillRect(x, y, w, h);
    // 纤维
    var r = KS.rng(77);
    ctx.strokeStyle = 'rgba(150,100,60,0.07)'; ctx.lineWidth = 0.8;
    for (var i = 0; i < w * h / 900; i++) {
      var px = x + r() * w, py = y + r() * h, a = r() * Math.PI, l = 4 + r() * 10;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + 2, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); ctx.stroke();
    }
    ctx.restore();
  };

  /** 木纹桌面 */
  Art.wood = function (ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e3a669'); g.addColorStop(1, '#d48f52');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    var r = KS.rng(4242);
    for (var i = 0; i < h / 3.2; i++) {
      var yy = y + i * 3.2 + r() * 2;
      ctx.strokeStyle = 'rgba(160,90,40,' + (0.08 + r() * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 0.6 + r() * 1.3;
      ctx.beginPath(); ctx.moveTo(x, yy);
      var amp = 0.6 + r() * 1.8, ph = r() * 6, fr = 0.01 + r() * 0.02;
      for (var xx = x; xx <= x + w; xx += 12) ctx.lineTo(xx, yy + Math.sin(xx * fr + ph) * amp);
      ctx.stroke();
    }
    // 节疤
    for (var k = 0; k < 3; k++) {
      var kx = x + r() * w, ky = y + 60 + r() * (h - 80);
      ctx.strokeStyle = 'rgba(150,80,35,0.18)'; ctx.lineWidth = 1.2;
      for (var j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(kx, ky, 10 + j * 6, 2.5 + j * 2, 0, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.fillStyle = ctx.createPattern(Art.noise('wood', 128, '90,40,10', 0.3, 0.08), 'repeat');
    ctx.fillRect(x, y, w, h);
    // 桌沿
    ctx.fillStyle = 'rgba(120,60,20,0.35)'; ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = 'rgba(255,230,190,0.45)'; ctx.fillRect(x, y + 3, w, 2);
    var sg = ctx.createLinearGradient(0, y + 5, 0, y + 24);
    sg.addColorStop(0, 'rgba(110,55,20,0.25)'); sg.addColorStop(1, 'rgba(110,55,20,0)');
    ctx.fillStyle = sg; ctx.fillRect(x, y + 5, w, 19);
    ctx.restore();
  };

  // ---------- 传送带 ----------
  function strokePath(ctx, path, from, to) {
    ctx.beginPath();
    var st = 3, i0 = Math.max(0, Math.floor(from || 0)), i1 = Math.min(path.n - 1, to == null ? path.n - 1 : Math.floor(to));
    ctx.moveTo(path.xs[i0], path.ys[i0]);
    for (var i = i0 + st; i < i1; i += st) ctx.lineTo(path.xs[i], path.ys[i]);
    ctx.lineTo(path.xs[i1], path.ys[i1]);
    if (path.closed) ctx.closePath();
  }

  /**
   * 传送带静态层（围挡 + 带面），画到给定 ctx（通常是离屏静态层）
   * W：带面宽；wall：围挡厚度（均为逻辑像素）
   */
  Art.belt = function (ctx, path, W, wall, canvasW, canvasH, dpr) {
    var off = Art.makeCanvas(canvasW * dpr, canvasH * dpr);
    var o = off.getContext('2d');
    o.scale(dpr, dpr);
    o.lineJoin = 'round'; o.lineCap = 'butt';
    var outer = W + wall * 2;
    // 投影
    o.save(); o.translate(0, 5);
    strokePath(o, path); o.strokeStyle = 'rgba(100,60,30,0.25)'; o.lineWidth = outer + 6; o.stroke();
    o.restore();
    // 围挡：描边 → 底色 → 高光
    strokePath(o, path); o.strokeStyle = '#4b4430'; o.lineWidth = outer + 5; o.stroke();
    strokePath(o, path); o.strokeStyle = '#879058'; o.lineWidth = outer; o.stroke();
    strokePath(o, path); o.strokeStyle = '#a3a873'; o.lineWidth = W + wall * 1.1; o.stroke();
    strokePath(o, path); o.strokeStyle = '#94995f'; o.lineWidth = W + wall * 0.55; o.stroke();
    // 围挡斑驳纹理（只作用在已画像素上）
    o.globalCompositeOperation = 'source-atop';
    o.fillStyle = o.createPattern(Art.noise('wall', 96, '40,50,20', 0.5, 0.22), 'repeat');
    o.fillRect(0, 0, canvasW, canvasH);
    o.globalCompositeOperation = 'source-over';
    // 带面
    strokePath(o, path); o.strokeStyle = '#5a4430'; o.lineWidth = W + 4; o.stroke();
    strokePath(o, path); o.strokeStyle = '#b38b66'; o.lineWidth = W; o.stroke();
    strokePath(o, path); o.strokeStyle = '#c7a07a'; o.lineWidth = W - 9; o.stroke();
    strokePath(o, path); o.strokeStyle = '#cfa984'; o.lineWidth = W - 26; o.stroke();
    ctx.drawImage(off, 0, 0, canvasW, canvasH);
  };

  /** 动态履带缝（随传送带移动），每帧调用 */
  Art.beltSlats = function (ctx, path, W, offset, gap, vis) {
    var tmp = {};
    var hw = W / 2 - 1.5;
    var start = (offset % gap);
    ctx.beginPath();
    for (var s = start; s < path.length; s += gap) {
      if (vis && (s < vis.start - 40 || s > vis.end + 40)) continue;
      path.at(s, tmp);
      var nx = -tmp.ty, ny = tmp.tx;
      ctx.moveTo(tmp.x + nx * hw, tmp.y + ny * hw);
      ctx.lineTo(tmp.x - nx * hw, tmp.y - ny * hw);
    }
    ctx.strokeStyle = 'rgba(105,70,42,0.30)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    for (var s2 = start + 2; s2 < path.length; s2 += gap) {
      if (vis && (s2 < vis.start - 40 || s2 > vis.end + 40)) continue;
      path.at(s2, tmp);
      var mx = -tmp.ty, my = tmp.tx;
      ctx.moveTo(tmp.x + mx * hw, tmp.y + my * hw);
      ctx.lineTo(tmp.x - mx * hw, tmp.y - my * hw);
    }
    ctx.strokeStyle = 'rgba(255,235,205,0.22)'; ctx.lineWidth = 1;
    ctx.stroke();
  };

  /** 围挡上的方向箭头（避开彼此和屏幕外） */
  Art.beltArrows = function (ctx, path, W, wall, screen) {
    var placed = [], tmp = {};
    var d = W / 2 + wall / 2;
    for (var s = 70; s < path.length - 40; s += 9) {
      path.at(s, tmp);
      for (var side = -1; side <= 1; side += 2) {
        var x = tmp.x - tmp.ty * d * side, y = tmp.y + tmp.tx * d * side;
        if (x < 22 || x > screen.w - 22 || y < screen.y + 10 || y > screen.y + screen.h - 10) continue;
        var near = false;
        for (var i = 0; i < placed.length; i++) {
          var p = placed[i];
          if ((x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]) < 110 * 110) { near = true; break; }
        }
        if (near) continue;
        placed.push([x, y, s]);
        ctx.save();
        ctx.translate(x, y); ctx.rotate(Math.atan2(tmp.ty, tmp.tx));
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(7, 0); ctx.moveTo(2, -5); ctx.lineTo(8, 0); ctx.lineTo(2, 5);
        ctx.strokeStyle = 'rgba(60,55,35,0.65)'; ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = '#f6ecd0'; ctx.lineWidth = 2.4; ctx.stroke();
        ctx.restore();
      }
    }
  };

  /** 出入口木门帘（盖住传送带两端，寿司从下面钻出/钻入） */
  Art.gate = function (ctx, x, y, angle, span, label) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    var d = 24;
    // 阴影
    ctx.fillStyle = 'rgba(70,40,20,0.25)';
    roundRect(ctx, -d / 2 + 3, -span / 2 + 4, d, span, 6); ctx.fill();
    // 木梁
    roundRect(ctx, -d / 2, -span / 2, d, span, 6);
    var g = ctx.createLinearGradient(-d / 2, 0, d / 2, 0);
    g.addColorStop(0, '#9a6238'); g.addColorStop(0.5, '#b57947'); g.addColorStop(1, '#8a552f');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,15,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-5, -span / 2 + 6); ctx.lineTo(-5, span / 2 - 6); ctx.moveTo(4, -span / 2 + 10); ctx.lineTo(4, span / 2 - 14); ctx.stroke();
    // 布帘
    var strips = 3, sw = (span - 14) / strips;
    for (var i = 0; i < strips; i++) {
      var sy = -span / 2 + 7 + i * sw;
      roundRect(ctx, d / 2 - 4, sy + 1, 13, sw - 3, 3);
      ctx.fillStyle = i === 1 ? '#c9473d' : '#3f5f80'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = 'rgba(255,245,225,0.85)';
      ctx.beginPath(); ctx.arc(d / 2 + 2.5, sy + sw / 2 - 0.5, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // 文字（竖排，保持正向）
    if (label) {
      ctx.save();
      ctx.font = Art.font(11);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var lx = x + Math.cos(angle) * 0, ly = y;
      ctx.lineWidth = 3; ctx.strokeStyle = '#5b3418'; ctx.fillStyle = '#fff1d6';
      for (var c = 0; c < label.length; c++) {
        ctx.strokeText(label[c], lx, ly - 7 + c * 13);
        ctx.fillText(label[c], lx, ly - 7 + c * 13);
      }
      ctx.restore();
    }
  };

  // ---------- 托盘 ----------
  function wavyRect(ctx, x, y, w, h, r, amp, seed) {
    var rnd = KS.rng(seed);
    var ph1 = rnd() * 6, ph2 = rnd() * 6;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    for (var t = x + r; t <= x + w - r; t += 6) ctx.lineTo(t, y + Math.sin(t * 0.07 + ph1) * amp);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w + Math.sin(ph2) * amp * 0.6, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    for (var u = x + w - r; u >= x + r; u -= 6) ctx.lineTo(u, y + h + Math.sin(u * 0.06 + ph2) * amp);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x - Math.sin(ph1) * amp * 0.6, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function sakura(ctx, x, y, r, color) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = color || '#f6b3bf';
    for (var i = 0; i < 5; i++) {
      ctx.rotate(Math.PI * 2 / 5);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.6, r * 0.42, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff3c9'; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  Art.sakura = sakura;

  function leaf(ctx, x, y, len, ang, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(60,90,40,0.6)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(len * 0.85, 0); ctx.stroke();
    ctx.restore();
  }

  function waves(ctx, x, y, r, color) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1.4;
    for (var k = 0; k < 3; k++) {
      var cx = x + k * r * 1.6;
      for (var j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(cx, y, r - j * r * 0.3, Math.PI, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
  }
  Art.waves = waves;

  /** 单个托盘（含花纹餐垫、木脚），返回离屏画布；中心在画布中心 */
  Art.traySprite = function (index, w, h, dpr) {
    var pad = 24;
    var cw = w + pad * 2, ch = h + pad * 2 + 6;
    var c = Art.makeCanvas(cw * dpr, ch * dpr), ctx = c.getContext('2d');
    ctx.scale(dpr, dpr); ctx.translate(cw / 2, ch / 2 - 3);
    var x = -w / 2, y = -h / 2;
    // 餐垫
    var mx = x - 12, my = y + 12, mw = w + 24, mh = h - 2;
    ctx.save(); ctx.translate(3, 3); roundRect(ctx, mx, my, mw, mh, 6); ctx.fillStyle = 'rgba(100,45,20,0.25)'; ctx.fill(); ctx.restore();
    roundRect(ctx, mx, my, mw, mh, 6);
    ctx.fillStyle = '#c6625b'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(140,50,45,0.6)'; ctx.lineWidth = 1;
    for (var dx = -mw; dx < mw * 2; dx += 9) { ctx.beginPath(); ctx.moveTo(mx + dx, my); ctx.lineTo(mx + dx + mh, my + mh); ctx.moveTo(mx + dx + mh, my); ctx.lineTo(mx + dx, my + mh); ctx.stroke(); }
    roundRect(ctx, mx + 3, my + 3, mw - 6, mh - 6, 4); ctx.strokeStyle = 'rgba(255,220,210,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    sakura(ctx, mx + 9, my + mh - 9, 5, '#ffe3e3'); sakura(ctx, mx + mw - 9, my + mh - 9, 5, '#ffe3e3');
    sakura(ctx, mx + mw - 18, my + mh - 5, 3.4, '#ffd0d0');
    ctx.restore();
    roundRect(ctx, mx, my, mw, mh, 6); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
    // 木脚
    [-w * 0.32, w * 0.32].forEach(function (fx) {
      roundRect(ctx, fx - 13, y + h - 3, 26, 9, 3);
      ctx.fillStyle = '#a7683b'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    });
    // 盘身厚度
    wavyRect(ctx, x, y + 5, w, h, 16, 1.2, index * 31 + 7);
    ctx.fillStyle = '#e3cba3'; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    // 盘面
    wavyRect(ctx, x, y, w, h, 16, 1.2, index * 31 + 7);
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f6e8cf');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    // 内凹
    wavyRect(ctx, x + 8, y + 6, w - 16, h - 12, 11, 0.8, index * 31 + 9);
    ctx.fillStyle = 'rgba(232,212,178,0.35)'; ctx.fill();
    ctx.strokeStyle = 'rgba(190,160,120,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = ctx.createPattern(Art.noise('tray', 64, '160,120,70', 0.2, 0.08), 'repeat');
    wavyRect(ctx, x, y, w, h, 16, 1.2, index * 31 + 7); ctx.fill();
    // 纹样
    if (index === 0) {
      leaf(ctx, x + 12, y + 14, 15, -0.5, '#9dbb6c'); leaf(ctx, x + 14, y + 16, 12, 0.3, '#b7cf87'); leaf(ctx, x + 10, y + 18, 10, 1.1, '#8eae5e');
      leaf(ctx, x + w - 12, y + h - 12, 15, Math.PI + 0.5, '#9dbb6c'); leaf(ctx, x + w - 14, y + h - 14, 11, Math.PI - 0.4, '#b7cf87');
    } else if (index === 1) {
      ctx.strokeStyle = '#8c6a4a'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x + 8, y + h - 12); ctx.quadraticCurveTo(x + 16, y + 18, x + 26, y + 10); ctx.stroke();
      sakura(ctx, x + 16, y + 16, 5.5); sakura(ctx, x + 25, y + 10, 4); sakura(ctx, x + 11, y + 27, 3.6, '#f9c9d1');
      ctx.beginPath(); ctx.moveTo(x + w - 8, y + 12); ctx.quadraticCurveTo(x + w - 18, y + h - 14, x + w - 28, y + h - 10); ctx.stroke();
      sakura(ctx, x + w - 15, y + h - 17, 5.5); sakura(ctx, x + w - 27, y + h - 11, 4);
    } else {
      waves(ctx, x + 14, y + 17, 7, 'rgba(120,150,120,0.75)');
      waves(ctx, x + w - 44, y + h - 9, 7, 'rgba(120,150,120,0.75)');
    }
    return { canvas: c, w: cw, h: ch, ox: cw / 2, oy: ch / 2 - 3 };
  };

  /** 虚线椭圆空位 */
  Art.slot = function (ctx, x, y, rx, ry, alpha) {
    ctx.save();
    ctx.setLineDash([4.5, 4]);
    ctx.strokeStyle = 'rgba(150,115,80,' + (alpha == null ? 0.75 : alpha) + ')'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  /** 暂存区面板 */
  Art.bufferPanel = function (ctx, b, slots) {
    ctx.save(); ctx.translate(0, 4);
    roundRect(ctx, b.x, b.y, b.w, b.h, 18); ctx.fillStyle = 'rgba(100,50,20,0.25)'; ctx.fill();
    ctx.restore();
    roundRect(ctx, b.x, b.y, b.w, b.h, 18);
    var g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g.addColorStop(0, '#fff8ea'); g.addColorStop(1, '#f3e3c4');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    roundRect(ctx, b.x + 6, b.y + 6, b.w - 12, b.h - 12, 13);
    ctx.strokeStyle = 'rgba(190,160,120,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
    waves(ctx, b.x + 16, b.y + 20, 7, 'rgba(120,150,120,0.6)');
    waves(ctx, b.x + b.w - 46, b.y + 20, 7, 'rgba(120,150,120,0.6)');
  };

  Art.label = function (ctx, x, y, text) {
    ctx.save();
    ctx.font = Art.font(15);
    var tw = ctx.measureText(text).width + 30;
    roundRect(ctx, x - tw / 2, y - 14, tw, 28, 14);
    ctx.fillStyle = '#fbefd8'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#5b3a26'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
    // 两侧小装饰
    ctx.strokeStyle = '#d0603f'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    [-1, 1].forEach(function (sd) {
      var bx = x + sd * (tw / 2 + 6);
      ctx.beginPath();
      ctx.moveTo(bx, y - 7); ctx.lineTo(bx + sd * 6, y - 11);
      ctx.moveTo(bx + sd * 2, y); ctx.lineTo(bx + sd * 9, y);
      ctx.moveTo(bx, y + 7); ctx.lineTo(bx + sd * 6, y + 11);
      ctx.stroke();
    });
    ctx.restore();
  };

  // ---------- HUD ----------
  Art.button = function (ctx, r, icon, pressed, muted) {
    ctx.save();
    var dy = pressed ? 2 : 0;
    roundRect(ctx, r.x, r.y + 3, r.w, r.h, 12); ctx.fillStyle = '#c9a77f'; ctx.fill();
    roundRect(ctx, r.x, r.y + 3, r.w, r.h, 12); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    roundRect(ctx, r.x, r.y + dy, r.w, r.h, 12);
    var g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, '#fff7e6'); g.addColorStop(1, '#f2dfbd');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2 + dy;
    ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (icon === 'restart') {
      var a0 = -Math.PI / 2 + 0.25, a1 = Math.PI * 1.5 - 0.75;
      ctx.beginPath(); ctx.arc(cx, cy + 1, 10, a0, a1); ctx.stroke();
      var ex = cx + Math.cos(a1) * 10, ey = cy + 1 + Math.sin(a1) * 10;
      var dx = -Math.sin(a1), dy = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex + dx * 7, ey + dy * 7); ctx.lineTo(ex - dx * 1 + nx * 6, ey - dy * 1 + ny * 6); ctx.lineTo(ex - dx * 1 - nx * 6, ey - dy * 1 - ny * 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (icon === 'sound') {
      ctx.beginPath(); ctx.moveTo(cx - 11, cy - 4); ctx.lineTo(cx - 6, cy - 4); ctx.lineTo(cx + 1, cy - 10); ctx.lineTo(cx + 1, cy + 10); ctx.lineTo(cx - 6, cy + 4); ctx.lineTo(cx - 11, cy + 4); ctx.closePath();
      ctx.lineWidth = 2.4; ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2.6;
      if (muted) {
        ctx.beginPath(); ctx.moveTo(cx + 5, cy - 5); ctx.lineTo(cx + 13, cy + 5); ctx.moveTo(cx + 13, cy - 5); ctx.lineTo(cx + 5, cy + 5); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(cx + 2, cy, 6, -0.9, 0.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 2, cy, 11, -0.9, 0.9); ctx.stroke();
      }
    } else if (icon === 'home') {
      ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.moveTo(cx - 11, cy - 1); ctx.lineTo(cx, cy - 11); ctx.lineTo(cx + 11, cy - 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx - 7, cy + 9); ctx.lineTo(cx + 7, cy + 9); ctx.lineTo(cx + 7, cy - 3); ctx.stroke();
    } else if (icon === 'pause') {
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - 5, cy - 9); ctx.lineTo(cx - 5, cy + 9); ctx.moveTo(cx + 5, cy - 9); ctx.lineTo(cx + 5, cy + 9); ctx.stroke();
    }
    ctx.restore();
  };

  /** 红色手绘墨块标题 */
  Art.banner = function (ctx, x, y, text, w, h, color) {
    w = w || 150; h = h || 46;
    ctx.save();
    var r = KS.rng(text.length * 131 + 7);
    ctx.beginPath();
    var n = 18;
    for (var i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2;
      var rx = w / 2 * (0.97 + r() * 0.06), ry = h / 2 * (0.9 + r() * 0.12);
      var px = x + Math.cos(a) * rx * (Math.abs(Math.cos(a)) > 0.7 ? 1 : 1.02);
      var py = y + Math.sin(a) * ry;
      // 让形状更接近圆角矩形
      px = x + Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.45) * rx;
      py = y + Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.6) * ry;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color || '#c74a3f'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,200,180,0.18)';
    for (var k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(x - w / 2 + r() * w, y - h / 2 + r() * h, 10 + r() * 16, 3 + r() * 5, r(), 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(120,20,15,0.18)';
    for (var k2 = 0; k2 < 4; k2++) { ctx.beginPath(); ctx.ellipse(x - w / 2 + r() * w, y - h / 2 + r() * h, 8 + r() * 12, 2 + r() * 4, r(), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // 刷痕小点
    ctx.strokeStyle = color || '#c74a3f'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    [-1, 1].forEach(function (sd) {
      var bx = x + sd * (w / 2 + 8);
      ctx.beginPath();
      ctx.moveTo(bx, y - 12); ctx.lineTo(bx + sd * 8, y - 17);
      ctx.moveTo(bx + sd * 3, y); ctx.lineTo(bx + sd * 13, y);
      ctx.moveTo(bx, y + 12); ctx.lineTo(bx + sd * 8, y + 17);
      ctx.stroke();
    });
    ctx.font = Art.font(Math.round(h * 0.56));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(110,25,20,0.9)'; ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y + 1);
    ctx.fillStyle = '#fff6e6'; ctx.fillText(text, x, y + 1);
    ctx.restore();
  };

  Art.pill = function (ctx, r) {
    roundRect(ctx, r.x, r.y + 2, r.w, r.h, r.h / 2); ctx.fillStyle = '#c9a77f'; ctx.fill();
    roundRect(ctx, r.x, r.y, r.w, r.h, r.h / 2);
    ctx.fillStyle = '#fff6e4'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
  };

  Art.clockIcon = function (ctx, x, y, r, warn) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = warn ? '#f2a08f' : '#bfe0a0'; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - r * 0.6); ctx.moveTo(x, y); ctx.lineTo(x + r * 0.45, y + r * 0.2);
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
  };

  /** 时间条 */
  Art.bar = function (ctx, b, frac, color, pulse) {
    ctx.save();
    roundRect(ctx, b.x, b.y, b.w, b.h, b.h / 2);
    ctx.fillStyle = '#f4e4c3'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(160,120,70,0.15)'; ctx.fillRect(b.x, b.y, b.w, 4);
    if (frac > 0) {
      var fw = Math.max(b.h, b.w * frac);
      roundRect(ctx, b.x, b.y, fw, b.h, b.h / 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      roundRect(ctx, b.x + 4, b.y + 3, Math.max(0, fw - 8), 4, 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(b.x, b.y + b.h - 4, fw, 4);
      if (pulse) { ctx.fillStyle = 'rgba(255,255,255,' + (0.25 * pulse).toFixed(3) + ')'; ctx.fillRect(b.x, b.y, fw, b.h); }
    }
    ctx.restore();
    roundRect(ctx, b.x, b.y, b.w, b.h, b.h / 2);
    ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
  };

  /** 描边文字 */
  Art.text = function (ctx, text, x, y, size, fill, stroke, align, lw) {
    ctx.save();
    ctx.font = Art.font(size);
    ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = lw || Math.max(3, size * 0.18); ctx.strokeStyle = stroke; ctx.strokeText(text, x, y); }
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
    ctx.restore();
  };

  /** 星星 */
  Art.star = function (ctx, x, y, r, filled, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = filled ? '#ffcf4a' : '#e8d6b6'; ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.14); ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.stroke();
    if (filled) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.2, r * 0.18, r * 0.1, -0.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };

  /** 卡通手指（新手提示） */
  Art.hand = function (ctx, x, y, s, press) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.35);
    ctx.translate(0, press ? 3 : 0);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(-3, -4, 1, -4); ctx.quadraticCurveTo(5, -4, 5, 0);
    ctx.lineTo(5, 14);
    ctx.quadraticCurveTo(9, 11, 12, 14); ctx.quadraticCurveTo(15, 12, 18, 16); ctx.quadraticCurveTo(22, 15, 23, 20);
    ctx.lineTo(23, 30); ctx.quadraticCurveTo(22, 40, 12, 42); ctx.lineTo(4, 42);
    ctx.quadraticCurveTo(-4, 40, -8, 30); ctx.lineTo(-13, 20);
    ctx.quadraticCurveTo(-14, 15, -9, 16); ctx.lineTo(-3, 22);
    ctx.closePath();
    ctx.fillStyle = '#fff7ea'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 15); ctx.lineTo(12, 22); ctx.moveTo(18, 17); ctx.lineTo(18, 23); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  };

  Art.strokePath = strokePath;
})(globalThis.KS);
