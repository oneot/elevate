/* PowerPoint · 그리기와 디자인 활용하기 — [디자인] 탭의 배경 서식에서 단색 채우기를 고르고 [모두 적용]으로 모든 슬라이드 배경을 맞춘다 */
(() => {
  scene('powerpoint/pptonline3', (K) => {
    const tab = (t, on) => `<span${on ? ' class="on"' : ''}>${t}</span>`;
    const rb = (ico, label, on) => `<span class="rb${on ? ' on' : ''}">${K.ico(ico, { s: 3 })}${label}</span>`;
    const theme = (cls) => `<i class="tm ${cls}"></i>`;
    const thumb = (on) => `<div class="slide th${on ? ' on' : ''}"><i class="tl"></i><i class="tl s"></i></div>`;
    const sw = (col, on) => `<i class="sw${on ? ' on' : ''}" style="--c:${col}"></i>`;
    return K.win({
      x: 31, y: 9.5, w: 66, h: 50, icon: false, title: '2학년 3반 안내',
      body: `<div class="ed">
        <div class="tabs">${tab('그리기')}${tab('디자인', true)}${tab('전환')}</div>
        <div class="rib">
          ${theme('a')}${theme('b')}${theme('c')}
          <span class="vsep"></span>
          ${rb('slide_size:r', '슬라이드 크기')}${rb('color_background:r', '배경 서식', true)}
        </div>
        <div class="cv">
          <div class="rail">${thumb()}${thumb(true)}${thumb()}</div>
          <div class="slide st">
            <h4>가을 현장체험학습</h4>
            ${K.skel('20cqw', { h: 1.5 })}${K.skel('11cqw', { h: 1.5 })}
            <i class="sun"></i><i class="hill"></i>
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 17, w: 30, cls: 'pane',
        body: `<div class="ph">${K.ico('color_background', { s: 3, c: 'rgb(var(--tint))' })}배경 서식</div>
          <div class="op on"><i class="radio on"></i><b>단색 채우기</b></div>
          <div class="sws">${sw('#ffffff')}${sw('#ffd3a3', true)}${sw('#bfe3ff')}${sw('#cdeec3')}</div>
          <div class="op"><i class="radio"></i><b>사진 삽입</b></div>
          ${K.btn('모두 적용', { primary: true, icon: 'slide_multiple', cls: 'all' })}`,
      })
      + K.tile({ x: 26.4, y: 3.6, s: 10.5 })
      + K.float({ right: 4, y: 3.2, icon: 'color_fill' })
      + K.pill({ right: 5, bottom: 4.6, icon: 'checkmark_circle', text: '배경 한 번에 모두 적용', dark: true });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .tabs { display: flex; align-items: center; gap: 3cqw; height: 5.4cqw; padding: 0 3cqw 0 6cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
      .tabs > .on { color: rgb(var(--tint)); font-weight: 750; }
      .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .rib { display: flex; align-items: center; gap: 1.2cqw; height: 8.4cqw; padding: 0 3cqw 0 6cqw; border-bottom: .2cqw solid #eef0f3; }
      .tm { width: 7cqw; height: 4.4cqw; border-radius: .7cqw; box-shadow: 0 0 0 .15cqw rgba(20, 22, 30, .1); }
      .tm.a { background: linear-gradient(90deg, #fff 70%, rgb(var(--tint)) 70%); }
      .tm.b { background: linear-gradient(160deg, #2d2f36 60%, var(--f2)); }
      .tm.c { background: linear-gradient(0deg, var(--f1) 30%, #fff 30%); }
      .vsep { width: .2cqw; height: 5cqw; margin: 0 .6cqw; background: var(--line); }
      .rb { display: inline-flex; align-items: center; gap: .8cqw; padding: 1cqw 1.4cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .rb .ico { color: var(--ink-3); }
      .rb.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); color: rgb(var(--tint)); font-weight: 800; }
      .rb.on .ico { color: rgb(var(--tint)); }
      .cv { flex: 1; display: flex; gap: 2.4cqw; padding: 2.6cqw 3cqw 0 6cqw; background: rgba(243, 243, 246, .75); }
      .rail { display: flex; flex-direction: column; gap: 1.5cqw; width: 9.4cqw; }
      .th { width: 100%; background: linear-gradient(160deg, #ffe6c9, #ffd3a3); }
      .th.on { box-shadow: 0 0 0 .35cqw rgb(var(--tint)); }
      .tl { position: absolute; left: 12%; top: 22%; width: 52%; height: .7cqw; border-radius: 99px; background: rgba(120, 50, 20, .45); }
      .tl.s { top: 42%; width: 34%; background: rgba(120, 50, 20, .22); }
      .st { flex: 1; align-self: start; display: flex; flex-direction: column; gap: 1.3cqw; padding: 3.2cqw 3.4cqw; background: linear-gradient(160deg, #ffe6c9, #ffd3a3); }
      .st h4 { margin-bottom: .8cqw; font-size: 3.4cqw; font-weight: 800; letter-spacing: -0.04em; color: #5a2410; white-space: nowrap; }
      .st .skel { background: rgba(120, 50, 20, .2); }
      .sun { position: absolute; right: 5cqw; top: 3cqw; width: 6cqw; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff2c2, #ffb347); }
      .hill { position: absolute; left: -10%; right: -10%; bottom: -14cqw; height: 20cqw; border-radius: 50%; background: linear-gradient(180deg, rgb(var(--tint)), var(--f2)); opacity: .55; }
      .pane { z-index: 3; padding: 2.4cqw 2.6cqw; display: flex; flex-direction: column; gap: 1.3cqw; }
      .ph { display: flex; align-items: center; gap: 1cqw; margin-bottom: .2cqw; font-size: 2.9cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; }
      .op { display: flex; align-items: center; gap: 1.4cqw; font-size: 2.6cqw; color: var(--ink-2); white-space: nowrap; }
      .op b { font-weight: 650; }
      .op.on b { font-weight: 800; color: var(--ink); }
      .sws { display: flex; gap: 1.2cqw; padding-left: 3.8cqw; }
      .sw { width: 4cqw; height: 4cqw; border-radius: 1cqw; background: var(--c); box-shadow: inset 0 0 0 .18cqw rgba(20, 22, 30, .14); }
      .sw.on { box-shadow: 0 0 0 .3cqw #fff, 0 0 0 .6cqw rgb(var(--tint)); }
      .all { align-self: stretch; justify-content: center; margin-top: .4cqw; padding: 1.1cqw 2cqw; font-size: 2.7cqw; font-weight: 800; }
    `,
  });
})();
