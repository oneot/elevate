/* github/github-copilot — GitHub Copilot chat: syntax check, then a modern redesign handed back as code to copy and commit. */
(() => {
  scene('github/github-copilot', (K) => {
    const code = ['34%', '58%', '76%', '50%', '68%'].map((w, i) => `<div class="cl" style="--in:${[0, 2.4, 4.8, 4.8, 2.4][i]}cqw"><i style="width:${w};--c:${['#d2a8ff', '#79c0ff', '#7ee787', '#ffa657', '#79c0ff'][i]}"></i></div>`).join('');
    return K.win({
      x: 31, y: 8.5, w: 65, h: 51, z: 2, icon: false, title: 'Copilot', sub: ' · index.html',
      body: `<div class="ct">
        ${K.bubble('문법 검사해줘.', { me: true })}
        <div class="rp">
          <span class="av">${K.ico('bot_sparkle', { s: 2.6 })}</span>
          <div class="rb"><b>오류와 개선 사항을 찾았어요</b><div class="row">${K.chip('닫는 태그 누락', { dot: 'var(--red)' })}${K.chip('버튼 접근성', { dot: 'var(--amber)' })}</div></div>
        </div>
        ${K.bubble('모던하고 세련된 디자인으로 수정해 줘', { me: true })}
        <div class="cb hl">
          <div class="cbh"><span>html</span><span class="grow"></span>${K.btn('Copy code', { primary: true, icon: 'copy:r' })}</div>
          <div class="cbd">${code}</div>
        </div>
      </div>`,
    })
      + K.card({
        x: 3.5, y: 17, w: 27.5, cls: 'ed',
        body: `<div class="eh">${K.ico('edit', { s: 2.6, c: 'rgb(var(--tint))' })}<b>index.html</b></div>
          <div class="es">${K.skel('86%')}${K.skel('64%')}</div>
          ${K.btn('Commit changes', { primary: true })}`,
      })
      + K.mascot('copilot-front', { right: 7, y: 0.4, w: 11, z: 1 })
      + K.tile({ x: 26.4, y: 3.4, s: 10.5 })
      + K.float({ x: 6, y: 5, icon: 'globe', s: 6, far: true })
      + K.pill({ x: 4, bottom: 4.6, icon: 'sparkle', text: '대화로 다듬는 웹앱' });
  }, {
    deco: { big: 'ribbon', small: false, v: 1 },
    css: `
      .win__bar { padding-left: 11.6cqw; padding-right: 2.4cqw; }
      .ct { height: 100%; display: flex; flex-direction: column; gap: 1.5cqw; padding: 2.4cqw 3cqw 0; }
      .ct .bubble { align-self: flex-end; max-width: 80%; padding: 1cqw 1.8cqw; font-size: 2.4cqw; white-space: nowrap; }
      .rp { display: flex; align-items: flex-start; gap: 1.4cqw; }
      .av { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .rb { display: flex; flex-direction: column; gap: 1.2cqw; }
      .rb b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .rb .row { gap: 1cqw; }
      .rb .chip { font-size: 2.1cqw; white-space: nowrap; }
      .cb { border-radius: 1.6cqw; overflow: hidden; background: #fff; }
      .cbh { display: flex; align-items: center; padding: 1cqw 1cqw 1cqw 2cqw; background: #f3f1fb; font-family: var(--mono); font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
      .cbh .btn { font-family: var(--font); font-size: 2.3cqw; padding: .9cqw 1.6cqw; }
      .cbd { display: flex; flex-direction: column; gap: 1.3cqw; padding: 1.8cqw 2cqw 3cqw; background: #1f2430; }
      .cl { padding-left: var(--in); }
      .cl i { display: block; height: 1.3cqw; border-radius: 99px; background: var(--c); opacity: .85; }
      .ed { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw; }
      .eh { display: flex; align-items: center; gap: 1cqw; }
      .eh b { font-family: var(--mono); font-size: 2.4cqw; font-weight: 700; }
      .es { display: flex; flex-direction: column; gap: 1.1cqw; }
      .ed .btn { align-self: flex-start; font-size: 2.4cqw; padding: 1.1cqw 2cqw; }
    `,
  });
})();
