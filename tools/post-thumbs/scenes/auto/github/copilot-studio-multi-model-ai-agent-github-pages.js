/* github/copilot-studio-multi-model-ai-agent-github-pages — v3: the deployed github.io web app answers each question with a different Child Agent */
(() => {
  scene('github/copilot-studio-multi-model-ai-agent-github-pages', (K) => {
    const ans = (icon, name, on, lines) => `<div class="an${on ? ' on' : ''}">
      <span class="md">${K.ico(icon, { s: on ? 2.8 : 2.4 })}${name}</span>
      ${lines.map((w) => K.skel(w)).join('')}
    </div>`;
    return K.win({
      x: 4, y: 8.5, w: 60, h: 52, z: 2, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}oneot.github.io/ai</span>`,
      body: `<div class="chat">
        <div class="hi">${K.app('copilot-studio', { s: 4 })}<span>안녕하세요! 무엇을 도와드릴까요?</span></div>
        ${K.bubble('가정통신문을 영어로 번역해 줘', { me: true })}
        ${ans('translate', 'CA1-Claude Sonnet5', false, ['30%'])}
        ${K.bubble('범인이 누구인지 검증해 줘', { me: true })}
        ${ans('brain_circuit', 'CA4-GPT-5.6 Reasoning', true, ['94%', '66%'])}
      </div>`,
    })
      + K.tile({ x: 0.8, y: 2.6, s: 10.5 })
      + K.mascot('copilot-34', { x: 49, y: -0.4, w: 16, z: 3, flip: true })
      + K.mascot('ducky-down', { right: 3, bottom: -2.6, w: 25, z: 3, flip: true })
      + K.pill({ right: 3.5, y: 19, icon: 'arrow_routing', text: '질문마다 알맞은 모델' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11.4cqw; }
      .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .url .ico { color: var(--ink-3); }
      .chat { height: 100%; display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.2cqw 3cqw 0; background: linear-gradient(180deg, rgba(246, 243, 254, .75), rgba(255, 255, 255, .5) 70%); }
      .hi { display: flex; align-items: center; gap: 1.2cqw; }
      .hi span { padding: 1.2cqw 1.8cqw; border-radius: 1.8cqw; border-top-left-radius: .5cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .chat .bubble--me { align-self: flex-end; max-width: 100%; font-size: 2.5cqw; white-space: nowrap; }
      .an { align-self: flex-start; width: 46cqw; display: flex; flex-direction: column; gap: 1.1cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); }
      .md { align-self: flex-start; display: inline-flex; align-items: center; gap: .7cqw; padding: .6cqw 1.4cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
      .an:not(.on) { width: auto; flex-direction: row; align-items: center; gap: 1.6cqw; padding: 1.2cqw 1.4cqw; }
      .an:not(.on) .skel { flex: none; width: 10cqw !important; }
      .an.on { box-shadow: 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff), 0 2.4cqw 4.8cqw -2.4cqw rgba(var(--tint), .6); }
      .an.on .md { background: var(--grad); color: #fff; font-size: 2.7cqw; }
    `,
  });
})();
