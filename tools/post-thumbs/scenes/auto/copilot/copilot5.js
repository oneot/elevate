/* copilot/copilot5 — Edge split view: English article on the left, Copilot summarises it at CEFR B2 inside the learning loop. */
(() => {
  scene('copilot/copilot5', (K) => {
    const lv = ['A2', 'B1', 'B2', 'C1'];
    const steps = [['Read', 'done'], ['Summarize', 'on'], ['Compose', ''], ['Quiz', '']];
    return K.win({
      x: 31, y: 7.5, w: 65, h: 52, icon: false, title: 'Microsoft Edge',
      barRight: `<span class="cpb">${K.app('copilot', { s: 3 })}</span>`,
      body: `<div class="split">
        <div class="art">
          <p class="en">Why Curiosity Matters</p>
          ${K.skel('94%')}${K.skel('82%')}${K.skel('90%')}${K.skel('64%')}${K.skel('86%')}${K.skel('72%')}${K.skel('90%')}${K.skel('54%')}
        </div>
        <div class="pane">
          ${K.bubble('왼쪽 페이지를 B2로 요약해 줘', { me: true })}
          <div class="lv">${lv.map((t) => `<span class="${t === 'B2' ? 'on' : ''}">${t}</span>`).join('')}</div>
          <div class="sum hl">
            <b>${K.ico('sparkle', { s: 2.4 })}B2 요약</b>
            <p class="out">Curiosity led to success.</p>
            ${K.skel('92%')}${K.skel('60%')}
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 12, w: 29, cls: 'loop', body: `
          <p class="lh">${K.ico('arrow_repeat_all', { s: 2.6, c: 'rgb(var(--tint))' })}영어 학습 루틴</p>
          ${steps.map(([t, s]) => `<div class="st ${s}"><i>${s === 'done' ? K.ico('checkmark', { s: 1.9 }) : ''}</i>${t}</div>`).join('')}`,
      })
      + K.tile({ x: 26.4, y: 2.4, s: 10.5 })
      + K.float({ x: 6, y: 3.6, icon: 'local_language', s: 6, far: true })
      + K.pill({ x: 4, bottom: 3.4, icon: 'translate', text: '수준 맞춤 영어 요약' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8.6cqw; padding-right: 1.8cqw; }
      .cpb { display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .split { display: flex; height: 100%; }
      .art { flex: none; width: 23.6cqw; display: flex; flex-direction: column; gap: 1.5cqw; padding: 3cqw 2.6cqw 0 3cqw; background: rgba(246, 247, 250, .75); }
      .en { margin-bottom: .6cqw; font-size: 2.6cqw; font-weight: 750; letter-spacing: -0.02em; line-height: 1.25; }
      .pane { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2cqw; padding: 3cqw 3cqw 0 2.8cqw; border-left: .2cqw solid #eceef2; }
      .pane .bubble { align-self: flex-end; max-width: 100%; font-size: 2.3cqw; white-space: nowrap; }
      .lv { display: flex; gap: .4cqw; padding: .5cqw; border-radius: 1.5cqw; background: #f1f2f6; }
      .lv span { flex: 1; text-align: center; padding: .9cqw 0; border-radius: 1.1cqw; font-size: 2.4cqw; font-weight: 700; color: var(--ink-4); }
      .lv .on { background: var(--grad); color: #fff; box-shadow: 0 .8cqw 1.8cqw -.8cqw rgba(var(--tint), .9); }
      .sum { display: flex; flex-direction: column; gap: 1.3cqw; padding: 2cqw 2.2cqw 2.4cqw; border-radius: 1.6cqw; background: #fff; }
      .sum b { display: flex; align-items: center; gap: .8cqw; margin-bottom: .3cqw; font-size: 2.6cqw; font-weight: 750; color: rgb(var(--tint)); }
      .out { font-size: 2.3cqw; font-weight: 650; color: var(--ink); white-space: nowrap; letter-spacing: -0.01em; }
      .pill { z-index: 4; }
      .loop { z-index: 3; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.6cqw 2.6cqw 2.8cqw; }
      .lh { display: flex; align-items: center; gap: 1cqw; margin-bottom: .4cqw; font-size: 2.6cqw; font-weight: 750; white-space: nowrap; }
      .st { display: flex; align-items: center; gap: 1.3cqw; height: 4.4cqw; padding: 0 1.4cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-3); }
      .st i { flex: none; display: grid; place-items: center; width: 2.8cqw; height: 2.8cqw; border-radius: 50%; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
      .st.done { color: var(--ink-2); }
      .st.done i { background: var(--green); box-shadow: none; color: #fff; }
      .st.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); font-weight: 750; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .st.on i { background: var(--grad); box-shadow: none; }
    `,
  });
})();
