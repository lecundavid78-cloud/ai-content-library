/* 第四章 · 部分 A（浅）· 章内 0.00–16.40s（原片 268.00–284.40）
   文案：「AI 是怎么发现和调用 Skill 的？……先让平台识别到这个 Skill」
   出现：居中大字「AI 怎么发现 Skill？」
   变化：大字上移 → 左「桌面」卡里有一个 cover-workflow/ 文件夹，右「平台 · Skills 目录」卡是空的
         →「桌面随便建的文件夹，AI 是看不见的」→「按规则导入 / 放进指定目录」：同一个文件夹从桌面移进 Skills 目录，桌面退后
         →「先让平台识别到」：目录卡打 √，标「已识别」
   消失：15.95s 整组退场 */
(function () {
  const I = Studio.icon;
  Studio.scene({
    id: 'pA-find', stage: 'light', span: [0, 16.40],
    chapter: { no: '04', title: 'AI 怎么调用 Skill' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">AI 怎么<em>发现</em> Skill？</div>
        <div data-state="b" class="c-hero c-type">先得被 AI <em>看见</em></div>
        <div data-state="c" class="c-hero c-type">放在桌面？<em class="red">看不见</em></div>
        <div data-state="d" class="c-hero c-type">放进<em>指定目录</em></div>
        <div data-state="e" class="c-hero c-type">平台<em>识别</em>到它</div>
      </div></div>
      <div class="c-card is-white desk"><div class="card-t">桌面</div></div>
      <div class="c-card is-morph dir"><div class="face">
        <div class="card-t">平台 · Skills 目录</div><div class="path">~/skills/</div><div class="drop"></div>
        <div class="ok-tag"><span class="c-pill is-sm is-white">已识别</span></div>
      </div><div class="c-badge">${I('check')}</div></div>
      <div class="l-at fchip">${I('folder', '#E8B54F')}cover-workflow/</div>
      <div class="l-at eye"><span class="c-pill is-sm">AI：看不见这个文件夹</span></div>`,
    cues: [
      { at: 0.30, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // AI 是怎么发现 0.30
      { at: 2.70, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 搞懂了结构 2.80
      { at: 2.70, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 3.20, sel: '.desk', fx: 'tilt' },
      { at: 3.60, sel: '.fchip', fx: 'in' },
      { at: 4.00, sel: '.dir', fx: 'tilt' },
      { at: 6.50, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },      // 首先，在桌面 6.52
      { at: 9.40, sel: '.eye .c-pill', fx: 'in' },                         // 看不见 9.50
      { at: 10.18, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 你得按所用软件的规则 10.18
      { at: 12.10, sel: '.eye .c-pill', fx: 'out' },                       // 导入 12.15
      { at: 12.10, sel: '.fchip', fx: 'move', to: { x: 1062, y: 520 }, dur: 1100 },
      { at: 12.30, sel: '.desk', fx: 'recede' },
      { at: 14.20, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 先让平台识别到 14.20
      { at: 14.95, sel: '.dir > .c-badge', fx: 'badge' },                  // 识别到 15.02
      { at: 15.10, sel: '.ok-tag .c-pill', fx: 'soft' },
    ],
  });
})();
