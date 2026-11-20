/* 第二章 · 部分 B（浅）· 章内 23.20–94.35s（原片 106.70–177.15 + 0.7s 片尾）· 「SKILL.md 里面到底写了什么？」
   整个小节只有「一张白色文档卡」在原地变化：
   出现：居中大字「SKILL.md 里写了什么？」
   变化：大字上移 → 文档卡立起，前置区两格虚线 → name 填入（标注「Skill 的名字」）→ description 先留空（标注「用途描述」）
         →「最关键的是 description」：name 退后，标注改成「决定 AI 何时调用」
         →「拿 PPT 封面举例」：name 回来 →「只写『帮用户完成设计任务』，范围太宽」：description 填入模糊写法，打红 ×，
           下方三个任务问号（做 PPT / 修图 / 做海报）→「写成『当用户要求按统一视觉规范制作 PPT 封面时使用』」：
           description 原位改写，红 × 撤掉，「做 PPT 封面」对上号 √，另两个退后 →「触发不准，多半是描述没写清」：荧光笔
         →「往下看，正文就是操作步骤」：同一张卡加高、翻到正文面，五个步骤随口播逐行填满 →「大白话写的完整工作流」√
           →「完全不用编程」：卡头改成「不用编程 ✓」
   消失：本章结尾 93.90s（outro），之后接第三章 */
