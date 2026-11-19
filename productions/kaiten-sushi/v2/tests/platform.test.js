/*
 * 小红书端能力兼容测试：Node VM 模拟 Chrome 61 无 globalThis 的环境（node tests/platform.test.js）。
 * V2 按小工具在线文档（2026-11-13，§3.7）调整：容器内版本 < 9460 / 版本未知 / 方法缺失时
 * 存储不可用、不回退浏览器存储；只有普通浏览器（无 window.xhs）预览才用 localStorage。
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '../src');
const ns = fs.readFileSync(path.join(root, 'core/ns.js'), 'utf8');
const platform = fs.readFileSync(path.join(root, 'game/platform.js'), 'utf8');

function env(buildVersion, native, opts = {}) {
  let fallbackWrites = 0, fallbackReads = 0, vibrated = 0;
  const values = Object.assign({ sample: 'browser-value' }, opts.local || {});
  const scope = {
    console, Promise,
    localStorage: {
      getItem(key) { fallbackReads++; return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
      setItem(key, value) { fallbackWrites++; values[key] = value; }
    },
    navigator: { vibrate() { vibrated++; return true; } }
  };
  scope.window = scope;
  if (native) scope.xhs = { launchOptions: { miniToolEnv: { buildVersion } }, miniTool: native };
  vm.createContext(scope);
  vm.runInContext('delete globalThis', scope);
  assert.strictEqual(vm.runInContext('typeof globalThis', scope), 'undefined');
  vm.runInContext(ns, scope);
  assert.strictEqual(vm.runInContext('typeof globalThis', scope), 'object');
  vm.runInContext(platform, scope);
  for (const f of opts.extra || []) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), scope);
  return { scope, api: scope.KS.Platform, values, writes: () => fallbackWrites, reads: () => fallbackReads, vibrated: () => vibrated };
}
module.exports = { env };

async function run() {
  const calls = [];
  const store = {};
  const native = {
    getStorage({ key }) { calls.push('get:' + key); return Promise.resolve({ data: store[key] !== undefined ? store[key] : 'native-value' }); },
    setStorage({ key, data }) { calls.push('set:' + key + ':' + data); store[key] = data; return Promise.resolve({ errMsg: 'setStorage:ok' }); },
    getWindowInfo() { calls.push('window'); return Promise.resolve({ windowHeight: 844, safeArea: { top: 25, bottom: 826 } }); },
    vibrateShort(o) { calls.push('vibrate:' + o.type); return Promise.resolve({}); }
  };
  const modern = env(9533001, native);
  assert.strictEqual(await modern.api.get('sample'), 'native-value');
  assert.strictEqual(await modern.api.set('sample', 'new'), true);
  assert.strictEqual((await modern.api.windowInfo()).safeArea.top, 25);
  assert.strictEqual(await modern.api.vibrate(), true);
  assert.deepStrictEqual(calls, ['get:sample', 'set:sample:new', 'window', 'vibrate:light']);
  assert.strictEqual(modern.writes(), 0);
  assert.strictEqual(await modern.api.storageAvailable(), true);

  // 容器内低版本：存储不可用，不回退浏览器存储；不调用低版本不支持的接口
  const old = env(9451001, native);
  assert.strictEqual(await old.api.get('sample'), null);
  assert.strictEqual(await old.api.set('sample', 'old'), false);
  assert.strictEqual(old.writes(), 0);
  assert.strictEqual(old.reads(), 0);
  assert.strictEqual(await old.api.storageAvailable(), false);
  assert.strictEqual(await old.api.windowInfo(), null);
  assert.strictEqual(await old.api.vibrate(), false);
  assert.strictEqual(old.vibrated(), 0, '容器内不使用 navigator.vibrate');

  // 容器内版本未知（无 buildVersion、无 getLaunchOptions）
  const unknown = env(0, { getStorage() { throw new Error('should not call'); }, setStorage() { throw new Error('x'); } });
  assert.strictEqual(await unknown.api.get('sample'), null);
  assert.strictEqual(await unknown.api.set('k', 'v'), false);
  assert.strictEqual(unknown.writes(), 0);

  // 9.49：有 Storage/窗口信息，但震动需 9.50
  const v949 = env(9490001, native);
  assert.strictEqual(await v949.api.vibrate(), false);

  // 普通浏览器预览：localStorage 回退
  const browser = env(0, null);
  assert.strictEqual(await browser.api.get('sample'), 'browser-value');
  assert.strictEqual(await browser.api.set('sample', 'local'), true);
  assert.strictEqual(await browser.api.storageAvailable(), true);
  assert.strictEqual(await browser.api.vibrate(), true);

  // SDK 异常：返回失败，不回退
  const failed = env(9533001, {
    getStorage() { return Promise.reject(new Error('SDK failure')); },
    setStorage() { return Promise.reject(new Error('SDK failure')); }
  });
  assert.strictEqual(await failed.api.get('sample'), null);
  assert.strictEqual(await failed.api.set('sample', 'x'), false);
  assert.strictEqual(failed.writes(), 0);
  console.log('平台适配：旧内核 globalThis、Storage 版本门槛/不回退、浏览器预览回退、窗口信息、vibrateShort、异常路径，全部通过');
}
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
