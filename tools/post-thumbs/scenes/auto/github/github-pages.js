/* github/github-pages — agent-seal: paste 암호1 + GitHub ID, copy the sealed index.html (BROKER_URL + SEALED) */
(() => {
  scene('github/github-pages', (K) => {
    const ok = K.ico('checkmark_circle', { s: 3, c: 'var(--green)' });
    const field = (icon, label, value, cls = '') => `<div class="f">${K.ico(icon, { s: 2.8 })}<span class="lb">${label}</span><span class="v ${cls}">${value}</span>${ok}</div>`;
    return K.win({
      x: 4, y: 12, w: 60, h: 48, z: 2, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}oneot.github.io/agent-seal</span>`,
      body: `<div class="seal">
        ${field('key', '암호1', '••••••••••', 'dots')}
        ${field('person', 'GitHub 아이디', 'oneot')}
        <div class="out hl">
          <div class="oh">${K.ico('lock_shield', { s: 2.8 })}<b>index.html</b><span class="grow"></span>${K.btn('복사', { primary: true, icon: 'copy' })}</div>
          <div class="cd"><p>BROKER_URL = "…"</p><p class="on">SEALED = "Qx9f…"</p>${K.skel('70%', { h: 1.3 })}</div>
        </div>
      </div>`,
    })
      + K.tile({ x: 1.2, y: 5.4, s: 10.5 })
      + K.mascot('mona-34', { x: 51, y: 0.6, w: 17, z: 1 })
      + K.mascot('ducky-side', { right: -1.5, bottom: -2.5, w: 26, z: 4, flip: true })
      + K.float({ right: 9, y: 5, icon: 'globe' })
      + K.pill({ right: 3.5, y: 23.5, icon: 'shield_lock', text: '암호1은 봉인해서 공개', dark: true });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .win__bar .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .win__bar .url .ico { color: var(--ink-3); }
      .seal { height: 100%; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.8cqw 3cqw 0; }
      .f { display: flex; align-items: center; gap: 1.3cqw; padding: 1.3cqw 1.8cqw; border-radius: 1.4cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); color: rgb(var(--tint)); }
      .lb { width: 15cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .v { flex: 1; font-size: 2.7cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .v.dots { letter-spacing: .15em; color: var(--ink-2); }
      .out { margin-top: 1cqw; border-radius: 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); overflow: hidden; }
      .oh { display: flex; align-items: center; gap: 1cqw; padding: 1.2cqw 1.4cqw 1.2cqw 1.8cqw; color: rgb(var(--tint)); }
      .oh b { font-size: 2.6cqw; font-weight: 700; color: var(--ink); }
      .oh .btn { padding: .9cqw 1.7cqw; font-size: 2.3cqw; }
      .cd { display: flex; flex-direction: column; gap: 1cqw; padding: 1.6cqw 2cqw 2.4cqw; background: #fff; font-family: var(--mono); font-size: 2.6cqw; font-weight: 700; color: var(--ink-2); }
      .cd p { white-space: nowrap; }
      .cd .on { color: rgb(var(--tint)); }
    `,
  });
})();
