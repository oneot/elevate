/* copilot/copilot2 — Designer shows the prompt behind a sample image; edit it, copy it into Edge Copilot, get the image. */
(() => {
  scene('copilot/copilot2', (K) => K.win({
    x: 35, y: 8, w: 62, h: 52, icon: false, title: 'Designer', sub: '· 배경 화면',
    barRight: K.btn('편집', { line: true, icon: 'edit' }),
    body: `<div class="dv">
      <div class="img im1"><span class="r11">1:1</span></div>
      <div class="pp">
        <p class="lb">프롬프트</p>
        <div class="tx">파스텔 톤 하늘 아래 <mark>3학년 2반 교실</mark> 칠판 배경<i class="caret"></i></div>
        ${K.skel('86%')}${K.skel('62%')}
        ${K.btn('Copilot으로 복사', { primary: true, icon: 'copy' })}
      </div>
    </div>`,
  })
    + K.card({
      x: 3.5, y: 14.5, w: 33, cls: 'cp', body: `
        <div class="ph">${K.app('copilot', { s: 3.2 })}Copilot<em>· Edge</em></div>
        <div class="me">${K.ico('clipboard_paste', { s: 2.4 })}붙여넣기 완료</div>
        <div class="out"><div class="img im2"></div><div class="col">${K.chip('이미지 생성됨', { dot: 'var(--green)' })}${K.skel('92%')}${K.skel('66%')}</div></div>`,
    })
    + K.tile({ x: 30.6, y: 3.4, s: 10.5 })
    + K.float({ x: 14, y: 5.2, icon: 'copy', s: 5.6 })
    + K.pill({ x: 4, bottom: 4.4, icon: 'image_sparkle', text: '프롬프트 복사해 바로 생성' }), {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 11.6cqw; padding-right: 2cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .dv { display: flex; gap: 3cqw; height: 100%; padding: 3.2cqw 3.2cqw 0; }
      .img { position: relative; flex: none; border-radius: 1.8cqw; box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .05), 0 1.2cqw 2.4cqw -1.2cqw rgba(15, 23, 42, .35); }
      .im1, .im2 { background:
        radial-gradient(circle at 82% 16%, #fff3b8 0 7%, transparent 7.6%),
        radial-gradient(ellipse 22% 8% at 58% 26%, #fff 95%, transparent),
        radial-gradient(ellipse 14% 6% at 68% 21%, #fff 95%, transparent),
        radial-gradient(ellipse 16% 7% at 22% 40%, #fff 95%, transparent),
        linear-gradient(#3f7a63, #3f7a63) 50% 72% / 70% 34% no-repeat,
        linear-gradient(#c79a6b, #c79a6b) 50% 92% / 76% 6% no-repeat,
        linear-gradient(180deg, #cfe6ff 0%, #f6dcf0 55%, #ffe9d2 100%); }
      .im1 { width: 26cqw; height: 26cqw; }
      .r11 { position: absolute; left: 1.4cqw; top: 1.4cqw; padding: .5cqw 1.2cqw; border-radius: 99px; background: rgba(255, 255, 255, .9); font-size: 2cqw; font-weight: 700; color: var(--ink-2); }
      .pp { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.5cqw; }
      .lb { font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .tx { padding: 1.6cqw 1.8cqw; border-radius: 1.6cqw; background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1.1cqw color-mix(in srgb, rgb(var(--tint)) 16%, transparent); font-size: 2.6cqw; font-weight: 650; line-height: 1.5; color: var(--ink); margin-bottom: .6cqw; }
      .tx mark { padding: .2cqw .4cqw; border-radius: .4cqw; background: color-mix(in srgb, rgb(var(--tint)) 18%, #fff); color: rgb(var(--tint)); font-weight: 750; white-space: nowrap; }
      .caret { display: inline-block; width: .3cqw; height: 2.8cqw; margin-left: .4cqw; vertical-align: -.5cqw; border-radius: 1px; background: rgb(var(--tint)); }
      .pp .btn { align-self: flex-start; margin-top: .8cqw; padding: 1.2cqw 2.2cqw; font-size: 2.5cqw; }
      .cp { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.4cqw 2.6cqw 2.6cqw; }
      .ph { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.6cqw; font-weight: 700; }
      .ph em { font-style: normal; font-weight: 550; color: var(--ink-4); font-size: 2.2cqw; }
      .me { align-self: flex-end; display: flex; align-items: center; gap: .8cqw; padding: 1cqw 1.8cqw; border-radius: 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
      .out { display: flex; gap: 1.8cqw; align-items: center; }
      .im2 { width: 12cqw; height: 12cqw; border-radius: 1.4cqw; box-shadow: 0 0 0 .3cqw rgb(var(--tint)); }
      .col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.3cqw; }
      .col .chip { align-self: flex-start; font-size: 2.1cqw; white-space: nowrap; }
    `,
  });
})();
