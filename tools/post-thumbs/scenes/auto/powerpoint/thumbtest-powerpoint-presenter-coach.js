/* PowerPoint — 발표자 코치 리허설 보고서 (말하기 속도 + 반복되는 군말) */
(() => {
  scene('powerpoint/thumbtest-powerpoint-presenter-coach', (K) => {
    const filler = (word, n, p, on) => `<div class="fw${on ? ' on' : ''}">
        <b>${word}</b><span class="track"><i style="width:${p}%"></i></span><em>${n}회</em>
      </div>`;
    return K.win({
      x: 6, y: 5, w: 97, h: 54, title: '리허설 보고서', sub: ' · 6학년 2반 3모둠',
      body: `<div class="rp">
        <section class="pn sp">
          <div class="ph">${K.ico('gauge', { s: 3 })}<b>말하기 속도</b></div>
          <div class="gauge">
            <svg viewBox="0 0 100 56">
              <path d="M10 50 A40 40 0 0 1 30 15.4" class="z z1"/>
              <path d="M30 15.4 A40 40 0 0 1 70 15.4" class="z z2"/>
              <path d="M70 15.4 A40 40 0 0 1 90 50" class="z z1"/>
              <path d="M50 50 L58 17" class="nd"/>
              <circle cx="50" cy="50" r="4" class="hub"/>
            </svg>
          </div>
          <div class="val"><span class="t-num">112</span><small>분당 단어</small></div>
          <div class="ok">${K.chip('적당함', { dot: 'var(--green)' })}</div>
        </section>
        <section class="pn fl">
          <div class="ph">${K.ico('person_voice', { s: 3 })}<b>반복되는 군말</b></div>
          ${filler('음…', 9, 92, true)}
          ${filler('그러니까', 5, 52)}
          ${filler('약간', 2, 22)}
        </section>
      </div>`,
    })
      + K.pill({ right: 5, bottom: 4.2, icon: 'mic_record', text: '말하기 연습은 코치가', tint: true });
  }, {
    css: `
      .rp { display: grid; grid-template-columns: 38cqw 47cqw; align-items: start; gap: 2.4cqw; padding: 3cqw 3cqw 0; }
      .pn { height: 40cqw; }
      .pn { position: relative; padding: 2.4cqw 2.6cqw; border-radius: 2cqw; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .9); }
      .ph { display: flex; align-items: center; gap: 1cqw; margin-bottom: 2cqw; font-size: 2.7cqw; white-space: nowrap; }
      .ph .ico { color: rgb(var(--tint)); }
      .ph b { font-weight: 750; letter-spacing: -0.02em; }
      .gauge { width: 29cqw; margin: 0 auto; }
      .gauge svg { display: block; width: 100%; }
      .z { fill: none; stroke-width: 9; }
      .z1 { stroke: #eceef2; }
      .z2 { stroke: rgb(var(--tint)); }
      .nd { stroke: var(--ink); stroke-width: 3.2; stroke-linecap: round; }
      .hub { fill: var(--ink); }
      .val { display: flex; align-items: baseline; justify-content: center; gap: 1cqw; margin-top: .8cqw; }
      .val .t-num { font-size: 6.4cqw; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
      .val small { font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .ok { display: flex; justify-content: center; margin-top: 1.4cqw; }
      .ok .chip { font-size: 2.2cqw; }
      .fw { display: grid; grid-template-columns: 12cqw 1fr 5.4cqw; align-items: center; gap: 1.6cqw; height: 6.2cqw; padding: 0 1.6cqw; margin: 0 -1.6cqw .7cqw; border-radius: 1.4cqw; }
      .fw b { font-size: 2.7cqw; font-weight: 700; white-space: nowrap; }
      .fw em { font-style: normal; font-size: 2.6cqw; font-weight: 700; color: var(--ink-3); text-align: right; white-space: nowrap; }
      .track { height: 1.3cqw; border-radius: 99px; background: #eceef2; overflow: hidden; }
      .track i { display: block; height: 100%; border-radius: inherit; background: #c3c7cf; }
      .fw.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .fw.on .track i { background: rgb(var(--tint)); }
      .fw.on em { color: rgb(var(--tint)); }
    `,
  });
})();
