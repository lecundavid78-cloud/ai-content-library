/* ==========================================================================
   v2 · components.js — 口播框 / 系列标记 / 参考线 / 逐字拆分 / 图标 / 播放器
   场景文件只写 HTML 结构与 cues，不写 JS 逻辑。
   ========================================================================== */
(function () {
  'use strict';
  const S = window.Studio;
  const C = (S.components = {});

  /* ---------- 图标 ---------- */
  const ICONS = {
    folder: (c) => `<svg viewBox="0 0 32 32" class="ico"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h7l3 3h11A2.5 2.5 0 0 1 29 11.5v12A2.5 2.5 0 0 1 26.5 26h-21A2.5 2.5 0 0 1 3 23.5z" fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    file: (c) => `<svg viewBox="0 0 32 32" class="ico"><path d="M8 3.5h11l7 7v17a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 7 27.5V5A1.5 1.5 0 0 1 8 3.5z" fill="${c}" fill-opacity=".16" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M19 3.5V10.5h7" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M11.5 17h9M11.5 21.5h6" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
    check: () => `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    cross: () => `<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    camera: (c) => `<svg viewBox="0 0 48 48"><rect x="5" y="13" width="27" height="22" rx="5" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M32 21l11-6v18l-11-6z" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  };
  S.icon = (name, color = 'currentColor') => ICONS[name](color);

  /* ---------- 常驻元素：口播框 / 系列标记 / 参考线 ---------- */
  C.chrome = () => {
    const name = S.config.slot.name ?? '阿泽';
    document.getElementById('slot').innerHTML = `
      <div class="slot" data-role="presenter-slot">
        <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
        <div class="info">${S.icon('camera', '#fff')}<div class="t">口播画面</div><div class="m">9:16 · 280 × 498<br>x 96 · y 528</div></div>
        ${name ? `<div class="name">${name}</div>` : ''}
      </div>`;
    document.getElementById('chrome').innerHTML = S.config.series
      ? `<div class="series adapt"><i></i>${S.config.series}</div>` : '';
    document.getElementById('guides').innerHTML = `
      <div class="g-safe"></div><div class="g-main"></div><div class="g-zone"></div>
      <div class="g-label" style="left:1660px;top:58px">SAFE 96 / 54</div>
      <div class="g-label" style="left:462px;top:130px">MAIN 456 → 1824 · cx 1140</div>
      <div class="g-label" style="left:100px;top:460px;color:#E5484D">PRESENTER ZONE</div>`;
  };

  /* ---------- 逐字拆分：.c-type 内所有文字节点 → <span class="ch"> ----------
     保留 <em> / .mono / .c-mark 等嵌套；空格不拆；.hl 等装饰元素跳过。 */
  C.splitType = (root) => {
    root.querySelectorAll('.c-type').forEach((el) => {
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            for (const ch of n.textContent) {
              if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
              const s = document.createElement('span');
              s.className = 'ch'; s.textContent = ch;
              frag.appendChild(s);
            }
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.classList.contains('hl') && n.tagName !== 'svg') walk(n);
        });
      };
      walk(el);
    });
  };

  /* ---------- 播放器（预览用） ---------- */
  S.player = () => {
    const ui = document.getElementById('player');
    if (!ui) return;
    const btn = ui.querySelector('[data-act=play]');
    const bar = ui.querySelector('input');
    const time = ui.querySelector('.time');
    bar.max = S.duration;
    S.onTick = (t) => { bar.value = t; time.textContent = `${t.toFixed(2).padStart(5, '0')} / ${S.duration.toFixed(1)}s`; };
    S.onState = () => { btn.textContent = S.playing ? '❚❚ 暂停' : (S.t >= S.duration ? '↺ 重播' : '▶ 播放'); };
    S.onTick(S.t); S.onState();
    btn.onclick = () => S.toggle();
    bar.oninput = () => { S.pause(); S.seek(+bar.value); };
    const cls = document.body.classList;
    const cycleSlot = () => {
      const modes = ['', 'slot-key', 'slot-alpha'];
      const cur = Math.max(0, modes.findIndex((m) => m && cls.contains(m)));
      modes.forEach((m) => m && cls.remove(m));
      const next = modes[(cur + 1) % modes.length];
      if (next) cls.add(next);
    };
    ui.querySelector('[data-act=guides]').onclick = () => cls.toggle('show-guides');
    ui.querySelector('[data-act=subs]').onclick = () => cls.toggle('no-subs');
    ui.querySelector('[data-act=slot]').onclick = cycleSlot;
    addEventListener('keydown', (e) => {
      const f = 1 / S.FPS;
      if (e.code === 'Space') { e.preventDefault(); S.toggle(); }
      else if (e.code === 'ArrowRight') { S.pause(); S.seek(S.t + (e.shiftKey ? f : 0.5)); }
      else if (e.code === 'ArrowLeft') { S.pause(); S.seek(S.t - (e.shiftKey ? f : 0.5)); }
      else if (e.code === 'Home') { S.pause(); S.seek(0); }
      else if (e.code === 'KeyG') cls.toggle('show-guides');
      else if (e.code === 'KeyS') cls.toggle('no-subs');
      else if (e.code === 'KeyK') cycleSlot();
    });
    let idle;
    addEventListener('mousemove', () => {
      cls.remove('idle'); clearTimeout(idle);
      idle = setTimeout(() => S.playing && cls.add('idle'), 1800);
    });
  };
})();
