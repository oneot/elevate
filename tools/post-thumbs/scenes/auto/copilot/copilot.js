/* copilot/copilot — 수업 설계하기: Copilot Chat proposes 7 random seat-change ideas within the post's conditions. */
(() => {
  scene('copilot/copilot', (K) => {
    const row = (n, t, on) => `<div class="it${on ? ' on' : ''}"><span class="n">${n}</span><b>${t}</b>${on ? `<span class="ok">${K.ico('checkmark', { s: 2.2 })}</span>` : K.skel(on ? '0' : '34%')}</div>`;
    return K.win({
      x: 31, y: 8, w: 65, h: 51, icon: false, title: 'Copilot Chat',
      barRight: K.chip('수업 운영 설계', { tint: true, icon: 'hat_graduation' }),
      body: `<div class="cc">
        <div class="me">
          ${K.bubble('15분 안에 끝나는 자리 랜덤 배치 7가지', { me: true })}
          <div class="cond">${K.chip('조용한 분위기', { line: true, icon: 'speaker_mute:r' })}${K.chip('공정성', { line: true, icon: 'scales:r' })}</div>
        </div>
        <div class="res">
          ${K.app('copilot', { s: 3.8 })}
          <div class="ls">
            ${row(1, '번호 뽑기')}
            ${row(2, '색깔 카드 짝 찾기', true)}
            ${row(3, '사다리 타기')}
            <div class="it more">${K.skel('46%')}</div>
          </div>
        </div>
      </div>`,
    })
      + K.tile({ x: 26.2, y: 3, s: 10.5 })
      + K.float({ x: 20, y: 29, icon: 'arrow_shuffle', s: 7 })
      + K.pill({ x: 4, bottom: 5, icon: 'people_swap', text: '공정한 자리 바꾸기 설계' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .win__bar .chip { font-size: 2.1cqw; }
      .cc { display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.8cqw 3.2cqw 0 3.2cqw; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.1cqw; }
      .me .bubble { max-width: 100%; font-size: 2.5cqw; font-weight: 650; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: var(--ink); white-space: nowrap; }
      .cond { display: flex; gap: 1cqw; }
      .cond .chip { font-size: 2.1cqw; }
      .res { display: flex; align-items: flex-start; gap: 1.6cqw; }
      .ls { flex: 1; display: flex; flex-direction: column; gap: 1.1cqw; }
      .it { display: flex; align-items: center; gap: 1.5cqw; height: 5cqw; padding: 0 1.6cqw 0 1.1cqw; border-radius: 1.5cqw; background: rgba(246, 246, 250, .9); }
      .it .n { flex: none; display: grid; place-items: center; width: 3.2cqw; height: 3.2cqw; border-radius: 50%; background: #fff; color: var(--ink-3); font-size: 2cqw; font-weight: 700; }
      .it b { flex: none; font-size: 2.45cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .it .skel { margin-left: auto; }
      .it.on { height: 5.8cqw; background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1.1cqw color-mix(in srgb, rgb(var(--tint)) 18%, transparent); }
      .it.on .n { background: var(--grad); color: #fff; }
      .it.on b { font-size: 2.8cqw; font-weight: 750; color: var(--ink); }
      .ok { margin-left: auto; display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: var(--green); color: #fff; }
      .it.more { padding-left: 5.8cqw; }
      .it.more .skel { margin-left: 0; }
    `,
  });
})();
