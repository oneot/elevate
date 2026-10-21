/* OneNote — onenote/onenote-mobile (v3) */
(() => {
  // Phone app: a PC notebook opened on the phone; the password-locked section opens with a fingerprint.
  scene('onenote/onenote-mobile', (K) => {
    const sec = (label, c, on, lock) => `<div class="sec${on ? ' on' : ''}"><i class="cb" style="background:${c}"></i><span class="lb">${label}</span>${lock ? K.ico('lock_closed', { s: 2.4 }) : ''}</div>`;
    return `<div class="phone land" style="--w:68cqw;${K.pos({ x: 5, y: 15 })}"><div class="phone__screen">
        <div class="bar">${K.ico('chevron_left:r', { s: 2.8 })}<b>교무수첩</b>${K.skel('14cqw', { h: 1.2 })}</div>
        <div class="body">
          <nav>
            ${sec('공문서철', '#2f7de1')}
            ${sec('수업 노트', '#2bb673')}
            ${sec('상담록', '#e0569a', true, true)}
          </nav>
          <div class="lk">
            <span class="lic">${K.ico('lock_closed', { s: 4.2 })}</span>
            <h4>암호로 보호된 섹션</h4>
            <div class="fp">${K.ico('fingerprint', { s: 3.2 })}<span>지문으로 열기</span></div>
            <p class="hint">처음 한 번만 암호 입력</p>
          </div>
        </div>
      </div></div>`
      + K.tile({ x: 1.2, y: 8.6, s: 10.5 })
      + K.float({ x: 69, y: 37, icon: 'fingerprint', s: 7.4 })
      + K.float({ x: 86, y: 19, icon: 'lock_open', far: true, s: 5.4 })
      + K.pill({ right: 4.5, y: 5.2, tint: true, icon: 'phone', text: '잠긴 노트도 지문으로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .land { aspect-ratio: 16 / 9; z-index: 2; }
      .land .phone__screen::before { top: 50%; left: .8cqw; width: 1.3cqw; height: 18%; translate: 0 -50%; }
      .bar { display: flex; align-items: center; gap: 1.6cqw; height: 7cqw; padding: 0 3.4cqw 0 9.4cqw; border-bottom: .2cqw solid #efe8f4; color: rgb(var(--tint)); }
      .bar b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; }
      .bar .skel { margin-left: auto; }
      .body { display: grid; grid-template-columns: 22cqw 1fr; height: calc(100% - 7cqw); }
      nav { display: flex; flex-direction: column; gap: 1.1cqw; padding: 3cqw 1.6cqw 0 3.6cqw; background: #faf7fc; border-right: .2cqw solid #f0eaf4; }
      .sec { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.3cqw; border-radius: 1.2cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .sec .cb { flex: none; width: .8cqw; height: 2.8cqw; border-radius: 99px; }
      .sec .lb { flex: 1; }
      .sec .ico { color: var(--ink-4); }
      .sec.on { background: #fff; color: var(--ink); box-shadow: 0 .3cqw 1.2cqw rgba(119, 25, 170, .16); }
      .sec.on .ico { color: rgb(var(--tint)); }
      .lk { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.9cqw; padding-bottom: 2cqw; }
      .hint { margin-top: -.4cqw; }
      .lic { display: grid; place-items: center; width: 7.4cqw; height: 7.4cqw; border-radius: 50%; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      h4 { font-size: 3cqw; font-weight: 750; letter-spacing: -0.035em; white-space: nowrap; }
      .fp { display: flex; align-items: center; gap: 1.2cqw; padding: 1.3cqw 2.8cqw; border-radius: 99px; background: var(--grad); color: #fff; font-size: 2.7cqw; font-weight: 700; white-space: nowrap; box-shadow: 0 1.2cqw 2.4cqw -1cqw rgba(119, 25, 170, .55); }
      .hint { font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    `,
  });
})();
