/* S01 · 钩子 —— 为什么需要 Skill：要求每次都得重打一遍
   信息结构：三次重复交代（文档卡）→ 第三次漏说 → 压暗 → 提炼大字 */
(function () {
  const card = (n, day, miss) => `
    <div class="c-card p-card">
      <div class="c-card-head"><span><b>PROMPT</b> · 第 ${n} 次</span><span>${day}</span></div>
      <div class="c-card-body">
        <div class="ln cn"><span class="muted">封面：</span><span class="v">大标题 + 主视觉图</span></div>
        <div class="ln cn"><span class="muted">字体：</span><span class="v">思源黑体 Heavy</span></div>
        ${miss
          ? `<div class="ln cn miss"><span>配色：</span><span class="q">没说</span></div>`
          : `<div class="ln cn"><span class="muted">配色：</span><span class="v">荧光绿 + 纯黑</span></div>`}
        <div class="ln cn"><span class="muted">检查：</span><span class="v">文字不能被裁切</span></div>
      </div>
    </div>`;

  Studio.scene({
    id: 's01-hook',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 4.6,
    html: `
      <div class="c-doc cards" data-name="prompts">${card(1, '周一 10:02')}${card(2, '周三 15:47')}${card(3, '周五 21:40', true)}</div>
      <div class="c-tag is-red l-abs warn">漏说一句 → 风格跑偏</div>
      <div class="l-col">
        <div class="c-pill">为什么需要 Skill？</div>
        <div class="c-hero"><span class="skew">又得<span class="c-frame" data-pad="12">重打一遍</span></span></div>
      </div>`,
    cues: [
      { at: 0.15, sel: '.p-card', fx: 'pop', stagger: 0.25 },
      { at: 0.92, sel: '.p-card:nth-child(3)', fx: 'shake' },
      { at: 0.92, sel: '.warn', fx: 'pop' },
      { at: 1.15, sel: '.cards', fx: 'dim' },           // 铁律：首张卡出现 1.0s 后整组压暗
      { at: 1.22, sel: '.c-pill', fx: 'pop' },
      { at: 1.30, sel: '.c-hero', fx: 'slam' },
      { at: 1.75, sel: '.c-hero .c-frame', fx: 'draw' },
      { at: 2.10, sel: '.warn', fx: 'recede' },
    ],
    subs: [
      { from: 1.2, to: 2.9, text: '下次换个题目，要求又得重新打一遍' },
      { from: 2.9, to: 4.5, text: '能不能把这套方法存下来，让 AI 照着做？' },
    ],
  });
})();
