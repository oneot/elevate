/* copilot-studio/copilotstudio — Preview answer: chosen color theme + deliverables table, every file attached */
(() => {
  scene('copilot-studio/copilotstudio', (K) => {
    const row = (icon, name) => `<div class="fr">${icon}<b>${name}</b><span class="sp"></span>
      <span class="ok">${K.ico('checkmark_circle', { s: 2.4 })}첨부됨</span></div>`;
    const sw = (a, b, on) => `<i class="sw${on ? ' on' : ''}" style="--a:${a};--b:${b}"></i>`;
    return K.win({
      x: 33, y: 9.5, w: 64, h: 50, title: 'AI Creative Agent Team', sub: ' · 미리보기', icon: false,
      body: `<div class="ch">
        ${K.bubble('AI 크리에이터 캠프 자료 만들어 줘', { me: true })}
        <div class="th">${sw('#3aa8ff', '#bfe6ff')}<b>스카이 테마</b><span>맑고 신뢰감 있게</span></div>
        <div class="tb">
          ${row(K.app('powerpoint', { s: 3.2 }), 'presentation.pptx')}
          ${row(K.ico('globe', { s: 3, c: 'var(--sky)' }), 'poster.html')}
          ${row(K.app('excel', { s: 3.2 }), 'budget_analysis.xlsx')}
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 20, w: 26.5, cls: 'pk',
        body: `<p class="pl">${K.ico('color', { s: 2.6 })}컬러 테마</p>
          <div class="sws">${sw('#3aa8ff', '#bfe6ff', true)}${sw('#6fd3ff', '#ff4fb8')}${sw('#1d2b5a', '#5a78c8')}${sw('#25b26b', '#bdf0c9')}${sw('#ff7a6b', '#ffc9ae')}</div>`,
      })
      + K.tile({ x: 28.5, y: 3.8, s: 10.5 })
      + K.float({ x: 15, y: 6.5, s: 6, icon: 'arrow_download', far: true })
      + K.pill({ x: 4, bottom: 4.5, icon: 'sparkle', text: '같은 테마로 파일 5개' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      --sky: #2f8fe6;
      .win__bar { padding-left: 9cqw; font-size: 2.7cqw; font-weight: 700; }
      .ch { display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw 3cqw; }
      .ch .bubble { align-self: flex-end; font-size: 2.5cqw; white-space: nowrap; }
      .th { display: flex; align-items: center; gap: 1.3cqw; white-space: nowrap; }
      .th b { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; }
      .th span { font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
      .sw { flex: none; display: block; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: linear-gradient(135deg, var(--a) 50%, var(--b) 50%); box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .5); }
      .tb { display: flex; flex-direction: column; gap: .9cqw; padding: 1.2cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .5); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .fr { display: flex; align-items: center; gap: 1.4cqw; height: 5cqw; padding: 0 1.4cqw; border-radius: 1.2cqw; }
      .fr + .fr { box-shadow: 0 -.5cqw 0 -.35cqw var(--line-2); }
      .fr b { font-family: var(--mono); font-size: 2.5cqw; font-weight: 700; white-space: nowrap; letter-spacing: -0.02em; }
      .sp { flex: 1; }
      .ok { display: inline-flex; align-items: center; gap: .6cqw; padding: .6cqw 1.3cqw; border-radius: 99px; background: rgba(36, 170, 104, .14); color: #16884f; font-size: 2.3cqw; font-weight: 700; white-space: nowrap; }
      .pk { z-index: 3; padding: 2.4cqw 2.4cqw 2.6cqw; }
      .pl { display: flex; align-items: center; gap: .8cqw; font-size: 2.5cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .pl .ico { color: rgb(var(--tint)); }
      .sws { display: flex; gap: .9cqw; margin-top: 1.8cqw; padding-left: .4cqw; }
      .sws .sw.on { box-shadow: 0 0 0 .35cqw rgba(14, 40, 54, .6), 0 0 0 .7cqw rgb(var(--tint)); }
      &.dark {
        --sky: #7cc4ff;
        .th span { color: var(--ink-3); }
        .tb { background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
        .fr + .fr { box-shadow: 0 -.5cqw 0 -.35cqw rgba(255, 255, 255, .14); }
        .ok { background: rgba(63, 214, 143, .2); color: #7ef0b6; }
      }
    `,
  });
})();
