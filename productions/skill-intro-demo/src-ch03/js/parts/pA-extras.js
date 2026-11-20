/* 第三章 · 部分 A（浅）· 章内 0.00–67.80s（原片 177.15–244.95）
   文案：「除了 SKILL.md，其他文件有什么用？……一句话总结：SKILL.md 管流程，scripts 放脚本，references 放资料标准，assets 放素材模板」
   出现：居中大字「其他文件有什么用？」
   变化：大字上移 →「跟长提示词有什么区别」：左边长提示词卡 + 右边只有 SKILL.md 的文件夹卡 →「最简单的形态」：中间出现 ≈
         →「进阶的 Skill」：提示词卡退场，同一张文件夹卡移到中间，SKILL.md 标「主说明书」→ 卡片加高，长出三个可选文件夹
         → 逐个讲：被讲到的那一行亮着、其余退后，下方例子区原地换内容：
             scripts（检查图片尺寸 / 批量重命名 → 环境支持时 AI 直接调用）
             references（几十页视觉规范 / 字号·配色·留白 →「全塞进会臃肿」SKILL.md 打红 × → 单独放进 references √ → 只写第几步去查）
             assets（封面模板 / 品牌 Logo / 背景图 / 字体文件 → 直接取用，不跑偏）
         →「一句话总结」：例子区退场，四行全部亮起，用途随口播逐个标上
   消失：67.35s 整组退场 */
