/*
 * 小红书小工具端能力适配。
 * 以小工具在线文档（2026-11-13 版，§3.6/§3.7/§3.11/§3.13）为契约：
 *   - Storage：客户端 9.46+（buildVersion ≥ 9460）使用 xhs.miniTool.getStorage/setStorage；
 *     在小红书容器内但版本不足 / 版本未知 / 方法缺失时，存储能力不可用，**不回退到浏览器存储**。
 *   - getWindowInfo：9.49+。
 *   - vibrateShort({type})：9.50+。
 * 仅在普通浏览器（没有注入 window.xhs）里，为了本地 H5 预览，才使用 localStorage / navigator.vibrate。
 * V1 基线在“容器内低版本”时会回退 localStorage，V2 按在线文档改为不回退（见 制作说明-v2.md）。
 */
(function (KS) {
  'use strict';
  var Platform = KS.Platform = {};
  var versionPromise = null;
  var STORAGE_MIN = 9460, WINDOW_MIN = 9490, VIBRATE_MIN = 9500;

  function bridge() {
    var xhs = window.xhs;
    return xhs && xhs.miniTool;
  }

  /** 是否运行在小红书容器内（注入了 window.xhs） */
  Platform.inContainer = function () { return !!window.xhs; };

  function extractVersion(options) {
    var env = options && options.miniToolEnv;
    var value = Number(env && env.buildVersion) || 0;
    // 末三位是构建号：9533001 → 9533
    return Math.floor(value / 1000);
  }

  Platform.clientVersion = function () {
    if (versionPromise) return versionPromise;
    var xhs = window.xhs;
    var syncVersion = extractVersion(xhs && xhs.launchOptions);
    if (syncVersion) return versionPromise = Promise.resolve(syncVersion);
    var mt = bridge();
    if (!mt || typeof mt.getLaunchOptions !== 'function') return versionPromise = Promise.resolve(0);
    try {
      versionPromise = Promise.resolve(mt.getLaunchOptions()).then(function (options) {
        return extractVersion(options);
      }, function () { return 0; });
    } catch (e) {
      versionPromise = Promise.resolve(0);
    }
    return versionPromise;
  };

  Platform.storageBridge = function () {
    return this.clientVersion().then(function (v) {
      var mt = bridge();
      return v >= STORAGE_MIN && mt && typeof mt.getStorage === 'function' &&
        typeof mt.setStorage === 'function' ? mt : null;
    });
  };

  /** 存储是否可用：容器内需满足版本；普通浏览器视 localStorage 而定 */
  Platform.storageAvailable = function () {
    return this.storageBridge().then(function (mt) {
      if (mt) return true;
      if (Platform.inContainer()) return false;
      try { return typeof localStorage !== 'undefined' && localStorage !== null; } catch (e) { return false; }
    });
  };

  function browserGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function browserSet(key, data) { try { localStorage.setItem(key, data); return true; } catch (e) { return false; } }

  Platform.get = function (key) {
    return this.storageBridge().then(function (mt) {
      if (mt) {
        return Promise.resolve(mt.getStorage({ key: key })).then(function (res) {
          return res && typeof res.data === 'string' && res.data !== '' ? res.data : null;
        }, function () { return null; });
      }
      if (Platform.inContainer()) return null;   // 容器内存储不可用：不读浏览器存储
      return browserGet(key);
    });
  };

  Platform.set = function (key, value) {
    var data = String(value);
    return this.storageBridge().then(function (mt) {
      if (mt) {
        return Promise.resolve(mt.setStorage({ key: key, data: data })).then(function (res) {
          return !!res && res.errMsg === 'setStorage:ok';
        }, function () { return false; });
      }
      if (Platform.inContainer()) return false;  // 调用方据此提示“成绩无法保存”
      return browserSet(key, data);
    });
  };

  /**
   * 一次性迁移：读取旧版遗留在浏览器存储里的值（V1 在低版本容器里曾写入 localStorage）。
   * 只在容器 Storage 可用时调用；读取后不再读写浏览器存储。
   */
  Platform.legacyBrowserValue = function (key) {
    return browserGet(key);
  };

  Platform.windowInfo = function () {
    return this.clientVersion().then(function (v) {
      var mt = bridge();
      if (v < WINDOW_MIN || !mt || typeof mt.getWindowInfo !== 'function') return null;
      return Promise.resolve(mt.getWindowInfo()).then(function (info) { return info; }, function () { return null; });
    });
  };

  /** 轻震动反馈：容器内用 vibrateShort（9.50+），浏览器预览用 navigator.vibrate；都不可用时静默 */
  Platform.vibrate = function () {
    return this.clientVersion().then(function (v) {
      var mt = bridge();
      if (mt) {
        if (v >= VIBRATE_MIN && typeof mt.vibrateShort === 'function') {
          try {
            return Promise.resolve(mt.vibrateShort({ type: 'light' })).then(function () { return true; }, function () { return false; });
          } catch (e) { return false; }
        }
        return false;
      }
      if (!Platform.inContainer() && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { return !!navigator.vibrate(25); } catch (e) { return false; }
      }
      return false;
    });
  };
})(globalThis.KS);
