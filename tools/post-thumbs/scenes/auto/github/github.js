/* github/github — settings/security: two-factor methods with the authenticator app configured */
(() => {
  scene('github/github', (K) => {
    const row = (icon, name, sub, end, on) => `<div class="mt${on ? ' on hl' : ''}"><span class="mi">${K.ico(icon, { s: 3.2 })}</span>
      <div class="grow"><b>${name}</b>${sub ? `<small>${sub}</small>` : K.skel('60%', { h: 1.2 })}</div>${end}</div>`;
    return K.win({
      x: 38, y: 9.5, w: 58, h: 50, z: 2, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}github.com/settings/security</span>`,
      body: `<div class="pg">
        <div class="hd">${K.ico('shield_lock', { s: 3.6, c: 'rgb(var(--tint))' })}<p class="h">Two-factor authentication</p></div>
        ${row('phone_key', 'Authenticator app', 'Microsoft Authenticator', K.ico('checkmark_circle', { s: 4.6, c: 'var(--green)' }), true)}
        ${row('chat', 'SMS/Text message', '', K.btn('Add', { line: true }))}
        ${row('phone', 'GitHub Mobile', '', K.btn('Add', { line: true }))}
      </div>`,
    })
      + K.tile({ x: 33.6, y: 4.4, s: 10.5, z: 3 })
      + K.mascot('mona-34b', { x: 19, y: 11, w: 17, z: 1 })
      + K.mascot('copilot-turn', { x: 3, bottom: -2, w: 26, z: 3 })
      + K.pill({ right: 4, y: 2.2, icon: 'shield_checkmark', text: '2차 인증으로 계정 지키기' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; }
      .win__bar .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .win__bar .url .ico { color: var(--ink-3); }
      .pg { height: 100%; display: flex; flex-direction: column; gap: 1.8cqw; padding: 3cqw 3.2cqw 0; }
      .hd { display: flex; align-items: center; gap: 1.2cqw; padding-bottom: 1.6cqw; border-bottom: .2cqw solid var(--line); }
      .h { font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .mt { display: flex; align-items: center; gap: 1.6cqw; padding: 1.5cqw 1.8cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .7); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .mi { display: grid; place-items: center; flex: none; width: 5.4cqw; height: 5.4cqw; border-radius: 1.4cqw; background: var(--fill); color: var(--ink-3); }
      .mt b { display: block; font-size: 2.6cqw; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
      .mt small { display: block; margin-top: .3cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .mt .skel { margin-top: .9cqw; }
      .mt .btn { padding: .9cqw 2cqw; font-size: 2.3cqw; }
      .mt.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff), 0 2.4cqw 4.8cqw -2.4cqw rgba(var(--tint), .6); }
      .mt.on .mi { background: var(--grad); color: #fff; }
      .mt.on b { color: var(--ink); font-size: 2.8cqw; }
      .mt.on .grow { min-width: 0; }
    `,
  });
})();
