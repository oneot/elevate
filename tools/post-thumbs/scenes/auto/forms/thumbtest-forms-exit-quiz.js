/* Forms — 5분 형성평가: 응답 탭의 문항별 정답률, 낮은 문항을 다음 수업 도입으로 */
(() => {
scene('forms/thumbtest-forms-exit-quiz', (K) => {
  const row = (no, topic, p, low) => `<div class="qr${low ? ' low' : ''}">
      <span class="no">${no}</span><span class="tp">${topic}</span>
      <div class="bar"><i style="--p:${p}%"></i></div><b>${p}%</b>
    </div>`;
  return K.win({
    x: 4.5, y: 10.5, w: 70, h: 50, title: '광합성 수업 끝 퀴즈',
    barRight: K.chip('2학년 3반', { tint: true, cls: 'cls' }),
    body: `<div class="tabs"><span>질문</span><span class="on">응답 <b>27</b></span></div>
      <div class="rs">
        <p class="hd">문항별 정답률</p>
        ${row(1, '광합성 장소', 93)}
        ${row(2, '필요한 물질', 85)}
        ${row(3, '생기는 기체', 41, true)}
        <div class="qr essay"><span class="no">4</span><span class="tp">서술형</span>${K.skel('62%')}</div>
      </div>`,
  })
    + K.card({
      right: 4, y: 31.5, w: 26, cls: 'next',
      body: `<div class="nh">${K.ico('lightbulb', { s: 2.8 })}<b>다음 수업 도입</b></div>
        <div class="it on">${K.ico('arrow_repeat_all', { s: 2.5 })}<span>3번 다시 짚기</span></div>
        <div class="it">${K.ico('star', { s: 2.5 })}<span>서술형 좋은 답</span></div>`,
    })
    + K.pill({ right: 4.5, y: 5, icon: 'timer', text: '수업 끝 5분 이해도 확인' });
}, {
  deco: { v: 2 },
  css: `
    .win__bar .cls { padding: .6cqw 1.4cqw; font-size: 2.1cqw; }
    .tabs { display: flex; gap: 4.4cqw; padding: 0 3.4cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.4cqw; font-weight: 650; color: var(--ink-4); }
    .tabs span { padding: 1.3cqw .4cqw 1.2cqw; }
    .tabs .on { color: var(--ink); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
    .tabs b { margin-left: .4cqw; color: rgb(var(--tint)); }
    .rs { padding: 2.6cqw 7.6cqw 0 3.4cqw; }
    .hd { margin-bottom: 1.4cqw; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; }
    .qr { display: flex; align-items: center; gap: 1.6cqw; padding: 1.15cqw 1.4cqw; margin: 0 -1.4cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 600; white-space: nowrap; }
    .no { display: grid; place-items: center; flex: none; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: #eef2f3; font-size: 2cqw; font-weight: 700; color: var(--ink-3); }
    .tp { flex: none; width: 15cqw; color: var(--ink-2); }
    .bar { flex: 1; height: 1.8cqw; border-radius: 1cqw; background: #edf1f2; overflow: hidden; }
    .bar i { display: block; width: var(--p); height: 100%; border-radius: inherit; background: rgb(var(--tint)); }
    .qr > b { flex: none; width: 6.4cqw; text-align: right; font-size: 2.6cqw; font-weight: 750; }
    .qr.low { background: color-mix(in srgb, var(--amber) 13%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, var(--amber) 55%, #fff); }
    .qr.low .no { background: var(--amber); color: #fff; }
    .qr.low .tp { color: var(--ink); font-weight: 700; }
    .qr.low .bar i { background: var(--amber); }
    .qr.low > b { color: #b86e00; }
    .qr.essay .skel { flex: 1; height: 1.3cqw; }
    .next { padding: 2.4cqw 2.6cqw 1.6cqw; }
    .nh { display: flex; align-items: center; gap: 1.1cqw; margin-bottom: 1.2cqw; color: var(--amber); }
    .nh b { font-size: 2.6cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
    .it { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 0; font-size: 2.35cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .it + .it { border-top: .2cqw solid #f0f2f4; }
    .it .ico { color: rgb(var(--tint)); }
    .it.on { color: var(--ink); font-weight: 700; }
    .it.on .ico { color: var(--amber); }
  `,
});
})();
