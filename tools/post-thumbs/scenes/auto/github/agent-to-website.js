/* github/agent-to-website — Settings › Pages: branch main saved, the spellchecker agent site is live */
(() => {
  scene('github/agent-to-website', (K) => {
    const chev = K.ico('chevron_down:r', { s: 2.2 });
    const it = (inner, on) => `<div class="it${on ? ' on' : ''}">${inner}</div>`;
    return K.win({
      x: 4, y: 12, w: 60, h: 47, z: 2, icon: false, title: 'oneot / spellchecker',
      body: `<div class="tabs"><span>${K.ico('code', { s: 2.6 })}Code</span><span class="on">${K.ico('settings', { s: 2.6 })}Settings</span></div>
        <div class="cols">
          <div class="side">${it(K.skel('80%'))}${it(K.skel('60%'))}${it('Pages', true)}${it(K.skel('70%'))}</div>
          <div class="main">
            <div class="live hl">
              <div class="lh">${K.ico('checkmark_circle', { s: 2.8, c: 'var(--green)' })}<small>Your site is live at</small><span class="grow"></span>${K.btn('Visit site', { primary: true, icon: 'open:r' })}</div>
              <b>oneot.github.io/spellchecker</b>
            </div>
            <p class="lb">Branch</p>
            <div class="br"><span class="sel on">${K.ico('branch', { s: 2.4 })}main ${chev}</span><span class="sel">/ (root) ${chev}</span>${K.btn('Save', { cls: 'sv' })}</div>
            <div class="more">${K.skel('46%')}${K.skel('70%')}</div>
          </div>
        </div>`,
    })
      + K.mascot('mona-tilt', { x: 52, y: 0.6, w: 24, z: 1 })
      + K.mascot('ducky-side2', { right: 2.4, y: 23.5, w: 17, z: 3, flip: true })
      + K.float({ x: 67, y: 27.5, s: 6.4, app: 'copilot-studio' })
      + K.tile({ x: 0.8, y: 6.6, s: 10.5 })
      + K.pill({ right: 3.4, bottom: 4.2, icon: 'globe', text: '에이전트를 내 주소로' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 10.4cqw; }
      .win__bar > span:not(.win__dots) { font-size: 2.5cqw; font-weight: 700; white-space: nowrap; }
      .tabs { display: flex; gap: 3cqw; height: 5.2cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); }
      .tabs span { display: flex; align-items: center; gap: .8cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .tabs .on { color: var(--ink); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
      .cols { display: flex; height: calc(100% - 5.2cqw); }
      .side { flex: none; width: 12cqw; display: flex; flex-direction: column; gap: .6cqw; padding: 2.4cqw 1.2cqw; border-right: .2cqw solid var(--line); }
      .it { display: flex; align-items: center; height: 4.2cqw; padding: 0 1.1cqw; border-radius: .9cqw; }
      .it.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset .45cqw 0 0 rgb(var(--tint)); font-size: 2.4cqw; font-weight: 750; }
      .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.6cqw 2.6cqw; }
      .live { display: flex; flex-direction: column; gap: 1.2cqw; padding: 1.8cqw 2cqw 2cqw; border-radius: 1.6cqw; background: #fff; }
      .lh { display: flex; align-items: center; gap: .9cqw; }
      .lh small { font-size: 2.1cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .lh .btn { padding: .8cqw 1.5cqw; font-size: 2.1cqw; }
      .live b { font-size: 2.75cqw; font-weight: 800; letter-spacing: -0.02em; color: rgb(var(--tint)); white-space: nowrap; }
      .lb { margin-top: .4cqw; font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .br { display: flex; align-items: center; gap: 1.1cqw; }
      .sel { display: inline-flex; align-items: center; gap: .7cqw; padding: 1cqw 1.3cqw; border-radius: 1cqw; background: var(--fill); box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
      .sel.on { background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .sel .ico { color: var(--ink-3); }
      .sv { padding: 1cqw 1.8cqw; border-radius: 1cqw; background: #1f883d; color: #fff; font-size: 2.3cqw; font-weight: 700; }
      .more { display: flex; flex-direction: column; gap: 1.4cqw; margin-top: 1.4cqw; padding-top: 2cqw; border-top: .2cqw solid var(--line); }
    `,
  });
})();
