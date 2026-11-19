/*
 * 纯逻辑游戏模型（无渲染、无 DOM），浏览器与 Node 测试共用。
 *
 * 每个寿司有唯一 id 和一个 loc（所在位置）：
 *   kitchen  厨房队列（出口→入口之间的不可见部分，排队等待重新上带）
 *   belt     传送带上（有弧长 s）
 *   held     被玩家手指拿着（若来自传送带，仍占着传送带上的空盘位）
 *   tray     托盘中（tray 下标 + slot 下标）
 *   buffer   暂存区（slot 下标）
 *   cleared  已消除
 * 不变量：各位置数量之和恒等于开局总数，且每个 id 只出现在一个容器中。
 */
(function (KS) {
  'use strict';

  var TRAY_COUNT = 3, TRAY_SIZE = 3, BUFFER_SIZE = 5;
  var CLEAR_DELAY = 0.62;   // 第三个寿司放入 → 真正消除 的时长（留给飞行和消除动画）

  function Model(level, path, opts) {
    opts = opts || {};
    this.level = level;
    this.path = path;
    this.L = path.length;
    var k = path.scale || 1;
    this.speed = level.speed * k;               // 关卡里的速度/间距以轨道空间计，这里换算成屏幕逻辑像素
    this.spacing = level.spacing * k;
    this.timeLimit = level.time;
    this.timeLeft = level.time;
    this.elapsed = 0;
    this.beltOffset = 0;                         // 传送带累计位移（用于画履带纹理）
    // 补货加速：传送带上寿司稀疏且厨房还有存货时，整条带子临时加速（所有盘子同速，间距不变）
    this.refillBoost = level.refillBoost != null ? level.refillBoost : 0.9;
    this.speedMul = 1;
    this.seed = opts.seed != null ? opts.seed : (Math.random() * 1e9) | 0;
    this.rng = KS.rng(this.seed);
    // 可拿取判定：默认整段可拿；浏览器里传入“是否在屏幕内”
    this.pickRange = opts.pickRange || { start: 0, end: this.L };

    var types = [];
    var self = this;
    Object.keys(level.sushi).forEach(function (type) {
      var n = level.sushi[type];
      if (n % 3 !== 0) throw new Error('关卡 ' + level.id + ' 的 ' + type + ' 数量 ' + n + ' 不是 3 的倍数');
      if (!KS.SUSHI_TYPES[type]) throw new Error('未知寿司类型: ' + type);
      for (var i = 0; i < n; i++) types.push(type);
    });
    this.rng.shuffle(types);
    this.sushi = types.map(function (type, id) {
      return { id: id, type: type, loc: 'kitchen', s: -1, tray: -1, slot: -1 };
    });
    this.total = this.sushi.length;
    this.typeTotals = {};
    types.forEach(function (t) { self.typeTotals[t] = (self.typeTotals[t] || 0) + 1; });

    this.belt = [];      // 按 s 从大到小（越靠近出口越靠前）
    this.kitchen = [];
    this.trays = [];
    for (var t = 0; t < TRAY_COUNT; t++) this.trays.push({ type: null, slots: [null, null, null], clearing: false, clearT: 0 });
    this.buffer = [];
    for (var b = 0; b < BUFFER_SIZE; b++) this.buffer.push(null);
    this.held = null;    // { id, from:'belt'|'buffer', index }
    this.clearedCount = 0;
    this.matches = 0;
    this.status = 'ready';   // ready → playing → (winning →) won | lost
    this.events = [];

    // 开局：从出口附近往入口方向铺满传送带，其余在厨房排队
    var s = Math.min(this.L - this.spacing * 0.6, this.pickRange.end - this.spacing * 0.3);
    for (var i2 = 0; i2 < this.total; i2++) {
      var sh = this.sushi[i2];
      if (s >= 0) { sh.loc = 'belt'; sh.s = s; this.belt.push(sh.id); s -= this.spacing; }
      else { this.kitchen.push(sh.id); }
    }
  }

  Model.TRAY_COUNT = TRAY_COUNT; Model.TRAY_SIZE = TRAY_SIZE; Model.BUFFER_SIZE = BUFFER_SIZE;
  Model.CLEAR_DELAY = CLEAR_DELAY;

  var P = Model.prototype;

  P.emit = function (ev) { this.events.push(ev); };
  P.drainEvents = function () { var e = this.events; this.events = []; return e; };

  P.start = function () { if (this.status === 'ready') { this.status = 'playing'; this.emit({ type: 'start' }); } };

  P.isActive = function () { return this.status === 'playing' || this.status === 'winning'; };

  P.update = function (dt) {
    if (!this.isActive()) return;
    this.elapsed += dt;
    // 1) 传送带前进（稀疏时补货加速）
    var cap = Math.max(1, Math.floor(this.L / this.spacing));
    var fill = this.belt.length / cap;
    var target = this.kitchen.length ? 1 + this.refillBoost * KS.clamp((0.6 - fill) / 0.45, 0, 1) : 1;
    this.speedMul += (target - this.speedMul) * Math.min(1, dt * 1.6);
    var ds = this.speed * this.speedMul * dt;
    this.beltOffset += ds;
    for (var i = 0; i < this.belt.length; i++) this.sushi[this.belt[i]].s += ds;
    // 2) 到达出口 → 回到厨房队尾（身份不变、数量不变）
    while (this.belt.length && this.sushi[this.belt[0]].s >= this.L) {
      var id = this.belt.shift();
      var sh = this.sushi[id];
      if (sh.loc === 'held') {
        sh.s = -1;  // 手里拿着的寿司，空盘已被带走；若取消则回厨房
      } else {
        sh.loc = 'kitchen'; sh.s = -1;
        this.kitchen.push(id);
        this.emit({ type: 'exit', id: id });
      }
    }
    // 3) 入口有空位 → 厨房队首重新上带
    while (this.kitchen.length) {
      var minS = this.belt.length ? this.sushi[this.belt[this.belt.length - 1]].s : Infinity;
      if (minS < this.spacing) break;
      var nid = this.kitchen.shift();
      var ns = this.sushi[nid];
      ns.loc = 'belt';
      ns.s = this.belt.length ? KS.clamp(minS - this.spacing, 0, 4) : 0;
      this.belt.push(nid);
      this.emit({ type: 'spawn', id: nid });
    }
    // 4) 托盘消除计时
    for (var t = 0; t < this.trays.length; t++) {
      var tr = this.trays[t];
      if (!tr.clearing) continue;
      tr.clearT += dt;
      if (tr.clearT >= CLEAR_DELAY) {
        var ids = tr.slots.slice();
        for (var k = 0; k < ids.length; k++) {
          var c = this.sushi[ids[k]];
          c.loc = 'cleared'; c.tray = -1; c.slot = -1;
        }
        this.clearedCount += ids.length;
        this.matches++;
        this.emit({ type: 'cleared', tray: t, sushiType: tr.type, ids: ids });
        tr.type = null; tr.slots = [null, null, null]; tr.clearing = false; tr.clearT = 0;
        if (this.clearedCount === this.total) { this.status = 'won'; this.emit({ type: 'win' }); }
      }
    }
    // 5) 计时（收尾动画阶段冻结）
    if (this.status === 'playing') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        if (this.held) this.cancelHeld();
        this.status = 'lost';
        this.emit({ type: 'lose' });
      }
    }
  };

  // ---------- 查询 ----------

  P.isPickableOnBelt = function (id) {
    var sh = this.sushi[id];
    return sh.loc === 'belt' && sh.s >= this.pickRange.start && sh.s <= this.pickRange.end;
  };

  P.trayAccepts = function (t, type) {
    var tr = this.trays[t];
    if (tr.clearing) return 'clearing';
    if (tr.slots.indexOf(null) < 0) return 'full';
    if (tr.type !== null && tr.type !== type) return 'type';
    return 'ok';
  };

  P.freeBufferSlot = function () { return this.buffer.indexOf(null); };

  /** 自动选择目标托盘：同类型未满 > 空托盘 */
  P.autoTray = function (type) {
    for (var t = 0; t < this.trays.length; t++) {
      if (this.trays[t].type === type && this.trayAccepts(t, type) === 'ok') return t;
    }
    for (var u = 0; u < this.trays.length; u++) {
      if (this.trays[u].type === null && this.trayAccepts(u, type) === 'ok') return u;
    }
    return -1;
  };

  // ---------- 操作 ----------

  /** 拿起：来自传送带或暂存区。返回是否成功 */
  P.pick = function (id) {
    if (this.status !== 'playing' || this.held) return false;
    var sh = this.sushi[id];
    if (sh.loc === 'belt') {
      if (!this.isPickableOnBelt(id)) return false;
      sh.loc = 'held';           // 仍留在 belt 数组里占位（空盘继续走）
      this.held = { id: id, from: 'belt', index: -1 };
    } else if (sh.loc === 'buffer') {
      this.buffer[sh.slot] = null;
      this.held = { id: id, from: 'buffer', index: sh.slot };
      sh.loc = 'held'; sh.slot = -1;
    } else return false;
    this.emit({ type: 'pick', id: id, from: this.held.from });
    return true;
  };

  /** 把手里的寿司从原来源中移除（成功放置时调用） */
  P._detachHeld = function () {
    var h = this.held, sh = this.sushi[h.id];
    if (h.from === 'belt' && sh.s >= 0) {
      var i = this.belt.indexOf(h.id);
      if (i >= 0) this.belt.splice(i, 1);
    }
    sh.s = -1;
    this.held = null;
    return sh;
  };

  P._putTray = function (sh, t) {
    var tr = this.trays[t];
    var slot = tr.slots.indexOf(null);
    tr.slots[slot] = sh.id;
    tr.type = sh.type;
    sh.loc = 'tray'; sh.tray = t; sh.slot = slot;
    this.emit({ type: 'place', id: sh.id, to: 'tray', tray: t, slot: slot });
    if (tr.slots.indexOf(null) < 0) {
      tr.clearing = true; tr.clearT = 0;
      this.emit({ type: 'match', tray: t, sushiType: tr.type });
      // 场上已无任何未处理寿司 → 收尾阶段，冻结计时
      var pending = 0;
      for (var i = 0; i < this.sushi.length; i++) {
        var l = this.sushi[i].loc;
        if (l === 'cleared') continue;
        if (l === 'tray' && this.trays[this.sushi[i].tray].clearing) continue;
        pending++;
      }
      if (pending === 0 && this.status === 'playing') this.status = 'winning';
    }
  };

  P._putBuffer = function (sh, b) {
    this.buffer[b] = sh.id;
    sh.loc = 'buffer'; sh.slot = b; sh.tray = -1;
    this.emit({ type: 'place', id: sh.id, to: 'buffer', slot: b });
  };

  /**
   * 放下手里的寿司
   * target: {kind:'tray', index} | {kind:'buffer', index?} | null(取消)
   * 返回 {ok, reason?}
   */
  P.drop = function (target) {
    if (!this.held) return { ok: false, reason: 'none' };
    var sh = this.sushi[this.held.id];
    if (!target) { this.cancelHeld(); return { ok: false, reason: 'cancel' }; }
    if (target.kind === 'tray') {
      var why = this.trayAccepts(target.index, sh.type);
      if (why !== 'ok') {
        this.emit({ type: 'reject', id: sh.id, tray: target.index, reason: 'tray-' + why });
        this.cancelHeld();
        return { ok: false, reason: 'tray-' + why };
      }
      this._detachHeld();
      this._putTray(sh, target.index);
      return { ok: true };
    }
    if (target.kind === 'buffer') {
      var b = target.index;
      if (b == null || b < 0 || this.buffer[b] !== null) b = this.nearestFreeBuffer(target.index);
      if (b < 0) {
        this.emit({ type: 'reject', id: sh.id, reason: 'buffer-full' });
        this.cancelHeld();
        return { ok: false, reason: 'buffer-full' };
      }
      this._detachHeld();
      this._putBuffer(sh, b);
      return { ok: true };
    }
    this.cancelHeld();
    return { ok: false, reason: 'cancel' };
  };

  P.nearestFreeBuffer = function (pref) {
    if (pref == null || pref < 0) return this.freeBufferSlot();
    var best = -1, bd = 99;
    for (var i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i] === null && Math.abs(i - pref) < bd) { bd = Math.abs(i - pref); best = i; }
    }
    return best;
  };

  /** 轻点：自动放置。传送带寿司：同类托盘 > 空托盘 > 暂存区；暂存区寿司：同类托盘 > 空托盘 */
  P.autoPlaceHeld = function () {
    if (!this.held) return { ok: false, reason: 'none' };
    var sh = this.sushi[this.held.id];
    var t = this.autoTray(sh.type);
    if (t >= 0) return this.drop({ kind: 'tray', index: t });
    if (this.held.from === 'belt') {
      if (this.freeBufferSlot() >= 0) return this.drop({ kind: 'buffer' });
      this.emit({ type: 'reject', id: sh.id, reason: 'all-full' });
      this.cancelHeld();
      return { ok: false, reason: 'all-full' };
    }
    this.emit({ type: 'reject', id: sh.id, reason: 'no-tray' });
    this.cancelHeld();
    return { ok: false, reason: 'no-tray' };
  };

  /** 取消：回到原处（传送带空盘还在 → 回盘；空盘已离开 → 回厨房排队；暂存区 → 回原格） */
  P.cancelHeld = function () {
    if (!this.held) return;
    var h = this.held, sh = this.sushi[h.id];
    this.held = null;
    if (h.from === 'belt') {
      if (sh.s >= 0 && this.belt.indexOf(sh.id) >= 0) { sh.loc = 'belt'; }
      else { sh.loc = 'kitchen'; sh.s = -1; this.kitchen.push(sh.id); }
    } else {
      var b = this.buffer[h.index] === null ? h.index : this.freeBufferSlot();
      if (b >= 0) { this.buffer[b] = sh.id; sh.loc = 'buffer'; sh.slot = b; }
      else { sh.loc = 'kitchen'; sh.s = -1; this.kitchen.push(sh.id); }
    }
    this.emit({ type: 'return', id: sh.id });
  };

  /** 便捷：轻点某个寿司 = 拿起 + 自动放置 */
  P.tap = function (id) {
    if (!this.pick(id)) return { ok: false, reason: 'cannot-pick' };
    return this.autoPlaceHeld();
  };

  // ---------- 统计与不变量 ----------

  P.counts = function () {
    var c = { kitchen: 0, belt: 0, held: 0, tray: 0, buffer: 0, cleared: 0 };
    for (var i = 0; i < this.sushi.length; i++) c[this.sushi[i].loc]++;
    c.total = this.total;
    c.remaining = this.total - c.cleared;
    return c;
  };

  /** 返回违反不变量的描述数组（空数组 = 一切正常） */
  P.checkInvariants = function () {
    var err = [];
    var self = this;
    var seen = {};
    function mark(id, where) {
      if (id === null) return;
      if (seen[id] !== undefined) err.push('寿司 #' + id + ' 同时出现在 ' + seen[id] + ' 和 ' + where);
      seen[id] = where;
    }
    var lastS = Infinity;
    this.belt.forEach(function (id, i) {
      mark(id, 'belt');
      var sh = self.sushi[id];
      if (sh.loc !== 'belt' && sh.loc !== 'held') err.push('belt 中的 #' + id + ' loc=' + sh.loc);
      if (sh.s < 0 || sh.s >= self.L + 1e-6) err.push('#' + id + ' s 越界 ' + sh.s);
      if (i > 0 && lastS - sh.s < self.spacing - 1e-3) err.push('传送带上 #' + id + ' 与前一个重叠 (间距 ' + (lastS - sh.s).toFixed(2) + ')');
      lastS = sh.s;
    });
    this.kitchen.forEach(function (id) { mark(id, 'kitchen'); if (self.sushi[id].loc !== 'kitchen') err.push('kitchen 中 #' + id + ' loc=' + self.sushi[id].loc); });
    this.trays.forEach(function (tr, t) {
      var n = 0;
      tr.slots.forEach(function (id, s) {
        if (id === null) return;
        n++;
        mark(id, 'tray' + t);
        var sh = self.sushi[id];
        if (sh.loc !== 'tray' || sh.tray !== t || sh.slot !== s) err.push('托盘 ' + t + ' 槽 ' + s + ' 的 #' + id + ' 状态不一致');
        if (sh.type !== tr.type) err.push('托盘 ' + t + ' 混入了不同种类');
      });
      if (n === 0 && tr.type !== null) err.push('空托盘 ' + t + ' 仍锁定类型');
      if (tr.clearing && n !== 3) err.push('托盘 ' + t + ' 消除中但不足 3 个');
    });
    this.buffer.forEach(function (id, b) {
      if (id === null) return;
      mark(id, 'buffer');
      var sh = self.sushi[id];
      if (sh.loc !== 'buffer' || sh.slot !== b) err.push('暂存区 ' + b + ' 的 #' + id + ' 状态不一致');
    });
    if (this.held) {
      var hs = this.sushi[this.held.id];
      if (hs.loc !== 'held') err.push('held 状态不一致');
      if (!(this.held.from === 'belt' && seen[this.held.id] === 'belt')) mark(this.held.id, 'held');
    }
    var c = this.counts();
    if (c.kitchen + c.belt + c.held + c.tray + c.buffer + c.cleared !== this.total) err.push('数量守恒失败');
    if (c.held !== (this.held ? 1 : 0)) err.push('held 计数不一致');
    if (c.cleared !== this.clearedCount) err.push('已消除计数不一致');
    if (c.kitchen !== this.kitchen.length) err.push('厨房计数不一致');
    var beltHeld = this.held && this.held.from === 'belt' && this.belt.indexOf(this.held.id) >= 0 ? 1 : 0;
    if (c.belt + beltHeld !== this.belt.length) err.push('传送带计数不一致');
    // 每种寿司的总数不变，已消除的每种都是 3 的倍数
    var perType = {}, clearedType = {};
    this.sushi.forEach(function (sh) {
      perType[sh.type] = (perType[sh.type] || 0) + 1;
      if (sh.loc === 'cleared') clearedType[sh.type] = (clearedType[sh.type] || 0) + 1;
    });
    Object.keys(this.typeTotals).forEach(function (t) {
      if (perType[t] !== self.typeTotals[t]) err.push(t + ' 总数变化');
      if ((clearedType[t] || 0) % 3 !== 0) err.push(t + ' 已消除数不是 3 的倍数');
    });
    for (var id = 0; id < this.total; id++) {
      var l = this.sushi[id].loc;
      if (l !== 'cleared' && seen[id] === undefined) err.push('寿司 #' + id + ' 丢失（loc=' + l + '）');
    }
    return err;
  };

  KS.Model = Model;
})(globalThis.KS);
