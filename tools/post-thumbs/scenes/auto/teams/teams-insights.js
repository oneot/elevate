/* Insights — 과제 report: class submission rate + average score, per-assignment submission bars with one row picked out */
(() => {
  scene('teams/teams-insights', (K) => {
    const row = (name, done, late, score, on) => `<div class="ar${on ? ' on' : ''}">
      <b class="an">${name}</b>
      <div class="sb"><i class="d" style="width:${done}%"></i><i class="l" style="width:${late}%"></i></div>
      <span class="sc">${score}</span>
    </div>`;
    return K.win({
      x: 4, y: 10.5, w: 64, h: 50, title: 'Insights', sub: ' · 과제', icon: false,
      body: `<div class="ia">
        <div class="row ft">${K.chip('전체 학생', { solid: true, icon: 'people' })}${K.chip('이번 학기', { line: true, icon: 'calendar_ltr:r' })}</div>
        <div class="kp">
          <div class="st"><p>제출률</p><span class="t-num">92%</span></div>
          <div class="st"><p>평균 성적</p><span class="t-num">86<em>점</em></span></div>
        </div>
        <div class="tb">
          ${row('환경 보고서', 88, 8, '84')}
          ${row('수행평가 1차', 70, 14, '91', true)}
          ${row('독서 기록장', 62, 22, '79')}
        </div>
      </div>`,
    })
      + K.tile({ x: 60.5, y: 6.2, s: 10.5 })
      + K.float({ right: 6, bottom: 7, icon: 'clipboard_task', s: 7 })
      + K.float({ right: 21, y: 6, icon: 'data_pie', far: true })
      + K.pill({ right: 4.5, y: 27, icon: 'data_bar_vertical', text: '과제 성취를 한눈에' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 0 },
    css: `
      .win__bar { padding-left: 3.4cqw; }
      .ia { padding: 2.6cqw 3.2cqw 0; }
      .ft { gap: 1.2cqw; }
      .ft .chip { font-size: 2.2cqw; }
      .kp { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6cqw; margin-top: 1.8cqw; }
      .st { display: flex; align-items: baseline; justify-content: space-between; padding: 1cqw 2.2cqw 1.2cqw; border-radius: 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
      .st p { font-size: 2.4cqw; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
      .st .t-num { font-size: 6cqw; color: rgb(var(--tint)); }
      .st em { font-style: normal; font-size: 2.6cqw; font-weight: 700; margin-left: .3cqw; color: var(--ink-3); }
      .tb { display: flex; flex-direction: column; gap: .5cqw; margin-top: 1.4cqw; }
      .ar { display: grid; grid-template-columns: 17cqw 1fr 5cqw; align-items: center; gap: 2cqw; padding: 1cqw 1.6cqw; border-radius: 1.4cqw; }
      .ar.on { background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1.2cqw 2.4cqw -1.4cqw rgba(var(--tint), .6); }
      .an { font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .sb { display: flex; height: 2.4cqw; border-radius: 99px; overflow: hidden; background: var(--fill); }
      .sb i { display: block; height: 100%; }
      .sb .d { background: var(--grad); }
      .sb .l { background: var(--amber); }
      .ar:not(.on) .sb .d { opacity: .55; }
      .sc { font-size: 2.8cqw; font-weight: 750; text-align: right; color: var(--ink-2); }
      .ar.on .sc { color: rgb(var(--tint)); }
    `,
  });
})();
