/* copilot-studio/copilotstudio — Preview activity trace: skills and connected agents called in order, files attached */
(() => {
  scene('copilot-studio/copilotstudio', (K) => {
    const step = (kind, name, extra = '', cls = '') => `<div class="st ${cls}">
      <span class="dt"></span>
      <span class="ni ${kind}">${K.ico(kind === 'ag' ? 'bot' : 'puzzle_piece', { s: 2.7 })}</span>
      <b>${name}</b><span class="sp"></span>${extra}
    </div>`;
    return K.win({
      x: 5, y: 9.5, w: 63, h: 52, title: 'AI Creative Agent Team', sub: ' · 활동 기록', icon: false,
      body: `<div class="tr">
        ${step('sk', 'write-brief')}
        ${step('ag', 'budget-agent', K.chip('먼저', { dot: 'var(--amber)' }))}
        ${step('ag', 'ppt-agent 외 3개', K.skel('8cqw'))}
        ${step('sk', 'liquid-glass-design')}
        ${step('sk', 'make- 스킬 5개', K.skel('8cqw'))}
        ${step('sk', 'deliver-files', K.chip('5개 첨부됨', { icon: 'checkmark_circle', cls: 'ok' }), 'on')}
      </div>`,
    })
      + K.tile({ x: 1.6, y: 4.4, s: 10.5 })
      + K.float({ x: 73, y: 22, s: 7.2, app: 'powerpoint' })
      + K.float({ x: 86.5, y: 27.5, s: 5.4, app: 'excel', far: true })
      + K.pill({ right: 4.5, y: 9, icon: 'people_team', text: '요청 한 번, 파일 5개' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 11.2cqw; font-size: 2.7cqw; font-weight: 700; }
      .tr { position: relative; display: flex; flex-direction: column; gap: .7cqw; padding: 2.2cqw 3cqw; }
      .tr::before { content: ''; position: absolute; left: 3.85cqw; top: 4.4cqw; bottom: 0; width: .25cqw; background: rgba(255, 255, 255, .2); }
      .st { position: relative; display: flex; align-items: center; gap: 1.4cqw; height: 5.1cqw; padding: 0 1.6cqw 0 0; border-radius: 1.6cqw; }
      .dt { flex: none; width: 1.9cqw; height: 1.9cqw; margin-right: .6cqw; border-radius: 50%; background: var(--grad); box-shadow: 0 0 0 .45cqw rgba(14, 40, 54, .5); }
      .ni { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.2cqw; background: rgba(var(--tint), .18); color: rgb(var(--tint)); }
      .ni.ag { background: rgba(225, 87, 190, .2); color: #ff9ade; }
      .st b { font-family: var(--mono); font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
      .st .sp { flex: 1; }
      .st .chip { font-size: 2.2cqw; font-weight: 700; }
      .st.on { margin-left: -1.2cqw; padding-left: 1.2cqw; background: rgba(var(--tint), .14); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .5); }
      .st.on { height: 5.8cqw; margin-top: .5cqw; }
      .st.on b { font-size: 2.9cqw; }
      .st.on .chip { font-size: 2.4cqw; }
      .ok { background: rgba(63, 214, 143, .2); color: #7ef0b6; }
      .ok .ico { color: #7ef0b6; }
    `,
  });
})();
