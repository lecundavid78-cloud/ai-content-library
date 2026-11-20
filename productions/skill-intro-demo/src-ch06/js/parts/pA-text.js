/* 第六章 · 部分 A（浅）· 章内 0.00–35.90s（原片 415.56–451.46）
   文案：「Skill 和普通 Prompt 到底有什么区别？……而不是赋予模型新能力」
   出现：居中大字「跟 Prompt 差在哪？」
   变化：大字上移，原地换成「只是换了个马甲？」「分两种情况看」「第一种：纯文字」
         → 左边一张只有 SKILL.md 的白卡，底部标「没有脚本 · 没有模板」
         →「把步骤复制进聊天框」：中间出现「复制 →」，右边聊天框立起、粘进内容
         →「相同的模型、工具和素材」：下方条件芯片 →「AI 同样能照着做」：两张卡都打 √
         →「（可能有细微差异）」：条件芯片补上「加载方式不同，可能有细微差异」
         →「不会因为放进文件夹就变魔法」→「价值：存下来、按需调用」：SKILL.md 卡底部原地改成「存下来 · 按需调用」
         →「而不是赋予模型新能力」
   消失：35.45s 整组退场 */
(function () {
  const I = Studio.icon;
  const sk = (ws) => ws.map((w) => `<div class="c-skel l" style="width:${w}%"></div>`).join('');
  Studio.scene({
    id: 'pA-text', stage: 'light', span: [0, 35.90],
    chapter: { no: '06', title: 'Skill 和 Prompt 的区别' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">跟 Prompt <em>差在哪</em>？</div>
        <div data-state="b" class="c-hero c-type">只是<em>换了个马甲</em>？</div>
        <div data-state="c" class="c-hero c-type">分<em>两种情况</em>看</div>
        <div data-state="d" class="c-hero c-type">第一种：<em>纯文字</em></div>
        <div data-state="e" class="c-hero c-type">AI <em>同样能照着做</em></div>
        <div data-state="f" class="c-hero c-type">放进文件夹，<em>不会变魔法</em></div>
        <div data-state="g" class="c-hero c-type">价值：<em>存下来，按需调</em></div>
        <div data-state="h" class="c-hero c-type">不是<em>新能力</em></div>
      </div></div>
      <div class="c-card is-white wcard md">
        <div class="hd"><span class="card-t">只有 SKILL.md</span><span class="mono-t">纯文字</span></div>
        ${sk([70, 92, 84, 60])}
        <div class="ft"><div class="c-morph is-start fm">
          <div data-state="a" class="row"><span class="c-pill is-sm is-ghost">没有脚本</span><span class="c-pill is-sm is-ghost">没有模板</span></div>
          <div data-state="b" class="row"><span class="c-pill is-sm v">✓ 存下来</span><span class="c-pill is-sm v">✓ 按需调用</span></div>
        </div></div>
        <div class="c-badge b1">${I('check')}</div>
      </div>
      <div class="l-at copy"><span class="ar">→</span>复制</div>
      <div class="c-card is-white wcard chat">
        <div class="hd"><span class="card-t">聊天框</span><span class="mono-t">Prompt</span></div>
        <div class="msg">${sk([88, 72, 94, 56])}</div>
        <div class="inp">把步骤直接粘进来…</div>
        <div class="c-badge b2">${I('check')}</div>
      </div>
      <div class="l-at row-c cond"><div class="c-chip"><span class="c-morph is-start cm">
        <span data-state="a">同一个模型 · 同样的工具 · 同样的素材</span>
        <span data-state="b">加载方式不同，可能有<em style="font-style:normal;color:var(--violet)">细微差异</em></span>
      </span></div></div>`,
    cues: [
      { at: 0.10, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // Skill 和普通 Prompt 0.10
      { at: 2.80, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 4.88, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 换了个马甲 7.00
      { at: 8.02, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },      // 两种情况 8.68
      { at: 9.74, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },      // 第一种 9.82
      { at: 10.00, sel: '.md', fx: 'tilt' },                               // 纯文字 11.18
      { at: 13.30, sel: '.md .fm [data-state=a]', fx: 'soft' },            // 既没脚本也没模板 13.34
      { at: 16.56, sel: '.copy', fx: 'in' },                               // 复制进聊天框 18.02
      { at: 17.00, sel: '.chat', fx: 'tilt' },
      { at: 18.00, sel: '.chat .msg .c-skel', fx: 'soft', stagger: 0.12 },
      { at: 19.20, sel: '.cond .c-chip', fx: 'in' },                       // 相同的模型 19.18
      { at: 21.94, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 同样能照着做 22.16
      { at: 22.20, sel: '.md .b1, .chat .b2', fx: 'badge', stagger: 0.15 },
      { at: 25.70, sel: '.cond .cm', fx: 'state', to: 'b' },               // 细微差异 25.80
      { at: 26.70, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 文字不会因为放进文件夹 26.70
      { at: 30.74, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // 主要是把规则存下来 30.74
      { at: 31.40, sel: '.md .fm', fx: 'state', to: 'b' },                 // 把规则存下来 31.46
      { at: 31.50, sel: '.chat, .copy, .cond', fx: 'recede' },
      { at: 33.86, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },     // 而不是赋予模型新能力 33.86
    ],
  });
})();
