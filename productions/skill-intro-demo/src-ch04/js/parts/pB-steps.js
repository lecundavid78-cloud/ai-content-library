/* 第四章 · 部分 B（浅）· 章内 16.40–82.60s（原片 284.40–350.60）
   文案：「识别之后，整个调用过程分五步走……串联起来就是：匹配目录 → 读说明书 → 按需调资源 → 工具执行」
   贯穿：顶部五步进度条，讲到哪一步点亮哪一步（已讲过的保持点亮）
   出现：居中大字「整个调用：五步走」
   变化：① 看目录：三张「SKILL.md 全文」卡打 ×（不会全文读一遍）→ 换成一张「Skills 清单」卡，表头 name / description 随口播亮起，
           三个技能（检查 PPT / 处理表格 / 做封面）逐行出现，右侧标「正文 · 未读」
         ② 匹配：指令气泡「帮我按统一风格做张封面」→ description 列被荧光笔扫过 → 另两行退后，cover-workflow 高亮打 √
           →「也支持手动指定」：气泡原地改成 /cover-workflow
         ③ 读说明书：**同一张清单卡原地加高、翻成 SKILL.md 正文**，五个步骤逐行填满
         ④ 调资源：正文卡让到左边，右侧依次调出 references / assets / scripts（标「环境允许」）
         ⑤ 交付：前面的卡退后，交付卡立起 → 检查并输出 √
         → 串起来：舞台清空，四个动作胶囊随口播依次出现
   消失：82.15s 整组退场 */
