/* word/wordonline1 — 웹 버전 시작하기 (v3): office.com 학교 계정 로그인 → [앱] 목록에서 Word 실행 */
(() => {
  scene('word/wordonline1', (K) => {
    const appCell = (app, name, on) => `<div class="ac${on ? ' on' : ''}">${K.app(app, { s: on ? 6.6 : 5.6 })}<span>${name}</span></div>`;
    const rail = [['home:r', ''], ['add_circle:r', ''], ['folder:r', ''], ['apps', ' on']]
      .map(([n, cls]) => `<span class="ri${cls}">${K.ico(n, { s: 3.2 })}</span>`).join('');
    return K.win({
      x: 31, y: 9.5, w: 65, h: 50, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.4 })}office.com</span>`,
      barRight: `<span class="acct">${K.ico('hat_graduation', { s: 2.8 })}학교 계정</span>`,
      body: `<div class="home">
        <div class="rail">${rail}</div>
        <div class="main">
          <div class="hd">${K.ico('apps', { s: 3.4 })}<b>앱</b></div>
          <div class="grid">
            ${appCell('word', 'Word', true)}
            ${appCell('excel', 'Excel')}
            ${appCell('powerpoint', 'PowerPoint')}
            ${appCell('onenote', 'OneNote')}
            ${appCell('teams', 'Teams')}
            ${appCell('forms', 'Forms')}
          </div>
        </div>
      </div>`,
    })
      + K.cursor({ x: 52.5, y: 29 })
      + K.tile({ x: 26, y: 4.2, s: 10.5 })
      + K.float({ x: 14, y: 13, app: 'onedrive' })
      + K.float({ x: 5, y: 28, icon: 'phone_laptop', far: true, s: 5.4 })
      + K.pill({ x: 4, bottom: 5, icon: 'globe', text: '설치 없이 바로 Word' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .8cqw 2.2cqw .8cqw 1.5cqw; border-radius: 99px; background: rgba(242, 243, 246, .9); font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); }
      .url .ico { color: var(--ink-4); }
      .acct { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.3cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-size: 2.3cqw; font-weight: 700; white-space: nowrap; }
      .home { display: grid; grid-template-columns: 8cqw 1fr; height: 100%; }
      .rail { display: flex; flex-direction: column; align-items: center; gap: 1.6cqw; padding-top: 2.8cqw; border-right: .2cqw solid rgba(220, 224, 232, .8); }
      .ri { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 1.3cqw; color: var(--ink-4); }
      .ri.on { background: var(--grad); color: #fff; box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(var(--tint), .6); }
      .main { padding: 2.8cqw 3.2cqw 0 3.4cqw; }
      .hd { display: flex; align-items: center; gap: 1.1cqw; color: rgb(var(--tint)); }
      .hd b { font-size: 3.1cqw; font-weight: 750; color: var(--ink); letter-spacing: -0.02em; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2cqw; margin-top: 2.6cqw; }
      .ac { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2cqw; height: 15.4cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .2cqw rgba(225, 229, 236, .9); font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .ac.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)), 0 1.4cqw 2.6cqw -1.2cqw rgba(var(--tint), .55); font-size: 2.8cqw; font-weight: 800; color: var(--ink); }
    `,
  });
})();
