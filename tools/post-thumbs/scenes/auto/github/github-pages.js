/* github/github-pages — index.html committed with the agent-seal SEALED value instead of 암호1 */
(() => {
  scene('github/github-pages', (K) => {
    const L = (html, cls = '') => `<div class="l ${cls}">${html}</div>`;
    const sk = (w, c = '') => `<i class="sk ${c}" style="width:${w}cqw"></i>`;
    const code = [
      L(`${sk(9, 'g')}`),
      L(`<span class="n">BROKER_URL =</span>${sk(17, 's')}`, 'on'),
      L(`<span class="n">SEALED =</span><span class="s">"kQ9x…"</span>${K.chip('봉인됨', { icon: 'lock_closed', solid: true })}`, 'on'),
      L(sk(31)),
      L(sk(22)),
      L(sk(27)),
    ].join('');
    return K.win({
      x: 31, y: 10.5, w: 65, h: 50, icon: false, title: 'ai', sub: ' / index.html',
      barRight: K.btn('Commit changes...', { primary: true }),
      body: `<div class="code ed">${code}</div>`,
    })
      + K.card({
        x: 4, y: 15, w: 30, cls: 'seal',
        body: `<div class="sh">${K.ico('shield_lock', { s: 3.2, c: 'rgb(var(--tint))' })}<b>agent-seal</b></div>
          <div class="fd"><small>암호1</small><span class="dots">••••••••</span></div>
          <div class="fd"><small>GitHub 아이디</small><span>oneot</span></div>`,
      })
      + K.tile({ x: 26.4, y: 4.4, s: 10.5 })
      + K.float({ right: 3.2, bottom: 5, app: 'copilot-studio' })
      + K.pill({ x: 4, bottom: 4.6, icon: 'lock_closed', text: '암호는 봉인해서 배포' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .ed { padding: 2.6cqw 0; font-size: 2.75cqw; line-height: 2; }
      .l { display: flex; align-items: center; gap: 1.4cqw; height: 5.2cqw; padding: 0 3cqw 0 6.4cqw; }
      .l .n { font-weight: 700; }
      .l.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, transparent); box-shadow: inset .5cqw 0 0 rgb(var(--tint)); font-weight: 650; }
      .l .chip { margin-left: 1.4cqw; font-family: var(--font); font-size: 2.2cqw; padding: .6cqw 1.4cqw; }
      .sk { display: inline-block; height: 1.3cqw; border-radius: 99px; background: rgba(20, 22, 30, .1); }
      .sk.g { background: rgba(17, 99, 41, .28); }
      .sk.s { background: rgba(10, 125, 54, .3); }
      .seal { z-index: 3; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.6cqw; }
      .sh { display: flex; align-items: center; gap: 1cqw; }
      .sh b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.02em; }
      .fd { display: flex; flex-direction: column; gap: .5cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.2cqw; background: var(--fill); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .fd small { font-size: 2cqw; font-weight: 600; color: var(--ink-3); }
      .fd span { font-size: 2.5cqw; font-weight: 700; white-space: nowrap; }
      .fd .dots { letter-spacing: .15em; color: var(--ink-2); }
    `,
  });
})();
