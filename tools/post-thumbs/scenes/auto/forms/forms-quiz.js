/* Forms — 퀴즈 만들기 (v3). The quiz editor: green check marks the correct option, 점수 sets the points, 총점 beside the title. */
(() => {
  scene('forms/forms-quiz', (K) => {
    const opt = (v, ok) => `<div class="op${ok ? ' ok' : ''}">${ok ? K.ico('checkmark_circle', { s: 3.4, c: 'var(--green)' }) : '<i class="radio"></i>'}<span>${v}</span>${ok ? '<em>정답</em>' : ''}</div>`;
    return K.win({
      x: 31, y: 9.5, w: 65, h: 50, title: '일차방정식 퀴즈', icon: false,
      barRight: K.chip('총점 20점', { tint: true, cls: 'tot' }),
      body: `<div class="qz">
        <p class="q">1. x + 7 = 12일 때, x의 값은?</p>
        <div class="ops">${opt('3')}${opt('5', true)}${opt('7')}</div>
        <div class="ft"><span class="mf">${K.ico('math_formula', { s: 2.8 })}수식</span><span class="pts">점수 <b>5</b></span></div>
      </div>`,
    })
      + K.tile({ x: 25.5, y: 4, s: 11 })
      + K.float({ x: 14, y: 8.5, icon: 'checkmark_starburst', far: true })
      + K.float({ x: 16, y: 25, text: '5점', s: 7.4 })
      + K.pill({ x: 4, bottom: 2.6, dark: true, icon: 'checkmark_circle', text: '정답 체크로 자동 채점' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; }
      .win__bar > span:not(.sp):not(.chip) { font-size: 2.8cqw; font-weight: 700; }
      .win__bar .tot { padding: .7cqw 1.6cqw; font-size: 2.4cqw; font-weight: 750; }
      .qz { padding: 3cqw 3.4cqw 0 4cqw; }
      .q { margin: 0 0 2.2cqw; font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .ops { display: grid; gap: 1.2cqw; }
      .op { display: flex; align-items: center; gap: 1.6cqw; padding: 1.2cqw 1.8cqw; border-radius: 1.3cqw; background: rgba(245, 247, 248, .9); font-size: 2.7cqw; font-weight: 650; }
      .op .radio { width: 3cqw; height: 3cqw; }
      .op span { flex: 1; }
      .op.ok { background: #eaf7f0; box-shadow: inset 0 0 0 .3cqw #6fcf9c; }
      .op em { font-size: 2.3cqw; font-style: normal; font-weight: 750; color: #1c8a55; }
      .ft { display: flex; align-items: center; justify-content: space-between; margin-top: 2.2cqw; }
      .mf { display: inline-flex; align-items: center; gap: .8cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); }
      .pts { display: inline-flex; align-items: center; gap: 1.3cqw; font-size: 2.6cqw; font-weight: 700; color: var(--ink-2); }
      .pts b { display: grid; place-items: center; width: 7cqw; height: 5cqw; border-radius: 1.1cqw; background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 .9cqw color-mix(in srgb, rgb(var(--tint)) 14%, transparent); font-size: 3cqw; color: var(--ink); }
    `,
  });
})();
