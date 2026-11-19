/*
 * 轨道路径系统（与关卡、坐标、屏幕尺寸无关的通用实现）
 *
 * 关卡里写的是“轨道空间”(TRACK_SPACE: 390×360) 下的控制点，
 * 运行时根据传送带区域的实际矩形做等比映射，然后：
 *   - polyline：折线 + 圆角(圆弧过渡)，适合直线 / U 形 / S 形 / 多段折返
 *   - smooth  ：Catmull-Rom 曲线，适合任意蛇形弯曲
 * 最终统一重采样为“每 1 个逻辑像素一个点”的弧长参数化表，
 * 寿司只需要一个弧长参数 s ∈ [0, length) 就能得到位置与切线方向。
 */
(function (KS) {
  'use strict';

  KS.TRACK_SPACE = { w: 390, h: 360 };

  function Path(xs, ys, length, step) {
    this.xs = xs; this.ys = ys; this.length = length; this.step = step;
    this.n = xs.length;
  }

  /** 返回弧长 s 处的位置与切线（单位向量） */
  Path.prototype.at = function (s, out) {
    out = out || {};
    var step = this.step, n = this.n;
    var f = s / step;
    if (f < 0) f = 0;
    if (f > n - 1.0001) f = n - 1.0001;
    var i = Math.floor(f), t = f - i;
    var x0 = this.xs[i], y0 = this.ys[i], x1 = this.xs[i + 1], y1 = this.ys[i + 1];
    out.x = x0 + (x1 - x0) * t;
    out.y = y0 + (y1 - y0) * t;
    // 切线取前后两点，稍微平滑一点
    var a = Math.max(0, i - 1), b = Math.min(n - 1, i + 2);
    var dx = this.xs[b] - this.xs[a], dy = this.ys[b] - this.ys[a];
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    out.tx = dx / d; out.ty = dy / d;
    return out;
  };

  /** 包围盒 */
  Path.prototype.bounds = function () {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < this.n; i++) {
      var x = this.xs[i], y = this.ys[i];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  /** 找到路径在矩形内的第一段/最后一段弧长（用于计算可拿取范围、出入口门帘位置） */
  Path.prototype.visibleRange = function (rect, margin) {
    margin = margin || 0;
    var first = -1, last = -1;
    for (var i = 0; i < this.n; i++) {
      var x = this.xs[i], y = this.ys[i];
      var inside = x >= rect.x + margin && x <= rect.x + rect.w - margin &&
                   y >= rect.y + margin && y <= rect.y + rect.h - margin;
      if (inside) { if (first < 0) first = i; last = i; }
    }
    if (first < 0) return null;
    return { start: first * this.step, end: last * this.step };
  };

  // ---------- 构建 ----------

  /** 把一串稠密点按弧长等距重采样 */
  function resample(raw, step) {
    var cum = [0];
    for (var i = 1; i < raw.length; i++) {
      var dx = raw[i][0] - raw[i - 1][0], dy = raw[i][1] - raw[i - 1][1];
      cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    var total = cum[cum.length - 1];
    var n = Math.max(2, Math.floor(total / step) + 1);
    var xs = new Float32Array(n), ys = new Float32Array(n);
    var j = 0;
    for (var k = 0; k < n; k++) {
      var s = k * step;
      while (j < cum.length - 2 && cum[j + 1] < s) j++;
      var seg = cum[j + 1] - cum[j] || 1;
      var t = KS.clamp((s - cum[j]) / seg, 0, 1);
      xs[k] = raw[j][0] + (raw[j + 1][0] - raw[j][0]) * t;
      ys[k] = raw[j][1] + (raw[j + 1][1] - raw[j][1]) * t;
    }
    return new Path(xs, ys, (n - 1) * step, step);
  }

  /** 折线 + 圆角。radius 可以是数字或与点等长的数组（每个拐点单独半径） */
  function filletPolyline(pts, radius) {
    var out = [pts[0].slice()];
    var n = pts.length;
    // 每条边可用于圆角的长度：两端都有拐点时各占一半
    var segLen = [];
    for (var i = 0; i < n - 1; i++) {
      segLen.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
    }
    for (var v = 1; v < n - 1; v++) {
      var P = pts[v], A = pts[v - 1], B = pts[v + 1];
      var l1 = segLen[v - 1], l2 = segLen[v];
      var d1x = (P[0] - A[0]) / l1, d1y = (P[1] - A[1]) / l1;
      var d2x = (B[0] - P[0]) / l2, d2y = (B[1] - P[1]) / l2;
      var dot = KS.clamp(d1x * d2x + d1y * d2y, -1, 1);
      var theta = Math.acos(dot);
      var r = Array.isArray(radius) ? radius[v] : radius;
      if (theta < 1e-3 || !r) { out.push(P.slice()); continue; }
      var tan = Math.tan(theta / 2);
      var t = r * tan;
      var max1 = v - 1 === 0 ? l1 : l1 / 2;
      var max2 = v + 1 === n - 1 ? l2 : l2 / 2;
      t = Math.min(t, max1, max2);
      var rr = t / tan;
      var sx = P[0] - d1x * t, sy = P[1] - d1y * t;
      var cross = d1x * d2y - d1y * d2x;
      var nx = cross > 0 ? -d1y : d1y, ny = cross > 0 ? d1x : -d1x;
      var cx = sx + nx * rr, cy = sy + ny * rr;
      var a0 = Math.atan2(sy - cy, sx - cx);
      var sweep = cross > 0 ? theta : -theta;
      var steps = Math.max(4, Math.ceil(Math.abs(sweep) * rr / 2));
      for (var k = 0; k <= steps; k++) {
        var a = a0 + sweep * (k / steps);
        out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }

  /** Catmull-Rom（均匀）曲线采样 */
  function catmull(pts) {
    var out = [];
    var n = pts.length;
    for (var i = 0; i < n - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      var len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      var steps = Math.max(6, Math.ceil(len / 2));
      for (var k = 0; k < steps; k++) {
        var t = k / steps, t2 = t * t, t3 = t2 * t;
        var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }

  /**
   * 计算轨道空间 → 屏幕逻辑坐标的映射（等比缩放、居中）
   * rect: 传送带区域 {x,y,w,h}
   */
  Path.mapping = function (rect) {
    var TS = KS.TRACK_SPACE;
    var scale = Math.min(rect.w / TS.w, rect.h / TS.h, 1.15);
    return {
      scale: scale,
      cx: rect.x + rect.w / 2, cy: rect.y + rect.h / 2,
      map: function (p) {
        return [this.cx + (p[0] - TS.w / 2) * scale, this.cy + (p[1] - TS.h / 2) * scale];
      }
    };
  };

  /**
   * 从关卡 track 配置构建路径
   * track = { type:'polyline'|'smooth', points:[[x,y],...], radius }
   * 多段轨道可以用 segments:[{type,points,radius}, ...]，会按顺序首尾相接
   */
  Path.fromTrack = function (track, rect) {
    var m = Path.mapping(rect);
    var parts = track.segments || [track];
    var raw = [];
    parts.forEach(function (seg) {
      var pts = seg.points.map(function (p) { return m.map(p); });
      var r = (seg.radius != null ? seg.radius : 0);
      r = Array.isArray(r) ? r.map(function (x) { return x * m.scale; }) : r * m.scale;
      var dense = (seg.type === 'smooth') ? catmull(pts) : filletPolyline(pts, r);
      if (raw.length) dense.shift();
      raw = raw.concat(dense);
    });
    var path = resample(raw, 1);
    path.scale = m.scale;
    return path;
  };

  /** 闭合环形（菜单装饰用）：圆角矩形 */
  Path.roundedLoop = function (cx, cy, w, h, r) {
    var x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
    var pts = [[x0 + r, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0], [x0 + r + 0.01, y0]];
    var dense = filletPolyline(pts, r);
    var p = resample(dense, 1);
    p.closed = true;
    return p;
  };

  KS.Path = Path;
})(globalThis.KS);