(function () {
  const I = Studio.icon;
  const STEPS = [
    ['确认标题和图片素材', ''],
    ['读取视觉规范', '比例 · 字体 · 配色 · 布局'],
    ['生成候选版本', ''],
    ['检查', '文字 · 裁切 · 风格'],
    ['按约定格式保存交付', ''],
  ];
  Studio.scene({
    id: 'pB-skillmd', stage: 'light', span: [23.20, 94.35], outro: true,
    chapter: { no: '02', title: 'Skill 长什么样' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">SKILL.md 里<em>写了什么</em>？</div>
        <div data-state="b" class="c-hero c-type">打开 <em>SKILL.md</em></div>
        <div data-state="c" class="c-hero c-type">最上方：<em>两个必填项</em></div>
        <div data-state="d" class="c-hero c-type">关键是 <em>description</em></div>
        <div data-state="e" class="c-hero c-type">拿 <em>PPT 封面</em>举例</div>
        <div data-state="f" class="c-hero c-type">范围太宽，<em class="red">分不清</em></div>
        <div data-state="g" class="c-hero c-type">换一种<em>写法</em></div>
        <div data-state="h" class="c-hero c-type">精准<em>对号入座</em></div>
        <div data-state="i" class="c-hero c-type">触发不准？<em>先查描述</em></div>
        <div data-state="j" class="c-hero c-type">往下看：<em>操作步骤</em></div>
        <div data-state="k" class="c-hero c-type">大白话写的<em>工作流</em></div>
        <div data-state="l" class="c-hero c-type">会写提示词，就能写 <em>Skill</em></div>
      </div></div>
      <div class="c-card is-morph doc">
        <div class="face f-front">
          <div class="head"><span>cover-workflow / SKILL.md</span><span>Markdown</span></div>
          <div class="dash">---</div>
          <div class="fld f1"><div class="lab">name</div><div class="fv"><span class="fill"><span class="val mono">cover-workflow</span></span></div></div>
          <div class="fld f2"><div class="lab">description</div><div class="fv"><span class="fill"><span class="c-morph is-start vm">
            <span data-state="a" class="val ph">……</span>
            <span data-state="b" class="val bad">帮用户完成设计任务</span>
            <span data-state="c" class="val">当用户要求按<span class="c-mark">统一视觉规范制作 PPT 封面<i class="hl"></i></span>时使用</span>
          </span></span></div></div>
          <div class="dash">---</div>
          <div class="c-skel" style="width:88%"></div><div class="c-skel" style="width:64%"></div>
        </div>
        <div class="face f-body">
          <div class="head"><span>cover-workflow / SKILL.md</span>
            <span class="c-morph hr"><span data-state="a">Markdown</span><span data-state="b" style="color:var(--violet);font-weight:800">不用编程 ✓</span></span></div>
          <div class="strip">name: cover-workflow · description: 当用户要求按统一视觉规范制作 PPT 封面时使用</div>
          <div class="h2row"><span class="h2">## 操作步骤</span><span class="when">收到封面任务后</span></div>
          ${STEPS.map(([t, sub], i) => `<div class="stp s${i + 1}"><span class="fill"><span class="no">0${i + 1}</span>${t}${sub ? `<span class="sub">${sub}</span>` : ''}</span></div>`).join('')}
        </div>
        <div class="c-badge is-red bx">${I('cross')}</div>
        <div class="c-badge bok">${I('check')}</div>
      </div>
      <div class="l-at callout c1"><span class="c-pill is-sm">Skill 的名字</span></div>
      <div class="l-at callout c2"><span class="c-morph is-start"><span data-state="a" class="c-pill is-sm">用途描述</span><span data-state="b" class="c-pill is-sm">决定 AI <em>何时调用</em></span></span></div>
      <div class="c-chip ask k1"><span class="c-morph is-start km"><span data-state="a">做 PPT <span class="q">?</span></span><span data-state="b">做 PPT 封面</span></span><span class="ok">${I('check')}</span></div>
      <div class="c-chip ask k2">修图 <span class="q">?</span></div>
      <div class="c-chip ask k3">做海报 <span class="q">?</span></div>`,
    cues: [
      { at: 23.35, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // SKILL.md 里面 23.36
      // 打开 SKILL.md：两个必填项
      { at: 25.10, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 打开 25.10
      { at: 25.10, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 25.40, sel: '.doc', fx: 'tilt' },
      { at: 27.55, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },      // 两个必填项 27.72
      { at: 29.15, sel: '.f1 .fv', fx: 'fillLight' },                     // name 29.26
      { at: 29.95, sel: '.c1 .c-pill', fx: 'in' },                          // Skill 的名字 30.18
      { at: 31.85, sel: '.f2 .fv', fx: 'fillLight' },                     // description 31.92
      { at: 33.05, sel: '.c2 [data-state=a]', fx: 'in' },                   // 用途描述 33.18
      // 最关键的是 description
      { at: 35.40, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },      // 最关键的 35.46
      { at: 35.40, sel: '.f1', fx: 'recede' },
      { at: 35.40, sel: '.c1 .c-pill', fx: 'out' },
      { at: 37.45, sel: '.c2 .c-morph', fx: 'state', to: 'b' },             // 直接决定 37.54
      // 拿 PPT 封面举例：模糊写法
      { at: 40.35, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },      // 拿刚才 40.40
      { at: 43.45, sel: '.f1', fx: 'restore' },                             // cover-workflow 43.52
      { at: 45.75, sel: '.f2 .vm', fx: 'state', to: 'b' },                  // 帮用户完成设计任务 45.84
      { at: 47.55, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },      // 范围太宽 47.64
      { at: 47.70, sel: '.doc .bx', fx: 'badge' },
      { at: 49.10, sel: '.k1', fx: 'in' },                                  // 分不清做 PPT 49.26
      { at: 50.65, sel: '.k2', fx: 'in' },                                  // 修图 50.74
      { at: 51.20, sel: '.k3', fx: 'in' },                                  // 做海报 51.26
      // 换一种写法：精准对号入座
      { at: 53.00, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },      // 但如果写成 53.06
      { at: 54.25, sel: '.f2 .vm', fx: 'state', to: 'c' },                  // 当用户要求 54.30
      { at: 54.40, sel: '.doc .bx', fx: 'unbadge' },
      { at: 58.85, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },      // 精准对号入座 58.92
      { at: 58.90, sel: '.k1 .km', fx: 'state', to: 'b' },
      { at: 59.20, sel: '.k1 .ok', fx: 'badge' },
      { at: 59.20, sel: '.k2, .k3', fx: 'recede' },
      { at: 60.20, sel: '.hero-wrap .c-morph', fx: 'state', to: 'i' },      // 触发不准 61.86
      { at: 63.60, sel: '.f2 .c-mark', fx: 'mark' },                        // 没写清楚 63.70
      // 往下看：同一张卡翻到正文
      { at: 64.75, sel: '.hero-wrap .c-morph', fx: 'state', to: 'j' },      // 往下看 64.76
      { at: 64.75, sel: '.c1, .c2, .k1, .k2, .k3, .f-front', fx: 'out' },
      { at: 64.85, sel: '.doc', fx: 'move', to: { x: 560, y: 282, w: 800, h: 596 }, dur: 1000 },
      { at: 65.25, sel: '.f-body', fx: 'soft' },
      { at: 68.75, sel: '.when', fx: 'soft' },                              // 收到封面任务 69.22
      { at: 70.55, sel: '.s1', fx: 'fillLight' },                           // 先确认 70.64
      { at: 73.30, sel: '.s2', fx: 'fillLight' },                           // 读取视觉规范 73.38
      { at: 77.38, sel: '.s3', fx: 'fillLight' },                           // 生成候选版本 77.46
      { at: 78.76, sel: '.s4', fx: 'fillLight' },                           // 检查文字 78.84
      { at: 82.96, sel: '.s5', fx: 'fillLight' },                           // 按约定格式 83.04
      { at: 84.85, sel: '.hero-wrap .c-morph', fx: 'state', to: 'k' },      // 你看 84.90
      { at: 88.15, sel: '.doc .bok', fx: 'badge' },                         // 完整工作流 88.20
      { at: 89.30, sel: '.hero-wrap .c-morph', fx: 'state', to: 'l' },      // 只要你平时会写 89.28
      { at: 91.40, sel: '.hr', fx: 'state', to: 'b' },                      // 不用编程 91.44
    ],
  });
})();
