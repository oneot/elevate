/* github/github-copilot-1 — GitHub Copilot App: the slash-command menu (/init, /plan, /context, /compact) */
(() => {
  scene('github/github-copilot-1', (K) => {
    const cmd = (name, desc, icon, on) => `<div class="cm${on ? ' on' : ''}"><span class="ci">${K.ico(icon, { s: 2.6 })}</span><b>${name}</b><span>${desc}</span></div>`;
    return K.win({
      x: 4, y: 12, w: 60, h: 47, z: 2, icon: false, title: 'my-portfolio',
      barRight: `<span class="df"><i class="ad">+24</i><i class="dl">−6</i></span>${K.btn('Commit', { primary: true, icon: 'checkmark' })}`,
      body: `<div class="ss">
        <div class="msg">${K.skel('62%')}${K.skel('44%')}</div>
        <div class="menu">
          ${cmd('/init', '프로젝트 지침 만들기', 'document_text', false)}
          ${cmd('/plan', '계획 모드로 기획', 'task_list_ltr', true)}
          ${cmd('/compact', '대화 압축하기', 'arrow_minimize', false)}
        </div>
        <div class="inp"><span class="sl">/</span><i class="caret"></i><span class="grow"></span><span class="send">${K.ico('send', { s: 2.4 })}</span></div>
      </div>`,
    })
      + K.tile({ x: 1.2, y: 6.2, s: 10.5, z: 3 })
      + K.mascot('ducky-up', { x: 53, y: 0, w: 16, z: 1, flip: true })
      + K.mascot('copilot-side', { right: 2, bottom: 2.5, w: 27, z: 3, flip: true })
      + K.pill({ right: 4, y: 5, icon: 'code', text: '슬래시 명령어로 척척' });
  }, {
    deco: { big: 'ribbon', v: 2 },
    css: `
      .win__bar { padding-left: 12cqw; font-weight: 700; }
      .win__bar .btn { padding: .9cqw 1.6cqw; font-size: 2.3cqw; }
      .df { display: inline-flex; gap: .9cqw; margin-right: 1.2cqw; padding: .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-family: var(--mono); font-size: 2.2cqw; font-weight: 700; }
      .df i { font-style: normal; }
      .df .ad { color: var(--green); }
      .df .dl { color: var(--red); }
      .ss { height: 100%; display: flex; flex-direction: column; gap: 2cqw; padding: 2.6cqw 3cqw; }
      .msg { display: flex; flex-direction: column; gap: 1.3cqw; }
      .menu { display: flex; flex-direction: column; gap: .6cqw; padding: 1cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2), 0 2cqw 4cqw -2.4cqw rgba(var(--tint), .5); }
      .cm { display: flex; align-items: center; gap: 1.4cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.2cqw; }
      .cm .ci { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.1cqw; background: var(--fill); color: var(--ink-3); }
      .cm b { width: 14cqw; font-family: var(--mono); font-size: 2.7cqw; font-weight: 700; color: var(--ink); }
      .cm span:last-child { font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .cm.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .cm.on .ci { background: var(--grad); color: #fff; }
      .cm.on b { color: rgb(var(--tint)); }
      .cm.on span:last-child { color: var(--ink); font-weight: 700; }
      .inp { display: flex; align-items: center; gap: .4cqw; height: 6cqw; padding: 0 1cqw 0 2cqw; border-radius: 1.6cqw; background: #fff; box-shadow: 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .sl { font-family: var(--mono); font-size: 3cqw; font-weight: 700; color: rgb(var(--tint)); }
      .caret { width: .25cqw; height: 3cqw; background: var(--ink); }
      .inp .send { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 99px; background: var(--grad); color: #fff; }
    `,
  });
})();
