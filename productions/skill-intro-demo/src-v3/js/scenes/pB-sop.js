/* 部分 B · 浅 · Skill = 写给 AI 的操作手册（12.5s）
   出现：空白 SOP 卡（五个虚线占位）
   变化：标题换成定义 → 五行逐行填满、计数 0/5 → 5/5、打 √
         → 卡片左移让位，右侧三个同类任务依次「照着做」并打 √
   消失：部分结束才整体退场 */
(function () {
  const I = Studio.icon;
  const rows = ['什么时候用', '分哪几步', '查什么资料', '报错怎么办', '按什么标准交付'];
  const tasks = ['做 PPT 封面', '做海报封面', '做视频封面'];
  Studio.scene({
    id: 'pB-sop', stage: 'light',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 12.5,
    html: `
      <div class="ttl"><div class="c-morph">
        <div data-state="a" class="c-title c-type">Skill 到底是<em>什么</em>？</div>
        <div data-state="b" class="c-title c-type">写给 AI 的<span class="c-mark"><em>操作手册</em><i class="hl"></i></span></div>
        <div data-state="c" class="c-title c-type">写一次，<em>反复用</em></div>
      </div></div>
      <div class="c-card sop">
        <div class="head"><span>SOP · 标准操作手册</span>
          <span class="c-morph cnt"><span data-state="a">0 / 5</span><span data-state="b">5 / 5</span></span></div>
        <div class="body">
          ${rows.map((r, i) => `<div class="c-row is-slot"><span class="fill"><span class="no">0${i + 1}</span>${r}</span></div>`).join('')}
        </div>
        <div class="c-badge bok">${I('check')}</div>
      </div>
      ${tasks.map((t, i) => `<div class="c-chip j${i + 1}"><span class="arrow">→</span>${t}<span class="ok">${I('check')}</span></div>`).join('')}`,
    cues: [
      { at: 0.20, sel: '.ttl [data-state=a]', fx: 'type' },
      { at: 0.50, sel: '.sop', fx: 'tilt' },
      // 变化 1：定义 + 逐行填满
      { at: 2.40, sel: '.ttl .c-morph', fx: 'state', to: 'b' },
      { at: 3.30, sel: '.ttl .c-mark', fx: 'mark' },
      { at: 2.90, sel: '.sop .c-row', fx: 'fill', stagger: 0.45 },
      { at: 5.00, sel: '.sop .cnt', fx: 'state', to: 'b' },
      { at: 5.30, sel: '.sop .bok', fx: 'badge' },
      // 变化 2：同一张卡左移，右侧同类任务照着做
      { at: 7.00, sel: '.ttl .c-morph', fx: 'state', to: 'c' },
      { at: 7.00, sel: '.sop', fx: 'move', to: { x: 470 } },
      { at: 7.60, sel: '.c-chip', fx: 'in', stagger: 0.45 },
      { at: 8.40, sel: '.c-chip .ok', fx: 'badge', stagger: 0.45 },
    ],
    subs: [
      { from: 0.3, to: 2.3, text: 'Skill 到底是什么？' },
      { from: 2.4, to: 6.8, text: '说白了，就是一份写给 AI 的标准操作手册，也就是 SOP' },
      { from: 7.0, to: 12.1, text: '以后遇到同类任务，AI 先看手册再干活，又快又稳' },
    ],
  });
})();
