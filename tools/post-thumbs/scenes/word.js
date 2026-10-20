/* Word scenes — see STYLE_GUIDE.md */
(() => {
  // ---------- shared bits ----------
  const tabsRow = (list, on, tail = '') => `<div class="tabs">${list.map((t) => `<span${t === on ? ' class="on"' : ''}>${t}</span>`).join('')}${tail}</div>`;
  const BASE = `
    .tabs { display: flex; align-items: center; gap: 2.4cqw; height: 5.2cqw; padding: 0 2.8cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
    .tabs > .on { color: rgb(var(--tint)); font-weight: 700; }
    .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
    .hero { position: absolute; }
    .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 2cqw .7cqw 1.4cqw; border-radius: 99px; background: #f2f3f6; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); }
    .url .ico { color: var(--ink-4); }
  `;

  // 1. 웹 버전 시작하기 — 브라우저(office.com)에서 Word 홈 → [빈 문서], 파일은 OneDrive에 자동 저장
  scene('word/wordonline1', (K) => {
    const tile = (thumb, label, cls = '') => `<div class="tile ${cls}"><div class="tth">${thumb}</div><span>${label}</span></div>`;
    const recent = (w) => `<div class="rr">${K.app('word', { s: 2.8 })}${K.skel(w, { h: 1.3 })}</div>`;
    return K.win({
      x: 4, y: 8, w: 78, h: 52, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}office.com</span>`,
      body: `<div class="home">
        <div class="rail">${['home', 'add_circle:r', 'folder:r', 'apps:r'].map((n, i) => `<span class="ri${i ? '' : ' on'}">${K.ico(n, { s: 3 })}</span>`).join('')}</div>
        <div class="main">
          <div class="hd">${K.app('word', { s: 3.6 })}<b>Word</b></div>
          <div class="tiles">
            ${tile(K.ico('add:r', { s: 5 }), '빈 문서', 'on')}
            ${tile(`${K.skel('62%', { h: 1.5, tint: true })}${K.skel('88%', { h: 1 })}${K.skel('80%', { h: 1 })}${K.skel('86%', { h: 1 })}${K.skel('54%', { h: 1 })}`, '일반 메모', 'memo')}
            ${tile(`<i class="cover"></i>${K.skel('70%', { h: 1.2 })}${K.skel('86%', { h: 1 })}${K.skel('76%', { h: 1 })}`, '보고서', 'rep')}
          </div>
          <div class="rh">최근 항목</div>
          ${recent('24cqw')}${recent('18cqw')}
        </div>
      </div>`,
    })
      + K.card({
        x: 62.5, y: 29, w: 33.5, cls: 'od',
        body: `<div class="odh">${K.app('onedrive', { s: 3.2 })}<b>내 파일</b></div>
          <div class="of on">${K.app('word', { s: 3.1 })}<b>문서.docx</b><span class="grow"></span><em>방금</em></div>
          <div class="of">${K.ico('folder', { s: 3.1, c: '#f0b941' })}${K.skel('13cqw', { h: 1.3 })}</div>`,
      })
      + K.cursor({ x: 26.5, y: 37.5 })
      + K.pill({ right: 4, y: 4.4, icon: 'globe', text: '설치 없이 브라우저로' });
  }, {
    css: BASE + `
      .home { display: grid; grid-template-columns: 7.4cqw 1fr; height: 100%; }
      .rail { display: flex; flex-direction: column; align-items: center; gap: 1.4cqw; padding-top: 2.4cqw; border-right: .2cqw solid #eef0f3; }
      .ri { display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 1.2cqw; color: var(--ink-4); }
      .ri.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .main { padding: 2.6cqw 3cqw 0 3.2cqw; }
      .hd { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.9cqw; }
      .hd b { font-weight: 750; letter-spacing: -0.02em; }
      .tiles { display: flex; gap: 2.4cqw; margin-top: 2.4cqw; }
      .tile { width: 14cqw; display: flex; flex-direction: column; gap: 1.2cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .tth { height: 18cqw; border-radius: 1cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); display: flex; flex-direction: column; gap: 1.1cqw; padding: 2.2cqw 2cqw; }
      .on .tth { align-items: center; justify-content: center; color: rgb(var(--tint)); box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 5%, #fff); }
      .tile.on span { color: var(--ink); font-weight: 750; }
      .cover { display: block; height: 6.4cqw; margin: -.6cqw -.6cqw .4cqw; border-radius: .6cqw; background: linear-gradient(135deg, #5b8fe0, #9cc1f5); }
      .rh { margin: 3cqw 0 1cqw; font-size: 2.3cqw; font-weight: 750; }
      .rr { display: flex; align-items: center; gap: 1.6cqw; height: 5cqw; border-bottom: .18cqw solid #f0f1f4; }
      .od { z-index: 3; padding: 2.2cqw 2cqw 1.6cqw; }
      .odh { display: flex; align-items: center; gap: 1.1cqw; padding: 0 .8cqw 1.4cqw; font-size: 2.55cqw; }
      .odh b { font-weight: 750; }
      .of { display: flex; align-items: center; gap: 1.3cqw; padding: 1.2cqw 1.2cqw; border-radius: 1.2cqw; font-size: 2.35cqw; white-space: nowrap; }
      .of b { font-weight: 700; }
      .of em { font-style: normal; font-size: 2cqw; font-weight: 650; color: rgb(var(--tint)); }
      .of.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
    `,
  });

  // 2. 화면 구성 알아보기 — ① 문서 이름 ② 메뉴 바 ③ 리본 메뉴(클래식)
  scene('word/wordonline2', (K) => {
    const tag = (n, t) => `<i class="lead"></i><b class="tag"><i>${n}</i>${t}</b>`;
    const ib = (n) => `<span class="ib">${K.ico(n, { s: 2.6 })}</span>`;
    return K.win({
      x: 5, y: 7, w: 90, h: 52,
      title: `문서${K.ico('cloud_checkmark:r', { s: 2.8, c: 'var(--ink-4)', style: 'margin-left:1cqw' })}`,
      barRight: tag(1, '문서 이름'),
      body: `<div class="ed">
        ${tabsRow(['파일', '홈', '삽입', '레이아웃', '참조', '검토', '보기'], '홈', tag(2, '메뉴 바'))}
        <div class="rb">
          <div class="g paste">${K.ico('clipboard_paste:r', { s: 4.6 })}</div>
          <i class="vs"></i>
          <div class="g">
            <div class="r"><span class="dd fn">맑은 고딕${K.ico('chevron_down:r', { s: 1.9 })}</span><span class="dd">11${K.ico('chevron_down:r', { s: 1.9 })}</span></div>
            <div class="r">${ib('text_bold')}${ib('text_italic')}${ib('text_underline')}${ib('text_color')}</div>
          </div>
          <i class="vs"></i>
          <div class="g">
            <div class="r">${ib('text_bullet_list_ltr:r')}${ib('text_number_list_ltr:r')}${ib('text_indent_increase_ltr:r')}</div>
            <div class="r">${ib('text_align_left:r')}${ib('text_align_center:r')}${ib('text_align_right:r')}</div>
          </div>
          <i class="vs"></i>
          <div class="g sty"><span class="sb">표준</span><span class="sb h1">제목 1</span></div>
          ${tag(3, '리본 메뉴')}
        </div>
        <div class="cv"><div class="page pg">${K.skel('44%', { h: 2.2, tint: true })}${K.skel('92%')}${K.skel('86%')}${K.skel('90%')}${K.skel('70%')}</div></div>
      </div>`,
    }) + K.pill({ x: 6.5, bottom: 4.6, app: true, text: '화면 구성 한눈에' });
  }, {
    css: BASE + `
      .win__bar .sp { display: none; }
      .lead { flex: 1; align-self: center; min-width: 3cqw; height: 0; margin: 0 1.4cqw 0 2cqw; border-top: .25cqw dashed color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .tag { flex: none; display: inline-flex; align-items: center; gap: .9cqw; padding: .55cqw 1.6cqw .55cqw .55cqw; border-radius: 99px; background: rgb(var(--tint)); color: #fff; font-size: 2.35cqw; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(var(--tint), .6); }
      .tag > i { display: grid; place-items: center; width: 2.9cqw; height: 2.9cqw; border-radius: 50%; background: #fff; color: rgb(var(--tint)); font-style: normal; font-size: 1.9cqw; font-weight: 800; }
      .tabs { padding-right: 2.3cqw; }
      .tabs .lead { margin-left: 1.6cqw; }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .rb { flex: none; display: flex; align-items: center; gap: 1.4cqw; height: 11.6cqw; padding: 0 2.3cqw 0 2.6cqw; border-bottom: .2cqw solid #eef0f3; }
      .g { display: flex; flex-direction: column; gap: .9cqw; }
      .g .r { display: flex; align-items: center; gap: .5cqw; }
      .paste { align-items: center; gap: .6cqw; color: var(--ink-3); }
      .paste small { font-size: 1.85cqw; font-weight: 600; color: var(--ink-3); }
      .vs { flex: none; width: .2cqw; height: 8cqw; background: var(--line); }
      .dd { display: inline-flex; align-items: center; justify-content: space-between; gap: .8cqw; height: 3.6cqw; padding: 0 1cqw 0 1.3cqw; border-radius: .8cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .dd .ico { color: var(--ink-4); }
      .fn { width: 11.2cqw; }
      .ib { display: grid; place-items: center; width: 3.6cqw; height: 3.6cqw; border-radius: .8cqw; color: var(--ink-2); }
      .sty { flex-direction: row; gap: 1cqw; }
      .sb { display: grid; place-items: center; width: 7cqw; height: 7.4cqw; border-radius: 1cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .sb.h1 { font-size: 2.3cqw; font-weight: 750; color: rgb(var(--tint)); }
      .cv { flex: 1; display: flex; justify-content: center; padding-top: 2.6cqw; background: #f3f3f5; }
      .pg { width: 50cqw; display: flex; flex-direction: column; gap: 1.5cqw; padding: 4.4cqw 5cqw; }
      .pg .skel:first-child { margin-bottom: .8cqw; }
    `,
  });

  // 3. 메모와 공유 — 문서의 한 구절에 단 메모 스레드 + 도구 모음(메모·따라잡기·편집·공유)
  scene('word/wordonline3', (K) => {
    const msg = (av, c, who, text) => `<div class="cm">${K.avatar(av, { s: 3.8, c })}<div class="ct"><b>${who}</b><p>${text}</p></div></div>`;
    return K.win({
      x: 4, y: 8, w: 84, h: 52, title: '수행평가 안내',
      barRight: `<span class="tb on">${K.ico('comment', { s: 2.6 })}메모</span>
        <span class="tb">${K.ico('document_catch_up:r', { s: 2.6 })}</span>
        <span class="tb">${K.ico('edit:r', { s: 2.6 })}편집${K.ico('chevron_down:r', { s: 1.9 })}</span>
        ${K.btn('공유', { primary: true, icon: 'share' })}`,
      body: `<div class="cv"><div class="page pg">
        ${K.skel('46%', { h: 2.4, tint: true })}
        ${K.skel('94%')}${K.skel('86%')}
        <p class="mk">제출 기한: 10월 23일 (금)</p>
        ${K.skel('92%')}${K.skel('78%')}${K.skel('88%')}${K.skel('64%')}
      </div></div>`,
    })
      + K.card({
        x: 57, y: 18.5, w: 39, cls: 'th',
        body: `${msg('김', 'rgb(var(--tint))', '김 선생님', '제출 기한을 하루 늦출까요?')}
          ${msg('이', '#7b61c9', '이 선생님', '좋아요, 반영할게요!')}
          <div class="rp"><span class="grow"></span>${K.ico('send', { s: 2.6 })}</div>`,
      })
      + K.pill({ right: 4, bottom: 4.6, icon: 'comment', text: '메모로 함께 다듬기' });
  }, {
    css: BASE + `
      .tb { display: inline-flex; align-items: center; gap: .7cqw; height: 4.4cqw; padding: 0 1.1cqw; border-radius: 1cqw; font-size: 2.15cqw; font-weight: 650; color: var(--ink-2); }
      .tb .ico { color: var(--ink-3); }
      .tb.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .tb.on .ico { color: rgb(var(--tint)); }
      .win__bar .btn { padding: .9cqw 1.8cqw; font-size: 2.15cqw; }
      .cv { height: 100%; padding: 3cqw 0 0 5.4cqw; background: #f3f3f5; }
      .pg { width: 46cqw; height: 100%; display: flex; flex-direction: column; gap: 1.6cqw; padding: 4.6cqw 4.6cqw 0; }
      .pg .skel:first-child { margin-bottom: 1cqw; }
      .mk { align-self: flex-start; margin: .2cqw 0; padding: .3cqw .7cqw; border-radius: .3cqw; background: color-mix(in srgb, rgb(var(--tint)) 16%, #fff); box-shadow: inset 0 -.3cqw 0 rgb(var(--tint)); font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
      .th { z-index: 3; padding: 2.4cqw 2.4cqw 2cqw; display: flex; flex-direction: column; gap: 1.8cqw; }
      .th::before { content: ''; position: absolute; left: 0; top: 2.2cqw; bottom: 2.2cqw; width: .5cqw; border-radius: 0 99px 99px 0; background: rgb(var(--tint)); }
      .cm { display: flex; gap: 1.4cqw; }
      .ct { display: flex; flex-direction: column; gap: .5cqw; padding-top: .1cqw; }
      .ct b { font-size: 2.1cqw; font-weight: 700; color: var(--ink-3); }
      .ct p { font-size: 2.4cqw; font-weight: 600; color: var(--ink); white-space: nowrap; }
      .rp { display: flex; align-items: center; height: 4.6cqw; padding: 0 1.4cqw; border-radius: 1.2cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); color: rgb(var(--tint)); }
    `,
  });

  // 4. 꼭 알아야 할 꿀팁 — 스타일로 상담일지 정리
  scene('word/wordonline4', (K) => {
    const st = (label, cls, on) => `<div class="si${on ? ' on' : ''}"><span class="${cls}">${label}</span>${on ? K.ico('checkmark', { s: 2.6 }) : ''}</div>`;
    return `<div class="page hero log" style="${K.pos({ x: 5, y: 7.5, w: 52, h: 60 })}">
        <h2><span class="pick">학생 상담일지</span></h2>
        <p class="em">상담 날짜 · 1월 3일 / 상담자 · 담임교사</p>
        <h4>${K.ico('chevron_down', { s: 2.4 })}상담 주요 내용</h4>
        <div class="ls">
          <div><i>1.</i>학업 관련 고민</div>
          <div class="sub"><i>a.</i>${K.skel('16cqw')}</div>
          <div><i>2.</i>대인관계</div>
          <div><i>3.</i>진로 상담</div>
          <div><i>4.</i>학교 활동</div>
        </div>
      </div>`
      + K.card({
        x: 60, y: 9.5, w: 35, cls: 'sty',
        body: `<div class="sh">${K.ico('text_font', { s: 3 })}<b>스타일</b></div>
          ${st('표준', 'k0')}${st('제목', 'k1', true)}${st('부제', 'k2')}${st('강조', 'k3')}${st('인용', 'k4')}`,
      })
      + K.pill({ x: 3.5, y: 3.6, icon: 'paint_brush', text: '스타일로 깔끔하게' });
  }, {
    css: BASE + `
      .log { padding: 5.6cqw 5.6cqw 0; }
      h2 { margin: 0 0 1.8cqw; font-size: 4.6cqw; font-weight: 750; letter-spacing: -0.04em; line-height: 1.2; }
      .pick { padding: 0 .5cqw; background: color-mix(in srgb, rgb(var(--tint)) 18%, #fff); }
      .em { font-size: 2.35cqw; font-style: italic; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      h4 { display: flex; align-items: center; gap: .8cqw; margin: 3.4cqw 0 1.6cqw -3.2cqw; font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.02em; color: rgb(var(--tint)); }
      h4 .ico { color: var(--ink-4); }
      .ls { display: flex; flex-direction: column; gap: 1.5cqw; }
      .ls > div { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .ls i { width: 2.6cqw; font-style: normal; font-weight: 700; color: var(--ink-3); }
      .ls .sub { padding-left: 3.8cqw; }
      .ls .sub i { font-weight: 600; }
      .sty { padding: 2.2cqw 2cqw 1.6cqw; }
      .sh { display: flex; align-items: center; gap: 1cqw; padding: 0 1cqw 1.2cqw; font-size: 2.55cqw; }
      .sh .ico { color: rgb(var(--tint)); }
      .sh b { font-weight: 750; }
      .si { display: flex; align-items: center; justify-content: space-between; height: 6cqw; padding: 0 1.6cqw; border-radius: 1.2cqw; white-space: nowrap; }
      .si.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: rgb(var(--tint)); }
      .si .ico { color: rgb(var(--tint)); }
      .k0 { font-size: 2.3cqw; font-weight: 550; color: var(--ink-2); }
      .k1 { font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
      .k2 { font-size: 2.3cqw; font-weight: 600; letter-spacing: .08em; color: var(--ink-4); }
      .k3 { font-size: 2.35cqw; font-weight: 600; font-style: italic; color: var(--ink-2); }
      .k4 { font-size: 2.3cqw; font-weight: 550; font-style: italic; color: var(--ink-3); }
    `,
  });

  // 5. 템플릿으로 학교 문서 만들기 — 행사 전단(축제) + 간편한 학생 보고서
  scene('word/wordonline5', (K) => {
    const bulbs = [[8, 22, '#ff7eb6'], [20, 33, '#ffd166'], [32, 40, '#7ee0d2'], [44, 43, '#ff7eb6'], [56, 43, '#ffd166'], [68, 40, '#7ee0d2'], [80, 33, '#ff7eb6'], [92, 22, '#ffd166']]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y + 4.5}" r="3.4" fill="${c}"/><rect x="${x - 1.4}" y="${y}" width="2.8" height="2.4" rx=".6" fill="#2a3566"/>`).join('');
    const row = (ico, t) => `<p>${K.ico(ico, { s: 2.6 })}${t}</p>`;
    return `<div class="page hero rep" style="${K.pos({ x: 49, y: 13, w: 40, h: 54, rotate: 4.5 })}">
        <div class="cov"><svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMax slice"><circle cx="78" cy="12" r="6" fill="#fff" opacity=".8"/><path d="M0 40 L 0 30 C 18 20, 34 22, 50 30 C 66 38, 82 24, 100 20 L 100 40 Z" fill="#3f78d6"/><path d="M0 40 L 0 35 C 24 28, 52 32, 70 36 C 84 39, 92 33, 100 31 L 100 40 Z" fill="#2c5fb8"/></svg></div>
        <h3>팀 프로젝트 보고서</h3>
        <div class="ln">${K.skel('86%')}${K.skel('70%')}</div>
        <div class="flow"><i></i><b></b><i></i><b></b><i></i></div>
        <div class="tbl">${Array.from({ length: 9 }, (_, i) => `<i class="${i < 3 ? 'h' : ''}"></i>`).join('')}</div>
      </div>
      <div class="page hero fly" style="${K.pos({ x: 8, y: 5, w: 44, h: 62, rotate: -3 })}">
        <div class="art"><svg viewBox="0 0 100 52" preserveAspectRatio="xMidYMid slice">
          <path d="M-2 18 Q 50 58, 102 18" fill="none" stroke="#9aa6d6" stroke-width=".9"/>${bulbs}
          <g fill="#ffd166" opacity=".9"><circle cx="14" cy="8" r="1"/><circle cx="34" cy="14" r=".8"/><circle cx="62" cy="9" r="1.1"/><circle cx="86" cy="12" r=".9"/><circle cx="50" cy="5" r=".7"/></g>
        </svg></div>
        <div class="tx">
          <small>2024 마소고등학교</small>
          <h2>가을 축제</h2>
          <p class="slogan">하나 되는 순간, 빛나는 우리!</p>
          <div class="dt">
            ${row('calendar_ltr:r', '10월 15일 오후 3시')}
            ${row('location:r', '운동장')}
            ${row('music_note_2:r', '학급별 공연 · 푸드 트럭')}
          </div>
        </div>
      </div>`
      + K.pill({ right: 4, y: 4.4, app: true, text: '템플릿으로 바로 완성' });
  }, {
    css: BASE + `
      .fly { z-index: 2; border-radius: .6cqw; }
      .rep { z-index: 1; border-radius: .6cqw; padding: 3.6cqw 3.8cqw 0; }
      .art { height: 19cqw; background: radial-gradient(120% 140% at 50% 0%, #2d3d86 0%, #1b2459 70%); }
      .art svg { width: 100%; height: 100%; display: block; }
      .tx { padding: 2.8cqw 4cqw 0; }
      .tx small { display: block; font-size: 2.3cqw; font-weight: 700; color: rgb(var(--tint)); letter-spacing: -0.01em; }
      .tx h2 { margin: .4cqw 0 .8cqw; font-size: 5.6cqw; font-weight: 800; letter-spacing: -0.05em; line-height: 1.1; color: #1b2459; }
      .slogan { font-size: 2.3cqw; font-weight: 700; color: #e0569b; white-space: nowrap; }
      .dt { display: flex; flex-direction: column; gap: 1.1cqw; margin-top: 2.4cqw; padding-top: 2.2cqw; border-top: .2cqw solid var(--line); }
      .dt p { display: flex; align-items: center; gap: 1cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .dt .ico { color: rgb(var(--tint)); }
      .cov { height: 10.5cqw; border-radius: .6cqw; overflow: hidden; background: linear-gradient(180deg, #cfe0fb, #eaf2fd); }
      .cov svg { width: 100%; height: 100%; display: block; }
      .rep h3 { margin: 2.2cqw 0 1.4cqw; font-size: 2.8cqw; font-weight: 800; letter-spacing: -0.035em; white-space: nowrap; }
      .ln { display: grid; gap: 1.2cqw; }
      .flow { display: flex; align-items: center; margin: 2.6cqw 0 2.4cqw; }
      .flow i { flex: 1; height: 4.4cqw; border-radius: .7cqw; background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .flow b { position: relative; width: 3cqw; height: .3cqw; background: color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .flow b::after { content: ''; position: absolute; right: 0; top: 50%; width: 1cqw; height: 1cqw; border-top: .3cqw solid color-mix(in srgb, rgb(var(--tint)) 55%, #fff); border-right: .3cqw solid color-mix(in srgb, rgb(var(--tint)) 55%, #fff); translate: 0 -50%; rotate: 45deg; }
      .tbl { display: grid; grid-template-columns: repeat(3, 1fr); gap: .3cqw; border-radius: .5cqw; overflow: hidden; }
      .tbl i { height: 3.4cqw; background: #f1f3f7; }
      .tbl i.h { background: rgb(var(--tint)); }
    `,
  });
})();
