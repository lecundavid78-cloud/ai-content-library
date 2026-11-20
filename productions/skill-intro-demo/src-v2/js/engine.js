/* ==========================================================================
   v2 · engine.js — 确定性时间轴引擎（无依赖）
   和 v1 同一套架构：所有动画用 Web Animations API 创建后暂停，由主时钟统一 seek，
   所以 HTML 预览与逐帧导出的 MP4 完全一致。v2 的变化：
     · 动效预设换成「柔和」一族：模糊淡入、逐字打出、带纵深的卡片入场、荧光笔划出
     · 场景有 stage: 'dark' | 'light'，引擎负责两种舞台之间的交叉切换
     · 每个场景内有极慢的「镜头呼吸」（scale 1 → 1.018），停留时画面不死
     · 场景之间用模糊溶解衔接（上一场景虚化淡出，下一场景元素逐个浮现）
   场景定义：{ id, stage, chapter:{no,title}, duration, html, cues[], subs[] }
   cue：{ at: 秒(相对场景), sel, fx, stagger? }
   URL：?t= ?capture=1 ?guides=1 ?subs=0 ?slot=key|alpha ?loop=1 ?autoplay=0
   ========================================================================== */
(function () {
  'use strict';
  const S = (window.Studio = window.Studio || {});
  S.version = 2;
  S.scenes = [];
  S.scene = (def) => S.scenes.push(def);
  S.FPS = 30;
  S.EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  S.EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';
  S.RULES = {
    duration: [25, 45],     // 本样片总时长
    hold: [4.5, 6.5],       // 每个舞台停留 4.5–6.5s（参考片「每 4–6 秒换一次」）
    heroMax: 12,            // 主句 ≤12 字
  };
  S.config = { slot: {}, series: 'Skill 入门' };

  /* ------------------------------------------------------------------
     动效预设 → [target, keyframes, ms, opts?][]
     只动 opacity / translate / scale / rotate / filter / clip-path，
     transform 留给组件做静态造型。
     ------------------------------------------------------------------ */
  const fx = (S.fx = {
    // 通用入场：上浮 + 去模糊（主力）
    in: (el) => [[el, [
      { opacity: 0, translate: '0 28px', filter: 'blur(10px)' },
      { opacity: 1, translate: '0 0', filter: 'blur(0px)' }], 650]],
    // 只去模糊（标签、注释）
    soft: (el) => [[el, [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)' }], 550]],
    // 卡片：带一点纵深从下方立起来（父级需要 .persp）
    tilt: (el) => [[el, [
      { opacity: 0, translate: '0 60px', rotate: '1 0 0 22deg', filter: 'blur(6px)' },
      { opacity: 1, translate: '0 0', rotate: '1 0 0 0deg', filter: 'blur(0px)' }], 850]],
    // 逐字打出：每个字上浮 + 去模糊
    type: (el) => [...el.querySelectorAll('.ch')].map((ch, i) => [ch, [
      { opacity: 0, translate: '0 0.22em', filter: 'blur(6px)' },
      { opacity: 1, translate: '0 0', filter: 'blur(0px)' }], 420, { delay: i * 55 }]),
    // 小徽标：轻微回弹（全片唯一允许的回弹，且只给 44px 的小东西）
    badge: (el) => [[el, [{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1' }], 480,
      { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }]],
    // 荧光笔划过
    mark: (el) => [[el.querySelector('.hl') || el, [{ scale: '0 1' }, { scale: '1 1' }], 600]],
    // 占位行被填满：虚线框 → 实底
    fill: (el) => [
      [el, [{ backgroundColor: 'rgba(42,41,47,0)' }, { backgroundColor: 'rgba(42,41,47,1)' }], 500],
      [el.querySelector('.fill') || el, [
        { opacity: 0, translate: '-14px 0', filter: 'blur(6px)' },
        { opacity: 1, translate: '0 0', filter: 'blur(0px)' }], 550],
    ],
    // 退后一层（让出注意力）
    recede: (el) => [[el, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0.35, filter: 'blur(2px)' }], 600]],
    // 出场：虚化淡出
    out: (el) => [[el, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }], 450,
      { easing: S.EASE_IO }]],
    // —— 内部 ——
    show: (el) => [[el, [{ opacity: 0 }, { opacity: 1 }], 1, { easing: 'linear' }]],
    subIn: (el) => [[el, [{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], 300]],
    subOut: (el) => [[el, [{ opacity: 1 }, { opacity: 0 }], 200, { easing: 'linear' }]],
  });

  /* ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const params = new URLSearchParams(location.search);
  const anims = [];
  const touched = new WeakSet();
  S.lint = [];
  S.t = 0;
  S.playing = false;

  function addAnim(target, keyframes, durMs, absSec, o = {}) {
    const fill = o.fill || (touched.has(target) ? 'forwards' : 'both');
    touched.add(target);
    const a = target.animate(keyframes, {
      duration: durMs, delay: absSec * 1000 + (o.delay || 0), fill,
      easing: o.easing || S.EASE, iterations: o.iterations || 1,
    });
    a.pause();
    anims.push(a);
  }
  function runFx(name, el, abs) {
    if (!fx[name]) { S.lint.push(`未知动效 fx="${name}"`); return; }
    fx[name](el).forEach(([t, kf, d, o]) => addAnim(t, kf, d, abs, o));
  }

  /* ------------------------------------------------------------------
     构建
     ------------------------------------------------------------------ */
  function buildDom() {
    let t = 0;
    S.scenes.forEach((def) => {
      const sec = document.createElement('section');
      sec.className = `scene is-${def.stage || 'light'}`;
      sec.id = def.id;
      sec.innerHTML = `<div class="cam">${def.html}</div>`;
      $('#scenes').appendChild(sec);
      Object.assign(def, { el: sec, start: t, end: t + def.duration });
      t += def.duration;
    });
    S.duration = t;
  }

  const STAGE_TEXT = { dark: '#F4F4F2', light: '#141416' };

  function buildTimeline() {
    const cues = [];
    const last = S.scenes[S.scenes.length - 1];

    // 章节角标：相邻同章节合并（先建 DOM，舞台切换时它们要跟着变色）
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
      d.innerHTML = [...g.chapter.no].map((n) => `<span class="digit">${n}</span>`).join('') +
        `<span class="title adapt">${g.chapter.title}</span>`;
      $('#chapters').appendChild(d);
      cues.push({ abs: g.start + 0.1, el: d, fx: 'in' });
      if (i < groups.length - 1) cues.push({ abs: g.end - 0.45, el: d, fx: 'out' });
    });


    S.scenes.forEach((def, i) => {
      const prev = S.scenes[i - 1];
      cues.push({ abs: def.start, el: def.el, fx: 'show' });
      if (def !== last) cues.push({ abs: def.end - 0.45, el: def.el, fx: 'out' });

      // 镜头呼吸：整场景极慢放大
      addAnim(def.el.querySelector('.cam'), [{ scale: '1' }, { scale: '1.018' }],
        def.duration * 1000, def.start, { easing: 'linear' });

      // 舞台切换（深 ↔ 浅）
      const stage = def.stage || 'light';
      const from = prev ? prev.stage || 'light' : stage;
      if (!prev || from !== stage) {
        const t0 = prev ? def.start - 0.6 : 0;
        const dur = prev ? 1400 : 1;   // 深↔浅 用 1.4s 慢慢换，避免亮度突变
        addAnim($('#bg-light'), [{ opacity: from === 'light' ? 1 : 0 }, { opacity: stage === 'light' ? 1 : 0 }],
          dur, t0, { easing: S.EASE_IO });
        document.querySelectorAll('.adapt').forEach((el) =>
          addAnim(el, [{ color: STAGE_TEXT[from] }, { color: STAGE_TEXT[stage] }], dur, t0, { easing: S.EASE_IO }));
      }

      (def.cues || []).forEach((c) => {
        const els = def.el.querySelectorAll(c.sel);
        if (!els.length) S.lint.push(`[${def.id}] 选择器没有命中：${c.sel}`);
        els.forEach((el, k) => cues.push({ abs: def.start + c.at + (c.stagger || 0) * k, el, fx: c.fx }));
      });

      (def.subs || []).forEach((s) => {
        const row = document.createElement('div');
        row.className = 'sub-row';
        row.innerHTML = `<div class="sub"></div>`;
        row.firstChild.textContent = s.text;
        $('#subs').appendChild(row);
        cues.push({ abs: def.start + s.from, el: row, fx: 'subIn' });
        cues.push({ abs: def.start + s.to, el: row, fx: 'subOut' });
      });
    });

    cues.sort((a, b) => a.abs - b.abs).forEach((c) => runFx(c.fx, c.el, c.abs));
  }

  /* ------------------------------------------------------------------
     校验：时长 / 节奏 / 主句长度 / 口播禁区 / 安全区 / 字幕不重叠
     ------------------------------------------------------------------ */
  const LINT_BOXES = '.scene .c-card, .scene .c-hero, .scene .c-title, .scene .c-lead, .scene .c-pill, .scene .c-tile, .scene .c-badge';
  function lint(rects, zone) {
    const R = S.RULES;
    if (S.duration < R.duration[0] || S.duration > R.duration[1]) S.lint.push(`总时长 ${S.duration}s 不在 ${R.duration.join('–')}s`);
    S.scenes.forEach((d) => {
      if (d.duration < R.hold[0] || d.duration > R.hold[1]) S.lint.push(`[${d.id}] 停留 ${d.duration}s，不在 ${R.hold.join('–')}s`);
      const subs = (d.subs || []).slice().sort((a, b) => a.from - b.from);
      subs.forEach((s, i) => { if (subs[i + 1] && subs[i + 1].from < s.to) S.lint.push(`[${d.id}] 字幕重叠：${s.text}`); });
    });
    document.querySelectorAll('.scene .c-hero').forEach((h) => {
      const n = h.textContent.replace(/\s/g, '').length;
      if (n > R.heroMax) S.lint.push(`主句「${h.textContent.trim()}」${n} 字 > ${R.heroMax}`);
    });
    rects.forEach(({ el, r }) => {
      const tag = el.className.split(' ').slice(0, 2).join('.');
      if (r.x < zone.r && r.x + r.w > zone.x && r.y < zone.b && r.y + r.h > zone.y)
        S.lint.push(`进入口播禁区：${tag} @ ${r.x | 0},${r.y | 0} ${r.w | 0}×${r.h | 0}`);
      if (r.x < 95 || r.y < 53 || r.x + r.w > 1825 || r.y + r.h > 1027)
        S.lint.push(`越出安全区：${tag} @ ${r.x | 0},${r.y | 0} ${r.w | 0}×${r.h | 0}`);
    });
    if (S.lint.length) {
      const box = $('#lint');
      if (box) { box.style.display = 'block'; box.innerHTML = '<b>LINT</b><br>' + S.lint.map((s) => '· ' + s).join('<br>'); }
      S.lint.forEach((m) => console.warn('[lint]', m));
    }
  }

  /* ------------------------------------------------------------------
     时钟
     ------------------------------------------------------------------ */
  S.seek = (t) => {
    S.t = Math.max(0, Math.min(S.duration, t));
    const ms = S.t * 1000;
    for (let i = 0; i < anims.length; i++) anims[i].currentTime = ms;
    S.onTick && S.onTick(S.t);
  };
  S.frame = (t) => new Promise((res) => { S.seek(t); requestAnimationFrame(() => requestAnimationFrame(res)); });
  let wall0 = 0, t0 = 0;
  function loop(now) {
    if (!S.playing) return;
    let t = t0 + (now - wall0) / 1000;
    if (t >= S.duration) {
      if (params.get('loop') === '1') { t0 = 0; wall0 = now; t = 0; } else { t = S.duration; S.playing = false; }
    }
    S.seek(t);
    if (S.playing) requestAnimationFrame(loop);
    S.onState && S.onState();
  }
  S.play = () => {
    if (S.t >= S.duration) S.t = 0;
    S.playing = true; t0 = S.t; wall0 = performance.now();
    requestAnimationFrame(loop); S.onState && S.onState();
  };
  S.pause = () => { S.playing = false; S.onState && S.onState(); };
  S.toggle = () => (S.playing ? S.pause() : S.play());

  /* ------------------------------------------------------------------
     缩放 / 测量
     ------------------------------------------------------------------ */
  let scale = 1;
  function fit() {
    const st = $('#stage');
    if (params.get('capture') === '1') { scale = 1; st.style.transform = 'none'; return; }
    scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    st.style.left = (innerWidth - 1920 * scale) / 2 + 'px';
    st.style.top = (innerHeight - 1080 * scale) / 2 + 'px';
    st.style.transform = `scale(${scale})`;
  }
  function rectOf(el) {
    const s = $('#stage').getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale };
  }
  S.rect = rectOf;

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  S.boot = async () => {
    const b = document.body.classList;
    if (params.get('capture') === '1') b.add('capture');
    if (params.get('guides') === '1') b.add('show-guides');
    if (params.get('subs') === '0') b.add('no-subs');
    if (params.get('slot') === 'key') b.add('slot-key');
    if (params.get('slot') === 'alpha') b.add('slot-alpha');
    fit(); addEventListener('resize', fit);

    const C = S.components;
    C.chrome();                       // 口播框 / 系列标记 / 参考线
    buildDom();
    C.splitType(document);            // 逐字拆分
    if (document.fonts) { try { await document.fonts.ready; } catch (e) {} }

    // 首个场景的舞台色作为初始状态
    const first = S.scenes[0];
    $('#bg-light').style.opacity = first.stage === 'dark' ? 0 : 1;

    const rects = [...document.querySelectorAll(LINT_BOXES)].map((el) => ({ el, r: rectOf(el) }));
    const sr = rectOf($('#slot .slot'));
    S.slotRect = sr;
    buildTimeline();
    lint(rects, { x: 0, y: sr.y - 40, r: sr.x + sr.w + 40, b: 1080 });

    S.ready = true;
    const tq = params.get('t');
    if (tq !== null) { S.seek(parseFloat(tq) || 0); b.add('capture'); }
    else {
      S.seek(0);
      if (params.get('capture') !== '1' && params.get('autoplay') !== '0') setTimeout(S.play, 500);
    }
    S.player && S.player();
    dispatchEvent(new Event('studio:ready'));
  };
})();
