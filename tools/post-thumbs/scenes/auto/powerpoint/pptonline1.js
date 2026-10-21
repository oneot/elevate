(() => {
  // 웹 버전 시작하기 — 이름 입력 칸에서 제목을 바꾸고, 리본 옵션에서 '한 줄 리본'으로 슬라이드를 넓게
  scene('powerpoint/pptonline1', (K) => {
    const opt = (label, on) => `<div class="op${on ? ' on' : ''}"><i class="radio${on ? ' on' : ''}"></i><span>${label}</span></div>`;
    const tool = (name) => `<span class="tl">${K.ico(`${name}:r`, { s: 2.8 })}</span>`;
    return K.win({
      x: 4, y: 10, w: 66, h: 50, icon: false,
      title: `<span class="nm">2학년 과학 수업${K.ico('edit:r', { s: 2.4 })}</span>`,
      barRight: K.btn('공유', { primary: true, icon: 'share' }),
      body: `<div class="ed">
        <div class="tabs"><span class="on">홈</span><span>삽입</span><span>그리기</span><span>디자인</span></div>
        <div class="one">
          ${['arrow_undo', 'slide_add', 'text_bold', 'text_italic', 'text_align_left', 'shapes', 'image'].map(tool).join('')}
          <span class="grow"></span>
          <span class="rb">${K.ico('chevron_down', { s: 2.8 })}</span>
        </div>
        <div class="cv"><div class="slide sl">
          <h4>식물의 한살이</h4>
          <div class="ln">${K.skel('70%', { h: 1.5 })}${K.skel('52%', { h: 1.5 })}</div>
          <div class="pic"></div>
        </div></div>
      </div>`,
    })
      + K.card({
        x: 50, y: 28.4, w: 34, cls: 'pop',
        body: `<b class="hd">리본 레이아웃</b>
          ${opt('클래식 리본')}${opt('한 줄 리본', true)}
          <i class="dv"></i>
          <div class="op more"><span>리본 표시</span>${K.ico('chevron_right:r', { s: 2.6 })}</div>`,
      })
      + K.tile({ x: 1.2, y: 3.6, s: 10.5 })
      + K.float({ right: 7, y: 6, app: 'onedrive', s: 6.4, far: true })
      + K.pill({ x: 5, bottom: 2.4, icon: 'arrow_autofit_width', text: '슬라이드를 더 넓게', dark: true });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.6cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .nm { display: inline-flex; align-items: center; gap: 1cqw; padding: .7cqw 1.4cqw; border-radius: 1cqw; background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); font-size: 2.8cqw; font-weight: 750; color: var(--ink); }
      .nm .ico { color: rgb(var(--tint)); }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .tabs { display: flex; align-items: center; gap: 3cqw; height: 5.4cqw; padding: 0 3cqw; font-size: 2.6cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
      .tabs > .on { color: rgb(var(--tint)); font-weight: 750; }
      .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: .2cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .one { display: flex; align-items: center; gap: .9cqw; height: 6cqw; margin: 0 2.2cqw; padding: 0 1cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .85); box-shadow: 0 0 0 .15cqw rgba(20, 22, 30, .06); }
      .tl { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: .9cqw; color: var(--ink-3); }
      .rb { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .cv { flex: 1; margin-top: 2cqw; padding: 2.6cqw 0 0 3cqw; background: rgba(243, 243, 246, .7); }
      .sl { width: 42cqw; }
      .sl h4 { position: absolute; left: 3cqw; top: 3cqw; font-size: 3.4cqw; font-weight: 800; letter-spacing: -0.035em; white-space: nowrap; }
      .ln { position: absolute; left: 3cqw; top: 9.6cqw; width: 18cqw; display: grid; gap: 1.4cqw; }
      .pic { position: absolute; right: 3cqw; top: 3cqw; width: 15cqw; height: 12.6cqw; border-radius: 1cqw; background: radial-gradient(circle at 70% 30%, #ffd08a 0 14%, transparent 15%), linear-gradient(180deg, #ffe7d6, #fff3ea 60%, #9bd38a 60%, #6fbf6a); }
      .pop { z-index: 3; padding: 2.4cqw 2.4cqw 1.8cqw; display: flex; flex-direction: column; gap: .5cqw; }
      .hd { font-size: 2.1cqw; font-weight: 700; color: var(--ink-4); padding: 0 1.2cqw .4cqw; white-space: nowrap; }
      .dv { height: .2cqw; margin: .6cqw 1.2cqw; background: var(--line); }
      .more { justify-content: space-between; color: var(--ink-3); }
      .op { display: flex; align-items: center; gap: 1.4cqw; padding: 1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.5cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: var(--ink); font-weight: 750; font-size: 2.8cqw; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
    `,
  });
})();
