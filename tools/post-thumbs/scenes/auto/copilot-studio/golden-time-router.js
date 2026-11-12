/* copilot-studio/golden-time-router — my github.io dashboard: the agent's top-3 ERs on the map and the ranking board */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const row = (n, name, meta, cls = '') => `<div class="rk ${cls}"><span class="no">${n}</span><div class="nm"><b>${name}</b>${meta}</div></div>`;
    const pin = (x, y, cls) => `<span class="pn ${cls}" style="left:${x}cqw;top:${y}cqw">${K.ico('heart_pulse', { s: 2.2 })}</span>`;
    return K.win({
      x: 4, y: 9.5, w: 66, h: 50, title: '골든타임 라우터', icon: false,
      barRight: K.chip('에이전트 연결됨', { dot: 'var(--green)' }),
      body: `<div class="db">
        <div class="mp">
          <svg viewBox="0 0 36 44" preserveAspectRatio="none">
            <path class="rv" d="M-2 8 C 8 12, 16 4, 38 9" />
            <path class="rd" d="M0 20 H36 M0 33 H36 M10 0 V44 M24 0 V44 M0 42 L36 14" />
            <path class="rt" d="M9 28.5 C 9 20, 18 22, 24 15.5" />
            <path class="rt2" d="M9 28.5 C 16 30, 22 34, 27.5 31.5" />
          </svg>
          ${pin(21.8, 11.2, 'on')}${pin(25.4, 27.6, '')}${pin(4.6, 6.4, '')}
          <span class="st" style="left:6.4cqw;top:25.6cqw">${K.ico('location', { s: 2.6 })}</span>
          <span class="lb" style="left:3cqw;top:30.4cqw">보라매공원</span>
        </div>
        <div class="bd">
          <p class="hd">${K.ico('vehicle_car', { s: 2.8 })}이송 추천</p>
          ${row(1, 'A대학병원', `<div class="mt">${K.chip('9분', { solid: true })}${K.chip('병상 4', { tint: true })}</div>`, 'on')}
          ${row(2, 'B병원', K.skel('70%'))}
          ${row(3, 'C의료원', K.skel('54%'))}
        </div>
      </div>`,
    })
      + K.card({
        right: 3.6, y: 30, w: 26.5, cls: 'ask',
        body: `${K.bubble('보라매공원, 50대 다리골절 노인', { me: true })}`,
      })
      + K.tile({ x: 0.6, y: 3.4, s: 10.5 })
      + K.float({ x: 71.5, y: 21, s: 5.6, icon: 'bed', far: true })
      + K.pill({ right: 4, y: 5, icon: 'heart_pulse', text: '응급실 Top 3 바로 추천' });
  }, {
    deco: { big: 'sphere', small: 'ribbon', v: 0 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .db { height: 100%; display: flex; gap: 2.6cqw; padding: 2.6cqw 2.8cqw 0; }
      .mp { position: relative; flex: none; width: 36cqw; height: 44cqw; border-radius: 1.8cqw; overflow: hidden;
        background: linear-gradient(160deg, rgba(255, 255, 255, .13), rgba(255, 255, 255, .05)); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      .mp svg { position: absolute; inset: 0; width: 36cqw; height: 44cqw; }
      .rv { fill: none; stroke: rgba(110, 190, 255, .32); stroke-width: 3.4; }
      .rd { fill: none; stroke: rgba(255, 255, 255, .16); stroke-width: .7; }
      .rt { fill: none; stroke: rgb(var(--tint)); stroke-width: .9; stroke-linecap: round; }
      .rt2 { fill: none; stroke: rgba(255, 255, 255, .45); stroke-width: .6; stroke-dasharray: 1.2 1; }
      .pn { position: absolute; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50% 50% .4cqw 50%; rotate: 45deg;
        background: rgba(255, 255, 255, .2); color: #fff; box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .3); }
      .pn .ico { rotate: -45deg; }
      .pn.on { background: var(--grad); box-shadow: 0 0 0 1.2cqw rgba(var(--tint), .22), 0 1cqw 2.4cqw -.8cqw rgba(4, 10, 20, .5); }
      .st { position: absolute; display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 50%; background: #fff; color: #e5484d;
        box-shadow: 0 0 0 1.2cqw rgba(255, 255, 255, .18); }
      .lb { position: absolute; padding: .5cqw 1.2cqw; border-radius: 99px; background: rgba(12, 30, 40, .7); font-size: 2.2cqw; font-weight: 700; color: #fff; white-space: nowrap; }
      .bd { flex: 1; display: flex; flex-direction: column; gap: 1.5cqw; }
      .hd { display: flex; align-items: center; gap: 1cqw; margin-bottom: .3cqw; font-size: 2.8cqw; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
      .hd .ico { color: rgb(var(--tint)); }
      .rk { display: flex; align-items: center; gap: 1.3cqw; padding: 1.3cqw 1.4cqw; border-radius: 1.5cqw; background: rgba(255, 255, 255, .07);
        box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .12); }
      .rk.on { padding: 1.6cqw 1.4cqw; background: rgba(var(--tint), .14); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -.8cqw rgba(var(--tint), .6); }
      .no { flex: none; display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 50%; background: rgba(255, 255, 255, .14); font-size: 2.2cqw; font-weight: 800; color: var(--ink); }
      .rk.on .no { background: var(--grad); color: #fff; }
      .nm { flex: 1; display: flex; flex-direction: column; gap: .8cqw; }
      .nm b { font-size: 2.5cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; color: var(--ink); }
      .rk.on .nm b { font-size: 2.8cqw; }
      .nm .skel { height: 1cqw; }
      .mt { display: flex; gap: .8cqw; }
      .mt .chip { font-size: 2.1cqw; font-weight: 750; padding: .6cqw 1.3cqw; }
      .ask { z-index: 3; padding: 2.2cqw; }
      .ask .bubble { max-width: 100%; font-size: 2.4cqw; font-weight: 650; line-height: 1.35; }
    `,
  });
})();
