/* 파일 탭 — an Excel file from [파일] pinned as a channel tab via [탭 추가], picked and saved in the Excel tab dialog */
(() => {
  scene('teams/teams-filetap', (K) => {
    const xl = K.app('excel', { s: 2.9 });
    const cell = (cls = '', v = '') => `<span class="${cls}">${v}</span>`;
    const blank = (w) => `<span>${K.skel(w, { h: 1.3 })}</span>`;
    const rows = [
      [cell('h'), cell('th', '품목'), cell('th', '수량'), cell('th', '금액')],
      [cell('h'), cell('sel', '색종이'), cell('n', '30'), blank('70%')],
      [cell('h'), blank('60%'), blank('40%'), blank('80%')],
      [cell('h'), blank('75%'), blank('35%'), blank('60%')],
      [cell('h'), blank('50%'), blank('45%'), blank('70%')],
      [cell('h'), blank('65%'), blank('30%'), blank('55%')],
    ];
    return K.win({
      x: 4, y: 10.5, w: 64, h: 50, title: '3학년 2반', icon: false,
      body: `<div class="tb">
          <span>게시물</span><span>파일</span>
          <span class="on">${xl}학습 준비물 구입</span>
          <span class="add">${K.ico('add', { s: 2.8 })}</span>
        </div>
        <div class="sh"><div class="xl" style="--cols: 3.4cqw 1.4fr 1fr 1.2fr; --rh: 5cqw">${rows.flat().join('')}</div></div>`,
    })
      + K.card({
        x: 57, y: 23, w: 37.5, cls: 'dlg',
        body: `<div class="dh">${K.app('excel', { s: 4 })}<b>Excel</b></div>
          <div class="fi on"><span class="check on"></span>${K.app('excel', { s: 3 })}<span class="fn">학습 준비물 구입.xlsx</span></div>
          <div class="fi"><span class="check"></span>${K.app('excel', { s: 3 })}${K.skel('62%')}</div>
          <div class="ft">${K.btn('저장', { primary: true })}</div>`,
      })
      + K.tile({ x: 1, y: 4.2, s: 11 })
      + K.float({ x: 75, y: 13.6, s: 5.6, icon: 'pin' })
      + K.pill({ right: 4, y: 5, icon: 'tab_add', text: '자주 쓰는 파일은 탭으로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12cqw; font-size: 2.8cqw; }
      .tb { display: flex; align-items: center; gap: 2.8cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); white-space: nowrap; }
      .tb > span { position: relative; display: inline-flex; align-items: center; gap: .9cqw; padding: 1.7cqw 0 1.5cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .tb > span.on { color: var(--ink); font-weight: 750; font-size: 2.7cqw; }
      .tb > span.on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.2cqw; height: .55cqw; border-radius: 99px; background: var(--grad); }
      .tb > .add { width: 4.2cqw; height: 4.2cqw; padding: 0; justify-content: center; border-radius: 1.1cqw; color: rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .sh { padding: 2.6cqw 3cqw 0; }
      .sh .xl { border-radius: 1cqw 1cqw 0 0; overflow: hidden; font-size: 2.5cqw; box-shadow: inset 0 0 0 .15cqw rgba(20, 22, 30, .08); }
      .sh .xl > .th { font-size: 2.4cqw; }
      .sh .xl > .sel { font-weight: 700; color: var(--ink); }
      .sh .xl > .n { font-weight: 650; }
      .sh .xl .skel { margin: 0; }
      .dlg { z-index: 3; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.8cqw; }
      .dh { display: flex; align-items: center; gap: 1.4cqw; margin-bottom: .4cqw; }
      .dh b { font-size: 3cqw; font-weight: 750; }
      .fi { display: flex; align-items: center; gap: 1.2cqw; height: 5.4cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; box-shadow: inset 0 0 0 .18cqw var(--line); }
      .fi.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); }
      .fn { font-size: 2.4cqw; font-weight: 700; white-space: nowrap; letter-spacing: -0.02em; }
      .ft { display: flex; justify-content: flex-end; margin-top: .4cqw; }
      .ft .btn { font-size: 2.5cqw; padding: 1cqw 3cqw; }
    `,
  });
})();
