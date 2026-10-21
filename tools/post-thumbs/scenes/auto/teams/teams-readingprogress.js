/* 읽기 진행 — teacher result view: passage with checked words, clicked word shows the AI-detected error */
(() => {
  scene('teams/teams-readingprogress', (K) => {
    const tab = (label, on) => `<span class="tab${on ? ' on' : ''}">${label}</span>`;
    return K.win({
      x: 4, y: 10, w: 66, h: 50, title: '봄 소풍', sub: ' · 2학년 3반', icon: false,
      barRight: K.btn('반환', { primary: true, icon: 'arrow_reply' }),
      body: `<div class="rp">
        <div class="hd">
          <div class="sc"><span class="t-num">96%</span><span class="lb">정확도</span></div>
          <div class="tabs">${tab('정확도', true)}${tab('표현력')}${tab('이해력 확인')}</div>
        </div>
        <div class="ps">
          <p>따뜻한 봄날, 우리 반은 숲으로</p>
          <p>소풍을 떠났어요. 길가에는</p>
          <p><mark class="er" data-word>민들레가</mark> 가득 피어 있었어요.</p>
          ${K.skel('78%')}
        </div>
      </div>`,
    })
      + K.card({
        x: 60, y: 31, w: 34, cls: 'pop',
        body: `<div class="pw">
          <div class="row wh"><b>민들레가</b><span class="spk">${K.ico('speaker_2', { s: 2.6 })}</span></div>
          ${K.chip('잘못된 발음', { dot: 'var(--red)' })}
          ${K.skel('86%')}
        </div>`,
      })
      + K.cursor({ x: 19.6, y: 46.6 })
      + K.tile({ x: 1.2, y: 4, s: 10.5 })
      + K.float({ right: 9, y: 17, icon: 'book_open_microphone', s: 7 })
      + K.pill({ right: 4, y: 4.6, icon: 'sparkle', text: 'AI가 읽기 오류 체크' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 10cqw; }
      .win__bar .btn { padding: 1cqw 2cqw; font-size: 2.4cqw; }
      .rp { display: flex; flex-direction: column; gap: 2.6cqw; padding: 3cqw 3.4cqw; height: 100%; }
      .hd { display: flex; align-items: center; justify-content: space-between; }
      .sc { display: flex; align-items: baseline; gap: 1.2cqw; }
      .sc .t-num { font-size: 7cqw; color: rgb(var(--tint)); line-height: 1; }
      .sc .lb { font-size: 2.6cqw; font-weight: 700; color: var(--ink-2); }
      .tabs { display: flex; gap: .8cqw; }
      .tab { padding: .9cqw 1.5cqw; border-radius: 99px; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); background: var(--fill); white-space: nowrap; }
      .tab.on { background: var(--grad); color: #fff; }
      .ps { display: flex; flex-direction: column; gap: 1.5cqw; padding: 2.6cqw 3cqw; border-radius: 1.8cqw; background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 .2cqw var(--line); }
      .ps p { font-size: 3cqw; font-weight: 600; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      mark.er { padding: .2cqw .6cqw; border-radius: .6cqw; color: var(--ink); background: color-mix(in srgb, var(--red) 16%, #fff); box-shadow: inset 0 -.4cqw 0 var(--red), 0 0 0 .3cqw color-mix(in srgb, var(--red) 35%, #fff); }
      .pop { z-index: 3; }
      .pw { display: flex; flex-direction: column; align-items: flex-start; gap: 1.6cqw; padding: 2.8cqw 3cqw 3cqw; }
      .wh { width: 100%; align-items: center; justify-content: space-between; }
      .wh b { font-size: 3.6cqw; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
      .spk { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 99px; background: var(--grad); color: #fff; }
      .pw .chip { font-size: 2.5cqw; }
    `,
  });
})();
