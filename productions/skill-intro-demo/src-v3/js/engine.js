/* ==========================================================================
   v3 · engine.js — 确定性时间轴引擎（无依赖）
   --------------------------------------------------------------------------
   v3 的核心变化：「出现 - 变化 - 消失 - 出现」
     · 时间轴由若干「部分（part）」组成，每部分 12–18 秒。
     · 部分内部 **不换卡**：同一组元素持续停在舞台上，通过「变化」推进——
         state  标题 / 卡头 / 行文字在原位从一个状态过渡到下一个状态
         move   卡片移动、缩放、变形（位置、尺寸、透明度）
         fill   占位行被填满      mark  荧光笔划过      badge  打 √ / ×
     · 只有部分结束时，整组才虚化退场，下一部分的卡片再进场。
   所有动画用 Web Animations API 创建后暂停，由主时钟统一 seek → HTML 与逐帧导出完全一致。

   部分定义：{ id, stage:'dark'|'light', chapter:{no,title}, duration, html, cues[], subs[] }
   cue：{ at: 秒(相对部分), sel, fx, stagger?, to? }
     fx:'state' → to: 'b'（切到 [data-state="b"]）
     fx:'move'  → to: { x, y, w, h, o, s }（left/top/width/height/opacity/scale，任选）
   URL：?t= ?capture=1 ?guides=1 ?subs=0 ?slot=key|alpha ?loop=1 ?autoplay=0
   ========================================================================== */
