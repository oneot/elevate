/* github/github-copilot — vibe coding loop: ask Copilot to recolour the web app, copy the full code, see it live on Pages. */
(() => {
  scene('github/github-copilot', (K) => {
    const sk = (w) => `<i class="sk" style="width:${w}cqw"></i>`;
    return K.win({
      x: 4, y: 10.5, w: 58, h: 50, z: 2, icon: false, title: 'Copilot', sub: ' · index.html',
      body: `<div class="ct">
        ${K.bubble('강조 색상을 보라색으로 변경해줘', { me: true })}
        <div class="rp"><span class="av">${K.ico('bot_sparkle', { s: 2.6 })}</span><b>기존 기능은 그대로 유지했어요</b></div>
        <div class="cb hl">
          <div class="cbh"><span>html</span><span class="grow"></span>${K.btn('Copy code', { primary: true, icon: 'copy:r' })}</div>
          <div class="cbd">
            <div class="l">${sk(14)}</div>
            <div class="l del"><span class="mk">-</span><span class="v">--accent: #2563eb;</span></div>
            <div class="l add"><span class="mk">+</span><span class="v">--accent: #7c3aed;</span><i class="sw"></i></div>
            <div class="l">${sk(20)}</div>
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 59, y: 21, w: 35, z: 3, cls: 'wa',
        body: `<div class="url">${K.ico('lock_closed', { s: 2 })}oneot.github.io/ai</div>
          <div class="hero"><b>무엇이든 물어보세요</b>${K.skel('70%')}</div>
          ${K.prompt('메시지 입력')}`,
      })
      + K.mascot('copilot-front', { x: 59, y: 0.6, w: 24, z: 1 })
      + K.tile({ x: 1.4, y: 4.6, s: 10 })
      + K.pill({ right: 4, bottom: 2.6, icon: 'sparkle', text: '말 한마디로 디자인 수정' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 10.4cqw; }
      .ct { height: 100%; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 3cqw 0; }
      .ct .bubble { align-self: flex-end; max-width: 90%; padding: 1.1cqw 1.9cqw; font-size: 2.6cqw; white-space: nowrap; }
      .rp { display: flex; align-items: center; gap: 1.3cqw; }
      .rp b { font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .av { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .cb { border-radius: 1.6cqw; overflow: hidden; background: #fff; }
      .cbh { display: flex; align-items: center; padding: 1cqw 1cqw 1cqw 2cqw; background: #f3f1fb; font-family: var(--mono); font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
      .cbh .btn { font-family: var(--font); font-size: 2.4cqw; padding: .9cqw 1.7cqw; }
      .cbd { display: flex; flex-direction: column; padding: 1.4cqw 0 3cqw; background: #1f2430; font-family: var(--mono); }
      .l { display: flex; align-items: center; gap: 1.2cqw; height: 4.4cqw; padding: 0 2cqw; }
      .l .mk { width: 1.6cqw; font-size: 2.6cqw; font-weight: 700; }
      .l .v { font-size: 2.6cqw; font-weight: 650; color: #e6edf3; white-space: nowrap; }
      .l.del { background: rgba(248, 81, 73, .18); }
      .l.del .mk { color: #ff7b72; }
      .l.del .v { color: #ffb4ad; text-decoration: line-through; text-decoration-color: rgba(255, 123, 114, .7); }
      .l.add { background: rgba(46, 160, 67, .24); }
      .l.add .mk { color: #7ee787; }
      .sw { width: 2.6cqw; height: 2.6cqw; border-radius: .7cqw; background: #7c3aed; box-shadow: 0 0 0 .25cqw rgba(255, 255, 255, .7); }
      .sk { display: block; height: 1.3cqw; margin-left: 2.8cqw; border-radius: 99px; background: rgba(255, 255, 255, .16); }
      .wa { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.2cqw 2.6cqw 2.4cqw; --tint: 124, 58, 237; }
      .url { align-self: flex-start; display: inline-flex; align-items: center; gap: .7cqw; padding: .6cqw 1.5cqw .6cqw 1.2cqw; border-radius: 99px; background: var(--fill); font-size: 2.1cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .url .ico { color: var(--ink-3); }
      .hero { display: flex; flex-direction: column; gap: 1.1cqw; }
      .hero b { font-size: 3cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; color: #5b21b6; }
      .wa .prompt { font-size: 2.2cqw; }
      .wa .prompt .send { background: #7c3aed; }
    `,
  });
})();
