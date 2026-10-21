/* 과제와 성적 — 성적 탭 격자 + 학생 ⋯ 메뉴(반환) + Excel로 내보내기 */
(() => {
  scene('teams/teams-score', (K) => {
    const S = [
      ['var(--f2)', '18', '9'],
      ['rgb(var(--tint))', '17', '10', true],
      ['#e0569a', '20', '8'],
      ['#2fa36b', '15', '9'],
      ['var(--f4)'],
    ];
    const row = ([c, a, b, on]) => `<div class="st${on ? ' on' : ''}">${K.avatar('', { s: 3.8, c })}${K.skel(on ? '7cqw' : '8cqw', { tint: on })}<span class="grow"></span>${on ? `<span class="mo">${K.ico('more_horizontal', { s: 2.6 })}</span>` : ''}</div>`
      + (a ? `<div class="sc${on ? ' on' : ''}"><b>${a}</b></div><div class="sc${on ? ' on' : ''}"><b>${b}</b></div>` : `<div class="sc">${K.skel('3cqw')}</div><div class="sc">${K.skel('3cqw')}</div>`);
    return K.win({
      x: 30, y: 10.5, w: 66, h: 50, title: '성적', icon: false,
      barRight: K.btn('Excel로 내보내기', { line: true, icon: 'arrow_export_ltr:r' }),
      body: `<div class="gr">
        <div class="hd hs">${K.skel('6cqw')}</div><div class="hd">환경 보고서</div><div class="hd">단원 퀴즈</div>
        ${S.map(row).join('')}
      </div>`,
    })
      + K.card({
        x: 19, y: 37.8, w: 31, cls: 'mn',
        body: `<div class="mi on">${K.ico('arrow_reply', { s: 3 })}반환</div>
          <div class="mi">${K.ico('arrow_undo:r', { s: 3 })}수정으로 돌아가기</div>
          <div class="mi">${K.ico('person_prohibited:r', { s: 3 })}${K.skel('12cqw')}</div>`,
      })
      + K.tile({ x: 24.6, y: 4.6, s: 11 })
      + K.float({ right: 1.2, y: 19.6, s: 6.6, app: 'excel', square: true })
      + K.pill({ right: 4, y: 3.4, icon: 'checkmark_circle', text: '성적 확인부터 반환까지', tint: true });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 9.6cqw; font-size: 3cqw; font-weight: 700; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .gr { display: grid; grid-template-columns: 23cqw 1fr 1fr; padding: 1.4cqw 3cqw 0; }
      .gr > * { display: flex; align-items: center; height: 6.4cqw; border-bottom: .18cqw solid rgba(20, 22, 30, .07); }
      .hd { height: 5.2cqw; justify-content: center; font-size: 2.3cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .hd.hs { justify-content: flex-start; }
      .st { gap: 1.3cqw; padding: 0 1.2cqw; }
      .sc { justify-content: center; }
      .sc b { font-family: var(--display); font-size: 3.2cqw; font-weight: 650; color: var(--ink-2); }
      .st.on, .sc.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, rgba(255, 255, 255, .7)); border-bottom-color: transparent; }
      .st.on { border-radius: 1.4cqw 0 0 1.4cqw; }
      .sc.on + .sc.on { border-radius: 0 1.4cqw 1.4cqw 0; }
      .sc.on b { color: rgb(var(--tint)); font-weight: 750; }
      .mo { display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 50%; background: var(--grad); color: #fff; box-shadow: 0 .6cqw 1.4cqw -.4cqw rgba(var(--tint), .6); }
      .mn { z-index: 4; display: flex; flex-direction: column; gap: .5cqw; padding: 1.3cqw; }
      .mi { display: flex; align-items: center; gap: 1.3cqw; height: 5.2cqw; padding: 0 1.5cqw; border-radius: 1.2cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .mi .ico { color: var(--ink-3); }
      .mi.on { background: var(--grad); color: #fff; font-size: 2.8cqw; }
      .mi.on .ico { color: #fff; }
    `,
  });
})();