(function () {
  const I = Studio.icon;
  const STEPS = ['看目录', '匹配任务', '读说明书', '调资源', '工具交付'];
  const ROWS = [['ppt-checker', '检查 PPT 排版'], ['sheet-helper', '处理表格数据'], ['cover-workflow', '按统一规范做封面']];
  const DSTEPS = ['确认标题和素材', '读取视觉规范', '生成候选版本', '检查文字与裁切', '按约定格式交付'];
  const full = (k) => `<div class="c-card is-white full ${k}"><div class="card-t">SKILL.md · 全文</div>
      ${[96, 88, 70, 92, 64, 84, 58].map((w) => `<div class="c-skel" style="width:${w}%"></div>`).join('')}
      <div class="c-badge bxf">${I('cross')}</div></div>`;
  const res = (k, name, desc, pill) => `<div class="c-card res ${k}"><div class="rn">${I('folder', '#E8B54F')}${name}</div><div class="rd">${desc}</div>${pill ? `<span class="c-pill is-sm is-white env">${pill}</span>` : ''}</div>`;
  Studio.scene({
    id: 'pB-steps', stage: 'light', span: [16.40, 82.60],
    chapter: { no: '04', title: 'AI 怎么调用 Skill' },
    html: `
      <div class="hero-wrap ttl"><div class="c-morph">
        <div data-state="a" class="c-hero c-type">整个调用：<em>五步走</em></div>
        <div data-state="b" class="c-hero c-type">第一步：<em>先看目录</em></div>
        <div data-state="c" class="c-hero c-type">不会<em>全文读一遍</em></div>
        <div data-state="d" class="c-hero c-type">先看一份<em>清单</em></div>
        <div data-state="e" class="c-hero c-type">还没看<em>具体步骤</em></div>
        <div data-state="f" class="c-hero c-type">第二步：<em>按任务匹配</em></div>
        <div data-state="g" class="c-hero c-type">选中<em>封面 Skill</em></div>
        <div data-state="h" class="c-hero c-type">也能<em>手动指定</em></div>
        <div data-state="i" class="c-hero c-type">第三步：<em>读主说明书</em></div>
        <div data-state="j" class="c-hero c-type">第四步：<em>按需调资源</em></div>
        <div data-state="k" class="c-hero c-type">第五步：<em>调用工具交付</em></div>
        <div data-state="l" class="c-hero c-type">串起来：<em>四个动作</em></div>
      </div></div>
      <div class="row-c bar">${STEPS.map((s, i) => `<span class="stp t${i + 1}"><span class="no">0${i + 1}</span><span class="fill">${s}</span></span>`).join('')}</div>
      ${full('u1')}${full('u2')}${full('u3')}
      <div class="c-card is-morph box">
        <div class="face f-cat">
          <div class="head"><b>Skills 清单</b><span>只读 name + description</span></div>
          <div class="cols"><span class="c1">name</span><span class="c2"><span class="c-mark">description<i class="hl"></i></span></span></div>
          ${ROWS.map(([n, d], i) => `<div class="cr r${i + 1}">${i === 2 ? '<i class="hl3"></i>' : ''}<span class="nm">${n}</span><span class="ds">${d}</span><span class="lock c-pill is-sm is-ghost">正文 · 未读</span>${i === 2 ? `<div class="c-badge bsel">${I('check')}</div>` : ''}</div>`).join('')}
        </div>
        <div class="face f-doc">
          <div class="head"><span>cover-workflow / SKILL.md</span><span>正文</span></div>
          <div class="h2">## 操作步骤</div>
          ${DSTEPS.map((s, i) => `<div class="dstp d${i + 1}"><span class="fill"><span class="no">0${i + 1}</span>${s}</span></div>`).join('')}
        </div>
      </div>
      <div class="l-at row-c ask"><div class="c-chip"><span class="who">你：</span><span class="c-morph is-start am"><span data-state="a">帮我按统一风格做张封面</span><span data-state="b" class="mono">/cover-workflow  手动指定</span></span></div></div>
      ${res('q1', 'references/', '视觉规范.md · 到这一步再查', '')}
      ${res('q2', 'assets/', '封面模板 · 品牌 Logo · 字体', '')}
      ${res('q3', 'scripts/', 'check_size.py · 自动检查尺寸', '环境允许时')}
      <div class="c-card is-white out"><div class="ot">封面候选 × 3</div><div class="od">生图工具 · 设计软件 · 跑完整个流程</div><div class="od2">已检查 · 按约定格式保存</div><div class="c-badge bout">${I('check')}</div></div>
      <div class="l-at row-c chain"><span class="lk k1">匹配目录</span><span class="ar a1">→</span><span class="lk k2">读说明书</span><span class="ar a2">→</span><span class="lk k3">按需调资源</span><span class="ar a3">→</span><span class="lk k4">工具执行</span></div>`,
    cues: [
      { at: 16.45, sel: '.hero-wrap [data-state=a]', fx: 'type' },         // 识别之后 16.44
      { at: 18.60, sel: '.bar .stp', fx: 'soft', stagger: 0.08 },          // 五步走 18.72
      // ① 先看目录
      { at: 19.30, sel: '.hero-wrap .c-morph', fx: 'state', to: 'b' },     // 第一步 19.44
      { at: 19.30, sel: '.hero-wrap', fx: 'move', to: { y: 112, s: 0.68 }, dur: 1000 },
      { at: 19.45, sel: '.bar .t1', fx: 'fillLight' },
      { at: 21.20, sel: '.hero-wrap .c-morph', fx: 'state', to: 'c' },     // 对话开始时 21.22
      { at: 21.40, sel: '.full', fx: 'tilt', stagger: 0.15 },
      { at: 24.20, sel: '.bxf', fx: 'badge', stagger: 0.1 },               // 全文读一遍 24.26
      { at: 25.25, sel: '.hero-wrap .c-morph', fx: 'state', to: 'd' },     // 而是先看一份清单 25.28
      { at: 25.30, sel: '.full', fx: 'out' },
      { at: 25.55, sel: '.box', fx: 'tilt' },
      { at: 28.20, sel: '.cols .c1', fx: 'soft' },                         // 名称 28.26
      { at: 29.45, sel: '.cols .c2', fx: 'soft' },                         // 简短描述 29.50
      { at: 32.28, sel: '.cr.r1', fx: 'in' },                              // 检查 PPT 32.34
      { at: 33.58, sel: '.cr.r2', fx: 'in' },                              // 处理表格 33.64
      { at: 34.12, sel: '.cr.r3', fx: 'in' },                              // 做封面 34.18
      { at: 35.70, sel: '.hero-wrap .c-morph', fx: 'state', to: 'e' },     // 但还没看具体步骤 35.70
      { at: 35.90, sel: '.cr .lock', fx: 'soft', stagger: 0.12 },
      // ② 按任务匹配
      { at: 37.38, sel: '.hero-wrap .c-morph', fx: 'state', to: 'f' },     // 第二步 37.46
      { at: 37.45, sel: '.bar .t2', fx: 'fillLight' },
      { at: 40.70, sel: '.ask .c-chip', fx: 'in' },                        // 帮我按统一风格 40.84
      { at: 43.20, sel: '.cols .c-mark', fx: 'mark' },                     // 对照清单 43.26
      { at: 44.18, sel: '.hero-wrap .c-morph', fx: 'state', to: 'g' },     // 判断「封面 Skill」44.18
      { at: 45.50, sel: '.cr.r1, .cr.r2', fx: 'recede' },                  // 最匹配 45.58
      { at: 45.55, sel: '.cr .hl3', fx: 'soft' },
      { at: 46.78, sel: '.bsel', fx: 'badge' },                            // 选中它 46.84
      { at: 47.68, sel: '.hero-wrap .c-morph', fx: 'state', to: 'h' },     // 部分平台 47.68
      { at: 48.90, sel: '.ask .am', fx: 'state', to: 'b' },                // 手动指定 49.02
      // ③ 读主说明书：同一张卡翻成正文
      { at: 50.36, sel: '.hero-wrap .c-morph', fx: 'state', to: 'i' },     // 第三步 50.44
      { at: 50.40, sel: '.bar .t3', fx: 'fillLight' },
      { at: 50.40, sel: '.ask .c-chip', fx: 'out' },
      { at: 50.45, sel: '.f-cat', fx: 'out' },
      { at: 50.50, sel: '.box', fx: 'move', to: { x: 580, y: 340, w: 760, h: 470 }, dur: 1000 },
      { at: 50.95, sel: '.f-doc', fx: 'soft' },                            // 选中后 AI 才会打开正文
      { at: 54.10, sel: '.f-doc .h2', fx: 'soft' },                        // 打开 SKILL.md 54.18
      { at: 56.15, sel: '.dstp', fx: 'fillLight', stagger: 0.22 },         // 看具体分哪几步 56.14
      // ④ 按需调资源
      { at: 57.78, sel: '.hero-wrap .c-morph', fx: 'state', to: 'j' },     // 第四步 57.86
      { at: 57.85, sel: '.bar .t4', fx: 'fillLight' },
      { at: 57.90, sel: '.box', fx: 'move', to: { x: 456, w: 560 }, dur: 1000 },
      { at: 62.40, sel: '.res.q1', fx: 'tilt' },                           // 读 references 62.48
      { at: 64.65, sel: '.res.q2', fx: 'tilt' },                           // assets 里拿 64.74
      { at: 65.95, sel: '.res.q3', fx: 'tilt' },                           // 需要跑代码 65.94
      { at: 67.00, sel: '.res.q3 .env', fx: 'soft' },                      // 且环境允许
      // ⑤ 调用工具交付
      { at: 69.36, sel: '.hero-wrap .c-morph', fx: 'state', to: 'k' },     // 第五步 69.44
      { at: 69.40, sel: '.bar .t5', fx: 'fillLight' },
      { at: 69.50, sel: '.box, .res', fx: 'recede' },
      { at: 71.15, sel: '.out', fx: 'tilt' },                              // 结合现有的工具 71.18
      { at: 74.40, sel: '.bout', fx: 'badge' },                            // 检查并输出 74.46
      // 串起来
      { at: 75.82, sel: '.hero-wrap .c-morph', fx: 'state', to: 'l' },     // 串联起来 75.90
      { at: 75.85, sel: '.box, .res, .out', fx: 'out' },
      { at: 77.20, sel: '.chain .k1', fx: 'in' },                          // 匹配目录 77.26
      { at: 78.40, sel: '.chain .a1, .chain .k2', fx: 'in', stagger: 0.08 },// 读说明书 78.46
      { at: 79.52, sel: '.chain .a2, .chain .k3', fx: 'in', stagger: 0.08 },// 按需调资源 79.58
      { at: 80.64, sel: '.chain .a3, .chain .k4', fx: 'in', stagger: 0.08 },// 工具执行 80.70
    ],
  });
})();
