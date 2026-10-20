/* m365/test2 — Copilot Studio Preview: one request returns 5 attached file cards */
(() => {
  scene('m365/test2', (K) => {
    const rows = [
      [['powerpoint', 'presentation.pptx'], ['excel', 'budget_analysis.xlsx']],
      [['word', 'proposal.docx'], ['ico:image', 'poster.html'], ['ico:globe', 'webpage.html']],
    ];
    const fc = (r) => r.map(([a, n]) => `<div class="fc">
      <span class="fi">${a.startsWith('ico:') ? K.ico(a.slice(4), { s: 3.4, c: 'rgb(var(--tint))' }) : K.app(a, { s: 4 })}</span>
      <b>${n}</b>
    </div>`).join('');
    return K.win({
      x: 15, y: 10, w: 90, h: 50, icon: 'copilot-studio', title: 'AI Creative Agent Team', sub: ' · 미리보기',
      body: `<div class="pv">
        ${K.bubble("'AI 크리에이터 캠프' 행사 자료를 만들어 줘", { me: true })}
        <div class="row hd">
          <span class="ba">${K.ico('bot_sparkle', { s: 3, c: '#fff' })}</span>
          <b>파일 5개를 첨부했습니다</b>${K.chip('5/5 첨부됨', { dot: 'var(--green)' })}
        </div>
        <div class="files">${rows.map((r) => `<div class="fr">${fc(r)}</div>`).join('')}</div>
      </div>`,
    })
      + K.pill({ x: 4, y: 3.6, icon: 'attach', text: '요청 한 번에 파일 5개', dark: true });
  }, {
    css: `
      .pv { display: flex; flex-direction: column; gap: 2.4cqw; padding: 3cqw 3cqw 0 3.2cqw; }
      .bubble--me { margin-right: 9cqw; font-size: 2.4cqw; font-weight: 600; }
      .ba { flex: none; display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 50%; background: var(--grad); }
      .hd { gap: 1.6cqw; align-items: center; }
      .hd b { font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; }
      .hd .chip { margin-left: .4cqw; padding: .6cqw 1.3cqw; font-size: 1.95cqw; }
      .files { display: flex; flex-direction: column; gap: 1.5cqw; margin-top: -.4cqw; }
      .fr { display: flex; flex-wrap: nowrap; gap: 1.5cqw; }
      .fc { flex: none; display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 2cqw 1.2cqw 1.2cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .92); box-shadow: inset 0 0 0 .15cqw rgba(20, 22, 30, .07), 0 .9cqw 2cqw -1.2cqw rgba(20, 22, 30, .25); }
      .fc b { flex: 1; min-width: 0; font-size: 2.2cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
      .fi { flex: none; display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
    `,
  });
})();
