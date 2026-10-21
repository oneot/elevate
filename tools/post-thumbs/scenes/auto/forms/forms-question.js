/* Forms — 질문 유형 알아보기 (v3) */
(() => {
  // The 리커트 척도 question being edited: shared levels across statements, with the type bar below.
  scene('forms/forms-question', (K) => {
    const cells = (on) => [1, 2, 3, 4, 5].map((i) => `<i class="radio${i === on ? ' on' : ''}"></i>`).join('');
    const row = (label, on) => `<div class="lr"><span class="st">${label}</span>${cells(on)}</div>`;
    const type = (icon, label, on) => `<span class="ty${on ? ' on' : ''}">${K.ico(icon, { s: 2.6 })}${label}</span>`;
    return K.win({
      x: 4, y: 9, w: 66, h: 50, title: '2학기 수업 평가', icon: false,
      body: `<div class="lk">
        <div class="qh"><p class="q">3. 이번 학기 수업은 어땠나요?</p><span class="rq">필수<i class="toggle on"></i></span></div>
        <div class="grid">
          <div class="lr hd"><span class="st"></span><b>아니다</b><span></span><span></span><span></span><b>그렇다</b></div>
          ${row('수업이 재미있었다', 5)}
          ${row('모둠 활동이 도움이 됐다', 4)}
        </div>
        <p class="add">${K.ico('add', { s: 2.6 })}명령문 추가</p>
        <div class="types">
          ${type('radio_button:r', '선택 항목')}${type('text_t:r', '텍스트')}${type('star:r', '평가')}${type('table_simple', '리커트', true)}
        </div>
      </div>`,
    })
      + K.tile({ x: 1.2, y: 3.6, s: 10.5 })
      + K.float({ right: 13, y: 21, icon: 'star' })
      + K.float({ right: 5, y: 33, icon: 'arrow_upload', far: true })
      + K.pill({ right: 3.6, y: 4.4, icon: 'apps_list', text: '문항에 맞는 질문 형식' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .lk { height: 100%; padding: 2.8cqw 3.4cqw 0; display: flex; flex-direction: column; }
      .qh { display: flex; align-items: center; justify-content: space-between; gap: 1.6cqw; margin-bottom: 2.2cqw; }
      .q { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .rq { display: inline-flex; align-items: center; gap: 1.1cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .grid { display: grid; gap: .9cqw; }
      .lr { display: grid; grid-template-columns: 1fr repeat(5, 5.2cqw); align-items: center; justify-items: center; padding: 1.2cqw 1.6cqw; border-radius: 1.2cqw; background: rgba(245, 247, 248, .85); }
      .lr .st { justify-self: stretch; font-size: 2.45cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .lr .radio { width: 2.7cqw; height: 2.7cqw; }
      .lr.hd { padding-top: 0; padding-bottom: 0; background: none; }
      .lr.hd b { font-size: 2.05cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .add { display: flex; align-items: center; gap: .8cqw; margin: 1.8cqw 0 0 1.6cqw; font-size: 2.4cqw; font-weight: 700; color: rgb(var(--tint)); }
      .types { display: flex; gap: 1.2cqw; margin-top: 2.2cqw; padding-top: 2.2cqw; border-top: .2cqw solid #eef0f3; }
      .ty { display: inline-flex; align-items: center; gap: .8cqw; padding: 1cqw 1.6cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw #e3e8ea; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .ty .ico { color: var(--ink-3); }
      .ty.on { background: var(--grad); box-shadow: none; color: #fff; }
      .ty.on .ico { color: #fff; }
    `,
  });
})();
