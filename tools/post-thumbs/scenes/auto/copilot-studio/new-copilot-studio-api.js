/* copilot-studio/new-copilot-studio-api — HTTP action URI with tm · stn swapped for workflow inputs */
(() => {
  const geo = (stage) => {
    const b = stage.getBoundingClientRect();
    const k = 100 / b.width;
    return (sel) => {
      const r = stage.querySelector(sel).getBoundingClientRect();
      const l = (r.left - b.left) * k, t = (r.top - b.top) * k, w = r.width * k, h = r.height * k;
      return { l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 };
    };
  };

  scene('copilot-studio/new-copilot-studio-api', (K) => {
    const tok = (name, cls) => `<span class="tk ${cls}">${K.ico('flash', { s: 2.4 })}${name}</span>`;
    const item = (name, on) => `<div class="it${on ? ' on' : ''}">${K.ico('number_symbol', { s: 2.6 })}<b>${name}</b>${K.skel(on ? '9cqw' : '7cqw')}</div>`;
    return K.win({
      x: 36, y: 9, w: 61, h: 52, title: 'HTTP', icon: false,
      barRight: K.chip('GET', { solid: true }),
      body: `<div class="hb">
        <p class="lb">URI</p>
        <div class="uri">
          <code class="u1">apihub.kma.go.kr/…/kma_sfctm2.php?tm=</code>
          <div class="u2">${tok('tm', 'k1')}<code>&amp;stn=</code>${tok('stn', 'k2')}<code class="dim">&amp;help=1</code></div>
          ${K.skel('62%', { h: 1.6 })}
        </div>
        <div class="rs">${K.ico('arrow_reply', { s: 2.8 })}<b>Respond to the agent</b><span class="sp"></span>${K.chip('Body', { icon: 'flash', tint: true })}</div>
      </div>`,
    })
      + K.card({
        x: 4, y: 17, w: 27, cls: 'dc',
        body: `<p class="dh">${K.ico('flash', { s: 2.8 })}동적 콘텐츠</p>
          ${item('tm', true)}${item('stn')}`,
      })
      + '<div class="links"></div>'
      + K.tile({ x: 31.6, y: 4.2, s: 10.5 })
      + K.float({ x: 7, y: 4.4, s: 7, icon: 'weather_partly_cloudy_day' })
      + K.pill({ x: 4, bottom: 5, icon: 'globe', text: '질문대로 API 호출' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8.6cqw; font-size: 3cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.3cqw; font-weight: 700; padding: .8cqw 1.8cqw; }
      .hb { display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.8cqw 3.2cqw; }
      .lb { font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .uri { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.2cqw 2.4cqw 2.4cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .5); }
      .uri code { font-family: var(--mono); white-space: nowrap; }
      .u1 { font-size: 2.1cqw; color: var(--ink-3); }
      .u2 { display: flex; align-items: center; gap: .8cqw; }
      .u2 code { font-size: 3cqw; font-weight: 600; color: var(--ink); }
      .u2 code.dim { font-size: 2.1cqw; font-weight: 500; color: var(--ink-3); }
      .tk { display: inline-flex; align-items: center; gap: .5cqw; padding: .7cqw 1.5cqw .7cqw 1.1cqw; border-radius: 1cqw;
        background: var(--grad); color: #fff; font-size: 2.9cqw; font-weight: 750; white-space: nowrap;
        box-shadow: inset 0 .15cqw 0 rgba(255, 255, 255, .3), 0 1cqw 2cqw -1cqw rgba(4, 10, 20, .5); }
      .rs { display: flex; align-items: center; gap: 1.2cqw; margin-top: 1.4cqw; padding: 1.6cqw 2.2cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); color: rgb(var(--tint)); }
      .rs b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .rs .sp { flex: 1; }
      .rs .chip { font-size: 2.3cqw; font-weight: 700; }
      .dc { z-index: 4; display: flex; flex-direction: column; gap: 1.2cqw; padding: 2.4cqw 2.4cqw 2.6cqw; }
      .dh { display: flex; align-items: center; gap: .8cqw; margin-bottom: .4cqw; font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .dh .ico { color: #ffd257; }
      .it { display: flex; align-items: center; gap: 1.1cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.2cqw; color: var(--ink-3); }
      .it b { font-family: var(--mono); font-size: 2.7cqw; font-weight: 700; color: var(--ink); min-width: 5.4cqw; }
      .it.on { background: rgba(var(--tint), .18); box-shadow: inset 0 0 0 .22cqw rgba(var(--tint), .7); color: rgb(var(--tint)); }
    `,
    after(stage, K) {
      const g = geo(stage);
      const a = g('.it.on');
      const t = g('.k1');
      const c = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r + 0.4, a.cy, t.l - 0.8, t.cy, { c, dot: true, dash: true }), { z: 5 });
    },
  });
})();
