/* S01 · 深 · 同一套要求，打了三遍
   三张交代卡依次立起 → 主句逐字打出 → 第 3 次漏了配色（唯一的红）→ 一句结论 */
(function () {
  const I = Studio.icon;
  const card = (n, day, bad) => `
    <div class="c-card p-card k${n}">
      <div class="head"><span><b>0${n}</b>第 ${n} 次</span><span>${day}</span></div>
      <div class="body">
        <div class="c-row"><span class="k">封面</span><span class="v">大标题＋主图</span></div>
        <div class="c-row"><span class="k">字体</span><span class="v">思源黑体</span></div>
        ${bad ? `<div class="c-row is-bad"><span class="k">配色</span><span class="v">忘了说</span></div>`
              : `<div class="c-row"><span class="k">配色</span><span class="v">黑＋金</span></div>`}
        <div class="c-row"><span class="k">检查</span><span class="v">不裁切</span></div>
      </div>
      ${bad ? `<div class="c-badge is-red">${I('cross')}</div>` : ''}
    </div>`;
  Studio.scene({
    id: 's01-repeat', stage: 'dark',
    chapter: { no: '01', title: '为什么需要 Skill' },
    duration: 6.0,
    html: `
      <div class="l-at l-center-x ttl"><div class="c-title c-type">要求又得<em>重新打一遍</em></div></div>
      ${card(1, '周一')}${card(2, '周三')}${card(3, '周五', true)}
      <div class="l-at l-center-x note"><span class="c-pill is-sm is-white">漏说一句，风格就跑偏</span></div>`,
    cues: [
      { at: 0.20, sel: '.p-card', fx: 'tilt', stagger: 0.22 },
      { at: 1.30, sel: '.ttl .c-title', fx: 'type' },
      { at: 2.70, sel: '.c-badge', fx: 'badge' },
      { at: 3.20, sel: '.k1, .k2', fx: 'recede' },
      { at: 3.40, sel: '.note .c-pill', fx: 'in' },
    ],
    subs: [
      { from: 0.3, to: 2.9, text: '第一次，你详细交代了封面、字体和配色' },
      { from: 3.0, to: 5.7, text: '下次换个题目，这些要求又得重新打一遍' },
    ],
  });
})();
