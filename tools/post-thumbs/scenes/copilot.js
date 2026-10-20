/* copilot scenes — see STYLE_GUIDE.md */
(() => {
  const mix = (p) => `color-mix(in srgb, rgb(var(--tint)) ${p}%, #fff)`;

  /* Shared bits: light user bubble, citation badge, attached-file chip, icon tile. */
  const BASE = `
    .bubble--me { background: ${mix(12)}; color: var(--ink); }
    .cite { flex: none; display: inline-grid; place-items: center; min-width: 2.6cqw; height: 2.6cqw; padding: 0 .5cqw; border-radius: .7cqw; background: ${mix(14)}; color: rgb(var(--tint)); font-size: 1.85cqw; font-weight: 700; font-style: normal; }
    .file { display: inline-flex; align-items: center; gap: 1cqw; padding: .9cqw 1.7cqw .9cqw 1.1cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .file .app { --s: 3cqw; }
    .ti { flex: none; display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.3cqw; background: ${mix(12)}; color: rgb(var(--tint)); }
    .ti .ico { --s: 2.8cqw; }
  `;

  /* Edge-like browser chrome: tab strip + address bar (Copilot button or a custom right slot). */
  const chrome = (K, o) => `
    <div class="tabs"><span class="win__dots"><i></i><i></i><i></i></span>
      <span class="tab">${o.tabIcon}${o.tab}${K.ico('dismiss:r', { s: 1.9, c: 'var(--ink-4)' })}</span>
      ${K.ico('add:r', { s: 2.4, c: 'var(--ink-3)' })}
    </div>
    <div class="addr">
      ${K.ico('arrow_left:r', { s: 2.6, c: 'var(--ink-3)' })}${K.ico('arrow_clockwise:r', { s: 2.5, c: 'var(--ink-3)' })}
      <span class="url">${o.urlIcon || K.ico('lock_closed:r', { s: 2.2, c: 'var(--ink-4)' })}${o.url}</span>
      ${o.right || `<span class="cpb">${K.app('copilot', { s: 3 })}</span>`}
    </div>`;
  const CHROME = `
    .win__body { display: flex; flex-direction: column; }
    .tabs { flex: none; display: flex; align-items: flex-end; gap: 1.2cqw; height: 5.6cqw; padding: 0 2.2cqw; background: #eceef3; }
    .tabs .win__dots { align-self: center; margin-right: .6cqw; }
    .tabs > .ico { align-self: center; }
    .tab { display: flex; align-items: center; gap: 1cqw; height: 4.4cqw; padding: 0 1.4cqw 0 1.6cqw; border-radius: 1.2cqw 1.2cqw 0 0; background: #fff; font-size: 2.15cqw; font-weight: 600; white-space: nowrap; }
    .tab > .ico:last-child { margin-left: 1.4cqw; }
    .addr { flex: none; display: flex; align-items: center; gap: 1.8cqw; height: 6.2cqw; padding: 0 1.6cqw 0 2.2cqw; border-bottom: .2cqw solid #eceef2; }
    .url { flex: 1; min-width: 0; display: flex; align-items: center; gap: 1cqw; height: 4.2cqw; padding: 0 1.6cqw; border-radius: 99px; background: #f2f3f6; font-size: 2.15cqw; font-weight: 550; color: var(--ink-3); white-space: nowrap; }
    .cpb { flex: none; display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.3cqw; background: ${mix(14)}; box-shadow: inset 0 0 0 .2cqw ${mix(40)}; }
  `;

  /* Measures stage DOM and returns cqw coordinates helpers for after(). */
  const measure = (stage) => {
    const box = stage.getBoundingClientRect();
    const k = 100 / box.width;
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { l: (b.left - box.left) * k, t: (b.top - box.top) * k, r: (b.right - box.left) * k, b: (b.bottom - box.top) * k, w: b.width * k, h: b.height * k };
    };
    const tint = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
    return { r, tint };
  };

  /* 1 · 수업 설계하기 — the feedback agent built in the post answers on the rubric scale. */
  scene('copilot/copilot', (K) => K.win({
    x: 10, y: 9.5, w: 80, h: 50, icon: 'ico:bot', title: '학생 피드백 도우미', sub: '· 에이전트',
    body: `<div class="fb">
      <div class="me">
        <span class="file">${K.ico('document_text', { s: 2.8, c: 'var(--blue)' })}발표 관찰 메모</span>
        ${K.bubble('이 루브릭을 기준으로 부드럽게 피드백해 줘', { me: true })}
      </div>
      <div class="res">
        <div class="rh"><span class="ti">${K.ico('bot')}</span><b>2모둠 피드백</b><div class="seg"><span>우수</span><span class="on">보통</span><span>개선 필요</span></div></div>
        <div class="pt"><i style="--c:var(--green)"></i><b>잘한 점</b>${K.skel('36cqw')}</div>
        <div class="pt"><i style="--c:var(--amber)"></i><b>보완할 점</b>${K.skel('28cqw')}</div>
      </div>
    </div>`,
  }) + K.pill({ right: 5, y: 4.6, icon: 'person_feedback', text: '루브릭 기준 맞춤 피드백' }), {
    css: BASE + `
      .fb { display: flex; flex-direction: column; gap: 2.6cqw; padding: 3cqw 3.6cqw; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.1cqw; }
      .me .bubble { max-width: 100%; font-size: 2.4cqw; }
      .res { display: flex; flex-direction: column; gap: 1.7cqw; padding: 2.4cqw 2.8cqw 2.8cqw; border-radius: 1.8cqw; background: ${mix(6)}; }
      .rh { display: flex; align-items: center; gap: 1.4cqw; margin-bottom: .5cqw; }
      .rh > b { flex: 1; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; }
      .rh .ti { background: #fff; }
      .seg { display: flex; gap: .4cqw; padding: .5cqw; border-radius: 1.5cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .seg span { padding: 1cqw 2.4cqw; border-radius: 1.1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-4); white-space: nowrap; }
      .seg .on { background: rgb(var(--tint)); color: #fff; box-shadow: 0 .8cqw 1.8cqw -.8cqw rgba(var(--tint), .9); }
      .pt { display: flex; align-items: center; gap: 1.3cqw; padding-left: 1.6cqw; }
      .pt i { flex: none; width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: var(--c); }
      .pt b { flex: none; width: 11.5cqw; font-size: 2.45cqw; font-weight: 650; }
      .pt .skel { background: #e6e4f3; }
    `,
  });

  /* 2 · Teach — the Teach panel produced a lesson doc with a rubric table. */
  scene('copilot/teach', (K) => {
    const rows = ['내용 이해도', '자료·사례 활용', '해결 방안 타당성', '협력·참여도'];
    const w = [['84%', '62%', '46%'], ['76%', '70%', '52%'], ['88%', '58%', '40%'], ['72%', '66%', '50%']];
    return K.win({
      x: 37, y: 7, w: 66, h: 53, icon: 'word', title: '사회문제 탐구 프로젝트', dots: false,
      body: `<div class="doc">
        <p class="h">모둠 발표 평가 루브릭</p>
        <div class="rub">
          <b class="c0">평가 기준</b><b>우수</b><b>보통</b><b>미흡</b>
          ${rows.map((r, i) => `<span class="c0">${r}</span>${w[i].map((x) => `<span>${K.skel(x)}</span>`).join('')}`).join('')}
        </div>
      </div>`,
    }) + K.card({
      x: 4, y: 7.5, w: 36, cls: 'tp', body: `
        <div class="hd"><span class="ti">${K.ico('hat_graduation')}</span>Teach</div>
        <div class="seg"><span>수업 계획</span><span class="on">루브릭</span></div>
        <div class="ta">${K.skel('92%')}${K.skel('64%')}</div>
        <div class="ft">${K.btn('다음', { primary: true })}</div>`,
    }) + K.pill({ x: 4, bottom: 4.2, icon: 'document_sparkle', text: '수업안·루브릭을 문서로' });
  }, {
    css: BASE + `
      .win__bar { padding-left: 9.6cqw; }
      .doc { padding: 3.2cqw 6.4cqw 0 5.8cqw; }
      .h { margin-bottom: 2cqw; font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.03em; }
      .rub { display: grid; grid-template-columns: 18.6cqw repeat(3, 1fr); gap: .2cqw; border-radius: 1.2cqw; overflow: hidden; background: var(--line-2); box-shadow: 0 0 0 .2cqw var(--line-2); }
      .rub > * { display: flex; align-items: center; height: 5cqw; padding: 0 1.4cqw; background: #fff; font-size: 2.15cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .rub > b { justify-content: center; height: 4.4cqw; background: ${mix(10)}; color: var(--ink); font-weight: 700; }
      .rub > b.c0 { justify-content: flex-start; }
      .rub > span > .skel { width: 100%; }
      .tp { padding: 2.6cqw 2.8cqw 2.8cqw; display: flex; flex-direction: column; gap: 2cqw; }
      .tp .hd { display: flex; align-items: center; gap: 1.3cqw; font-size: 2.9cqw; font-weight: 700; letter-spacing: -0.02em; }
      .seg { display: flex; padding: .5cqw; border-radius: 1.5cqw; background: #f1f2f6; }
      .seg span { flex: 1; text-align: center; padding: .9cqw 0; border-radius: 1.1cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-4); white-space: nowrap; }
      .seg .on { background: #fff; color: rgb(var(--tint)); box-shadow: 0 .4cqw 1.2cqw -.4cqw rgba(15, 23, 42, .25); }
      .ta { display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.1cqw; border-radius: 1.4cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .ft { display: flex; justify-content: flex-end; }
    `,
  });

  /* 3 · Edge 수업 활용법 — textbook PDF on the left, Copilot pane explains the copied line. */
  scene('copilot/copilot5', (K) => K.win({
    x: 6, y: 7.5, w: 88, h: 52, bar: false,
    body: chrome(K, { tab: '과학3_교과서.pdf', tabIcon: K.ico('document_pdf', { s: 2.4, c: 'var(--red)' }), url: 'C:/교과서/과학3_교과서.pdf', urlIcon: K.ico('document_pdf:r', { s: 2.2, c: 'var(--ink-4)' }) }) + `
      <div class="split">
        <div class="pdf"><div class="pg">
          <p class="ch">Ⅱ. 물질의 구성</p>
          <p class="h">원소와 원자</p>
          ${K.skel('94%')}${K.skel('78%')}
          <p class="mk"><span class="cp">${K.ico('copy:r', { s: 2.3 })}복사</span><mark>원자는 원자핵과 전자로 이루어진다.</mark></p>
          ${K.skel('88%')}${K.skel('60%')}
        </div></div>
        <div class="pane">
          <div class="ph">${K.app('copilot', { s: 3 })}Copilot</div>
          ${K.bubble('쉽게 설명해 줘', { me: true })}
          <div class="ans">${K.skel('94%')}${K.skel('70%')}</div>
          <div class="sg">${['확인 문제 내 줘', '핵심만 요약해 줘', '관련 영상 찾아 줘'].map((t) => `<span>${t}</span>`).join('')}</div>
        </div>
      </div>`,
  }) + K.pill({ right: 4, y: 2.6, icon: 'book_open', text: '교과서를 AI 교과서처럼' }), {
    css: BASE + CHROME + `
      .split { flex: 1; min-height: 0; display: flex; }
      .pdf { flex: 1; min-width: 0; padding: 2.6cqw 2.8cqw 0; background: #eef0f4; }
      .pg { display: flex; flex-direction: column; gap: 1.3cqw; height: 100%; padding: 2.8cqw 3cqw; background: #fff; box-shadow: 0 .6cqw 1.6cqw -.8cqw rgba(15, 23, 42, .25); }
      .ch { font-size: 1.85cqw; font-weight: 650; color: var(--ink-4); }
      .h { margin-bottom: .6cqw; font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.03em; }
      .mk { position: relative; margin: .4cqw 0; font-size: 2.25cqw; font-weight: 600; white-space: nowrap; }
      .mk mark { padding: .3cqw .4cqw; border-radius: .4cqw; background: ${mix(22)}; color: var(--ink); }
      .cp { position: absolute; left: -1.2cqw; bottom: calc(100% + .9cqw); display: flex; align-items: center; gap: .7cqw; padding: .8cqw 1.4cqw; border-radius: 1cqw; background: #fff; font-size: 2.1cqw; font-weight: 650; box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .06), 0 1cqw 2cqw -.8cqw rgba(15, 23, 42, .35); }
      .pane { flex: none; width: 34cqw; display: flex; flex-direction: column; gap: 1.7cqw; padding: 2.2cqw 2.4cqw; border-left: .2cqw solid #eceef2; }
      .ph { display: flex; align-items: center; gap: 1cqw; font-size: 2.5cqw; font-weight: 700; }
      .ans { display: flex; flex-direction: column; gap: 1.2cqw; }
      .sg { display: flex; flex-direction: column; align-items: flex-start; gap: 1cqw; }
      .sg span { padding: .85cqw 1.6cqw; border-radius: 99px; box-shadow: inset 0 0 0 .2cqw ${mix(35)}; color: rgb(var(--tint)); font-size: 2.15cqw; font-weight: 650; white-space: nowrap; }
    `,
  });

  /* 4 · Edge와 함께 쓰기 — the JSON-style search prompt from the post, run in the Edge Copilot pane. */
  scene('copilot/copilot4', (K) => {
    const code = [
      'copilot.<span class="f">search</span>(<span class="s">"한국 경제"</span>, {',
      '  include: [<span class="s">"뉴스 기사"</span>,',
      '            <span class="s">"정책 발표"</span>],',
      '  language: <span class="s">"Korean"</span> })',
    ].join('\n');
    return K.win({
      x: 30, y: 4, w: 66, h: 54, bar: false,
      body: chrome(K, { tab: '경제 뉴스', tabIcon: K.ico('news', { s: 2.3, c: 'var(--blue)' }), url: '한국 경제 동향', urlIcon: K.ico('search:r', { s: 2.2, c: 'var(--ink-4)' }) }) + `
        <div class="news">
          <div class="hero"></div>
          ${K.skel('94%', { h: 1.7 })}${K.skel('68%', { h: 1.7 })}${K.skel('86%')}
        </div>`,
    }) + K.card({
      x: 4, y: 18.6, w: 49, cls: 'cp', body: `
        <div class="ph">${K.app('copilot', { s: 3.2 })}Copilot</div>
        <div class="code cbx">${code}</div>
        <div class="r"><span class="src">뉴스 기사<i class="cite">1</i></span><span class="src">정책 발표<i class="cite">2</i></span></div>`,
    }) + K.pill({ right: 4, bottom: 4.6, icon: 'search_sparkle', text: '명령 한 줄로 동향 검색' });
  }, {
    css: BASE + CHROME + `
      .news { display: flex; flex-direction: column; gap: 1.3cqw; padding: 3cqw 4cqw 0 27cqw; }
      .hero { height: 11cqw; margin-bottom: 1cqw; border-radius: 1.2cqw; background: linear-gradient(150deg, #cfe3ff, #9cc0f5 55%, #7aa6ec); }
      .cp { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.4cqw 2.8cqw 2.7cqw; }
      .ph { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.6cqw; font-weight: 700; }
      .cbx { margin: .2cqw 0 .4cqw; padding: 1.6cqw 2.2cqw; border-radius: 1.4cqw; background: #1f2233; color: #e6edf3; font-size: 2cqw; line-height: 1.7; }
      .cbx .f { color: #d2a8ff; } .cbx .s { color: #a5d6ff; }
      .r { display: flex; gap: 1.2cqw; }
      .src { display: inline-flex; align-items: center; gap: 1cqw; padding: .7cqw .8cqw .7cqw 1.6cqw; border-radius: 99px; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.15cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
    `,
  });

  /* 5 · 웹 버전 활용 꿀팁 — pick a prompt card, get a chart. */
  scene('copilot/copilot3', (K) => {
    const card = (icon, t, on) => `<div class="pc ${on ? 'on' : ''}"><span class="ti">${K.ico(icon)}</span>${t}</div>`;
    const pts = (a) => a.map((v, i) => `${(i * 100) / (a.length - 1)},${v}`).join(' ');
    const infl = [30, 27, 29, 22, 12, 6, 9, 16, 19];
    const rate = [36, 36, 35, 34, 31, 25, 17, 13, 13];
    return K.win({
      x: 4, y: 9, w: 54, h: 50, title: 'Copilot',
      barRight: K.ico('shield_checkmark', { s: 2.8, c: 'var(--green)', style: 'margin-right:3.2cqw' }),
      body: `<div class="lib">
        <div class="lh">프롬프트 카드<span class="more">${K.ico('star', { s: 2.3 })}프롬프트 보기</span></div>
        ${card('data_line', '시간에 따른 변경 내용 추적', true)}
        ${card('lightbulb', '미루는 습관 극복하기')}
        ${card('code', '이진 검색 코드 설계')}
      </div>`,
    }) + K.card({
      x: 55, y: 11.5, w: 41, cls: 'cht', body: `
        <div class="ct"><span class="ti">${K.ico('data_line')}</span>물가 상승률과 이자율</div>
        <svg viewBox="0 0 100 42" preserveAspectRatio="none">
          ${[4, 15, 26, 37].map((y) => `<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="#eceef2" stroke-width=".5"/>`).join('')}
          <polyline points="${pts(rate)}" fill="none" stroke="var(--pink)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="${pts(infl)}" fill="none" stroke="rgb(var(--tint))" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
        <div class="lg">${K.chip('물가 상승률', { dot: true })}${K.chip('이자율', { dot: 'var(--pink)' })}</div>`,
    }) + K.cursor({ x: 47, y: 29 })
      + K.pill({ right: 4, bottom: 4.4, icon: 'data_line', text: '프롬프트 카드로 차트까지' });
  }, {
    css: BASE + `
      .lib { display: flex; flex-direction: column; gap: 1.5cqw; padding: 3cqw 5.4cqw 3cqw 3.4cqw; }
      .lh { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6cqw; font-size: 2.6cqw; font-weight: 700; }
      .more { display: flex; align-items: center; gap: .7cqw; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); }
      .more .ico { color: var(--amber); }
      .pc { display: flex; align-items: center; gap: 1.5cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.6cqw; background: #f6f7f9; font-size: 2.35cqw; font-weight: 650; white-space: nowrap; }
      .pc .ti { width: 4.4cqw; height: 4.4cqw; background: #fff; color: var(--ink-3); }
      .pc.on { background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1.1cqw ${mix(18)}; }
      .pc.on .ti { background: ${mix(12)}; color: rgb(var(--tint)); }
      .cht { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.4cqw 2.6cqw 2.6cqw; }
      .ct { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.5cqw; font-weight: 700; }
      .ct .ti { width: 4.2cqw; height: 4.2cqw; }
      .cht svg { width: 100%; height: 15cqw; overflow: visible; }
      .lg { display: flex; gap: 1cqw; }
    `,
  });

  /* 6 · Designer — a text prompt becomes four 1:1 background images. */
  scene('copilot/copilot2', (K) => K.win({
    x: 6, y: 5.5, w: 88, h: 54, icon: 'ico:paint_brush_sparkle', title: 'Designer', sub: '· 이미지 만들기',
    body: `<div class="dz">
      <div class="pr">${K.ico('image_sparkle', { s: 3, c: 'rgb(var(--tint))' })}<span class="tx">파스텔 톤 하늘과 무지개 배경</span>${K.chip('1:1')}${K.btn('생성', { primary: true, icon: 'sparkle' })}</div>
      <div class="tiles">${[1, 2, 3, 4].map((i) => `<div class="tl t${i}${i === 2 ? ' on' : ''}">${i === 2 ? `<span class="ck">${K.ico('checkmark', { s: 2.2 })}</span>` : ''}</div>`).join('')}</div>
    </div>`,
  }) + K.pill({ right: 9.4, bottom: 4, icon: 'image_sparkle', text: '글로 그리는 수업 이미지' }), {
    css: BASE + `
      .dz { display: flex; flex-direction: column; gap: 2.8cqw; padding: 3cqw 3.4cqw; }
      .pr { display: flex; align-items: center; gap: 1.4cqw; padding: 1cqw 1cqw 1cqw 1.8cqw; border-radius: 1.8cqw; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
      .pr .tx { flex: 1; font-size: 2.45cqw; font-weight: 600; white-space: nowrap; }
      .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.4cqw; }
      .tl { position: relative; aspect-ratio: 1; border-radius: 1.6cqw; box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .05); }
      .tl.on { box-shadow: 0 0 0 .35cqw rgb(var(--tint)), 0 0 0 1.2cqw ${mix(20)}; }
      .ck { position: absolute; top: 1.2cqw; right: 1.2cqw; display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
      .t1 { background:
        radial-gradient(circle at 50% 112%, transparent 0 36%, #ffb7c9 36% 40%, #ffd6a0 40% 44%, #fff0a6 44% 48%, #bfe9bf 48% 52%, #a9d6ff 52% 56%, #cbbcff 56% 60%, transparent 60%),
        radial-gradient(ellipse 20% 9% at 24% 28%, #fff 95%, transparent),
        radial-gradient(ellipse 14% 7% at 34% 24%, #fff 95%, transparent),
        linear-gradient(180deg, #ffe3f0, #efe7ff); }
      .t2 { background:
        radial-gradient(circle at 12% 104%, transparent 0 44%, #ffb7c9 44% 48%, #ffd6a0 48% 52%, #fff0a6 52% 56%, #bfe9bf 56% 60%, #a9d6ff 60% 64%, #cbbcff 64% 68%, transparent 68%),
        radial-gradient(circle at 78% 26%, #fff6c4 0 9%, transparent 10%),
        radial-gradient(ellipse 22% 9% at 68% 62%, #fff 95%, transparent),
        linear-gradient(180deg, #d9ecff, #f3f9ff); }
      .t3 { background:
        radial-gradient(circle at 88% 100%, transparent 0 30%, #ffb7c9 30% 34%, #ffd6a0 34% 38%, #fff0a6 38% 42%, #bfe9bf 42% 46%, #a9d6ff 46% 50%, #cbbcff 50% 54%, transparent 54%),
        radial-gradient(ellipse 26% 10% at 30% 40%, #fff 95%, transparent),
        radial-gradient(ellipse 16% 7% at 44% 33%, #fff 95%, transparent),
        linear-gradient(170deg, #ffdccb, #fff1d6); }
      .t4 { background:
        radial-gradient(circle at 50% 135%, transparent 0 50%, #ffb7c9 50% 53%, #ffd6a0 53% 56%, #fff0a6 56% 59%, #bfe9bf 59% 62%, #a9d6ff 62% 65%, #cbbcff 65% 68%, transparent 68%),
        radial-gradient(ellipse 18% 8% at 74% 30%, #fff 95%, transparent),
        radial-gradient(ellipse 50% 20% at 50% 104%, #c9f0dc 96%, transparent),
        linear-gradient(180deg, #e4dcff, #dff4ff); }
    `,
  });

  /* 7 · 시작하기 — the Copilot family, with the school-account M365 Copilot Chat in front. */
  scene('copilot/copilot1', (K) => {
    const back = (o) => K.win({ ...o, h: 40, cls: 'bk', body: '' });
    return back({ x: 38, y: 3.4, w: 58, icon: 'ico:globe', title: 'Edge 연동 Copilot' })
      + back({ x: 27, y: 10.4, w: 61, title: 'Copilot', sub: '· 개인 계정' })
      + K.win({
        x: 16, y: 17.4, w: 70, h: 44, bar: false,
        body: chrome(K, {
          tab: 'M365 Copilot Chat', tabIcon: K.app('copilot', { s: 2.5 }), url: 'copilot.cloud.microsoft',
          right: K.chip('학교 계정', { tint: true, icon: 'hat_graduation' }),
        }) + `<div class="hm">
          <p class="hi">${K.app('copilot', { s: 4.4 })}무엇을 도와드릴까요?</p>
          ${K.prompt('Copilot에게 메시지 보내기', { lead: K.ico('add:r', { s: 2.6, c: 'var(--ink-3)' }) })}
          <span class="edp">${K.ico('shield_checkmark', { s: 2.4 })}엔터프라이즈 데이터 보호</span>
        </div>`,
      })
      + K.pill({ x: 4, y: 4, icon: 'hat_graduation', text: '학교 계정으로 시작' });
  }, {
    css: BASE + CHROME + `
      .bk .win__body { background: #fafbfc; }
      .bk .win__bar { color: var(--ink-3); }
      .hm { display: flex; flex-direction: column; align-items: center; gap: 2.2cqw; padding: 3.2cqw 6cqw 0; }
      .hi { display: flex; align-items: center; gap: 1.4cqw; font-size: 3.2cqw; font-weight: 700; letter-spacing: -0.03em; }
      .prompt { align-self: stretch; }
      .edp { display: flex; align-items: center; gap: .8cqw; font-size: 2cqw; font-weight: 650; color: var(--green); }
    `,
  });

  /* 8 · Prompt Coach — a rough request becomes a structured recommended prompt. */
  scene('copilot/prompt-coach', (K) => K.card({
    x: 4, y: 18, w: 33, cls: 'rq', body: `<p class="lb">${K.ico('person', { s: 2.4 })}내 요청</p><p class="tx">한국사 수행평가 루브릭 프롬프트 써 줘</p>`,
  }) + K.card({
    x: 45, y: 6.5, w: 51, h: 52, cls: 'cx', body: `
      <div class="hd"><span class="ti">${K.ico('prompt')}</span>Prompt Coach<span class="sp"></span>${K.btn('복사', { line: true, icon: 'copy:r' })}</div>
      <p class="lb2">추천 프롬프트</p>
      <div class="blk"><b>1. 목표</b>${K.skel('92%')}${K.skel('64%')}</div>
      <div class="blk"><b>2. 수업 및 과제 맥락</b>${K.skel('86%')}${K.skel('56%')}</div>
      <div class="blk"><b>3. 루브릭 설계 지침</b>${K.skel('80%')}</div>`,
  }) + '<div class="links"></div>' + K.pill({ x: 4, bottom: 6, icon: 'sparkle', text: '더 명확한 프롬프트로' }), {
    css: BASE + `
      .rq { padding: 2.4cqw 2.8cqw 2.8cqw; background: #f7f7f9; }
      .lb { display: flex; align-items: center; gap: .8cqw; margin-bottom: 1.2cqw; font-size: 2cqw; font-weight: 650; color: var(--ink-4); }
      .tx { font-size: 2.6cqw; font-weight: 600; line-height: 1.45; letter-spacing: -0.02em; color: var(--ink-2); word-break: keep-all; }
      .cx { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 3cqw; }
      .hd { display: flex; align-items: center; gap: 1.3cqw; font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.02em; }
      .hd .sp { flex: 1; }
      .lb2 { margin-top: .4cqw; font-size: 2cqw; font-weight: 700; color: rgb(var(--tint)); }
      .blk { display: flex; flex-direction: column; gap: 1.1cqw; padding: 1.7cqw 2cqw; border-radius: 1.4cqw; background: ${mix(6)}; }
      .blk b { font-size: 2.35cqw; font-weight: 700; }
    `,
    after(stage, K) {
      const { r, tint } = measure(stage);
      const a = r(stage.querySelector('.rq'));
      const b = r(stage.querySelector('.cx'));
      const svg = K.curve(a.r + 1, a.t + a.h / 2, b.l - 1.4, b.t + 15, { c: tint, dot: true });
      stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
    },
  });

  /* 9 · 리서치 도구 — five years of plans converge into this year's draft. */
  scene('copilot/research', (K) => {
    const xs = [6, 10, 4.5, 9, 5.5];
    return [2019, 2020, 2021, 2022, 2023].map((yr, i) => `<div class="doc abs" style="left:${xs[i]}cqw;top:${7.4 + i * 8.7}cqw">${K.app('word', { s: 3 })}${yr} 계획안</div>`).join('')
      + K.win({
        x: 43, y: 10.5, w: 53, h: 50, icon: 'ico:search_sparkle', title: '리서치 도구', cls: 'rw',
        body: `<div class="rp">
          <div class="th">올해 현장체험학습 계획안${K.chip('초안', { tint: true })}</div>
          <div class="kv"><span>체험 장소</span>${K.skel('100%')}<i class="cite">1</i></div>
          <div class="kv"><span>기간</span>${K.skel('70%')}<i class="cite">3</i></div>
          <div class="kv"><span>예산 총액</span>${K.skel('84%')}<i class="cite">5</i></div>
          <div class="ft">${K.btn(`${K.app('word', { s: 2.8 })}Word에서 계속`, { line: true })}</div>
        </div>`,
      })
      + '<div class="links"></div>'
      + K.pill({ right: 4, y: 4.6, icon: 'history', text: '5년치 계획안 한 번에' });
  }, {
    css: BASE + `
      .doc { z-index: 3; display: flex; align-items: center; gap: 1.1cqw; padding: 1cqw 1.9cqw 1cqw 1.2cqw; border-radius: 1.4cqw; background: #fff; font-size: 2.3cqw; font-weight: 650; white-space: nowrap; box-shadow: 0 0 0 .22cqw rgba(15, 23, 42, .05), 0 1.6cqw 3cqw -1.6cqw rgba(var(--tint), .5); }
      .rp { display: flex; flex-direction: column; gap: 1.9cqw; padding: 3.2cqw 3.4cqw; }
      .th { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: .6cqw; font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .kv { display: flex; align-items: center; gap: 1.4cqw; }
      .kv span { flex: none; width: 10.5cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .kv .skel { flex: none; max-width: 22cqw; }
      .ft { display: flex; margin-top: .8cqw; }
    `,
    after(stage, K) {
      const { r, tint } = measure(stage);
      const w = r(stage.querySelector('.rw'));
      const x2 = w.l - 1.3;
      const y2 = w.t + 17;
      let svg = '';
      stage.querySelectorAll('.doc').forEach((el, i) => {
        const d = r(el);
        svg += K.curve(d.r + .9, d.t + d.h / 2, x2, y2, { c: tint, dot: true, arrow: i === 2, w: .45 });
      });
      stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
    },
  });

  /* 10 · 나만의 에이전트 — builder (구성) on the left, the agent answering on the right. */
  scene('copilot/custom-agent', (K) => K.win({
    x: 5, y: 8.5, w: 90, h: 50, icon: 'ico:bot', title: '새 에이전트',
    barRight: `<span class="seg"><span>설명</span><span class="on">구성</span></span>${K.btn('만들기', { primary: true })}`,
    body: `<div class="bd">
      <div class="cfg">
        <div class="fld"><span class="lb">이름</span><div class="in"><span class="ti">${K.ico('bot')}</span>우리 반 Q&amp;A 도우미</div></div>
        <div class="fld"><span class="lb">지침</span><div class="ta"><p>반복 질문에 교사 대신 답하기</p>${K.skel('78%')}</div></div>
      </div>
      <div class="pv">
        ${K.bubble('중간고사 범위가 어디예요?', { me: true })}
        <div class="ans"><span class="ti">${K.ico('bot')}</span>${K.bubble('교과서 2단원(82쪽)까지예요.')}</div>
        ${K.bubble('퀴즈도 수행평가에 들어가요?', { me: true })}
        <div class="ans"><span class="ti">${K.ico('bot')}</span>${K.bubble('네, 일부 반영돼요.')}</div>
      </div>
    </div>`,
  }) + K.pill({ x: 8.4, bottom: 4, icon: 'bot_sparkle', text: '반복 질문은 에이전트가' }), {
    css: BASE + `
      .win__bar .seg { display: flex; gap: .3cqw; padding: .4cqw; border-radius: 1.2cqw; background: #f1f2f6; }
      .win__bar .seg span { padding: .6cqw 1.6cqw; border-radius: .9cqw; font-size: 2.1cqw; font-weight: 650; color: var(--ink-4); }
      .win__bar .seg .on { background: #fff; color: var(--ink); box-shadow: 0 .3cqw 1cqw -.3cqw rgba(15, 23, 42, .3); }
      .win__bar .btn { padding: .8cqw 1.8cqw; font-size: 2.15cqw; }
      .bd { display: flex; height: 100%; }
      .cfg { flex: none; width: 45cqw; display: flex; flex-direction: column; gap: 2.4cqw; padding: 3cqw 3cqw 0 3.4cqw; }
      .fld { display: flex; flex-direction: column; gap: 1cqw; }
      .lb { font-size: 2cqw; font-weight: 700; color: var(--ink-4); }
      .in { display: flex; align-items: center; gap: 1.2cqw; padding: .8cqw 1.4cqw .8cqw .8cqw; border-radius: 1.3cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.4cqw; font-weight: 650; white-space: nowrap; }
      .in .ti { width: 4.2cqw; height: 4.2cqw; }
      .ta { display: flex; flex-direction: column; gap: 1.3cqw; padding: 1.8cqw 2cqw 2.2cqw; border-radius: 1.3cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .ta p { font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .pv { flex: 1; display: flex; flex-direction: column; gap: 1.5cqw; padding: 3cqw 3.4cqw 0 3cqw; background: #f8f8fb; border-left: .2cqw solid #eef0f3; }
      .pv .ans + .bubble { margin-top: 1.2cqw; }
      .pv .bubble { max-width: 100%; }
      .pv .bubble--bot { background: #fff; box-shadow: 0 0 0 .2cqw var(--line); }
      .ans { display: flex; align-items: flex-end; gap: 1.2cqw; }
      .ans .ti { width: 4.2cqw; height: 4.2cqw; }
    `,
  });

  /* 11 · 채팅으로 수업 준비물 — last year's files in, a printable PPTX out. */
  scene('copilot/copilot-chat', (K) => K.win({
    x: 27, y: 5.5, w: 77, h: 54, title: 'Copilot', sub: '· 새 채팅',
    body: `<div class="cc">
      <div class="me">
        <div class="fs"><span class="file">${K.app('word')}작년 학습지.docx</span><span class="file">${K.app('excel')}수행평가 결과.xlsx</span></div>
        ${K.bubble('올해 우리 반 수준에 맞게 다시 만들어 줘', { me: true })}
      </div>
      <div class="res">
        ${K.app('copilot', { s: 4 })}
        <div class="rc">
          ${K.skel('60%')}
          <div class="out">
            <div class="oh">${K.app('powerpoint', { s: 3.4 })}<b>올해 학습지.pptx</b><span class="sp"></span>${K.btn('열기', { line: true })}</div>
            <div class="sl">${[0, 1, 2].map((i) => `<div class="slide s${i}"><i></i><i></i><i></i></div>`).join('')}</div>
          </div>
        </div>
      </div>
    </div>`,
  }) + K.pill({ x: 4, y: 17, icon: 'document_sparkle', text: '작년 자료로 올해 준비물' }), {
    css: BASE + `
      .cc { display: flex; flex-direction: column; gap: 2.2cqw; padding: 3cqw 7.4cqw 0 3.4cqw; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.1cqw; }
      .fs { display: flex; gap: 1cqw; }
      .me .bubble { max-width: 100%; }
      .res { display: flex; align-items: flex-start; gap: 1.6cqw; }
      .rc { flex: 1; display: flex; flex-direction: column; gap: 1.6cqw; padding-top: 1.2cqw; }
      .out { padding: 1.6cqw 1.8cqw 1.9cqw; border-radius: 1.6cqw; background: #fff; box-shadow: 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 1.1cqw ${mix(18)}; }
      .oh { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: 1.6cqw; font-size: 2.45cqw; font-weight: 700; white-space: nowrap; }
      .oh .sp { flex: 1; }
      .oh .btn { padding: .7cqw 1.7cqw; font-size: 2.1cqw; }
      .sl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4cqw; }
      .slide { display: flex; flex-direction: column; gap: .7cqw; padding: 1.4cqw 1.6cqw; border-radius: .8cqw; }
      .slide i { height: .9cqw; border-radius: 99px; background: #e4e6eb; }
      .slide i:first-child { width: 60%; height: 1.3cqw; background: #f0a58e; }
      .slide i:nth-child(2) { width: 90%; } .slide i:nth-child(3) { width: 72%; }
      .s0 { background: linear-gradient(135deg, #fff4ee, #fff); }
    `,
  });

  /* 12 · 분석가 — the score sheet becomes rubric averages; the weakest item drives the next lesson. */
  scene('copilot/analyst', (K) => {
    const rows = [['개념 이해', 80], ['풀이 과정', 70], ['서술·표현', 52, true], ['태도·참여', 88]];
    return K.win({
      x: 5, y: 8.5, w: 62, h: 51, icon: 'ico:data_bar_vertical', title: '분석가', sub: '· 에이전트',
      body: `<div class="an">
        <span class="file">${K.app('excel')}수행평가_루브릭_점수.xlsx</span>
        <p class="tt">루브릭 항목별 반 평균</p>
        ${rows.map(([t, v, weak]) => `<div class="hb${weak ? ' weak' : ''}"><span>${t}</span><div class="tr"><i style="width:${v}%"></i>${weak ? `<em style="left:calc(${v}% + 1.2cqw)">가장 약함</em>` : ''}</div></div>`).join('')}
      </div>`,
    }) + K.card({
      x: 66, y: 31, w: 30, cls: 'grp', body: `
        <div class="gh"><span class="ti">${K.ico('people_team')}</span>보충 지도 그룹</div>
        <div class="avs">${K.avatar('김', { c: 'var(--m1)' })}${K.avatar('이', { c: 'var(--m2)' })}${K.avatar('박', { c: 'var(--m4)' })}<span class="n">3명</span></div>`,
    }) + K.pill({ right: 4, y: 9, icon: 'lightbulb', text: '근거로 다음 수업 결정' });
  }, {
    css: BASE + `
      .an { display: flex; flex-direction: column; gap: 1.8cqw; padding: 3cqw 3.4cqw; }
      .an .file { align-self: flex-start; }
      .tt { margin: .6cqw 0 .2cqw; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; }
      .hb { display: flex; align-items: center; gap: 1.6cqw; }
      .hb > span { flex: none; width: 11cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); }
      .tr { position: relative; flex: 1; height: 3cqw; border-radius: .9cqw; background: #f1f2f5; }
      .tr i { display: block; height: 100%; border-radius: .9cqw; background: ${mix(30)}; }
      .tr em { position: absolute; top: 50%; translate: 0 -50%; padding: .5cqw 1.2cqw; border-radius: 99px; background: rgb(var(--tint)); color: #fff; font-size: 1.95cqw; font-weight: 700; font-style: normal; white-space: nowrap; }
      .weak > span { color: rgb(var(--tint)); font-weight: 700; }
      .weak .tr i { background: rgb(var(--tint)); }
      .grp { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.4cqw 2.6cqw 2.6cqw; }
      .gh { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.45cqw; font-weight: 700; white-space: nowrap; }
      .gh .ti { width: 4.2cqw; height: 4.2cqw; }
      .avs { display: flex; align-items: center; gap: .8cqw; }
      .avs .avatar { --s: 4.6cqw; }
      .avs .n { margin-left: auto; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
    `,
  });
})();
