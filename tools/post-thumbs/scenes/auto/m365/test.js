/* m365/test — see STYLE_GUIDE.md */
(() => {

// Test post: the new-post editor with its thumbnail slot, and the blog card it turns into.
scene('m365/test', (K) => {
  const tools = ['text_bold:r', 'text_italic:r', 'link:r', 'image:r'];
  return K.win({
    x: 22, y: 6, w: 74, h: 54, title: 'Microsoft 365', sub: ' · 새 게시물', cls: 'ed',
    barRight: `${K.btn('미리 보기', { line: true, icon: 'eye:r', cls: 'bb' })}${K.btn('게시', { primary: true, icon: 'send', cls: 'bb' })}`,
    body: `<div class="ew">
      <div class="th">
        <span class="ti">${K.ico('image_sparkle', { s: 5.6 })}</span>
        ${K.btn('썸네일 변경', { icon: 'image_add', cls: 'tc' })}
      </div>
      <h4>test 글</h4>
      <div class="tb">${tools.map((n) => `<span>${K.ico(n, { s: 2.6 })}</span>`).join('')}</div>
      ${K.skel('86%')}${K.skel('64%', { style: 'margin-top:1.3cqw' })}
    </div>`,
  })
    + K.card({
      x: 4.5, y: 13, w: 30, cls: 'pv',
      body: `<div class="pt">${K.ico('image_sparkle', { s: 4.2 })}</div>
        <div class="pb">
          <b>test 글</b>
          <p>test 글 입니다.</p>
          ${K.chip('게시됨', { dot: 'var(--green)' })}
        </div>`,
    })
    + K.pill({ x: 4.5, bottom: 4.6, dark: true, icon: 'image', text: '썸네일 반영 미리 확인' });
}, {
  css: `
    .ed .win__bar .sp + .btn { margin-left: 0; }
    .bb { padding: .9cqw 1.9cqw; font-size: 2.1cqw; border-radius: 1.2cqw; }
    .bb + .bb { margin-left: 1.2cqw; }
    .bb .ico { --s: 2.4cqw; }
    .ew { padding: 3cqw 3.2cqw 0 13.5cqw; }
    .th { position: relative; height: 17cqw; border-radius: 2cqw; display: grid; place-items: center;
      background: linear-gradient(130deg, color-mix(in srgb, rgb(var(--tint)) 22%, #fff), color-mix(in srgb, #c25bb4 18%, #fff) 60%, color-mix(in srgb, #2f8fe0 16%, #fff));
      box-shadow: inset 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
    .ti { color: rgb(var(--tint)); opacity: .85; }
    .tc { position: absolute; right: 2cqw; bottom: 1.8cqw; padding: 1cqw 1.9cqw; font-size: 2.2cqw; border-radius: 1.2cqw; background: #fff; box-shadow: 0 .6cqw 1.6cqw -.6cqw rgba(15, 23, 42, .3); }
    .tc .ico { --s: 2.6cqw; color: rgb(var(--tint)); }
    h4 { margin: 2.6cqw 0 1.6cqw; font-size: 4.4cqw; font-weight: 750; letter-spacing: -0.04em; }
    .tb { display: flex; gap: .8cqw; margin-bottom: 2.2cqw; }
    .tb span { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 1cqw; background: #f4f5f7; color: var(--ink-3); }
    .pv { z-index: 3; padding: 0; overflow: hidden; }
    .pt { display: grid; place-items: center; height: 12.5cqw; color: #fff;
      background: linear-gradient(130deg, rgb(var(--tint)), #c25bb4 60%, #2f8fe0); }
    .pb { padding: 2cqw 2.4cqw 2.4cqw; }
    .pb b { display: block; font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.03em; }
    .pb p { margin: .6cqw 0 1.6cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
    .pb .chip { padding: .7cqw 1.4cqw; font-size: 2.1cqw; }
  `,
});
})();
