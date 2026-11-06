/* copilot-studio/hwpx-homeroom-admin-agent — the attendance ledger gets a row only after the teacher says yes */
(() => {
  scene('copilot-studio/hwpx-homeroom-admin-agent', (K) => {
    const old = `<div class="tr">${K.skel('70%')}${K.skel('60%')}${K.skel('76%')}<span></span></div>`;
    return K.win({
      x: 36, y: 9, w: 61, h: 50, title: '출결관리대장.xlsx', icon: false,
      barRight: K.chip('출결대장', { icon: 'table', tint: true }),
      body: `<div class="lg">
        <div class="tr th"><span>날짜</span><span>성명</span><span>구분</span><span>${K.ico('document_checkmark', { s: 2.6 })}</span></div>
        ${old}${old}
        <div class="tr rd"><span>10. 22.</span><b>최서준</b><span>결석·질병</span><em>미제출</em></div>
        <div class="tr nw">${K.skel('70%', { tint: true })}<b>김민준</b><span>출석인정 2일</span><span class="ok">${K.ico('checkmark_circle', { s: 2.8 })}</span></div>
        ${old}
      </div>`,
    })
      + K.card({
        x: 5.5, y: 16, w: 31.5, cls: 'ask',
        body: `<div class="bt">${K.app(null, { s: 3.6 })}${K.bubble('출결관리대장에<br>반영할까요?')}</div>
          ${K.bubble('응, 대장에 반영해 줘', { me: true })}`,
      })
      + K.tile({ x: 31.5, y: 3.6, s: 10.5 })
      + K.float({ right: 5, y: 3.2, app: 'excel', s: 6 })
      + K.float({ x: 30, y: 40.5, icon: 'checkmark', s: 5.4, far: true })
      + K.pill({ x: 3, bottom: 4.4, icon: 'person_available', text: '선생님 확인 후 반영' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 10cqw; }
      .win__bar .chip { font-size: 2.2cqw; }
      .lg { display: flex; flex-direction: column; padding: 2.6cqw 3cqw 0; }
      .tr { display: grid; grid-template-columns: 11cqw 11cqw 17cqw 1fr; align-items: center; gap: 1.6cqw; height: 5.6cqw; padding: 0 1.8cqw;
        border-bottom: .15cqw solid rgba(20, 22, 30, .08); font-size: 2.6cqw; font-weight: 650; white-space: nowrap; color: var(--ink-2); }
      .tr .skel { height: 1.6cqw; }
      .th { height: 5cqw; border-radius: 1.2cqw 1.2cqw 0 0; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .tr b { font-weight: 750; color: var(--ink); }
      .rd { border-radius: 1cqw; background: color-mix(in srgb, var(--red) 14%, #fff); box-shadow: inset .55cqw 0 0 var(--red); }
      .rd em { justify-self: start; padding: .4cqw 1.2cqw; border-radius: 99px; font-style: normal; font-size: 2.2cqw; font-weight: 750; color: #c4302b; background: color-mix(in srgb, var(--red) 18%, #fff); }
      .nw { margin-top: .8cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .25cqw rgba(var(--tint), .6); }
      .nw span:nth-child(3) { color: rgb(var(--tint)); font-weight: 750; }
      .ok { color: var(--green); display: flex; }
      .ask { z-index: 3; display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw 2.6cqw 3cqw; }
      .bt { display: flex; align-items: flex-end; gap: 1.1cqw; }
      .ask .bubble { max-width: none; font-size: 2.6cqw; font-weight: 650; line-height: 1.38; white-space: nowrap; }
      .ask .bubble--me { align-self: flex-end; }
      &.dark {
        .tr { border-bottom-color: rgba(255, 255, 255, .08); }
        .th { background: rgba(var(--tint), .16); }
        .rd { background: rgba(255, 107, 102, .16); }
        .rd em { color: #ffa29c; background: rgba(255, 107, 102, .2); }
        .nw { background: rgba(var(--tint), .12); }
      }
    `,
  });
})();
