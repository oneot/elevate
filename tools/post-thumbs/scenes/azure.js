/* azure scenes — see STYLE_GUIDE.md */
(() => {

// Stage-space geometry (cqw) of an element, for connector lines drawn in `after`.
const geo = (stage) => {
  const b = stage.getBoundingClientRect();
  const k = 100 / b.width;
  return (sel) => {
    const el = typeof sel === 'string' ? stage.querySelector(sel) : sel;
    const r = el.getBoundingClientRect();
    const l = (r.left - b.left) * k, t = (r.top - b.top) * k, w = r.width * k, h = r.height * k;
    return { l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 };
  };
};
const tintOf = (stage) => `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;

/* Secret stays in Azure Functions; the GitHub Pages site only receives a short-lived token */
scene('azure/secret-key-azure-function-github-pages', (K) => {
  const env = (icon, name, val, cls = '') => `<div class="env ${cls}">${K.ico(icon, { s: 2.6 })}<div><code>${name}</code><span>${val}</span></div></div>`;
  return K.win({
    x: 4, y: 14, w: 26, h: 27, icon: 'github', title: 'GitHub Pages', cls: 'br', dots: false,
    body: `<div class="mini">
      <div class="bb">${K.skel('100%')}${K.skel('64%')}</div>
      <div class="bb me">${K.skel('100%', { tint: true })}</div>
    </div>`,
  })
    + K.card({
      x: 36, y: 9, w: 32, cls: 'fn hl',
      body: `<div class="fh">${K.app('azure', { s: 3.8 })}<div><b>Azure Function</b><small>환경 변수</small></div></div>
        <div class="envs">
          ${env('key', 'DIRECT_LINE_SECRET', '••••••••••', 'sec')}
          ${env('globe', 'ALLOWED_ORIGIN', 'oneot.github.io', 'org')}
        </div>`,
    })
    + K.card({
      x: 77, y: 15, w: 19, cls: 'dl',
      body: `${K.app('copilot-studio', { s: 4.4 })}<b>Direct Line</b><small>Copilot Studio</small>`,
    })
    + `<div class="tok">${K.chip('단기 토큰', { icon: 'timer', solid: true })}</div>`
    + `<span class="kb">${K.ico('key', { s: 1.9 })}</span>`
    + '<div class="links"></div>'
    + K.pill({ right: 4, y: 4.6, icon: 'shield_lock', text: '키 노출 없이 배포' });
}, {
  css: `
    .br .win__bar { gap: 1cqw; padding: 0 1.9cqw; font-size: 2.4cqw; }
    .mini { display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.2cqw; }
    .bb { display: flex; flex-direction: column; gap: .9cqw; width: 78%; padding: 1.3cqw 1.5cqw; border-radius: 1.4cqw 1.4cqw 1.4cqw .5cqw; background: #f1f2f6; }
    .bb .skel { background: #dcdfe5; }
    .bb.me { align-self: flex-end; width: 56%; border-radius: 1.4cqw 1.4cqw .5cqw 1.4cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); }
    .fn { padding: 2.4cqw 2.4cqw 2.6cqw; }
    .fh { display: flex; align-items: center; gap: 1.3cqw; }
    .fh b { display: block; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .fh small { display: block; margin-top: .2cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); }
    .envs { display: flex; flex-direction: column; gap: 1.1cqw; margin-top: 2cqw; }
    .env { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.5cqw; border-radius: 1.2cqw; background: var(--fill); color: var(--ink-4); }
    .env code { display: block; font-family: var(--mono); font-size: 1.95cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
    .env span { display: block; margin-top: .2cqw; font-size: 2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    .env.sec { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); color: rgb(var(--tint)); }
    .env.sec span { font-size: 2.3cqw; line-height: 1.1; letter-spacing: .1em; color: var(--ink-3); }
    .dl { display: flex; flex-direction: column; align-items: center; padding: 2.2cqw 1.2cqw 2cqw; text-align: center; }
    .dl b { margin-top: 1cqw; font-size: 2.4cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .dl small { margin-top: .3cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    .tok { position: absolute; z-index: 3; left: 52cqw; top: 49cqw; translate: -50% -50%; }
    .kb { position: absolute; z-index: 3; display: grid; place-items: center; width: 3.6cqw; height: 3.6cqw; translate: -50% -50%; border-radius: 50%; background: #fff; color: rgb(var(--tint)); box-shadow: 0 0 0 .2cqw var(--line-2), 0 .8cqw 1.6cqw -.8cqw rgba(16, 24, 40, .35); }
    .tok .chip { box-shadow: 0 1.2cqw 2.4cqw -1.2cqw rgba(var(--tint), .7); }
  `,
  after(stage, K) {
    const g = geo(stage);
    const c = tintOf(stage);
    const b = g('.br');
    const f = g('.fn');
    const d = g('.dl');
    const t = g('.tok');
    const sc = g('.sec');
    const o = g('.org');
    const m = K._marker(c);
    // forward: the browser's request meets the origin check; only the function uses the secret with Direct Line
    let svg = K.curve(b.r + 0.4, o.cy, f.l - 1.3, o.cy, { c: '#9aa3ae', dash: true, bend: 'none' });
    svg += K.curve(f.r + 1.3, sc.cy, d.l - 1, sc.cy, { c: '#9aa3ae', dash: true, bend: 'none' });
    // the secret only ever travels on the server-side hop
    const kb = stage.querySelector('.kb');
    kb.style.left = `${(f.r + d.l) / 2}cqw`;
    kb.style.top = `${sc.cy}cqw`;
    // return: the short-lived token travels back under the function to the browser
    const y = t.cy;
    const r = 2.4;
    svg += `${m.def}<path d="M${d.cx} ${d.b + 0.6} V${y - r} Q${d.cx} ${y} ${d.cx - r} ${y} H${b.cx + r} Q${b.cx} ${y} ${b.cx} ${y - r} V${b.b + 1.4}" fill="none" stroke="${c}" stroke-width="0.55" stroke-linecap="round" marker-end="url(#${m.id})"/>`;
    stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
  },
});

})();
