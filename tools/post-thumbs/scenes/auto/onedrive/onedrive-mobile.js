(() => {
  // Mobile: close-up of the OneDrive phone app (Android top tabs 파일/미디어, account icon top-left),
  // where the document saved on the school PC is right there in the 파일 tab.
  scene('onedrive/onedrive-mobile', (K) => {
    const row = (icon, name, meta, on) => `<div class="it${on ? ' on' : ''}">${icon}<div class="tx"><b>${name}</b><small>${meta}</small></div>${on ? K.ico('checkmark_circle', { s: 3.6, cls: 'ok' }) : K.ico('more_vertical:r', { s: 3, cls: 'mo' })}</div>`;
    return `<div class="phone big" style="--w:62cqw;${K.pos({ x: 5, y: 4.5 })}"><div class="phone__screen">
        <div class="hd">${K.avatar('학', { s: 5 })}<b>학교 계정</b>${K.ico('chevron_down:r', { s: 2.8, cls: 'cv' })}<span class="sp"></span>${K.ico('search:r', { s: 3.4 })}</div>
        <div class="tabs"><span class="on">파일</span><span>미디어</span><span>공유됨</span></div>
        <div class="li">
          ${row(K.ico('folder', { s: 5, c: '#f2b631' }), '3학년 1반 수업 자료', '항목 12개')}
          ${row(K.app('word', { s: 4.6 }), '수행평가 안내.docx', '방금 PC에서 저장', true)}
          <div class="it">${K.app('excel', { s: 4.6 })}<div class="tx">${K.skel('20cqw', { h: 2.4 })}${K.skel('11cqw', { h: 1.8 })}</div></div>
        </div>
      </div></div>`
      + K.tile({ x: 61, y: 1.2, s: 10.5 })
      + K.card({
        right: 4.5, y: 17, w: 25, cls: 'st',
        body: `<div class="sr">${K.ico('arrow_download', { s: 3 })}<b>App Store</b></div>
          <div class="sr">${K.ico('arrow_download', { s: 3 })}<b>Play Store</b></div>`,
      })
      + K.float({ right: 6, y: 3.5, icon: 'cloud_sync', far: true })
      + K.pill({ right: 3.5, bottom: 3.4, icon: 'phone', text: 'PC 문서를 폰에서 바로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .phone.big { padding: 1cqw; border-radius: 7cqw; }
      .phone.big .phone__screen { border-radius: 6cqw; }
      .phone.big .phone__screen::before { top: 1.6cqw; width: 22%; height: 3cqw; }
      .hd { display: flex; align-items: center; gap: 1.8cqw; padding: 7.2cqw 11cqw 2.2cqw 4cqw; color: var(--ink-3); }
      .hd .avatar { font-size: 2.4cqw; box-shadow: 0 0 0 .5cqw #fff, 0 0 0 1cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .hd b { margin-left: .6cqw; font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
      .hd .cv { color: var(--ink-3); }
      .hd .sp { flex: 1; }
      .tabs { display: flex; gap: 5cqw; padding: 0 4cqw; border-bottom: .2cqw solid #eef0f3; }
      .tabs span { padding: 1.2cqw .4cqw 1.6cqw; font-size: 2.9cqw; font-weight: 650; color: var(--ink-3); }
      .tabs .on { color: rgb(var(--tint)); font-weight: 750; box-shadow: inset 0 -.6cqw 0 rgb(var(--tint)); }
      .li { padding: 1.6cqw 2.6cqw 0; }
      .it { display: flex; align-items: center; gap: 2.4cqw; padding: 1.7cqw 1.6cqw; border-radius: 2cqw; }
      .it + .it { margin-top: .6cqw; }
      .it.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 32%, #fff); }
      .tx { display: flex; flex-direction: column; gap: .5cqw; }
      .tx b { font-size: 3cqw; font-weight: 700; letter-spacing: -0.025em; color: var(--ink); white-space: nowrap; }
      .tx small { font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .it.on small { color: rgb(var(--tint)); }
      .it .ok { margin-left: auto; color: rgb(var(--tint)); }
      .it .mo { margin-left: auto; color: var(--ink-4); }
      .it .skel + .skel { margin-top: .6cqw; }
      .st { z-index: 4; display: flex; flex-direction: column; gap: 1cqw; padding: 1.8cqw; }
      .sr { display: flex; align-items: center; gap: 1.4cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .7); }
      .sr .ico { color: rgb(var(--tint)); }
      .sr b { font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    `,
  });
})();
