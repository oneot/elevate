/* 수업 활동 — module in the 수업 활동 tab with the [+] resource menu open */
(() => {
  scene('teams/teams-class', (K) => {
    const res = (lead, body, cls = '') => `<div class="rr ${cls}"><span class="rl">${lead}</span>${body}</div>`;
    const opt = (icon, label, on) => `<div class="op${on ? ' on' : ''}"><span class="oi">${on ? K.ico(icon, { s: 2.9 }) : K.app(icon, { s: 3 })}</span><span>${label}</span></div>`;
    const optI = (icon, label) => `<div class="op"><span class="oi">${K.ico(icon, { s: 2.8 })}</span><span>${label}</span></div>`;
    return K.win({
      x: 4, y: 10, w: 64, h: 50, title: '3학년 2반', icon: false,
      barRight: K.btn('게시', { primary: true, icon: 'send' }),
      body: `<div class="tabs"><span>게시물</span><span class="on">수업 활동</span></div>
        <div class="md">
          <div class="row hd"><span class="no">3</span><b class="mt">생태계 탐구</b><span class="grow"></span><span class="plus">${K.ico('add', { s: 2.8 })}</span></div>
          ${res(K.app('word', { s: 3.2 }), '<b>관찰 활동지</b>')}
          ${res(K.ico('link', { s: 2.8 }), K.skel('46%'))}
          <div class="drop">${K.ico('add', { s: 2.6 })}리소스 추가</div>
        </div>`,
    })
      + K.card({
        x: 64, y: 24.5, w: 30, cls: 'menu',
        body: `<div class="ml">
          ${optI('document', '파일')}
          ${opt('backpack', '과제', true)}
          ${opt('onenote', '수업용 전자필기장')}
          ${optI('link', '링크')}
        </div>`,
      })
      + K.cursor({ x: 84, y: 34.5 })
      + K.tile({ x: 0.8, y: 4.2, s: 10.5 })
      + K.float({ right: 7, y: 14.5, icon: 'checkmark', far: true })
      + K.pill({ right: 4, y: 4.6, icon: 'apps_list', text: '차시 자료를 한 모듈에' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .tabs { display: flex; align-items: center; gap: 3cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); white-space: nowrap; }
      .tabs > span { position: relative; padding: 1.5cqw 0 1.3cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .tabs > span.on { color: var(--ink); font-weight: 750; }
      .tabs > span.on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.2cqw; height: .5cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .md { margin: 2.4cqw 3cqw 0; padding: 2.4cqw 2.6cqw; border-radius: 1.8cqw; background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 .22cqw var(--line-2); display: flex; flex-direction: column; gap: 1.3cqw; }
      .hd { gap: 1.3cqw; margin-bottom: .6cqw; }
      .no { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.1cqw; background: var(--grad); color: #fff; font-size: 2.4cqw; font-weight: 750; }
      .mt { font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .plus { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%; background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); color: rgb(var(--tint)); box-shadow: 0 0 0 .3cqw rgb(var(--tint)); }
      .win__bar .btn { padding: 1cqw 2.2cqw; font-size: 2.3cqw; }
      .rr { display: flex; align-items: center; gap: 1.4cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.2cqw; background: var(--fill); }
      .rr b { font-size: 2.5cqw; font-weight: 650; white-space: nowrap; }
      .rl { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; background: #fff; color: rgb(var(--tint)); }
      .drop { display: flex; align-items: center; justify-content: center; gap: .8cqw; padding: 1.3cqw; border-radius: 1.2cqw; border: .22cqw dashed color-mix(in srgb, rgb(var(--tint)) 45%, #fff); color: rgb(var(--tint)); font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
      .menu { z-index: 3; }
      .ml { display: flex; flex-direction: column; gap: .5cqw; padding: 1.6cqw; }
      .op { display: flex; align-items: center; gap: 1.4cqw; padding: 1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .oi { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); color: rgb(var(--tint)); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); color: var(--ink); font-weight: 750; font-size: 2.7cqw; }
      .op.on .oi { background: var(--grad); color: #fff; }
    `,
  });
})();
