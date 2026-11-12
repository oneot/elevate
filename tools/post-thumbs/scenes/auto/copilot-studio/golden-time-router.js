/* copilot-studio/golden-time-router — the github.io dashboard: map routes from 보라매공원 to the Top 3 ERs, with the ranking board */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const pin = (n, x, y, on) => `<span class="pin${on ? ' on' : ''}" style="left:${x}cqw;top:${y}cqw"><b>${n}</b></span>`;
    const row = (n, name, min, on) => `<div class="rk${on ? ' on' : ''}"><span class="no">${n}</span>${name ? `<b>${name}</b>` : K.skel(on ? '60%' : '52%')}${min ? `<span class="mi">${min}</span>` : ''}</div>`;
    return K.win({
      x: 33, y: 8.5, w: 64, h: 50, title: '골든타임 라우터', icon: false,
      barRight: K.chip('에이전트 연결됨', { dot: 'var(--green)' }),
      body: `<div class="map">
        <svg class="rd" viewBox="0 0 64 44" preserveAspectRatio="none">
          <path class="road" d="M0 9 H64 M0 22 H64 M0 36 H64 M12 0 V44 M30 0 V44 M50 0 V44 M0 44 L44 0" />
          <path class="alt" d="M27 28 H30 V22 H12 V11" />
          <path class="alt" d="M27 28 H30 V36 H50 V33" />
          <path class="best" d="M27 28 H30 V22 L36 22 L44 14 H48" />
        </svg>
        <span class="me" style="left:27cqw;top:28cqw"></span>
        <span class="lb" style="left:20cqw;top:31.4cqw">${K.ico('location', { s: 2.4 })}보라매공원</span>
        ${pin(2, 12, 11)}${pin(3, 50, 33)}${pin(1, 48, 14, true)}
        <span class="eta" style="left:31cqw;top:13.6cqw">${K.ico('vehicle_car', { s: 2.4 })}9분</span>
      </div>`,
    })
      + K.card({
        x: 4, y: 15, w: 33, cls: 'board',
        body: `<p class="th">${K.ico('trophy', { s: 2.8 })}순위판</p>
          ${row(1, 'A대학병원', '9분', true)}
          ${row(2, '', '14분')}
          ${row(3, '', '17분')}`,
      })
      + K.tile({ x: 28.5, y: 2.6, s: 10.5 })
      + K.float({ right: 2.4, y: 1.8, s: 6.2, app: 'github' })
      + K.pill({ x: 4, bottom: 4.4, icon: 'map', text: '지도로 보는 응급실 Top 3' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 3 },
    css: `
      .win__bar { padding-left: 9cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .map { position: relative; height: 100%; overflow: hidden;
        background: radial-gradient(ellipse at 70% 30%, rgba(var(--tint), .1), transparent 60%), rgba(8, 28, 40, .22); }
      .rd { position: absolute; inset: 0; width: 64cqw; height: 44cqw; }
      .road { fill: none; stroke: rgba(255, 255, 255, .13); stroke-width: 1.2; stroke-linecap: round; }
      .alt { fill: none; stroke: rgba(255, 255, 255, .5); stroke-width: .5; stroke-dasharray: 1.1 .9; stroke-linecap: round; stroke-linejoin: round; }
      .best { fill: none; stroke: rgb(var(--tint)); stroke-width: 1; stroke-linecap: round; stroke-linejoin: round;
        filter: drop-shadow(0 0 .8px rgba(var(--tint), .9)); }
      .me { position: absolute; width: 3cqw; height: 3cqw; translate: -50% -50%; border-radius: 50%; background: #fff;
        box-shadow: inset 0 0 0 .7cqw rgb(var(--tint)), 0 0 0 1.4cqw rgba(var(--tint), .25), 0 0 0 2.8cqw rgba(var(--tint), .1); }
      .lb { position: absolute; display: inline-flex; align-items: center; gap: .6cqw; padding: .7cqw 1.4cqw; border-radius: 99px;
        background: rgba(255, 255, 255, .92); color: #10323c; font-size: 2.4cqw; font-weight: 800; white-space: nowrap; }
      .lb .ico { color: #d1453b; }
      .pin { position: absolute; display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; translate: -50% -100%;
        border-radius: 50% 50% 50% 0; rotate: -45deg; background: rgba(255, 255, 255, .22); box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .45); }
      .pin b { rotate: 45deg; font-size: 2.2cqw; font-weight: 800; color: #fff; }
      .pin.on { width: 5.4cqw; height: 5.4cqw; background: var(--grad); box-shadow: 0 0 2.6cqw rgba(var(--tint), .7), inset 0 0 0 .2cqw rgba(255, 255, 255, .5); }
      .pin.on b { font-size: 2.8cqw; }
      .eta { position: absolute; display: inline-flex; align-items: center; gap: .6cqw; padding: .7cqw 1.4cqw; border-radius: 99px;
        background: var(--grad); color: #fff; font-size: 2.6cqw; font-weight: 800; white-space: nowrap; box-shadow: 0 1cqw 2cqw -1cqw rgba(0, 0, 0, .5); }
      .board { z-index: 4; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.6cqw 2.4cqw; }
      .th { display: flex; align-items: center; gap: .9cqw; margin-bottom: .3cqw; font-size: 2.8cqw; font-weight: 800; color: var(--ink); white-space: nowrap; }
      .th .ico { color: var(--amber); }
      .rk { display: flex; align-items: center; gap: 1.2cqw; padding: 1.1cqw 1.3cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .08); }
      .rk.on { background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .rk .skel { flex: 1; height: 1cqw; background: rgba(255, 255, 255, .22); }
      .no { flex: none; display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 50%; background: rgba(255, 255, 255, .16); font-size: 2.3cqw; font-weight: 800; color: #fff; }
      .rk.on .no { background: var(--grad); }
      .rk b { flex: 1; font-size: 2.7cqw; font-weight: 800; color: var(--ink); white-space: nowrap; }
      .mi { font-size: 2.4cqw; font-weight: 800; color: var(--ink-2); white-space: nowrap; }
      .rk.on .mi { font-size: 2.7cqw; color: rgb(var(--tint)); }
    `,
  });
})();
