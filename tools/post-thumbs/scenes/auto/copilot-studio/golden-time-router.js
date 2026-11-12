/* copilot-studio/golden-time-router — workflow canvas: two HTTP lookups feed the Loop that calls four APIs for each of 10 candidate ERs */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const node = (icon, name, cls = '') => `<div class="nd ${cls}"><span class="ni">${K.ico(icon, { s: 2.7 })}</span><b>${name}</b></div>`;
    return K.win({
      x: 29, y: 9, w: 68, h: 50, title: '근처 응급실 실시간 조회', icon: false,
      barRight: K.chip('게시됨', { dot: 'var(--green)' }),
      body: `<div class="cv">
        <div class="top">${node('location', '장소 좌표 찾기')}<i class="ah"></i>${node('globe', '근처 응급실 조회')}</div>
        <i class="av"></i>
        <div class="lp">
          <div class="lh">${K.ico('arrow_repeat_all', { s: 3 })}<b>후보 병원마다</b>${K.chip('10곳 반복', { solid: true })}</div>
          <div class="gr">
            ${node('chat_warning', '병원 메시지 조회')}
            ${node('vehicle_car', '이동 시간 조회', 'on')}
            ${node('bed', '병원 병상 조회')}
            ${node('heart_pulse', '병원 중증질환 조회')}
          </div>
          <div class="ap">${K.ico('braces', { s: 2.5 })}<span>병원정보에 추가</span>${K.skel('34%')}</div>
        </div>
      </div>`,
    })
      + K.tile({ x: 24.5, y: 3.2, s: 10.5 })
      + K.float({ x: 18, y: 30, s: 6.4, icon: 'vehicle_car' })
      + K.float({ x: 7, y: 11, s: 5.6, icon: 'heart_pulse', far: true })
      + K.pill({ x: 3, bottom: 5, icon: 'arrow_repeat_all', text: '응급실 10곳 한 번에' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .cv { height: 100%; display: flex; flex-direction: column; align-items: center; padding: 3cqw 3cqw 0;
        background: radial-gradient(circle, rgba(255, 255, 255, .13) .16cqw, transparent .2cqw) 0 0 / 2.4cqw 2.4cqw; }
      .top { display: flex; align-items: center; }
      .nd { display: flex; align-items: center; gap: 1.2cqw; padding: 1.1cqw 1.8cqw 1.1cqw 1.1cqw; border-radius: 1.5cqw;
        background: rgba(255, 255, 255, .1); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16), 0 1.4cqw 2.6cqw -1.6cqw rgba(4, 10, 20, .45); }
      .ni { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.1cqw; background: rgba(var(--tint), .2); color: rgb(var(--tint)); }
      .nd b { font-size: 2.45cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; color: var(--ink); }
      .nd.on { background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -.8cqw rgba(var(--tint), .6); }
      .nd.on .ni { background: var(--grad); color: #fff; }
      .ah { position: relative; width: 4.6cqw; height: .3cqw; background: rgba(255, 255, 255, .4); }
      .ah::after { content: ''; position: absolute; right: .1cqw; top: 50%; width: 1cqw; height: 1cqw; translate: 0 -50%; rotate: 45deg;
        border-top: .3cqw solid rgba(255, 255, 255, .4); border-right: .3cqw solid rgba(255, 255, 255, .4); }
      .av { position: relative; width: .3cqw; height: 2.6cqw; background: rgba(255, 255, 255, .4); }
      .av::after { content: ''; position: absolute; left: 50%; bottom: .1cqw; width: 1cqw; height: 1cqw; translate: -50% 0; rotate: 45deg;
        border-right: .3cqw solid rgba(255, 255, 255, .4); border-bottom: .3cqw solid rgba(255, 255, 255, .4); }
      .lp { align-self: stretch; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2cqw 2.2cqw 2.4cqw; border-radius: 2cqw;
        background: rgba(var(--tint), .07); box-shadow: inset 0 0 0 .25cqw rgba(var(--tint), .7); }
      .lh { display: flex; align-items: center; gap: 1cqw; color: rgb(var(--tint)); }
      .lh b { flex: 1; font-size: 2.9cqw; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; }
      .lh .chip { font-size: 2.2cqw; font-weight: 750; padding: .7cqw 1.5cqw; }
      .gr { display: grid; grid-template-columns: 1fr 1fr; gap: 1.3cqw; }
      .ap { display: flex; align-items: center; gap: 1.1cqw; padding: 1.1cqw 1.6cqw; border-radius: 1.3cqw; background: rgba(255, 255, 255, .06);
        box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .12); color: rgb(var(--tint)); }
      .ap span { font-size: 2.3cqw; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
      .ap .skel { margin-left: auto; height: 1cqw; background: rgba(255, 255, 255, .2); }
    `,
  });
})();
