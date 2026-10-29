/* copilot-studio/copilotstudio — Preview activity trace: skills and connected agents in order, deliver-files last with 5 files attached */
(() => {
  scene('copilot-studio/copilotstudio', (K) => {
    const step = (kind, name, extra = '', cls = '') => `<div class="st ${kind} ${cls}">
      <span class="dt"></span>
      <span class="ni">${K.ico(kind === 'sk' ? 'puzzle_piece' : 'bot', { s: 2.7 })}</span>
      <b>${name}</b><span class="sp"></span>${extra}
    </div>`;
    const ok = K.ico('checkmark_circle', { s: 2.6, cls: 'ck' });
    const fi = (inner, bg) => `<span class="fi" style="--bg:${bg}">${inner}</span>`;
    return K.win({
      x: 33, y: 10.5, w: 63, h: 50, title: 'AI Creative Agent Team', sub: ' · 활동 기록', icon: false,
      body: `<div class="tr">
        ${step('sk', 'write-brief', ok)}
        ${step('ag', 'budget-agent', ok)}
        ${step('ag', 'ppt-agent 외 3개', ok)}
        ${step('sk', 'liquid-glass-design', ok)}
        ${step('sk', 'deliver-files', `<span class="dn">${K.ico('attach', { s: 2.4 })}5/5 첨부됨</span>`, 'on')}
      </div>`,
    })
      + K.card({
        x: 3.5, y: 26, w: 32, cls: 'fl',
        body: `<p class="fh">${K.ico('attach', { s: 2.6 })}파일 5개</p>
          <div class="fs">
            ${fi(K.app('powerpoint', { s: 4 }), 'rgba(255, 128, 92, .2)')}
            ${fi(K.ico('image', { s: 3.6, c: '#ff8fc8' }), 'rgba(255, 122, 184, .2)')}
            ${fi(K.app('word', { s: 4 }), 'rgba(90, 162, 255, .2)')}
            ${fi(K.ico('globe', { s: 3.6, c: '#8cc4ff' }), 'rgba(90, 162, 255, .18)')}
            ${fi(K.app('excel', { s: 4 }), 'rgba(63, 214, 143, .2)')}
          </div>`,
      })
      + K.tile({ x: 29.8, y: 3.8, s: 10.5 })
      + K.float({ x: 13, bottom: 4, s: 6.4, icon: 'arrow_download' })
      + K.pill({ right: 4, y: 3.4, icon: 'people_team', text: '원고는 전문가, 파일은 팀장' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 3 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.7cqw; font-weight: 700; }
      .tr { position: relative; display: flex; flex-direction: column; gap: 1.1cqw; padding: 2.6cqw 3cqw; }
      .tr::before { content: ''; position: absolute; left: 4.6cqw; top: 5cqw; bottom: 5cqw; width: .3cqw; border-radius: 1cqw; background: var(--line-2); }
      .st { position: relative; display: flex; align-items: center; gap: 1.4cqw; height: 5.3cqw; padding: 0 1.6cqw 0 4.4cqw; border-radius: 1.4cqw; }
      .dt { position: absolute; left: .85cqw; top: 50%; width: 1.5cqw; height: 1.5cqw; translate: 0 -50%; border-radius: 50%; background: rgb(var(--tint)); box-shadow: 0 0 0 .35cqw rgba(var(--tint), .25); }
      .ni { flex: none; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 1.1cqw; background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); color: rgb(var(--tint)); }
      .ag .ni { background: rgba(124, 97, 230, .16); color: #7b61c9; }
      .st b { font-family: var(--mono); font-size: 2.5cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .sp { flex: 1; }
      .ck { color: #23a868; }
      .st.on { background: rgba(var(--tint), .12); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .st.on b { font-size: 2.8cqw; }
      .dn { display: inline-flex; align-items: center; gap: .6cqw; padding: .7cqw 1.4cqw; border-radius: 99px; background: var(--grad); color: #fff; font-size: 2.4cqw; font-weight: 750; white-space: nowrap; }
      .fl { z-index: 3; padding: 2.4cqw 2.6cqw 2.8cqw; }
      .fh { display: flex; align-items: center; gap: .8cqw; font-size: 2.7cqw; font-weight: 750; white-space: nowrap; }
      .fh .ico { color: rgb(var(--tint)); }
      .fs { display: grid; grid-template-columns: repeat(5, 1fr); gap: .8cqw; margin-top: 1.8cqw; }
      .fi { display: grid; place-items: center; aspect-ratio: 1; border-radius: 1.2cqw; background: var(--bg); }
      &.dark {
        .tr::before { background: rgba(255, 255, 255, .18); }
        .ni { background: rgba(var(--tint), .2); color: #6fe6d4; }
        .ag .ni { background: rgba(160, 138, 255, .22); color: #c3b5ff; }
        .ck { color: #7ef0b6; }
        .dt { background: #6fe6d4; box-shadow: 0 0 0 .35cqw rgba(111, 230, 212, .22); }
        .st.on { background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .3cqw #4fd6c4; }
        .fh .ico { color: #6fe6d4; }
      }
    `,
  });
})();
