/*
 * 存档测试（node tests/progress.test.js）：星级/用时读写、主线与自由图键隔离、只保存更好成绩、
 * V1 旧记录一次性迁移（旧键保留）、容器内低版本不可保存且不碰浏览器存储、教学只出现一次。
 */
'use strict';
const assert = require('assert');
const { env } = require('./platform.test.js');
const KEYS = ['main-1', 'main-2', 'main-3', 'free-u', 'free-z', 'free-double'];

async function run() {
  let n = 0;
  // 1) 普通浏览器：V1 旧记录 ks_best_1=2, ks_best_2=3, ks_best_3=1
  const b = env(0, null, { extra: ['game/progress.js'], local: { ks_best_1: '2', ks_best_2: '3', ks_best_3: '1' } });
  const P = b.scope.KS.Progress;
  await P.load(KEYS);
  assert.strictEqual(P.available, true);
  assert.deepStrictEqual(Object.assign({}, P.stars), { 'main-1': 2, 'free-u': 3, 'main-2': 1 }); n++;
  assert.strictEqual(b.values.ks_best_1, '2', '旧键保留'); n++;
  assert.strictEqual(b.values.ks2_migrated, '1'); n++;
  assert.strictEqual(await P.record('main-3', 2, 80.04), true);
  assert.strictEqual(b.values['ks2_best_main-3'], '2');
  assert.strictEqual(b.values['ks2_time_main-3'], '80'); n++;
  await P.record('main-3', 1, 90);            // 更差：不覆盖
  assert.strictEqual(b.values['ks2_best_main-3'], '2');
  assert.strictEqual(b.values['ks2_time_main-3'], '80'); n++;
  await P.record('main-3', 3, 60.26);
  assert.strictEqual(b.values['ks2_best_main-3'], '3');
  assert.strictEqual(b.values['ks2_time_main-3'], '60.3'); n++;
  assert.strictEqual(b.values['ks2_best_free-z'], undefined, '主线成绩不写入自由图键'); n++;
  // 再次加载：读回新键；迁移不重复执行（改旧键后不影响）
  b.values.ks_best_1 = '3';
  const e2 = env(0, null, { extra: ['game/progress.js'], local: b.values });
  const P2 = e2.scope.KS.Progress;
  await P2.load(KEYS);
  assert.strictEqual(P2.stars['main-3'], 3);
  assert.strictEqual(P2.times['main-3'], 60.3);
  assert.strictEqual(P2.stars['main-1'], 2, '迁移只执行一次'); n++;
  // 教学标记
  assert.strictEqual(P2.tutorialDone, false);
  await P2.markTutorial();
  const P3 = env(0, null, { extra: ['game/progress.js'], local: e2.values }).scope.KS.Progress;
  await P3.load(KEYS);
  assert.strictEqual(P3.tutorialDone, true, '教学只出现一次'); n++;

  // 2) 新版客户端：写入容器 Storage；容器里没有旧记录时，一次性读取 V1 留在浏览器存储里的值
  const store = {};
  const native = {
    getStorage({ key }) { return Promise.resolve({ data: store[key] !== undefined ? store[key] : '' }); },
    setStorage({ key, data }) { store[key] = data; return Promise.resolve({ errMsg: 'setStorage:ok' }); }
  };
  const c = env(9533001, native, { extra: ['game/progress.js'], local: { ks_best_3: '3' } });
  const PC = c.scope.KS.Progress;
  await PC.load(KEYS);
  assert.strictEqual(store['ks2_best_main-2'], '3', 'V1 S 型关（旧第 3 关）记录迁移到 main-2'); n++;
  assert.strictEqual(c.writes(), 0, '迁移后不写浏览器存储'); n++;
  await PC.record('free-double', 1, 85);
  assert.strictEqual(store['ks2_best_free-double'], '1'); n++;

  // 3) 容器内低版本：不可保存、不读写浏览器存储
  const o = env(9451001, native, { extra: ['game/progress.js'], local: { ks_best_1: '3' } });
  const PO = o.scope.KS.Progress;
  await PO.load(KEYS);
  assert.strictEqual(PO.available, false);
  assert.strictEqual(await PO.record('main-1', 3, 12), false, '保存失败要如实返回');
  assert.strictEqual(PO.lastSaveOk, false);
  assert.strictEqual(o.writes(), 0); assert.strictEqual(o.reads(), 0); n++;
  console.log(`存档：${n} 组断言全部通过（键隔离、只存更好成绩、V1 迁移、教学一次、容器版本门槛）`);
}
run().catch(e => { console.error(e); process.exitCode = 1; });
