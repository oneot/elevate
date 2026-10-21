/* word/wordonline4 — 꼭 알아야 할 꿀팁: 스타일로 짠 상담일지에 받아쓰기로 내용을 바로 기록 */
(() => {
  scene('word/wordonline4', (K) => {
    const sb = (label, cls, on) => `<span class="sb ${cls}${on ? ' on' : ''}">${label}</span>`;
    return K.win({
      x: 31, y: 7.5, w: 65, h: 52, title: '상담일지', icon: false,
      barRight: `<span class="tb">${K.ico('mic', { s: 2.6 })}</span>`,
      body: `<div class="ed">
        <div class="gal">${sb('제목', 'g1', true)}${sb('강조', 'g2')}${sb('머리글 4', 'g3')}</div>
        <div class="cv"><div class="page pg">
          <h2>2학년 3반 상담일지</h2>
          <p class="em">상담 날짜: 1월 3일</p>
          <h4>${K.ico('chevron_down', { s: 2.4 })}상담 주요 내용</h4>
          <p class="li">1. 학업 관련 고민</p>
          <p class="li sub live">a. 수학 성적이 걱정됨<i class="caret"></i></p>
          <p class="li">2. 진로 상담</p>
          ${K.skel('64%')}
        </div></div>
      </div>`,
    })
      + K.card({
        x: 6, y: 18, w: 30, cls: 'dic',
        body: `<span class="mic">${K.ico('mic', { s: 4.4 })}</span>
          <div class="dc"><b>받아쓰기</b><span class="lv"><i></i><i></i><i></i><i></i><i></i></span></div>
          <span class="lang">${K.ico('settings:r', { s: 2.4 })}한국어</span>`,
      })
      + K.tile({ x: 25.5, y: 2, s: 11 })
      + K.pill({ x: 4, bottom: 4.4, icon: 'mic', text: '말하면 바로 기록' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .tb { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .gal { flex: none; display: flex; gap: 1.2cqw; padding: 1.4cqw 3cqw 1.4cqw 8cqw; border-bottom: .2cqw solid #eef0f3; }
      .sb { display: grid; place-items: center; height: 5.4cqw; padding: 0 2cqw; border-radius: 1.1cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); background: #fff; white-space: nowrap; color: var(--ink-2); }
      .sb.on { box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
      .g1 { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
      .g2 { font-size: 2.4cqw; font-weight: 600; font-style: italic; }
      .g3 { font-size: 2.4cqw; font-weight: 700; color: rgb(var(--tint)); }
      .cv { flex: 1; padding: 2cqw 0 0 8cqw; background: rgba(243, 243, 246, .7); }
      .pg { width: 46cqw; height: 100%; display: flex; flex-direction: column; gap: 1.3cqw; padding: 3cqw 4.4cqw 0; border-radius: 1cqw 1cqw 0 0; }
      .pg h2 { font-size: 3.6cqw; font-weight: 800; letter-spacing: -0.04em; white-space: nowrap; }
      .em { font-size: 2.3cqw; font-style: italic; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .pg h4 { display: flex; align-items: center; gap: .6cqw; margin: 1cqw 0 0 -3cqw; font-size: 2.7cqw; font-weight: 750; color: rgb(var(--tint)); white-space: nowrap; }
      .pg h4 .ico { color: var(--ink-4); }
      .li { font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .li.sub { margin-left: 3cqw; }
      .live { align-self: flex-start; display: flex; align-items: center; padding: .4cqw .9cqw; margin-left: 2.1cqw !important; border-radius: .6cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); font-size: 2.7cqw; font-weight: 750; color: var(--ink); }
      .caret { width: .32cqw; height: 3.2cqw; margin-left: .5cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .dic { z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 1.6cqw; padding: 2.8cqw 2.6cqw 2.6cqw; }
      .mic { display: grid; place-items: center; width: 10cqw; height: 10cqw; border-radius: 50%; background: var(--grad); color: #fff; box-shadow: 0 0 0 1.4cqw color-mix(in srgb, rgb(var(--tint)) 14%, transparent), 0 1.4cqw 2.6cqw -1cqw rgba(var(--tint), .6); }
      .dc { display: flex; align-items: center; gap: 1.4cqw; }
      .dc b { font-size: 2.9cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; }
      .lv { display: flex; align-items: center; gap: .45cqw; height: 3cqw; }
      .lv i { width: .55cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .lv i:nth-child(1) { height: 1.2cqw; } .lv i:nth-child(2) { height: 2.6cqw; } .lv i:nth-child(3) { height: 1.8cqw; } .lv i:nth-child(4) { height: 3cqw; } .lv i:nth-child(5) { height: 1.4cqw; }
      .lang { display: inline-flex; align-items: center; gap: .7cqw; padding: .7cqw 1.6cqw; border-radius: 99px; background: #f2f3f6; font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .lang .ico { color: var(--ink-3); }
    `,
  });
})();
