/* S03 · 结构 —— 最简单的 Skill = 一个文件夹 + SKILL.md；SKILL.md 两个必填项
   Beat A：文件树 + 提炼大字；Beat B：打开 SKILL.md → 1s 后压暗 → 提起 name/description */
(function () {
  const I = Studio.icon;
  const row = (branch, icon, name, tag, cls = '') =>
    `<div class="row ${cls}"><span class="branch">${branch}</span>${icon}<span class="name">${name}</span>${tag}</div>`;

  Studio.scene({
    id: 's03-structure',
    chapter: { no: '02', title: 'Skill 长什么样' },
    duration: 7.0,
    html: `
      <div class="c-card c-tree tree">
        <div class="c-card-head"><span><b>FOLDER</b> · ~/skills</span><span>1 必需 + 3 可选</span></div>
        <div class="c-card-body">
          ${row('', I('folder', '#38BDF8'), 'cover-workflow/', '', 'r-root')}
          ${row('├─', I('file', '#B8FF01'), 'SKILL.md', '<span class="c-pill is-sm">必需</span>', 'is-key r-key')}
          ${row('├─', I('folder', 'rgba(56,189,248,.55)'), 'scripts/', '<span class="c-tag">可选</span>', 'is-opt r-opt')}
          ${row('├─', I('folder', 'rgba(56,189,248,.55)'), 'references/', '<span class="c-tag">可选</span>', 'is-opt r-opt')}
          ${row('└─', I('folder', 'rgba(56,189,248,.55)'), 'assets/', '<span class="c-tag">可选</span>', 'is-opt r-opt')}
        </div>
      </div>

      <div class="l-col is-right beat-a">
        <div class="c-pill">最简单的 Skill</div>
        <div class="c-hero is-md"><span class="skew">一个文件夹</span></div>
        <div class="plus">+ 一份 <span class="c-frame mono" data-pad="12">SKILL.md</span></div>
      </div>

      <div class="c-card c-doc doc" data-name="SKILL.md">
        <div class="c-card-head"><span><b>cover-workflow/SKILL.md</b></span><span>Markdown</span></div>
        <div class="c-card-body">
          <div class="ln muted">---</div>
          <div class="ln fm" data-lift="name" data-frame-pad="6"><span class="k">name:</span> <span class="v">cover-workflow</span></div>
          <div class="ln fm" data-lift="desc" data-frame-pad="6"><span class="k">description:</span> <span class="v">当用户要统一视觉规范做封面时使用</span></div>
          <div class="ln muted">---</div>
          <div class="ln"><span class="h">## 工作步骤</span></div>
          <div class="ln">1. 确认标题和图片素材</div>
          <div class="ln">2. 读取视觉规范，定比例、字体、配色</div>
          <div class="ln">3. 生成候选版本</div>
          <div class="ln">4. 检查裁切与风格，按约定交付</div>
        </div>
      </div>

      <div class="c-tag is-yellow l-abs lab lab-name">Skill 的名字</div>
      <div class="c-tag is-yellow l-abs lab lab-desc">决定 AI 什么时候调用它</div>
      <div class="l-abs hero-req"><div class="c-hero is-md"><span class="skew">两个必填项</span></div></div>`,
    cues: [
      // Beat A —— 文件树
      { at: 0.10, sel: '.tree', fx: 'pop' },
      { at: 0.30, sel: '.r-root', fx: 'rise' },
      { at: 0.50, sel: '.r-key', fx: 'rise' },
      { at: 0.70, sel: '.r-key .c-pill', fx: 'pop' },
      { at: 0.85, sel: '.r-opt', fx: 'rise', stagger: 0.08 },
      { at: 0.95, sel: '.beat-a .c-pill', fx: 'pop' },
      { at: 1.05, sel: '.beat-a .c-hero', fx: 'slam' },
      { at: 1.40, sel: '.beat-a .plus', fx: 'rise' },
      { at: 1.70, sel: '.beat-a .c-frame', fx: 'draw' },
      // Beat B —— 打开 SKILL.md
      { at: 2.85, sel: '.beat-a', fx: 'out' },
      { at: 2.95, sel: '.r-root, .r-opt', fx: 'recede' },
      { at: 3.00, sel: '.doc', fx: 'pop' },
      { at: 3.95, sel: '.doc', fx: 'dim' },            // 铁律：出现 ≤1s 压暗
      { at: 4.00, sel: '[data-lifted="name"]', fx: 'pop' },
      { at: 4.10, sel: '[data-lifted="name"]', fx: 'draw' },
      { at: 4.15, sel: '[data-lifted="desc"]', fx: 'pop' },
      { at: 4.25, sel: '[data-lifted="desc"]', fx: 'draw' },
      { at: 4.35, sel: '.lab', fx: 'pop', stagger: 0.1 },
      { at: 4.60, sel: '.hero-req .c-hero', fx: 'slam' },
    ],
    subs: [
      { from: 0.1, to: 2.8, text: '最简单的 Skill，就是一个文件夹 + SKILL.md' },
      { from: 4.0, to: 6.9, text: '最上方两个必填项：name 和 description' },
    ],
  });
})();
