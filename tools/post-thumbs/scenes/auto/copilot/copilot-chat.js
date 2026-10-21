(() => {
  /* 채팅으로 수업 준비물 — the class list goes in with '/', printable seat-draw cards come out as PPTX. */
  scene('copilot/copilot-chat', (K) => {
    const nums = [7, 12, 3, 18];
    return K.win({
      x: 4, y: 9, w: 64, h: 52, title: 'Copilot', sub: '· 새 채팅', icon: false,
      body: `<div class="cc">
        <div class="me">
          <span class="fl">${K.app('excel', { s: 3 })}3학년 2반 명단.xlsx</span>
          ${K.bubble('자리 뽑기 카드 PPTX로 만들어 줘', { me: true })}
        </div>
        <div class="res">
          ${K.app('copilot', { s: 4 })}
          <div class="out">
            <div class="oh">${K.app('powerpoint', { s: 3.4 })}<b>자리 뽑기 카드.pptx</b><span class="sp"></span>${K.btn('열기', { line: true })}</div>
            <div class="tk">${nums.map((n, i) => `<div class="tc${i === 1 ? ' on' : ''}"><b>${n}</b>${K.skel('70%', { h: 1 })}</div>`).join('')}</div>
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 62, y: 30, w: 33, cls: 'pk',
        body: `<div class="q"><span class="kc">/</span>명단</div>
          <div class="it on">${K.app('excel', { s: 3.2 })}<span>3학년 2반 명단.xlsx</span></div>
          <div class="it">${K.app('word', { s: 3.2 })}${K.skel('62%')}</div>`,
      })
      + K.tile({ x: 1.2, y: 3.6, s: 10.5 })
      + K.float({ right: 5.5, y: 18.5, s: 6, icon: 'print' })
      + K.pill({ right: 4, y: 5.4, icon: 'lottery', text: '명단으로 뽑기 카드 완성' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .cc { display: flex; flex-direction: column; gap: 2.4cqw; padding: 3cqw 3.4cqw 0 3.4cqw; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2cqw; }
      .me .bubble { max-width: 100%; font-size: 2.6cqw; white-space: nowrap; }
      .fl { display: inline-flex; align-items: center; gap: 1cqw; padding: .8cqw 1.4cqw .8cqw 1cqw; border-radius: 1.2cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); font-size: 2.2cqw; font-weight: 650; white-space: nowrap; }
      .res { display: flex; align-items: flex-start; gap: 1.6cqw; }
      .out { width: 46cqw; padding: 1.8cqw 2cqw 2.2cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1.1cqw color-mix(in srgb, rgb(var(--tint)) 16%, transparent); }
      .oh { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: 1.8cqw; font-size: 2.7cqw; font-weight: 750; white-space: nowrap; }
      .oh .sp { flex: 1; }
      .oh .btn { padding: .7cqw 1.7cqw; font-size: 2.2cqw; }
      .tk { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.3cqw; }
      .tc { display: flex; flex-direction: column; align-items: center; gap: 1cqw; padding: 1.4cqw 0 1.6cqw; border-radius: 1.2cqw; background: #f6f6f9; box-shadow: inset 0 0 0 .2cqw var(--line); }
      .tc b { font-size: 5.4cqw; font-weight: 800; line-height: 1; color: rgb(var(--tint)); }
      .tc.on { background: var(--grad); box-shadow: 0 1cqw 2.4cqw color-mix(in srgb, rgb(var(--tint)) 35%, transparent); }
      .tc.on b { color: #fff; }
      .tc.on .skel { background: rgba(255, 255, 255, .6); }
      .pk { z-index: 3; padding: 2.2cqw; display: flex; flex-direction: column; gap: 1.3cqw; }
      .q { display: flex; align-items: center; gap: 1.2cqw; padding: .9cqw 1.2cqw; border-radius: 1.2cqw; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); font-size: 2.7cqw; font-weight: 700; }
      .kc { display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: .9cqw; background: var(--grad); color: #fff; font-size: 2.6cqw; font-weight: 800; }
      .it { display: flex; align-items: center; gap: 1.2cqw; padding: 1cqw 1.2cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
      .it .skel { flex: none; }
      .it.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); }
    `,
  });
})();
