/* copilot/research — 리서치 도구가 OneDrive의 5개년 계획안을 연도별 표로 정리하고, 초안을 문서로 내보낸다. */
(() => {
  const mix = (p) => `color-mix(in srgb, rgb(var(--tint)) ${p}%, #fff)`;

  scene('copilot/research', (K) => {
    const rows = [
      [2019, '72%', '58%'],
      [2020, '60%', '74%'],
      [2021, '84%', '50%'],
      [2022, '66%', '68%'],
      [2023, '78%', '62%'],
      [2026, '88%', '70%', true],
    ];
    const fmt = (app, label, on) => `<div class="fm${on ? ' on' : ''}">${app}<b>${label}</b>${on ? `<span class="ck">${K.ico('checkmark', { s: 2 })}</span>` : ''}</div>`;
    return K.win({
      x: 4, y: 9.5, w: 62, h: 50, icon: false, title: '리서치 도구',
      body: `<div class="rs">
        <p class="hd">${K.ico('table_search', { s: 3, c: 'rgb(var(--tint))' })}1학년 현장체험학습 계획안</p>
        <div class="tb">
          <b>학년도</b><b>체험 장소</b><b>예산 총액</b><b class="src">출처</b>
          ${rows.map(([yr, a, b, on]) => `<span class="yr${on ? ' on' : ''}">${yr}</span><span class="${on ? 'on' : ''}">${K.skel(a, { tint: on })}</span><span class="${on ? 'on' : ''}">${K.skel(b, { tint: on })}</span><span class="src${on ? ' on' : ''}">${on ? `<span class="ai">${K.ico('sparkle', { s: 2.2 })}</span>` : K.app('word', { s: 2.8 })}</span>`).join('')}
        </div>
      </div>`,
    })
      + K.card({
        x: 62.5, y: 23, w: 29, cls: 'ex',
        body: `${fmt(K.app('word', { s: 3.4 }), 'Word', true)}
          ${fmt(K.app('powerpoint', { s: 3.4 }), 'PowerPoint')}
          ${fmt(`<span class="ig">${K.ico('data_pie', { s: 2.4 })}</span>`, '인포그래픽')}`,
      })
      + K.tile({ x: 1.4, y: 4, s: 10.5 })
      + K.float({ x: 70, bottom: 2.6, app: 'onedrive', s: 6.6, far: true })
      + K.pill({ right: 4, y: 7, icon: 'history', text: '5년치로 올해 초안까지' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.4cqw; font-size: 2.8cqw; font-weight: 700; }
      .rs { display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw 6.4cqw 0 3.4cqw; }
      .hd { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .tb { display: grid; grid-template-columns: 12cqw 1fr 1fr 7cqw; border-radius: 1.4cqw; overflow: hidden; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .18cqw rgba(20, 22, 30, .07); }
      .tb > * { display: flex; align-items: center; height: 4.4cqw; padding: 0 1.8cqw; border-top: .15cqw solid rgba(20, 22, 30, .06); white-space: nowrap; }
      .tb > b { height: 4.2cqw; border-top: 0; background: ${mix(9)}; font-size: 2.15cqw; font-weight: 700; color: var(--ink-2); }
      .tb > span > .skel { width: 100%; }
      .tb .src { justify-content: center; padding: 0; }
      .yr { font-size: 2.6cqw; font-weight: 700; color: var(--ink-2); font-variant-numeric: tabular-nums; }
      .tb > .on { background: ${mix(14)}; border-top-color: transparent; }
      .tb > .on > .skel { background: ${mix(42)}; }
      .yr.on { color: rgb(var(--tint)); box-shadow: inset .6cqw 0 0 rgb(var(--tint)); }
      .ai { display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: var(--grad); color: #fff; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(var(--tint), .8); }
      .ex { z-index: 3; display: flex; flex-direction: column; gap: 1.1cqw; padding: 1.6cqw; }
      .fm { display: flex; align-items: center; gap: 1.4cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.4cqw; }
      .fm b { flex: 1; font-size: 2.5cqw; font-weight: 650; white-space: nowrap; }
      .fm.on { background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1cqw ${mix(18)}; }
      .fm.on b { font-weight: 750; }
      .ig { display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: .9cqw; background: var(--grad); color: #fff; }
      .ck { display: grid; place-items: center; width: 3.2cqw; height: 3.2cqw; border-radius: 50%; background: var(--grad); color: #fff; }
    `,
  });
})();
