/*
 * 竖屏布局（纯计算，可在 Node 中测试）。
 * 逻辑宽度固定 390；逻辑高度随屏幕比例变化（680~940），多出来的高度全部给传送带。
 * 托盘尺寸是设定图的约 75%（设定图托盘约占屏宽 86%，这里 262/390 ≈ 67%，高度同比缩小）。
 */
(function (KS) {
  'use strict';
  var W = 390, MIN_H = 680, MAX_H = 940;

  KS.Layout = {
    W: W, MIN_H: MIN_H, MAX_H: MAX_H,
    TRAY_W: 262, TRAY_H: 52, TRAY_PITCH: 66, SLOT_GAP: 78,
    BUFFER_W: 360, BUFFER_H: 74, BUFFER_SLOT_GAP: 66,

    /**
     * viewW/viewH：CSS 像素视口；safeTop/safeBottom：安全区（CSS 像素）
     */
    compute: function (viewW, viewH, safeTop, safeBottom) {
      // 先按紧凑布局计算；若传送带区域远大于轨道设计高度，把富余高度分给托盘区间距（热区更大、更不易误触）
      var L = this._compute(viewW, viewH, safeTop, safeBottom, 0);
      var spare = L.conveyor.h - 372;
      if (spare > 4) L = this._compute(viewW, viewH, safeTop, safeBottom, Math.min(spare / 0.9, 90));
      return L;
    },

    _compute: function (viewW, viewH, safeTop, safeBottom, extra) {
      safeTop = safeTop || 0; safeBottom = safeBottom || 0;
      var scale = viewW / W;
      var H = viewH / scale;
      if (H < MIN_H) { H = MIN_H; scale = viewH / MIN_H; }
      if (H > MAX_H) { H = MAX_H; }
      var offX = (viewW - W * scale) / 2;
      var offY = (viewH - H * scale) / 2;
      var top = safeTop / scale;
      var bottomPad = Math.max(10, safeBottom / scale + 6) + extra * 0.12;
      var pitch = this.TRAY_PITCH + extra * 0.2, gapTB = 24 + extra * 0.16;

      var L = { W: W, H: H, scale: scale, offX: offX, offY: offY, top: top };
      L.hud = { x: 0, y: top, w: W, h: 90 };
      L.btnRestart = { x: 14, y: top + 10, w: 46, h: 46 };
      L.btnSound = { x: W - 60, y: top + 10, w: 46, h: 46 };
      L.title = { x: W / 2, y: top + 33 };
      L.bar = { x: 96, y: top + 68, w: 206, h: 16 };
      L.clockPill = { x: 14, y: top + 62, w: 74, h: 28 };
      L.countPill = { x: 310, y: top + 62, w: 66, h: 28 };

      var by = H - bottomPad - this.BUFFER_H;
      L.buffer = { x: (W - this.BUFFER_W) / 2, y: by, w: this.BUFFER_W, h: this.BUFFER_H };
      L.bufferLabel = { x: W / 2, y: by - 2 };
      L.bufferSlots = [];
      for (var i = 0; i < 5; i++) {
        var cx = W / 2 + (i - 2) * this.BUFFER_SLOT_GAP;
        L.bufferSlots.push({ cx: cx, cy: by + this.BUFFER_H / 2 + 4, x: cx - 31, y: by + 4, w: 62, h: this.BUFFER_H - 6 });
      }
      L.trays = [];
      for (var t = 0; t < 3; t++) {
        var cy = by - gapTB - 34 - (2 - t) * pitch;
        var tr = { cx: W / 2, cy: cy, x: W / 2 - this.TRAY_W / 2, y: cy - this.TRAY_H / 2, w: this.TRAY_W, h: this.TRAY_H, slots: [] };
        for (var s = 0; s < 3; s++) tr.slots.push({ x: W / 2 + (s - 1) * this.SLOT_GAP, y: cy - 2 });
        // 拖放热区：比托盘本体略大，但相邻托盘热区不重叠
        tr.hit = { x: tr.x - 14, y: cy - pitch / 2, w: this.TRAY_W + 28, h: pitch };
        L.trays.push(tr);
      }
      L.woodTop = L.trays[0].y - 20 - extra * 0.22;
      L.conveyor = { x: 0, y: top + 92, w: W, h: L.woodTop - 6 - (top + 92) };
      L.bufferHit = { x: L.buffer.x - 10, y: L.buffer.y - 16, w: L.buffer.w + 20, h: L.buffer.h + 16 + bottomPad };
      return L;
    }
  };
})(globalThis.KS);
