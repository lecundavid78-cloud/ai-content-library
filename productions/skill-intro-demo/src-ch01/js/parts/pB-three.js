/* 第一章 · 部分 B（浅）· 29.70–67.25s · 让 AI 干活的三件事 → Skill 管第二件
   口播：「平时让 AI 干活，其实就三件事……按什么标准交付」
   出现：三张问号卡（01 / 02 / 03）
   变化：第一 / 第二 / 第三依次揭晓：做什么 → 怎么做 → 用什么做，各自补上例子和标签
         → 讲到「Skill 解决的核心就是第二件事」：1、3 退后，第 2 张被点名
         → 「打包好」：1、3 让开，第 2 张原地放大、翻成方法包，五行随口播逐行填满，打 √
   消失：66.80s 整组退场 */
(function () {
  const I = Studio.icon;
  const card = (n, word, ex, tag) => `
    <div class="c-card is-morph q q${n}">
      <div class="face f-q">
        <span class="no">0${n}</span>
        <div class="big c-morph is-start"><span data-state="a" class="dim">？</span><span data-state="b">${word}</span></div>
        <div class="ex">${ex}</div>
        <div class="tag"><span class="c-pill is-sm is-white">${tag}</span></div>
      </div>
      ${n === 2 ? `
      <div class="face f-sop" style="padding:28px 30px">
        <div class="head"><span>怎么做 · 方法和标准</span><span class="c-morph pk"><span data-state="a" class="c-pill is-sm is-white">打包成 Skill</span><span data-state="b" class="c-pill is-sm is-white">合适时自动调用</span></span></div>
        ${['什么时候用', '分哪几步', '查什么资料', '报错怎么处理', '按什么标准交付'].map((r, i) =>
          `<div class="c-row is-slot s${i + 1}"><span class="fill"><span class="no">0${i + 1}</span>${r}</span></div>`).join('')}
      </div>
      <div class="c-badge bok">${I('check')}</div>` : ''}
    </div>`;
  Studio.scene({
    id: 'pB-three', stage: 'light', span: [29.70, 67.25],
    chapter: { no: '01', title: '为什么需要 Skill' },
    html: `
      <div class="ttl"><div class="c-morph">
        <div data-state="a" class="c-title c-type">让 AI 干活，就<em>三件事</em></div>
        <div data-state="b" class="c-title c-type">Skill 管的是<em>第二件</em></div>
        <div data-state="c" class="c-title c-type">把方法和标准<em>打包好</em></div>
        <div data-state="d" class="c-title c-type">它会告诉 AI <em>怎么干</em></div>
      </div></div>
      ${card(1, '做什么', '「帮我做 PPT 封面」', '任务要求')}
      ${card(2, '怎么做', '分析标题 → 定布局<br>→ 统一风格生图', '工作流程')}
      ${card(3, '用什么做', '生图工具 · 运行代码<br>· 设计软件', '工具和环境')}
      <div class="l-at skill-pin"><span class="c-pill is-sm"><em>Skill</em> 管这一件</span></div>`,
    cues: [
      { at: 29.95, sel: '.ttl [data-state=a]', fx: 'type' },          // 平时让 29.88
      { at: 31.40, sel: '.q', fx: 'tilt', stagger: 0.18 },            // 三件事 31.90
      { at: 33.45, sel: '.q1 .big', fx: 'state', to: 'b' },          // 做什么 33.54
      { at: 34.75, sel: '.q1 .ex', fx: 'soft' },                      // 帮我做 34.78
      { at: 37.10, sel: '.q1 .tag', fx: 'soft' },                     // 任务要求 37.14
      { at: 38.75, sel: '.q2 .big', fx: 'state', to: 'b' },          // 怎么做 38.84
      { at: 40.00, sel: '.q2 .ex', fx: 'soft' },                      // 先分析 40.02
      { at: 44.00, sel: '.q2 .tag', fx: 'soft' },                     // 核心工作流程 44.04
      { at: 46.20, sel: '.q3 .big', fx: 'state', to: 'b' },          // 用什么做 46.28
      { at: 47.70, sel: '.q3 .ex', fx: 'soft' },                      // 生图工具 47.73
      { at: 51.20, sel: '.q3 .tag', fx: 'soft' },                     // 工具和环境 51.24
      // Skill 管第二件
      { at: 52.90, sel: '.ttl .c-morph', fx: 'state', to: 'b' },     // 而 Skill 52.90
      { at: 53.20, sel: '.q1, .q3', fx: 'move', to: { o: 0.3 } },
      { at: 54.20, sel: '.skill-pin .c-pill', fx: 'in' },             // 第二件事 54.28
      // 打包好：第 2 张原地放大、翻成方法包
      { at: 55.20, sel: '.ttl .c-morph', fx: 'state', to: 'c' },
      { at: 55.30, sel: '.skill-pin .c-pill', fx: 'out' },
      { at: 55.40, sel: '.q1', fx: 'move', to: { x: 416, o: 0 } },
      { at: 55.40, sel: '.q3', fx: 'move', to: { x: 1184, o: 0 } },
      { at: 55.55, sel: '.q2', fx: 'move', to: { x: 600, y: 316, w: 720, h: 478 }, dur: 1000 },
      { at: 55.55, sel: '.q2 .f-q', fx: 'out' },
      { at: 55.95, sel: '.q2 .f-sop', fx: 'soft' },
      { at: 56.80, sel: '.q2 .pk', fx: 'soft' },                      // 打包好 56.84
      { at: 58.50, sel: '.q2 .pk', fx: 'state', to: 'b' },           // 合适的时候 58.55
      { at: 60.00, sel: '.ttl .c-morph', fx: 'state', to: 'd' },     // 它会告诉 60.06
      { at: 61.36, sel: '.q2 .s1', fx: 'fill' },                      // 什么时候用 61.42
      { at: 62.74, sel: '.q2 .s2', fx: 'fill' },                      // 分哪几步 62.80
      { at: 63.68, sel: '.q2 .s3', fx: 'fill' },                      // 查什么资料 63.74
      { at: 64.70, sel: '.q2 .s4', fx: 'fill' },                      // 报错 64.76
      { at: 65.84, sel: '.q2 .s5', fx: 'fill' },                      // 按什么标准 65.90
      { at: 66.30, sel: '.q2 .bok', fx: 'badge' },
    ],
  });
})();
