/* 기본 화면과 설정 알아보기: 태블릿 수업용 설정 (터치 컨트롤 모드 + 시점) */
(() => {
  scene('minecraft/minecraftedu2', (K) => {
    const nav = [['컨트롤', 'phone_tablet', true], ['비디오', 'video'], ['사운드', 'speaker_2'], ['멀티플레이', 'people']];
    const opt = (name, pad, on) => `<div class="op${on ? ' on' : ''}">
        <div class="sc"><i class="gd"></i>${pad}<i class="jb"></i></div>
        <div class="ol"><span class="radio${on ? ' on' : ''}"></span>${name}</div>
      </div>`;
    const dpad = '<span class="dp"><i></i><i></i><i></i><i></i></span>';
    const stick = '<span class="js"><i></i></span>';
    return K.win({
      x: 30, y: 9.5, w: 66, h: 50, title: '설정', icon: false,
      body: `<div class="st">
          <div class="nv">${nav.map(([n, ic, on]) => `<div class="ni${on ? ' on' : ''}">${K.ico(ic, { s: 2.6 })}${n}</div>`).join('')}</div>
          <div class="pn">
            <p class="hd">터치 컨트롤 모드</p>
            <div class="ops">${opt('D-패드', dpad)}${opt('조이스틱', stick, true)}</div>
            <div class="vw"><span>시점</span><span class="seg"><b>1인칭</b><b class="on">3인칭 후방</b></span></div>
          </div>
        </div>`,
    })
      + K.tile({ x: 25, y: 4.2, s: 10.5 })
      + K.float({ x: 9, y: 11, s: 7.4, app: 'onedrive' })
      + K.pill({ x: 4, bottom: 4.4, icon: 'tablet', text: '태블릿 수업 맞춤 설정' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8cqw; font-size: 2.9cqw; }
      .st { position: absolute; inset: 0; display: grid; grid-template-columns: 19cqw 1fr; }
      .nv { display: flex; flex-direction: column; gap: .8cqw; padding: 2.6cqw 1.6cqw; background: rgba(243, 245, 240, .75); border-right: .15cqw solid var(--line); }
      .ni { display: flex; align-items: center; gap: 1.1cqw; height: 5.2cqw; padding: 0 1.3cqw; border-radius: 1.2cqw; font-size: 2.5cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .ni.on { background: #fff; color: rgb(var(--tint)); font-weight: 750; box-shadow: 0 0 0 .18cqw color-mix(in srgb, rgb(var(--tint)) 30%, transparent), 0 1cqw 2cqw -1.2cqw rgba(var(--tint), .6); }
      .pn { display: flex; flex-direction: column; gap: 2.2cqw; padding: 2.8cqw 3cqw; }
      .hd { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.02em; }
      .ops { display: grid; grid-template-columns: 1fr 1fr; gap: 2cqw; }
      .op { display: flex; flex-direction: column; gap: 1.4cqw; padding: 1.2cqw 1.2cqw 1.6cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .85); box-shadow: 0 0 0 .18cqw var(--line-2); }
      .op.on { box-shadow: 0 0 0 .32cqw rgb(var(--tint)), 0 0 0 1.1cqw color-mix(in srgb, rgb(var(--tint)) 15%, transparent), 0 2.4cqw 4cqw -2cqw rgba(var(--tint), .6); }
      .sc { position: relative; height: 11cqw; overflow: hidden; border-radius: 1.2cqw; background: linear-gradient(180deg, #b4e0ff, #e2f4ff 60%); }
      .gd { position: absolute; left: 0; right: 0; bottom: 0; height: 4.2cqw; background: linear-gradient(180deg, #7dbb51 0 .9cqw, #9a6c45 .9cqw); }
      .dp { position: absolute; left: 1.4cqw; bottom: 1.2cqw; width: 6.6cqw; height: 6.6cqw; }
      .dp i { position: absolute; width: 2.2cqw; height: 2.2cqw; border-radius: .4cqw; background: rgba(255, 255, 255, .9); box-shadow: 0 0 0 .15cqw rgba(30, 40, 30, .35); }
      .dp i:nth-child(1) { left: 2.2cqw; top: 0; } .dp i:nth-child(2) { left: 0; top: 2.2cqw; } .dp i:nth-child(3) { left: 4.4cqw; top: 2.2cqw; } .dp i:nth-child(4) { left: 2.2cqw; top: 4.4cqw; }
      .js { position: absolute; left: 1.4cqw; bottom: 1.2cqw; display: grid; place-items: center; width: 6.6cqw; height: 6.6cqw; border-radius: 50%; background: rgba(255, 255, 255, .45); box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .95); }
      .js i { width: 3cqw; height: 3cqw; border-radius: 50%; background: #fff; box-shadow: 0 .4cqw .8cqw rgba(0, 0, 0, .25); translate: .8cqw -.6cqw; }
      .jb { position: absolute; right: 1.6cqw; bottom: 1.6cqw; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: rgba(255, 255, 255, .85); box-shadow: 0 0 0 .15cqw rgba(30, 40, 30, .3); }
      .ol { display: flex; align-items: center; gap: 1.1cqw; padding-left: .6cqw; font-size: 2.6cqw; font-weight: 700; white-space: nowrap; }
      .op.on .ol { color: rgb(var(--tint)); }
      .vw { display: flex; align-items: center; justify-content: space-between; height: 7cqw; padding: 0 1cqw 0 2cqw; border-radius: 1.6cqw; background: rgba(255, 255, 255, .8); box-shadow: 0 0 0 .18cqw var(--line-2); font-size: 2.6cqw; font-weight: 700; white-space: nowrap; }
      .seg { display: flex; gap: .4cqw; padding: .5cqw; border-radius: 1.2cqw; background: rgba(20, 22, 30, .06); }
      .seg b { display: flex; align-items: center; height: 4.4cqw; padding: 0 1.8cqw; border-radius: .9cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-3); }
      .seg b.on { background: var(--grad); color: #fff; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(var(--tint), .7); }
    `,
  });
})();
