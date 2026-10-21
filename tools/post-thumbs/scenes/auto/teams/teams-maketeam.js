/* 팀 만들기 — 팀 관리 › 설정: generated team code students type into 팀 참가 */
(() => {
  scene('teams/teams-maketeam', (K) => {
    const tabs = ['멤버', '보류 중 요청', '채널', '설정', '분석']
      .map((t) => `<span class="${t === '설정' ? 'on' : ''}">${t}</span>`).join('');
    return K.win({
      x: 31, y: 9.5, w: 66, h: 50, title: '3학년 2반', sub: ' · 팀 관리', icon: false,
      barRight: K.ico('more_horizontal', { s: 3, c: 'var(--ink-3)' }),
      body: `<div class="tb">${tabs}</div>
        <div class="st">
          <div class="row sh">${K.ico('key', { s: 3, c: 'rgb(var(--tint))' })}<b>팀 코드</b><span class="grow"></span>${K.skel('14cqw')}</div>
          <div class="cd"><span>k7x2m9p</span></div>
          <div class="row ac">${K.btn('복사', { primary: true, icon: 'copy' })}${K.btn('전체 화면', { line: true, icon: 'full_screen_maximize:r' })}</div>
          <div class="row pm"><b>구성원 권한</b><span class="grow"></span>${K.skel('12cqw')}<span class="toggle on"></span></div>
        </div>`,
    })
      + K.tile({ x: 26.5, y: 4, s: 11 })
      + K.float({ x: 13, y: 9, icon: 'qr_code', s: 7.4 })
      + K.float({ x: 5.5, y: 25, icon: 'people_add', far: true })
      + K.pill({ x: 4, bottom: 5, icon: 'people_team', text: '코드로 우리 반 초대' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .tb { display: flex; gap: 2.8cqw; padding: 0 3.2cqw; border-bottom: .2cqw solid var(--line); white-space: nowrap; }
      .tb span { position: relative; padding: 1.6cqw 0 1.4cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .tb span.on { color: var(--ink); font-weight: 750; }
      .tb span.on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.2cqw; height: .5cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .st { padding: 2.4cqw 3.2cqw 0; }
      .sh { gap: 1.2cqw; }
      .sh b { font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.02em; }
      .cd { display: grid; place-items: center; height: 10.4cqw; margin-top: 1.8cqw; border-radius: 1.8cqw; background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1.2cqw 2.6cqw -1.4cqw rgba(var(--tint), .55); }
      .cd span { padding-left: .5em; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 6.2cqw; font-weight: 750; letter-spacing: .5em; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; white-space: nowrap; }
      .ac { gap: 1.2cqw; margin-top: 1.8cqw; }
      .ac .btn { font-size: 2.3cqw; }
      .pm { gap: 1.4cqw; margin-top: 2cqw; padding-top: 1.8cqw; border-top: .2cqw solid var(--line); }
      .pm b { font-size: 2.4cqw; font-weight: 650; }
    `,
  });
})();
