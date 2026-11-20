/* 第七章 · 部分 B（浅）· 章内 42.36–63.10s（原片 542.86–563.60）
   文案：「总结。学 Skill，最重要的不是去网上囤几十个所谓的『神级 Skill』……却能帮我们沉淀和复用自己的工作方法」
   出现：居中大字「总结」
   变化：大字上移 →「不是囤神级 Skill」：一堆「神级 Skill」灰色芯片 →「掌握背后的思路」：芯片退场
         → 左边「反复向 AI 解释」的聊天卡 → 箭头 → 右边 Skill 深卡，四行随口播逐行填满（步骤 / 规则 / 资源 / 检查标准）
         →「随时可调用的资产」：深卡卡头改成「可调用的资产」并打 √，聊天卡退后 →「不是新模型」→「沉淀你的方法」
   消失：62.65s 整组退场 */
(function () {
  const I = Studio.icon;
  const ROWS = [['01', '步骤', 'r1'], ['02', '规则', 'r2'], ['03', '资源', 'r3'], ['04', '检查标准', 'r4']];
  Studio.scene({
    id: 'pB-summary', stage: 'light', span: [42.36, 63.10],
    chapter: { no: '07', title: '值不值得做 + 总结' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type"><em>总结</em></div>
        <div data-state="b" class="c-hero c-type">不是囤<em>神级 Skill</em></div>
        <div data-state="c" class="c-hero c-type">掌握<em>背后的思路</em></div>
        <div data-state="d" class="c-hero c-type">变成<em>可调用的资产</em></div>
        <div data-state="e" class="c-hero c-type">不是<em>新模型</em></div>
        <div data-state="f" class="c-hero c-type">沉淀<em>你的方法</em></div>
      </div></div>
      <div class="l-at row-c pile">${Array.from({ length: 8 }, () => '<div class="c-chip">神级 Skill</div>').join('')}</div>
      <div class="c-card is-white ask"><div class="t">每次都要向 AI 解释</div>
        <div class="bub">封面要大标题、配色黑金…</div><div class="bub">还是那套规范，再说一遍…</div><div class="bub">别忘了检查裁切…</div></div>
      <div class="l-at arr">→</div>
      <div class="c-card is-morph sk"><div class="face">
        <div class="head"><span class="c-morph is-start hm"><span data-state="a">拆成清晰的 Skill</span><span data-state="b" style="color:var(--gold)">随时可调用的资产</span></span></div>
        ${ROWS.map(([n, t, k]) => `<div class="c-row is-slot ${k}"><span class="fill"><span class="no">${n}</span>${t}</span></div>`).join('')}
      </div><div class="c-badge bok">${I('check')}</div></div>`,
    cues: [
      { at: 42.40, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 总结 42.44
      { at: 44.24, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 最重要的不是 44.24
      { at: 44.24, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 45.60, sel: '.pile .c-chip', fx: 'soft', stagger: 0.1 },       // 神级 47.02
      { at: 47.92, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 而是掌握 47.92
      { at: 47.95, sel: '.pile', fx: 'out' },
      { at: 49.85, sel: '.ask', fx: 'tilt' },                              // 反复向 AI 解释 50.94
      { at: 52.76, sel: '.arr', fx: 'soft' },                              // 拆解 52.84
      { at: 52.80, sel: '.sk', fx: 'tilt' },
      { at: 53.75, sel: '.sk .r1', fx: 'fill' },                           // 步骤 53.80
      { at: 54.45, sel: '.sk .r2', fx: 'fill' },                           // 规则 54.50
      { at: 55.12, sel: '.sk .r3', fx: 'fill' },                           // 资源 55.18
      { at: 55.68, sel: '.sk .r4', fx: 'fill' },                           // 检查 55.74
      { at: 56.54, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 变成随时可调用 56.62
      { at: 56.80, sel: '.sk .hm', fx: 'state', to: 'b' },
      { at: 57.85, sel: '.sk .bok', fx: 'badge' },                         // 资产 57.92
      { at: 57.90, sel: '.ask, .arr', fx: 'recede' },
      { at: 58.44, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 它没有让 AI 变成新模型 58.44
      { at: 60.46, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 沉淀和复用 61.10
    ],
  });
})();