(function () {
  'use strict';
  const S = (window.Studio = window.Studio || {});
  S.version = 3;
  S.scenes = [];
  S.scene = (def) => S.scenes.push(def);
  S.FPS = 30;
  S.EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  S.EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';
  S.RULES = {
    duration: [30, 60],      // 样片总时长
    part: [10, 18],          // 每部分 10–18s
    minChanges: 2,           // 每部分至少 2 次「变化」
    heroMax: 14,
    axis: 960,               // 构图中轴
    col: [416, 1504],        // 对称安全列（口播框同高区域）
  };
  S.config = { slot: {}, series: 'Skill 入门' };
  const CHANGE_FX = ['state', 'move', 'fill', 'mark', 'badge', 'recede', 'unbadge'];

  /* ------------------------------------------------------------------
     动效预设 → [target, keyframes, ms, opts?][]
     预设签名 (el, cue, ctx)；ctx 记录每个元素「当前状态 / 当前盒子」，
     以便 state / move 从上一个状态接着变，而不是重新出现。
     ------------------------------------------------------------------ */
  const IN_KF = [{ opacity: 0, translate: '0 24px', filter: 'blur(10px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0px)' }];
  const OUT_KF = [{ opacity: 1, translate: '0 0', filter: 'blur(0px)' }, { opacity: 0, translate: '0 -16px', filter: 'blur(10px)' }];
  const charsIn = (root, delay0 = 0) => [...root.querySelectorAll('.ch')].map((ch, i) => [ch, [
    { opacity: 0, translate: '0 0.22em', filter: 'blur(6px)' },
    { opacity: 1, translate: '0 0', filter: 'blur(0px)' }], 420, { delay: delay0 + i * 50 }]);

  const fx = (S.fx = {
    in: (el) => [[el, IN_KF, 650]],
    soft: (el) => [[el, [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)' }], 550]],
    tilt: (el) => [[el, [
      { opacity: 0, translate: '0 60px', rotate: '1 0 0 22deg', filter: 'blur(6px)' },
      { opacity: 1, translate: '0 0', rotate: '1 0 0 0deg', filter: 'blur(0px)' }], 850]],
    type: (el) => charsIn(el),
    badge: (el) => [[el, [{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1' }], 480,
      { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }]],
    unbadge: (el) => [[el, [{ opacity: 1, scale: '1' }, { opacity: 0, scale: '0.4' }], 300, { easing: S.EASE_IO }]],
    mark: (el) => [[el.querySelector('.hl') || el, [{ scale: '0 1' }, { scale: '1 1' }], 600]],
    fill: (el) => [
      [el, [{ backgroundColor: 'rgba(42,41,47,0)' }, { backgroundColor: 'rgba(42,41,47,1)' }], 500],
      [el.querySelector('.fill') || el, [
        { opacity: 0, translate: '-14px 0', filter: 'blur(6px)' },
        { opacity: 1, translate: '0 0', filter: 'blur(0px)' }], 550],
    ],
    recede: (el) => [[el, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0.35, filter: 'blur(2px)' }], 600]],
    out: (el) => [[el, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }], 450, { easing: S.EASE_IO }]],

    // —— 变化：原位换状态（旧状态上飘虚化，新状态从下方浮现；带 .c-type 的逐字打出）——
    state: (el, cue, ctx) => {
      const kids = [...el.children].filter((k) => k.dataset.state);
      const cur = ctx.state.get(el) ?? kids[0].dataset.state;
      const from = kids.find((k) => k.dataset.state === cur);
      const to = kids.find((k) => k.dataset.state === cue.to);
      if (!to) throw new Error(`state: 找不到 [data-state="${cue.to}"]`);
      ctx.state.set(el, cue.to);
      const list = [[from, OUT_KF, 380, { easing: S.EASE_IO }]];
      if (to.querySelector('.ch')) {
        list.push([to, [{ opacity: 0 }, { opacity: 1 }], 1, { delay: 200, easing: 'linear' }]);
        list.push(...charsIn(to, 200));
      } else list.push([to, IN_KF, 600, { delay: 200 }]);
      return list;
    },
    // —— 变化：移动 / 缩放 / 变形 ——
    move: (el, cue, ctx) => {
      const a = ctx.box.get(el);
      const b = { ...a, ...cue.to };
      ctx.box.set(el, b);
      const k = (v) => ({ left: v.x + 'px', top: v.y + 'px', width: v.w + 'px', height: v.h + 'px', opacity: v.o, scale: String(v.s) });
      return [[el, [k(a), k(b)], cue.dur || 900, { easing: S.EASE }]];
    },

    // —— 内部 ——
    show: (el) => [[el, [{ opacity: 0 }, { opacity: 1 }], 1, { easing: 'linear' }]],
    hide: (el) => [[el, [{ opacity: 0 }, { opacity: 0 }], 1, { easing: 'linear' }]],
    subIn: (el) => [[el, [{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], 300]],
    subOut: (el) => [[el, [{ opacity: 1 }, { opacity: 0 }], 200, { easing: 'linear' }]],
  });

  /* ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const params = new URLSearchParams(location.search);
  const anims = [];
  const touched = new WeakSet();
  const ctx = { state: new Map(), box: new Map() };
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
  function runFx(c) {
    if (!fx[c.fx]) { S.lint.push(`未知动效 fx="${c.fx}"`); return; }
    try { fx[c.fx](c.el, c.cue || {}, ctx).forEach(([t, kf, d, o]) => addAnim(t, kf, d, c.abs, o)); }
    catch (e) { S.lint.push(`${c.fx}: ${e.message}`); }
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

  // 记录会被 move 的元素的初始盒子（必须在创建任何动画之前读）
  function readBoxes() {
    S.scenes.forEach((def) => (def.cues || []).filter((c) => c.fx === 'move').forEach((c) => {
      def.el.querySelectorAll(c.sel).forEach((el) => {
        if (ctx.box.has(el)) return;
        const cs = getComputedStyle(el);
        ctx.box.set(el, { x: parseFloat(cs.left), y: parseFloat(cs.top), w: el.offsetWidth, h: el.offsetHeight, o: 1, s: 1 });
      });
    }));
  }

  const STAGE_TEXT = { dark: '#F4F4F2', light: '#141416' };

  function buildTimeline() {
    const cues = [];
    const last = S.scenes[S.scenes.length - 1];

    // 章节角标（先建 DOM，舞台切换时要跟着变色）
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
      if (def !== last) cues.push({ abs: def.end - 0.45, el: def.el, fx: 'out' });   // 部分结束才整体退场

      addAnim(def.el.querySelector('.cam'), [{ scale: '1' }, { scale: '1.02' }], def.duration * 1000, def.start, { easing: 'linear' });

      const stage = def.stage || 'light';
      const from = prev ? prev.stage || 'light' : stage;
      if (!prev || from !== stage) {
        const t0 = prev ? def.start - 0.6 : 0;
        const dur = prev ? 1400 : 1;
        addAnim($('#bg-light'), [{ opacity: from === 'light' ? 1 : 0 }, { opacity: stage === 'light' ? 1 : 0 }], dur, t0, { easing: S.EASE_IO });
        document.querySelectorAll('.adapt').forEach((el) =>
          addAnim(el, [{ color: STAGE_TEXT[from] }, { color: STAGE_TEXT[stage] }], dur, t0, { easing: S.EASE_IO }));
      }

      // 状态容器：除第一个状态外，开场即隐藏
      def.el.querySelectorAll('.c-morph').forEach((m) =>
        [...m.children].filter((k) => k.dataset.state).slice(1).forEach((k) => cues.push({ abs: 0, el: k, fx: 'hide', pre: true })));

      (def.cues || []).forEach((c) => {
        const els = def.el.querySelectorAll(c.sel);
        if (!els.length) S.lint.push(`[${def.id}] 选择器没有命中：${c.sel}`);
        els.forEach((el, k) => cues.push({ abs: def.start + c.at + (c.stagger || 0) * k, el, fx: c.fx, cue: c, part: def }));
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

    // pre（hide）排在最前；其余按时间
    cues.sort((a, b) => (b.pre ? 1 : 0) - (a.pre ? 1 : 0) || a.abs - b.abs).forEach(runFx);
    S._cues = cues;
  }

  /* ------------------------------------------------------------------
     校验
     1) 时长 / 每部分时长 / 每部分至少 N 次「变化」
     2) 逐帧版式审计：每 0.25s 采样一次，凡是可见（累计不透明度 > 0.08）的
        大字、卡片、胶囊、芯片、徽标、字幕，都不能进入口播禁区、不能越出安全区；
        字幕和标题的中心必须在 x=960 ±4px。
     ------------------------------------------------------------------ */
  const AUDIT = '.scene .c-card, .scene .c-title, .scene .c-hero, .scene .c-lead, .scene .c-pill, .scene .c-chip, .scene .c-badge, #subs .sub';
  function effOpacity(el) {
    let o = 1;
    for (let n = el; n && n.id !== 'stage'; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
    return o;
  }
  function lint(zone) {
    const R = S.RULES;
    if (S.duration < R.duration[0] || S.duration > R.duration[1]) S.lint.push(`总时长 ${S.duration}s 不在 ${R.duration.join('–')}s`);
    S.scenes.forEach((d) => {
      if (d.duration < R.part[0] || d.duration > R.part[1]) S.lint.push(`[${d.id}] 部分时长 ${d.duration}s 不在 ${R.part.join('–')}s`);
      const changes = (d.cues || []).filter((c) => CHANGE_FX.includes(c.fx) && c.at > 1.5).length;
      if (changes < R.minChanges) S.lint.push(`[${d.id}] 部分内部只有 ${changes} 次变化（应 ≥${R.minChanges}）：会退化成「出现-消失-出现」`);
      const subs = (d.subs || []).slice().sort((a, b) => a.from - b.from);
      subs.forEach((s, i) => { if (subs[i + 1] && subs[i + 1].from < s.to) S.lint.push(`[${d.id}] 字幕重叠：${s.text}`); });
    });
    document.querySelectorAll('.scene .c-hero, .scene .c-title').forEach((h) => {
      const n = h.textContent.replace(/\s/g, '').length;
      if (n > R.heroMax) S.lint.push(`主句「${h.textContent.trim()}」${n} 字 > ${R.heroMax}`);
    });

    const seen = new Set();
    const els = [...document.querySelectorAll(AUDIT)];
    for (let t = 0; t <= S.duration; t += 0.25) {
      S.seek(t);
      els.forEach((el) => {
        if (effOpacity(el) < 0.08) return;
        const r = rectOf(el);
        const tag = (el.closest('.scene')?.id || 'subs') + ' ' + el.className.split(' ').slice(0, 2).join('.');
        const bad = (msg) => { const k = tag + msg; if (!seen.has(k)) { seen.add(k); S.lint.push(`${msg}：${tag} @t=${t.toFixed(2)} (${r.x | 0},${r.y | 0} ${r.w | 0}×${r.h | 0})`); } };
        if (r.x < zone.r && r.x + r.w > zone.x && r.y < zone.b && r.y + r.h > zone.y) bad('进入口播禁区');
        if (r.x < 94 || r.y < 52 || r.x + r.w > 1826 || r.y + r.h > 1028) bad('越出安全区');
        const centred = el.matches('#subs .sub') || el.closest('.ttl');
        if (centred && Math.abs(r.x + r.w / 2 - R.axis) > 4) bad('没有居中');
      });
    }
    S.seek(0);
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
    C.chrome();
    buildDom();
    C.splitType(document);
    if (document.fonts) { try { await document.fonts.ready; } catch (e) {} }

    $('#bg-light').style.opacity = S.scenes[0].stage === 'dark' ? 0 : 1;
    readBoxes();
    const sr = rectOf($('#slot .slot'));
    S.slotRect = sr;
    buildTimeline();
    lint({ x: 0, y: sr.y - 40, r: sr.x + sr.w + 40, b: 1080 });

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
