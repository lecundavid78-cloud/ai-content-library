/* ==========================================================================
   engine.js — 确定性时间轴引擎（无依赖）
   --------------------------------------------------------------------------
   · 所有动画都用 Web Animations API 创建后立即暂停，由一个主时钟统一设置
     currentTime。任意时刻 seek(t) 得到的画面完全一致 → 可逐帧导出成片。
   · 场景 = { id, chapter, duration, html, cues[], subs[] }，见 js/scenes/*.js
   · cue  = { at: 秒(相对场景), sel: CSS 选择器, fx: 动效名, stagger?: 秒 }
   · 动效预设（fx）只在这里定义一次，场景里只写名字 → 全片节奏统一。
   URL 参数：
     ?t=3.2        跳到 3.2s 并暂停（截图 / 审片）
     ?capture=1    1:1 输出 1920×1080，隐藏播放器（导出用）
     ?guides=1     显示安全区 / 主视觉区 / 口播禁区参考线
     ?subs=0       隐藏字幕
     ?slot=key     口播框填纯绿 #00FF00（色键）  ?slot=alpha 透明
     ?loop=1       循环播放        ?autoplay=0  不自动播放
   快捷键：空格 播放/暂停 · ←/→ ±0.5s（Shift ±1 帧）· Home 回到开头
           G 参考线 · S 字幕 · K 口播框模式
   ========================================================================== */
