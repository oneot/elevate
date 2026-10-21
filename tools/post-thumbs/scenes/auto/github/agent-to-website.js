/* github/agent-to-website — Copilot Studio Web app code pasted into index.html, committed with a Copilot message */
(() => {
  scene('github/agent-to-website', (K) => {
    // Line numbers come from a CSS counter so the code stays a handful of text blocks.
    const L = (html, cls = '') => `<div class="l ${cls}"><span class="c">${html}</span></div>`;
    const sk = (w, ind = 2.6) => `<i class="sk" style="width:${w}cqw;margin-left:${ind}cqw"></i>`;
    const code = [
      L('<span class="t">&lt;body&gt;</span>'),
      L('  <span class="t">&lt;h1&gt;</span><b class="tx">바른말 탐험대</b><span class="t">&lt;/h1&gt;</span>'),
      L(sk(22)),
      L('  <span class="t">&lt;iframe</span> <span class="a">src</span>=<span class="s">"copilotstudio…"</span>', 'on'),
      L(sk(18, 5.2)),
      L(sk(26)),
    ].join('');
    return K.win({
      x: 4, y: 10.5, w: 64, h: 52, icon: false,
      title: `<span class="path">spellchecker / <span class="fn">index.html</span></span>`,
      body: `<div class="code ed">${code}</div>`,
    })
      + K.card({
        x: 62, y: 33, w: 34, cls: 'cm',
        body: `<p class="ch">Commit message</p>
          <div class="msg">${K.ico('sparkle', { s: 2.6 })}<span>Create index.html</span></div>
          <div class="ft">${K.btn('Commit changes', { cls: 'go' })}</div>`,
      })
      + K.wires(K.curve(76.5, 21.4, 58.4, 37.4, { dash: '1.2 1', w: 0.5, bend: 'v' }), { z: 4 })
      + K.mascot('mona-tilt', { right: 5, y: 26.4, w: 11, z: 2 })
      + K.tile({ x: 0.6, y: 5.2, s: 10.5 })
      + K.float({ x: 73, y: 11.6, s: 7, app: 'copilot-studio' })
      + K.pill({ right: 4, y: 4.4, icon: 'globe', text: '코드 붙여 웹사이트로' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .path { font-size: 2.5cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .fn { display: inline-block; margin-left: .4cqw; padding: .5cqw 1.4cqw; border-radius: .9cqw; background: #fff; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: var(--ink); font-weight: 700; }
      .ed { height: 100%; padding: 2.6cqw 0; font-size: 2.3cqw; background: rgba(255, 255, 255, .55); color: var(--ink-2); counter-reset: ln 5; }
      .ed .l { display: flex; align-items: center; height: 4.6cqw; padding: 0 2.4cqw 0 1.6cqw; white-space: pre; counter-increment: ln; }
      .ed .l::before { content: counter(ln); flex: none; width: 4.4cqw; color: var(--ink-4); }
      .ed .t { color: #116329; }
      .ed .a { color: #0550ae; }
      .ed .s { color: #0a3069; font-weight: 600; }
      .ed .tx { font-family: var(--font); font-weight: 700; color: var(--ink); }
      .ed .l.on { margin: .6cqw 0; height: 5.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset .6cqw 0 0 rgb(var(--tint)); font-size: 2.7cqw; font-weight: 700; }
      .ed .l.on::before { color: rgb(var(--tint)); }
      .sk { display: inline-block; height: 1.3cqw; border-radius: 99px; background: rgba(15, 23, 42, .1); }
      .cm { z-index: 3; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.6cqw 2.6cqw 2.6cqw; }
      .ch { font-size: 2.4cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .msg { display: flex; align-items: center; gap: 1cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .22cqw var(--line-2); color: rgb(var(--tint)); }
      .msg span { font-size: 2.4cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .ft { display: flex; justify-content: flex-end; }
      .go { padding: 1cqw 2cqw; border-radius: 1.2cqw; background: #1f883d; color: #fff; font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
    `,
  });
})();
