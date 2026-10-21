/* copilot-studio/post — mood type test agent: knowledge, skills and four connected agents */
(() => {
  scene('copilot-studio/post', (K) => {
    const agent = (icon, name) => `<div class="ag"><span class="ni">${K.ico(icon, { s: 2.8 })}</span><b>${name}</b>${K.ico('checkmark_circle', { s: 2.6, c: 'var(--green)' })}</div>`;
    return K.win({
      x: 5, y: 10, w: 70, h: 50, title: '무드 타입 테스트', icon: false,
      barRight: `${K.chip('Claude Opus 4.8', { line: true })}${K.btn('Publish', { primary: true })}`,
      body: `<div class="ov">
        <div class="rw">
          <div class="sec">${K.ico('book', { s: 2.8 })}<b>Knowledge</b><span class="fl">mood_types.txt</span></div>
          <div class="sec sk">${K.ico('puzzle_piece', { s: 2.8 })}<b>Skills</b>${K.chip('6', { tint: true })}</div>
        </div>
        <div class="ca hl">
          <div class="ch">${K.ico('plug_connected', { s: 2.8 })}<b>Connected agents</b>${K.chip('4개', { solid: true })}</div>
          <div class="grid">
            ${agent('target_arrow', '타입판정가')}${agent('emoji_sparkle', '활동추천가')}
            ${agent('star', '결과평가가')}${agent('shield_checkmark', '안전검토가')}
          </div>
        </div>
      </div>`,
    })
      + K.tile({ x: 2, y: 4.2, s: 11 })
      + K.float({ x: 80, bottom: 11, icon: 'people_team' })
      + K.pill({ right: 4, y: 5, icon: 'bot', text: '역할 나눈 테스트봇' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 13cqw; }
      .win__bar .chip { font-size: 2cqw; }
      .win__bar .btn { padding: .9cqw 1.7cqw; font-size: 2.2cqw; margin-left: .8cqw; }
      .win__bar > span:not(.sp):not(.chip):not(.btn) { font-size: 2.7cqw; font-weight: 700; }
      .ov { display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.8cqw; }
      .rw { display: flex; gap: 1.4cqw; }
      .sec { display: flex; align-items: center; gap: .9cqw; padding: 1.4cqw 1.6cqw; border-radius: 1.6cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); color: rgb(var(--tint)); white-space: nowrap; }
      .sec b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); }
      .sk { flex: 1; justify-content: flex-start; }
      .sk .chip { font-size: 2.2cqw; padding-inline: 1.3cqw; }
      .fl { margin-left: .3cqw; padding: .6cqw 1cqw; border-radius: 1cqw; background: var(--fill); font-size: 2.1cqw; font-weight: 650; color: var(--ink-2); }
      .ca { padding: 2.2cqw 2.4cqw 2.6cqw; border-radius: 1.8cqw; }
      .ch { display: flex; align-items: center; gap: 1.2cqw; color: rgb(var(--tint)); }
      .ch b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.02em; color: var(--ink); }
      .ch .chip { font-size: 2.2cqw; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4cqw; margin-top: 2cqw; }
      .ag { display: flex; align-items: center; gap: 1.2cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.4cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .ag b { flex: 1; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .ni { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: var(--grad); color: #fff; }
      &.dark {
        .sec { box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); color: #7fe3d6; }
        .fl { background: rgba(255, 255, 255, .1); color: #e8f1f4; }
        .ch { color: #7fe3d6; }
        .ag { background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      }
    `,
  });
})();
