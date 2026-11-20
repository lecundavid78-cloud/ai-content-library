/* 部分 C · 浅 · Skill 长什么样（17s）—— 整个部分只有「一张卡」
   出现：文件夹卡 cover-workflow/，里面只有 SKILL.md
   变化：卡片放大、翻成白色的 SKILL.md 文档 → name / description 两个必填项 + 标注
         → 文档收回成文件夹，再长出 scripts / references / assets 三行（可选）和各自用途
   消失：部分结束（样片结尾，定格） */
(function () {
  const I = Studio.icon;
  const opt = (name, role) => `<div class="c-file is-opt r-opt">${I('folder', '#E8B54F')}<span class="name">${name}</span><span class="role">${role}</span><span class="c-pill is-sm is-ghost">可选</span></div>`;
  Studio.scene({
    id: 'pC-anatomy', stage: 'light',
    chapter: { no: '02', title: 'Skill 长什么样' },
    duration: 17.0,
    html: `
      <div class="ttl"><div class="c-morph">
        <div data-state="a" class="c-title c-type">一个文件夹 ＋ <em class="mono">SKILL.md</em></div>
        <div data-state="b" class="c-title c-type">SKILL.md 的<em>两个必填项</em></div>
        <div data-state="c" class="c-title c-type">完整的 Skill：<em>四个部分</em></div>
      </div></div>
      <div class="c-card is-morph box">
        <div class="face f-folder">
          <div class="head">${I('folder', '#E8B54F')}cover-workflow/</div>
          <div class="body">
            <div class="c-file r1">${I('file', '#A891FF')}<span class="name">SKILL.md</span><span class="role">管流程</span><span class="c-pill is-sm is-white">必需</span></div>
            <div class="cap">纯文本 · 用记事本就能打开</div>
            ${opt('scripts/', '放脚本')}${opt('references/', '放资料')}${opt('assets/', '放素材')}
          </div>
        </div>
        <div class="face f-doc">
          <div class="head"><span>cover-workflow / SKILL.md</span><span>Markdown</span></div>
          <div class="body">
            <div class="field f1"><div class="lab">name</div><div class="val mono">cover-workflow</div></div>
            <div class="field f2"><div class="lab">description</div>
              <div class="val">当用户要<span class="c-mark">统一视觉规范做封面<i class="hl"></i></span>时使用</div></div>
            <div class="rule"></div>
            <div class="body-lab">正文 · 操作步骤</div>
            <div class="c-skel" style="width:92%"></div>
            <div class="c-skel" style="width:74%"></div>
          </div>
        </div>
      </div>
      <div class="l-at callout c1"><span class="c-pill is-sm">Skill 的名字</span></div>
      <div class="l-at callout c2"><span class="c-pill is-sm">决定 AI <em>什么时候用它</em></span></div>`,
    cues: [
      // 出现：文件夹里只有一份 SKILL.md
      { at: 0.20, sel: '.ttl [data-state=a]', fx: 'type' },
      { at: 0.60, sel: '.box', fx: 'tilt' },
      { at: 1.30, sel: '.r1', fx: 'in' },
      { at: 1.40, sel: '.r1 .role', fx: 'hide' },
      { at: 2.00, sel: '.r1 .c-pill', fx: 'soft' },
      { at: 2.60, sel: '.cap', fx: 'soft' },
      // 变化 1：同一张卡放大、翻成 SKILL.md 文档
      { at: 5.60, sel: '.ttl .c-morph', fx: 'state', to: 'b' },
      { at: 5.60, sel: '.box', fx: 'move', to: { x: 520, y: 330, w: 880, h: 440 } },
      { at: 5.60, sel: '.f-folder', fx: 'out' },
      { at: 5.90, sel: '.f-doc', fx: 'soft' },
      { at: 6.60, sel: '.f1', fx: 'in' },
      { at: 7.10, sel: '.f2', fx: 'in' },
      { at: 7.60, sel: '.f-doc .rule, .f-doc .body-lab, .f-doc .c-skel', fx: 'soft', stagger: 0.1 },
      { at: 8.30, sel: '.c1 .c-pill', fx: 'in' },
      { at: 8.90, sel: '.c2 .c-pill', fx: 'in' },
      { at: 9.40, sel: '.f2 .c-mark', fx: 'mark' },
      // 变化 2：文档收回成文件夹，长出三个可选文件夹
      { at: 11.00, sel: '.ttl .c-morph', fx: 'state', to: 'c' },
      { at: 11.00, sel: '.c1 .c-pill, .c2 .c-pill, .f-doc, .cap', fx: 'out' },
      { at: 11.10, sel: '.box', fx: 'move', to: { x: 560, y: 316, w: 800, h: 508 } },
      { at: 11.40, sel: '.f-folder', fx: 'soft' },
      { at: 11.90, sel: '.r-opt', fx: 'in', stagger: 0.4 },
      { at: 13.40, sel: '.r1 .role', fx: 'soft' },
      { at: 13.70, sel: '.r-opt .role', fx: 'soft', stagger: 0.25 },
    ],
    subs: [
      { from: 0.3, to: 2.8, text: '最简单的 Skill，就是一个普通文件夹' },
      { from: 2.9, to: 5.4, text: '里面只有一份 SKILL.md，记事本就能打开' },
      { from: 5.6, to: 8.2, text: '打开它，最上方有两个必填项' },
      { from: 8.3, to: 10.8, text: 'description 写清楚，AI 才知道什么时候用它' },
      { from: 11.0, to: 13.8, text: '进阶一点，还可以配上三个可选文件夹' },
      { from: 13.9, to: 16.8, text: 'SKILL.md 管流程，其余的放脚本、资料和素材' },
    ],
  });
})();
