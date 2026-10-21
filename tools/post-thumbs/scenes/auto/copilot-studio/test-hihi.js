/* copilot-studio/test-hihi — a test message in the 테스트 pane with the two attached files from the post */
(() => {
  scene('copilot-studio/test-hihi', (K) => {
    const file = (icon, name, ext, on) => `<div class="fl${on ? ' on' : ''}">
      <span class="fi">${icon}</span>
      <div class="grow"><b>${name}</b><small>.${ext}</small></div>
      ${on ? K.ico('checkmark_circle', { s: 3.2, c: 'var(--green)' }) : ''}
    </div>`;
    return K.win({
      x: 33, y: 9.5, w: 63, h: 50, title: 'test hihi', sub: ' · 테스트', icon: false,
      barRight: K.chip('첨부 2개', { icon: 'attach', tint: true }),
      body: `<div class="ch">
        ${K.bubble('test글이다. 우헤헤', { me: true })}
        <div class="qt">${K.ico('comment', { s: 2.8 })}잘 나오려는지 걱정</div>
        <div class="fs">
          ${file(K.app('word', { s: 4.4 }), '멘토링 제출 서류', 'docx')}
          ${file(K.ico('document_text', { s: 3.8 }), '에이전톤 과업지시서(초안)', 'hwpx', true)}
        </div>
      </div>`,
    })
      + K.tile({ x: 28.6, y: 4.2, s: 10.5 })
      + K.float({ x: 9, y: 9, s: 6.6, icon: 'document_text', far: true })
      + K.pill({ x: 4.5, bottom: 5, icon: 'attach', text: '글과 첨부 파일 2개' });
  }, {
    deco: { big: 'fold', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.8cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; }
      .ch { display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw 3.2cqw; }
      .ch .bubble { align-self: flex-end; font-size: 2.7cqw; font-weight: 650; white-space: nowrap; }
      .qt { display: flex; align-items: center; gap: 1cqw; padding: 1.2cqw 2cqw; border-radius: .6cqw 1.4cqw 1.4cqw .6cqw;
        font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; align-self: flex-start;
        box-shadow: inset .55cqw 0 0 rgb(var(--tint)); background: rgba(var(--tint), .08); }
      .qt .ico { color: rgb(var(--tint)); }
      .fs { display: flex; flex-direction: column; gap: 1.4cqw; }
      .fl { display: flex; align-items: center; gap: 1.6cqw; padding: 1.4cqw 2cqw 1.4cqw 1.4cqw; border-radius: 1.6cqw;
        background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .fl.on { box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 2.6cqw -1cqw rgba(var(--tint), .6); }
      .fi { flex: none; display: grid; place-items: center; width: 6cqw; height: 6cqw; border-radius: 1.3cqw; background: #e9f0fc; color: #2f8fd8; }
      .fl b { display: block; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .fl small { display: block; margin-top: .2cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); }
      &.dark {
        .qt { background: rgba(255, 255, 255, .07); }
        .fl { background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); }
        .fl.on { background: rgba(var(--tint), .14); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 2.6cqw -1cqw rgba(var(--tint), .6); }
        .fi { background: rgba(90, 162, 255, .2); color: #8cc4ff; }
        .fl.on .fi { background: rgba(var(--tint), .22); color: #7fe3d6; }
      }
    `,
  });
})();
