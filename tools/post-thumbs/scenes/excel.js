/* Excel scenes — see STYLE_GUIDE.md */
(() => {
  /* ---------- 학교 공유 문서 만들기: 여러 선생님이 한 시트를 동시에 채움 ---------- */
  scene('excel/excelonline5', (K) => {
    const live = '<div class="live">3/14<i class="caret"></i><span class="flag">이 선생님</span></div>';
    const cell = (v) => (v === '*' ? live : v ? `<div class="d">${v}</div>` : '<div></div>');
    const row = (n, who, vals) => `<div class="h">${n}</div><div class="who">${who}</div>${vals.map(cell).join('')}`;
    const team = [['김', '#4a7fd6'], ['이', 'var(--pink)'], ['박', '#e0912f']].map(([t, c]) => K.avatar(t, { s: 3.8, c })).join('');
    return K.win({
      x: 8, y: 7.5, w: 84, h: 46.5, title: '교무 공유 문서', sub: ' · 2026학년도',
      barRight: `<span class="team">${team}</span>${K.btn('공유', { primary: true, icon: 'share' })}`,
      body: `<div class="xl" style="--cols: 3.6cqw 14.5cqw repeat(3, 1fr); --rh: 5.2cqw">
          <div class="h top"></div><div class="h top">A</div><div class="h top">B</div><div class="h top">C</div><div class="h top">D</div>
          <div class="h">1</div><div class="th">교사</div><div class="th all">${K.ico('checkmark_circle', { s: 2.6 })}개인정보 보호</div><div class="th">아동학대 예방</div><div class="th">안전 교육</div>
          ${row(2, '1-1 담임', ['3/04', '3/11', '3/18'])}
          ${row(3, '1-2 담임', ['3/05', '', ''])}
          ${row(4, '1-3 담임', ['3/05', '*', ''])}
          ${row(5, '1-4 담임', ['3/07', '3/13', ''])}
          ${row(6, '', ['', '', ''])}
        </div>
        <div class="tabs">${K.ico('add', { s: 2.6 })}<span class="on">연수 확인</span><span>동아리</span><span>물품 구입</span><span>진도표</span></div>`,
    }) + K.pill({ right: 4, bottom: 2.4, icon: 'people_team', text: '함께 채우는 학교 문서', dark: true });
  }, {
    css: `
      .team { display: flex; padding-left: .9cqw; margin-right: .4cqw; }
      .team .avatar { margin-left: -.9cqw; box-shadow: 0 0 0 .3cqw #fff; }
      .xl > :not(.h) { font-size: 2.3cqw; }
      .xl > .h.top { height: 3.4cqw; }
      .xl > .th.all { gap: .7cqw; background: rgb(var(--tint)); color: #fff; }
      .xl > .who { font-weight: 650; color: var(--ink); }
      .xl > .d { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: #13703f; font-weight: 650; }
      .xl > .live { position: relative; z-index: 3; overflow: visible; box-shadow: inset 0 0 0 .35cqw var(--pink); color: var(--ink); font-weight: 650; }
      .caret { width: .22cqw; height: 2.7cqw; margin-left: .35cqw; background: var(--ink); }
      .flag { position: absolute; left: 0; bottom: 100%; padding: .4cqw 1.1cqw; border-radius: .7cqw .7cqw .7cqw 0; background: var(--pink); color: #fff; font-size: 1.9cqw; font-weight: 700; white-space: nowrap; }
      .tabs { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: .6cqw; height: 6cqw; padding: 0 2cqw; background: #f6f7f9; border-top: .2cqw solid var(--line); font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
      .tabs .ico { color: var(--ink-4); margin-right: 1cqw; }
      .tabs span { padding: .8cqw 1.7cqw; border-radius: .8cqw; }
      .tabs .on { background: #fff; color: rgb(var(--tint)); font-weight: 700; box-shadow: 0 0 0 .2cqw var(--line-2), inset 0 -.45cqw 0 rgb(var(--tint)); }
    `,
  });

  /* ---------- 공유하고 인쇄하기: 선택 영역만 A4 한 장에 ---------- */
  scene('excel/excelonline4', (K) => {
    const rows = [72, 58, 80, 64, 76, 54, 70, 62, 78].map((w) => `<div class="pr"><i></i><i style="width:${w * 0.5}%"></i></div>`).join('');
    const field = (label, value, o = {}) => `<div class="f"><span class="lb">${label}</span><span class="fld${o.on ? ' on' : ''}">${o.icon ? K.ico(o.icon, { s: 2.7 }) : ''}<b>${value}</b>${K.ico('chevron_down', { s: 2.2 })}</span></div>`;
    return K.win({
      x: 7, y: 8, w: 86, h: 47, title: '인쇄', sub: ' · 현장체험학습 명단',
      body: `<div class="pd">
          <div class="pv">
            <div class="page paper"><p>체험학습 명단</p><div class="ph"><i></i><i></i></div>${rows}</div>
            <span class="t-xs">1 / 1 페이지</span>
          </div>
          <div class="opts">
            ${field('인쇄', '현재 선택 항목', { on: true, icon: 'table_select_range' })}
            ${field('용지 크기', 'A4')}
            <div class="f"><span class="lb">용지 방향</span><span class="seg"><b class="on">세로</b><b>가로</b></span></div>
            ${field('배율', '한 페이지에 시트 맞추기')}
            <div class="acts">${K.btn('취소', { line: true })}${K.btn('인쇄', { primary: true, icon: 'print' })}</div>
          </div>
        </div>`,
    }) + K.pill({ right: 4.5, y: 3.6, icon: 'print', text: '원하는 영역만 인쇄' });
  }, {
    css: `
      .pd { position: absolute; inset: 0; display: grid; grid-template-columns: 35cqw 1fr; }
      .pv { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.6cqw; background: #f2f4f6; border-right: .2cqw solid var(--line); }
      .paper { width: 21cqw; height: 29.7cqw; padding: 2.2cqw 2cqw; border-radius: .4cqw; }
      .paper p { margin-bottom: 1.3cqw; font-size: 1.9cqw; font-weight: 700; }
      .ph, .pr { display: flex; align-items: center; height: 2.05cqw; }
      .ph { height: 2.3cqw; border-radius: .3cqw; background: rgb(var(--tint)); }
      .pr { border-bottom: .12cqw solid var(--line); }
      .ph i, .pr i { flex: none; height: .7cqw; border-radius: 99px; background: #dfe2e7; }
      .ph i { background: rgba(255, 255, 255, .75); width: 18%; }
      .ph i:first-child, .pr i:first-child { width: 16%; margin: 0 8% 0 5%; }
      .opts { display: flex; flex-direction: column; gap: 1.7cqw; padding: 3.2cqw 3.4cqw; }
      .f { display: flex; align-items: center; gap: 1.6cqw; }
      .lb { flex: none; width: 10.5cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
      .fld { flex: 1; display: flex; align-items: center; gap: 1cqw; height: 5.2cqw; padding: 0 1.4cqw 0 1.8cqw; border-radius: 1.1cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.35cqw; white-space: nowrap; }
      .fld b { flex: 1; font-weight: 600; }
      .fld > .ico:last-child { color: var(--ink-4); }
      .fld.on { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .fld.on b { font-weight: 700; }
      .fld.on > .ico:first-child { color: rgb(var(--tint)); }
      .seg { flex: 1; display: flex; height: 5.2cqw; padding: .5cqw; border-radius: 1.1cqw; background: #f1f2f5; }
      .seg b { flex: 1; display: grid; place-items: center; border-radius: .8cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .seg b.on { background: #fff; color: var(--ink); font-weight: 700; box-shadow: 0 .3cqw .8cqw rgba(15, 23, 42, .12); }
      .acts { display: flex; justify-content: flex-end; gap: 1.2cqw; margin-top: auto; }
    `,
  });

  /* ---------- 채우기·정렬·필터: 빠른 채우기로 학번 완성 ---------- */
  scene('excel/excelonline3', (K) => {
    const flt = `<span class="fb">${K.ico('caret_down', { s: 1.6 })}</span>`;
    let cells = `<div class="h top"></div>${['A', 'B', 'C', 'D', 'E'].map((c) => `<div class="h top${c === 'D' ? ' on' : ''}">${c}</div>`).join('')}`;
    cells += `<div class="h">1</div><div class="th">학년${flt}</div><div class="th">반${flt}</div><div class="th">번호${flt}</div><div class="th">학번${flt}</div><div></div>`;
    ['01', '02', '03', '04', '05'].forEach((n, i) => {
      cells += `<div class="h">${i + 2}</div><div class="c">2</div><div class="c">3</div><div class="c">${n}</div><div class="c id${i ? ' ff' : ''}">23${n}</div><div></div>`;
    });
    return K.win({
      x: 7, y: 8.5, w: 98, h: 46.5, title: '명렬표', sub: ' · 2학년 3반',
      body: `<div class="rib">
          <div class="tabs"><span>홈</span><span>삽입</span><span class="on">데이터</span><span>검토</span><span>보기</span></div>
          <div class="cmds">
            <span class="cmd">${K.ico('arrow_sort:r', { s: 2.8 })}정렬</span>
            <span class="cmd">${K.ico('filter:r', { s: 2.8 })}필터</span>
            <span class="cmd on">${K.ico('flash', { s: 2.8 })}빠른 채우기</span>
          </div>
        </div>
        <div class="xl" style="--cols: 3.6cqw 11cqw 11cqw 11cqw 16cqw 1fr; --rh: 4.8cqw">${cells}<span class="rng"><span class="badge">${K.ico('flash', { s: 2.2 })}</span></span></div>`,
    }) + K.pill({ right: 5, bottom: 4, icon: 'keyboard', text: 'Ctrl + E로 학번 완성', tint: true });
  }, {
    css: `
      .rib { border-bottom: .2cqw solid var(--line); }
      .rib .tabs { display: flex; gap: 3.6cqw; padding: 1.3cqw 2.8cqw 0; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .rib .tabs span { padding-bottom: 1cqw; }
      .rib .tabs .on { color: rgb(var(--tint)); font-weight: 700; box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
      .cmds { display: flex; gap: 1.2cqw; padding: 1cqw 2cqw; background: #f7f8fa; border-top: .2cqw solid var(--line); }
      .cmd { display: flex; align-items: center; gap: .9cqw; padding: .8cqw 1.6cqw; border-radius: 1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); }
      .cmd .ico { color: var(--ink-3); }
      .cmd.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); font-weight: 700; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .cmd.on .ico { color: rgb(var(--tint)); }
      .xl { position: relative; }
      .xl > .h.top { height: 3.2cqw; }
      .xl > .h.on { background: color-mix(in srgb, rgb(var(--tint)) 16%, #fff); color: rgb(var(--tint)); }
      .xl > :not(.h) { font-size: 2.3cqw; }
      .xl > .th { justify-content: space-between; }
      .fb { display: grid; place-items: center; width: 2.4cqw; height: 2.4cqw; border-radius: .5cqw; background: #fff; color: var(--ink-3); box-shadow: inset 0 0 0 .15cqw var(--line-2); }
      .xl > .c { justify-content: center; }
      .xl > .id { color: var(--ink); font-weight: 700; }
      .xl > .ff { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .rng { position: absolute; grid-column: 5 / 6; grid-row: 3 / 8; inset: 0; height: auto; padding: 0; border: none; overflow: visible; box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)); }
      .badge { position: absolute; left: calc(100% + .7cqw); top: 5.6cqw; display: grid; place-items: center; width: 3.6cqw; height: 3.2cqw; border-radius: .6cqw; background: #fff; color: rgb(var(--tint)); box-shadow: 0 0 0 .2cqw var(--line-2), 0 .6cqw 1.4cqw -.6cqw rgba(15, 23, 42, .3); }
    `,
  });

  /* ---------- 데이터 입력하고 서식 바꾸기: 회계 서식 ---------- */
  scene('excel/excelonline2', (K) => {
    const items = [['A4 용지', '48,000'], ['보드마커', '21,600'], ['색연필', '15,000'], ['가위', '9,800']];
    let cells = '<div class="h top"></div><div class="h top">A</div><div class="h top on">B</div><div class="h top">C</div>';
    cells += '<div class="h">1</div><div class="th">품목</div><div class="th">금액</div><div></div>';
    items.forEach(([n, v], i) => { cells += `<div class="h on">${i + 2}</div><div>${n}</div><div class="acc"><span>₩</span><span>${v}</span></div><div></div>`; });
    cells += '<div class="h">6</div><div></div><div></div><div></div>';
    const ib = (name) => `<span class="ib">${K.ico(`${name}:r`, { s: 2.7 })}</span>`;
    const fmts = [['일반', '48000'], ['숫자', '48000.00'], ['통화', '₩48,000'], ['회계', '₩&nbsp;&nbsp;&nbsp;48,000', true]];
    return K.win({
      x: 4, y: 9, w: 60, h: 50, title: '학년 물품 구입',
      body: `<div class="rib">${ib('text_align_left')}${ib('text_align_center')}${ib('text_align_right')}${ib('table_cells_merge')}<i class="vr"></i>
          <span class="nf">회계${K.ico('chevron_down', { s: 2.1 })}</span><span class="ib g">%</span><span class="ib g">,</span></div>
        <div class="xl" style="--cols: 3.6cqw 18cqw 21cqw 1fr; --rh: 5.1cqw">${cells}<span class="rng"><i></i></span></div>`,
    }) + K.card({
      x: 58, y: 14.5, w: 37, cls: 'menu',
      body: `<p class="mh">표시 형식</p>${fmts.map(([n, v, on]) => `<div class="mi${on ? ' on' : ''}"><b>${n}</b><span>${v}</span>${on ? K.ico('checkmark', { s: 2.4 }) : ''}</div>`).join('')}`,
    }) + K.pill({ right: 5, y: 3.4, icon: 'text_number_format', text: '읽기 쉬운 숫자 서식', dark: true });
  }, {
    css: `
      .rib { display: flex; align-items: center; gap: .5cqw; padding: 1.1cqw 2cqw; background: #f7f8fa; border-bottom: .2cqw solid var(--line); }
      .ib { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: .9cqw; color: var(--ink-3); }
      .ib.g { font-size: 2.6cqw; font-weight: 700; }
      .vr { width: .2cqw; height: 3.4cqw; margin: 0 1.2cqw; background: var(--line-2); }
      .nf { display: flex; align-items: center; gap: .9cqw; height: 4.4cqw; padding: 0 1.2cqw 0 1.8cqw; border-radius: .9cqw; background: #fff; color: rgb(var(--tint)); font-size: 2.3cqw; font-weight: 700; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); }
      .xl { position: relative; }
      .xl > .h.top { height: 3.4cqw; }
      .xl > .h.on { background: color-mix(in srgb, rgb(var(--tint)) 16%, #fff); color: rgb(var(--tint)); }
      .xl > :not(.h) { font-size: 2.35cqw; }
      .xl > .acc { justify-content: space-between; padding: 0 1.6cqw; color: var(--ink); font-variant-numeric: tabular-nums; }
      .xl > .acc span:first-child { color: var(--ink-3); }
      .rng { position: absolute; grid-column: 3 / 4; grid-row: 3 / 7; inset: 0; height: auto; padding: 0; border: none; overflow: visible; background: color-mix(in srgb, rgb(var(--tint)) 7%, transparent); box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)); }
      .rng i { position: absolute; right: -.7cqw; bottom: -.7cqw; width: 1.4cqw; height: 1.4cqw; background: rgb(var(--tint)); box-shadow: 0 0 0 .25cqw #fff; }
      .menu { padding: 1.8cqw 1.6cqw; }
      .mh { padding: 0 1.2cqw 1cqw; font-size: 2.1cqw; font-weight: 700; color: var(--ink-3); }
      .mi { display: flex; align-items: center; gap: 1.2cqw; height: 5.4cqw; padding: 0 1.4cqw; border-radius: 1.1cqw; font-size: 2.35cqw; }
      .mi b { width: 6.2cqw; font-weight: 650; color: var(--ink-2); }
      .mi span { flex: 1; text-align: right; color: var(--ink-3); font-weight: 550; white-space: nowrap; }
      .mi.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); }
      .mi.on b, .mi.on span { color: rgb(var(--tint)); font-weight: 700; }
      .mi.on .ico { color: rgb(var(--tint)); }
    `,
  });

  /* ---------- 웹 버전 시작하기: OneDrive 폴더에서 새 통합 문서 ---------- */
  scene('excel/excelonline1', (K) => {
    const files = [['folder', 34], ['excel', 46], ['word', 40], ['powerpoint', 30], ['excel', 38]];
    const fic = (t) => (t === 'folder' ? K.ico('folder', { s: 3.4, c: '#e8b84a' }) : K.app(t, { s: 3.4 }));
    const mi = (t, label, on) => `<div class="mi${on ? ' on' : ''}">${fic(t)}<span>${label}</span></div>`;
    return K.win({
      x: 7, y: 8, w: 86, h: 52, icon: 'onedrive', title: '내 파일', sub: ' › 2026 학급 운영',
      body: `<div class="tool">${K.btn('새로 추가', { primary: true, icon: 'add' })}${K.btn('업로드', { line: true, icon: 'arrow_upload:r' })}</div>
        <div class="list">
          <div class="lh"><span>이름</span><span>수정한 날짜</span></div>
          ${files.map(([t, w]) => `<div class="fr">${fic(t)}${K.skel(`${w}%`)}<span class="sp"></span>${K.skel('13cqw')}</div>`).join('')}
        </div>`,
    }) + K.card({
      x: 9.6, y: 23.2, w: 41, cls: 'menu',
      body: `${mi('folder', '폴더')}<div class="sep"></div>${mi('word', 'Word 문서')}${mi('excel', 'Excel 통합 문서', true)}${mi('powerpoint', 'PowerPoint 프레젠테이션')}`,
    }) + K.cursor({ x: 38, y: 40.5 }) + K.pill({ right: 5, y: 3.6, app: true, text: '브라우저에서 바로 시작', tint: true });
  }, {
    css: `
      .tool { display: flex; gap: 1.2cqw; padding: 2.2cqw 2.6cqw; }
      .list { padding: 0 2.6cqw; }
      .lh { display: flex; justify-content: space-between; padding: 0 9cqw 1cqw 5.4cqw; border-bottom: .2cqw solid var(--line); font-size: 1.95cqw; font-weight: 600; color: var(--ink-4); }
      .fr { display: flex; align-items: center; gap: 2cqw; height: 5.8cqw; border-bottom: .2cqw solid var(--line); }
      .fr .skel { flex: none; }
      .fr .sp { flex: 1; }
      .menu { padding: 1.2cqw; }
      .menu .sep { margin: .8cqw 1.2cqw; }
      .mi { display: flex; align-items: center; gap: 1.6cqw; height: 5.6cqw; padding: 0 1.6cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .mi.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-weight: 700; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); }
    `,
  });

  /* ---------- 데이터 쉽게 관리하기: 웹에서 표로 정리, 앱에서 차트로 ---------- */
  scene('excel/excel-tutorial', (K) => {
    const data = [['1반', 42, true], ['2반', 38, false], ['3반', 55, true], ['4반', 47, true]];
    let cells = `<div class="h top"></div>${['A', 'B', 'C', 'D'].map((c) => `<div class="h top">${c}</div>`).join('')}`;
    const flt = `<span class="fb">${K.ico('caret_down', { s: 1.6 })}</span>`;
    cells += `<div class="h">1</div><div class="th">반${flt}</div><div class="th">독서량${flt}</div><div class="th">목표 달성${flt}</div><div></div>`;
    data.forEach(([c, n, ok], i) => {
      cells += `<div class="h">${i + 2}</div><div class="b${i % 2}">${c}</div><div class="b${i % 2} r">${n}</div><div class="b${i % 2} ok">${ok ? K.ico('checkmark_circle', { s: 2.8 }) : '<i class="dash"></i>'}</div><div></div>`;
    });
    cells += '<div class="h">6</div><div></div><div></div><div></div><div></div><div class="h">7</div><div></div><div></div><div></div><div></div>';
    const max = 55;
    return K.win({
      x: 5, y: 9, w: 66, h: 50, title: '반별 독서 기록', sub: ' · 저장됨',
      body: `<div class="xl" style="--cols: 3.6cqw 13cqw 14cqw 15cqw 1fr; --rh: 5.3cqw">${cells}</div>`,
    }) + `<div class="phone" style="left: 66cqw; top: 6.5cqw; --w: 23.5cqw"><div class="phone__screen">
        <div class="mt">${K.app('excel', { s: 2.8 })}<b>반별 독서 기록</b></div>
        <div class="chart">
          <div class="plot">${K.bars(data.map(([, n]) => Math.round((n / max) * 100)), { on: [2], h: 15, gap: 1.4 })}<span class="val">55권</span></div>
          <div class="xs">${data.map(([c]) => `<span>${c}</span>`).join('')}</div>
        </div>
        <div class="rows">${K.skel('80%')}${K.skel('62%')}${K.skel('72%')}</div>
      </div></div>` + K.pill({ x: 4, bottom: 3.4, icon: 'data_bar_vertical', text: '표로 정리, 차트로 분석', dark: true });
  }, {
    css: `
      .xl > .h.top { height: 3.4cqw; }
      .xl > :not(.h) { font-size: 2.35cqw; }
      .xl > .th { justify-content: space-between; background: rgb(var(--tint)); color: #fff; border-color: rgba(255, 255, 255, .25); }
      .fb { display: grid; place-items: center; width: 2.3cqw; height: 2.3cqw; border-radius: .5cqw; background: rgba(255, 255, 255, .22); color: #fff; }
      .xl > .b0 { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); }
      .xl > .r { justify-content: flex-end; font-weight: 650; color: var(--ink); }
      .xl > .ok { justify-content: center; color: rgb(var(--tint)); }
      .dash { width: 1.8cqw; height: .3cqw; border-radius: 99px; background: #c4c8ce; }
      .phone__screen { display: flex; flex-direction: column; gap: 1.6cqw; padding: 4.2cqw 1.6cqw 0; background: #f6f7f9; }
      .mt { display: flex; align-items: center; gap: .9cqw; padding: 0 .4cqw; font-size: 2.05cqw; font-weight: 700; white-space: nowrap; }
      .chart { padding: 1.8cqw 1.8cqw 1.5cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); }
      .chart p { font-size: 1.95cqw; font-weight: 700; color: var(--ink-3); }
      .plot { position: relative; margin-top: 4cqw; }
      .val { position: absolute; left: 50%; top: -3.6cqw; translate: 5% 0; padding: .3cqw .9cqw; border-radius: .7cqw; background: var(--ink); color: #fff; font-size: 1.85cqw; font-weight: 700; white-space: nowrap; }
      .xs { display: flex; justify-content: space-between; margin-top: .8cqw; padding: 0 .4cqw; font-size: 1.85cqw; font-weight: 600; color: var(--ink-4); }
      .rows { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2cqw 1.8cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); }
    `,
  });

  /* ---------- 급식 지도 당번 배정하기: Copilot이 겹치지 않게 채움 ---------- */
  scene('excel/excel-2', (K) => {
    const weeks = [[2, 3, 4, 5, 6], [9, 10, 11, 12, 13], [16, 17, 18, 19, 20]];
    const plan = ['김박정이최', '이최김박정', '정김이최박'];
    const color = { 김: '#4a7fd6', 이: 'var(--pink)', 박: '#e0912f', 최: 'rgb(var(--tint))', 정: '#8a63d2' };
    const cal = weeks.map((wk, w) => wk.map((d, i) => { const n = plan[w][i]; return `<div class="day"><span class="dt">${d}</span>${K.avatar(n, { s: 4.4, c: color[n] })}</div>`; }).join('')).join('');
    return K.win({
      x: 4, y: 8, w: 92, h: 51, title: '급식지도 당번 표', sub: ' · 3월 급식당번',
      body: `<div class="lay">
          <div class="cal"><div class="dh">${['월', '화', '수', '목', '금'].map((d) => `<span>${d}</span>`).join('')}</div><div class="grid">${cal}</div></div>
          <div class="cp">
            <div class="cph">${K.app('copilot', { s: 3.4 })}<b>Copilot</b></div>
            ${K.bubble('겹치지 않게 당번을 배정해 줘', { me: true })}
            <div class="bubble bubble--bot done">${K.ico('checkmark_circle', { s: 2.8 })}<span>3월 당번 20칸을<br>모두 채웠어요</span></div>
          </div>
        </div>`,
    }) + K.pill({ right: 5, bottom: 4, icon: 'calendar_ltr', text: '겹치지 않게 자동 배정' });
  }, {
    css: `
      .lay { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 32cqw; }
      .cal { padding: 2.2cqw 2.4cqw 0; }
      .dh, .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: .8cqw; }
      .dh span { padding-bottom: 1cqw; text-align: center; font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .day { display: flex; flex-direction: column; align-items: center; gap: .9cqw; padding: 1.2cqw 0 1.4cqw; border-radius: 1.2cqw; background: #f6f7f9; box-shadow: inset 0 0 0 .2cqw var(--line); }
      .dt { font-size: 1.9cqw; font-weight: 650; color: var(--ink-4); }
      .day .avatar { font-size: 2.2cqw; }
      .cp { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.2cqw 2.4cqw; background: #fafafc; border-left: .2cqw solid var(--line); }
      .cph { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.5cqw; }
      .cp .bubble { max-width: 92%; word-break: keep-all; }
      .done { display: flex; gap: 1cqw; align-items: flex-start; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2); color: var(--ink); font-weight: 600; }
      .done .ico { color: rgb(var(--tint)); margin-top: .1cqw; }
    `,
  });

  /* ---------- 학급 성적 관리하기: 폴더의 성적 파일 → 자동 통합 → 피벗 ---------- */
  scene('excel/excel-1', (K) => {
    const subj = [['국어', 78.4], ['수학', 71.2], ['영어', 81.6], ['통합사회', 76.0], ['통합과학', 74.8]];
    const files = subj.map(([s]) => `<div class="fl">${K.app('excel', { s: 3 })}<span>${s} 성적</span></div>`).join('');
    const rows = subj.map(([s, v]) => `<div class="pr${v === 81.6 ? ' top' : ''}"><span>${s}</span><span class="bar"><i style="width:${((v - 60) / 25) * 100}%"></i></span><b>${v.toFixed(1)}</b></div>`).join('');
    return K.card({
      x: 4, y: 9.5, w: 28.5, cls: 'fold',
      body: `<div class="fh">${K.ico('folder', { s: 3.6, c: '#e8b84a' })}<b>1학기 성적</b><span class="n">5</span></div>${files}`,
    }) + `<div class="hub">${K.ico('merge', { s: 3 })}</div><i class="links"></i>`
      + K.win({
        x: 47.5, y: 7, w: 48.5, h: 52, title: '성적 통합 분석',
        body: `<div class="pv">
            <div class="ph"><span>과목</span><span>평균 점수</span></div>
            ${rows}
            <div class="pr sum"><span>총합계</span><span class="bar"></span><b>76.4</b></div>
          </div>`,
      }) + K.pill({ x: 4, bottom: 4, icon: 'folder_lightning', text: '성적 파일 자동 통합', tint: true });
  }, {
    css: `
      .fold { padding: 2.2cqw 2.2cqw 1.4cqw; }
      .fh { display: flex; align-items: center; gap: 1.1cqw; padding-bottom: 1.4cqw; margin-bottom: .6cqw; border-bottom: .2cqw solid var(--line); font-size: 2.5cqw; }
      .fh b { flex: 1; }
      .n { display: grid; place-items: center; min-width: 3.2cqw; height: 3.2cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); font-size: 1.9cqw; font-weight: 700; }
      .fl { display: flex; align-items: center; gap: 1.2cqw; height: 4.7cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); }
      .hub { position: absolute; z-index: 2; left: 37.3cqw; top: 26.9cqw; display: grid; place-items: center; width: 6cqw; height: 6cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; box-shadow: 0 0 0 .6cqw rgba(255, 255, 255, .85), 0 1cqw 2cqw -1cqw rgba(var(--tint), .7); }
      .pv { padding: 2.4cqw 2.8cqw; }
      .ph, .pr { display: grid; grid-template-columns: 11.5cqw 1fr 6.5cqw; align-items: center; gap: 1.4cqw; }
      .ph { padding: 0 1.2cqw 1.2cqw; border-bottom: .25cqw solid rgb(var(--tint)); font-size: 2.05cqw; font-weight: 700; color: var(--ink-3); }
      .ph span:last-child { grid-column: 2 / 4; text-align: right; }
      .pr { height: 5.2cqw; padding: 0 1.2cqw; border-bottom: .15cqw solid var(--line); font-size: 2.35cqw; font-weight: 600; color: var(--ink-2); }
      .pr b { text-align: right; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
      .bar { height: 2.4cqw; border-radius: .5cqw; background: #f2f3f5; overflow: hidden; }
      .bar i { display: block; height: 100%; border-radius: inherit; background: color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .pr.top { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); border-radius: 1cqw; }
      .pr.top .bar i { background: rgb(var(--tint)); }
      .pr.top b { color: rgb(var(--tint)); }
      .pr.sum { border-bottom: none; font-weight: 700; color: var(--ink); }
      .pr.sum .bar { background: none; }
    `,
    after(stage, K) {
      const box = stage.getBoundingClientRect();
      const ux = (px) => ((px - box.left) / box.width) * 100;
      const uy = (px) => ((px - box.top) / box.width) * 100;
      const tint = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      const rows = [...stage.querySelectorAll('.fl')].map((el) => el.getBoundingClientRect());
      const card = stage.querySelector('.fold').getBoundingClientRect();
      const hubEl = stage.querySelector('.hub');
      const mid = uy(rows[2].top + rows[2].height / 2);
      hubEl.style.top = `${mid - 3}cqw`;
      const hub = hubEl.getBoundingClientRect();
      const win = stage.querySelector('.win').getBoundingClientRect();
      let svg = '';
      rows.forEach((r) => {
        svg += K.curve(ux(card.right), uy(r.top + r.height / 2), ux(hub.left) + 0.6, mid, { c: tint, arrow: false, w: 0.4, dot: true, dotR: 0.6 });
      });
      svg += K.curve(ux(hub.right), mid, ux(win.left) - 0.5, mid, { c: tint, bend: 'none', w: 0.5 });
      stage.querySelector('.links').outerHTML = K.wires(svg, { z: 1 });
    },
  });
})();
