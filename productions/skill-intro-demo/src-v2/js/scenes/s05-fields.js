/* S05 · 浅 · SKILL.md 的两个必填项
   白卡：name / description 两行可读，正文只给骨架条（不和字幕抢视线）；右侧黑色标注压在卡片边上 */
(function () {
  Studio.scene({
    id: 's05-fields', stage: 'light',
    chapter: { no: '02', title: 'Skill 长什么样' },
    duration: 6.0,
    html: `
      <div class="l-at l-center-x ttl"><span class="c-pill">SKILL.md 的<em>两个必填项</em></span></div>
      <div class="c-card is-white doc">
        <div class="head"><span>cover-workflow / SKILL.md</span><span>Markdown</span></div>
        <div class="body">
          <div class="field f1"><div class="lab">name</div><div class="val mono">cover-workflow</div></div>
          <div class="field f2"><div class="lab">description</div>
            <div class="val">当用户要<span class="c-mark">统一视觉规范做封面<i class="hl"></i></span>时使用</div></div>
          <div class="rule"></div>
          <div class="body-lab">正文 · 操作步骤</div>
          <div class="c-skel" style="width:92%"></div>
          <div class="c-skel" style="width:76%"></div>
          <div class="c-skel" style="width:58%"></div>
        </div>
      </div>
      <div class="l-at callout c1"><span class="c-pill is-sm">Skill 的名字</span></div>
      <div class="l-at callout c2"><span class="c-pill is-sm">决定 AI <em>什么时候用它</em></span></div>`,
    cues: [
      { at: 0.20, sel: '.ttl .c-pill', fx: 'in' },
      { at: 0.50, sel: '.doc', fx: 'tilt' },
      { at: 1.10, sel: '.f1', fx: 'in' },
      { at: 1.60, sel: '.f2', fx: 'in' },
      { at: 2.10, sel: '.rule, .body-lab, .c-skel', fx: 'soft', stagger: 0.1 },
      { at: 2.60, sel: '.c1 .c-pill', fx: 'in' },
      { at: 3.20, sel: '.c2 .c-pill', fx: 'in' },
      { at: 3.50, sel: '.f2 .c-mark', fx: 'mark' },
    ],
    subs: [
      { from: 0.3, to: 2.5, text: '打开 SKILL.md，最上方有两个必填项' },
      { from: 2.6, to: 5.8, text: 'description 写清楚，AI 才知道什么时候用它' },
    ],
  });
})();
