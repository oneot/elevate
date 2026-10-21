/* copilot/custom-agent — the finished class Q&A agent with its suggested prompts, shared to one class via 조직의 특정 사용자. */
(() => {
  scene('copilot/custom-agent', (K) => {
    const sug = ['중간고사 범위가 어디예요?', '조사 보고서 과제 안내해 줘', '퀴즈는 수행평가에 반영돼?'];
    return K.win({
      x: 5, y: 8.5, w: 61, h: 52, icon: false, title: 'Copilot', sub: '· 에이전트',
      barRight: K.btn('공유', { primary: true, icon: 'share' }),
      body: `<div class="ag">
        <div class="hero"><span class="av">${K.ico('bot', { s: 4.4 })}</span>
          <div class="nm"><b>학급 Q&amp;A 도우미</b>${K.skel('24cqw')}</div>
        </div>
        <div class="sg">${sug.map((t, i) => `<div class="sq${i === 0 ? ' on' : ''}">${K.ico(i === 0 ? 'chat_multiple' : 'chat_multiple:r', { s: 2.6 })}<span>${t}</span></div>`).join('')}</div>
        ${K.prompt('메시지 보내기')}
      </div>`,
    })
      + K.card({
        x: 62, y: 17, w: 34, cls: 'sh', body: `
          <div class="hd">${K.ico('link', { s: 3 })}<b>링크 공유</b></div>
          <div class="op"><span class="radio"></span>조직의 모든 사용자</div>
          <div class="op on"><span class="radio on"></span>조직의 특정 사용자</div>
          <div class="who">${K.chip('2학년 3반', { icon: 'people_team', tint: true })}</div>
          <div class="ft">${K.btn('링크 복사', { primary: true, icon: 'copy' })}</div>`,
      })
      + K.tile({ x: 1.4, y: 2.6, s: 10.5 })
      + K.float({ right: 2.2, bottom: 2.4, icon: 'people_checkmark', s: 6.4 })
      + K.pill({ right: 4, y: 4.6, icon: 'bot_sparkle', text: '반복 질문 자동 응답' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.2cqw; padding-right: 1.8cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .ag { display: flex; flex-direction: column; gap: 2.6cqw; height: 100%; padding: 3.2cqw 3.4cqw 0; }
      .ag .prompt { margin-right: 8cqw; font-size: 2.3cqw; }
      .hero { display: flex; align-items: center; gap: 2cqw; }
      .av { flex: none; display: grid; place-items: center; width: 8cqw; height: 8cqw; border-radius: 2.2cqw; background: var(--grad); color: #fff; box-shadow: 0 1cqw 2.4cqw -1cqw rgba(var(--tint), .8); }
      .nm { display: flex; flex-direction: column; gap: 1.2cqw; }
      .nm b { font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .sg { display: flex; flex-direction: column; gap: 1.4cqw; padding-right: 8cqw; }
      .sq { display: flex; align-items: center; gap: 1.4cqw; height: 5.6cqw; padding: 0 2cqw; border-radius: 1.5cqw; background: rgba(255, 255, 255, .9); box-shadow: inset 0 0 0 .2cqw var(--line-2); color: rgb(var(--tint)); }
      .sq span { font-size: 2.6cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .sq.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .sh { z-index: 3; display: flex; flex-direction: column; gap: 1.7cqw; padding: 2.6cqw 2.8cqw 2.8cqw; }
      .hd { display: flex; align-items: center; gap: 1.2cqw; color: rgb(var(--tint)); margin-bottom: .4cqw; }
      .hd b { font-size: 2.8cqw; font-weight: 750; color: var(--ink); letter-spacing: -0.02em; }
      .op { display: flex; align-items: center; gap: 1.3cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.3cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); color: var(--ink); }
      .who { padding-left: 5cqw; }
      .who .chip { font-size: 2.4cqw; font-weight: 700; }
      .ft { display: flex; justify-content: flex-start; padding-left: 5cqw; }
      .ft .btn { padding: 1cqw 2cqw; font-size: 2.3cqw; }
    `,
  });
})();
