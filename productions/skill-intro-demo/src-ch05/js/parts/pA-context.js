/* 第五章 · 部分 A（浅）· 章内 0.00–27.70s（原片 359.95–387.65）
   文案：「为什么 Skill 要采用按需加载？……既慢又浪费 Token」
   出现：居中大字「为什么要按需加载？」
   变化：大字上移，原地换成「叫渐进式披露」「为什么不一次读完？」
         →「上下文容量是有限的」：一张容量卡，占用条里只有一小段「你的问题」
         →「装了 50 个 Skill，全塞给 AI」：同一根占用条被撑满、变红，图例多出「Skill 全文 ×50」
         →「哪怕只是翻译一句话」：问题图例原地改成「翻译一句话」（和满条形成对比）
         →「一大堆无关信息」：图例改成「无关信息 ×49」→「既慢又浪费 Token」：卡片打红 ×
   消失：27.25s 整组退场 */
(function () {
  const I = Studio.icon;
  Studio.scene({
    id: 'pA-context', stage: 'light', span: [0, 27.70],
    chapter: { no: '05', title: '为什么按需加载' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">为什么要<em>按需加载</em>？</div>
        <div data-state="b" class="c-hero c-type">叫<em>渐进式披露</em></div>
        <div data-state="c" class="c-hero c-type">为什么不<em>一次读完</em>？</div>
        <div data-state="d" class="c-hero c-type">上下文<em>容量有限</em></div>
        <div data-state="e" class="c-hero c-type">装了 <em>50 个 Skill</em></div>
        <div data-state="f" class="c-hero c-type">全塞进去？<em class="red">满了</em></div>
        <div data-state="g" class="c-hero c-type">只为<em>翻译一句话</em></div>
        <div data-state="h" class="c-hero c-type">又慢，又<em class="red">浪费 Token</em></div>
      </div></div>
      <div class="l-at pre">
        <div class="c-chip p1"><span class="n">①</span>目录</div><span class="ar a1">→</span>
        <div class="c-chip p2"><span class="n">②</span>说明书</div><span class="ar a2">→</span>
        <div class="c-chip p3"><span class="n">③</span>资料</div>
        <div class="c-chip all">一次全读完？</div>
      </div>
      <div class="c-card is-white ctx">
        <div class="hd"><b>上下文容量</b><span>单次能同时参考的信息量</span></div>
        <div class="track"></div>
        <div class="l-at fl"></div>
        <div class="l-at flr"></div>
        <div class="lg">
          <div class="c-chip g1"><span class="dot"></span><span class="c-morph is-start q"><span data-state="a">你的问题</span><span data-state="b">翻译一句话</span></span></div>
          <div class="c-chip g2"><span class="dot g"></span><span class="c-morph is-start s"><span data-state="a">Skill 全文 × 50</span><span data-state="b" class="bad">无关信息 × 49</span></span></div>
        </div>
        <div class="c-badge is-red bx">${I('cross')}</div>
      </div>`,
    cues: [
      { at: 0.19, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // 按需加载 1.51
      { at: 2.53, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 2.90, sel: '.pre .p1, .pre .a1, .pre .p2, .pre .a2, .pre .p3', fx: 'in', stagger: 0.18 },   // 分步读取方式 3.33
      { at: 4.50, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 渐进式披露 5.00
      { at: 7.60, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },      // 为什么 AI 不在一开始 7.63
      { at: 7.70, sel: '.pre .p1, .pre .a1, .pre .p2, .pre .a2, .pre .p3', fx: 'recede' },
      { at: 10.25, sel: '.pre .all', fx: 'in' },                           // 全文读完 10.33
      { at: 11.35, sel: '.pre', fx: 'out' },
      // 容量有限
      { at: 11.40, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 上下文容量 12.19
      { at: 11.50, sel: '.ctx', fx: 'tilt' },
      { at: 13.50, sel: '.ctx .fl', fx: 'soft' },                          // 同时参考的信息量 13.57
      { at: 13.70, sel: '.lg .g1', fx: 'in' },
      // 50 个 Skill 全塞进去
      { at: 15.79, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 50 个 16.73
      { at: 16.70, sel: '.lg .g2', fx: 'in' },
      { at: 20.15, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 全塞给 20.21
      { at: 20.20, sel: '.ctx .fl', fx: 'move', to: { w: 840 }, dur: 1100 },
      { at: 21.00, sel: '.ctx .flr', fx: 'soft' },
      // 只是翻译一句话 → 无关信息
      { at: 21.47, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // 哪怕你只是 21.47
      { at: 22.50, sel: '.lg .q', fx: 'state', to: 'b' },                  // 翻译一句话 22.57
      { at: 24.95, sel: '.lg .s', fx: 'state', to: 'b' },                  // 无关信息 24.99
      { at: 26.09, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },     // 既慢又浪费 26.17
      { at: 26.60, sel: '.ctx .bx', fx: 'badge' },
    ],
  });
})();
