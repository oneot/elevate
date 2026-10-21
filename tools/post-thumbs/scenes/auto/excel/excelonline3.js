/* 채우기·정렬·필터 활용하기 (v3): 학부모 상담 신청 표에서 '반' 필터로 3반만 보기 */
(() => {
  scene('excel/excelonline3', (K) => {
    const fb = (on) => `<span class="fb${on ? ' on' : ''}">${K.ico(on ? 'filter' : 'caret_down', { s: on ? 2.1 : 1.9 })}</span>`;
    let cells = `<div class="h top"></div><div class="th">이름${fb()}</div><div class="th">희망일${fb()}</div><div class="th fc">반${fb(true)}</div>`;
    [4, 7, 9].forEach((n, i) => {
      cells += `<div class="h f">${n}</div><div>${K.skel(['58%', '46%', '52%'][i])}</div><div>${K.skel(['66%', '52%', '60%'][i])}</div><div class="cls">3반</div>`;
    });
    cells += '<div class="h"></div><div></div><div></div><div></div>';
    const opt = (icon, text) => `<div class="mi">${K.ico(`${icon}:r`, { s: 2.8 })}<span>${text}</span></div>`;
    const chk = (text, on) => `<div class="ck${on ? ' on' : ''}"><i class="check${on ? ' on' : ''}"></i><span>${text}</span></div>`;
    return K.win({
      x: 4, y: 10.5, w: 64, h: 50, title: '학부모 상담 신청', icon: false,
      barRight: `<span class="ft">${K.ico('table', { s: 2.6 })}</span>`,
      body: `<div class="xl" style="--cols: 4.4cqw 1fr 1fr 14cqw; --rh: 7.2cqw">${cells}</div>`,
    })
      + K.card({
        x: 62.4, y: 24.6, w: 28, cls: 'pop',
        body: `${opt('text_sort_ascending', '작은 항목 순')}${opt('text_sort_descending', '큰 항목 순')}<i class="sep"></i>
          ${chk('1반')}${chk('2반')}${chk('3반', true)}`,
      })
      + K.tile({ x: 0.8, y: 4.2, s: 10.5 })
      + K.float({ right: 6, y: 14, s: 6, icon: 'flash' })
      + K.pill({ right: 3.5, y: 3.6, icon: 'filter', text: '필터로 원하는 반만', dark: true });
  }, {
    deco: { big: 'sphere', small: 'fold', v: 0 },
    css: `
      .win__bar { padding-left: 11.5cqw; font-size: 2.9cqw; font-weight: 700; }
      .ft { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .xl > .h.top { height: 7.2cqw; }
      .xl > .h { font-size: 2cqw; }
      .xl > .h.f { color: #2f6fd6; font-weight: 750; }
      .xl > .th { justify-content: space-between; padding: 0 1.4cqw 0 1.8cqw; background: var(--grad); color: #fff; font-size: 2.6cqw; }
      .xl > .th.fc { position: relative; z-index: 2; overflow: visible; box-shadow: inset 0 0 0 .35cqw rgba(255, 255, 255, .7); }
      .fb { display: grid; place-items: center; width: 3.2cqw; height: 3.2cqw; border-radius: .7cqw; background: rgba(255, 255, 255, .9); color: var(--ink-3); }
      .fb.on { background: #fff; color: rgb(var(--tint)); box-shadow: 0 0 0 .35cqw rgba(255, 255, 255, .5); }
      .xl > .cls { padding: 0 1.8cqw; font-size: 2.8cqw; font-weight: 750; color: rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); }
      .xl > div > .skel { height: 1.3cqw; }
      .pop { z-index: 3; display: flex; flex-direction: column; gap: .4cqw; padding: 1.6cqw 1.5cqw; }
      .mi, .ck { display: flex; align-items: center; gap: 1.4cqw; height: 4.6cqw; padding: 0 1.3cqw; border-radius: 1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .mi .ico { color: var(--ink-3); }
      .sep { height: .2cqw; margin: .6cqw 1cqw; background: var(--line); }
      .ck.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); font-weight: 750; font-size: 2.8cqw; }
    `,
  });
})();
