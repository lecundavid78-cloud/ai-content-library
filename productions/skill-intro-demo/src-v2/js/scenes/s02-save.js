/* S02 · 深 → 浅 · 能不能把方法存下来
   舞台从炭黑慢慢亮成暖白；一屏只有一句话 */
(function () {
  Studio.scene({
    id: 's02-save', stage: 'light',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 5.0,
    html: `
      <div class="l-col">
        <span class="c-pill">Skill 要解决的问题</span>
        <div class="c-hero c-type">把这套方法<em>存下来</em></div>
        <div class="c-lead">以后同类任务，AI 自动照着做</div>
      </div>`,
    cues: [
      { at: 0.25, sel: '.c-pill', fx: 'in' },
      { at: 0.80, sel: '.c-hero', fx: 'type' },
      { at: 2.30, sel: '.c-lead', fx: 'in' },
    ],
    subs: [
      { from: 0.3, to: 2.4, text: '能不能把这套方法存下来' },
      { from: 2.5, to: 4.8, text: '以后遇到同类任务，让 AI 自动照着做？' },
    ],
  });
})();
