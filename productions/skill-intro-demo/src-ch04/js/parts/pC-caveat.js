/* 第四章 · 部分 C（浅）· 章内 82.60–92.65s（原片 350.60–359.95 + 0.7s 片尾）
   文案：「注意，自动触发并不是百分百靠谱的……AI 也可能漏选或选错」
   出现：居中大字「自动触发，不是百分百」
   变化：大字上移 → 三个原因随口播依次出现（描述含糊 / Agent 机制不同 / 模型判断偏差）
         →「AI 也可能漏选或选错」：下方两个结果胶囊打红 ×
   消失：本章结尾 92.20s（outro），之后接第五章 */
(function () {
  const I = Studio.icon;
  Studio.scene({
    id: 'pC-caveat', stage: 'light', span: [82.60, 92.65], outro: true,
    chapter: { no: '04', title: 'AI 怎么调用 Skill' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">自动触发，<em class="red">不是百分百</em></div>
        <div data-state="b" class="c-hero c-type">这几种情况<em>会失手</em></div>
        <div data-state="c" class="c-hero c-type">可能<em class="red">漏选或选错</em></div>
      </div></div>
      <div class="l-at row-c why">
        <div class="c-chip w1"><span class="dot"></span>描述写得含糊</div>
        <div class="c-chip w2"><span class="dot"></span>不同 Agent 机制有差异</div>
        <div class="c-chip w3"><span class="dot"></span>模型判断出现偏差</div>
      </div>
      <div class="l-at row-c res2">
        <div class="c-chip x1">漏选<span class="no">${I('cross')}</span></div>
        <div class="c-chip x2">选错<span class="no">${I('cross')}</span></div>
      </div>`,
    cues: [
      { at: 82.65, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 百分百靠谱 83.40
      { at: 84.60, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 如果描述 84.62
      { at: 84.60, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 84.95, sel: '.why .w1', fx: 'in' },                            // 描述写得含糊 85.00
      { at: 86.48, sel: '.why .w2', fx: 'in' },                            // Agent 86.54
      { at: 88.15, sel: '.why .w3', fx: 'in' },                            // 或者模型判断 88.18
      { at: 90.10, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // AI 也可能 90.10
      { at: 90.10, sel: '.why .c-chip', fx: 'recede' },
      { at: 90.70, sel: '.res2 .x1', fx: 'in' },                           // 漏选 90.78
      { at: 91.30, sel: '.res2 .x2', fx: 'in' },                           // 选错 91.38
    ],
  });
})();
