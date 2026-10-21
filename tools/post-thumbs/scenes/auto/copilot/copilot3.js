/* copilot/copilot3 · 웹 버전 활용 꿀팁 — web search data becomes a histogram, with Python code and follow-up questions. */
(() => {
  scene('copilot/copilot3', (K) => {
    const hist = [22, 46, 74, 100, 84, 58, 34, 16];
    const code = 'import matplotlib\nplt.hist(rates, bins=8)';
    return K.win({
      x: 35, y: 8, w: 61, h: 50, title: 'Copilot', icon: false,
      barRight: `<span class="sv">${K.ico('shield_checkmark', { s: 2.6 })}</span>`,
      body: `<div class="ch">
        ${K.bubble('히스토그램으로 바꿔 줘', { me: true })}
        <div class="res">
          <div class="rh"><span class="ti">${K.ico('data_histogram')}</span><b>물가 상승률 분포</b>
            <div class="seg"><span class="on">차트</span><span>코드</span></div></div>
          ${K.bars(hist, { h: 10.5, gap: 0.8, on: [3] })}
          <div class="ax"></div>
        </div>
        <div class="fq">${['기간을 늘려 줘', '이자율도 비교해 줘'].map((t) => `<span>${K.ico('arrow_reply:r', { s: 2.3 })}${t}</span>`).join('')}</div>
      </div>`,
    })
      + K.card({ x: 4, y: 20.5, w: 35.5, cls: 'cd', body: `<div class="ch2">${K.ico('code', { s: 2.6 })}Python 코드</div><div class="code cb">${code}</div>` })
      + K.tile({ x: 29.5, y: 2.6, s: 10.5 })
      + K.float({ x: 9, y: 6, s: 7, icon: 'globe_search' })
      + K.pill({ x: 4, bottom: 4.5, icon: 'data_histogram', text: '웹 데이터로 바로 차트' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .sv { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.3cqw; background: color-mix(in srgb, var(--green) 14%, #fff); color: var(--green); }
      .ch { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.2cqw 3cqw 0 5.4cqw; }
      .ch .bubble { font-size: 2.5cqw; font-weight: 650; }
      .res { display: flex; flex-direction: column; padding: 2.2cqw 2.6cqw 2.4cqw; border-radius: 2cqw; background: rgba(255, 255, 255, .9); box-shadow: 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 22%, #fff), 0 1.2cqw 2.6cqw -1.4cqw rgba(var(--tint), .45); }
      .rh { display: flex; align-items: center; gap: 1.3cqw; margin-bottom: 2cqw; }
      .rh > b { flex: 1; font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .ti { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 13%, #fff); color: rgb(var(--tint)); }
      .ti .ico { --s: 2.8cqw; }
      .seg { display: flex; gap: .3cqw; padding: .45cqw; border-radius: 1.4cqw; background: #f1f2f6; }
      .seg span { padding: .8cqw 2cqw; border-radius: 1.1cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-4); white-space: nowrap; }
      .seg .on { background: var(--grad); color: #fff; }
      .bars { padding: 0 1cqw; }
      .ax { height: .25cqw; margin: 0 .4cqw; border-radius: 1cqw; background: var(--line-2, #e3e5ea); }
      .fq { display: flex; gap: 1.2cqw; }
      .fq span { display: inline-flex; align-items: center; gap: .8cqw; padding: 1cqw 1.7cqw; border-radius: 99px; background: #fff; box-shadow: inset 0 0 0 .2cqw ${'color-mix(in srgb, rgb(var(--tint)) 35%, #fff)'}; color: rgb(var(--tint)); font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
      .cd { z-index: 3; display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.2cqw 2.4cqw 2.4cqw; background: rgba(30, 33, 50, .92); }
      .ch2 { display: flex; align-items: center; gap: 1cqw; font-size: 2.4cqw; font-weight: 700; color: #fff; }
      .ch2 .ico { color: #b9c4ff; }
      .cb { font-size: 2cqw; line-height: 1.65; color: #e6edf3; }
    `,
  });
})();
