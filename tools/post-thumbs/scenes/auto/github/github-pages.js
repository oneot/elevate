/* github/github-pages — index.html sealed by agent-seal (BROKER_URL + SEALED), committed, live on github.io */
(() => {
  scene('github/github-pages', (K) => {
    const L = (html) => `<div class="l"><i class="g"></i>${html}</div>`;
    const sk = (w, c = '') => `<i class="sk ${c}" style="width:${w}cqw"></i>`;
    return K.win({
      x: 4, y: 12, w: 58, h: 48, z: 2, icon: false, title: 'ai / index.html',
      barRight: K.btn('Commit changes...', { primary: true }),
      body: `<div class="ed"><div class="code">${L(sk(18, 't'))}${L(sk(30))}<div class="seal hl"><span class="tag">${K.ico('lock_closed', { s: 2.2 })}agent-seal</span>${L('<b>BROKER_URL = "…"</b>')}${L('<b>SEALED = "Qx9f…"</b>')}</div>${L(sk(24))}${L(sk(34, 't'))}${L(sk(20))}</div></div>`,
    })
      + K.tile({ x: 1.2, y: 5.6, s: 10.5 })
      + K.mascot('mona-side', { x: 46, y: 0.8, w: 16, z: 1, flip: true })
      + K.card({
        right: 4, y: 14.5, w: 35, cls: 'live',
        body: `<div class="lh">${K.ico('checkmark_circle', { s: 3.2, c: 'var(--green)' })}<small>Your site is live at</small></div>
          <b>oneot.github.io/ai/</b>
          ${K.btn('Visit site', { line: true, icon: 'open:r' })}`,
      })
      + K.mascot('ducky-up', { right: 3, bottom: -3, w: 23, z: 4, flip: true })
      + K.pill({ right: 4, y: 4.4, icon: 'shield_lock', text: '암호 없이 안전하게 공개', dark: true });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11.5cqw; }
      .win__bar .btn { padding: 1cqw 1.8cqw; font-size: 2.3cqw; }
      .ed { height: 100%; padding: 2.4cqw 2.6cqw 0 1.6cqw; }
      .code { white-space: normal; font-size: 2.7cqw; line-height: 1.3; }
      .l { display: flex; align-items: center; gap: 1.8cqw; min-height: 4.4cqw; white-space: nowrap; }
      .g { flex: none; width: 2.2cqw; height: 1cqw; border-radius: 99px; background: #e8eaef; }
      .sk { display: inline-block; height: 1.3cqw; border-radius: 99px; background: #dfe2e8; }
      .sk.t { background: color-mix(in srgb, rgb(var(--tint)) 28%, #fff); }
      .seal { position: relative; display: flex; flex-direction: column; gap: .4cqw; margin: 3.2cqw 0 2.4cqw; padding: 1.6cqw 1.6cqw 1.4cqw 1.2cqw; border-radius: 1.4cqw; background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); }
      .seal .g { background: rgb(var(--tint)); opacity: .5; }
      .seal b { font-weight: 700; color: rgb(var(--tint)); }
      .tag { position: absolute; right: 1.4cqw; top: -2.2cqw; display: inline-flex; align-items: center; gap: .6cqw; padding: .6cqw 1.3cqw; border-radius: 99px; background: var(--grad); color: #fff; font-family: var(--font); font-size: 2.1cqw; font-weight: 700; }
      .live { z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 1.2cqw; padding: 2.4cqw 2.6cqw; }
      .lh { display: flex; align-items: center; gap: 1cqw; }
      .lh small { font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
      .live b { font-size: 3.1cqw; font-weight: 750; letter-spacing: -0.01em; color: rgb(var(--tint)); white-space: nowrap; }
      .live .btn { font-size: 2.2cqw; padding: .9cqw 1.6cqw; }
    `,
  });
})();
