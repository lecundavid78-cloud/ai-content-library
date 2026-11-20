/* 第七章 · 部分 C（浅）· 章内 63.10–85.84s（原片 563.60–585.64 + 0.7s 片尾）· 全片结尾
   文案：「下次再看到吹得神乎其神的 Skill，先问自己三个问题……我是阿泽，下期视频，我会带大家直接拆解 Skill」
   出现：居中大字「看到神乎其神的 Skill？」
   变化：大字上移 →「先问三个问题」：一张清单卡，三行虚线占位随口播逐行填满
           ① 整理出了什么工作流程？② 除了提示词，有没有资料、脚本或模板？③ 能不能稳定搞定反复做的事？
         →「想明白这三点」：三行依次打 √ →「有没有价值，一目了然」
         →「下期视频，直接拆解 Skill」：清单退后，下方出现「下期：直接拆解 Skill」
   消失：全片结尾 85.39s（outro）整组退场 */
(function () {
  const I = Studio.icon;
  const Q = ['它整理出了什么工作流程？', '除了提示词，有没有资料、脚本或模板？', '能不能稳定搞定一件反复做的事？'];
  Studio.scene({
    id: 'pC-questions', stage: 'light', span: [63.10, 85.84], outro: true,
    chapter: { no: '07', title: '值不值得做 + 总结' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">看到<em>神乎其神</em>的 Skill？</div>
        <div data-state="b" class="c-hero c-type">先问<em>三个问题</em></div>
        <div data-state="c" class="c-hero c-type">有没有价值，<em>一目了然</em></div>
        <div data-state="d" class="c-hero c-type">下期见</div>
      </div></div>
      <div class="c-card is-white qs">
        <div class="hd"><span>判断一个 Skill 有没有价值</span><span>3 问</span></div>
        ${Q.map((q, i) => `<div class="qr q${i + 1}"><span class="fill"><span class="no">0${i + 1}</span>${q}</span><div class="c-badge">${I('check')}</div></div>`).join('')}
      </div>
      <div class="l-at row-c next"><span class="c-pill">下期：直接<em>拆解 Skill</em></span></div>`,
    cues: [
      { at: 63.14, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 神乎其神 64.30
      { at: 65.14, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 先问自己三个问题 65.14
      { at: 65.14, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 65.50, sel: '.qs', fx: 'tilt' },
      { at: 66.98, sel: '.qs .q1', fx: 'fillLight' },                      // 它到底 67.04
      { at: 69.60, sel: '.qs .q2', fx: 'fillLight' },                      // 除了 69.66
      { at: 73.96, sel: '.qs .q3', fx: 'fillLight' },                      // 这些东西 74.02
      { at: 77.70, sel: '.qs .c-badge', fx: 'badge', stagger: 0.25 },      // 想明白这三点 77.78
      { at: 79.12, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 一目了然 80.88
      { at: 81.70, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 我是阿泽，下期视频 81.70
      { at: 82.60, sel: '.qs', fx: 'recede' },
      { at: 82.70, sel: '.next .c-pill', fx: 'in' },                       // 下期视频 82.72
    ],
  });
})();
