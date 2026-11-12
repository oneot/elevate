/* copilot-studio/golden-time-router — github.io dashboard: map routes and the Top 3 ER ranking board */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const pin = (n, x, y) => `<span class="hp h${n}" style="left:${x}%;top:${y}%">${K.ico('heart_pulse', { s: 2 })}</span>`;
    const row = (n, name, min, bed, on) => `<div class="rk${on ? ' on' : ''}">
      <span class="n">${n}</span>
      <div class="grow"><b>${name}</b><small>${K.ico('vehicle_car', { s: 2.2 })}${min} · 병상 ${bed}</small></div>
    </div>`;
    return K.win({
      x: 30, y: 9.5, w: 66, h: 50, title: '골든타임 라우터', icon: false,
      barRight: K.chip('에이전트 연결됨', { dot: 'var(--green)' }),
      body: `<div class="db">
        <div class="map">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path class="r3" d="M44 58 C 30 70, 22 74, 18 86" />
            <path class="r2" d="M44 58 C 62 54, 74 40, 80 30" />
            <path class="r1" d="M44 58 C 46 40, 34 28, 30 16" />
          </svg>
          ${pin(1, 30, 16)}${pin(2, 80, 30)}${pin(3, 18, 86)}
          <span class="me" style="left:44%;top:58%">${K.ico('location', { s: 2.6 })}</span>
          <span class="lbl">보라매공원</span>
        </div>
        <div class="bd">
          ${row(1, 'A대학병원', '7분', 5, true)}
          ${row(2, 'B종합병원', '11분', 3)}
          ${row(3, 'C의료원', '14분', 2)}
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 16.4, w: 28.5, cls: 'ask',
        body: `${K.bubble('보라매공원,<br>50대 다리골절 노인', { me: true })}
          <div class="bot"><p class="bh">${K.ico('alert_urgent', { s: 2.4 })}이송 추천</p>${K.skel('86%')}${K.skel('60%')}</div>`,
      })
      + K.tile({ x: 26.4, y: 4, s: 10.5 })
      + K.float({ right: 3.4, y: 2.6, s: 6, icon: 'location_ripple' })
      + K.pill({ x: 4, bottom: 3.8, icon: 'trophy', text: '응급실 Top 3 추천' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 3 },
    css: `
      .win__bar { padding-left: 8.4cqw; font-size: 3cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .db { height: 100%; display: flex; gap: 2.4cqw; padding: 2.8cqw 3cqw; }
      .map { position: relative; flex: none; width: 27cqw; height: 36cqw; border-radius: 1.8cqw; overflow: hidden;
        background:
          linear-gradient(90deg, transparent 31%, rgba(255, 255, 255, .13) 31% 33%, transparent 33% 68%, rgba(255, 255, 255, .13) 68% 70%, transparent 70%),
          linear-gradient(0deg, transparent 38%, rgba(255, 255, 255, .13) 38% 40%, transparent 40% 76%, rgba(255, 255, 255, .13) 76% 78%, transparent 78%),
          radial-gradient(circle at 78% 82%, rgba(110, 200, 140, .22) 0 14%, transparent 15%),
          rgba(255, 255, 255, .06);
        box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); }
      .map svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .map path { fill: none; stroke-linecap: round; vector-effect: non-scaling-stroke; }
      .r1 { stroke: rgb(var(--tint)); stroke-width: .75cqw; filter: drop-shadow(0 0 .6cqw rgba(var(--tint), .8)); }
      .r2 { stroke: rgba(255, 255, 255, .5); stroke-width: .45cqw; stroke-dasharray: 1cqw .8cqw; }
      .r3 { stroke: rgba(255, 255, 255, .35); stroke-width: .45cqw; stroke-dasharray: 1cqw .8cqw; }
      .hp { position: absolute; translate: -50% -50%; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%;
        background: rgba(255, 255, 255, .9); color: #e5484d; box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(4, 10, 20, .6); }
      .hp.h1 { width: 5.2cqw; height: 5.2cqw; background: #fff; box-shadow: 0 0 0 .5cqw rgba(var(--tint), .85), 0 .8cqw 2cqw -.6cqw rgba(4, 10, 20, .6); }
      .me { position: absolute; translate: -50% -50%; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%;
        background: var(--grad); color: #fff; box-shadow: 0 0 0 1.2cqw rgba(var(--tint), .25); }
      .lbl { position: absolute; left: 52%; top: 66%; padding: .5cqw 1.2cqw; border-radius: 99px; background: rgba(10, 30, 40, .7);
        font-size: 2.1cqw; font-weight: 700; color: #fff; white-space: nowrap; }
      .bd { flex: 1; display: flex; flex-direction: column; gap: 1.5cqw; }
      .rk { display: flex; align-items: center; gap: 1.5cqw; padding: 1.7cqw 1.8cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      .rk .n { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%;
        background: rgba(255, 255, 255, .14); font-size: 2.5cqw; font-weight: 800; color: var(--ink); }
      .rk b { display: block; font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; }
      .rk small { display: flex; align-items: center; gap: .6cqw; margin-top: .4cqw; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .rk.on { background: rgba(var(--tint), .18); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .55); }
      .rk.on .n { background: var(--grad); color: #fff; }
      .rk.on b { font-size: 3cqw; }
      .rk.on small { color: rgb(var(--tint)); }
      .ask { z-index: 4; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.4cqw; }
      .ask .bubble { max-width: 100%; font-size: 2.4cqw; font-weight: 650; line-height: 1.35; }
      .bot { display: flex; flex-direction: column; gap: 1cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.6cqw 1.6cqw 1.6cqw .6cqw; background: rgba(255, 255, 255, .08); }
      .bh { display: flex; align-items: center; gap: .7cqw; margin-bottom: .3cqw; font-size: 2.3cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .bh .ico { color: #ff8f88; }
      .bot .skel { background: rgba(255, 255, 255, .2); }
    `,
  });
})();
