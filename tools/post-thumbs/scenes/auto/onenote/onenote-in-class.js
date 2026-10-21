/* OneNote — 학교 업무에 바로 활용하기 (v3) */
(() => {
  // Counselling notes: right-click the 상담록 section → "이 섹션을 암호로 보호", then set a password.
  scene('onenote/onenote-in-class', (K) => {
    const sec = (label, c, on) => `<div class="sec${on ? ' on' : ''}" style="--c:${c}"><i></i><span>${label}</span></div>`;
    const item = (icon, label, on) => `<div class="mi${on ? ' on' : ''}">${K.ico(on ? icon : `${icon}:r`, { s: 2.8 })}<span>${label}</span></div>`;
    return K.win({
      x: 5, y: 11, w: 64, h: 50, title: '학교 업무', icon: false,
      body: `<div class="ws">
        <nav>${sec('교무수첩', '#7719aa')}${sec('공문서철', '#2f7de1')}${sec('상담록', '#e0569a', true)}</nav>
        <div class="pg">
          <h4>상담일지</h4>
          <p class="dt">2학년 3반 · 4월 15일</p>
          ${K.skel('88%')}${K.skel('72%')}${K.skel('80%')}
        </div>
        <div class="menu">
          ${item('rename', '이름 바꾸기')}
          ${item('color', '섹션 색')}
          <div class="ln"></div>
          ${item('lock_closed', '이 섹션을 암호로 보호', true)}
        </div>
      </div>`,
    })
      + K.card({
        x: 63, y: 15.5, w: 32, cls: 'pw',
        body: `<div class="hd"><span class="ic">${K.ico('lock_closed', { s: 3 })}</span><b>암호 보호</b></div>
          <div class="fld"><i></i><i></i><i></i><i></i><i></i><i></i><span class="cr"></span></div>
          ${K.btn('암호 설정', { primary: true, cls: 'go' })}`,
      })
      + K.tile({ x: 1.6, y: 5.6, s: 10.5 })
      + K.float({ right: 7, y: 5.4, s: 6, icon: 'shield_lock' })
      + K.pill({ right: 4, bottom: 3.8, dark: true, icon: 'lock_closed', text: '상담록은 암호로 잠금' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .ws { position: relative; display: grid; grid-template-columns: 20cqw 1fr; height: 100%; }
      nav { display: flex; flex-direction: column; gap: .8cqw; padding: 2.6cqw 1.6cqw; background: rgba(250, 247, 252, .75); border-right: .2cqw solid #f0eaf4; }
      .sec { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .sec i { width: .8cqw; height: 2.8cqw; border-radius: 99px; background: var(--c); }
      .sec.on { background: #fff; color: var(--ink); box-shadow: 0 0 0 .25cqw color-mix(in srgb, var(--c) 45%, #fff), 0 .4cqw 1.2cqw rgba(176, 36, 106, .18); }
      .pg { padding: 3cqw 3.2cqw 0; display: flex; flex-direction: column; gap: 1.6cqw; }
      h4 { font-size: 3.6cqw; font-weight: 750; letter-spacing: -0.035em; }
      .dt { margin: -.6cqw 0 1cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
      .menu { position: absolute; left: 15cqw; top: 15.5cqw; z-index: 2; width: 33cqw; padding: 1cqw; display: flex; flex-direction: column; gap: .3cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .96); box-shadow: 0 1.6cqw 3.6cqw -1cqw rgba(60, 20, 90, .35), 0 0 0 .15cqw rgba(119, 25, 170, .1); }
      .mi { display: flex; align-items: center; gap: 1.3cqw; padding: 1.2cqw 1.4cqw; border-radius: 1cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .mi .ico { color: var(--ink-4); }
      .mi.on { background: var(--grad); color: #fff; font-size: 2.7cqw; font-weight: 750; }
      .mi.on .ico { color: #fff; }
      .menu .ln { height: .15cqw; margin: .4cqw 1cqw; background: #ece6f0; }
      .pw { z-index: 3; padding: 2.6cqw 2.6cqw 2.8cqw; }
      .pw .hd { display: flex; align-items: center; gap: 1.3cqw; margin-bottom: 2cqw; }
      .pw .ic { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 1.4cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .pw .hd b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .fld { display: flex; align-items: center; gap: 1cqw; height: 5.4cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .fld i { width: 1.4cqw; height: 1.4cqw; border-radius: 50%; background: var(--ink); }
      .fld .cr { width: .25cqw; height: 2.8cqw; background: rgb(var(--tint)); }
      .go { display: flex; margin-top: 2cqw; padding: 1.5cqw; font-size: 2.6cqw; border-radius: 1.3cqw; }
    `,
  });
})();
