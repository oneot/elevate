/* onedrive/onedrive-tutorial (v3) — see STYLE_GUIDE.md */
(() => {

// STEP 5: the OneDrive folder in File Explorer shows cloud-only (cloud) vs local (green check) files;
// right-clicking a lesson file offers '항상 이 장치에 유지' to keep it available offline.
scene('onedrive/onedrive-tutorial', (K) => {
  const local = K.ico('checkmark_circle', { s: 3.4, cls: 'lo' });
  const cloud = K.ico('cloud:r', { s: 3.4, cls: 'cl' });
  const row = (icon, name, st, w, on) => `<div class="r${on ? ' on' : ''}"><span class="nm">${icon}<b>${name}</b></span><span class="st">${st}</span>${K.skel(w)}</div>`;
  return K.win({
    x: 34.5, y: 9, w: 62.5, h: 52, title: 'OneDrive - 학교', icon: false,
    barRight: K.ico('arrow_sync:r', { s: 3, cls: 'sy' }),
    body: `<div class="ex">
        <div class="hd"><span>이름</span><span>상태</span><span></span></div>
        ${row(K.ico('folder', { s: 3.8, c: '#f2b631' }), '수업 자료', local, '70%')}
        ${row(K.app('powerpoint', { s: 3.6 }), '3단원 수업.pptx', cloud, '80%', true)}
        ${row(K.app('word', { s: 3.6 }), '수행평가 안내.docx', local, '64%')}
        ${row(K.ico('video', { s: 3.8, c: '#7b61c9' }), '수업 영상.mp4', cloud, '76%')}
      </div>`,
  })
    + K.card({
      x: 4.5, y: 26.5, w: 32.5, cls: 'menu',
      body: `<div class="mi on">${K.ico('checkmark_circle', { s: 3.2 })}<b>항상 이 장치에 유지</b></div>
        <div class="mi">${K.ico('cloud:r', { s: 3.2 })}<b>공간 확보</b></div>`,
    })
    + K.cursor({ x: 35.6, y: 30.6 })
    + K.tile({ x: 29.5, y: 3.6, s: 10.5 })
    + K.float({ x: 10, y: 10, s: 6.4, icon: 'wifi_off' })
    + K.pill({ x: 4.5, bottom: 4.2, icon: 'cloud_checkmark', text: '오프라인에서도 바로 열기' });
}, {
  deco: { big: 'fold', small: 'sphere', v: 1 },
  css: `
    .win__bar { padding-left: 10.5cqw; font-size: 2.8cqw; font-weight: 700; }
    .win__bar .sy { color: rgb(var(--tint)); }
    .ex { padding: 2.2cqw 3cqw 0; }
    .hd, .r { display: grid; grid-template-columns: 29cqw 8cqw 1fr; align-items: center; column-gap: 2cqw; }
    .hd { padding: 0 1.6cqw 1.2cqw; border-bottom: .18cqw solid rgba(20, 22, 30, .07); font-size: 2.1cqw; font-weight: 650; color: var(--ink-3); }
    .r { padding: 1.35cqw 1.6cqw; border-radius: 1.3cqw; }
    .r + .r { margin-top: .4cqw; }
    .r.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
    .nm { display: flex; align-items: center; gap: 1.6cqw; }
    .nm b { font-size: 2.65cqw; font-weight: 650; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
    .st { display: flex; justify-content: center; }
    .lo { color: var(--green); }
    .cl { color: rgb(var(--tint)); }
    .menu { z-index: 3; padding: 1.6cqw; display: flex; flex-direction: column; gap: .6cqw; }
    .mi { display: flex; align-items: center; gap: 1.5cqw; padding: 1.4cqw 1.6cqw; border-radius: 1.2cqw; color: var(--ink-3); }
    .mi b { font-size: 2.7cqw; font-weight: 650; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
    .mi.on { background: var(--grad); color: #fff; }
    .mi.on b { color: #fff; font-weight: 750; }
    .cursor { z-index: 4; }
  `,
});

})();
