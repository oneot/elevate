(() => {
  /* Function App 'Environment variables': the Direct Line secret lives only on the server, value hidden */
  scene('azure/secret-key-azure-function-github-pages', (K) => {
    const row = (icon, name, val, cls = '') => `<div class="rw ${cls}"><span class="nm">${K.ico(icon, { s: 2.8 })}<code>${name}</code></span>${val}</div>`;
    return K.win({
      x: 5, y: 12, w: 65, h: 50, title: '환경 변수', icon: false,
      barRight: `${K.btn('추가', { icon: 'add' })}${K.btn('적용', { primary: true })}`,
      body: `<div class="ev">
        <div class="tabs"><span class="on">앱 설정</span>${K.skel(10, { h: 1.6 })}</div>
        <div class="hd"><span>이름</span><span>값</span></div>
        ${row('key', 'DIRECT_LINE_SECRET', `<span class="vl sec"><b>••••••••</b>${K.ico('eye_off', { s: 2.6 })}</span>`, 'hl')}
        ${row('globe', 'ALLOWED_ORIGIN', '<span class="vl">mygithubname.github.io</span>')}
        <div class="rw sk">${K.skel(18)}${K.skel(14)}</div>
      </div>`,
    })
      + K.card({
        x: 71, y: 17, w: 26.5, cls: 'tk',
        body: `<code>directlineToken</code>${K.chip('단기 토큰 발급', { icon: 'timer', solid: true })}`,
      })
      + K.tile({ x: 1.8, y: 5, s: 10.5 })
      + K.float({ right: 6, y: 35, app: 'github', far: true, s: 5.8 })
      + K.pill({ right: 3.4, bottom: 3.2, icon: 'shield_lock', text: 'Secret은 서버에만' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 13cqw; font-size: 2.8cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .ev { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.8cqw 3.2cqw; }
      .tabs { display: flex; align-items: center; gap: 2.6cqw; padding-bottom: 1.2cqw; border-bottom: .2cqw solid var(--line); }
      .tabs .on { font-size: 2.6cqw; font-weight: 700; color: rgb(var(--tint)); box-shadow: 0 1.4cqw 0 -1cqw rgb(var(--tint)); padding-bottom: .2cqw; }
      .hd, .rw { display: grid; grid-template-columns: 29cqw 1fr; align-items: center; gap: 1.2cqw; }
      .hd { padding: 0 1.8cqw; font-size: 2.1cqw; font-weight: 650; color: var(--ink-3); }
      .rw { padding: 1.7cqw 1.8cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .72); }
      .nm { display: flex; align-items: center; gap: 1.2cqw; color: var(--ink-3); }
      .nm code { font-family: var(--mono); font-size: 2.15cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .vl { font-size: 2.15cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .rw.hl { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); }
      .rw.hl .nm { color: rgb(var(--tint)); }
      .sec { display: flex; align-items: center; justify-content: space-between; color: rgb(var(--tint)); }
      .sec b { font-size: 3cqw; letter-spacing: .12em; color: var(--ink-2); }
      .rw.sk { display: flex; gap: 12cqw; padding: 2.2cqw 1.8cqw; }
      .tk { z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 1.6cqw; padding: 2.4cqw 2.6cqw; }
      .tk code { font-family: var(--mono); font-size: 2.4cqw; font-weight: 750; color: var(--ink); }
      .tk .chip { font-size: 2.4cqw; }
    `,
  });
})();
