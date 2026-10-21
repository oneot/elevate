/* Forms — 설정하고 응답 확인하기 (v3). The 응답 수집 panel: 응답 대상 set to school accounts, QR tab picked, a big QR to post in each class. */
(() => {
  scene('forms/forms-share', (K) => {
    // Deterministic 21x21 QR-like grid with the three finder squares.
    const N = 21;
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const finder = (r, c) => {
      for (const [fr, fc] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
        const y = r - fr; const x = c - fc;
        if (y >= -1 && y <= 7 && x >= -1 && x <= 7) {
          if (y < 0 || y > 6 || x < 0 || x > 6) return 0;
          return (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)) ? 1 : 0;
        }
      }
      return null;
    };
    let cells = '';
    for (let r = 0; r < N; r += 1) {
      for (let c = 0; c < N; c += 1) {
        const f = finder(r, c);
        const on = f != null ? f : rnd() > 0.52 ? 1 : 0;
        cells += on ? '<i class="on"></i>' : '<i></i>';
      }
    }
    const tab = (icon, label, on) => `<span class="tb${on ? ' on' : ''}">${K.ico(icon, { s: 2.8 })}${label}</span>`;
    return K.win({
      x: 4, y: 10, w: 66, h: 52, title: '2학년 진로 희망 설문', icon: false,
      barRight: K.btn('응답 수집', { primary: true, icon: 'share' }),
      body: `<div class="sh">
        <div class="lc">
          <p class="lb">응답 대상</p>
          <div class="dd">${K.ico('building', { s: 2.8 })}<span>학교 계정만 응답</span>${K.ico('chevron_down:r', { s: 2.4 })}</div>
          <div class="tabs">${tab('link:r', '링크')}${tab('qr_code', 'QR', true)}${tab('code:r', '삽입')}</div>
          <div class="url"><span>forms.office.com/r/2a7K</span>${K.ico('copy:r', { s: 2.6 })}</div>
          <div class="sw"><span>URL 짧게 만들기</span><i class="toggle on"></i></div>
        </div>
        <div class="rc">
          <div class="qr">${cells}</div>
          ${K.btn('다운로드', { line: true, icon: 'arrow_download', cls: 'dl' })}
        </div>
      </div>`,
    })
      + K.tile({ x: 1.6, y: 4.2, s: 11 })
      + K.float({ x: 74, y: 19, icon: 'phone' })
      + K.pill({ right: 4, y: 4.6, icon: 'qr_code', text: 'QR로 반마다 공유' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 10.6cqw; }
      .win__bar > span:not(.sp):not(.btn) { font-size: 2.8cqw; font-weight: 700; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.4cqw; }
      .sh { display: flex; gap: 3.4cqw; height: 100%; padding: 3.4cqw 3.4cqw 0 4cqw; }
      .lc { flex: 1; display: flex; flex-direction: column; gap: 1.8cqw; min-width: 0; }
      .lb { font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .dd { display: flex; align-items: center; gap: 1.2cqw; padding: 1.4cqw 1.6cqw; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); color: rgb(var(--tint)); }
      .dd span { flex: 1; font-size: 2.8cqw; font-weight: 750; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
      .tabs { display: flex; gap: 1cqw; margin: 1.2cqw 0 .6cqw; padding: .6cqw; border-radius: 1.4cqw; background: rgba(240, 243, 245, .9); }
      .tb { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: .7cqw; height: 5cqw; border-radius: 1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-3); }
      .tb.on { background: var(--grad); color: #fff; font-weight: 750; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(3, 120, 124, .6); }
      .url { display: flex; align-items: center; gap: 1cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .22cqw #e1e8ea; color: var(--ink-3); }
      .url span { flex: 1; font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .sw { display: flex; align-items: center; justify-content: space-between; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .rc { flex: none; display: flex; flex-direction: column; align-items: center; gap: 2cqw; }
      .qr { display: grid; grid-template-columns: repeat(21, 1fr); width: 22cqw; aspect-ratio: 1; padding: 1.6cqw; border-radius: 1.6cqw; background: #fff; box-shadow: 0 1.4cqw 3cqw -1.4cqw rgba(3, 80, 90, .45), inset 0 0 0 .25cqw #e3eced; }
      .qr i.on { background: #12343a; border-radius: .12cqw; }
      .dl { padding: 1cqw 1.9cqw; font-size: 2.4cqw; }
    `,
  });
})();
