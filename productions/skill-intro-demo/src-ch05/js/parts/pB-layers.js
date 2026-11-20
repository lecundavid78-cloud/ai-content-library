/* 第五章 · 部分 B（浅）· 章内 27.70–56.31s（原片 387.65–415.56 + 0.7s 片尾）
   文案：「所以 Skill 采用了类似『查字典』的分层设计……又不会被无关信息拖垮」
   出现：居中大字「像查字典一样分层」
   变化：大字上移 → 「查字典」分层卡（四层虚线占位）+ 下方占用条
         → 四层随口播逐层翻开：目录（一句 name + description）→ 选中的那份 SKILL.md → 用到的那份参考文档 → 脚本只拿结果，
           每翻一层，占用条只增长一小段 →「代码全文都不用塞」：第四层补上「代码全文 × 不进上下文」
         →「不是零消耗」：注释写明「目录 + 选中的文档，依然占 Token」
         →「能同时挂载大量技能，又不会被拖垮」：分层卡打 √
   消失：本章结尾 55.86s（outro），之后接第六章 */
(function () {
  const I = Studio.icon;
  const L = [
    ['目录', '每个 Skill 只看 name + description'],
    ['选中后', '只读这一份 SKILL.md'],
    ['用到时', '只翻这一份参考文档'],
    ['跑脚本', '只拿运行结果'],
  ];
  Studio.scene({
    id: 'pB-layers', stage: 'light', span: [27.70, 56.31], outro: true,
    chapter: { no: '05', title: '为什么按需加载' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">像<em>查字典</em>一样分层</div>
        <div data-state="b" class="c-hero c-type">先看<em>目录</em></div>
        <div data-state="c" class="c-hero c-type">用到哪份，<em>再读哪份</em></div>
        <div data-state="d" class="c-hero c-type">脚本只要<em>结果</em></div>
        <div data-state="e" class="c-hero c-type">也<em>不是零消耗</em></div>
        <div data-state="f" class="c-hero c-type">挂很多技能，<em>不拖垮</em></div>
      </div></div>
      <div class="c-card is-white layers">
        <div class="hd2"><b>查字典 · 一层一层翻</b><span>用到才加载</span></div>
        ${L.map(([k, t], i) => `<div class="ly y${i + 1}"><span class="fill"><span class="no">0${i + 1}</span>${k}<span class="sub">${
          i === 3 ? `<span class="c-morph is-start l4"><span data-state="a">${t}</span><span data-state="b">${t} · 代码全文 <span class="bad">不进上下文</span></span></span>` : t
        }</span></span></div>`).join('')}
        <div class="c-badge bok">${I('check')}</div>
      </div>
      <div class="c-card is-white ctx">
        <div class="hd"><b>上下文占用</b><span>按需加载后</span></div>
        <div class="track"></div>
        <div class="l-at fl"></div>
        <div class="note"><span class="c-morph is-start nt"><span data-state="a"></span><span data-state="b">目录 + 选中的文档，<em>依然会占 Token</em></span></span></div>
      </div>`,
    cues: [
      { at: 27.75, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 查字典 29.35
      { at: 30.95, sel: '.hero-wrap', fx: 'move', to: { y: 112, s: 0.68 }, dur: 1000 },
      { at: 31.00, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 一开始只看简短目录 31.01
      { at: 31.10, sel: '.layers', fx: 'tilt' },
      { at: 31.40, sel: '.ctx', fx: 'tilt' },
      { at: 31.90, sel: '.ly.y1', fx: 'fillLight' },                       // 简短目录 31.97
      { at: 32.10, sel: '.ctx .fl', fx: 'soft' },
      { at: 32.87, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 选中哪个 32.95
      { at: 33.82, sel: '.ly.y2', fx: 'fillLight' },                       // 再读哪份 33.89
      { at: 33.90, sel: '.ctx .fl', fx: 'move', to: { w: 120 } },
      { at: 36.60, sel: '.ly.y3', fx: 'fillLight' },                       // 再去翻哪份参考文档 36.61
      { at: 36.70, sel: '.ctx .fl', fx: 'move', to: { w: 180 } },
      { at: 38.53, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 甚至运行脚本时 38.53
      { at: 41.10, sel: '.ly.y4', fx: 'fillLight' },                       // 跑完拿结果 41.17
      { at: 41.20, sel: '.ctx .fl', fx: 'move', to: { w: 210 } },
      { at: 42.40, sel: '.ly.y4 .l4', fx: 'state', to: 'b' },              // 代码全文 42.43
      // 不是零消耗
      { at: 44.47, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 当然 44.47
      { at: 49.30, sel: '.ctx .nt', fx: 'state', to: 'b' },                // 依然会占 49.35
      // 不拖垮
      { at: 50.53, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 但这种设计 50.53
      { at: 52.90, sel: '.layers .bok', fx: 'badge' },                     // 大量技能 52.93
    ],
  });
})();
