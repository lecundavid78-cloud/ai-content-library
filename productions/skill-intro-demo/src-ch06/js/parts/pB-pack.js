/* 第六章 · 部分 B（浅）· 章内 35.90–63.55s（原片 451.46–479.11）
   文案：「第二种：带配套资源的 Skill……所有关联任务立刻同步生效」
   出现：居中大字「第二种：带配套资源」
   变化：大字上移 → 左边深色工作包文件夹卡，SKILL.md 一行；随口播逐行长出 references（几十页参考资料）/ assets（固定模板）/ scripts（写好的脚本）
         → 右边聊天框「只复制几行文字」→「无法复现完整流程」：聊天框打红 ×
         →「完整工作包的优势」：聊天框退场，卡片打 √ →「规则、文件、程序绑在一起」：下方标注
         →「想改规则，比如统一换字体」：右侧三个封面任务（旧字体）→「不用翻聊天记录」：虚线「翻聊天记录」打红 ×
         →「直接改一次 Skill 里的规范」：references 那一行原地改成「字体：新」→「所有关联任务同步生效」：三个任务依次变成新字体 ✓
   消失：63.10s 整组退场 */
(function () {
  const I = Studio.icon;
  const F = I('folder', '#E8B54F'), FILE = I('file', '#A891FF');
  const task = (k, n) => `<div class="c-chip task ${k}">封面 ${n}<span class="c-morph is-start tm"><span data-state="a" class="old">旧字体</span><span data-state="b" class="ok2">新字体 ✓</span></span></div>`;
  Studio.scene({
    id: 'pB-pack', stage: 'light', span: [35.90, 63.55],
    chapter: { no: '06', title: 'Skill 和 Prompt 的区别' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">第二种：<em>带配套资源</em></div>
        <div data-state="b" class="c-hero c-type">复制几行？<em class="red">复现不了</em></div>
        <div data-state="c" class="c-hero c-type"><em>完整工作包</em>的优势</div>
        <div data-state="d" class="c-hero c-type">想统一<em>换字体</em>？</div>
        <div data-state="e" class="c-hero c-type">改一次，<em>全部同步</em></div>
      </div></div>
      <div class="c-card is-morph fold pack"><div class="face">
        <div class="head">${F}cover-workflow/</div>
        <div class="c-file r0">${FILE}<span class="name">SKILL.md</span><span class="role">规则和流程</span></div>
        <div class="c-file r1">${F}<span class="name">references/</span><span class="role"><span class="c-morph is-start rm"><span data-state="a">几十页视觉规范</span><span data-state="b">字体：<span class="ok">已更新 ✓</span></span></span></span></div>
        <div class="c-file r2">${F}<span class="name">assets/</span><span class="role">固定模板</span></div>
        <div class="c-file r3">${F}<span class="name">scripts/</span><span class="role">写好的脚本</span></div>
      </div><div class="c-badge bok">${I('check')}</div></div>
      <div class="c-card is-white wcard chat">
        <div class="hd"><span class="card-t">聊天框</span><span class="mono-t">Prompt</span></div>
        <div class="msg">${[80, 64, 46].map((w) => `<div class="c-skel l" style="width:${w}%"></div>`).join('')}</div>
        <div class="inp">只粘了几行文字…</div>
        <div class="c-badge is-red bx">${I('cross')}</div>
      </div>
      <div class="l-at bind"><span class="c-pill is-sm">规则 · 文件 · 程序，<em>绑在一起</em></span></div>
      ${task('t1', 'A')}${task('t2', 'B')}${task('t3', 'C')}
      <div class="l-at hist"><div class="c-chip">翻以前的聊天记录<span class="no">${I('cross')}</span></div></div>`,
    cues: [
      { at: 35.96, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 第二种 36.04
      { at: 38.40, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 38.60, sel: '.pack', fx: 'tilt' },                             // 如果它还打包了 38.58
      { at: 39.70, sel: '.pack', fx: 'move', to: { h: 232 } },             // 几十页参考资料 39.76
      { at: 39.75, sel: '.pack .r1', fx: 'in' },
      { at: 40.98, sel: '.pack', fx: 'move', to: { h: 308 } },             // 固定模板 41.04
      { at: 41.03, sel: '.pack .r2', fx: 'in' },
      { at: 42.16, sel: '.pack', fx: 'move', to: { h: 384 } },             // 脚本程序 42.22
      { at: 42.21, sel: '.pack .r3', fx: 'in' },
      // 只复制几行 → 复现不了
      { at: 43.10, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 那你只复制几行文字 43.10
      { at: 43.30, sel: '.chat', fx: 'tilt' },
      { at: 45.60, sel: '.chat .bx', fx: 'badge' },                        // 无法复现 45.66
      // 完整工作包的优势
      { at: 47.34, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 这时候，Skill 作为 47.34
      { at: 47.40, sel: '.chat', fx: 'out' },
      { at: 48.80, sel: '.pack .bok', fx: 'badge' },                       // 完整工作包 48.86
      { at: 53.15, sel: '.bind .c-pill', fx: 'in' },                       // 绑在了一起 53.22
      // 改一次，全部同步
      { at: 54.30, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 以后你想改规则 54.30
      { at: 55.00, sel: '.task', fx: 'in', stagger: 0.2 },                 // 统一换字体 56.52
      { at: 57.90, sel: '.hist .c-chip', fx: 'in' },                       // 聊天记录 58.60
      { at: 59.32, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 直接改一次 59.32
      { at: 59.32, sel: '.hist .c-chip', fx: 'recede' },
      { at: 59.60, sel: '.pack .rm', fx: 'state', to: 'b' },               // 改一次 59.66
      { at: 61.66, sel: '.task .tm', fx: 'state', to: 'b', stagger: 0.35 },// 所有关联任务 61.66 → 同步生效 63.08
    ],
  });
})();
