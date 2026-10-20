/* copilot-studio — class notice agent: test pane answers a deadline from the notice doc, then published to Teams */
(() => {

scene('copilot-studio/thumbtest-copilot-studio-class-notice-agent', (K) => K.win({
  x: 4, y: 7.5, w: 66, h: 52, title: '우리 반 알림 도우미', sub: ' · 테스트',
  body: `<div class="ch">
    ${K.bubble('수행평가 제출 마감이 언제예요?', { me: true })}
    <div class="bot">${K.app(null, { s: 3.6 })}<div class="an">
      <p class="lb">${K.ico('calendar_clock', { s: 2.6 })}국어 수행평가 · 독서 감상문</p>
      <p class="dd"><span class="t-num">10월 24일</span><em>금요일까지</em></p>
      ${K.skel('86%')}${K.skel('58%')}
      ${K.chip('2학년 3반 공지', { icon: 'document_text', line: true })}
    </div></div>
  </div>`,
})
  + K.card({
    x: 66, y: 19, w: 30, cls: 'pub',
    body: `<div class="in">
      <div class="hd">${K.app('teams', { s: 4 })}<div><b>Teams</b><small>2학년 3반 채널</small></div></div>
      <div class="st">${K.ico('checkmark_circle', { s: 2.6 })}게시됨</div>
    </div>`,
  })
  + K.pill({ right: 4, bottom: 5.5, icon: 'chat_help', text: '반복 질문은 대신 답해요' }), {
  deco: { v: 2 },
  css: `
    .ch { display: flex; flex-direction: column; gap: 2.2cqw; padding: 3cqw 3.2cqw; }
    .ch .bubble { font-size: 2.5cqw; white-space: nowrap; }
    .bot { display: flex; align-items: flex-start; gap: 1.4cqw; }
    .an { display: flex; flex-direction: column; gap: 1.2cqw; width: 48cqw; padding: 2.4cqw 2.8cqw 2.6cqw; border-radius: 1.8cqw;
      background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2), 0 1.4cqw 2.6cqw -1.6cqw rgba(15, 23, 42, .18); }
    .lb { display: flex; align-items: center; gap: .9cqw; font-size: 2.3cqw; font-weight: 650; color: rgb(var(--tint)); white-space: nowrap; }
    .dd { display: flex; align-items: baseline; gap: 1.4cqw; margin: .2cqw 0 .8cqw; white-space: nowrap; }
    .dd .t-num { font-size: 6.4cqw; }
    .dd em { font-style: normal; font-size: 2.6cqw; font-weight: 650; color: var(--ink-3); }
    .an .chip { align-self: flex-start; margin-top: .6cqw; font-size: 2cqw; }
    .pub .in { display: flex; flex-direction: column; gap: 2cqw; padding: 2.6cqw 2.8cqw 2.8cqw; }
    .hd { display: flex; align-items: center; gap: 1.4cqw; }
    .hd b { display: block; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.02em; }
    .hd small { display: block; margin-top: .2cqw; font-size: 2cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    .st { display: flex; align-items: center; gap: .9cqw; padding: 1.1cqw 1.6cqw; border-radius: 99px; font-size: 2.3cqw; font-weight: 700;
      color: #15803d; background: rgba(34, 197, 94, .12); align-self: flex-start; }
    &.dark {
      .an { background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14), 0 1.4cqw 2.6cqw -1.6cqw rgba(4, 10, 20, .4); }
      .dd em { color: rgba(255, 255, 255, .72); }
      .st { color: #7ef0a8; background: rgba(63, 214, 143, .18); }
    }
  `,
});

})();
