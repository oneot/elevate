/* 검색 코치 — 수업 설정 › 필터: basic filters + optional 사실 확인 filter switched on */
(() => {
  scene('teams/teams-searchcoach', (K) => {
    const nav = (icon, label, on) => `<div class="nv${on ? ' on' : ''}">${K.ico(on ? icon : `${icon}:r`, { s: 2.8 })}<span>${label}</span></div>`;
    const flt = (icon, label, on = true) => `<div class="ft">${K.ico(`${icon}:r`, { s: 2.8 })}<b>${label}</b><span class="grow"></span><i class="toggle${on ? ' on' : ''}"></i></div>`;
    return K.win({
      x: 5, y: 8.6, w: 66, h: 52, title: '수업 설정', icon: false,
      barRight: K.btn('저장', { primary: true }),
      body: `<div class="cs">
        <div class="side">${nav('image', '배경 화면')}${nav('filter', '필터', true)}</div>
        <div class="main">
          <p class="lb">필터 표시</p>
          <div class="grid">${flt('globe', '도메인')}${flt('document_pdf', '파일 형식')}${flt('calendar_ltr', '날짜 범위')}${flt('math_symbols', '연산자', false)}</div>
          <p class="lb">선택적 필터</p>
          <div class="fc">
            <span class="sh">${K.ico('shield_checkmark', { s: 3.4 })}</span>
            <div class="col grow" style="gap:.5cqw"><b>사실 확인</b><span class="ds">팩트 체크 사이트 선택</span></div>
            <i class="toggle on"></i>
          </div>
          <div class="ft wide">${K.ico('add_circle:r', { s: 2.8 })}<b>직접 만들기</b><span class="grow"></span><i class="toggle"></i></div>
        </div>
      </div>`,
    })
      + K.tile({ x: 1.6, y: 4, s: 10.5 })
      + K.float({ right: 15, y: 24, icon: 'shield_checkmark', s: 7.6 })
      + K.float({ right: 5, y: 15.5, icon: 'checkmark', s: 4.8, far: true })
      + K.pill({ right: 4, y: 6, icon: 'search_sparkle', text: '믿을 만한 검색 필터' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 0 },
    css: `
      .win__bar { padding-left: 11.6cqw; }
      .win__bar .btn { padding: 1cqw 2.2cqw; font-size: 2.3cqw; }
      .cs { display: grid; grid-template-columns: 17cqw 1fr; height: 100%; }
      .side { display: flex; flex-direction: column; gap: 1cqw; padding: 3cqw 1.6cqw; background: rgba(246, 246, 251, .75); border-right: .2cqw solid var(--line); }
      .nv { display: flex; align-items: center; gap: 1.1cqw; padding: 1.2cqw 1.3cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .nv.on { background: #fff; color: rgb(var(--tint)); box-shadow: 0 .3cqw 1.2cqw rgba(var(--tint), .18); }
      .main { padding: 2.2cqw 3cqw; }
      .lb { margin: 0 0 1.3cqw; font-size: 2.1cqw; font-weight: 700; color: rgb(var(--tint)); }
      .lb + .fc { margin-top: 0; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1cqw; margin-bottom: 2cqw; }
      .ft { display: flex; align-items: center; gap: 1cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.3cqw; background: rgba(255, 255, 255, .7); box-shadow: inset 0 0 0 .2cqw var(--line); }
      .ft .ico { color: var(--ink-3); }
      .ft b { font-size: 2.3cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
      .ft .toggle { width: 4.6cqw; height: 2.6cqw; }
      .ft .toggle::after { width: 1.9cqw; height: 1.9cqw; }
      .fc { display: flex; align-items: center; gap: 1.6cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1.2cqw 2.4cqw -1.4cqw rgba(var(--tint), .55); }
      .fc .sh { flex: none; display: grid; place-items: center; width: 5.6cqw; height: 5.6cqw; border-radius: 1.5cqw; background: var(--grad); color: #fff; }
      .fc b { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .fc .ds { font-size: 2.05cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .wide { margin-top: 1cqw; }
    `,
  });
})();
