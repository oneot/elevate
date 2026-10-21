/* OneNote — 캘린더와 함께 쓰기 (v3): a Large monthly calendar inside the 교무수첩 page,
   with a 공문 paragraph link pasted into a date cell next to a checkbox. */
(() => {
  scene('onenote/onenote-with-calendar', (K) => {
    const cell = (d, inner = '', cls = '') => `<div class="cl ${cls}"><b>${d}</b>${inner}</div>`;
    const sk = (w) => K.skel(w, { h: 1.1 });
    const row1 = [
      cell(12, sk('70%')),
      cell(13),
      cell(14, `<div class="ev"><i class="check on"></i><span>상담</span></div>`),
      cell(15, sk('60%')),
      cell(16),
    ].join('');
    const row2 = [
      cell(19, sk('64%')),
      cell(20),
      `<div class="cl hot"><b>21</b><div class="lk"><i class="check"></i><span>체험학습 공문</span></div></div>`,
      cell(22, sk('56%')),
      cell(23, sk('72%')),
    ].join('');
    return K.win({
      x: 32, y: 10, w: 65, h: 52, title: '교무수첩 · 10월 캘린더', icon: false,
      body: `<div class="pg"><div class="cal">${row1}${row2}</div></div>`,
    })
      + K.card({
        x: 4, y: 21, w: 31, cls: 'menu',
        body: `<div class="mi">${K.ico('copy:r', { s: 2.6 })}${K.skel('52%', { h: 1.2 })}</div>
          <div class="mi on">${K.ico('link', { s: 2.8 })}<span>단락 링크 복사</span></div>
          <div class="mi">${K.ico('clipboard_paste:r', { s: 2.6 })}${K.skel('40%', { h: 1.2 })}</div>`,
      })
      + K.wires(K.curve(33.6, 30.6, 51.6, 44.6, { dash: true, dot: true }), { z: 4 })
      + K.cursor({ x: 64.4, y: 48.6 })
      + K.tile({ right: 1.6, y: 3.4, s: 10.5 })
      + K.float({ x: 8, y: 6.4, s: 6.6, icon: 'document_link' })
      + K.pill({ x: 4, bottom: 5, tint: true, icon: 'calendar_link', text: '일정에서 공문으로 바로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-right: 12cqw; font-size: 2.8cqw; }
      .pg { height: 100%; padding: 3cqw 3cqw 0; }
      .cal { display: grid; grid-template-columns: 1fr 1fr 1.7fr 1fr 1fr; grid-auto-rows: 17.4cqw; border-top: .2cqw solid #d9cde3; border-left: .2cqw solid #d9cde3; }
      .cl { position: relative; display: flex; flex-direction: column; gap: 1.2cqw; padding: 1.2cqw 1.2cqw; border-right: .2cqw solid #d9cde3; border-bottom: .2cqw solid #d9cde3; background: rgba(255, 255, 255, .55); }
      .cl b { font-size: 2.4cqw; font-weight: 700; color: var(--ink-3); }
      .cl .skel { margin-top: .4cqw; }
      .ev { display: flex; align-items: center; gap: .8cqw; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .ev .check { width: 2.4cqw; height: 2.4cqw; }
      .hot { z-index: 2; background: #fff; box-shadow: 0 0 0 .35cqw rgb(var(--tint)), 0 1.6cqw 3cqw -1cqw rgba(var(--tint), .45); border-radius: .6cqw; }
      .hot b { color: rgb(var(--tint)); }
      .lk { display: flex; align-items: flex-start; gap: .8cqw; }
      .lk .check { margin-top: .25cqw; width: 2.6cqw; height: 2.6cqw; box-shadow: inset 0 0 0 .28cqw rgb(var(--tint)); }
      .lk span { word-break: keep-all; font-size: 2.6cqw; font-weight: 750; line-height: 1.25; color: #2f5fd9; text-decoration: underline; text-decoration-thickness: .22cqw; text-underline-offset: .4cqw; }
      .menu { z-index: 3; padding: 1.6cqw; display: flex; flex-direction: column; gap: .6cqw; }
      .mi { display: flex; align-items: center; gap: 1.4cqw; padding: 1.3cqw 1.5cqw; border-radius: 1.1cqw; color: var(--ink-4); }
      .mi.on { background: var(--grad); color: #fff; box-shadow: 0 1.2cqw 2.4cqw -1cqw rgba(var(--tint), .55); }
      .mi span { font-size: 2.7cqw; font-weight: 700; white-space: nowrap; }
    `,
  });
})();
