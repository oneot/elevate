/* OneNote scenes — see STYLE_GUIDE.md */
(() => {

scene('onenote/onenote-with-calendar', (K) => {
  const ev = { 6: ['공문 제출', '#efe0fa', '#7719aa'], 14: ['상담', '#fde4ef', '#b0246a'], 21: ['체험학습', '#dff4e6', '#1c7a43'] };
  let cells = '';
  for (let d = -2; d <= 25; d += 1) {
    if (d < 1) { cells += '<div class="cell" style="background:transparent"></div>'; continue; }
    const e = ev[d];
    cells += `<div class="cell${d === 16 ? ' today' : ''}"><b>${d}</b>${e ? `<span class="ev" style="background:${e[1]};color:${e[2]}">${e[0]}</span>` : ''}</div>`;
  }
  const tab = (label, color, on) => `<div class="tab${on ? ' on' : ''}"><i style="background:${color}"></i>${label}</div>`;
  return K.win({
    x: 8, y: 9, w: 84, h: 54, title: '교무수첩', sub: ' / 2026년 10월',
    body: `<div class="oc">
      <div class="rail">${tab('교무수첩', '#7719aa', true)}${tab('공문서철', '#2f7de1')}${tab('상담록', '#e0569a')}${tab('수업 노트', '#2bb673')}</div>
      <div class="main">
        <div class="head">10월 <small>OneCalendar</small></div>
        <div class="grid">${['일', '월', '화', '수', '목', '금', '토'].map((w) => `<div class="dow">${w}</div>`).join('')}${cells}</div>
      </div>
    </div>`,
  }) + K.pill({ right: 5, y: 4.6, icon: 'calendar_ltr', text: '노트를 날짜별로' });
}, {
  css: `
    .oc { display: grid; grid-template-columns: 19cqw 1fr; height: 100%; }
    .rail { padding: 2.2cqw 1.4cqw; background: #faf7fc; border-right: .2cqw solid #f0eaf4; display: grid; gap: .9cqw; align-content: start; }
    .tab { display: flex; align-items: center; gap: 1cqw; padding: 1cqw 1.2cqw; border-radius: 1cqw; font-size: 2.2cqw; font-weight: 600; color: #444; white-space: nowrap; }
    .tab i { width: .7cqw; height: 2.6cqw; border-radius: 99px; }
    .tab.on { background: #fff; box-shadow: 0 .3cqw 1cqw rgba(119, 25, 170, .12); color: var(--ink); }
    .main { padding: 2.2cqw 2.6cqw 0; }
    .head { display: flex; align-items: baseline; gap: 1.2cqw; margin-bottom: 1.4cqw; font-size: 3.6cqw; font-weight: 700; letter-spacing: -0.03em; }
    .head small { font-size: 2.2cqw; font-weight: 600; color: var(--ink-4); letter-spacing: 0; }
    .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: .5cqw; }
    .dow { font-size: 1.8cqw; font-weight: 600; color: #9aa0a8; padding-bottom: .4cqw; }
    .cell { position: relative; height: 6.4cqw; padding: .6cqw .7cqw; border-radius: .9cqw; background: #f8f8fa; font-size: 1.9cqw; font-weight: 600; color: #5b5f66; }
    .cell.today b { display: inline-grid; place-items: center; width: 2.9cqw; height: 2.9cqw; margin: -.3cqw 0 0 -.4cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
    .ev { position: absolute; left: .5cqw; right: .5cqw; bottom: .6cqw; padding: .35cqw .6cqw; border-radius: .6cqw; font-size: 1.55cqw; font-weight: 700; white-space: nowrap; overflow: hidden; }
  `,
});
// Class Notebook: teacher-only page being distributed to every student's section.
scene('onenote/onenote-classnote', (K) => {
  const sec = (icon, label, on) => `<div class="sec${on ? ' on' : ''}">${K.ico(icon, { s: 2.7 })}<span>${label}</span></div>`;
  const opt = (label, on) => `<div class="opt${on ? ' on' : ''}"><i class="radio${on ? ' on' : ''}"></i><span>${label}</span></div>`;
  return K.win({
    x: 4.5, y: 9, w: 63, h: 50, title: '3학년 1반 과학', sub: ' · 수업용 전자 필기장',
    body: `<div class="cn">
      <nav>
        ${sec('library:r', '콘텐츠 라이브러리')}
        ${sec('people_team:r', '공동 작업 공간')}
        ${sec('lock_closed:r', '교사 전용', true)}
        <div class="stu"><div class="avs">${K.avatar('김', { s: 3.4, c: '#9b3fd0' })}${K.avatar('이', { s: 3.4, c: '#e0569a' })}${K.avatar('박', { s: 3.4, c: '#2f7de1' })}</div><span>학생 28명</span></div>
      </nav>
      <div class="pg">
        <h4>3단원 활동지</h4>
        ${K.skel('92%')}${K.skel('78%')}${K.skel('64%')}
        <div class="box"></div>
      </div>
    </div>`,
  })
    + K.card({
      x: 55, y: 16.5, w: 40.5, cls: 'dist',
      body: `<div class="hd"><span class="ic">${K.ico('send', { s: 2.8 })}</span><b>페이지 배포</b></div>
        ${opt('유인물', true)}${opt('수업 노트')}${opt('퀴즈')}
        ${K.btn('배포', { primary: true, cls: 'go' })}`,
    })
    + K.pill({ x: 4.5, bottom: 4.6, tint: true, icon: 'people_team', text: '학생 전원에게 한 번에' });
}, {
  css: `
    .cn { display: grid; grid-template-columns: 27cqw 1fr; height: 100%; }
    nav { display: flex; flex-direction: column; gap: .7cqw; padding: 2.4cqw 1.6cqw; background: #faf7fc; border-right: .2cqw solid #f0eaf4; }
    .sec { display: flex; align-items: center; gap: 1.1cqw; padding: 1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .sec .ico { color: var(--ink-4); }
    .sec.on { background: #fff; color: var(--ink); box-shadow: 0 .3cqw 1cqw rgba(119, 25, 170, .14); }
    .sec.on .ico { color: rgb(var(--tint)); }
    .stu { display: flex; align-items: center; gap: 1.2cqw; margin: .9cqw .4cqw 0; padding: 1.8cqw .8cqw 0; border-top: .2cqw solid #eee6f3; font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
    .avs { display: flex; align-items: center; }
    .avs .avatar { box-shadow: 0 0 0 .3cqw #faf7fc; }
    .avs .avatar + .avatar { margin-left: -.5cqw; }
    .pg { padding: 3.2cqw 3.2cqw 0; display: flex; flex-direction: column; gap: 1.5cqw; }
    h4 { margin-bottom: .8cqw; font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.035em; }
    .box { height: 9cqw; margin-top: .6cqw; border-radius: 1.2cqw; border: .25cqw dashed #ddd2e6; }
    .dist { padding: 2.6cqw 2.6cqw 2.8cqw; }
    .dist .hd { display: flex; align-items: center; gap: 1.3cqw; margin-bottom: 1.8cqw; }
    .dist .ic { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
    .dist .hd b { font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; }
    .opt { display: flex; align-items: center; gap: 1.4cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-2); }
    .opt.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 25%, #fff); color: var(--ink); }
    .go { display: flex; margin-top: 2cqw; padding: 1.5cqw; font-size: 2.5cqw; border-radius: 1.3cqw; box-shadow: 0 1.2cqw 2.4cqw -1cqw rgba(119, 25, 170, .55); }
  `,
});

// Mobile: Office Lens catches a paper notice and files it straight into a OneNote section.
scene('onenote/onenote-mobile', (K) => {
  const row = (label, value, on) => `<div class="fr${on ? ' on' : ''}"><small>${label}</small><b>${value}</b>${K.ico('chevron_right:r', { s: 2.6 })}</div>`;
  return `<div class="phone" style="--w:25cqw;${K.pos({ x: 11, y: 5.5 })}"><div class="phone__screen lens">
      <div class="top">${K.ico('dismiss:r', { s: 2.6 })}${K.ico('flash_off:r', { s: 2.6 })}</div>
      <div class="paper"><b>가정통신문</b>${K.skel('100%')}${K.skel('86%')}${K.skel('92%')}${K.skel('60%')}<div class="tb"></div></div>
      <div class="modes"><span>화이트보드</span><span class="on">문서</span><span>사진</span></div>
      <div class="shutter"></div>
    </div></div>`
    + K.wires(K.curve(37.5, 24, 46, 24, { dash: true, dot: true }))
    + K.card({
      x: 48, y: 10, w: 44, cls: 'save',
      body: `<div class="hd">${K.app(null, { s: 4.2 })}<b>OneNote에 저장</b></div>
        ${row('전자 필기장', '교무수첩')}${row('섹션', '공문서철', true)}
        ${K.btn('저장', { primary: true, cls: 'go' })}`,
    })
    + K.pill({ right: 4.5, bottom: 4.6, dark: true, icon: 'scan_camera', text: '종이 자료도 바로 노트로' });
}, {
  css: `
    .lens { background: #121316; }
    .top { position: absolute; top: 4.2cqw; left: 2.2cqw; right: 2.2cqw; display: flex; justify-content: space-between; color: #e8e9ec; }
    .paper { position: absolute; left: 3.2cqw; top: 10.5cqw; width: 16.6cqw; padding: 2cqw 1.8cqw 2.2cqw; display: flex; flex-direction: column; gap: 1.1cqw; background: #fbfaf7; border-radius: .4cqw; rotate: -5deg; outline: .4cqw solid rgb(var(--tint)); outline-offset: .7cqw; box-shadow: 0 0 0 1.1cqw rgba(119, 25, 170, .28); }
    .paper b { margin-bottom: .6cqw; font-size: 2.1cqw; font-weight: 750; letter-spacing: -0.03em; color: #222; }
    .paper .skel { height: 1cqw; background: #dcdde1; }
    .paper .tb { height: 5.4cqw; margin-top: .4cqw; border-radius: .3cqw; box-shadow: inset 0 0 0 .2cqw #d9dadf; }
    .modes { position: absolute; left: 0; right: 0; bottom: 12.4cqw; display: flex; justify-content: center; gap: 1.6cqw; font-size: 1.85cqw; font-weight: 650; color: #9a9ca3; white-space: nowrap; }
    .modes .on { color: #fff; }
    .shutter { position: absolute; left: 50%; bottom: 4.6cqw; width: 6.4cqw; height: 6.4cqw; translate: -50% 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 .5cqw #121316, 0 0 0 .85cqw #fff; }
    .save { padding: 2.8cqw 2.8cqw 3cqw; }
    .save .hd { display: flex; align-items: center; gap: 1.4cqw; margin-bottom: 2cqw; }
    .save .hd b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.03em; }
    .fr { display: flex; align-items: center; gap: 1.2cqw; padding: 1.5cqw 1.6cqw; border-radius: 1.3cqw; color: var(--ink-4); }
    .fr + .fr { margin-top: .6cqw; }
    .fr small { flex: 1; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); }
    .fr b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); }
    .fr.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 25%, #fff); }
    .fr.on b, .fr.on .ico { color: rgb(var(--tint)); }
    .go { display: flex; margin-top: 2.2cqw; padding: 1.5cqw; font-size: 2.5cqw; border-radius: 1.3cqw; }
  `,
});

// School work: classic section tabs (교무수첩/공문서철/상담록) over a weekly to-do page.
scene('onenote/onenote-in-class', (K) => {
  const tab = (label, c, on, lock) => `<div class="tab${on ? ' on' : ''}" style="--c:${c}">${label}${lock ? K.ico('lock_closed', { s: 2.3 }) : ''}</div>`;
  const todo = (text, on, extra = '') => `<div class="todo${on ? ' done' : ''}"><i class="check${on ? ' on' : ''}"></i><span>${text}</span>${extra}</div>`;
  return K.win({
    x: 5, y: 12.5, w: 90, h: 47, title: '학교 업무',
    body: `<div class="tabs">${tab('교무수첩', '#7719aa', true)}${tab('공문서철', '#2f7de1')}${tab('상담록', '#e0569a', false, true)}</div>
      <div class="ic">
        <div class="pg">
          <h4>3월 2주 <small>(3/9 ~ 3/13)</small></h4>
          ${todo('학부모 상담 주간 안내', true)}
          ${todo('현장체험학습 동의서 수합', true)}
          ${todo('학교폭력 예방교육 결과 보고', false, K.chip('공문', { tint: true, cls: 'gm' }))}
        </div>
        <aside>
          <div class="p on">3월 2주</div>
          <div class="p sub">상담 주간 일정</div>
          <div class="p">3월 1주</div>
        </aside>
      </div>`,
  })
    + K.pill({ x: 5, y: 4.4, icon: 'notebook', text: '업무 기록을 한곳에' });
}, {
  css: `
    .tabs { display: flex; gap: .6cqw; padding: 1.8cqw 2.6cqw 0; background: #f7f4f9; border-bottom: .25cqw solid #7719aa; }
    .tab { display: flex; align-items: center; gap: .8cqw; padding: 1.1cqw 2.4cqw; border-radius: 1.2cqw 1.2cqw 0 0; background: color-mix(in srgb, var(--c) 16%, #fff); font-size: 2.35cqw; font-weight: 700; color: color-mix(in srgb, var(--c) 80%, #000); white-space: nowrap; }
    .tab.on { background: var(--c); color: #fff; }
    .ic { display: grid; grid-template-columns: 1fr 24cqw; height: 100%; }
    .pg { padding: 3cqw 3.4cqw 0; }
    h4 { margin-bottom: 2.2cqw; font-size: 3.7cqw; font-weight: 750; letter-spacing: -0.035em; }
    h4 small { margin-left: .6cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-4); letter-spacing: -0.01em; }
    .todo { display: flex; align-items: center; gap: 1.5cqw; padding: 1.2cqw 0; font-size: 2.6cqw; font-weight: 600; color: var(--ink); white-space: nowrap; }
    .todo.done span { color: var(--ink-3); }
    .todo .check { width: 3cqw; height: 3cqw; }
    .gm { padding: .5cqw 1.2cqw; font-size: 1.95cqw; }
    aside { padding: 2.6cqw 1.8cqw; background: #fbfafc; border-left: .2cqw solid #f0ecf3; display: flex; flex-direction: column; gap: .6cqw; }
    .p { padding: 1.1cqw 1.4cqw; border-radius: 1cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    .p.sub { padding-left: 3.4cqw; }
    .p.on { background: #fff; color: var(--ink); box-shadow: 0 .3cqw 1cqw rgba(119, 25, 170, .14); }
  `,
});

// Basics: dictation fills a counselling note while you talk; Copilot sits in the ribbon.
scene('onenote/onenote', (K) => {
  const wave = [30, 60, 100, 70, 45, 85, 55, 30, 65, 40];
  return K.win({
    x: 4.5, y: 11, w: 70, h: 48, title: '상담 기록',
    barRight: `${K.chip('받아쓰기', { icon: 'mic', tint: true, cls: 'rb' })}${K.chip('Copilot', { icon: 'sparkle', cls: 'rb' })}`,
    body: `<div class="pg">
      <h4>학부모 상담 메모</h4>
      <p class="t-xs">3월 14일 (금) 오후 4:10</p>
      <ul>
        <li>수학 시간에 자신감이 많이 생김</li>
        <li>친구 관계도 원만함</li>
        <li>발표에도 <span class="live">적극적으로 참여 중</span><i class="caret"></i></li>
      </ul>
    </div>`,
  })
    + K.card({
      x: 55, y: 38.5, w: 40.5, cls: 'dict',
      body: `<span class="mic">${K.ico('mic', { s: 3.2 })}</span><div class="grow"><b>듣는 중…</b><div class="wave">${wave.map((h) => `<i style="height:${h}%"></i>`).join('')}</div></div>`,
    })
    + K.pill({ right: 4.5, y: 4.4, icon: 'mic_sparkle', text: '말하면 바로 기록', tint: true });
}, {
  css: `
    .win__bar .rb { padding: .6cqw 1.3cqw; font-size: 2cqw; }
    .win__bar .rb .ico { --s: 2.3cqw; }
    .pg { padding: 3.4cqw 3.6cqw 0; }
    h4 { font-size: 3.6cqw; font-weight: 750; letter-spacing: -0.035em; }
    .t-xs { margin: .6cqw 0 2.4cqw; }
    ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 1.5cqw; }
    li { position: relative; padding-left: 2.6cqw; font-size: 2.5cqw; font-weight: 550; color: var(--ink-2); white-space: nowrap; }
    li::before { content: ''; position: absolute; left: .4cqw; top: 1.4cqw; width: .9cqw; height: .9cqw; border-radius: 50%; background: #b9a3c8; }
    .live { padding: .1cqw .4cqw; border-radius: .5cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-weight: 650; }
    .caret { display: inline-block; width: .3cqw; height: 3cqw; margin-left: .4cqw; vertical-align: -.6cqw; background: rgb(var(--tint)); }
    .dict { display: flex; align-items: center; gap: 2cqw; padding: 2.2cqw 2.6cqw; border-radius: 99px; }
    .mic { flex: none; display: grid; place-items: center; width: 7cqw; height: 7cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; box-shadow: 0 0 0 1cqw color-mix(in srgb, rgb(var(--tint)) 14%, transparent); }
    .dict b { display: block; font-size: 2.5cqw; font-weight: 700; }
    .wave { display: flex; align-items: center; gap: .55cqw; height: 3.4cqw; margin-top: .7cqw; }
    .wave i { width: .75cqw; border-radius: 99px; background: rgb(var(--tint)); opacity: .8; }
  `,
});
})();
