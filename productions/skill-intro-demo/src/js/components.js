/* ==========================================================================
   components.js — 可复用组件：口播框、参考线、虚线框、提起行、星尘、图标、播放器
   全部是纯函数式 DOM 注入，场景文件只写 HTML 结构 + class，不写 JS 逻辑。
   ========================================================================== */
(function () {
  'use strict';
  const S = window.Studio;
  const C = (S.components = {});

  /* ---------- 图标（内联 SVG，无外部资源） ---------- */
  const ICONS = {
    folder: (c) => `<svg viewBox="0 0 32 32" class="ico"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h7l3 3h11A2.5 2.5 0 0 1 29 11.5v12A2.5 2.5 0 0 1 26.5 26h-21A2.5 2.5 0 0 1 3 23.5z" fill="${c}" fill-opacity=".18" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    file: (c) => `<svg viewBox="0 0 32 32" class="ico"><path d="M8 3.5h11l7 7v17a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 7 27.5V5A1.5 1.5 0 0 1 8 3.5z" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M19 3.5V10.5h7" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M11.5 17h9M11.5 21.5h6" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
    camera: (c) => `<svg viewBox="0 0 48 48" class="slot-icon"><rect x="5" y="13" width="27" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M32 21l11-6v18l-11-6z" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  };
  S.icon = (name, color = 'currentColor') => ICONS[name](color);

  /* ---------- 口播预留框 ---------- */
  C.presenterSlot = (host, o = {}) => {
    const name = o.name ?? '阿泽';
    host.innerHTML = `
      <div class="slot" data-role="presenter-slot">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        <div class="slot-rec"><i></i>PRESENTER</div>
        <div class="slot-info">
          ${S.icon('camera', '#F4F5F7')}
          <div class="slot-title">口播画面</div>
          <div class="slot-meta">9:16 · 280 × 498<br>x 96 · y 528</div>
        </div>
        ${name ? `<div class="slot-name">${name}</div>` : ''}
      </div>`;
  };

  /* ---------- 参考线 ---------- */
  C.guides = (host) => {
    host.innerHTML = `
      <div class="g-safe"></div><div class="g-main"></div><div class="g-slot-zone"></div>
      <div class="g-label" style="left:1680px;top:58px">SAFE 96 / 54</div>
      <div class="g-label" style="left:460px;top:90px">MAIN 456 → 1824 · center x 1140</div>
      <div class="g-label" style="left:100px;top:452px;color:#FF4D4F">PRESENTER ZONE (no main visuals)</div>`;
  };

  /* ---------- 虚线框：给每个 .c-frame 注入 SVG ----------
     data-pad 外扩像素（默认 14）；data-r 圆角（默认 12）。
     画法：可见层是 2px 黄色虚线；用 pathLength=1 的实线做 mask，
     动画 mask 的 stroke-dashoffset 1→0 实现「沿路径画出虚线框」。 */
  let maskId = 0;
  C.frames = (root) => {
    root.querySelectorAll('.c-frame').forEach((el) => {
      if (el.querySelector(':scope > svg.dash')) return;
      const pad = +(el.dataset.pad ?? 14);
      const r = +(el.dataset.r ?? 12);
      const w = el.offsetWidth + pad * 2;
      const h = el.offsetHeight + pad * 2;
      const id = 'dm' + ++maskId;
      el.insertAdjacentHTML('beforeend', `
        <svg class="dash" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${-pad}px;top:${-pad}px">
          <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-10" y="-10" width="${w + 20}" height="${h + 20}">
            <rect class="dash-mask" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0"/>
          </mask></defs>
          <rect class="dash-line" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" mask="url(#${id})"/>
        </svg>`);
    });
  };

  /* ---------- 提起行（铁律配套） ----------
     文档里 data-lift="name" 的行，会被复制到场景的 lift-layer，
     位置与原行完全重合；文档整体 dim 之后，这些副本保持高亮浮在上方。
     副本可用选择器 [data-lifted="name"] 写 cue。 */
  C.lifts = (scene, rectOf) => {
    const layer = scene.querySelector(':scope > .lift-layer');
    const sr = rectOf(scene);
    scene.querySelectorAll('[data-lift]').forEach((ln) => {
      const r = rectOf(ln);
      const wrap = document.createElement('div');
      wrap.className = 'c-doc c-lifted c-frame';
      wrap.dataset.lifted = ln.dataset.lift;
      wrap.dataset.pad = ln.dataset.framePad ?? 10;
      const clone = ln.cloneNode(true);
      clone.removeAttribute('data-lift');
      wrap.appendChild(clone);
      wrap.style.left = r.x - sr.x - 14 + 'px';
      wrap.style.top = r.y - sr.y + 'px';
      layer.appendChild(wrap);
    });
  };

  /* ---------- 星尘：极微弱、慢速漂浮（确定性随机） ---------- */
  C.starfield = (host, o = {}) => {
    const n = o.count ?? 64;
    let seed = o.seed ?? 20251118;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      d.className = 'dust';
      const size = 1 + rnd() * 1.8;
      const base = 0.06 + rnd() * 0.26;
      d.style.cssText = `left:${rnd() * 1920}px;top:${rnd() * 1080}px;width:${size}px;height:${size}px;opacity:${base}`;
      host.appendChild(d);
      const dx = (rnd() - 0.5) * 70, dy = -10 - rnd() * 50;
      const dur = 9000 + rnd() * 9000;
      S.ambient(d, [
        { translate: '0 0', opacity: base },
        { translate: `${dx}px ${dy}px`, opacity: base * (0.3 + rnd() * 0.5) },
      ], { duration: dur, direction: 'alternate', easing: 'ease-in-out', delay: -rnd() * dur });
    }
  };

  /* ---------- 播放器（仅预览用，不进成片） ---------- */
  S.player = () => {
    const ui = document.getElementById('player');
    if (!ui) return;
    const btn = ui.querySelector('[data-act=play]');
    const bar = ui.querySelector('input');
    const time = ui.querySelector('.time');
    bar.max = S.duration;
    const fmt = (t) => t.toFixed(2).padStart(5, '0');
    S.onTick = (t) => { bar.value = t; time.textContent = `${fmt(t)} / ${S.duration.toFixed(2)}s`; };
    S.onState = () => { btn.textContent = S.playing ? '❚❚ 暂停' : (S.t >= S.duration ? '↺ 重播' : '▶ 播放'); };
    S.onTick(S.t); S.onState();
    btn.onclick = () => S.toggle();
    bar.oninput = () => { S.pause(); S.seek(+bar.value); };
    ui.querySelector('[data-act=guides]').onclick = () => document.body.classList.toggle('show-guides');
    ui.querySelector('[data-act=subs]').onclick = () => document.body.classList.toggle('no-subs');
    const slotModes = ['', 'slot-key', 'slot-alpha'];
    const cycleSlot = () => {
      const b = document.body.classList;
      const cur = slotModes.findIndex((m) => m && b.contains(m));
      slotModes.forEach((m) => m && b.remove(m));
      const next = slotModes[(Math.max(cur, 0) + 1) % slotModes.length];
      if (next) b.add(next);
    };
    ui.querySelector('[data-act=slot]').onclick = cycleSlot;
    addEventListener('keydown', (e) => {
      const f = 1 / S.FPS;
      if (e.code === 'Space') { e.preventDefault(); S.toggle(); }
      else if (e.code === 'ArrowRight') { S.pause(); S.seek(S.t + (e.shiftKey ? f : 0.5)); }
      else if (e.code === 'ArrowLeft') { S.pause(); S.seek(S.t - (e.shiftKey ? f : 0.5)); }
      else if (e.code === 'Home') { S.pause(); S.seek(0); }
      else if (e.code === 'KeyG') document.body.classList.toggle('show-guides');
      else if (e.code === 'KeyS') document.body.classList.toggle('no-subs');
      else if (e.code === 'KeyK') cycleSlot();
    });
    let idle;
    addEventListener('mousemove', () => {
      document.body.classList.remove('idle');
      clearTimeout(idle);
      idle = setTimeout(() => S.playing && document.body.classList.add('idle'), 1800);
    });
  };
})();
