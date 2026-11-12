/* copilot-studio/golden-time-router — workflow canvas: Kakao/공공데이터 HTTP nodes and the "후보 병원마다" loop over 10 ERs */
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
  const tintOf = (stage) => `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;

  scene('copilot-studio/golden-time-router', (K) => {
    const top = (icon, name) => `<div class="tn"><span class="ni">${K.ico(icon, { s: 2.8 })}</span><b>${name}</b></div>`;
    const http = (icon, name) => `<div class="hn"><span class="ni">${K.ico(icon, { s: 2.6 })}</span><b>${name}</b></div>`;
    return K.win({
      x: 4, y: 10, w: 62, h: 50, title: '근처 응급실 실시간 조회', icon: false,
      barRight: K.chip('게시됨', { dot: 'var(--green)' }),
      body: `<div class="cv">
        <div class="r1">${top('globe_location', '장소 좌표 찾기')}<i class="ah"></i>${top('location', '근처 응급실 조회')}</div>
        <i class="av"></i>
        <div class="lp">
          <div class="lh">${K.ico('arrow_repeat_all', { s: 3 })}<b>후보 병원마다</b>${K.chip('10곳', { solid: true })}</div>
          <div class="gr">
            ${http('alert_urgent', '① 메시지')}${http('vehicle_car', '② 이동 시간')}
            ${http('bed', '③ 병상')}${http('heart_pulse', '④ 중증질환')}
          </div>
        </div>
      </div>`,
    })
      + K.card({
        right: 2.4, y: 31, w: 30, cls: 'rs',
        body: `<p class="rh">${K.ico('arrow_reply', { s: 2.6 })}Respond to the agent</p>
          <div class="out">${K.ico('braces_variable', { s: 2.6 })}<b>병원정보</b></div>
          ${K.skel('88%')}${K.skel('64%')}`,
      })
      + '<div class="links"></div>'
      + K.tile({ x: 1.6, y: 4, s: 10.5 })
      + K.float({ right: 7, y: 17, s: 6, icon: 'timer', far: true })
      + K.pill({ right: 4, y: 4, icon: 'arrow_sync', text: '응급실 10곳 실시간 조회' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .cv { height: 100%; padding: 3cqw 3.2cqw; display: flex; flex-direction: column; align-items: center;
        background: radial-gradient(circle, rgba(255, 255, 255, .14) .16cqw, transparent .2cqw) 0 0 / 2.4cqw 2.4cqw; }
      .ni { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: rgba(var(--tint), .18); color: rgb(var(--tint)); }
      .r1 { display: flex; align-items: center; width: 100%; }
      .tn { flex: 1; display: flex; align-items: center; gap: 1.3cqw; padding: 1.2cqw 1.6cqw 1.2cqw 1.2cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14), 0 1.6cqw 3cqw -1.8cqw rgba(4, 10, 20, .45); }
      .tn b { font-size: 2.5cqw; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
      .ah { position: relative; flex: none; width: 3.4cqw; height: .3cqw; background: rgba(255, 255, 255, .34); }
      .ah::after { content: ''; position: absolute; right: .1cqw; top: 50%; width: 1.1cqw; height: 1.1cqw; translate: 0 -50%; rotate: -45deg; border-right: .3cqw solid rgba(255, 255, 255, .34); border-bottom: .3cqw solid rgba(255, 255, 255, .34); }
      .av { position: relative; flex: none; width: .3cqw; height: 2.8cqw; background: rgba(255, 255, 255, .34); }
      .av::after { content: ''; position: absolute; left: 50%; bottom: .1cqw; width: 1.1cqw; height: 1.1cqw; translate: -50% 0; rotate: 45deg; border-right: .3cqw solid rgba(255, 255, 255, .34); border-bottom: .3cqw solid rgba(255, 255, 255, .34); }
      .lp { width: 100%; padding: 2cqw 2.2cqw 2.4cqw; border-radius: 2cqw; background: rgba(var(--tint), .1);
        box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3.4cqw -1cqw rgba(var(--tint), .5); }
      .lh { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: 1.8cqw; color: rgb(var(--tint)); }
      .lh b { font-size: 3cqw; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
      .lh .chip { font-size: 2.3cqw; font-weight: 750; padding: .6cqw 1.6cqw; }
      .gr { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4cqw; }
      .hn { display: flex; align-items: center; gap: 1.2cqw; padding: 1cqw 1.4cqw 1cqw 1cqw; border-radius: 1.4cqw;
        background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      .hn b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .rs { z-index: 4; display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.4cqw 2.2cqw 2.8cqw; }
      .rh { display: flex; align-items: center; gap: .7cqw; font-size: 2.2cqw; font-weight: 700; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      .rh .ico { color: rgb(var(--tint)); }
      .out { display: flex; align-items: center; gap: 1cqw; padding: 1.1cqw 1.4cqw; border-radius: 1.3cqw; background: rgba(var(--tint), .16); color: rgb(var(--tint)); }
      .out b { font-size: 2.7cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .rs .skel { background: rgba(255, 255, 255, .2); }
    `,
    after(stage, K) {
      const g = geo(stage);
      const a = g('.lp');
      const b = g('.rs');
      stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r + 0.4, a.cy, b.l - 0.8, b.cy, { c: tintOf(stage), dot: true }), { z: 3 });
    },
  });
})();
