(() => {
  /* 채널과 게시물 — "채널 추가" dialog: name + channel type (private selected) → new channel with tabs */
  scene('teams/teams-channel', (K) => {
    const opt = (icon, name, desc, on) => `<div class="op${on ? ' on' : ''}">
      <div class="row oh"><span class="oi">${K.ico(icon, { s: 2.8 })}</span><b>${name}</b><span class="grow"></span><span class="radio${on ? ' on' : ''}"></span></div>
      <span class="od">${desc}</span></div>`;
    return K.win({
      x: 5, y: 10, w: 63, h: 50, title: '채널 추가', icon: false,
      barRight: K.ico('dismiss:r', { s: 2.8, c: 'var(--ink-4)' }),
      body: `<div class="dg">
        <p class="lb">채널 이름</p>
        <div class="in"><span>1조 모둠 토의</span><i></i></div>
        <p class="lb">채널 유형</p>
        <div class="ops">${opt('globe', '표준', '팀 구성원 모두')}${opt('lock_closed', '비공개', '할당된 구성원만', true)}</div>
        <div class="ft">${K.btn('만들기', { primary: true })}</div>
      </div>`,
    })
      + K.card({
        x: 65.5, y: 27.5, w: 27.5, cls: 'nc',
        body: `<div class="row nh">${K.ico('lock_closed', { s: 2.6 })}<b>1조 모둠 토의</b></div>
          <div class="tb"><span class="on">게시물</span><span>파일</span><span>Notes</span></div>
          <div class="ps">${K.skel('90%')}${K.skel('62%')}</div>`,
      })
      + K.tile({ x: 1.6, y: 4.2, s: 11 })
      + K.float({ right: 5, y: 17.5, icon: 'people_team' })
      + K.pill({ right: 4, y: 5.6, icon: 'lock_closed', text: '조별 비공개 토의방' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 13cqw; font-size: 2.9cqw; font-weight: 700; }
      .dg { padding: 2.6cqw 3.4cqw 0; display: flex; flex-direction: column; }
      .lb { font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); margin-bottom: 1cqw; }
      .in { display: flex; align-items: center; gap: .3cqw; height: 5.6cqw; padding: 0 1.8cqw; margin-bottom: 2.4cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
      .in span { font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .in i { width: .25cqw; height: 3cqw; background: rgb(var(--tint)); }
      .ops { display: grid; grid-template-columns: 1fr 1fr; gap: 1.8cqw; }
      .op { display: flex; flex-direction: column; gap: 1.2cqw; padding: 1.8cqw 2cqw 2cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .7); box-shadow: inset 0 0 0 .22cqw var(--line-2); }
      .op b { font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .od { font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
      .oh { align-items: center; gap: 1.4cqw; }
      .oi { flex: none; display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.3cqw; background: var(--fill); color: var(--ink-3); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)), 0 1.2cqw 2.4cqw -1.4cqw rgba(var(--tint), .5); }
      .op.on .oi { background: var(--grad); color: #fff; }
      .op.on .od { color: rgb(var(--tint)); }
      .ft { display: flex; justify-content: flex-end; margin-top: 2cqw; }
      .ft .btn { padding: 1.1cqw 2.6cqw; font-size: 2.5cqw; }
      .nc { z-index: 3; padding: 2.2cqw 2.2cqw 2.4cqw; }
      .nh { gap: .9cqw; align-items: center; color: rgb(var(--tint)); }
      .nh b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
      .tb { display: flex; gap: 1.6cqw; margin-top: 1.6cqw; border-bottom: .2cqw solid var(--line); }
      .tb span { padding-bottom: .8cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tb .on { color: rgb(var(--tint)); font-weight: 700; box-shadow: inset 0 -.4cqw 0 rgb(var(--tint)); }
      .ps { display: grid; gap: 1cqw; margin-top: 1.8cqw; }
    `,
  });
})();
