/*
 * 存档：每张地图的最佳星级 / 最佳用时、新手教学是否看过。全部经 KS.Platform 读写。
 *
 * 键名（主线与自由地图隔离）：
 *   ks2_best_<mapKey>   最佳星级 1..3      mapKey = main-1 / main-2 / main-3 / free-u / free-z / free-double
 *   ks2_time_<mapKey>   最佳用时（秒，保留 1 位小数）
 *   ks2_tutorial        '1' = 第 1 关教学已看过
 *   ks2_migrated        '1' = V1 旧记录已迁移
 *
 * V1 旧键 ks_best_1/2/3 不删除；按“同一条轨道”一次性迁移到 V2：
 *   V1 第1关（直线）→ main-1；V1 第3关（S 型）→ main-2；V1 第2关（U 型）→ free-u。
 */
(function (KS) {
  'use strict';
  var P = KS.Platform;
  var Progress = KS.Progress = {
    stars: {}, times: {}, tutorialDone: false,
    available: null,       // null=未知 true/false=存储是否可用
    lastSaveOk: true,
    onChange: null,
    LEGACY: { '1': 'main-1', '3': 'main-2', '2': 'free-u' }
  };

  Progress.starKey = function (mapKey) { return 'ks2_best_' + mapKey; };
  Progress.timeKey = function (mapKey) { return 'ks2_time_' + mapKey; };

  function changed() { if (typeof Progress.onChange === 'function') Progress.onChange(); }

  /** 读入所有地图的记录；返回 Promise（测试可等待） */
  Progress.load = function (mapKeys) {
    var self = this;
    return P.storageAvailable().then(function (ok) {
      self.available = ok;
      if (!ok) { changed(); return; }
      return self.migrate().then(function () {
        var jobs = mapKeys.map(function (k) {
          return Promise.all([P.get(self.starKey(k)), P.get(self.timeKey(k))]).then(function (r) {
            var s = parseInt(r[0], 10) || 0, t = parseFloat(r[1]) || 0;
            if (s > (self.stars[k] || 0)) self.stars[k] = Math.min(3, s);
            if (t > 0 && (!self.times[k] || t < self.times[k])) self.times[k] = t;
          });
        });
        jobs.push(P.get('ks2_tutorial').then(function (v) { if (v === '1') self.tutorialDone = true; }));
        return Promise.all(jobs);
      }).then(changed);
    });
  };

  /** V1 → V2 一次性迁移（只增不减，旧键保留） */
  Progress.migrate = function () {
    var self = this;
    return P.get('ks2_migrated').then(function (done) {
      if (done === '1') return;
      var ids = Object.keys(self.LEGACY);
      return Promise.all(ids.map(function (id) {
        var oldKey = 'ks_best_' + id, target = self.LEGACY[id];
        return P.get(oldKey).then(function (v) {
          // 容器 Storage 中没有时，读一次 V1 在低版本客户端写入的浏览器存储（仅迁移用途）
          if (v === null && P.inContainer()) v = P.legacyBrowserValue(oldKey);
          var s = Math.min(3, parseInt(v, 10) || 0);
          if (!s) return;
          return P.get(self.starKey(target)).then(function (cur) {
            if (s > (parseInt(cur, 10) || 0)) return P.set(self.starKey(target), String(s));
          });
        });
      })).then(function () { return P.set('ks2_migrated', '1'); });
    });
  };

  /** 记录一局成绩（只保存更好的）；返回 Promise<是否成功写入> */
  Progress.record = function (mapKey, stars, seconds) {
    var self = this, writes = [];
    var t = Math.round(seconds * 10) / 10;
    if (stars > (this.stars[mapKey] || 0)) {
      this.stars[mapKey] = stars;
      writes.push(P.set(this.starKey(mapKey), String(stars)));
    }
    if (stars > 0 && (!this.times[mapKey] || t < this.times[mapKey])) {
      this.times[mapKey] = t;
      writes.push(P.set(this.timeKey(mapKey), String(t)));
    }
    changed();
    return Promise.all(writes).then(function (res) {
      var ok = res.every(function (x) { return x; });
      self.lastSaveOk = ok;
      return ok;
    });
  };

  Progress.markTutorial = function () {
    if (this.tutorialDone) return Promise.resolve(true);
    this.tutorialDone = true;
    return P.set('ks2_tutorial', '1');
  };
})(globalThis.KS);
