/* S06 · 浅 · 一个 Skill 的四个部分：SKILL.md 管流程，其余三个按需 */
(function () {
  const I = Studio.icon;
  let n = 0;
  const tile = (icon, file, role, key) => `
    <div class="c-tile t${++n}${key ? ' is-key' : ''}">
      <div class="file">${icon}${file}</div>
      <div class="role">${role}</div>
      <span class="tag c-pill is-sm ${key ? 'is-white' : 'is-ghost'}">${key ? '必需' : '可选'}</span>
    </div>`;
  Studio.scene({
    id: 's06-parts', stage: 'light',
    chapter: { no: '03', title: '四个部分' },
    duration: 6.0,
    html: `
      <div class="l-at l-center-x ttl"><div class="c-title c-type">一个 Skill 的<em>四个部分</em></div></div>
      ${tile(I('file', '#A891FF'), 'SKILL.md', '管流程', true)}
      ${tile(I('folder', '#E8B54F'), 'scripts/', '放脚本')}
      ${tile(I('folder', '#E8B54F'), 'references/', '放资料')}
      ${tile(I('folder', '#E8B54F'), 'assets/', '放素材')}
      <div class="l-at l-center-x foot"><div class="c-lead">后三个都是<em>可选</em>的，按需再加</div></div>`,
    cues: [
      { at: 0.20, sel: '.ttl .c-title', fx: 'type' },
      { at: 1.10, sel: '.c-tile', fx: 'tilt', stagger: 0.22 },
      { at: 3.30, sel: '.c-tile .tag', fx: 'soft', stagger: 0.1 },
      { at: 3.90, sel: '.foot .c-lead', fx: 'in' },
    ],
    subs: [
      { from: 0.3, to: 3.0, text: 'SKILL.md 管流程，scripts 放脚本' },
      { from: 3.1, to: 5.8, text: 'references 放资料标准，assets 放素材模板' },
    ],
  });
})();
