/* copilot/teach — Teach rubric step: the five criteria from the post are entered, then the rubric doc comes out. */
(() => {
  scene('copilot/teach', (K) => {
    const crit = ['내용 이해도', '자료 출처 및 사례 활용', '해결 방안의 타당성', '협력 및 참여도', '발표 및 정리 능력'];
    const last = crit.length - 1;
    const row = (t, i) => (i === last
      ? `<div class="cr on hl"><span class="no">${K.ico('edit', { s: 1.9 })}</span><span class="tx">${t}<i class="caret"></i></span></div>`
      : `<div class="cr"><span class="no">${K.ico('checkmark', { s: 1.9 })}</span><span class="tx">${t}</span>${K.ico('re_order_dots_vertical:r', { s: 2.4, c: 'var(--ink-4)' })}</div>`);
    const cells = (a) => a.map((w) => `<span>${K.skel(w)}</span>`).join('');
    return K.win({
      x: 5, y: 7.5, w: 60, h: 52, icon: false, title: 'Teach', sub: '· 루브릭',
      barRight: K.btn('루브릭 만들기', { primary: true, icon: 'sparkle' }),
      body: `<div class="fm">
        <p class="q">평가 기준을 입력해 주세요</p>
        <div class="list">${crit.map(row).join('')}</div>
      </div>`,
    })
      + K.card({
        x: 61, y: 21, w: 34, cls: 'res', body: `
          <div class="rh">${K.app('word', { s: 3.4 })}<b>탐구 프로젝트.docx</b></div>
          <div class="mt">
            <b></b><b>우수</b><b>보통</b><b>미흡</b>
            <span>${K.skel('90%', { tint: true })}</span>${cells(['80%', '70%', '56%'])}
            <span>${K.skel('70%', { tint: true })}</span>${cells(['74%', '62%', '50%'])}
            <span>${K.skel('82%', { tint: true })}</span>${cells(['84%', '66%', '44%'])}
          </div>`,
      })
      + K.tile({ x: 1.6, y: 2.6, s: 10.5 })
      + K.float({ x: 88.5, y: 15.5, icon: 'checkmark', s: 6 })
      + K.pill({ right: 4, y: 4.4, icon: 'table_sparkle', text: '평가 기준표 자동 완성' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.4cqw; }
      .fm { display: flex; flex-direction: column; gap: 2.2cqw; height: 100%; padding: 3cqw 3.2cqw 0; }
      .q { font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.03em; }
      .list { display: flex; flex-direction: column; gap: 1.3cqw; }
      .cr { display: flex; align-items: center; gap: 1.6cqw; height: 5.3cqw; padding: 0 1.8cqw 0 1.2cqw; border-radius: 1.3cqw; background: rgba(255, 255, 255, .9); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .cr .no { flex: none; display: grid; place-items: center; width: 3.2cqw; height: 3.2cqw; border-radius: 50%; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); font-size: 2cqw; font-weight: 750; }
      .cr .tx { flex: 1; font-size: 2.6cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .cr.on { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); }
      .cr.on .no { background: var(--grad); color: #fff; }
      .caret { display: inline-block; width: .3cqw; height: 3cqw; margin-left: .5cqw; vertical-align: -.5cqw; border-radius: 1px; background: rgb(var(--tint)); }
      .win__bar { padding-right: 1.8cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .res { z-index: 3; display: flex; flex-direction: column; gap: 2cqw; padding: 2.6cqw; }
      .rh { display: flex; align-items: center; gap: 1.2cqw; }
      .rh b { font-size: 2.6cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .mt { display: grid; grid-template-columns: 7.4cqw repeat(3, 1fr); gap: .2cqw; border-radius: 1cqw; overflow: hidden; background: var(--line-2); box-shadow: 0 0 0 .2cqw var(--line-2); }
      .mt > * { display: flex; align-items: center; height: 4cqw; padding: 0 1cqw; background: #fff; }
      .mt > b { justify-content: center; height: 3.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); font-size: 2cqw; font-weight: 700; white-space: nowrap; }
      .mt .skel { width: 100%; }
    `,
  });
})();
