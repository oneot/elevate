/* github/github-pages — the agent team web app live at oneot.github.io/ai: one idea in the chat, five outputs, one of 8 designs */
(() => {
  scene('github/github-pages', (K) => {
    const out = (icon, label, on) => `<div class="o${on ? ' on' : ''}">${K.ico(icon, { s: 3.4 })}<span>${label}</span></div>`;
    return K.win({
      x: 35, y: 10, w: 61, h: 48, z: 2, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}oneot.github.io/ai</span>`,
      body: `<div class="site">
        <div class="nav"><span class="logo">${K.ico('people_team', { s: 2.6 })}</span><b>AI Creative Agent Team</b><span class="grow"></span><span class="dz">${K.ico('color', { s: 2.4 })}디자인 3/8</span></div>
        <p class="hero">아이디어 한 줄로 <em>결과물 5개</em></p>
        ${K.prompt('현장체험학습 안내 자료 만들어 줘', { cls: 'ask' })}
        <div class="outs">
          ${out('slide_text', '발표자료', true)}${out('image', '포스터')}${out('document_text', '제안서')}${out('globe', '웹페이지')}${out('table', '예산 분석')}
        </div>
      </div>`,
    })
      + K.tile({ x: 31, y: 4.6, s: 10.5 })
      + K.mascot('mona-side', { right: 1.5, y: 0.4, w: 16, z: 1, flip: true })
      + K.mascot('ducky-up', { x: 2, bottom: -3, w: 26, z: 3 })
      + K.pill({ x: 2.4, y: 15.5, icon: 'globe', text: '내 주소로 여는 웹앱', dark: true });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 3 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .win__bar .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .win__bar .url .ico { color: var(--ink-3); }
      .site { height: 100%; display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.6cqw 3cqw 0; background: linear-gradient(180deg, color-mix(in srgb, rgb(var(--tint)) 8%, #fff), rgba(255, 255, 255, .6) 70%); }
      .nav { display: flex; align-items: center; gap: 1.1cqw; }
      .logo { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 1.2cqw; background: var(--grad); color: #fff; }
      .nav b { font-size: 2.4cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .dz { display: inline-flex; align-items: center; gap: .6cqw; padding: .6cqw 1.3cqw; border-radius: 99px; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.1cqw; font-weight: 700; color: rgb(var(--tint)); white-space: nowrap; }
      .hero { margin-top: .4cqw; font-size: 3.9cqw; font-weight: 800; letter-spacing: -0.04em; line-height: 1.15; color: var(--ink); white-space: nowrap; }
      .hero em { font-style: normal; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .ask { font-size: 2.5cqw; font-weight: 650; color: var(--ink); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff), 0 1.4cqw 3cqw -1.6cqw rgba(var(--tint), .45); }
      .ask > span:not(.send) { white-space: nowrap; }
      .outs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1cqw; }
      .o { display: flex; flex-direction: column; align-items: center; gap: .8cqw; padding: 1.6cqw .2cqw 1.4cqw; border-radius: 1.6cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2), 0 1cqw 2cqw -1.4cqw rgba(15, 23, 42, .25); color: rgb(var(--tint)); }
      .o span { font-size: 2.3cqw; font-weight: 700; letter-spacing: -0.03em; color: var(--ink-2); white-space: nowrap; }
      .o.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 1.6cqw 3cqw -1.6cqw rgba(var(--tint), .6); }
      .o.on span { color: var(--ink); }
    `,
  });
})();
