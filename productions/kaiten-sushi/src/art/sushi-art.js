/*
 * 寿司与瓷盘的原创矢量绘制（Canvas 2D）。
 * 所有图形在“单位空间”中绘制：寿司宽约 100 单位，原点在寿司底部中心附近。
 * 首次使用时按当前 DPR 预渲染成高分辨率精灵图缓存，运行时只做 drawImage，保证流畅。
 *
 * 想换美术：只需替换这里各个 draw 函数（或改成加载 PNG 精灵），游戏逻辑不受影响。
 */
(function (KS) {
  'use strict';
  var INK = '#4a3122';
  var Art = KS.Art = KS.Art || {};
  Art.INK = INK;

  Art.makeCanvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  };

  function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
  Art.ellipse = ellipse;

  function ink(ctx, w) { ctx.lineWidth = w || 3.2; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  Art.ink = ink;

  // ---------------- 米饭 ----------------
  function rice(ctx, w, top, bottom) {
    w = w || 72; top = top == null ? -12 : top; bottom = bottom == null ? 24 : bottom;
    var hw = w / 2;
    ctx.beginPath();
    ctx.moveTo(-hw, top + 18);
    ctx.quadraticCurveTo(-hw - 1, top, -hw + 14, top);
    ctx.lineTo(hw - 14, top);
    ctx.quadraticCurveTo(hw + 1, top, hw, top + 18);
    ctx.quadraticCurveTo(hw, bottom - 2, hw - 10, bottom);
    var bumps = 6, x = hw - 10, step = (2 * hw - 20) / bumps;
    for (var i = 0; i < bumps; i++) {
      ctx.quadraticCurveTo(x - step / 2, bottom + 4.5, x - step, bottom);
      x -= step;
    }
    ctx.quadraticCurveTo(-hw, bottom - 2, -hw, top + 18);
    ctx.closePath();
    var g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, '#fffdf6'); g.addColorStop(0.7, '#fbf3e4'); g.addColorStop(1, '#efe1c9');
    ctx.fillStyle = g; ctx.fill();
    ink(ctx);
    // 米粒
    ctx.save();
    ctx.strokeStyle = 'rgba(176,150,118,0.55)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    var grains = [[-24, 10, 0.3], [-12, 16, -0.4], [2, 12, 0.2], [14, 17, -0.2], [25, 9, 0.5], [-28, 18, -0.6], [8, 20, 0.6], [-4, 6, -0.1], [22, 19, 0.1]];
    grains.forEach(function (g2) {
      ctx.beginPath();
      ctx.ellipse(g2[0], g2[1], 3.2, 1.4, g2[2], Math.PI * 0.1, Math.PI * 1.1);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ---------------- 鱼片（握寿司通用） ----------------
  function fishPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-46, 4);
    ctx.bezierCurveTo(-51, -8, -46, -24, -31, -27);
    ctx.bezierCurveTo(-10, -31, 18, -33, 35, -28);
    ctx.bezierCurveTo(48, -24, 52, -8, 45, 1);
    ctx.bezierCurveTo(32, 9, 12, 11, -8, 9);
    ctx.bezierCurveTo(-26, 8, -40, 11, -46, 4);
    ctx.closePath();
  }

  function gloss(ctx, x, y, rx, ry, a) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,' + (a || 0.6) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + rx + 5, y - 0.5, 2.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSalmon(ctx) {
    rice(ctx);
    fishPath(ctx);
    var g = ctx.createLinearGradient(0, -32, 0, 10);
    g.addColorStop(0, '#ffa766'); g.addColorStop(0.55, '#f8873f'); g.addColorStop(1, '#ea6a2c');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); fishPath(ctx); ctx.clip();
    // 脂肪纹理
    ctx.strokeStyle = '#ffe2c4'; ctx.lineCap = 'round';
    for (var i = 0; i < 5; i++) {
      var x = -34 + i * 17;
      ctx.lineWidth = 4.2 - i * 0.2;
      ctx.beginPath(); ctx.moveTo(x + 9, -33); ctx.quadraticCurveTo(x + 1, -14, x - 8, 10); ctx.stroke();
      ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,240,225,0.7)';
      ctx.beginPath(); ctx.moveTo(x + 17, -32); ctx.quadraticCurveTo(x + 10, -14, x + 2, 10); ctx.stroke();
      ctx.strokeStyle = '#ffe2c4';
    }
    // 底部厚度阴影
    ctx.fillStyle = 'rgba(190,70,20,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 12, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    fishPath(ctx); ink(ctx);
    gloss(ctx, -22, -19, 9, 3.4, 0.7);
  }

  function drawTuna(ctx) {
    rice(ctx);
    fishPath(ctx);
    var g = ctx.createLinearGradient(0, -32, 0, 10);
    g.addColorStop(0, '#f05a64'); g.addColorStop(0.6, '#d83a4b'); g.addColorStop(1, '#bd2a3c');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); fishPath(ctx); ctx.clip();
    ctx.strokeStyle = 'rgba(255,150,160,0.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (var i = 0; i < 6; i++) {
      var x = -36 + i * 15;
      ctx.beginPath(); ctx.moveTo(x + 10, -33); ctx.quadraticCurveTo(x + 4, -12, x - 6, 10); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(120,10,30,0.22)';
    ctx.beginPath(); ctx.ellipse(0, 12, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    fishPath(ctx); ink(ctx);
    gloss(ctx, -22, -19, 11, 3.6, 0.72);
  }

  function drawEbi(ctx) {
    rice(ctx);
    // 虾尾
    ctx.beginPath();
    ctx.moveTo(38, -18);
    ctx.bezierCurveTo(48, -30, 58, -34, 62, -26);
    ctx.bezierCurveTo(60, -20, 64, -14, 60, -6);
    ctx.bezierCurveTo(56, 0, 48, -2, 40, -4);
    ctx.closePath();
    var tg = ctx.createLinearGradient(40, -30, 62, 0);
    tg.addColorStop(0, '#ff6a4a'); tg.addColorStop(1, '#d93a2c');
    ctx.fillStyle = tg; ctx.fill(); ink(ctx, 2.8);
    ctx.beginPath(); ctx.moveTo(44, -12); ctx.lineTo(58, -24); ctx.moveTo(45, -9); ctx.lineTo(60, -12);
    ctx.strokeStyle = 'rgba(120,20,10,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
    // 虾身
    ctx.beginPath();
    ctx.moveTo(-44, 4);
    ctx.bezierCurveTo(-50, -8, -44, -24, -30, -26);
    ctx.bezierCurveTo(-8, -30, 20, -30, 38, -22);
    ctx.bezierCurveTo(46, -17, 46, -6, 40, -1);
    ctx.bezierCurveTo(28, 8, 10, 10, -8, 9);
    ctx.bezierCurveTo(-26, 8, -38, 11, -44, 4);
    ctx.closePath();
    ctx.save();
    ctx.fillStyle = '#fff3ea'; ctx.fill(); ctx.clip();
    ctx.fillStyle = '#f7784f';
    for (var i = 0; i < 5; i++) {
      var x = -38 + i * 18;
      ctx.beginPath();
      ctx.moveTo(x + 4, -34); ctx.quadraticCurveTo(x - 2, -12, x - 8, 12);
      ctx.lineTo(x + 2, 12); ctx.quadraticCurveTo(x + 8, -12, x + 14, -34);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(200,80,40,0.18)';
    ctx.beginPath(); ctx.ellipse(0, 12, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ink(ctx);
    gloss(ctx, -24, -18, 8, 3, 0.75);
  }

  function drawTamago(ctx) {
    rice(ctx);
    // 顶面
    ctx.beginPath();
    ctx.moveTo(-44, -14);
    ctx.quadraticCurveTo(-44, -30, -30, -31);
    ctx.lineTo(32, -31);
    ctx.quadraticCurveTo(44, -30, 44, -14);
    ctx.closePath();
    ctx.fillStyle = '#ffe07c'; ctx.fill();
    // 正面
    ctx.beginPath();
    ctx.moveTo(-44, -16);
    ctx.lineTo(44, -16);
    ctx.lineTo(44, 0);
    ctx.quadraticCurveTo(44, 8, 36, 8);
    ctx.lineTo(-36, 8);
    ctx.quadraticCurveTo(-44, 8, -44, 0);
    ctx.closePath();
    var g = ctx.createLinearGradient(0, -16, 0, 8);
    g.addColorStop(0, '#f8c94b'); g.addColorStop(1, '#eeb233');
    ctx.fillStyle = g; ctx.fill();
    // 整体轮廓
    ctx.beginPath();
    ctx.moveTo(-44, -14);
    ctx.quadraticCurveTo(-44, -30, -30, -31);
    ctx.lineTo(32, -31);
    ctx.quadraticCurveTo(44, -30, 44, -14);
    ctx.lineTo(44, 0); ctx.quadraticCurveTo(44, 8, 36, 8);
    ctx.lineTo(-36, 8); ctx.quadraticCurveTo(-44, 8, -44, 0);
    ctx.closePath(); ink(ctx);
    ctx.beginPath(); ctx.moveTo(-42, -16); ctx.quadraticCurveTo(0, -14, 42, -16);
    ctx.strokeStyle = 'rgba(160,100,20,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    // 层次纹
    ctx.strokeStyle = 'rgba(200,130,30,0.45)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-38, -6); ctx.lineTo(-14, -6); ctx.moveTo(14, -6); ctx.lineTo(38, -6);
    ctx.moveTo(-36, 2); ctx.lineTo(-16, 2); ctx.moveTo(16, 2); ctx.lineTo(36, 2); ctx.stroke();
    // 焦痕
    ctx.fillStyle = 'rgba(190,120,40,0.35)';
    ctx.beginPath(); ctx.ellipse(-28, -24, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(26, -22, 5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    gloss(ctx, -26, -26, 7, 2, 0.55);
    // 海苔带
    ctx.beginPath();
    ctx.moveTo(-10, -32); ctx.lineTo(10, -32);
    ctx.quadraticCurveTo(12, -8, 11, 22);
    ctx.quadraticCurveTo(0, 24, -11, 22);
    ctx.quadraticCurveTo(-12, -8, -10, -32);
    ctx.closePath();
    var ng = ctx.createLinearGradient(-10, 0, 10, 0);
    ng.addColorStop(0, '#26332a'); ng.addColorStop(0.5, '#3a4a3c'); ng.addColorStop(1, '#222e26');
    ctx.fillStyle = ng; ctx.fill(); ink(ctx, 2.8);
    ctx.strokeStyle = 'rgba(140,170,130,0.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(-5, 16); ctx.moveTo(4, -26); ctx.lineTo(5, 4); ctx.stroke();
  }

  function makiPiece(ctx, cx, cy, r) {
    var ry = r * 0.56, h = r * 1.05;
    // 侧面（海苔）
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx - r, cy + h);
    ctx.ellipse(cx, cy + h, r, ry, 0, Math.PI, 0, true);
    ctx.lineTo(cx + r, cy);
    ctx.closePath();
    var g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    g.addColorStop(0, '#1f2a22'); g.addColorStop(0.3, '#3d4d3f'); g.addColorStop(0.6, '#2a372d'); g.addColorStop(1, '#1b241d');
    ctx.fillStyle = g; ctx.fill(); ink(ctx);
    // 顶面
    ellipse(ctx, cx, cy, r, ry);
    ctx.fillStyle = '#26322a'; ctx.fill(); ink(ctx);
    ellipse(ctx, cx, cy + 0.5, r - 4, ry - 2.6);
    ctx.fillStyle = '#fffaf0'; ctx.fill();
    ctx.strokeStyle = 'rgba(170,150,120,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
    // 米粒点
    ctx.fillStyle = 'rgba(190,170,140,0.6)';
    for (var a = 0; a < 6; a++) {
      var ang = a / 6 * Math.PI * 2 + 0.3;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(ang) * (r - 7.5), cy + Math.sin(ang) * (ry - 4.5), 1.6, 0.9, ang, 0, Math.PI * 2); ctx.fill();
    }
    // 黄瓜芯
    ellipse(ctx, cx, cy + 0.5, r * 0.42, ry * 0.42);
    ctx.fillStyle = '#8cc152'; ctx.fill();
    ctx.strokeStyle = '#4f7f2a'; ctx.lineWidth = 1.8; ctx.stroke();
    ellipse(ctx, cx - 1, cy, r * 0.22, ry * 0.2);
    ctx.fillStyle = '#c9e58f'; ctx.fill();
  }

  function drawMaki(ctx) {
    makiPiece(ctx, 0, -26, 19);
    makiPiece(ctx, -22, -6, 19);
    makiPiece(ctx, 22, -6, 19);
  }

  function drawIkura(ctx) {
    // 黄瓜片点缀
    ctx.beginPath(); ctx.ellipse(24, -22, 13, 8, -0.3, Math.PI, Math.PI * 2.05);
    ctx.closePath();
    ctx.fillStyle = '#9fd065'; ctx.fill(); ink(ctx, 2.6);
    // 海苔外壁
    var rx = 38, ry = 13, top = -10, bottom = 18;
    ctx.beginPath();
    ctx.moveTo(-rx, top);
    ctx.lineTo(-rx, bottom);
    ctx.ellipse(0, bottom, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(rx, top);
    ctx.closePath();
    var g = ctx.createLinearGradient(-rx, 0, rx, 0);
    g.addColorStop(0, '#1d271f'); g.addColorStop(0.28, '#3e4f40'); g.addColorStop(0.55, '#2a382d'); g.addColorStop(1, '#19211b');
    ctx.fillStyle = g; ctx.fill(); ink(ctx);
    ctx.strokeStyle = 'rgba(140,170,130,0.35)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-20, top + 6); ctx.lineTo(-21, bottom + 8); ctx.moveTo(12, top + 8); ctx.lineTo(12, bottom + 10); ctx.stroke();
    // 内口
    ellipse(ctx, 0, top, rx, ry);
    ctx.fillStyle = '#26322a'; ctx.fill(); ink(ctx);
    // 鱼籽堆
    var pts = [];
    var rows = [[-6, [-26, -15, -4, 7, 18, 28]], [-13, [-21, -9, 3, 15, 25]], [-21, [-14, -2, 10, 20]], [-28, [-6, 6]]];
    rows.forEach(function (r) { r[1].forEach(function (x) { pts.push([x, r[0]]); }); });
    pts.forEach(function (p, i) {
      var rr = 6.4 + (i % 3) * 0.4;
      ellipse(ctx, p[0], p[1], rr, rr);
      var rg = ctx.createRadialGradient(p[0] - 2, p[1] - 2, 1, p[0], p[1], rr);
      rg.addColorStop(0, '#ffc07a'); rg.addColorStop(0.5, '#ff7f2e'); rg.addColorStop(1, '#e0561a');
      ctx.fillStyle = rg; ctx.fill();
      ctx.strokeStyle = 'rgba(150,50,10,0.75)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.ellipse(p[0] - 2.2, p[1] - 2.4, 1.8, 1.2, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,70,10,0.8)';
      ctx.beginPath(); ctx.arc(p[0] + 1.2, p[1] + 1.2, 1.1, 0, Math.PI * 2); ctx.fill();
    });
  }

  Art.SUSHI_DRAW = { salmon: drawSalmon, tuna: drawTuna, tamago: drawTamago, maki: drawMaki, ebi: drawEbi, ikura: drawIkura };

  // ---------------- 瓷盘 ----------------
  function drawPlate(ctx, rim) {
    var rx = 50, ry = 34;
    // 投影
    ctx.fillStyle = 'rgba(90,55,30,0.22)';
    ellipse(ctx, 0, 6, rx + 1, ry + 1); ctx.fill();
    // 盘底厚度
    ellipse(ctx, 0, 3, rx, ry);
    ctx.fillStyle = '#e8d6b8'; ctx.fill(); ink(ctx);
    // 盘面
    ellipse(ctx, 0, 0, rx, ry);
    var g = ctx.createRadialGradient(-12, -10, 4, 0, 0, rx);
    g.addColorStop(0, '#fffdf7'); g.addColorStop(1, '#f6ead3');
    ctx.fillStyle = g; ctx.fill(); ink(ctx);
    // 彩色边沿
    ctx.save();
    ellipse(ctx, 0, 0, rx - 1.5, ry - 1.5);
    ctx.ellipse(0, 1, rx - 10, ry - 8, 0, 0, Math.PI * 2, true);
    ctx.fillStyle = rim; ctx.fill('evenodd');
    ctx.restore();
    ellipse(ctx, 0, 1, rx - 10, ry - 8);
    ctx.strokeStyle = 'rgba(120,90,60,0.45)'; ctx.lineWidth = 1.6; ctx.stroke();
    // 边沿小纹
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * (rx - 5.5), Math.sin(a) * (ry - 4.5), 1.4, 0, Math.PI * 2); ctx.fill();
    }
    // 高光
    ctx.beginPath(); ctx.ellipse(0, 0, rx - 4, ry - 3, 0, Math.PI * 1.1, Math.PI * 1.45);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.4; ctx.stroke();
  }
  Art.drawPlate = drawPlate;

  // ---------------- 精灵缓存 ----------------
  var SPR_W = 136, SPR_H = 104, ORG_X = 68, ORG_Y = 64;
  var cache = {};
  Art.spriteRes = 3;
  Art.setResolution = function (pxPerUnit) {
    if (Math.abs(pxPerUnit - Art.spriteRes) > 0.05) { Art.spriteRes = pxPerUnit; cache = {}; }
  };
  function sprite(key, drawFn) {
    var c = cache[key];
    if (c) return c;
    var r = Art.spriteRes;
    c = Art.makeCanvas(SPR_W * r, SPR_H * r);
    var ctx = c.getContext('2d');
    ctx.scale(r, r); ctx.translate(ORG_X, ORG_Y);
    drawFn(ctx);
    cache[key] = c;
    return c;
  }
  Art.sushiSprite = function (type) { return sprite('s_' + type, Art.SUSHI_DRAW[type]); };
  Art.plateSprite = function (type) {
    var rim = (KS.SUSHI_TYPES[type] || {}).plate || '#e7c9a0';
    return sprite('p_' + type, function (ctx) { drawPlate(ctx, rim); });
  };
  Art.plainPlateSprite = function () { return sprite('p__', function (ctx) { drawPlate(ctx, '#e9d3ad'); }); };

  /** 在 (x,y) 以缩放 k（单位→逻辑像素）绘制精灵；sx/sy 为额外的挤压拉伸 */
  Art.drawSprite = function (ctx, spr, x, y, k, sx, sy, rot, alpha) {
    var w = SPR_W * k, h = SPR_H * k;
    ctx.save();
    // 以底部（单位 y=22）为挤压/旋转支点，落地弹跳更自然
    ctx.translate(x, y + 22 * k);
    if (rot) ctx.rotate(rot);
    ctx.scale(sx || 1, sy || 1);
    if (alpha != null && alpha < 1) ctx.globalAlpha *= alpha;
    ctx.drawImage(spr, -ORG_X * k, (-ORG_Y - 22) * k, w, h);
    ctx.restore();
  };
  Art.SPR = { W: SPR_W, H: SPR_H, OX: ORG_X, OY: ORG_Y };
})(globalThis.KS);
