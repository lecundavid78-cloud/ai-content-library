/* 第一章 · 部分 C（浅）· 67.25–84.20s · 说白了 SOP → 就像带新同事
   口播：「说白了，Skill 就是一份写给 AI 的标准操作手册……做出来的东西又快又稳」
   出现：居中大字「写给 AI 的操作手册」+ SOP 注释
   变化：讲到「就像带新同事」大字上移成标题 → 新同事卡 + 两件要教的事，中间是「每次从头教」
         → 「提前写好一份手册」：中间换成手册卡 → 「先看手册再干活」：箭头接上、两件事打 √ → 「又快又稳」
   消失：本章结尾 83.75s 整组退场（outro） */
(function () {
  const I = Studio.icon;
  const person = `<svg viewBox="0 0 48 48"><circle cx="24" cy="17" r="8" fill="none" stroke="#7B5CF0" stroke-width="3"/><path d="M9 41c1.8-8 8-12 15-12s13.2 4 15 12" fill="none" stroke="#7B5CF0" stroke-width="3" stroke-linecap="round"/></svg>`;
  Studio.scene({
    id: 'pC-sop', stage: 'light', span: [67.25, 84.20], outro: true,
    chapter: { no: '01', title: '为什么需要 Skill' },
    html: `
      <div class="lead"><div class="c-lead">说白了，Skill 就是一份</div></div>
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">写给 AI 的<span class="c-mark"><em>操作手册</em><i class="hl"></i></span></div>
        <div data-state="b" class="c-hero c-type">就像带<em>新同事</em></div>
        <div data-state="c" class="c-hero c-type">提前写好<em>一份手册</em></div>
        <div data-state="d" class="c-hero c-type">先看手册，<em>再干活</em></div>
        <div data-state="e" class="c-hero c-type">又快<em>又稳</em></div>
      </div></div>
      <div class="gloss">SOP · Standard Operating Procedure</div>
      <div class="c-card is-white is-morph person"><div class="face">
        <div class="avatar">${person}</div><div class="nm">新同事</div><div class="sm">第一天上岗</div></div></div>
      <div class="l-at teach">每次都从头教<span class="line"></span></div>
      <div class="c-card manual">
        <div class="mh"><span>SOP</span><span>手册</span></div>
        <div class="c-skel" style="width:92%"></div><div class="c-skel" style="width:70%"></div><div class="c-skel" style="width:84%"></div>
        <div class="c-badge bok">${I('check')}</div>
      </div>
      <div class="l-at arrow a1">→</div><div class="l-at arrow a2">→</div>
      <div class="c-chip t1">做公司 PPT<span class="ok">${I('check')}</span></div>
      <div class="c-chip t2">写项目报告<span class="ok">${I('check')}</span></div>`,
    cues: [
      { at: 67.45, sel: '.lead .c-lead', fx: 'in' },                   // 说白了 67.40
      { at: 68.30, sel: '.hero-wrap [data-state=a]', fx: 'type' },
      { at: 69.90, sel: '.hero-wrap .c-mark', fx: 'mark' },           // 标准操作手册 69.84
      { at: 70.85, sel: '.gloss', fx: 'soft' },                       // SOP 70.88
      // 新同事
      { at: 72.00, sel: '.lead, .gloss', fx: 'out' },
      { at: 72.00, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 72.05, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },// 就像带新同事 72.04
      { at: 72.50, sel: '.person', fx: 'tilt' },
      { at: 74.10, sel: '.teach', fx: 'in' },                         // 从头教 74.14
      { at: 75.05, sel: '.t1', fx: 'in' },                            // 公司 PPT 75.12
      { at: 75.85, sel: '.t2', fx: 'in' },                            // 写项目报告 75.88
      // 提前写好一份手册
      { at: 77.25, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },// 提前写好 77.26
      { at: 77.25, sel: '.teach', fx: 'out' },
      { at: 77.55, sel: '.manual', fx: 'tilt' },
      // 先看手册再干活
      { at: 80.20, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },// 先看手册 80.26
      { at: 80.30, sel: '.arrow', fx: 'soft', stagger: 0.3 },
      { at: 80.60, sel: '.manual .bok', fx: 'badge' },
      { at: 81.00, sel: '.t1 .ok', fx: 'badge' },
      { at: 81.30, sel: '.t2 .ok', fx: 'badge' },
      { at: 82.50, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },// 又快又稳 82.58
    ],
  });
})();
