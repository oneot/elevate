/* github/test — a test post that checks how its own thumbnail turns out:
   the 'Post thumbnails' Actions run finishes and the new card preview appears. */
(() => {
  scene('github/test', (K) => {
    const step = (label, i) => `<div class="st s${i}">${K.ico('checkmark_circle', { s: 3, c: 'var(--green)' })}<b>${label}</b><span class="grow"></span>${K.skel(`${5 + (i % 2) * 2}cqw`)}</div>`;
    return K.win({
      x: 5, y: 10, w: 64, h: 50, icon: false, title: 'Actions', sub: ' / Post thumbnails',
      body: `<div class="run">
        <div class="hd">${K.ico('checkmark_circle', { s: 4.4, c: 'var(--green)' })}<b>github/test</b>${K.chip('Success', { dot: 'var(--green)', cls: 'ok' })}</div>
        <div class="steps">
          ${step('Prepare post', 0)}
          ${step('Draw scene', 1)}
          ${step('Check excerpt', 2)}
          <div class="st on s3">${K.ico('checkmark_circle', { s: 3, c: 'var(--green)' })}<b>Export WebP</b><span class="grow"></span><span class="fn">test-960.webp</span></div>
        </div>
      </div>`,
    })
      + K.card({
        x: 61, y: 16.4, w: 31, cls: 'pv',
        body: `<div class="th"><span class="ti">${K.ico('image', { s: 4.6 })}</span></div>
          <div class="tx"><b>test</b>${K.skel('92%')}${K.skel('64%')}</div>`,
      })
      + K.tile({ x: 1.6, y: 3.2, s: 10.5 })
      + K.float({ right: 5, y: 8.6, icon: 'sparkle', s: 6 })
      + K.pill({ right: 5, bottom: 3.6, icon: 'image', text: '썸네일 미리 보기' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12.4cqw; font-size: 2.5cqw; }
      .run { height: 100%; display: flex; flex-direction: column; gap: 2.4cqw; padding: 3cqw 3.2cqw; }
      .hd { display: flex; align-items: center; gap: 1.4cqw; }
      .hd b { font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .hd .ok { font-size: 2.2cqw; color: #1a7f37; background: rgba(46, 160, 67, .12); }
      .steps { display: flex; flex-direction: column; gap: 1.1cqw; padding-right: 9cqw; }
      .st { display: flex; align-items: center; gap: 1.3cqw; height: 5cqw; padding: 0 1.6cqw; border-radius: 1.2cqw; background: rgba(20, 22, 30, .035); }
      .st b { font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .st .skel { flex: none; }
      .st.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .st.on b { color: var(--ink); font-weight: 750; }
      .fn { font-family: var(--mono); font-size: 2.2cqw; font-weight: 700; color: rgb(var(--tint)); white-space: nowrap; }
      .pv { z-index: 3; padding: 0; overflow: hidden; }
      .th { display: grid; place-items: center; height: 14cqw; background: linear-gradient(135deg, var(--f1), var(--f2) 55%, rgb(var(--tint))); }
      .ti { display: grid; place-items: center; width: 8cqw; height: 8cqw; border-radius: 2.2cqw; background: rgba(255, 255, 255, .55); color: rgb(var(--tint)); box-shadow: 0 1cqw 2.4cqw -1.2cqw rgba(var(--tint), .6); }
      .tx { display: flex; flex-direction: column; gap: 1.2cqw; padding: 2.2cqw 2.6cqw 2.6cqw; }
      .tx b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.02em; }
    `,
  });
})();
