/* copilot-studio/golden-time-router — the '근처 응급실 실시간 조회' workflow: two HTTP calls, then a Loop over 10 ERs (①–④ API calls), feeding the Top 3 */
(() => {
  scene('copilot-studio/golden-time-router', (K) => {
    const node = (icon, name) => `<div class="nd"><span class="ni">${K.ico(icon, { s: 2.8 })}</span><b>${name}</b></div>`;
    const call = (icon, name) => `<div class="cl"><span class="ci">${K.ico(icon, { s: 2.5 })}</span><b>${name}</b></div>`;
    return K.win({
      x: 3, y: 10, w: 64, h: 49, title: '근처 응급실 실시간 조회', icon: false,
      barRight: K.chip('게시됨', { dot: 'var(--green)' }),
      body: `<div class="cv">
        <div class="lc">
          ${node('globe', '장소 좌표 찾기')}
          <i class="ar"></i>
          ${node('location', '근처 응급실 조회')}
        </div>
        <div class="lp">
          <p class="lh">${K.ico('arrow_repeat_all', { s: 3 })}<b>후보 병원마다</b><span class="cnt">10곳</span></p>
          ${call('chat_warning', '① 메시지')}
          ${call('vehicle_car', '② 이동 시간')}
          ${call('bed', '③ 실시간 병상')}
          ${call('heart_pulse', '④ 중증질환')}
        </div>
      </div>`,
    })
      + K.card({
        right: 3.5, y: 27, w: 29, cls: 'top',
        body: `<p class="th">${K.ico('trophy', { s: 2.8 })}이송 추천 Top 3</p>
          <div class="rk on"><span class="no">1</span><b>A대학병원</b><span class="mi">9분</span></div>
          <div class="rk"><span class="no"></span>${K.skel('62%')}</div>
          <div class="rk"><span class="no"></span>${K.skel('50%')}</div>`,
      })
      + '<div class="links"></div>'
      + K.tile({ x: 0.5, y: 3.2, s: 10.5 })
      + K.float({ right: 27, y: 16.5, s: 6, icon: 'vehicle_car' })
      + K.pill({ right: 3.5, y: 6, icon: 'arrow_repeat_all', text: '응급실 10곳 실시간 조회' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 11cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.2cqw; font-weight: 700; padding: .8cqw 1.6cqw; }
      .cv { height: 100%; display: flex; align-items: flex-start; gap: 5cqw; padding: 3.2cqw 3cqw 0;
        background: radial-gradient(circle, rgba(255, 255, 255, .14) .16cqw, transparent .2cqw) 0 0 / 2.4cqw 2.4cqw; }
      .lc { display: flex; flex-direction: column; align-items: center; padding-top: 4cqw; }
      .nd { display: flex; align-items: center; gap: 1.2cqw; width: 23cqw; padding: 1.3cqw 1.4cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); }
      .nd .ni { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.2cqw; background: rgba(var(--tint), .2); color: rgb(var(--tint)); }
      .nd b { flex: 1; font-size: 2.5cqw; font-weight: 750; color: var(--ink); white-space: nowrap; letter-spacing: -0.03em; }
      .ar { position: relative; width: .3cqw; height: 4.4cqw; background: rgba(255, 255, 255, .34); }
      .ar::after { content: ''; position: absolute; left: 50%; bottom: .1cqw; width: 1.1cqw; height: 1.1cqw; translate: -50% 0; rotate: 45deg;
        border-right: .3cqw solid rgba(255, 255, 255, .34); border-bottom: .3cqw solid rgba(255, 255, 255, .34); }
      .lp { flex: 1; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2cqw 2.2cqw 2.4cqw; border-radius: 2cqw;
        background: rgba(var(--tint), .1); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3.4cqw -1cqw rgba(var(--tint), .55); }
      .lh { display: flex; align-items: center; gap: 1cqw; margin-bottom: .4cqw; color: rgb(var(--tint)); white-space: nowrap; }
      .lh b { flex: 1; font-size: 2.8cqw; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; }
      .cnt { padding: .6cqw 1.5cqw; border-radius: 99px; background: var(--grad); color: #fff; font-size: 2.5cqw; font-weight: 800; }
      .cl { display: flex; align-items: center; gap: 1.2cqw; padding: 1cqw 1.2cqw; border-radius: 1.3cqw;
        background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .12); }
      .ci { flex: none; display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 1cqw; background: rgba(255, 255, 255, .12); color: var(--ink-2); }
      .cl b { font-size: 2.4cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .top { z-index: 4; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.4cqw 2.2cqw; }
      .th { display: flex; align-items: center; gap: .9cqw; margin-bottom: .3cqw; font-size: 2.6cqw; font-weight: 800; color: var(--ink); white-space: nowrap; }
      .th .ico { color: var(--amber); }
      .rk { display: flex; align-items: center; gap: 1.2cqw; padding: 1cqw 1.2cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .08); }
      .rk.on { background: rgba(var(--tint), .16); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .rk .skel { height: 1cqw; background: rgba(255, 255, 255, .22); }
      .no { flex: none; display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 50%; background: rgba(255, 255, 255, .16); font-size: 2.3cqw; font-weight: 800; color: #fff; }
      .rk.on .no { background: var(--grad); }
      .rk b { flex: 1; font-size: 2.6cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .mi { font-size: 2.6cqw; font-weight: 800; color: rgb(var(--tint)); white-space: nowrap; }
    `,
    after(stage, K) {
      const b = stage.getBoundingClientRect();
      const k = 100 / b.width;
      const box = (sel) => {
        const r = stage.querySelector(sel).getBoundingClientRect();
        return { l: (r.left - b.left) * k, r: (r.right - b.left) * k, cy: (r.top + r.height / 2 - b.top) * k, t: (r.top - b.top) * k };
      };
      const n = box('.nd:last-child');
      const lp = box('.lp');
      const c = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      stage.querySelector('.links').outerHTML = K.wires(K.curve(n.r + 1.2, n.cy, lp.l - 0.8, n.cy, { c, dot: true, bend: 'none', arrow: true }), { z: 2 });
    },
  });
})();
