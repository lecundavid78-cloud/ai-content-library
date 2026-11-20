/* 第一章 · 部分 A（深）· 0.00–29.70s · 开场 → 为什么需要 Skill
   口播：「这是最后一期完整的 Skill 入门教程……这就是 Skill 要解决的问题」
   出现：开场大字「Skill 入门」居中
   变化：大字原位换成「为什么需要 Skill？」→ 讲到「假设你常让 AI 做 PPT」时上移缩成标题
         → 第 1 次交代卡，五行随「封面、字体、配色、排版、检查标准」逐个填入
         → 第 2、3 张叠上来；第 3 张漏了配色（×）→ 三张合成一张「已存档」（√）→ 卡头变成 Skill
   消失：29.25s 整组退场，舞台由深转浅
   所有 at 都是章节内绝对秒数，取自 Studio.TIMELINE.marks（真实口播） */
(function () {
  const I = Studio.icon;
  const ROWS = [['封面', '大标题＋主图'], ['字体', '思源黑体'], ['配色', '黑＋金'], ['排版', '左文右图'], ['检查', '不裁切']];
  const rows = (miss) => ROWS.map(([k, v], i) => `
    <div class="c-row is-slot r${i + 1}"><span class="fill"><span class="k">${k}</span><span class="v">${
      miss && k === '配色' ? `<span class="c-morph is-start vm"><span data-state="a" class="bad">没说……</span><span data-state="b">黑＋金</span></span>` : v
    }</span></span></div>`).join('');
  Studio.scene({
    id: 'pA-why', stage: 'dark', span: [0, 29.70],
    chapter: { no: '01', title: '为什么需要 Skill' },
    html: `
      <div class="eyebrow"><span class="c-pill is-sm is-white">最后一期 · 完整版</span></div>
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">Skill <em>入门</em></div>
        <div data-state="b" class="c-hero c-type">为什么需要 <em>Skill</em>？</div>
        <div data-state="c" class="c-hero c-type">假设你常让 AI 做 <em>PPT</em></div>
        <div data-state="d" class="c-hero c-type">第一次，<em>交代清楚</em></div>
        <div data-state="e" class="c-hero c-type">换个题目，<em>再打一遍</em></div>
        <div data-state="f" class="c-hero c-type">漏说一句，<em class="red">风格跑偏</em></div>
        <div data-state="g" class="c-hero c-type">能不能把它<em>存下来</em>？</div>
        <div data-state="h" class="c-hero c-type">这就是 <em>Skill</em> 要解决的问题</div>
      </div></div>
      <div class="lead"><div class="c-morph">
        <div data-state="a" class="c-lead">小白视角</div>
        <div data-state="b" class="c-lead">从零开始 · 一期讲透</div>
      </div></div>
      <div class="c-card p-card k1"><div class="head"><span><b>01</b>第 1 次</span><span>周一</span></div><div class="body">${rows()}</div></div>
      <div class="c-card p-card k2"><div class="head"><span><b>02</b>第 2 次</span><span>周三</span></div><div class="body">${rows()}</div></div>
      <div class="c-card p-card k3">
        <div class="head"><span class="c-morph is-start hm">
          <span data-state="a"><b>03</b>第 3 次 · 周五</span>
          <span data-state="b"><b>✓</b>封面方法 · 已存档</span>
          <span data-state="c"><b>Skill</b>封面方法 · 随时调用</span></span></div>
        <div class="body">${rows(true)}</div>
        <div class="c-badge is-red bx">${I('cross')}</div>
        <div class="c-badge bok">${I('check')}</div>
      </div>`,
    cues: [
      // 开场
      { at: 0.25, sel: '.eyebrow .c-pill', fx: 'in' },
      { at: 0.45, sel: '.hero-wrap [data-state=a]', fx: 'type' },
      { at: 3.10, sel: '.lead [data-state=a]', fx: 'in' },            // 小白视角 3.24
      { at: 4.30, sel: '.lead .c-morph', fx: 'state', to: 'b' },     // 从零搞懂 4.36
      { at: 6.80, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },// 为什么需要 6.86
      { at: 6.80, sel: '.eyebrow, .lead', fx: 'out' },
      // 大字上移成标题，交代卡出现
      { at: 8.15, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },// 假设 8.22
      { at: 8.15, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 8.70, sel: '.k1', fx: 'tilt' },
      { at: 10.45, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },// 第一次 10.48
      { at: 12.02, sel: '.k1 .r1', fx: 'fill' },                      // 封面 12.08
      { at: 12.65, sel: '.k1 .r2', fx: 'fill' },                      // 字体 12.71
      { at: 13.34, sel: '.k1 .r3', fx: 'fill' },                      // 配色 13.40
      { at: 14.00, sel: '.k1 .r4', fx: 'fill' },                      // 排版 14.06
      { at: 14.58, sel: '.k1 .r5', fx: 'fill' },                      // 检查标准 14.64
      // 第 2 次：再打一遍
      { at: 15.75, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },// 结果下次 15.70
      { at: 16.00, sel: '.k1', fx: 'move', to: { y: 296, s: 0.94, o: 0.55 } },
      { at: 16.30, sel: '.k2', fx: 'tilt' },
      { at: 17.20, sel: '.k2 .c-row', fx: 'fill', stagger: 0.22 },    // 重新打一遍 17.86
      // 第 3 次：漏了配色
      { at: 19.10, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },// 只要漏说 19.12
      { at: 19.10, sel: '.k1', fx: 'move', to: { y: 240, s: 0.88, o: 0.28 } },
      { at: 19.10, sel: '.k2', fx: 'move', to: { y: 296, s: 0.94, o: 0.55 } },
      { at: 19.40, sel: '.k3', fx: 'tilt' },
      { at: 19.95, sel: '.k3 .c-row', fx: 'fill', stagger: 0.2 },
      { at: 21.60, sel: '.k3 .bx', fx: 'badge' },                     // 跑偏 21.74
      // 存下来
      { at: 22.60, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },// 那能不能 22.62
      { at: 23.80, sel: '.k1, .k2', fx: 'move', to: { y: 352, s: 1, o: 0 } }, // 存下来 23.84
      { at: 24.05, sel: '.k3 .hm', fx: 'state', to: 'b' },
      { at: 24.20, sel: '.k3 .bx', fx: 'unbadge' },
      { at: 24.35, sel: '.k3 .vm', fx: 'state', to: 'b' },
      { at: 24.60, sel: '.k3 .bok', fx: 'badge' },
      // 这就是 Skill 要解决的问题
      { at: 27.90, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },// 这就是 27.92
      { at: 28.30, sel: '.k3 .hm', fx: 'state', to: 'c' },            // Skill 28.46
    ],
  });
})();
