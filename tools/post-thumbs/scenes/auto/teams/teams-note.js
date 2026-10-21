/* 수업용 전자필기장 만들기 — ClassNotebook wizard: student section setup */
(() => {
  scene('teams/teams-note', (K) => {
    const row = (name, c, cls = '', tail = '') => `<div class="sr ${cls}"><i class="bar" style="background:${c}"></i><span class="nm">${name}</span><span class="grow"></span>${tail}</div>`;
    const del = K.ico('delete:r', { s: 2.6, c: 'var(--ink-4)' });
    return K.win({
      x: 31, y: 9, w: 65, h: 52, title: '수업용 전자필기장', sub: ' · 3학년 2반', icon: false,
      barRight: K.btn('만들기', { primary: true }),
      body: `<div class="wz">
        <div class="row hd"><b class="t-h2">학생 섹션</b><span class="grow"></span>${K.chip('28명에게 복사', { tint: true, icon: 'people_team' })}</div>
        <div class="ls">
          ${row('유인물', '#7719aa', '', del)}
          ${row('수업 노트', '#2f7de1', '', del)}
          ${row('과제', '#e0569a', '', del)}
          ${row('수행평가', 'rgb(var(--tint))', 'on', `<span class="ed">${K.ico('edit', { s: 2.4 })}</span>`)}
          <div class="add">${K.ico('add', { s: 2.6 })}섹션 추가</div>
        </div>
      </div>`,
    })
      + K.tile({ x: 25.6, y: 3.6, s: 10.5 })
      + K.float({ x: 13, y: 9, app: 'onenote', s: 7 })
      + K.float({ x: 21, bottom: 5, icon: 'checkmark', far: true, s: 5.6 })
      + K.pill({ x: 3, y: 27, icon: 'notebook', text: '학생 노트 자동 생성' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8.6cqw; }
      .win__bar .btn { padding: 1cqw 2.4cqw; font-size: 2.4cqw; }
      .wz { padding: 3cqw 3.2cqw; }
      .hd { margin-bottom: 2.2cqw; }
      .hd .chip { font-size: 2.2cqw; }
      .ls { display: flex; flex-direction: column; gap: 1.1cqw; }
      .sr { display: flex; align-items: center; gap: 1.6cqw; height: 5.4cqw; padding: 0 1.8cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .2cqw var(--line); }
      .sr .bar { width: .8cqw; height: 2.8cqw; border-radius: 99px; }
      .nm { font-size: 2.7cqw; font-weight: 650; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      .sr.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .32cqw rgb(var(--tint)), 0 1cqw 2.4cqw -1.4cqw rgba(var(--tint), .6); }
      .sr.on .nm { color: var(--ink); font-weight: 750; }
      .ed { display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 1cqw; background: var(--grad); color: #fff; }
      .add { display: flex; align-items: center; gap: 1.2cqw; height: 5.2cqw; padding: 0 1.8cqw; border-radius: 1.4cqw; border: .25cqw dashed color-mix(in srgb, rgb(var(--tint)) 45%, #fff); color: rgb(var(--tint)); font-size: 2.5cqw; font-weight: 700; white-space: nowrap; }
    `,
  });
})();
