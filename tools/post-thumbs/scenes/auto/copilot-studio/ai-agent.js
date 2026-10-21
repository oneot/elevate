/* copilot-studio/ai-agent — STEP 2 adaptive card: undercut · porosity choices, then the topic judges 불량 */
(() => {
  scene('copilot-studio/ai-agent', (K) => {
    const opt = (t, on, bad) => `<span class="op${on ? ' on' : ''}${bad ? ' bad' : ''}"><i class="radio${on ? ' on' : ''}"></i>${t}</span>`;
    const set = (icon, label, a, b, pick, bad) => `<div class="qs">
      <p class="ql">${K.ico(icon, { s: 2.8 })}${label}</p>
      <div class="ops">${opt(a, pick === 0)}${opt(b, pick === 1, bad)}</div>
    </div>`;
    return K.win({
      x: 4, y: 9.5, w: 58, h: 50, title: '용접 외관검사 판정', sub: ' · 테스트', icon: false,
      body: `<div class="tb">
        <div class="ac">
          ${set('ruler', '언더컷 깊이', '0.5mm 이하', '0.6mm 이상', 1, true)}
          ${set('target', '기공 크기', '2.0mm 이하', '2.1mm 이상', 0)}
          ${K.btn('검사 결과 판정', { primary: true, icon: 'clipboard_task' })}
        </div>
      </div>`,
    })
      + K.card({
        x: 59, y: 16, w: 35, top: true, cls: 'rs',
        body: `<div class="in">
          <p class="lb">${K.ico('clipboard_checkmark', { s: 2.8 })}판정결과</p>
          <p class="vd">${K.ico('dismiss_circle', { s: 6 })}불량</p>
          ${K.skel('92%')}${K.skel('70%')}
          ${K.chip('용접 결함 사례집', { icon: 'document_pdf', line: true })}
        </div>`,
      })
      + K.tile({ x: 1.6, y: 4, s: 10.5 })
      + K.float({ right: 4, bottom: 3.4, s: 6.6, icon: 'ruler' })
      + K.pill({ right: 4, y: 5, icon: 'sparkle', text: '측정값으로 자동 판정' });
  }, {
    deco: { big: 'sphere', small: 'fold', v: 0 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.8cqw; font-weight: 700; }
      .tb { padding: 2.8cqw 3cqw; }
      .ac { display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.6cqw 2.8cqw 2.8cqw; border-radius: 1.8cqw;
        background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .18cqw rgba(255, 255, 255, .2); }
      .qs { display: flex; flex-direction: column; gap: 1.2cqw; }
      .ql { display: flex; align-items: center; gap: .9cqw; font-size: 2.7cqw; font-weight: 700; white-space: nowrap; color: var(--ink); }
      .ql .ico { color: rgb(var(--tint)); }
      .ops { display: flex; gap: 1.2cqw; }
      .op { display: inline-flex; align-items: center; gap: 1cqw; padding: 1.1cqw 1.8cqw 1.1cqw 1.3cqw; border-radius: 1.3cqw; font-size: 2.45cqw; font-weight: 650;
        white-space: nowrap; color: var(--ink-2); background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); }
      .op.on { color: #fff; background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .28cqw rgb(var(--tint)), 0 0 2.4cqw -.8cqw rgba(var(--tint), .6); }
      .op.bad { background: rgba(255, 107, 102, .16); box-shadow: inset 0 0 0 .28cqw #ff8f88, 0 0 2.4cqw -.8cqw rgba(255, 107, 102, .6); }
      .op.bad .radio.on { background: #ff8f88; box-shadow: inset 0 0 0 .3cqw #ff8f88, inset 0 0 0 .75cqw #2a4a5a; }
      .ac .btn { align-self: flex-start; margin-top: .4cqw; padding: 1.3cqw 2.6cqw; font-size: 2.6cqw; font-weight: 700; }
      .rs { z-index: 4; }
      .rs .in { display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.4cqw 2.8cqw 2.8cqw; }
      .lb { display: flex; align-items: center; gap: .8cqw; font-size: 2.6cqw; font-weight: 700; color: rgb(var(--tint)); }
      .vd { display: flex; align-items: center; gap: 1.2cqw; margin: .4cqw 0 1cqw; font-family: var(--display); font-size: 7cqw; font-weight: 750;
        letter-spacing: -0.04em; line-height: 1; color: #ff8f88; }
      .rs .chip { align-self: flex-start; margin-top: .8cqw; font-size: 2.2cqw; }
      .rs .chip .ico { color: #ff7d74; }
    `,
  });
})();
