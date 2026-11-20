/* 第七章 · 部分 A（浅）· 章内 0.00–42.36s（原片 500.50–542.86）
   文案：「什么样的任务值得做成 Skill？……不能把一句模糊的口号自动变成好方法」
   出现：居中大字「什么任务值得做？」
   变化：大字上移 →「就看两条标准」：顶部两枚标准芯片（高频重复 / 流程和标准明确）随口播出现
         → 四个适合的例子依次立起（项目周报 / 检查 PPT / 论文笔记 / 视频封面）→「做成 Skill 最划算」：四个都打 √
         →「两种情况没必要」：四个例子退后，下方两张虚线卡：一次性任务（×）/ 流程和验收标准没想清楚（×）
           → 第二张原地改成「只写一句『请用最专业的方法完成任务』」
         →「只能保存和复用方法」→「模糊口号变不成好方法」
   消失：41.91s 整组退场 */
(function () {
  const I = Studio.icon;
  const good = (k, t) => `<div class="c-card tile ${k}">${I('file', '#A891FF')}${t}<div class="c-badge ok">${I('check')}</div></div>`;
  Studio.scene({
    id: 'pA-worth', stage: 'light', span: [0, 42.36],
    chapter: { no: '07', title: '值不值得做 + 总结' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">什么任务<em>值得做</em>？</div>
        <div data-state="b" class="c-hero c-type">就看<em>两条标准</em></div>
        <div data-state="c" class="c-hero c-type">已有<em>稳定方法</em></div>
        <div data-state="d" class="c-hero c-type">做成 Skill <em>最划算</em></div>
        <div data-state="e" class="c-hero c-type">两种情况<em class="red">没必要</em></div>
        <div data-state="f" class="c-hero c-type">只能<em>保存和复用</em>方法</div>
        <div data-state="g" class="c-hero c-type">口号<em class="red">变不成</em>好方法</div>
      </div></div>
      <div class="l-at row-c crit"><div class="c-chip k1"><span class="n">①</span>高频重复</div><div class="c-chip k2"><span class="n">②</span>流程和标准明确</div></div>
      ${good('g1', '每周固定格式的项目周报')}${good('g2', '按统一规范检查 PPT')}${good('g3', '论文批量整理成同款笔记')}${good('g4', '长期按统一风格做封面')}
      <div class="c-card tile bad b1"><span class="q">一次性任务</span>翻译一句、随手一问<div class="c-badge is-red">${I('cross')}</div></div>
      <div class="c-card tile bad b2"><span class="c-morph is-start bm"><span data-state="a"><span class="q">没想清楚</span> 流程和验收标准</span><span data-state="b">「请用最专业的方法完成」</span></span><div class="c-badge is-red">${I('cross')}</div></div>`,
    cues: [
      { at: 0.20, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // 值得做成 Skill 1.10
      { at: 2.48, sel: '.hero-wrap', fx: 'move', to: { y: 112, s: 0.68 }, dur: 1000 },
      { at: 4.40, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 两条标准 4.66
      { at: 5.75, sel: '.crit .k1', fx: 'in' },                            // 高频重复 5.80
      { at: 7.02, sel: '.crit .k2', fx: 'in' },                            // 流程和标准明确 7.08
      { at: 10.10, sel: '.tile.g1', fx: 'tilt' },                          // 项目周报 10.18
      { at: 11.75, sel: '.tile.g2', fx: 'tilt' },                          // 检查 PPT 11.82
      { at: 13.05, sel: '.tile.g3', fx: 'tilt' },                          // 论文 13.08
      { at: 16.62, sel: '.tile.g4', fx: 'tilt' },                          // 视频封面 16.70
      { at: 17.54, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 稳定方法 18.94
      { at: 21.88, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 做成 Skill 就最划算 21.88
      { at: 22.65, sel: '.tile .ok', fx: 'badge', stagger: 0.12 },         // 最划算 22.74
      // 反过来：没必要
      { at: 23.56, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 反过来 23.56
      { at: 25.10, sel: '.tile.g1, .tile.g2, .tile.g3, .tile.g4', fx: 'recede' },  // 完全没必要 25.14
      { at: 26.86, sel: '.tile.b1', fx: 'tilt' },                          // 一是偶尔翻译 26.86
      { at: 29.62, sel: '.tile.b1 .c-badge', fx: 'badge' },                // 一次性任务 29.68
      { at: 30.62, sel: '.tile.b2', fx: 'tilt' },                          // 二是你自己都没想清楚 30.62
      { at: 32.62, sel: '.tile.b2 .c-badge', fx: 'badge' },                // 验收标准 32.68
      { at: 34.70, sel: '.tile.b2 .bm', fx: 'state', to: 'b' },            // 最专业的方法 34.78
      { at: 36.10, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 只能帮你保存 37.54
      { at: 39.52, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // 模糊的口号 40.32
    ],
  });
})();
