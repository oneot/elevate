/* Forms scenes — see STYLE_GUIDE.md */
(() => {

scene('forms/forms-option', (K) => {
  const section = (no, title, lines) => `<div class="in"><span class="tag">섹션 ${no}</span><h5>${title}</h5>${lines.map((w) => K.skel(w, { style: 'margin-top:1.3cqw' })).join('')}</div>`;
  return K.card({
    x: 6, y: 8.5, w: 45, top: true, cls: 'from',
    body: `<div class="in">
      <span class="tag">섹션 1</span><h5>참가 여부</h5>
      <p class="q">현장체험학습에 참가하나요?</p>
      <div class="opt on" data-a="yes"><span class="radio on"></span>예</div>
      <div class="opt" data-a="no"><span class="radio"></span>아니요</div>
    </div>`,
  })
    + K.card({ right: 5.5, y: 6.5, w: 32, top: true, body: section(2, '참가 정보', ['92%', '64%']), cls: 'to-yes' })
    + K.card({ right: 5.5, y: 31, w: 32, top: true, body: section(3, '불참 사유', ['86%', '58%']), cls: 'to-no' })
    + '<div class="links"></div>'
    + K.pill({ x: 4.5, bottom: 2.6, icon: 'branch_fork', text: '응답 따라 섹션 이동', dark: true });
}, {
  css: `
    .in { padding: 2.2cqw 2.6cqw 2.6cqw; }
    .tag { display: inline-flex; font-size: 2.1cqw; font-weight: 700; color: rgb(var(--tint)); letter-spacing: .02em; }
    h5 { margin: .8cqw 0 0; font-size: 3.1cqw; font-weight: 700; letter-spacing: -0.03em; }
    .q { margin: 2cqw 0 1.6cqw; font-size: 2.45cqw; font-weight: 600; letter-spacing: -0.02em; color: #2b2d31; white-space: nowrap; }
    .opt { display: flex; align-items: center; gap: 1.2cqw; margin-top: 1.1cqw; padding: 1.1cqw 1.4cqw; border-radius: 1cqw; background: #f5f7f8; font-size: 2.3cqw; font-weight: 600; }
    .opt.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
  `,
  // Branch arrows: from each answer to the section it jumps to.
  after(stage, K) {
    const box = stage.getBoundingClientRect();
    const toU = (px, origin) => ((px - origin) / box.width) * 100;
    const tint = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
    let svg = '';
    [['yes', '.to-yes'], ['no', '.to-no']].forEach(([a, sel]) => {
      const from = stage.querySelector(`[data-a="${a}"]`).getBoundingClientRect();
      const to = stage.querySelector(sel).getBoundingClientRect();
      const x1 = toU(from.right, box.left) - 1.2;
      const y1 = toU(from.top + from.height / 2, box.top);
      const x2 = toU(to.left, box.left) - 0.9;
      const y2 = toU(to.top, box.top) + 7.4;
      svg += K.curve(x1, y1, x2, y2, { c: tint, dot: true, dash: a === 'no' });
    });
    stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
  },
});
// Settings + responses: the 응답 tab's donut summary, with the response options beside it.
scene('forms/forms-share', (K) => {
  const legend = [['과학관', 14, 'rgb(var(--tint))'], ['박물관', 9, '#5cc6cc'], ['놀이공원', 5, '#bfe5e7']];
  const tg = (label, on) => `<div class="tg"><span>${label}</span><i class="toggle${on ? ' on' : ''}"></i></div>`;
  return K.win({
    x: 36, y: 8.5, w: 60, h: 50, title: '체험학습 장소 설문',
    body: `<div class="tabs"><span>질문</span><span class="on">응답 <b>28</b></span></div>
      <div class="res">
        <p class="q">1. 가고 싶은 장소는?</p>
        <div class="row" style="gap:4.4cqw">
          <div class="pie"><div><b>28</b><small>응답</small></div></div>
          <div class="lg">${legend.map(([l, n, c]) => `<div><i style="background:${c}"></i><span>${l}</span><b>${n}</b></div>`).join('')}</div>
        </div>
      </div>`,
  })
    + K.card({
      x: 4, y: 23, w: 33.5, cls: 'set',
      body: `<div class="hd">${K.ico('settings:r', { s: 2.8 })}<b>응답 옵션</b></div>${tg('응답 수락', true)}${tg('진행률 표시줄', true)}`,
    })
    + K.pill({ x: 4, y: 4.4, icon: 'data_pie', text: '응답 결과를 한눈에' });
}, {
  css: `
    .tabs { display: flex; justify-content: center; gap: 4.4cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.4cqw; font-weight: 650; color: var(--ink-4); }
    .tabs span { padding: 1.3cqw .4cqw 1.2cqw; }
    .tabs .on { color: var(--ink); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
    .tabs b { margin-left: .4cqw; color: rgb(var(--tint)); }
    .res { padding: 2.8cqw 4cqw 0 4.8cqw; }
    .q { margin-bottom: 2.4cqw; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; }
    .pie { position: relative; flex: none; width: 17cqw; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(rgb(var(--tint)) 0 50%, #5cc6cc 0 82.1%, #bfe5e7 0); }
    .pie::before { content: ''; position: absolute; inset: 3cqw; border-radius: 50%; background: #fff; }
    .pie > div { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
    .pie b { font-size: 4.6cqw; font-weight: 750; letter-spacing: -0.05em; line-height: 1; }
    .pie small { margin-top: .3cqw; font-size: 1.9cqw; font-weight: 650; color: var(--ink-4); }
    .lg { flex: 1; display: grid; gap: 1.6cqw; }
    .lg div { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); }
    .lg i { width: 1.8cqw; height: 1.8cqw; border-radius: .5cqw; }
    .lg span { flex: 1; }
    .lg b { font-weight: 700; color: var(--ink); }
    .set { padding: 2.4cqw 2.6cqw 1.4cqw; }
    .set .hd { display: flex; align-items: center; gap: 1.1cqw; margin-bottom: 1cqw; color: rgb(var(--tint)); }
    .set .hd b { font-size: 2.6cqw; font-weight: 750; color: var(--ink); }
    .tg { display: flex; align-items: center; justify-content: space-between; padding: 1.3cqw 0; font-size: 2.35cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .tg + .tg { border-top: .2cqw solid #f0f2f4; }
  `,
});

// Quiz: the correct answer and points set in the editor, auto-graded on the student's phone.
scene('forms/forms-quiz', (K) => {
  const opt = (v, ok) => `<div class="op${ok ? ' ok' : ''}">${ok ? K.ico('checkmark_circle', { s: 3, c: 'var(--green)' }) : '<i class="radio"></i>'}<span>${v}</span>${ok ? '<em>정답</em>' : ''}</div>`;
  const res = (ok, w) => `<div class="rr">${K.ico(ok ? 'checkmark_circle' : 'dismiss_circle', { s: 2.6, c: ok ? 'var(--green)' : 'var(--red)' })}${K.skel(w)}</div>`;
  return K.win({
    x: 4.5, y: 9, w: 61, h: 50, title: '1단원 형성평가', barRight: K.chip('총점 20점', { tint: true, cls: 'tot' }),
    body: `<div class="qz">
      <p class="q">2. <i>2x</i> + 3 = 11일 때, <i>x</i>의 값은?</p>
      <div class="ops">${opt('3')}${opt('4', true)}${opt('5')}${opt('6')}</div>
      <div class="pts"><span>점수</span><b>5</b></div>
    </div>`,
  })
    + `<div class="phone" style="--w:23.5cqw;${K.pos({ x: 70.5, y: 4.5 })}"><div class="phone__screen"><div class="ph">
        <p>${K.app(null, { s: 3 })}제출 완료</p>
        ${K.ring({ p: 90, value: '18', label: '/ 20점', s: 15.5, vs: 5 })}
        <div class="rl">${res(true, '78%')}${res(true, '62%')}${res(false, '70%')}</div>
      </div></div></div>`
    + K.pill({ x: 4.5, bottom: 4.6, dark: true, icon: 'checkmark_starburst', text: '제출하면 바로 채점' });
}, {
  css: `
    .win__bar .tot { padding: .6cqw 1.4cqw; font-size: 2.1cqw; }
    .qz { padding: 3.2cqw 3.6cqw 0; }
    .q { margin-bottom: 2.4cqw; font-size: 2.75cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .q i { font-family: "Times New Roman", serif; font-size: 1.12em; }
    .ops { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2cqw; }
    .op { display: flex; align-items: center; gap: 1.3cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.2cqw; background: #f5f7f8; font-size: 2.5cqw; font-weight: 650; }
    .op .radio { width: 2.6cqw; height: 2.6cqw; }
    .op.ok { background: #eaf7f0; box-shadow: inset 0 0 0 .25cqw #8fd6b0; }
    .op span { flex: 1; }
    .op em { font-size: 1.9cqw; font-style: normal; font-weight: 700; color: #1c8a55; }
    .pts { display: flex; align-items: center; justify-content: flex-end; gap: 1.2cqw; margin-top: 2.2cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
    .pts b { display: grid; place-items: center; width: 6cqw; height: 4.4cqw; border-radius: 1cqw; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); background: #fff; font-size: 2.5cqw; color: var(--ink); }
    .ph { display: flex; flex-direction: column; align-items: center; padding: 5.4cqw 2.4cqw 0; }
    .ph > p { display: flex; align-items: center; gap: .9cqw; margin-bottom: 3cqw; font-size: 2.3cqw; font-weight: 700; }
    .ph .t-xs { font-size: 2cqw; font-weight: 650; }
    .rl { align-self: stretch; display: grid; gap: 1.5cqw; margin-top: 3.4cqw; padding: 0 .6cqw; }
    .rr { display: flex; align-items: center; gap: 1.2cqw; }
    .rr .skel { height: 1.2cqw; }
  `,
});

// Question types: the 새 질문 menu with all eight types, previewing a 평가 (star rating) question.
scene('forms/forms-question', (K) => {
  const types = [['radio_button:r', '선택 항목'], ['text_t:r', '텍스트'], ['star:r', '평가', true], ['calendar_ltr:r', '날짜'], ['text_number_list_ltr:r', '순위'], ['table:r', '리커트'], ['arrow_upload:r', '파일 업로드'], ['number_row:r', 'Net Promoter Score®']];
  return K.win({
    x: 33, y: 12.5, w: 63, h: 47, title: '수업 만족도 조사',
    body: `<div class="qv">
      <div class="row" style="gap:1.4cqw">${K.chip('평가', { icon: 'star', tint: true, cls: 'ty-chip' })}<span class="t-xs">수준 5 · 별</span></div>
      <p class="q">1. 오늘 수업은 어땠나요?</p>
      <div class="stars">${[1, 2, 3, 4, 5].map((i) => K.ico(i <= 4 ? 'star' : 'star:r', { s: 6.4 })).join('')}</div>
    </div>`,
  })
    + K.card({ x: 4.5, y: 7, w: 32, cls: 'menu', body: types.map(([ic, l, on]) => `<div class="ty${on ? ' on' : ''}">${K.ico(ic, { s: 2.7 })}<span>${l}</span></div>`).join('') })
    + K.pill({ right: 4.5, bottom: 4.6, tint: true, icon: 'apps_list', text: '질문 형식 8가지 한눈에' });
}, {
  css: `
    .menu { padding: 1.3cqw; }
    .ty { display: flex; align-items: center; gap: 1.3cqw; padding: .95cqw 1.3cqw; border-radius: 1cqw; font-size: 2.15cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .ty .ico { color: var(--ink-3); }
    .ty.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); font-weight: 700; }
    .ty.on .ico { color: rgb(var(--tint)); }
    .qv { padding: 3.2cqw 3.4cqw 0 5.4cqw; }
    .ty-chip { padding: .6cqw 1.4cqw; font-size: 2cqw; }
    .ty-chip .ico { --s: 2.3cqw; }
    .q { margin: 2cqw 0 2.6cqw; font-size: 3cqw; font-weight: 700; letter-spacing: -0.03em; }
    .stars { display: flex; gap: 1.4cqw; color: rgb(var(--tint)); }
    .stars .ico:last-child { color: #b9c9ca; }
  `,
});

// Getting started: forms.office.com home with the two big entry points.
scene('forms/forms-inschool', (K) => {
  const rec = (icon, name, meta) => `<div class="rc"><span class="ri">${K.ico(icon, { s: 2.8 })}</span><b>${name}</b><span>${meta}</span></div>`;
  return K.win({
    x: 5, y: 12.5, w: 90, h: 47, title: 'Microsoft Forms', sub: ' · forms.office.com',
    body: `<div class="home">
      <div class="new">
        <div class="tile on">${K.ico('form_new', { s: 4.6 })}<b>새 양식</b></div>
        <div class="tile">${K.ico('quiz_new', { s: 4.6 })}<b>새 퀴즈</b></div>
      </div>
      <p class="t-s">최근</p>
      ${rec('form:r', '학교 만족도 조사', '응답 128')}
      ${rec('quiz_new:r', '1단원 형성평가', '응답 27')}
    </div>`,
  })
    + K.cursor({ x: 31, y: 31.5 })
    + K.pill({ right: 5, y: 4.4, icon: 'form_new', text: '설문도 퀴즈도 손쉽게' });
}, {
  css: `
    .home { padding: 3cqw 3.6cqw 0; }
    .new { display: flex; gap: 2cqw; margin-bottom: 3.2cqw; }
    .tile { display: flex; align-items: center; gap: 2cqw; width: 31cqw; height: 12cqw; padding: 0 3.4cqw; border-radius: 1.8cqw; background: #fff; box-shadow: inset 0 0 0 .22cqw #dfe7e8; color: rgb(var(--tint)); }
    .tile b { font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
    .tile.on { background: rgb(var(--tint)); box-shadow: 0 1.4cqw 2.8cqw -1.2cqw rgba(3, 120, 124, .6); color: #fff; }
    .tile.on b { color: #fff; }
    .home > .t-s { margin-bottom: 1cqw; }
    .rc { display: flex; align-items: center; gap: 1.6cqw; padding: 1.1cqw 0; border-bottom: .2cqw solid #f0f2f4; font-size: 2.4cqw; }
    .ri { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.1cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); }
    .rc b { flex: 1; font-weight: 650; }
    .rc > span:last-child { font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); }
  `,
});
})();
