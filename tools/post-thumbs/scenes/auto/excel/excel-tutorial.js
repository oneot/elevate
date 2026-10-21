/* 데이터 쉽게 관리하기: 앱 버전 Excel의 [개발 도구] 탭에서 '매크로 기록'으로 반복 업무 자동화 — see STYLE_GUIDE.md */
(() => {
  scene('excel/excel-tutorial', (K) => {
    const cmd = (icon, label, on) => `<div class="cmd${on ? ' on' : ''}"><span class="ci">${icon ? K.ico(icon, { s: 3.4 }) : '<i class="dot"></i>'}</span><b>${label}</b></div>`;
    const cols = ['A', 'B', 'C', 'D', 'E'];
    let cells = `<div class="h top"></div>${cols.map(() => '<div class="h top"></div>').join('')}`;
    cells += `<div class="h"></div>${cols.map((_, i) => `<div class="th">${K.skel(`${[60, 70, 50, 55, 40][i]}%`, { h: 1.5, tint: true })}</div>`).join('')}`;
    [[50, 72, 30, 30, 0], [44, 64, 30, 30, 0], [56, 70, 30, 30, 0], [48, 60, 30, 30, 0]].forEach((r) => {
      cells += `<div class="h"></div>${r.map((w) => `<div>${w ? K.skel(`${w}%`, { h: 1.4 }) : ''}</div>`).join('')}`;
    });
    return K.win({
      x: 4, y: 10.5, w: 64, h: 50, title: '출결 자동 정리', icon: false,
      body: `<div class="rib">
          <div class="tabs"><span>홈</span><span>삽입</span><span>데이터</span><span class="on">개발 도구</span></div>
          <div class="cmds">${cmd('code', 'Visual Basic')}${cmd('list', '매크로')}${cmd(null, '매크로 기록', true)}${cmd('shield_lock', '매크로 보안')}</div>
        </div>
        <div class="xl" style="--cols: 3.4cqw 9cqw 14cqw 1fr 1fr 1fr; --rh: 4.4cqw">${cells}<span class="rng"></span></div>`,
    })
      + K.card({
        x: 61, y: 23, w: 34, cls: 'dlg',
        body: `<p class="dh"><i class="dot"></i>매크로 기록</p>
          <span class="lb">매크로 이름</span>
          <div class="fld">출결_자동정리<i class="caret"></i></div>
          <div class="acts">${K.btn('확인', { primary: true })}</div>`,
      })
      + K.tile({ x: 1.6, y: 4.2, s: 10.5 })
      + K.float({ right: 5, y: 13.4, s: 6, icon: 'code', far: true })
      + K.pill({ right: 4, y: 4.4, icon: 'play', text: '반복 업무를 자동으로' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .rib { background: rgba(255, 255, 255, .7); border-bottom: .2cqw solid var(--line); }
      .tabs { display: flex; gap: 3.4cqw; padding: 1.4cqw 3cqw 0; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .tabs span { padding-bottom: 1cqw; white-space: nowrap; }
      .tabs .on { color: rgb(var(--tint)); font-weight: 750; box-shadow: inset 0 -.5cqw 0 rgb(var(--tint)); }
      .cmds { display: flex; gap: 1cqw; padding: 1.2cqw 2cqw; border-top: .2cqw solid var(--line); background: rgba(247, 248, 250, .85); }
      .cmd { display: flex; flex-direction: column; align-items: center; gap: .7cqw; padding: 1cqw 1.4cqw .9cqw; border-radius: 1.2cqw; }
      .cmd .ci { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 1.2cqw; color: var(--ink-3); }
      .cmd b { font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .cmd.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .cmd.on .ci { background: #fff; color: var(--red); box-shadow: 0 .4cqw 1cqw -.4cqw rgba(20, 22, 30, .3); }
      .cmd.on b { color: rgb(var(--tint)); font-weight: 750; font-size: 2.6cqw; }
      .xl { position: relative; }
      .xl > .h.top { height: 3.2cqw; }
      .xl > .th { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); }
      .rng { position: absolute; grid-column: 2 / 7; grid-row: 2 / 3; inset: 0; height: auto; padding: 0; border: none; overflow: visible; box-shadow: inset 0 0 0 .32cqw rgb(var(--tint)); }
      .dlg { z-index: 3; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.8cqw 3cqw; }
      .dh { display: flex; align-items: center; gap: 1cqw; margin-bottom: .6cqw; font-size: 2.8cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .dh .ico { color: var(--red); }
      .lb { font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); }
      .fld { display: flex; align-items: center; height: 5.4cqw; padding: 0 1.6cqw; border-radius: 1.1cqw; background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); font-size: 2.7cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .caret { width: .22cqw; height: 3cqw; margin-left: .3cqw; background: var(--ink); }
      .dot { display: block; flex: none; width: 2.4cqw; height: 2.4cqw; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff8a80, var(--red) 70%); box-shadow: 0 0 0 .5cqw color-mix(in srgb, var(--red) 18%, transparent); }
      .dh .dot { width: 2cqw; height: 2cqw; }
      .acts { display: flex; justify-content: flex-end; margin-top: .6cqw; }
    `,
  });
})();
