/* github/github-pages — Settings › Pages: branch main saved, site live at oneot.github.io/ai/ */
(() => {
  scene('github/github-pages', (K) => {
    const chev = K.ico('chevron_down:r', { s: 2.2 });
    const item = (inner, on) => `<div class="it${on ? ' on' : ''}">${inner}</div>`;
    return K.win({
      x: 4, y: 10.5, w: 60, h: 50, z: 2, icon: false, title: 'oneot / ai',
      body: `<div class="tabs"><span>${K.ico('code', { s: 2.6 })}Code</span><span class="on">${K.ico('settings', { s: 2.6 })}Settings</span></div>
        <div class="cols">
          <div class="side">${item(K.skel('70%'))}${item(K.skel('52%'))}${item('Pages', true)}${item(K.skel('62%'))}</div>
          <div class="main">
            <p class="h">GitHub Pages</p>
            <div class="live hl">${K.ico('checkmark_circle', { s: 3.6, c: 'var(--green)' })}<div class="grow"><small>Your site is live at</small><b>oneot.github.io/ai/</b></div></div>
            <div class="row br"><span class="sel on">${K.ico('branch', { s: 2.4 })}main ${chev}</span><span class="sel">/ (root) ${chev}</span>${K.btn('Save', { primary: true })}</div>
            ${K.btn('Visit site', { line: true, icon: 'open:r' })}
          </div>
        </div>`,
    })
      + K.tile({ x: 1.2, y: 4, s: 10.5 })
      + K.mascot('ducky-front', { x: 61.5, bottom: -2.5, w: 26, z: 1, rotate: -7 })
      + K.pill({ right: 4, y: 5, icon: 'globe', text: '내 주소로 웹앱 공개' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11cqw; }
      .tabs { display: flex; gap: 3.2cqw; height: 5.6cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); }
      .tabs span { display: flex; align-items: center; gap: .9cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .tabs .on { color: var(--ink); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
      .cols { display: flex; height: calc(100% - 5.6cqw); }
      .side { flex: none; width: 13cqw; display: flex; flex-direction: column; gap: .6cqw; padding: 2.4cqw 1.4cqw; border-right: .2cqw solid var(--line); }
      .it { display: flex; align-items: center; height: 4.4cqw; padding: 0 1.2cqw; border-radius: .9cqw; }
      .it.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset .45cqw 0 0 rgb(var(--tint)); font-size: 2.5cqw; font-weight: 700; }
      .main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 2cqw; padding: 2.6cqw 3cqw; }
      .h { font-size: 3.2cqw; font-weight: 750; letter-spacing: -0.02em; }
      .live { align-self: stretch; display: flex; align-items: center; gap: 1.6cqw; padding: 1.6cqw 2cqw; border-radius: 1.6cqw; background: #fff; }
      .live small { display: block; font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); }
      .live b { display: block; margin-top: .3cqw; font-size: 3cqw; font-weight: 750; letter-spacing: -0.01em; color: rgb(var(--tint)); white-space: nowrap; }
      .br { gap: 1.2cqw; }
      .sel { display: inline-flex; align-items: center; gap: .8cqw; padding: 1.1cqw 1.4cqw; border-radius: 1cqw; background: var(--fill); box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.4cqw; font-weight: 650; white-space: nowrap; }
      .sel.on { color: rgb(var(--tint)); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
      .sel .ico:last-child { color: var(--ink-4); }
      .main .btn { font-size: 2.4cqw; padding: 1.1cqw 1.9cqw; }
    `,
  });
})();
