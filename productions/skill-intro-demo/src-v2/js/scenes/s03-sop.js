/* S03 · 浅 · Skill = 写给 AI 的操作手册（SOP）
   左：SOP 卡，五行占位被逐行填满；右：主句 + 荧光笔 */
(function () {
  const rows = ['什么时候用', '分哪几步', '查什么资料', '报错怎么办', '按什么标准交付'];
  Studio.scene({
    id: 's03-sop', stage: 'light',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 6.0,
    html: `
      <div class="c-card sop">
        <div class="head"><span>SOP · 标准操作手册</span><span>cover-workflow</span></div>
        <div class="body">
          ${rows.map((r, i) => `<div class="c-row is-slot"><span class="fill"><span class="no">0${i + 1}</span>${r}</span></div>`).join('')}
        </div>
        <div class="c-badge">${Studio.icon('check')}</div>
      </div>
      <div class="l-at txt">
        <div class="c-lead">说白了，Skill 就是一份</div>
        <div class="c-hero c-type h1">写给 AI 的</div>
        <div class="c-hero c-type h2"><span class="c-mark"><em>操作手册</em><i class="hl"></i></span></div>
      </div>`,
    cues: [
      { at: 0.20, sel: '.sop', fx: 'tilt' },
      { at: 0.60, sel: '.txt .c-lead', fx: 'in' },
      { at: 0.95, sel: '.h1', fx: 'type' },
      { at: 1.50, sel: '.h2', fx: 'type' },
      { at: 2.20, sel: '.h2 .c-mark', fx: 'mark' },
      { at: 1.95, sel: '.sop .c-row', fx: 'fill', stagger: 0.34 },
      { at: 4.30, sel: '.sop .c-badge', fx: 'badge' },
    ],
    subs: [
      { from: 0.3, to: 2.8, text: '说白了，Skill 就是一份写给 AI 的 SOP' },
      { from: 2.9, to: 5.8, text: '什么时候用、分几步、按什么标准交付' },
    ],
  });
})();
