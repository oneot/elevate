/* Forms — 섹션 나누기 (v3). The 분기 옵션 screen: each choice of a 선택 항목 question is mapped to its own section, with the jump menu open. */
(() => {
  scene('forms/forms-option', (K) => {
    const row = (label, to, on) => `<div class="br${on ? ' on' : ''}"><span class="ch"><i class="radio${on ? ' on' : ''}"></i>${label}</span>${K.ico('arrow_right', { s: 2.6, c: 'var(--ink-4)' })}<span class="dd">${to}${K.ico('chevron_down', { s: 2.4 })}</span></div>`;
    const item = (label, on) => `<div class="mi${on ? ' on' : ''}">${on ? K.ico('checkmark', { s: 2.6 }) : '<i class="gap"></i>'}<span>${label}</span></div>`;
    return K.win({
      x: 4, y: 9.5, w: 64, h: 50, title: '현장체험학습 신청', icon: false,
      barRight: K.chip('분기 옵션', { tint: true, icon: 'branch_fork', cls: 'mode' }),
      body: `<div class="bo">
        <span class="sec">섹션 1</span>
        <p class="q">1. 체험학습에 참가하나요?</p>
        ${row('예', '섹션 2')}
        ${row('아니요', '섹션 3', true)}
        <div class="rest">${K.skel('62%')}${K.skel('40%')}</div>
      </div>`,
    })
      + K.card({
        x: 54, y: 22.5, w: 31, cls: 'menu',
        body: `${item('다음')}${item('섹션 2 참가 정보')}${item('섹션 3 불참 사유', true)}${item('양식의 끝')}`,
      })
      + K.tile({ x: 0.6, y: 3.6, s: 10.5 })
      + K.float({ right: 5, bottom: 4, icon: 'arrow_split', far: true })
      + K.pill({ right: 4, y: 4.4, icon: 'branch_fork', text: '응답마다 다른 섹션으로' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .win__bar > span:not(.sp):not(.chip) { font-size: 2.8cqw; font-weight: 700; }
      .win__bar .mode { padding: .7cqw 1.6cqw; font-size: 2.4cqw; font-weight: 750; }
      .win__bar .mode .ico { --s: 2.6cqw; }
      .bo { padding: 3cqw 3.4cqw 0 4cqw; }
      .sec { display: inline-flex; padding: .5cqw 1.4cqw; border-radius: 1cqw; background: var(--grad); color: #fff; font-size: 2.2cqw; font-weight: 750; }
      .q { margin: 1.8cqw 0 2.2cqw; font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .br { display: flex; align-items: center; gap: 1.6cqw; margin-bottom: 1.3cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.3cqw; background: rgba(245, 247, 248, .9); }
      .br.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .ch { display: flex; align-items: center; gap: 1.3cqw; width: 15cqw; font-size: 2.7cqw; font-weight: 650; white-space: nowrap; }
      .ch .radio { width: 2.8cqw; height: 2.8cqw; }
      .dd { display: inline-flex; align-items: center; justify-content: space-between; gap: 1cqw; width: 17cqw; padding: .8cqw 1.4cqw; border-radius: 1cqw; background: #fff; box-shadow: inset 0 0 0 .22cqw #dfe4e7; font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .br.on .dd { box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); color: rgb(var(--tint)); }
      .rest { display: grid; gap: 1.6cqw; margin-top: 2.6cqw; padding-left: .4cqw; }
      .menu { z-index: 3; padding: 1.3cqw; }
      .mi { display: flex; align-items: center; gap: 1.2cqw; padding: 1.15cqw 1.4cqw; border-radius: 1cqw; font-size: 2.5cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .mi .gap { width: 2.6cqw; flex: none; }
      .mi.on { background: var(--grad); color: #fff; font-weight: 750; }
    `,
  });
})();
