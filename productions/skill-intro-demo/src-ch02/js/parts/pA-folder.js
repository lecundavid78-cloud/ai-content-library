/* 第二章 · 部分 A（浅）· 章内 0.00–23.20s（原片 83.50–106.70）· 「Skill 在电脑里到底长什么样？」
   出现：居中大字「Skill 在电脑里长什么样？」
   变化：大字上移成标题 →「别被单词唬住，以为全是复杂代码」：一张代码卡立起
         →「最简单的 Skill 就是一个普通文件夹」：同一张卡收窄、翻成文件夹卡
         → SKILL.md 一行出现，标「纯文本」+「用记事本就能打开」
         →「不一定有代码」：卡片加高，出现一行虚线的 scripts/（不一定有）
         →「但必须有这份 SKILL.md」：虚线行退场、卡片收回，SKILL.md 改标「必需」并打 √
         →「只要格式合规，它就是一个完整的 Skill」：注释换成「只要格式合规 ✓」，卡头标「完整的 Skill」
   消失：22.75s 整组退场，换下一小节 */
(function () {
  const I = Studio.icon;
  Studio.scene({
    id: 'pA-folder', stage: 'light', span: [0, 23.20],
    chapter: { no: '02', title: 'Skill 长什么样' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">Skill 在电脑里<em>长什么样</em>？</div>
        <div data-state="b" class="c-hero c-type">别被<em>代码</em>唬住</div>
        <div data-state="c" class="c-hero c-type">就是一个<em>普通文件夹</em></div>
        <div data-state="d" class="c-hero c-type">不一定有<em>代码</em></div>
        <div data-state="e" class="c-hero c-type">但必须有 <em>SKILL.md</em></div>
        <div data-state="f" class="c-hero c-type">只有它，<em>也算完整</em></div>
      </div></div>
      <div class="c-card is-morph box">
        <div class="face f-code">
          <div class="head"><span>skill_runtime.py</span><span>Python</span></div>
          <div class="ln"><span class="k">from</span> agents <span class="k">import</span> Runtime, Tool</div>
          <div class="ln"><span class="k">class</span> CoverSkill(BaseSkill):</div>
          <div class="ln">    <span class="k">def</span> run(self, ctx, **kw):</div>
          <div class="ln">        plan = ctx.llm.plan(kw[<span class="s">"task"</span>])</div>
          <div class="ln">        <span class="k">for</span> step <span class="k">in</span> plan.steps: …</div>
          <div class="ln">        <span class="k">return</span> Result(ok=<span class="s">True</span>)  <span class="c"># ???</span></div>
        </div>
        <div class="face f-folder">
          <div class="head">${I('folder', '#E8B54F')}cover-workflow/
            <span class="c-morph is-start hm"><span data-state="a"></span><span data-state="b">完整的 Skill</span></span></div>
          <div class="body">
            <div class="c-file r1">${I('file', '#A891FF')}<span class="name">SKILL.md</span>
              <span class="c-morph tag"><span data-state="a" class="c-pill is-sm is-ghost">纯文本</span><span data-state="b" class="c-pill is-sm is-white">必需</span></span></div>
            <div class="c-morph is-start cap"><span data-state="a">用记事本就能打开</span><span data-state="b"><span class="ok">✓</span> 只要格式合规</span></div>
            <div class="c-file is-opt ghost">${I('folder', 'rgba(232,181,79,.5)')}<span class="name">scripts/</span><span class="role">代码</span><span class="c-pill is-sm is-ghost" style="margin-left:14px">不一定有</span></div>
          </div>
        </div>
        <div class="c-badge bok">${I('check')}</div>
      </div>`,
    cues: [
      { at: 0.10, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // Skill 在电脑里 0.18
      // 别被代码唬住
      { at: 2.15, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 别被 2.24
      { at: 2.15, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 2.55, sel: '.box', fx: 'tilt' },
      { at: 3.00, sel: '.f-code .ln', fx: 'soft', stagger: 0.25 },         // 复杂代码 4.56
      // 同一张卡翻成文件夹
      { at: 5.40, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },      // 最简单的 5.46
      { at: 5.40, sel: '.f-code', fx: 'out' },
      { at: 5.45, sel: '.box', fx: 'move', to: { x: 640, y: 340, w: 640, h: 252 }, dur: 1000 },
      { at: 5.85, sel: '.f-folder', fx: 'soft' },
      { at: 9.15, sel: '.r1', fx: 'in' },                                  // 只有一份 9.20
      { at: 10.95, sel: '.r1 .tag [data-state=a]', fx: 'soft' },           // 纯文本 11.00
      { at: 12.40, sel: '.cap [data-state=a]', fx: 'soft' },               // 记事本 12.49
      // 不一定有代码
      { at: 13.80, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 不一定有代码 14.82
      { at: 13.80, sel: '.box', fx: 'move', to: { h: 348 } },
      { at: 14.20, sel: '.ghost', fx: 'in' },
      // 但必须有 SKILL.md
      { at: 15.90, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 但必须有 15.96
      { at: 15.90, sel: '.ghost', fx: 'out' },
      { at: 16.20, sel: '.box', fx: 'move', to: { h: 252 } },
      { at: 16.40, sel: '.r1 .tag', fx: 'state', to: 'b' },
      { at: 16.80, sel: '.box .bok', fx: 'badge' },
      // 只要格式合规，就是一个完整的 Skill
      { at: 18.05, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 哪怕 18.08
      { at: 20.40, sel: '.cap', fx: 'state', to: 'b' },                    // 只要格式合规 20.46
      { at: 22.05, sel: '.hm', fx: 'state', to: 'b' },                     // 完整的 Skill 22.12
    ],
  });
})();
