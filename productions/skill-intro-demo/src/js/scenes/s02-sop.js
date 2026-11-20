/* S02 · 定义 —— Skill = 写给 AI 的 SOP（标准操作手册）
   信息结构：等式 → 提炼大字 → 术语注释 → SOP 五要素 */
(function () {
  const steps = ['何时用', '分几步', '查资料', '报错处理', '交付标准'];
  Studio.scene({
    id: 's02-sop',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 5.2,
    html: `
      <div class="l-col">
        <div class="l-row eq">
          <div class="c-card skill-chip" style="position:relative">${Studio.icon('folder', '#38BDF8')}Skill</div>
          <div class="sign">=</div>
        </div>
        <div class="c-hero"><span class="skew">写给 <span class="en">AI</span> 的 <span class="c-frame en" data-pad="10">SOP</span></span></div>
        <div class="gloss">Standard Operating Procedure · <span class="cn">标准操作手册</span></div>
        <div class="l-row steps">
          ${steps.map((s, i) => `${i ? '<span class="c-arrow">→</span>' : ''}<div class="c-chip"><span class="no">0${i + 1}</span>${s}</div>`).join('')}
        </div>
      </div>`,
    cues: [
      { at: 0.10, sel: '.skill-chip', fx: 'pop' },
      { at: 0.22, sel: '.sign', fx: 'pop' },
      { at: 0.40, sel: '.c-hero', fx: 'slam' },
      { at: 0.85, sel: '.c-hero .c-frame', fx: 'draw' },
      { at: 1.10, sel: '.gloss', fx: 'wipe' },
      { at: 1.70, sel: '.steps > *', fx: 'pop', stagger: 0.07 },
    ],
    subs: [
      { from: 0.1, to: 2.5, text: '说白了，Skill 就是一份写给 AI 的 SOP' },
      { from: 2.5, to: 5.0, text: '什么时候用、分几步、按什么标准交付' },
    ],
  });
})();
