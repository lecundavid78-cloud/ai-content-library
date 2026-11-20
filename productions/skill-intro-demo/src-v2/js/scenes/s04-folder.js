/* S04 · 浅 · 最简单的 Skill = 一个文件夹 + 一份 SKILL.md */
(function () {
  const I = Studio.icon;
  Studio.scene({
    id: 's04-folder', stage: 'light',
    chapter: { no: '02', title: 'Skill 长什么样' },
    duration: 6.0,
    html: `
      <div class="l-at l-center-x ttl"><div class="c-title c-type">一个文件夹 ＋ 一份 <em class="mono">SKILL.md</em></div></div>
      <div class="c-card folder">
        <div class="head">${I('folder', '#E8B54F')}cover-workflow/</div>
        <div class="body">
          <div class="file">${I('file', '#A891FF')}<span>SKILL.md</span><span class="c-pill is-sm is-white">必需</span></div>
          <div class="cap">纯文本 · 用记事本就能打开</div>
        </div>
        <div class="c-badge">${I('check')}</div>
      </div>`,
    cues: [
      { at: 0.20, sel: '.ttl .c-title', fx: 'type' },
      { at: 1.20, sel: '.folder', fx: 'tilt' },
      { at: 1.90, sel: '.file', fx: 'in' },
      { at: 2.50, sel: '.file .c-pill', fx: 'soft' },
      { at: 3.00, sel: '.folder .c-badge', fx: 'badge' },
      { at: 3.40, sel: '.cap', fx: 'soft' },
    ],
    subs: [
      { from: 0.3, to: 2.9, text: '最简单的 Skill，就是一个普通文件夹' },
      { from: 3.0, to: 5.8, text: '里面只有一份 SKILL.md，记事本就能打开' },
    ],
  });
})();
