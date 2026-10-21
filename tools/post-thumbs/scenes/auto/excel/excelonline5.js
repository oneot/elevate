/* Excel — 학교 공유 문서 만들기: 동아리 활동 시트에 담임들이 학생을 배정하면 인원이 자동 집계 */
(() => {
  scene('excel/excelonline5', (K) => {
    const clubs = ['코딩반', '밴드부', '독서토론'];
    const counts = ['4명', '4명', '2명'];
    // f = filled (student entered, cell colour changes), '' = empty, '*' = live typing
    const grid = [
      ['f', 'f', 'f'],
      ['f', 'f', 'f'],
      ['f', 'f', ''],
      ['f', '*', ''],
      ['', '', ''],
    ];
    const cell = (v, i) => {
      if (v === '*') return '<div class="live">2반 박<i class="caret"></i><span class="flag">2반 담임</span></div>';
      if (v === 'f') return `<div class="in">${K.skel(`${[62, 48, 56, 44][i % 4]}%`, { tint: true })}</div>`;
      return '<div class="em"></div>';
    };
    const team = [['김', '#4a7fd6'], ['이', 'var(--pink)'], ['박', '#e0912f']].map(([t, c]) => K.avatar(t, { s: 4, c })).join('');
    return K.win({
      x: 30, y: 9.5, w: 66, h: 49, title: '3학년 동아리 편성', icon: false,
      barRight: `<span class="team">${team}</span>${K.btn('공유', { primary: true, icon: 'share' })}`,
      body: `<div class="xl" style="--cols: 10.5cqw repeat(3, 1fr); --rh: 5.6cqw">
          <div class="th lab">동아리</div>${clubs.map((n) => `<div class="th cl">${n}</div>`).join('')}
          <div class="lab cnt">${K.ico('people', { s: 2.6 })}인원</div>${counts.map((n, i) => `<div class="num${i === 1 ? ' hot' : ''}">${n}</div>`).join('')}
          ${grid.map((r, ri) => `<div class="lab"></div>${r.map((v, ci) => cell(v, ri + ci)).join('')}`).join('')}
        </div>`,
    })
      + K.tile({ x: 24.6, y: 4.2, s: 11 })
      + K.float({ x: 12, y: 13.5, s: 7, app: 'teams', square: true })
      + K.pill({ x: 4, bottom: 5, icon: 'people_team', text: '동아리 인원 자동 집계', tint: true });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .team { display: flex; padding-left: .9cqw; margin-right: .4cqw; }
      .team .avatar { margin-left: -.9cqw; box-shadow: 0 0 0 .3cqw #fff; font-size: 1.9cqw; }
      .xl > * { font-size: 2.5cqw; }
      .xl > .lab { justify-content: center; gap: .7cqw; background: rgba(20, 22, 30, .035); color: var(--ink-3); font-weight: 650; }
      .xl > .th.lab { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); }
      .xl > .th.cl { justify-content: center; font-size: 2.7cqw; }
      .xl > .cnt { color: rgb(var(--tint)); font-weight: 700; }
      .xl > .num { justify-content: center; font-size: 2.9cqw; font-weight: 750; color: var(--ink); border-bottom: .3cqw solid rgb(var(--tint)); }
      .xl > .num.hot { position: relative; z-index: 2; background: var(--grad); color: #fff; border-radius: .8cqw; box-shadow: 0 1cqw 2cqw -1cqw rgba(var(--tint), .8); }
      .xl > .in { padding: 0 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 13%, #fff); }
      .xl > .in .skel { height: 1.3cqw; }
      .xl > .live { position: relative; z-index: 3; overflow: visible; justify-content: flex-start; padding: 0 1.6cqw; box-shadow: inset 0 0 0 .38cqw var(--pink); color: var(--ink); font-weight: 700; font-size: 2.7cqw; }
      .caret { width: .22cqw; height: 2.8cqw; margin-left: .4cqw; background: var(--ink); }
      .flag { position: absolute; left: -.2cqw; bottom: 100%; padding: .4cqw 1.1cqw; border-radius: .7cqw .7cqw .7cqw 0; background: var(--pink); color: #fff; font-size: 2cqw; font-weight: 700; white-space: nowrap; }
    `,
  });
})();
