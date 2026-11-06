/* copilot-studio/hwpx-homeroom-admin-agent — two photos in, three HWPX forms out, then ask before updating the ledger */
(() => {
  scene('copilot-studio/hwpx-homeroom-admin-agent', (K) => {
    const doc = (name) => `<div class="fd"><div class="ft"><span class="fi">${K.ico('document_text', { s: 3.2 })}</span><em>HWPX</em></div><b>${name}</b></div>`;
    return K.win({
      x: 4, y: 8.5, w: 60, h: 52, title: '우리반 행정 에이전트', icon: false,
      body: `<div class="ch">
        <div class="me">
          <span class="ph">${K.ico('image', { s: 3 })}</span><span class="ph">${K.ico('image_multiple', { s: 3 })}</span>
          ${K.bubble('결석 서류 3종 만들어 줘', { me: true })}
        </div>
        <div class="docs">${doc('신고서')}${doc('담임 의견서')}${doc('학부모 의견서')}</div>
        <div class="ask hl">${K.ico('person_question_mark', { s: 3 })}<b>출결관리대장에 반영할까요?</b></div>
      </div>`,
    })
      + K.card({
        right: 3, y: 21.5, w: 33.5, cls: 'led',
        body: `<p class="lh">${K.app('excel', { s: 3 })}<b>출결관리대장</b></p>
          <div class="rw">
            <span class="nm">최서준</span><span>10. 22.</span><span class="kd">결석·질병</span>
          </div>
          ${K.chip('12행에 한 줄 추가', { icon: 'table_add', tint: true })}`,
      })
      + K.tile({ x: 1, y: 3, s: 10.5 })
      + K.float({ right: 1.2, y: 17.5, s: 5.6, icon: 'checkmark' })
      + K.float({ right: 6, y: 6, app: 'onedrive', far: true })
      + K.pill({ right: 4, bottom: 4.4, icon: 'document_checkmark', text: '사진 2장이 서류 3종으로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .ch { display: flex; flex-direction: column; gap: 2.6cqw; padding: 3cqw 3.2cqw; }
      .me { display: flex; align-items: center; justify-content: flex-end; gap: 1cqw; }
      .ph { display: grid; place-items: center; width: 5.4cqw; height: 5.4cqw; border-radius: 1.2cqw; background: rgba(255, 255, 255, .7); color: var(--ink-3); }
      .me .bubble { margin-left: .6cqw; font-size: 2.6cqw; white-space: nowrap; }
      .docs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4cqw; width: 52cqw; }
      .ask { width: 44cqw; }
      .fd { display: flex; flex-direction: column; align-items: flex-start; gap: 1.2cqw; padding: 1.6cqw 1.6cqw 1.8cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .85); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .fi { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .fd b { font-size: 2.45cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .ft { display: flex; align-items: center; justify-content: space-between; align-self: stretch; }
      .ft em { font-style: normal; font-size: 1.9cqw; font-weight: 750; letter-spacing: .02em; color: rgb(var(--tint)); }
      .ask { display: flex; align-items: center; gap: 1.2cqw; padding: 1.8cqw 2.2cqw; border-radius: 1.6cqw; color: rgb(var(--tint)); }
      .ask b { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; }
      .led { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 2.6cqw 2.8cqw; }
      .lh { display: flex; align-items: center; gap: 1cqw; }
      .lh b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.03em; }
      .rw { display: flex; align-items: center; gap: 1.4cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.2cqw; font-size: 2.3cqw; font-weight: 650; white-space: nowrap;
        background: color-mix(in srgb, var(--red) 14%, #fff); box-shadow: inset .5cqw 0 0 var(--red); color: var(--ink-2); }
      .rw .nm { font-weight: 750; color: var(--ink); }
      .led .chip { align-self: flex-start; font-size: 2.1cqw; }
      .rw .kd { color: #c4302b; }
      &.dark {
        .ph { background: rgba(255, 255, 255, .1); color: var(--ink-3); }
        .fd { background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
        .fi { background: rgba(var(--tint), .18); }
        .ask { background: rgba(var(--tint), .12); }
        .rw { background: rgba(255, 107, 102, .16); }
        .rw .kd { color: #ffa29c; }
      }
    `,
  });
})();
