/* 第六章 · 部分 C（浅）· 章内 63.55–85.64s（原片 479.11–500.50 + 0.7s 片尾）
   文案：「所以两者的区别很简单……怎么带资源、怎么复用和管理的问题」
   出现：居中大字「区别很简单」
   变化：大字上移 → 左 Prompt 白卡「这一次」→ 右 Skill 深卡「这一类」（方法 + 资源打包）→ 标上「长期维护 · 反复调用」
         →「不是谁取代谁，Skill 本身就包含大量 Prompt」：Prompt 卡缩小、收进 Skill 卡里
         →「多解决了：怎么被发现 / 怎么带资源 / 怎么复用和管理」：下方三条依次出现
   消失：本章结尾 85.19s（outro），之后接第七章 */
(function () {
  Studio.scene({
    id: 'pC-sum', stage: 'light', span: [63.55, 85.64], outro: true,
    chapter: { no: '06', title: 'Skill 和 Prompt 的区别' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">区别<em>很简单</em></div>
        <div data-state="b" class="c-hero c-type">Prompt 管<em>这一次</em></div>
        <div data-state="c" class="c-hero c-type">Skill 管<em>这一类</em></div>
        <div data-state="d" class="c-hero c-type">Skill <em>包含</em> Prompt</div>
        <div data-state="e" class="c-hero c-type">多解决了<em>三件事</em></div>
      </div></div>
      <div class="c-card sk">
        <div class="kw">Skill</div><div class="big">这一类</div><div class="ds">做事方法 + 资源，一起打包</div>
        <div class="tags"><span class="c-pill is-sm is-white t1">长期维护</span><span class="c-pill is-sm is-white t2">反复调用</span></div>
      </div>
      <div class="c-card is-white pr">
        <div class="kw">Prompt</div><div class="big">这一次</div><div class="ds">这一次怎么跟 AI 交代任务</div>
      </div>
      <div class="l-at row-c three">
        <div class="c-chip h1"><span class="n">①</span>怎么被发现</div>
        <div class="c-chip h2"><span class="n">②</span>怎么带资源</div>
        <div class="c-chip h3"><span class="n">③</span>怎么复用和管理</div>
      </div>`,
    cues: [
      { at: 63.60, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 区别很简单 65.02
      { at: 66.08, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 66.08, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // Prompt 是你「这一次」66.08
      { at: 66.30, sel: '.pr', fx: 'tilt' },                               // 这一次 66.96
      { at: 69.14, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 而 Skill 是把「这一类」69.14
      { at: 69.30, sel: '.sk', fx: 'tilt' },                               // 这一类 70.08
      { at: 73.20, sel: '.sk .t1', fx: 'soft' },                           // 长期维护 73.28
      { at: 74.05, sel: '.sk .t2', fx: 'soft' },                           // 反复调用 74.10
      // Skill 包含 Prompt
      { at: 75.80, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 两者不是谁取代谁 75.80
      { at: 78.80, sel: '.pr', fx: 'move', to: { x: 1100, y: 265, s: 0.36 }, dur: 1100 },  // 大量 Prompt 78.88
      // 多解决了三件事
      { at: 80.02, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 它只是多解决了 80.02
      { at: 81.52, sel: '.three .h1', fx: 'in' },                          // 被发现 81.58
      { at: 82.46, sel: '.three .h2', fx: 'in' },                          // 带资源 82.52
      { at: 83.44, sel: '.three .h3', fx: 'in' },                          // 复用和管理 83.50
    ],
  });
})();
