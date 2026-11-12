/* copilot-studio/golden-time-router — the github.io dashboard: map routes from 보라매공원 and the Top 3 이송 추천 board */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const row = (n, name, min, on) => `<div class="rk ${on ? 'on' : ''}">
        <span class="no">${n}</span>
        <div class="nm"><b>${name}</b>${K.skel(on ? '78%' : '62%')}</div>
        <span class="mi">${K.ico('vehicle_car', { s: 2.4 })}${min}</span>
      </div>`;
    // map: start pin at (24, 58)%, three ER markers; routes drawn in the map's own 0–100 box
    const map = `<div class="mp">
        <svg class="rt" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path class="r3" d="M24 58 C 30 84, 52 92, 70 86"/>
          <path class="r2" d="M24 58 C 18 34, 30 20, 46 16"/>
          <path class="r1" d="M24 58 C 42 58, 58 46, 78 40"/>
        </svg>
        <span class="mk m1" style="left:78%;top:40%">1</span>
        <span class="mk m2" style="left:46%;top:16%"></span>
        <span class="mk m3" style="left:70%;top:86%"></span>
        <span class="st" style="left:24%;top:58%">${K.ico('location', { s: 3.2 })}</span>
        <span class="sl">보라매공원</span>
      </div>`;
    return K.win({
      right: 2.5, y: 8.5, w: 65, h: 51, title: '골든타임 라우터', icon: false,
      barRight: K.chip('에이전트 연결됨', { dot: 'var(--green)' }),
      body: `<div class="db">${map}
        <div class="bd">
          <p class="bh">${K.ico('trophy', { s: 2.8 })}이송 추천</p>
          ${row(1, 'A대학병원', '9분', true)}
          ${row(2, 'B병원', '13분')}
          ${row(3, 'C의료원', '16분')}
        </div>
      </div>`,
    })
      + K.card({
        x: 3.5, y: 16.5, w: 30.5, cls: 'ask',
        body: `${K.bubble('보라매공원,\n50대 다리골절 노인', { me: true })}${K.skel('54%')}`,
      })
      + K.tile({ x: 27, y: 3, s: 10.5 })
      + K.float({ x: 6, y: 5.5, s: 6.4, icon: 'heart_pulse', far: true })
      + K.pill({ x: 2.5, bottom: 5, icon: 'location', text: '응급실 Top 3 바로 추천' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .db { height: 100%; display: flex; gap: 2.4cqw; padding: 2.6cqw 2.8cqw 0; }
      .mp { position: relative; flex: 1.15; height: 100%; border-radius: 2cqw 2cqw 0 0; overflow: hidden;
        background:
          linear-gradient(118deg, transparent 58%, rgba(90, 170, 220, .22) 58%, rgba(90, 170, 220, .22) 66%, transparent 66%),
          repeating-linear-gradient(90deg, transparent 0 6.6cqw, rgba(255, 255, 255, .1) 6.6cqw 6.9cqw),
          repeating-linear-gradient(0deg, transparent 0 5.4cqw, rgba(255, 255, 255, .1) 5.4cqw 5.7cqw),
          rgba(255, 255, 255, .06);
        box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      .rt { position: absolute; inset: 0; width: 100%; height: 100%; }
      .rt path { fill: none; stroke-linecap: round; vector-effect: non-scaling-stroke; }
      .rt .r1 { stroke: rgb(var(--tint)); stroke-width: .75cqw; filter: drop-shadow(0 0 .8cqw rgba(var(--tint), .7)); }
      .rt .r2, .rt .r3 { stroke: rgba(255, 255, 255, .5); stroke-width: .4cqw; stroke-dasharray: 1.2cqw 1cqw; }
      .mk { position: absolute; translate: -50% -50%; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%;
        font-size: 2.5cqw; font-weight: 800; color: #fff; background: rgba(255, 255, 255, .26); box-shadow: 0 0 0 .3cqw rgba(255, 255, 255, .5); }
      .mk.m2, .mk.m3 { width: 2.8cqw; height: 2.8cqw; background: rgba(255, 255, 255, .7); box-shadow: 0 0 0 .7cqw rgba(255, 255, 255, .2); }
      .mk.m1 { width: 5.6cqw; height: 5.6cqw; font-size: 3cqw; background: var(--grad); box-shadow: 0 0 0 .35cqw #fff, 0 .8cqw 2cqw rgba(0, 0, 0, .35); }
      .st { position: absolute; translate: -50% -88%; color: var(--pink); filter: drop-shadow(0 .4cqw .6cqw rgba(0, 0, 0, .4)); }
      .sl { position: absolute; left: 3%; top: 66%; padding: .6cqw 1.3cqw; border-radius: 1.2cqw; font-size: 2.3cqw; font-weight: 750; color: var(--ink);
        background: rgba(14, 40, 54, .55); white-space: nowrap; }
      .bd { flex: 1; display: flex; flex-direction: column; gap: 1.5cqw; }
      .bh { display: flex; align-items: center; gap: 1cqw; margin: .4cqw 0 .4cqw .4cqw; font-size: 2.8cqw; font-weight: 800; color: var(--ink); white-space: nowrap; }
      .bh .ico { color: var(--amber); }
      .rk { display: flex; align-items: center; gap: 1.3cqw; padding: 1.3cqw 1.4cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .13); }
      .rk.on { background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .6); }
      .no { flex: none; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 50%; font-size: 2.3cqw; font-weight: 800; color: var(--ink); background: rgba(255, 255, 255, .16); }
      .rk.on .no { background: var(--grad); color: #fff; }
      .nm { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .8cqw; }
      .nm b { font-size: 2.5cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .rk.on .nm b { font-size: 2.7cqw; }
      .nm .skel { height: .9cqw; background: rgba(255, 255, 255, .2); }
      .mi { display: flex; align-items: center; gap: .5cqw; font-size: 2.4cqw; font-weight: 800; color: var(--ink-2); white-space: nowrap; }
      .rk.on .mi { color: rgb(var(--tint)); font-size: 2.7cqw; }
      .ask { z-index: 4; display: flex; flex-direction: column; align-items: flex-end; gap: 1.4cqw; padding: 2.6cqw 2.2cqw; }
      .ask .bubble { font-size: 2.6cqw; font-weight: 700; line-height: 1.4; white-space: pre; }
      .ask .skel { background: rgba(255, 255, 255, .2); align-self: flex-start; }
    `,
  });
})();
