/* copilot-studio scenes — see STYLE_GUIDE.md */
(() => {

// Stage-space geometry (cqw) of an element, for connector lines drawn in `after`.
const geo = (stage) => {
  const b = stage.getBoundingClientRect();
  const k = 100 / b.width;
  return (sel) => {
    const el = typeof sel === 'string' ? stage.querySelector(sel) : sel;
    const r = el.getBoundingClientRect();
    const l = (r.left - b.left) * k, t = (r.top - b.top) * k, w = r.width * k, h = r.height * k;
    return { l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 };
  };
};
const tintOf = (stage) => `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;

/* 1. AI Creative Agent Team — one request, five finished files */
scene('copilot-studio/copilotstudio', (K) => {
  const file = (name, ext, icon, bg, dbg) => `<div class="f"><div class="pv" style="--bg:${bg};--dbg:${dbg}">${icon}</div><b>${name}</b><span>.${ext}</span></div>`;
  return K.win({
    x: 7, y: 9.5, w: 86, h: 50, title: 'AI Creative Agent Team', sub: ' · 테스트',
    body: `<div class="ct">
      ${K.bubble('가을 과학 축제 홍보 자료 만들어 줘', { me: true })}
      <div class="ans">${K.app(null, { s: 3.4 })}<span>전문가 5명이 만든 파일이에요</span></div>
      <div class="files">
        ${file('발표자료', 'pptx', K.app('powerpoint', { s: 5 }), '#fdeee8', 'rgba(255, 128, 92, .2)')}
        ${file('포스터', 'html', K.ico('image', { s: 4.6, c: 'var(--pink)' }), '#fdebf3', 'rgba(255, 122, 184, .2)')}
        ${file('제안서', 'docx', K.app('word', { s: 5 }), '#e9f0fc', 'rgba(90, 162, 255, .2)')}
        ${file('웹페이지', 'html', K.ico('globe', { s: 4.6, c: 'var(--blue)' }), '#e8f1fd', 'rgba(90, 162, 255, .18)')}
        ${file('예산 분석', 'xlsx', K.app('excel', { s: 5 }), '#e7f4ec', 'rgba(63, 214, 143, .2)')}
      </div>
    </div>`,
  }) + K.pill({ right: 5, y: 4.6, icon: 'people_team', text: '한 번에 결과물 5개' });
}, {
  css: `
    .ct { display: flex; flex-direction: column; gap: 2.2cqw; padding: 3cqw 3.2cqw; }
    .ans { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.5cqw; font-weight: 650; letter-spacing: -0.02em; }
    .files { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.6cqw; }
    .f { padding: 1cqw 1cqw 1.4cqw; border-radius: 1.6cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
    .pv { display: grid; place-items: center; height: 10.4cqw; border-radius: 1.1cqw; background: var(--bg); }
    .f b { display: block; margin: 1.2cqw .4cqw 0; font-size: 2.35cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
    .f span { display: block; margin: .2cqw .4cqw 0; font-size: 1.85cqw; font-weight: 600; color: var(--ink-4); }
    &.dark .f { background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .12); }
    &.dark .pv { background: var(--dbg); }
  `,
});

/* 2. Single → multi agent — parent agent delegating to three child agents */
scene('copilot-studio/copilot-studio-multi-agent', (K) => {
  const kid = (icon, name, i) => K.card({
    x: 6 + i * 30.5, y: 34, w: 27, cls: `kid k${i}`,
    body: `<span class="ni">${K.ico(icon, { s: 3.2 })}</span><b>${name}</b><small>자식 에이전트</small>`,
  });
  return K.card({
    x: 31, y: 15.5, w: 38, top: true, cls: 'par',
    body: `<div class="nd">${K.app(null, { s: 5.4 })}<div class="grow"><b>정보 교사</b><small>부모 에이전트</small></div>${K.chip('Skill', { icon: 'puzzle_piece', tint: true })}</div>`,
  })
    + kid('clipboard_task', '수업 설계안', 0) + kid('code', '파이썬 코딩 테스트', 1) + kid('document_text', '학습지 제작', 2)
    + '<div class="links"></div>'
    + K.pill({ x: 4.5, y: 4.8, icon: 'organization', text: '역할을 나눠 맡겨요' });
}, {
  css: `
    .nd { display: flex; align-items: center; gap: 1.6cqw; padding: 2.4cqw 2.6cqw; }
    .nd b { display: block; font-size: 3.1cqw; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2; }
    .nd small { display: block; margin-top: .3cqw; font-size: 2cqw; font-weight: 600; color: var(--ink-4); }
    .kid { display: flex; flex-direction: column; align-items: center; padding: 2cqw 1.4cqw 1.8cqw; text-align: center; }
    .kid .ni { display: grid; place-items: center; width: 5.4cqw; height: 5.4cqw; margin-bottom: 1.2cqw; border-radius: 1.5cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
    .kid b { font-size: 2.45cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
    .kid small { margin-top: .3cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); }
    &.dark .kid .ni { background: rgba(var(--tint), .18); }
  `,
  after(stage, K) {
    const g = geo(stage);
    const c = tintOf(stage);
    const p = g('.par');
    let svg = '';
    [0, 1, 2].forEach((i) => {
      const k = g(`.k${i}`);
      svg += K.curve(p.cx, p.b, k.cx, k.t - 0.6, { c, bend: 'v', dot: i === 0 });
    });
    stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
  },
  // Big object top-right, clear of the child nodes (white text over it washes out in dark).
  deco: { v: 2 },
});

/* 3. Workflow → KMA weather API — flow nodes and the observed-weather answer */
scene('copilot-studio/new-copilot-studio-api', (K) => {
  const step = (icon, title, sub, cls = '') => `<div class="st ${cls}"><span class="ni">${K.ico(icon, { s: 2.8 })}</span><div><b>${title}</b><small>${sub}</small></div></div>`;
  return K.win({
    x: 5, y: 8, w: 55, h: 51, title: '기상청-관측-api', sub: ' · 워크플로',
    body: `<div class="cv">
      ${step('flash', '에이전트가 호출할 때', '입력값 tm · stn')}
      <i class="ar"></i>
      ${step('globe', 'HTTP 요청', '<code>GET apihub.kma.go.kr</code>', 'on')}
      <i class="ar"></i>
      ${step('arrow_reply', '에이전트에 응답', '기온 · 습도 · 강수량', 'end')}
    </div>`,
  })
    + K.card({
      x: 64, y: 19, w: 31, cls: 'wx',
      body: `<p class="t-s">대전 · 12시 관측</p>
        <div class="tmp">${K.ico('weather_rain_showers_day', { s: 6 })}<span class="t-num">16.1℃</span></div>
        <div class="row" style="gap:.9cqw">${K.chip('습도 94%')}${K.chip('비 0.2mm')}</div>`,
    })
    + '<div class="links"></div>'
    + K.pill({ right: 5, y: 5, icon: 'weather_partly_cloudy_day', text: '실제 관측 날씨로 답변' });
}, {
  css: `
    .cv { height: 100%; padding: 3.2cqw 0; display: flex; flex-direction: column; align-items: center;
      background: radial-gradient(circle, #dfe3e8 .16cqw, transparent .2cqw) 0 0 / 2.4cqw 2.4cqw; }
    .st { display: flex; align-items: center; gap: 1.4cqw; width: 41cqw; padding: 1.3cqw 2cqw 1.3cqw 1.3cqw; border-radius: 1.6cqw; background: #fff;
      box-shadow: 0 0 0 .22cqw rgba(15, 23, 42, .07), 0 1.6cqw 3cqw -1.8cqw rgba(var(--tint), .45); }
    .st.on { box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 1.6cqw 3cqw -1.8cqw rgba(var(--tint), .45); }
    .ni { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
    .st b { display: block; font-size: 2.45cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .st small { display: block; margin-top: .2cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    .st code { font-family: var(--mono); font-size: 1.85cqw; }
    .ar { position: relative; width: .3cqw; height: 3.4cqw; background: #c4c9d0; }
    .ar::after { content: ''; position: absolute; left: 50%; bottom: .1cqw; width: 1.1cqw; height: 1.1cqw; translate: -50% 0; rotate: 45deg; border-right: .3cqw solid #c4c9d0; border-bottom: .3cqw solid #c4c9d0; }
    .wx { padding: 2.6cqw 2.8cqw 2.8cqw; }
    .tmp { display: flex; align-items: center; gap: 1.4cqw; margin: 1.4cqw 0 2cqw; color: #f0a12e; }
    .tmp .t-num { color: var(--ink); }
    &.dark {
      .cv { background-image: radial-gradient(circle, rgba(255, 255, 255, .14) .16cqw, transparent .2cqw); }
      .st { background: rgba(255, 255, 255, .09); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14), 0 1.6cqw 3cqw -1.8cqw rgba(4, 10, 20, .45); }
      .st.on { background: rgba(var(--tint), .1); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .45); }
      .ni { background: rgba(var(--tint), .18); }
      .ar { background: rgba(255, 255, 255, .34); }
      .ar::after { border-color: rgba(255, 255, 255, .34); }
      .tmp { color: #ffbe4d; }
    }
  `,
  after(stage, K) {
    const g = geo(stage);
    const a = g('.end');
    const w = g('.wx');
    stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r + 0.6, a.cy, w.l - 0.9, w.cy, { c: tintOf(stage), dot: true }), { z: 2 });
  },
});

/* 4. Mood type test — quick-reply questions on a phone, then the result card */
scene('copilot-studio/post', (K) => {
  const opt = (t, on) => `<span class="op${on ? ' on' : ''}">${t}</span>`;
  return `<div class="phone" style="left:9cqw;top:10cqw;--w:25cqw"><div class="phone__screen"><div class="ph">
      <div class="hd">${K.app(null, { s: 2.8 })}<b>무드 타입 테스트</b></div>
      <div class="progress" style="height:.9cqw"><i style="--p:60%"></i></div>
      ${K.bubble('주말에 가장 끌리는 활동은?')}
      <div class="ops">${opt('음악 들으며 쉬기')}${opt('친구랑 수다 떨기', true)}${opt('새로운 곳 탐험')}</div>
    </div></div></div>`
    + K.card({
      x: 41, y: 10, w: 53, top: true, cls: 'res',
      body: `<div class="in">
        <p class="lb">${K.ico('sparkle', { s: 2.6 })}나의 무드 타입</p>
        <h4>텐션업 분위기메이커</h4>
        <div class="row" style="gap:.9cqw">${K.chip('#활발함', { tint: true })}${K.chip('#리액션', { tint: true })}${K.chip('#장난', { tint: true })}</div>
        <div class="sep" style="margin:2.4cqw 0 2cqw"></div>
        <p class="t-xs">오늘의 미션</p>
        <p class="t-b" style="margin-top:.4cqw">친구 한 명 크게 웃게 하기</p>
      </div>`,
    })
    + K.pill({ right: 6, bottom: 5, icon: 'emoji_laugh', text: '질문 5개로 타입 찾기' });
}, {
  css: `
    .ph { display: flex; flex-direction: column; gap: 1.5cqw; padding: 4.4cqw 1.6cqw 0; }
    .hd { display: flex; align-items: center; gap: 1cqw; font-size: 2cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .ph .bubble { max-width: 92%; font-size: 2cqw; padding: 1.2cqw 1.6cqw; }
    .ops { display: flex; flex-direction: column; gap: 1cqw; margin-top: .4cqw; }
    .op { padding: 1.1cqw 1.4cqw; border-radius: 99px; font-size: 1.95cqw; font-weight: 650; text-align: center; color: rgb(var(--tint)); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); white-space: nowrap; }
    .op.on { background: rgb(var(--tint)); color: #fff; box-shadow: none; }
    .in { padding: 2.8cqw 3.2cqw 3.2cqw; }
    .lb { display: flex; align-items: center; gap: .8cqw; font-size: 2.15cqw; font-weight: 650; color: rgb(var(--tint)); }
    h4 { margin: 1.2cqw 0 1.8cqw; font-size: 3.9cqw; font-weight: 750; letter-spacing: -0.04em; }
    &.dark .op { box-shadow: inset 0 0 0 .2cqw rgba(var(--tint), .55); }
    &.dark .op.on { background: var(--solid); color: #fff; box-shadow: inset 0 .15cqw 0 rgba(255, 255, 255, .25); }
  `,
});

/* 5. Shipyard welding agent — overview page grounded on uploaded standards */
scene('copilot-studio/ai-agent', (K) => {
  const doc = (name, on) => `<div class="doc${on ? ' on' : ''}">${K.ico('document_pdf', { s: 2.8, c: 'var(--pdf)' })}<span>${name}</span></div>`;
  return K.win({
    x: 37, y: 10.5, w: 59, h: 49, title: '용접 작업 지원 에이전트', sub: ' · 개요',
    body: `<div class="ov">
      <div class="sec">${K.ico('text_bullet_list_ltr', { s: 2.8, c: 'var(--ink-3)' })}<b>지침</b><div class="grow">${K.skel('92%')}${K.skel('64%', { style: 'margin-top:1cqw' })}</div></div>
      <div class="sec kn hl">
        <div class="kh">${K.ico('book', { s: 2.8 })}<b>지식</b>${K.chip('4개', { tint: true })}</div>
        <div class="docs">${doc('용접 작업 표준서')}${doc('품질 검사 기준서')}${doc('용접 결함 사례집', true)}${doc('안전관리 지침')}</div>
      </div>
    </div>`,
  })
    + K.card({
      x: 4, y: 19.5, w: 30, cls: 'qa',
      body: `<div class="in">
        ${K.bubble('기공 결함 원인은?', { me: true })}
        <div class="bot">${K.skel('94%')}${K.skel('80%')}${K.skel('58%')}
          ${K.chip('용접 결함 사례집', { icon: 'document_pdf', line: true })}</div>
      </div>`,
    })
    + K.pill({ x: 4.5, y: 5, icon: 'document_search', text: '문서 근거로 바로 답변' });
}, {
  css: `
    --pdf: #d1453b;
    .ov { display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw; }
    .sec { display: flex; align-items: center; gap: 1.3cqw; padding: 1.8cqw 2.2cqw; border-radius: 1.6cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
    .sec b { font-size: 2.5cqw; font-weight: 700; margin-right: 1.4cqw; }
    .kn { display: block; padding: 2cqw 2.2cqw 2.2cqw; box-shadow: none; }
    .kh { display: flex; align-items: center; gap: 1.2cqw; color: rgb(var(--tint)); }
    .kh b { color: var(--ink); margin-right: 0; }
    .docs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2cqw; margin-top: 1.8cqw; }
    .doc { display: flex; align-items: center; gap: 1cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.1cqw; background: var(--fill); font-size: 2.2cqw; font-weight: 600; white-space: nowrap; }
    .doc.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
    .qa .in { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.4cqw; }
    .qa .bubble { max-width: 100%; white-space: nowrap; }
    .bot { display: flex; flex-direction: column; gap: 1cqw; padding: 1.8cqw 1.8cqw 1.8cqw; border-radius: 1.6cqw 1.6cqw 1.6cqw .6cqw; background: #f1f2f6; }
    .bot .skel { background: #d9dce3; }
    .bot .chip { align-self: flex-start; margin-top: .6cqw; font-size: 2cqw; color: var(--ink-2); }
    .bot .chip .ico { color: var(--pdf); }
    &.dark {
      --pdf: #ff7d74;
      .doc.on { background: rgba(var(--tint), .14); box-shadow: inset 0 0 0 .2cqw rgba(var(--tint), .55); }
      .bot { background: rgba(255, 255, 255, .08); }
      .bot .skel { background: rgba(255, 255, 255, .2); }
    }
  `,
});

/* 6. Chemical plant incident agent — a topic fires and answers with SOP steps */
scene('copilot-studio/copilot-studio-workshop-chemicalfactory', (K) => {
  const stepRow = (n, t) => `<div class="sr"><span class="n">${n}</span>${t}</div>`;
  return K.card({
    x: 5, y: 15, w: 29, top: true, cls: 'tp',
    body: `<div class="in">
      <p class="lb">${K.ico('flash', { s: 2.4 })}토픽</p>
      <b>반응기 과열 대응</b>
      <p class="t-xs" style="margin:1.6cqw 0 .9cqw">트리거 문구</p>
      <div class="ph">${K.chip('반응기 과열')}${K.chip('온도 급상승')}</div>
    </div>`,
  })
    + K.win({
      x: 37, y: 7, w: 58, h: 52, title: '화학 공장 관리 에이전트', sub: ' · 테스트',
      body: `<div class="ch">
        ${K.bubble('반응기 온도가 계속 올라가요', { me: true })}
        <div class="al">
          <p class="ah">${K.ico('warning', { s: 2.8 })}즉시 조치하세요</p>
          ${stepRow(1, '원료 투입 즉시 중지')}${stepRow(2, '냉각수 밸브 최대 개방')}${stepRow(3, '현장 인원 대피 준비')}
          ${K.chip('반응기 운전 SOP', { icon: 'document_pdf', line: true })}
        </div>
      </div>`,
    })
    + '<div class="links"></div>'
    + K.pill({ x: 5, bottom: 5, icon: 'alert_urgent', text: '사고에 바로 대응' });
}, {
  css: `
    .tp .in { padding: 2.2cqw 2.4cqw 2.6cqw; }
    .lb { display: flex; align-items: center; gap: .7cqw; font-size: 2cqw; font-weight: 700; color: rgb(var(--tint)); }
    .tp b { display: block; margin-top: .7cqw; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
    .ph { display: flex; flex-wrap: wrap; gap: .8cqw; }
    .ph .chip { font-size: 2cqw; }
    .ch { display: flex; flex-direction: column; gap: 2cqw; padding: 2.8cqw 3cqw; }
    .al { display: flex; flex-direction: column; gap: 1.2cqw; padding: 2cqw 2.4cqw 2.2cqw 2.8cqw; border-radius: 1.6cqw; background: #fff; box-shadow: inset .6cqw 0 0 var(--red), inset 0 0 0 .2cqw var(--line-2), 0 1.4cqw 2.6cqw -1.6cqw rgba(15, 23, 42, .18); }
    .ah { display: flex; align-items: center; gap: 1cqw; margin-bottom: .2cqw; font-size: 2.6cqw; font-weight: 700; color: #c4302b; letter-spacing: -0.02em; }
    .sr { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .n { display: grid; place-items: center; width: 2.9cqw; height: 2.9cqw; border-radius: 50%; background: #fbe1df; color: #c4302b; font-size: 1.85cqw; font-weight: 700; }
    .al .chip { align-self: flex-start; margin-top: .5cqw; font-size: 2cqw; }
    .al .chip .ico { color: #d1453b; }
    &.dark {
      .al { background: rgba(255, 255, 255, .09); box-shadow: inset .6cqw 0 0 var(--red), inset 0 0 0 .15cqw rgba(255, 255, 255, .14), 0 1.4cqw 2.6cqw -1.6cqw rgba(4, 10, 20, .4); }
      .ah { color: #ff8f88; }
      .n { background: rgba(255, 107, 102, .2); color: #ffa29c; }
      .al .chip .ico { color: #ff7d74; }
    }
  `,
  after(stage, K) {
    const g = geo(stage);
    const a = g('.tp');
    const b = g('.al');
    stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r - 0.4, a.cy, b.l - 0.9, b.t + 3.4, { c: tintOf(stage), dot: true, dash: true }), { z: 2 });
  },
});

})();
