/* github/github-copilot-1 — GitHub Copilot App: /plan implementation plan carried out in Autopilot mode */
(() => {
  scene('github/github-copilot-1', (K) => {
    const step = (text, state) => `<div class="st ${state}">${state === 'run' ? `<span class="sp">${K.ico('arrow_sync_circle', { s: 2.9 })}</span>` : '<span class="check on"></span>'}<b>${text}</b>${state === 'run' ? K.skel(8, { tint: true }) : ''}</div>`;
    return K.win({
      right: 3, y: 14, w: 61, h: 45, z: 2, icon: false, title: 'my-portfolio',
      body: `<div class="bd">
        <div class="plan">
          <div class="ph">${K.ico('task_list_ltr', { s: 3 })}<b>구현 계획</b><span class="cmd">/plan</span></div>
          ${step('한 줄 소개', 'done')}
          ${step('관심사와 취미', 'done')}
          ${step('앞으로의 목표', 'run')}
        </div>
        <div class="mode"><span>Interactive</span><span>Plan</span><span class="on">${K.ico('rocket', { s: 2.6 })}Autopilot</span></div>
      </div>`,
    })
      + K.tile({ x: 30.5, y: 8.6, s: 10.5, z: 3 })
      + K.mascot('copilot-down', { right: 5, y: -1.4, w: 23, z: 3 })
      + K.float({ x: 23.5, y: 30, s: 7, icon: 'checkmark_circle' })
      + K.pill({ x: 4, bottom: 5, icon: 'task_list_ltr', text: '계획대로 알아서 구현' });
  }, {
    deco: { big: 'ribbon', v: 3 },
    css: `
      .win__bar { padding-left: 8.5cqw; font-weight: 700; }
      .bd { height: 100%; display: flex; flex-direction: column; gap: 2cqw; padding: 2.4cqw 3cqw; }
      .plan { display: flex; flex-direction: column; gap: .8cqw; padding: 2cqw 2.4cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2), 0 2cqw 4cqw -2.4cqw rgba(var(--tint), .5); }
      .ph { display: flex; align-items: center; gap: 1.2cqw; color: rgb(var(--tint)); margin-bottom: .4cqw; }
      .ph b { font-size: 2.9cqw; font-weight: 750; color: var(--ink); }
      .ph .cmd { margin-left: auto; padding: .5cqw 1.3cqw; border-radius: 99px; background: var(--fill); font-family: var(--mono); font-size: 2.3cqw; font-weight: 700; color: var(--ink-2); }
      .st { display: flex; align-items: center; gap: 1.5cqw; height: 4.4cqw; padding: 0 1.2cqw; border-radius: 1.2cqw; }
      .st b { font-size: 2.6cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .st.run { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 50%, #fff); }
      .st.run b { color: var(--ink); font-weight: 750; }
      .st .sp { display: grid; place-items: center; width: 2.6cqw; color: rgb(var(--tint)); }
      .st .skel { margin-left: auto; }
      .mode { display: flex; gap: .6cqw; align-self: flex-start; padding: .6cqw; border-radius: 99px; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2); }
      .mode span { display: inline-flex; align-items: center; gap: .7cqw; padding: .9cqw 1.8cqw; border-radius: 99px; font-size: 2.4cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .mode .on { background: var(--grad); color: #fff; font-weight: 750; font-size: 2.6cqw; }
    `,
  });
})();
