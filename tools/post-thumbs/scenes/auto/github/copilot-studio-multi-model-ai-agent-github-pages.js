/* github/copilot-studio-multi-model-ai-agent-github-pages — v3: Connected agents of the parent agent + Preview routing */
(() => {
  scene('github/copilot-studio-multi-model-ai-agent-github-pages', (K) => {
    const row = (icon, name, role, on) => `<div class="ag${on ? ' hl' : ''}">
      <span class="ai">${K.ico(icon, { s: 2.7 })}</span>
      <div class="grow"><b>${name}</b><small>${role}</small></div>
      <span class="toggle on"></span>
    </div>`;
    return K.win({
      x: 4, y: 9, w: 62, h: 50, icon: false, title: 'Multi Model AI Agent',
      barRight: K.btn('Publish', { primary: true, icon: 'cloud_arrow_up' }),
      body: `<div class="ca">
        <p class="hd">${K.ico('plug_connected', { s: 2.8 })}Connected agents</p>
        ${row('translate', 'CA1-Claude Sonnet5', '번역 · 요약 · 이메일')}
        ${row('slide_text', 'CA2-Claude Opus5', 'PPT 제작 · 장문 분석')}
        ${row('lightbulb', 'CA3-GPT-5.5 Chat', '대화 · 브레인스토밍')}
        ${row('brain_circuit', 'CA4-GPT-5.6 Reasoning', '추론 · 수학 · 코딩 검증', true)}
      </div>`,
    })
      + K.card({
        x: 64, y: 16.5, w: 31.5, cls: 'pv',
        body: `<p class="ph">${K.ico('play', { s: 2.4 })}Preview</p>
          ${K.bubble('범인이 누구인지 검증해 줘', { me: true })}
          <div class="ans">${K.skel('92%')}${K.skel('70%')}
            <span class="rt">${K.ico('brain_circuit', { s: 2.4 })}CA4가 답변</span></div>`,
      })
      + K.tile({ x: 0.8, y: 3.2, s: 11, app: 'copilot-studio' })
      + '<div class="links"></div>'
      + K.float({ right: 4, bottom: 2.4, app: 'github', s: 6.8 })
      + K.pill({ right: 4, y: 6, icon: 'arrow_routing', text: '역할 나눠 답하는 AI' });
  }, {
    deco: { v: 0, items: [['sphere', { x: 50, y: 1.2, w: 6.4, far: true }], ['ribbon', { right: -12, bottom: -9, w: 58 }]] },
    css: `
      .win__bar { padding-left: 12.4cqw; }
      .win__bar .btn { padding: 1cqw 1.8cqw; font-size: 2.3cqw; }
      .ca { display: flex; flex-direction: column; gap: 1.1cqw; padding: 2.2cqw 3cqw 0; }
      .hd { display: flex; align-items: center; gap: 1cqw; margin-bottom: .6cqw; font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.02em; color: var(--ink); }
      .hd .ico { color: rgb(var(--tint)); }
      .ag { display: flex; align-items: center; gap: 1.6cqw; height: 6.8cqw; padding: 0 1.8cqw 0 1.2cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .78); box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .05); }
      .ai { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .ag b { display: block; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.015em; color: var(--ink); white-space: nowrap; }
      .ag small { display: block; margin-top: .1cqw; font-size: 2.05cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .ag.hl { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); }
      .ag.hl .ai { background: var(--grad); color: #fff; }
      .pv { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.4cqw 2.6cqw 2.6cqw; }
      .ph { display: flex; align-items: center; gap: .9cqw; font-size: 2.4cqw; font-weight: 700; color: var(--ink-2); }
      .ph .ico { color: rgb(var(--tint)); }
      .pv .bubble--me { align-self: flex-end; max-width: 100%; font-size: 2.3cqw; white-space: nowrap; }
      .ans { display: flex; flex-direction: column; gap: 1.2cqw; padding: 1.8cqw; border-radius: 1.4cqw; background: var(--fill); }
      .rt { align-self: flex-start; display: inline-flex; align-items: center; gap: .7cqw; margin-top: .4cqw; padding: .7cqw 1.4cqw; border-radius: 99px; background: var(--grad); color: #fff; font-size: 2.2cqw; font-weight: 700; white-space: nowrap; }
    `,
    after(stage, K) {
      const b = stage.getBoundingClientRect();
      const k = 100 / b.width;
      const g = (sel) => {
        const r = stage.querySelector(sel).getBoundingClientRect();
        return { l: (r.left - b.left) * k, r: (r.right - b.left) * k, cy: ((r.top + r.bottom) / 2 - b.top) * k };
      };
      const c = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      const a = g('.ag.hl .toggle');
      const t = g('.rt');
      stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r + 1.2, a.cy, t.l - 0.8, t.cy, { c, w: 0.5, dot: true }), { z: 4 });
    },
  });
})();
