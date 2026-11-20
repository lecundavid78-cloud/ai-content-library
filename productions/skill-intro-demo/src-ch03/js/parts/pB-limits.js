/* 第三章 · 部分 B（浅）· 章内 67.80–91.55s（原片 244.95–268.00 + 0.7s 片尾）
   文案：「后面这三个文件夹都不是必填的……Skill 提供的是方法包，不能凭空突破运行环境的限制」
   出现：居中大字「三个文件夹，都可选」
   变化：大字上移 → 左边「只有说明书」的小文件夹卡 → 右边「完整工作包」四件套卡，两张都打 √
         →「但要记住」：左卡退场，右卡移到中间 →「把脚本放进 Skill ≠ 获得运行权限」：只留 scripts 亮着
         →「平台不支持跑代码」「缺工具和依赖」：下方两条环境提示依次出现 →「脚本照样跑不通」：scripts 打红 ×
         →「Skill 提供的是方法包」：四行恢复 →「不能突破运行环境的限制」
   消失：本章结尾 91.10s（outro），之后接第四章 */
(function () {
  const I = Studio.icon;
  const F = I('folder', '#E8B54F'), FILE = I('file', '#A891FF');
  Studio.scene({
    id: 'pB-limits', stage: 'light', span: [67.80, 91.55], outro: true,
    chapter: { no: '03', title: '其他文件有什么用' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">三个文件夹，<em>都可选</em></div>
        <div data-state="b" class="c-hero c-type">只有说明书，<em>也是 Skill</em></div>
        <div data-state="c" class="c-hero c-type">也可以是<em>完整工作包</em></div>
        <div data-state="d" class="c-hero c-type">但要记住</div>
        <div data-state="e" class="c-hero c-type">放了脚本 ≠ <em>能运行</em></div>
        <div data-state="f" class="c-hero c-type">环境不支持，<em class="red">跑不通</em></div>
        <div data-state="g" class="c-hero c-type">Skill 是<em>方法包</em></div>
        <div data-state="h" class="c-hero c-type">不能<em>突破环境限制</em></div>
      </div></div>
      <div class="c-card is-morph fold mini1"><div class="face">
        <div class="head">${F}cover-workflow/</div>
        <div class="c-file">${FILE}<span class="name">SKILL.md</span></div>
      </div><div class="c-badge bok">${I('check')}</div></div>
      <div class="l-at cap cap1" style="left:470px;width:400px;top:566px"><span class="c-pill is-sm">只有一份说明书</span></div>
      <div class="c-card is-morph fold mini2"><div class="face">
        <div class="head">${F}cover-workflow/</div>
        <div class="c-file m0">${FILE}<span class="name">SKILL.md</span></div>
        <div class="c-file m1">${F}<span class="name">scripts/</span><div class="c-badge is-red bx">${I('cross')}</div></div>
        <div class="c-file m2">${F}<span class="name">references/</span></div>
        <div class="c-file m3">${F}<span class="name">assets/</span></div>
      </div><div class="c-badge bok">${I('check')}</div></div>
      <div class="l-at cap cap2" style="left:1010px;width:440px;top:770px"><span class="c-pill is-sm">带齐代码、资料、素材的完整工作包</span></div>
      <div class="env e1"><div class="c-chip">当前平台<span class="bad">不支持跑代码</span><span class="no">${I('cross')}</span></div></div>
      <div class="env e2"><div class="c-chip">缺少对应的<span class="bad">工具和依赖</span><span class="no">${I('cross')}</span></div></div>`,
    cues: [
      { at: 67.85, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 不是必填 69.33
      // 只有说明书 / 完整工作包
      { at: 70.35, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 只有一份说明书 71.03
      { at: 70.35, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 70.60, sel: '.mini1', fx: 'tilt' },
      { at: 71.20, sel: '.cap1 .c-pill', fx: 'in' },
      { at: 72.35, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 也可以是 72.39
      { at: 72.55, sel: '.mini2', fx: 'tilt' },
      { at: 73.10, sel: '.mini2 .c-file', fx: 'in', stagger: 0.25 },
      { at: 74.70, sel: '.cap2 .c-pill', fx: 'in' },                       // 完整工作包 74.73
      { at: 75.00, sel: '.mini1 > .bok, .mini2 > .bok', fx: 'badge', stagger: 0.15 },
      // 但要记住：放了脚本 ≠ 能运行
      { at: 75.85, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 但要记住 75.91
      { at: 75.85, sel: '.cap1, .cap2', fx: 'out' },
      { at: 75.85, sel: '.mini1', fx: 'move', to: { x: 430, o: 0 } },
      { at: 75.85, sel: '.mini2 > .bok', fx: 'unbadge' },
      { at: 76.00, sel: '.mini2', fx: 'move', to: { x: 660, y: 300, w: 600 }, dur: 1000 },
      { at: 76.77, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 把脚本放进 Skill 76.77
      { at: 77.00, sel: '.m0, .m2, .m3', fx: 'recede' },
      // 环境不支持
      { at: 80.53, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 如果当前平台 80.53
      { at: 81.80, sel: '.e1 .c-chip', fx: 'in' },                         // 不支持跑代码 81.95
      { at: 84.55, sel: '.e2 .c-chip', fx: 'in' },                         // 依赖 84.69
      { at: 85.85, sel: '.m1 .bx', fx: 'badge' },                          // 跑不通 85.95
      // 方法包，不能突破环境限制
      { at: 86.75, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // Skill 提供的是方法包 86.75
      { at: 87.00, sel: '.m0, .m2, .m3', fx: 'restore' },
      { at: 87.00, sel: '.e1, .e2', fx: 'recede' },
      { at: 88.53, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },     // 不能凭空突破 88.53
    ],
  });
})();