(function () {
  'use strict';

  const S = (window.Studio = window.Studio || {});
  S.scenes = [];
  S.scene = (def) => S.scenes.push(def);
  S.FPS = 30;
  S.EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  S.DEMO_RANGE = [12, 20];          // 本演示的时长约束（lint 用）

  /* ------------------------------------------------------------------
     动效预设 —— 返回 [target, keyframes, duration(ms), options?][]
     规范：入场/强调 250–350ms，统一 S.EASE；不做慢吞吞的淡入淡出。
     只动 opacity / scale / translate / filter / clip-path，
     不碰 transform（组件的 skew 等静态造型放在 transform 上，互不覆盖）。
     ------------------------------------------------------------------ */
  const fx = (S.fx = {
    // 卡片 / 胶囊 / 芯片：弹性缩放入场
    pop: (el) => [[el, [{ opacity: 0, scale: '0.86' }, { opacity: 1, scale: '1' }], 300]],
    // 提炼大字：从大到小「砸」进画面
    slam: (el) => [[el, [{ opacity: 0, scale: '1.42' }, { opacity: 1, scale: '1' }], 320]],
    // 列表行：短距离上推
    rise: (el) => [[el, [{ opacity: 0, translate: '0 26px' }, { opacity: 1, translate: '0 0' }], 280]],
    // 文字擦出（左→右）
    wipe: (el) => [[el, [{ clipPath: 'inset(-30% 100% -30% -4%)' }, { clipPath: 'inset(-30% -4% -30% -4%)' }], 300]],
    // 铁律：文档压暗
    dim: (el) => [[el, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0.25, filter: 'blur(2px)' }], 250]],
    // 退到次要层级（不模糊）
    recede: (el) => [[el, [{ opacity: 1 }, { opacity: 0.4 }], 250]],
    // 出场
    out: (el) => [[el, [{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.92' }], 250]],
    // 错误抖动
    shake: (el) => [[el, [
      { translate: '0 0' }, { translate: '-10px 0' }, { translate: '9px 0' },
      { translate: '-6px 0' }, { translate: '3px 0' }, { translate: '0 0' }], 320, { easing: 'linear' }]],
    // 横向生长（删除线 / 进度条）
    grow: (el) => [[el, [{ scale: '0 1' }, { scale: '1 1' }], 300]],
    // 虚线框绘制（SVG stroke-dashoffset）+ 绘制完成后行军蚁微动
    draw: (el) => {
      const mask = el.querySelector(':scope > svg.dash .dash-mask');
      const line = el.querySelector(':scope > svg.dash .dash-line');
      if (!mask) throw new Error('draw: 目标缺少 .c-frame 虚线框');
      return [
        [mask, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 400],
        [line, [{ strokeDashoffset: 0 }, { strokeDashoffset: -36 }], 1400,
          { easing: 'linear', iterations: Infinity, delay: 400, fill: 'none' }],
      ];
    },
    // 内部：场景 / 字幕显隐
    show: (el) => [[el, [{ opacity: 0 }, { opacity: 1 }], 1, { easing: 'linear' }]],
    subIn: (el) => [[el, [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], 220]],
    subOut: (el) => [[el, [{ opacity: 1 }, { opacity: 0 }], 120, { easing: 'linear' }]],
  });

  /* ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const params = new URLSearchParams(location.search);
  const anims = [];
  const cueLog = [];                // [{abs, el, fx}] —— lint 用
  const touched = new WeakSet();    // 每个目标的第一条动画用 fill:both
  S.lint = [];
  S.t = 0;
  S.playing = false;

  function addAnim(target, keyframes, durMs, absSec, o = {}) {
    const fill = o.fill || (touched.has(target) ? 'forwards' : 'both');
    touched.add(target);
    const a = target.animate(keyframes, {
      duration: durMs,
      delay: absSec * 1000 + (o.delay || 0),
      fill,
      easing: o.easing || S.EASE,
      iterations: o.iterations || 1,
      direction: o.direction || 'normal',
    });
    a.pause();
    anims.push(a);
    return a;
  }
  S.ambient = (target, keyframes, o) => {   // 背景循环动画（星尘等）
    const a = target.animate(keyframes, Object.assign({ fill: 'both', iterations: Infinity }, o));
    a.pause();
    anims.push(a);
  };

  function runFx(name, el, absSec) {
    const preset = fx[name];
    if (!preset) { S.lint.push(`未知动效 fx="${name}"`); return; }
    preset(el).forEach(([target, kf, dur, o]) => addAnim(target, kf, dur, absSec, o));
    cueLog.push({ abs: absSec, el, fx: name });
  }

  /* ------------------------------------------------------------------
     构建：场景 DOM → 组件注入 → 时间轴
     ------------------------------------------------------------------ */
  function buildDom() {
    const host = $('#scenes');
    let t = 0;
    S.scenes.forEach((def) => {
      const sec = document.createElement('section');
      sec.className = 'scene';
      sec.id = def.id;
      sec.innerHTML = def.html + '<div class="lift-layer"></div>';
      host.appendChild(sec);
      def.el = sec;
      def.start = t;
      def.end = t + def.duration;
      t += def.duration;
    });
    S.duration = t;
  }

  function buildTimeline() {
    const cues = [];
    const last = S.scenes[S.scenes.length - 1];

    S.scenes.forEach((def) => {
      cues.push({ abs: def.start, el: def.el, fx: 'show' });
      if (def !== last) cues.push({ abs: def.end - 0.25, el: def.el, fx: 'out' });

      (def.cues || []).forEach((c) => {
        const els = def.el.querySelectorAll(c.sel);
        if (!els.length) S.lint.push(`[${def.id}] 选择器没有命中：${c.sel}`);
        els.forEach((el, k) => cues.push({ abs: def.start + c.at + (c.stagger || 0) * k, el, fx: c.fx }));
      });

      // 字幕
      (def.subs || []).forEach((s) => {
        const d = document.createElement('div');
        d.className = 'sub';
        d.textContent = s.text;
        $('#subs').appendChild(d);
        cues.push({ abs: def.start + s.from, el: d, fx: 'subIn', sub: s, scene: def });
        cues.push({ abs: def.start + s.to, el: d, fx: 'subOut' });
      });
    });

    // 章节角标：相邻同章节合并为一组，组内只入场一次
    const groups = [];
    S.scenes.forEach((def) => {
      const key = def.chapter ? def.chapter.no + '|' + def.chapter.title : '';
      const g = groups[groups.length - 1];
      if (g && g.key === key) g.end = def.end;
      else groups.push({ key, chapter: def.chapter, start: def.start, end: def.end });
    });
    groups.forEach((g, i) => {
      if (!g.chapter) return;
      const d = document.createElement('div');
      d.className = 'chapter';
      d.innerHTML = `<span class="no">${g.chapter.no}</span><span class="bar"></span><span>${g.chapter.title}</span>`;
      $('#chapters').appendChild(d);
      cues.push({ abs: g.start + 0.05, el: d, fx: 'rise' });
      if (i < groups.length - 1) cues.push({ abs: g.end - 0.25, el: d, fx: 'out' });
    });

    cues.sort((a, b) => a.abs - b.abs)
      .forEach((c) => runFx(c.fx, c.el, c.abs));
    S._cues = cues;
  }

  const LINT_BOXES = '.scene .c-card, .scene .c-hero, .scene .c-pill, .scene .c-chip, .scene .c-lifted, .scene .c-tag';

  /* ------------------------------------------------------------------
     铁律 & 版式自动校验（结果显示在右上角，并暴露在 Studio.lint）
     ------------------------------------------------------------------ */
  function lint(measure) {
    const [lo, hi] = S.DEMO_RANGE;
    if (S.duration < lo || S.duration > hi) S.lint.push(`总时长 ${S.duration.toFixed(2)}s 不在 ${lo}–${hi}s`);

    // 1) 文档出现后 ≤1s 必须压暗；可读窗口内不得有字幕
    const subs = S._cues.filter((c) => c.fx === 'subIn');
    document.querySelectorAll('.scene .c-doc:not(.c-lifted)').forEach((doc) => {
      // 入场时间 = 文档自身或其任一子元素最早的入场 cue（卡片组也适用）
      const tin = cueLog.find((c) => (c.el === doc || doc.contains(c.el)) && ['pop', 'rise', 'wipe', 'slam'].includes(c.fx));
      const tdim = cueLog.find((c) => c.el === doc && c.fx === 'dim');
      const sceneStart = S.scenes.find((d) => d.el.contains(doc)).start;
      const tIn = tin ? tin.abs : sceneStart;
      if (!tdim) { S.lint.push(`文档 ${doc.dataset.name || ''} 没有 dim（铁律）`); return; }
      if (tdim.abs - tIn > 1.05) S.lint.push(`文档 ${doc.dataset.name || ''} 出现 ${(tdim.abs - tIn).toFixed(2)}s 后才压暗（应 ≤1s）`);
      subs.forEach((s) => {
        const sEnd = s.scene.start + s.sub.to;
        if (s.abs < tdim.abs && sEnd > tIn) S.lint.push(`字幕「${s.sub.text}」与可读文档同时出现`);
      });
    });

    // 2) 提炼大字 ≤10 字
    document.querySelectorAll('.scene .c-hero').forEach((h) => {
      const n = h.textContent.replace(/\s/g, '').length;
      if (n > 10) S.lint.push(`大字「${h.textContent.trim()}」${n} 字，超过 10 字`);
    });

    // 3) 主视觉元素不得进入口播禁区（口播框外扩 gutter）
    const zone = measure.zone;
    measure.rects.forEach(({ el, r }) => {
      const hit = r.x < zone.r && r.x + r.w > zone.x && r.y < zone.b && r.y + r.h > zone.y;
      if (hit) S.lint.push(`元素进入口播禁区：${el.className} @ (${r.x | 0},${r.y | 0},${r.w | 0}×${r.h | 0})`);
      const safe = r.x >= 96 - 1 && r.y >= 54 - 1 && r.x + r.w <= 1824 + 1 && r.y + r.h <= 1026 + 1;
      if (!safe) S.lint.push(`元素越出安全区：${el.className} @ (${r.x | 0},${r.y | 0},${r.w | 0}×${r.h | 0})`);
    });

    const box = $('#lint');
    if (box && S.lint.length) {
      box.style.display = 'block';
      box.innerHTML = '<b>LINT</b><br>' + S.lint.map((s) => '· ' + s).join('<br>');
    }
    S.lint.forEach((m) => console.warn('[lint]', m));
  }

  /* ------------------------------------------------------------------
     时钟 / 播放
     ------------------------------------------------------------------ */
  S.seek = (t) => {
    S.t = Math.max(0, Math.min(S.duration, t));
    const ms = S.t * 1000;
    for (let i = 0; i < anims.length; i++) anims[i].currentTime = ms;
    S.onTick && S.onTick(S.t);
  };
  // 导出用：seek 后等两帧，保证画面已合成
  S.frame = (t) => new Promise((res) => { S.seek(t); requestAnimationFrame(() => requestAnimationFrame(res)); });

  let wall0 = 0, t0 = 0;
  function loop(now) {
    if (!S.playing) return;
    let t = t0 + (now - wall0) / 1000;
    if (t >= S.duration) {
      if (params.get('loop') === '1') { t0 = 0; wall0 = now; t = 0; }
      else { t = S.duration; S.playing = false; }
    }
    S.seek(t);
    if (S.playing) requestAnimationFrame(loop);
    S.onState && S.onState();
  }
  S.play = () => {
    if (S.t >= S.duration) S.t = 0;
    S.playing = true; t0 = S.t; wall0 = performance.now();
    requestAnimationFrame(loop);
    S.onState && S.onState();
  };
  S.pause = () => { S.playing = false; S.onState && S.onState(); };
  S.toggle = () => (S.playing ? S.pause() : S.play());

  /* ------------------------------------------------------------------
     舞台缩放
     ------------------------------------------------------------------ */
  let scale = 1;
  function fit() {
    const st = $('#stage');
    if (params.get('capture') === '1') { scale = 1; st.style.left = '0px'; st.style.top = '0px'; st.style.transform = 'none'; return; }
    scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    st.style.left = (innerWidth - 1920 * scale) / 2 + 'px';
    st.style.top = (innerHeight - 1080 * scale) / 2 + 'px';
    st.style.transform = `scale(${scale})`;
  }
  // 以画布坐标测量元素（不受缩放影响）
  function rectOf(el) {
    const s = $('#stage').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale };
  }
  S.rect = rectOf;

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  S.boot = async () => {
    const body = document.body;
    if (params.get('capture') === '1') body.classList.add('capture');
    if (params.get('guides') === '1') body.classList.add('show-guides');
    if (params.get('subs') === '0') body.classList.add('no-subs');
    if (params.get('slot') === 'key') body.classList.add('slot-key');
    if (params.get('slot') === 'alpha') body.classList.add('slot-alpha');

    fit();
    addEventListener('resize', fit);
    buildDom();
    if (document.fonts) { try { await document.fonts.ready; } catch (e) {} }

    // 组件注入（必须在动画创建之前测量，此时没有任何 transform）
    const C = S.components;
    C.presenterSlot($('#slot'), S.config.slot);
    C.guides($('#guides'));
    S.scenes.forEach((def) => C.lifts(def.el, rectOf));
    C.frames(document);
    C.starfield($('#dust'), S.config.dust);

    // 版式测量必须在创建动画之前（此时没有入场 scale / translate）
    const rects = [...document.querySelectorAll(LINT_BOXES)].map((el) => ({ el, r: rectOf(el) }));
    buildTimeline();
    // 口播禁区 = 口播框向上/向右外扩 gutter，并延伸到画布左缘与底边
    const sr = rectOf($('#slot .slot'));
    const gutter = 40;
    const zone = { x: 0, y: sr.y - gutter, r: sr.x + sr.w + gutter, b: 1080 };
    S.slotRect = sr;
    lint({ zone, rects });

    S.ready = true;
    const tq = params.get('t');
    if (tq !== null) { S.seek(parseFloat(tq) || 0); body.classList.add('capture'); }
    else {
      S.seek(0);
      if (params.get('capture') !== '1' && params.get('autoplay') !== '0') setTimeout(S.play, 400);
    }
    S.player && S.player();
    window.dispatchEvent(new Event('studio:ready'));
  };

  S.config = { slot: {}, dust: {} };
})();
