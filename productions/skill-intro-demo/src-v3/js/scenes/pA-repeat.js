/* 部分 A · 深 · 为什么需要 Skill（14s）
   出现：第 1 次交代卡
   变化：卡片退到后面、第 2 张叠上来 → 第 3 张叠上来，配色漏了（×）
         → 前两张合进第 3 张，卡头变成「已存档」，漏掉的配色补上（√）
   标题在同一位置连续换 4 次，不离场
   消失：部分结束才整体虚化退场 */
(function () {
  const I = Studio.icon;
  const rows = (miss) => `
    <div class="c-row"><span class="k">封面</span><span class="v">大标题＋主图</span></div>
    <div class="c-row"><span class="k">字体</span><span class="v">思源黑体</span></div>
    <div class="c-row"><span class="k">配色</span><span class="v">${miss
      ? `<span class="c-morph is-start vm"><span data-state="a" class="bad">没说……</span><span data-state="b">黑＋金</span></span>`
      : '黑＋金'}</span></div>
    <div class="c-row"><span class="k">检查</span><span class="v">不裁切</span></div>`;
  Studio.scene({
    id: 'pA-repeat', stage: 'dark',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 14.0,
    html: `
      <div class="ttl"><div class="c-morph">
        <div data-state="a" class="c-title c-type">第一次，<em>交代清楚</em></div>
        <div data-state="b" class="c-title c-type">换个题目，<em>再打一遍</em></div>
        <div data-state="c" class="c-title c-type">漏说一句，<em class="red">风格跑偏</em></div>
        <div data-state="d" class="c-title c-type">能不能把它<em>存下来</em>？</div>
      </div></div>
      <div class="c-card p-card k1"><div class="head"><span><b>01</b>第 1 次</span><span>周一</span></div><div class="body">${rows()}</div></div>
      <div class="c-card p-card k2"><div class="head"><span><b>02</b>第 2 次</span><span>周三</span></div><div class="body">${rows()}</div></div>
      <div class="c-card p-card k3">
        <div class="head"><span class="c-morph is-start hm">
          <span data-state="a"><b>03</b>第 3 次 · 周五</span>
          <span data-state="b"><b>✓</b>封面方法 · 已存档</span></span></div>
        <div class="body">${rows(true)}</div>
        <div class="c-badge is-red bx">${I('cross')}</div>
        <div class="c-badge bok">${I('check')}</div>
      </div>`,
    cues: [
      // 出现
      { at: 0.20, sel: '.ttl [data-state=a]', fx: 'type' },
      { at: 0.50, sel: '.k1', fx: 'tilt' },
      { at: 1.10, sel: '.k1 .c-row', fx: 'soft', stagger: 0.12 },
      // 变化 1：第 2 次，叠上来
      { at: 3.60, sel: '.ttl .c-morph', fx: 'state', to: 'b' },
      { at: 3.60, sel: '.k1', fx: 'move', to: { y: 334, s: 0.94, o: 0.55 } },
      { at: 3.90, sel: '.k2', fx: 'tilt' },
      { at: 4.40, sel: '.k2 .c-row', fx: 'soft', stagger: 0.1 },
      // 变化 2：第 3 次，漏了配色
      { at: 6.60, sel: '.ttl .c-morph', fx: 'state', to: 'c' },
      { at: 6.60, sel: '.k1', fx: 'move', to: { y: 278, s: 0.88, o: 0.28 } },
      { at: 6.60, sel: '.k2', fx: 'move', to: { y: 334, s: 0.94, o: 0.55 } },
      { at: 6.90, sel: '.k3', fx: 'tilt' },
      { at: 7.40, sel: '.k3 .c-row', fx: 'soft', stagger: 0.1 },
      { at: 8.40, sel: '.k3 .bx', fx: 'badge' },
      // 变化 3：三张合成一张，存下来
      { at: 10.00, sel: '.ttl .c-morph', fx: 'state', to: 'd' },
      { at: 10.00, sel: '.k1, .k2', fx: 'move', to: { y: 392, s: 1, o: 0 } },
      { at: 10.30, sel: '.k3 .hm', fx: 'state', to: 'b' },
      { at: 10.50, sel: '.k3 .bx', fx: 'unbadge' },
      { at: 10.60, sel: '.k3 .vm', fx: 'state', to: 'b' },
      { at: 11.00, sel: '.k3 .bok', fx: 'badge' },
    ],
    subs: [
      { from: 0.3, to: 3.4, text: '第一次，你详细交代了封面、字体、配色和检查标准' },
      { from: 3.6, to: 6.4, text: '下次换个题目，这些要求又得重新打一遍' },
      { from: 6.6, to: 9.8, text: '只要漏说一句，AI 做出来的风格就可能跑偏' },
      { from: 10.0, to: 13.5, text: '那能不能把这套方法存下来，让 AI 照着做？' },
    ],
  });
})();
