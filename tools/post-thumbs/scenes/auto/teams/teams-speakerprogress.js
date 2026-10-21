/* 발표자 진행 — teacher reviews a submitted speech: video + AI feedback, then 반환 */
(() => {
  scene('teams/teams-speakerprogress', (K) => {
    const row = (label, value, dot) => `<div class="fr"><span class="fl">${label}</span><span class="grow"></span><b class="fv"><i class="dot" style="--c:${dot}"></i>${value}</b></div>`;
    return K.win({
      x: 29, y: 10.5, w: 68, h: 50, title: '우리 고장 소개', sub: ' · 3학년 2반', icon: false,
      barRight: K.btn('반환', { primary: true, icon: 'arrow_reply' }),
      body: `<div class="rv">
        <div class="vd">
          ${K.avatar('김', { s: 10, c: 'rgba(255,255,255,.22)' })}
          <div class="vb"><span class="pl">${K.ico('play', { s: 2.4 })}</span><div class="tr"><i></i></div><span class="tm">1:48</span></div>
        </div>
        <div class="fb">
          <div class="hero">
            <p class="hl1">분당 말하기 속도</p>
            <div class="row hv"><span class="t-num">118</span>${K.chip('적정', { dot: 'var(--green)' })}</div>
          </div>
          ${row('높낮이', '자연스러움', 'var(--green)')}
          ${row('잘못된 발음', '2개', 'var(--amber)')}
          ${row('추임새', '음 3회', 'var(--amber)')}
        </div>
      </div>`,
    })
      + K.tile({ x: 23.6, y: 4.4, s: 11 })
      + K.float({ x: 10, y: 15, icon: 'mic_sparkle', s: 7 })
      + K.pill({ x: 4, bottom: 5, icon: 'sparkle', text: 'AI 발표 피드백', dark: true });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .win__bar .btn { padding: 1cqw 2cqw; font-size: 2.4cqw; }
      .rv { display: grid; grid-template-columns: 24cqw 1fr; gap: 3cqw; padding: 3cqw 3.2cqw; height: 100%; }
      .vd { position: relative; display: grid; place-items: center; height: 36cqw; border-radius: 2cqw; overflow: hidden;
        background: linear-gradient(160deg, #6c63e6, #3f3a9e 60%, #2b2870); }
      .vd .avatar { color: #fff; font-size: 4cqw; box-shadow: 0 0 0 .5cqw rgba(255,255,255,.18); }
      .vb { position: absolute; left: 1.6cqw; right: 1.6cqw; bottom: 1.6cqw; display: flex; align-items: center; gap: 1.2cqw; }
      .pl { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 99px; background: #fff; color: rgb(var(--tint)); }
      .tr { flex: 1; height: .6cqw; border-radius: 99px; background: rgba(255,255,255,.3); }
      .tr i { display: block; width: 62%; height: 100%; border-radius: 99px; background: #fff; }
      .tm { font-size: 2.1cqw; font-weight: 650; color: #fff; }
      .fb { display: flex; flex-direction: column; gap: 1.3cqw; }
      .hero { padding: 2cqw 2.4cqw; border-radius: 1.8cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff);
        box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); margin-bottom: .6cqw; }
      .hl1 { font-size: 2.3cqw; font-weight: 700; color: rgb(var(--tint)); }
      .hv { gap: 1.6cqw; margin-top: .8cqw; align-items: center; }
      .hv .t-num { font-size: 7cqw; color: var(--ink); }
      .hv .chip { font-size: 2.3cqw; }
      .fr { display: flex; align-items: center; padding: 1.2cqw .6cqw 1.2cqw .4cqw; border-bottom: .2cqw solid var(--line); white-space: nowrap; }
      .fl { font-size: 2.5cqw; font-weight: 600; color: var(--ink-2); }
      .fv { display: inline-flex; align-items: center; gap: .9cqw; font-size: 2.6cqw; font-weight: 750; color: var(--ink); }
      .fv .dot { width: 1.3cqw; height: 1.3cqw; border-radius: 99px; background: var(--c); }
    `,
  });
})();
