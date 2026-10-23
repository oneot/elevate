(() => {
  scene('github/github-copilot-2', (K) => {
    const opt = (k, icon, text, on) => `<div class="op${on ? ' on hl' : ''}"><span class="ok">${k}</span>${K.ico(icon, { s: 2.8 })}<b>${text}</b>${on ? K.ico('checkmark_circle', { s: 3, cls: 'ck' }) : ''}</div>`;
    return K.win({
      right: 4, y: 9.5, w: 60, h: 50, z: 2, icon: false, title: 'Copilot', sub: ' · my-portfolio',
      body: `<div class="cv">
        <div class="me"><span class="cmd">/manage-portfolio-projects</span></div>
        <div class="q">${K.ico('bot_sparkle', { s: 3.2, cls: 'bt' })}<b>어떤 작업을 할까요?</b></div>
        <div class="ops">
          ${opt('A', 'add_circle', '새 프로젝트 추가', true)}
          ${opt('B', 'edit', '기존 프로젝트 수정')}
          ${opt('C', 'delete', '프로젝트 삭제')}
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 26, w: 30, z: 3, cls: 'sk',
        body: `<div class="fp">${K.ico('folder', { s: 2.8 })}<span>.github/skills</span></div>
          <div class="fl">${K.ico('document_text', { s: 3 })}<b>SKILL.md</b></div>
          ${K.skel('86%')}${K.skel('62%')}`,
      })
      + K.mascot('mona-front', { x: 7, y: 6.5, w: 24, z: 4 })
      + K.tile({ x: 33.6, y: 4, s: 10.5, z: 5 })
      + K.pill({ x: 4, bottom: 3.6, icon: 'arrow_repeat_all', text: '반복 작업을 스킬로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .cv { height: 100%; display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.8cqw 3cqw 0; }
      .me { align-self: flex-end; padding: 1.3cqw 2cqw; border-radius: 2.4cqw 2.4cqw .7cqw 2.4cqw; background: var(--grad); box-shadow: 0 1.2cqw 2.6cqw -1.4cqw rgba(var(--tint), .6); }
      .cmd { font-family: var(--mono); font-size: 2.3cqw; font-weight: 650; color: #fff; white-space: nowrap; }
      .q { display: flex; align-items: center; gap: 1.2cqw; }
      .q .bt { color: rgb(var(--tint)); }
      .q b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .ops { display: flex; flex-direction: column; gap: 1.5cqw; }
      .op { display: flex; align-items: center; gap: 1.3cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .8); box-shadow: inset 0 0 0 .18cqw var(--line-2); color: var(--ink-3); }
      .op b { flex: 1; font-size: 2.45cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .ok { display: grid; place-items: center; width: 3.6cqw; height: 3.6cqw; border-radius: 1cqw; background: var(--fill); font-family: var(--mono); font-size: 2.1cqw; font-weight: 750; color: var(--ink-3); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); color: rgb(var(--tint)); }
      .op.on b { font-size: 2.7cqw; font-weight: 750; color: var(--ink); }
      .op.on .ok { background: var(--grad); color: #fff; }
      .op .ck { color: var(--green); }
      .sk { padding: 2.4cqw 2.6cqw 2.6cqw; display: flex; flex-direction: column; gap: 1.5cqw; }
      .fp { display: flex; align-items: center; gap: .8cqw; font-family: var(--mono); font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .fp .ico { color: #e3a93b; }
      .fl { display: flex; align-items: center; gap: 1cqw; color: rgb(var(--tint)); }
      .fl b { font-family: var(--mono); font-size: 2.7cqw; font-weight: 750; color: var(--ink); }
    `,
  });
})();