(function () {
  const I = Studio.icon;
  const F = (c) => I('folder', c), FILE = I('file', '#A891FF');
  const opt = (k, name) => `<div class="c-file is-opt ${k}">${F('#E8B54F')}<span class="name">${name}</span><span class="role">${{ r1: '放脚本', r2: '放资料标准', r3: '放素材模板' }[k]}</span><span class="c-pill is-sm is-ghost">可选</span>${k === 'r2' ? `<div class="c-badge bok2">${I('check')}</div>` : ''}</div>`;
  const chip = (t, k) => `<div class="c-chip ${k}">${t}</div>`;
  Studio.scene({
    id: 'pA-extras', stage: 'light', span: [0, 67.80],
    chapter: { no: '03', title: '其他文件有什么用' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">其他文件<em>有什么用</em>？</div>
        <div data-state="b" class="c-hero c-type">和<em>长提示词</em>有啥区别？</div>
        <div data-state="c" class="c-hero c-type">最简单时，<em>差不多</em></div>
        <div data-state="d" class="c-hero c-type">进阶的 <em>Skill</em></div>
        <div data-state="e" class="c-hero c-type">还有<em>三个可选文件夹</em></div>
        <div data-state="f" class="c-hero c-type"><em>scripts</em>：放脚本</div>
        <div data-state="g" class="c-hero c-type"><em>references</em>：放资料</div>
        <div data-state="h" class="c-hero c-type"><em>assets</em>：现成素材</div>
        <div data-state="i" class="c-hero c-type">一句话：<em>四个部分</em></div>
      </div></div>
      <div class="c-card is-white prompt"><div class="pt">长提示词</div>
        <div class="c-skel" style="width:96%"></div><div class="c-skel" style="width:88%"></div><div class="c-skel" style="width:72%"></div><div class="c-skel" style="width:54%"></div></div>
      <div class="l-at approx">≈</div>
      <div class="c-card is-morph fold box"><div class="face">
        <div class="head">${F('#E8B54F')}cover-workflow/</div>
        <div class="c-file r0">${FILE}<span class="name">SKILL.md</span><span class="role">管流程</span><span class="c-pill is-sm is-white tag0">主说明书</span><div class="c-badge is-red bx0">${I('cross')}</div></div>
        ${opt('r1', 'scripts/')}${opt('r2', 'references/')}${opt('r3', 'assets/')}
      </div><div class="c-badge bok">${I('check')}</div></div>
      <div class="ex"><div class="c-morph">
        <div data-state="s"><div class="row">${chip('自动检查图片尺寸', 's1')}${chip('按规则批量重命名', 's2')}</div>
          <div class="note sn">环境支持时，AI <em>直接调用</em></div></div>
        <div data-state="r"><div class="row">${chip('几十页的视觉规范', 'f1')}${chip('字号 · 配色 · 留白', 'f2')}</div>
          <div class="note rn">SKILL.md 只写：做到<em>哪一步</em>，去查 <span class="mono">references/</span> 里<em>哪份资料</em></div></div>
        <div data-state="a"><div class="row">${chip('封面模板', 'a1')}${chip('品牌 Logo', 'a2')}${chip('背景图', 'a3')}${chip('字体文件', 'a4')}</div>
          <div class="note an">AI 直接取用，<em>不靠文字描述</em>，不跑偏</div></div>
      </div></div>`,
    cues: [
      { at: 0.11, sel: '.hero-wrap [data-state=a]', fx: 'type' },          // 其他文件 1.87
      // 和长提示词有什么区别
      { at: 3.20, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },      // 可能会问 3.83
      { at: 3.20, sel: '.hero-wrap', fx: 'move', to: { y: 130, s: 0.68 }, dur: 1000 },
      { at: 3.60, sel: '.prompt', fx: 'tilt' },
      { at: 5.80, sel: '.box', fx: 'tilt' },                               // 长提示词 5.83
      { at: 7.50, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },
      { at: 8.90, sel: '.approx', fx: 'soft' },                            // 最简单的形态 8.93
      // 进阶：同一张文件夹卡移到中间、长出三行
      { at: 10.25, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 进阶 10.63
      { at: 10.25, sel: '.prompt, .approx', fx: 'out' },
      { at: 10.40, sel: '.box', fx: 'move', to: { x: 600, y: 270, w: 720, h: 178 }, dur: 1000 },
      { at: 12.90, sel: '.tag0', fx: 'soft' },                             // 主说明书 12.99
      { at: 13.90, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },
      { at: 13.90, sel: '.box', fx: 'move', to: { h: 426 } },
      { at: 14.30, sel: '.r1, .r2, .r3', fx: 'in', stagger: 0.3 },         // 三个可选文件夹 14.81
      // scripts
      { at: 16.27, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 第一个是 scripts 16.35
      { at: 16.30, sel: '.r0, .r2, .r3', fx: 'recede' },
      { at: 19.75, sel: '.ex .s1', fx: 'in' },                             // 检查图片尺寸 19.81
      { at: 21.65, sel: '.ex .s2', fx: 'in' },                             // 批量重命名 21.73
      { at: 27.25, sel: '.ex .sn', fx: 'in' },                             // 直接调用 27.81
      // references
      { at: 28.73, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // 第二个是 references 28.81
      { at: 28.75, sel: '.r1', fx: 'recede' },
      { at: 28.75, sel: '.r2', fx: 'restore' },
      { at: 28.80, sel: '.ex .c-morph', fx: 'state', to: 'r' },
      { at: 33.85, sel: '.ex .f1', fx: 'in' },                             // 几十页 33.93
      { at: 36.20, sel: '.ex .f2', fx: 'in' },                             // 字号 36.25
      { at: 38.30, sel: '.r0', fx: 'restore' },                            // 全塞进 38.33
      { at: 41.10, sel: '.bx0', fx: 'badge' },                             // 臃肿 41.34
      { at: 41.80, sel: '.bx0', fx: 'unbadge' },                           // 单独放进 references 41.85
      { at: 42.10, sel: '.r0', fx: 'recede' },
      { at: 42.10, sel: '.bok2', fx: 'badge' },
      { at: 44.90, sel: '.ex .rn', fx: 'in' },                             // 哪一步去查 45.47
      // assets
      { at: 47.50, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },     // 第三个是 assets 47.57
      { at: 47.50, sel: '.r2', fx: 'recede' },
      { at: 47.50, sel: '.r3', fx: 'restore' },
      { at: 47.50, sel: '.bok2', fx: 'unbadge' },
      { at: 47.55, sel: '.ex .c-morph', fx: 'state', to: 'a' },
      { at: 51.25, sel: '.ex .a1', fx: 'in' },                             // 封面模板 51.31
      { at: 52.33, sel: '.ex .a2', fx: 'in' },                             // 品牌 Logo 52.39
      { at: 53.33, sel: '.ex .a3', fx: 'in' },                             // 背景图 53.39
      { at: 53.96, sel: '.ex .a4', fx: 'in' },                             // 字体文件 54.02
      { at: 56.35, sel: '.ex .an', fx: 'in' },                             // 避免……跑偏 56.33
      // 一句话总结
      { at: 58.17, sel: '.hero-wrap .c-morph', fx: 'state', to: 'i' },     // 一句话总结 58.25
      { at: 58.20, sel: '.ex', fx: 'out' },
      { at: 58.20, sel: '.r0, .r1, .r2', fx: 'restore' },
      { at: 60.30, sel: '.r0 .role', fx: 'soft' },                         // SKILL.md 管流程 60.37
      { at: 62.45, sel: '.r1 .role', fx: 'soft' },                         // scripts 放脚本 62.53
      { at: 64.02, sel: '.r2 .role', fx: 'soft' },                         // references 放资料标准 64.09
      { at: 65.72, sel: '.r3 .role', fx: 'soft' },                         // assets 放素材模板 65.80
      { at: 66.40, sel: '.box > .bok', fx: 'badge' },
    ],
  });
})();
