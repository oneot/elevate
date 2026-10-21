/* copilot/copilot4 · Edge와 함께 쓰기 — drag a line in a PDF paper opened in Edge, then pick [설명하기]. */
(() => {
  scene('copilot/copilot4', (K) => {
    const opt = (icon, t, on) => `<div class="op${on ? ' on' : ''}"><span class="oi">${K.ico(icon, { s: 2.6 })}</span>${t}</div>`;
    return K.win({
      x: 4, y: 9, w: 64, h: 50, bar: false,
      body: `<div class="tabs"><span class="tab">${K.ico('document_pdf', { s: 2.4, c: 'var(--red)' })}학습몰입_논문.pdf</span></div>
        <div class="pdf"><div class="pg">
          ${K.skel('30%', { h: 1.4 })}
          <p class="h">AI 튜터와 학습 몰입</p>
          ${K.skel('94%')}${K.skel('82%')}
          <p class="mk"><span class="ask">${K.app('copilot', { s: 2.8 })}Copilot에게 물어보기</span><mark>자기조절 학습이 몰입을 높인다</mark></p>
          ${K.skel('90%')}${K.skel('66%')}${K.skel('84%')}
        </div></div>`,
    })
      + K.card({
        x: 56, y: 16, w: 28, cls: 'menu', body: `
          ${opt('lightbulb', '설명하기', true)}
          ${opt('edit', '수정하기')}
          ${opt('text_bullet_list', '요약하기')}
          ${opt('text_expand', '늘리기')}`,
      })
      + K.cursor({ x: 75, y: 22.6 })
      + K.tile({ x: 1.2, y: 2.4, s: 10 })
      + K.float({ right: 5, bottom: 5, icon: 'sparkle' })
      + K.pill({ right: 4, y: 4, icon: 'book_open', text: '논문도 튜터처럼 설명' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__body { display: flex; flex-direction: column; }
      .tabs { flex: none; display: flex; align-items: flex-end; height: 6cqw; padding-left: 11cqw; background: #eceef3; }
      .tab { display: flex; align-items: center; gap: 1cqw; height: 4.6cqw; padding: 0 2cqw; border-radius: 1.2cqw 1.2cqw 0 0; background: #fff; font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
      .pdf { flex: 1; min-height: 0; padding: 3cqw 12cqw 0 5cqw; background: #eef0f4; }
      .pg { display: flex; flex-direction: column; gap: 1.6cqw; height: 100%; padding: 3.2cqw 3.4cqw; background: #fff; box-shadow: 0 .6cqw 1.6cqw -.8cqw rgba(15, 23, 42, .25); }
      .h { margin-bottom: .6cqw; font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .mk { position: relative; margin: 5.4cqw 0 .4cqw; font-size: 2.7cqw; font-weight: 650; white-space: nowrap; }
      .mk mark { padding: .3cqw .5cqw; border-radius: .4cqw; background: color-mix(in srgb, rgb(var(--tint)) 24%, #fff); color: var(--ink); }
      .ask { position: absolute; left: -.6cqw; bottom: calc(100% + 1cqw); display: flex; align-items: center; gap: .9cqw; padding: .9cqw 1.6cqw .9cqw 1.1cqw; border-radius: 1.2cqw; background: #fff; font-size: 2.3cqw; font-weight: 700; box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .06), 0 1cqw 2cqw -.8cqw rgba(15, 23, 42, .4); }
      .menu { z-index: 3; display: flex; flex-direction: column; gap: .8cqw; padding: 1.6cqw; }
      .op { display: flex; align-items: center; gap: 1.4cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.4cqw; font-size: 2.7cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .oi { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: #f2f3f6; color: var(--ink-3); }
      .op.on { background: var(--grad); color: #fff; font-weight: 750; box-shadow: 0 1cqw 2.2cqw -1cqw rgba(var(--tint), .9); }
      .op.on .oi { background: rgba(255, 255, 255, .25); color: #fff; }
    `,
  });
})();
