/* Teams scenes — see STYLE_GUIDE.md */
(() => {

scene('teams/teams-speakerprogress', (K) => {
  const wave = [22, 38, 55, 34, 70, 88, 62, 40, 30, 58, 92, 76, 48, 26, 18, 44, 66, 84, 60, 36, 52, 74, 46, 28, 40, 64];
  const filler = new Set([7, 8, 14, 15, 23]);
  return K.win({
    x: 9, y: 10, w: 82, h: 52, title: '발표자 진행', sub: ' · 결과',
    body: `<div class="sp">
      <div>${K.ring({ p: 92, s: 21, value: '92', label: '발음 정확도', vs: 6.6 })}</div>
      <div>
        <p class="t-s" style="margin:.4cqw 0 1.4cqw">녹음 분석 · 1분 48초</p>
        <div class="wave">${wave.map((h, i) => `<i class="${filler.has(i) ? 'f' : ''}" style="height:${h}%"></i>`).join('')}</div>
        <div class="row" style="gap:1cqw;margin-top:2.2cqw">${K.chip('속도 적정', { dot: 'var(--green)' })}${K.chip('군말 3회', { dot: 'var(--amber)' })}${K.chip('반복 1회', { dot: '#9aa0a8' })}</div>
      </div>
      <div class="tip">${K.ico('sparkle', { s: 2.9 })}말 속도는 좋아요. ‘음…’ 같은 군말만 조금 줄여 볼까요?</div>
    </div>`,
  }) + K.pill({ right: 5.5, y: 5, icon: 'mic_sparkle', text: 'AI 발표 코칭', dark: true });
}, {
  css: `
    .sp { display: grid; grid-template-columns: 25cqw 1fr; gap: 3cqw; padding: 3.4cqw 3.4cqw 0; }
    .wave { display: flex; align-items: center; gap: .62cqw; height: 9cqw; }
    .wave i { flex: 1; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 70%, #fff); }
    .wave i.f { background: var(--amber); }
    .tip { grid-column: 1 / -1; display: flex; align-items: center; gap: 1.2cqw; margin-top: .4cqw; padding: 1.5cqw 1.9cqw; border-radius: 1.4cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); font-size: 2.35cqw; font-weight: 600; letter-spacing: -0.02em; color: #34366e; white-space: nowrap; }
    .tip .ico { color: rgb(var(--tint)); }
  `,
});

/* ---------- shared bits for the scenes below ---------- */
const TABS = `
  .tabs { display: flex; align-items: center; gap: 2.8cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); white-space: nowrap; }
  .tabs > span { position: relative; display: inline-flex; align-items: center; gap: .8cqw; padding: 1.6cqw 0 1.4cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
  .tabs > span .app { --s: 2.7cqw; }
  .tabs > span.on { color: var(--ink); font-weight: 700; }
  .tabs > span.on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.2cqw; height: .5cqw; border-radius: 99px; background: rgb(var(--tint)); }
`;
const tabs = (list, on) => `<div class="tabs">${list.map((t) => {
  const [label, lead] = Array.isArray(t) ? t : [t, ''];
  return `<span class="${label === on ? 'on' : ''}">${lead}${label}</span>`;
}).join('')}</div>`;
const tintOf = (stage) => `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
/** stage-relative cqw box of an element */
const boxOf = (stage, el) => {
  const s = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = 100 / s.width;
  return { l: (r.left - s.left) * k, r: (r.right - s.left) * k, t: (r.top - s.top) * k, b: (r.bottom - s.top) * k, cy: (r.top + r.height / 2 - s.top) * k, cx: (r.left + r.width / 2 - s.left) * k };
};

/* 검색 코치 — search box, filters, results with trust shields */
scene('teams/teams-searchcoach', (K) => {
  const res = (ok, body, on) => `<div class="res${on ? ' on' : ''}"><span class="sh ${ok ? 'ok' : 'warn'}">${K.ico(ok ? 'shield_checkmark' : 'shield_error', { s: 3 })}</span><div class="grow col" style="gap:.9cqw">${body}</div></div>`;
  return K.win({
    x: 8, y: 8.5, w: 100, h: 52, title: '검색 코치',
    body: `<div class="sc">
      <div class="q">${K.ico('search:r', { s: 3.1 })}<span class="grow">세계 인구 증가 추세</span>${K.btn('검색', { primary: true })}</div>
      <div class="row f">${K.chip('도메인 · .org', { solid: true })}${K.chip('파일 형식', { line: true })}${K.chip('날짜 범위', { line: true })}${K.chip('사실 확인', { line: true })}</div>
      ${res(true, '<b class="t-b">세계 인구 전망 보고서</b><span class="t-xs">.org · PDF</span>', true)}
      ${res(false, K.skel('44%') + K.skel('26%'))}
    </div>`,
  }) + K.pill({ right: 6.5, y: 39.6, icon: 'shield_checkmark', text: '믿을 만한 정보 찾기' });
}, {
  css: `
    .sc { width: 84cqw; padding: 3cqw 3.4cqw; }
    .q { display: flex; align-items: center; gap: 1.4cqw; height: 6.6cqw; padding: 0 .9cqw 0 2.4cqw; border-radius: 99px; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1cqw 2.4cqw -1.4cqw rgba(var(--tint), .6); font-size: 2.7cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
    .q > .ico { color: rgb(var(--tint)); }
    .q .btn { padding: 1.1cqw 2.8cqw; border-radius: 99px; }
    .f { gap: 1cqw; margin: 2.2cqw 0 1.4cqw; }
    .res { display: flex; align-items: center; gap: 1.8cqw; margin-top: 1cqw; padding: 1.4cqw 1.8cqw; border-radius: 1.6cqw; }
    .res.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 35%, #fff); }
    .sh { flex: none; display: grid; place-items: center; width: 5.2cqw; height: 5.2cqw; border-radius: 1.4cqw; }
    .sh.ok { background: color-mix(in srgb, var(--green) 14%, #fff); color: var(--green); }
    .sh.warn { background: color-mix(in srgb, var(--amber) 16%, #fff); color: var(--amber); }
  `,
});

/* 과제와 성적 — rubric grading + score card with 반환 */
scene('teams/teams-score', (K) => {
  const lv = (on) => `<i class="${on ? 'on' : ''}">${on ? K.ico('checkmark', { s: 2.4 }) : ''}</i>`;
  const crit = (name, pick) => `<b>${name}</b>${[0, 1, 2].map((i) => lv(i === pick)).join('')}`;
  return K.win({
    x: 5, y: 10, w: 66, h: 50, title: '환경 보고서', sub: ' · 채점',
    body: `<div class="gd">
      <div class="row who">${K.avatar('김', { s: 4.6 })}<div class="grow col" style="gap:.8cqw">${K.skel('62%')}${K.skel('38%')}</div>${K.chip('제출됨', { dot: 'var(--green)' })}</div>
      <p class="cap">채점 기준표</p>
      <div class="rub">
        <span></span><span class="lv">우수</span><span class="lv">보통</span><span class="lv">노력</span>
        ${crit('자료 조사', 0)}${crit('내용 구성', 1)}${crit('표현', 0)}
      </div>
    </div>`,
  }) + K.card({
    right: 5, y: 15, w: 30,
    body: `<div class="pt"><p class="t-s">점수</p><div class="big"><span class="t-num">18</span><span>/20</span></div>${K.btn('반환', { primary: true, icon: 'arrow_reply' })}</div>`,
  }) + K.pill({ x: 3.5, y: 5.2, icon: 'checkmark_circle', text: '채점부터 성적까지' });
}, {
  css: `
    .gd { width: 50cqw; padding: 2.8cqw 3.2cqw; }
    .who { gap: 1.6cqw; padding-bottom: 2.2cqw; border-bottom: .2cqw solid var(--line); }
    .cap { margin: 2.2cqw 0 1.2cqw; font-size: 2.1cqw; font-weight: 700; color: rgb(var(--tint)); }
    .rub { display: grid; grid-template-columns: 12cqw repeat(3, 1fr); gap: .9cqw; align-items: center; }
    .rub .lv { font-size: 1.9cqw; font-weight: 650; color: var(--ink-4); text-align: center; }
    .rub b { font-size: 2.4cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
    .rub > i { display: grid; place-items: center; height: 4.4cqw; border-radius: 1cqw; background: var(--fill); }
    .rub > i.on { background: rgb(var(--tint)); color: #fff; }
    .pt { display: flex; flex-direction: column; align-items: stretch; gap: 1.6cqw; padding: 2.8cqw 3cqw 3cqw; }
    .big { display: flex; align-items: baseline; gap: .6cqw; }
    .big span:last-child { font-size: 3cqw; font-weight: 650; color: var(--ink-4); }
  `,
});

/* Reflect — student check-in on a phone, class results card */
scene('teams/teams-reflect', (K) => {
  const F = [
    ['emoji_laugh', '아주 좋아요', '#22a96f', 70],
    ['emoji_smile_slight', '좋아요', '#86c34f', 100],
    ['emoji_meh', '그저 그래요', '#f0b429', 40],
    ['emoji_sad_slight', '별로예요', '#f08a3c', 20],
    ['emoji_sad', '힘들어요', '#e5484d', 10],
  ];
  const face = (f, s) => K.ico(`${f[0]}_24_filled`, { s, c: f[2] });
  const opts = F.map((f, i) => `<div class="op${i === 1 ? ' on' : ''}"${i === 1 ? ' data-pick' : ''}>${face(f, 3.3)}<span>${f[1]}</span></div>`).join('');
  const dist = F.map((f, i) => `<div class="dr${i === 1 ? ' on' : ''}"${i === 1 ? ' data-to' : ''}>${face(f, 3)}<div class="progress grow"><i style="--p:${f[3]}%"></i></div></div>`).join('');
  return `<div class="phone" style="${K.pos({ x: 9, y: 6 })};--w:24cqw"><div class="phone__screen"><div class="ph">
      <p class="q">오늘 기분이<br>어때요?</p>
      <div class="ops">${opts}</div>
    </div></div></div>`
    + K.card({ x: 46, y: 14, w: 47, body: `<div class="rs"><div class="row hd"><b class="t-b">체크인 결과</b><span class="grow"></span>${K.chip('24명 응답', { tint: true })}</div><div class="col" style="gap:1.2cqw">${dist}</div></div>` })
    + '<div class="links"></div>'
    + K.pill({ right: 5, y: 4, icon: 'heart', text: '학생 마음을 한눈에' });
}, {
  css: `
    .ph { padding: 5cqw 1.8cqw 0; }
    .q { margin-bottom: 2cqw; font-size: 2.9cqw; font-weight: 700; letter-spacing: -0.03em; line-height: 1.25; }
    .ops { display: grid; gap: .8cqw; }
    .op { display: flex; align-items: center; gap: 1.1cqw; padding: .95cqw 1.1cqw; border-radius: 1.2cqw; background: var(--fill); font-size: 2.25cqw; font-weight: 650; white-space: nowrap; color: var(--ink-2); }
    .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: var(--ink); }
    .rs { padding: 2.6cqw 3cqw 3cqw; }
    .hd { margin-bottom: 2.2cqw; }
    .dr { display: flex; align-items: center; gap: 1.6cqw; }
    .dr .progress { height: 2cqw; }
    .dr .progress > i { background: color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
    .dr.on .progress > i { background: rgb(var(--tint)); }
  `,
  after(stage, K) {
    const a = boxOf(stage, stage.querySelector('.phone'));
    const p = boxOf(stage, stage.querySelector('[data-pick]'));
    const b = boxOf(stage, stage.querySelector('[data-to]'));
    const card = boxOf(stage, stage.querySelector('.rs'));
    stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r + 0.4, p.cy, card.l - 1, b.cy, { c: tintOf(stage), dot: true }), { z: 2 });
  },
});

/* 읽기 진행 — marked passage + accuracy */
scene('teams/teams-readingprogress', (K) => K.win({
  x: 6, y: 11, w: 88, h: 50, title: '읽기 진행', sub: ' · 결과',
  body: `<div class="rp">
    <div class="tx">
      <div class="row au"><span class="play">${K.ico('play', { s: 2.2 })}</span><div class="progress grow" style="--p:62%"><i></i></div><span class="t-xs">1:12</span></div>
      <p class="ps">따뜻한 봄날, 우리 반은 숲으로<br>소풍을 떠났어요. 길가에는 노란<br><mark class="er">민들레가</mark> 가득 피어 있었고,<br><mark class="om">시냇물</mark> 소리가 들려왔어요.</p>
    </div>
    <div class="st">
      <p class="t-s">정확도</p><span class="t-num">96%</span>
      <div class="col" style="gap:1cqw;margin-top:2.4cqw;align-items:flex-start">${K.chip('발음 오류 2', { dot: 'var(--red)' })}${K.chip('생략 1', { dot: 'var(--amber)' })}</div>
    </div>
  </div>`,
}) + K.pill({ x: 4, y: 6.2, icon: 'book_open_microphone', text: 'AI 읽기 코칭', dark: true }), {
  css: `
    .rp { display: grid; grid-template-columns: 1fr 24cqw; height: 100%; }
    .tx { padding: 3cqw 3.4cqw; }
    .au { gap: 1.4cqw; margin-bottom: 2.6cqw; }
    .play { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
    .au .progress { height: 1cqw; }
    .ps { font-size: 2.85cqw; font-weight: 600; line-height: 1.9; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
    mark { padding: .2cqw .5cqw; border-radius: .6cqw; color: var(--ink); }
    mark.er { background: color-mix(in srgb, var(--red) 16%, #fff); box-shadow: inset 0 -.35cqw 0 var(--red); }
    mark.om { background: color-mix(in srgb, var(--amber) 22%, #fff); box-shadow: inset 0 -.35cqw 0 var(--amber); }
    .st { padding: 3.4cqw 3cqw; border-left: .2cqw solid var(--line); background: #fbfbfe; }
    .st .t-num { display: block; margin-top: .8cqw; color: rgb(var(--tint)); }
  `,
});

/* 화상 회의 — dark meeting window: controls, gallery, raised hand */
scene('teams/teams-onlinemeet', (K) => {
  const ctl = (icon, label) => `<span class="ct">${K.ico(icon, { s: 2.8 })}<em>${label}</em></span>`;
  const tile = (init, name, a, b, extra = '', cls = '') => `<div class="vid ${cls}" style="--a:${a};--b:${b}">${K.avatar(init, { s: 6.4, c: 'rgba(255,255,255,.16)' })}<span class="name">${name}</span>${extra}</div>`;
  return K.win({
    x: 7, y: 10, w: 86, h: 52, dark: true, title: '과학 수업', sub: '12:04',
    body: `<div class="mt">
      <div class="ctl">${ctl('chat:r', '채팅')}${ctl('people:r', '사람')}${ctl('hand_right:r', '손 들기')}${ctl('emoji:r', '반응')}${ctl('grid:r', '보기')}${ctl('share_screen_start:r', '공유')}<span class="leave">${K.ico('call_end', { s: 2.6 })}나가기</span></div>
      <div class="gal">
        ${tile('김', '선생님', '#5b5fc7', '#3a3d9a', '', 'spk')}
        ${tile('이', '이○○', '#3b4566', '#262b40', `<span class="hand">${K.ico('hand_right', { s: 2.3 })}</span>`)}
        ${tile('박', '박○○', '#47405f', '#2a263b')}
        ${tile('최', '최○○', '#36495f', '#222d3b')}
      </div>
    </div>`,
  }) + K.pill({ right: 5, y: 5.2, icon: 'video', text: '교실 밖에서도 수업' });
}, {
  css: `
    .leave { margin-left: .6cqw; display: inline-flex; align-items: center; gap: .7cqw; padding: .9cqw 1.6cqw; border-radius: 1cqw; background: var(--red); color: #fff; font-size: 2.1cqw; font-weight: 650; }
    .mt { padding: 0 2.6cqw; }
    .ctl { display: flex; justify-content: flex-end; align-items: center; gap: 2.4cqw; padding: 1.6cqw .4cqw 1.8cqw; }
    .ct { display: flex; flex-direction: column; align-items: center; gap: .5cqw; color: #c9ced6; }
    .ct em { font-style: normal; font-size: 2cqw; font-weight: 600; white-space: nowrap; }
    .gal { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 17cqw; gap: 1.2cqw; }
    .vid .name { font-size: 1.9cqw; }
    .vid.spk { box-shadow: inset 0 0 0 .4cqw #a6a9f5; }
    .hand { position: absolute; top: 1cqw; left: 1cqw; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 1cqw; background: #f6c453; color: #3b2a05; }
  `,
});

/* 수업용 전자필기장 — notebook structure inside the class team */
scene('teams/teams-note', (K) => {
  const nav = (icon, label, cls = '') => `<div class="nv ${cls}">${K.ico(icon, { s: 2.6 })}<span>${label}</span></div>`;
  const sec = (label, c, on) => `<div class="sc${on ? ' on' : ''}"><i style="background:${c}"></i>${label}</div>`;
  return K.win({
    x: 16, y: 9.5, w: 80, h: 50, title: '3학년 2반', sub: ' › 일반',
    body: `${tabs(['게시물', '파일', ['수업용 전자필기장', K.app('onenote')]], '수업용 전자필기장')}
      <div class="nb">
        <div class="tree">
          ${nav('library:r', '콘텐츠 라이브러리')}${nav('people_team:r', '공동 작업 공간')}${nav('lock_closed:r', '교사 전용')}
          <div class="stu"><div class="row who">${K.avatar('김', { s: 3.4 })}${K.skel('9cqw')}</div>
            ${sec('유인물', '#7719aa')}${sec('수업 노트', '#2f7de1', true)}<div class="sc"><i style="background:#e0569a"></i>${K.skel('8cqw')}</div>
          </div>
        </div>
        <div class="pg"><b class="t-h2">1단원 학습지</b>${K.skel('62%', { style: 'margin-top:2.2cqw' })}${K.skel('44%', { style: 'margin-top:1.2cqw' })}
          <div class="ink"><svg viewBox="0 0 160 44" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18c4-9 9-10 10-2s-3 11 1 9 6-14 11-13 1 13 5 12 5-10 9-10 2 9 6 9 4-8 8-9 3 8 7 8"/><path d="M84 15c3-6 8-7 8 0s-4 10 0 9 7-12 12-11-1 11 4 11 6-9 10-9 1 8 6 8"/><path d="M8 37c26-3 70-4 128-3" stroke-width="1.8" opacity=".55"/></svg></div>
        </div>
      </div>`,
  }) + K.pill({ x: 3.5, y: 4.7, icon: 'notebook', text: '학생 노트를 한곳에', dark: true });
}, {
  css: TABS + `
    .nb { display: grid; grid-template-columns: 31cqw 1fr; height: 100%; }
    .tree { padding: 2cqw 1.6cqw; background: #fafafd; border-right: .2cqw solid var(--line); }
    .nv { display: flex; align-items: center; gap: 1.1cqw; padding: .85cqw 1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .nv .ico { color: rgb(var(--tint)); }
    .stu { margin-top: 1cqw; padding: 1.2cqw 1cqw 1.4cqw; border-radius: 1.4cqw; background: #fff; box-shadow: 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
    .who { gap: 1cqw; margin-bottom: .8cqw; }
    .sc { display: flex; align-items: center; gap: 1cqw; padding: .7cqw 1cqw; border-radius: .9cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .sc > i { width: .7cqw; height: 2.4cqw; border-radius: 99px; }
    .sc.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: var(--ink); }
    .pg { padding: 3cqw 3.2cqw; }
    .ink { margin-top: 2.6cqw; padding: 2cqw 2.2cqw 1.6cqw; border-radius: 1.4cqw; background: #fafafd; box-shadow: inset 0 0 0 .2cqw var(--line); color: rgb(var(--tint)); }
    .ink svg { display: block; width: 30cqw; height: auto; }
  `,
});

/* 팀 만들기 — team type picker dialog */
scene('teams/teams-maketeam', (K) => {
  const T = [
    ['hat_graduation', '수업', '토론·프로젝트·과제', true],
    ['people_community', 'PLC', '전문적 학습 공동체'],
    ['briefcase', '직원', '학교 관리 및 개발'],
    ['apps', '기타', '동아리·스터디 그룹'],
  ];
  const tile = ([icon, name, desc, on]) => `<div class="ty${on ? ' on' : ''}"><span class="ti">${K.ico(icon, { s: 3.4 })}</span><div class="col" style="gap:.5cqw"><b>${name}</b><span class="t-xs">${desc}</span></div>${on ? `<span class="ck">${K.ico('checkmark', { s: 2 })}</span>` : ''}</div>`;
  return K.card({
    x: 12, y: 9, w: 76,
    body: `<div class="dlg">
      <div class="row hd"><span class="t-h2">팀 유형 선택</span><span class="grow"></span>${K.ico('dismiss:r', { s: 2.8, c: 'var(--ink-4)' })}</div>
      <div class="gr">${T.map(tile).join('')}</div>
    </div>`,
  }) + K.cursor({ x: 42.5, y: 24.5 }) + K.pill({ right: 6.5, bottom: 7.7, icon: 'people_team', text: '우리 반 온라인 교실', tint: true });
}, {
  css: `
    .dlg { padding: 3cqw 3.2cqw 3.4cqw; }
    .hd { margin-bottom: 2.4cqw; }
    .gr { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6cqw; }
    .ty { position: relative; display: flex; align-items: center; gap: 1.6cqw; padding: 2cqw; border-radius: 1.6cqw; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
    .ty b { font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.02em; }
    .ty .t-xs { font-size: 2cqw; }
    .ti { flex: none; display: grid; place-items: center; width: 6cqw; height: 6cqw; border-radius: 1.5cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); }
    .ty.on { background: color-mix(in srgb, rgb(var(--tint)) 6%, #fff); box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)); }
    .ty.on .ti { background: rgb(var(--tint)); color: #fff; }
    .ck { position: absolute; top: 1.4cqw; right: 1.4cqw; display: grid; place-items: center; width: 3cqw; height: 3cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
  `,
});

/* 시작하기 — desktop app rail + mobile app */
scene('teams/teams-introduce', (K) => {
  const R = [['alert', '활동'], ['chat', '채팅'], ['people_team', '팀', true], ['backpack', '과제'], ['calendar_ltr', '일정'], ['call', '통화']];
  const rail = R.map(([i, l, on]) => `<span class="ri${on ? ' on' : ''}">${K.ico(on ? i : `${i}:r`, { s: 3 })}<em>${l}</em></span>`).join('');
  const TM = [['3-2', '3학년 2반', 'var(--m2)'], ['과학', '과학 교과', 'var(--m4)'], ['교무', '교무실', 'var(--m1)'], ['코딩', '코딩 동아리', 'var(--m3)']];
  const team = ([ab, name, c]) => `<div class="tm"><span class="sq" style="background:${c}">${ab}</span><b>${name}</b></div>`;
  const mrow = ([ab, , c]) => `<div class="mr"><span class="sq" style="background:${c}">${ab}</span><div class="grow col" style="gap:.7cqw">${K.skel('80%')}${K.skel('50%')}</div></div>`;
  return K.win({
    x: 5, y: 11, w: 63, h: 50, title: 'Microsoft Teams',
    body: `<div class="ap"><div class="rail">${rail}</div><div class="mn"><b class="t-h2">팀</b><div class="tg">${TM.map(team).join('')}</div></div></div>`,
  }) + `<div class="phone" style="${K.pos({ x: 72, y: 7 })};--w:22cqw"><div class="phone__screen"><div class="mb"><b class="mh">팀</b>${TM.slice(0, 3).map(mrow).join('')}</div><div class="nav">${['alert:r', 'chat:r', 'people_team', 'backpack:r'].map((i, n) => `<span class="${n === 2 ? 'on' : ''}">${K.ico(i, { s: 2.6 })}</span>`).join('')}</div></div></div>`
    + K.pill({ x: 3.5, y: 6.2, icon: 'phone_laptop', text: '웹·PC·모바일 어디서나' });
}, {
  css: `
    .ap { display: grid; grid-template-columns: 10cqw 1fr; height: 100%; }
    .rail { display: flex; flex-direction: column; align-items: center; gap: 1.5cqw; padding-top: 2.2cqw; background: #f6f6fb; border-right: .2cqw solid var(--line); }
    .ri { position: relative; display: flex; flex-direction: column; align-items: center; gap: .45cqw; width: 100%; color: var(--ink-3); }
    .ri em { font-style: normal; font-size: 1.85cqw; font-weight: 600; }
    .ri.on { color: rgb(var(--tint)); }
    .ri.on::before { content: ''; position: absolute; left: 0; top: .3cqw; bottom: .3cqw; width: .5cqw; border-radius: 0 99px 99px 0; background: rgb(var(--tint)); }
    .mn { padding: 2.8cqw 2.8cqw; }
    .tg { display: grid; grid-template-columns: 1fr 1fr; gap: 1.3cqw; margin-top: 2cqw; }
    .tm { display: flex; align-items: center; gap: 1.3cqw; padding: 1.5cqw 1.4cqw; border-radius: 1.4cqw; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
    .tm b { font-size: 2.35cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
    .sq { flex: none; display: grid; place-items: center; width: 5.2cqw; height: 5.2cqw; border-radius: 1.2cqw; color: #fff; font-size: 1.9cqw; font-weight: 700; }
    .mb { padding: 5cqw 1.8cqw 0; }
    .mh { display: block; margin-bottom: 1.6cqw; font-size: 2.9cqw; font-weight: 700; }
    .mr { display: flex; align-items: center; gap: 1.2cqw; padding: 1cqw 0; }
    .mr .sq { width: 4.4cqw; height: 4.4cqw; font-size: 1.6cqw; }
    .nav { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-around; padding: 1.4cqw 1cqw 2.2cqw; border-top: .2cqw solid var(--line); color: var(--ink-4); }
    .nav .on { color: rgb(var(--tint)); }
  `,
});

/* Insights — digital activity report */
scene('teams/teams-insights', (K) => K.win({
  x: -6, y: 11, w: 98, h: 50, title: 'Insights', sub: ' · 3학년 2반', icon: 'teams',
  body: `<div class="ins">
    <div class="row tb">${K.chip('디지털 활동', { solid: true })}${K.chip('과제', { line: true })}${K.chip('읽기', { line: true })}${K.chip('리플렉션', { line: true })}${K.chip('검색 코치', { line: true })}</div>
    <div class="kp">
      <div class="col" style="gap:.7cqw"><p class="t-s">활동한 학생</p><div class="row" style="align-items:baseline;gap:.4cqw"><span class="t-num">24</span><span class="of">/26</span></div>${K.chip('지난주보다 12% ↑', { tint: true, style: 'margin-top:1cqw' })}</div>
      <div class="ch">${K.bars([34, 48, 42, 60, 54, 40, 66, 58, 72, 64, 80, 92], { on: [11], h: 18, gap: 1.2 })}<div class="ax"><span>10월 6일</span><span>10월 17일</span></div></div>
    </div>
  </div>`,
}) + K.pill({ right: 4, y: 6.2, icon: 'data_trending', text: '데이터로 보는 수업', dark: true }), {
  css: `
    .win__dots { visibility: hidden; }
    .ins { padding: 2.8cqw 3.6cqw 0 9.4cqw; }
    .tb { gap: 1cqw; }
    .kp { display: grid; grid-template-columns: 22cqw 1fr; gap: 4cqw; align-items: end; margin-top: 3.2cqw; }
    .of { font-size: 3cqw; font-weight: 650; color: var(--ink-4); }
    .ax { display: flex; justify-content: space-between; margin-top: 1.2cqw; font-size: 1.85cqw; font-weight: 600; color: var(--ink-4); }
  `,
});

/* 팀 홈페이지 — SharePoint-style page with web parts */
scene('teams/teams-home', (K) => K.win({
  x: 9, y: 11, w: 82, h: 52, title: '홈페이지', sub: ' · 3학년 2반', barRight: K.btn('편집', { icon: 'edit:r', line: true }),
  body: `<div class="hp">
    <div class="hero"><b>3학년 2반</b><span>우리 반 소식과 자료</span></div>
    <div class="add"><i></i><span>${K.ico('add', { s: 2.2 })}</span><i></i></div>
    <div class="sec">
      <div class="wp cd"><p class="t-xs">카운트다운 타이머</p><span class="t-num">D-12</span><span class="t-s">현장체험학습</span></div>
      <div class="wp"><p class="lb">과제</p>
        <div class="row ar">${K.ico('backpack:r', { s: 2.6 })}${K.skel('52%')}<span class="grow"></span>${K.chip('10/23')}</div>
        <div class="row ar">${K.ico('backpack:r', { s: 2.6 })}${K.skel('40%')}<span class="grow"></span>${K.chip('10/27')}</div>
      </div>
    </div>
  </div>`,
}) + K.pill({ x: 4, y: 6.2, icon: 'web_asset', text: '공지·자료를 한 화면에' }), {
  css: `
    .hp { padding: 2.4cqw 3cqw; }
    .hero { display: flex; flex-direction: column; justify-content: flex-end; gap: .5cqw; height: 11.6cqw; padding: 2cqw 3cqw; border-radius: 1.6cqw; color: #fff;
      background: radial-gradient(60% 120% at 85% 10%, rgba(255,255,255,.35), transparent 60%), linear-gradient(120deg, rgb(var(--tint)), var(--m1)); }
    .hero b { font-size: 3.5cqw; font-weight: 700; letter-spacing: -0.03em; }
    .hero span { font-size: 2.15cqw; font-weight: 600; opacity: .9; }
    .add { display: flex; align-items: center; gap: 1cqw; margin: 1cqw 0; }
    .add > i { flex: 1; height: .25cqw; background: color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
    .add span { display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; box-shadow: 0 .4cqw 1cqw rgba(var(--tint), .4); }
    .sec { display: grid; grid-template-columns: 24cqw 1fr; gap: 1.8cqw; }
    .wp { padding: 2cqw 2.2cqw; border-radius: 1.4cqw; box-shadow: inset 0 0 0 .22cqw var(--line-2); }
    .wp.cd { display: flex; flex-direction: column; gap: .6cqw; box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); border-radius: 1.4cqw; }
    .wp.cd .t-num { color: rgb(var(--tint)); }
    .lb { margin-bottom: 1.2cqw; font-size: 2.4cqw; font-weight: 700; }
    .ar { gap: 1.2cqw; padding: .8cqw 0; color: rgb(var(--tint)); }
  `,
});

/* 파일 탭 — folders and Office files, one being co-edited */
scene('teams/teams-filetap', (K) => {
  const row = (lead, name, right = '', cls = '') => `<div class="fr ${cls}">${lead}<span class="nm">${name}</span><span class="grow"></span>${right}</div>`;
  const folder = K.ico('folder', { s: 3.4, c: '#f0b73e' });
  const app = (a) => K.app(a, { s: 3.4 });
  const who = `<span class="av">${K.avatar('김', { s: 3.4 })}${K.avatar('이', { s: 3.4, c: 'var(--m4)' })}${K.avatar('박', { s: 3.4, c: 'var(--pink)' })}</span>${K.chip('편집 중', { dot: 'var(--green)' })}`;
  return K.win({
    x: 10, y: 11, w: 96, h: 50, title: '3학년 2반', sub: ' › 일반',
    body: `${tabs(['게시물', '파일', '수업용 전자필기장'], '파일')}
      <div class="fl">
        <div class="row tl">${K.btn('새로 만들기', { primary: true, icon: 'add' })}${K.btn('업로드', { line: true, icon: 'arrow_upload:r' })}</div>
        ${row(folder, '학습 자료', K.chip('읽기 전용', { icon: 'lock_closed:r' }))}
        ${row(folder, '모둠 발표')}
        ${row(app('excel'), '준비물 구입.xlsx', who, 'on')}
        ${row(app('word'), '현장체험학습 안내.docx')}
      </div>`,
  }) + K.pill({ right: 4, y: 6.2, icon: 'people_edit', text: '함께 열어 바로 편집' });
}, {
  css: TABS + `
    .fl { width: 81cqw; padding: 2.2cqw 3cqw; }
    .tl { gap: 1.2cqw; margin-bottom: 1.6cqw; }
    .fr { display: flex; align-items: center; gap: 1.6cqw; height: 5.6cqw; padding: 0 1.4cqw; border-bottom: .2cqw solid var(--line); }
    .fr .nm { font-size: 2.3cqw; font-weight: 600; letter-spacing: -0.015em; white-space: nowrap; }
    .fr.on { border-radius: 1.2cqw; border-bottom-color: transparent; background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 35%, #fff); }
    .av { display: flex; }
    .av .avatar { box-shadow: 0 0 0 .3cqw #fff; }
    .av .avatar + .avatar { margin-left: -.7cqw; }
  `,
});

/* 수업 활동 — module list + expanded module with resources */
scene('teams/teams-class', (K) => {
  const toc = (no, name, on) => `<div class="tc${on ? ' on' : ''}"${on ? ' data-from' : ''}><em>${no}</em>${name}</div>`;
  const resItem = (lead, label) => `<div class="ri"><span class="rl">${lead}</span><b>${label}</b></div>`;
  return K.card({
    x: 5, y: 10, w: 27,
    body: `<div class="toc"><p class="t-xs">수업 활동</p>${toc('1차시', '물의 순환')}${toc('2차시', '구름과 비', true)}${toc('3차시', '물 절약')}</div>`,
  }) + K.card({
    x: 38, y: 8, w: 56, top: true, cls: 'mod',
    body: `<div class="md">
      <div class="row">${K.chip('2차시', { tint: true })}<span class="grow"></span>${K.btn('게시', { primary: true })}</div>
      <b class="t-h">구름과 비</b>
      <div class="rs">
        ${resItem(K.app('word', { s: 3 }), '활동지')}${resItem(K.ico('backpack', { s: 2.8 }), '과제')}
        ${resItem(K.app('onenote', { s: 3 }), '전자필기장')}${resItem(K.ico('link', { s: 2.8 }), '참고 링크')}
      </div>
      <div class="drop">${K.ico('add', { s: 2.4 })}리소스 추가</div>
    </div>`,
  }) + '<div class="links"></div>'
    + K.pill({ x: 4, bottom: 5.5, icon: 'text_bullet_list_square', text: '차시별로 정리', dark: true });
}, {
  css: `
    .toc { display: grid; gap: .9cqw; padding: 2.2cqw 1.8cqw 2.4cqw; }
    .toc .t-xs { margin: 0 0 .4cqw .6cqw; }
    .tc { display: flex; flex-direction: column; gap: .2cqw; padding: 1cqw 1.2cqw; border-radius: 1cqw; font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
    .tc em { font-style: normal; font-size: 1.85cqw; font-weight: 650; color: var(--ink-4); }
    .tc.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); }
    .tc.on em { color: rgb(var(--tint)); }
    .md { padding: 2.4cqw 3cqw 3cqw; }
    .md .t-h { display: block; margin-top: 1.4cqw; }
    .rs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2cqw; margin-top: 2.2cqw; }
    .ri { display: flex; align-items: center; gap: 1.2cqw; padding: 1.3cqw 1.4cqw; border-radius: 1.2cqw; background: var(--fill); }
    .ri b { font-size: 2.3cqw; font-weight: 650; white-space: nowrap; }
    .rl { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; background: #fff; color: rgb(var(--tint)); }
    .drop { display: flex; align-items: center; justify-content: center; gap: .8cqw; margin-top: 1.2cqw; padding: 1.3cqw; border-radius: 1.2cqw; border: .22cqw dashed color-mix(in srgb, rgb(var(--tint)) 45%, #fff); color: rgb(var(--tint)); font-size: 2.2cqw; font-weight: 650; white-space: nowrap; }
  `,
  after(stage, K) {
    const a = boxOf(stage, stage.querySelector('[data-from]'));
    const m = boxOf(stage, stage.querySelector('.mod'));
    stage.querySelector('.links').outerHTML = K.wires(K.curve(a.r - 1.2, a.cy, m.l - 0.9, m.t + 9, { c: tintOf(stage), dot: true }), { z: 2 });
  },
});

/* 채널과 게시물 — channel list + announcement post */
scene('teams/teams-channel', (K) => {
  const ch = (name, on, icon = '') => `<div class="ch${on ? ' on' : ''}"><span>${name}</span>${icon}</div>`;
  return K.win({
    x: 7, y: 10, w: 86, h: 50, title: '3학년 2반',
    body: `<div class="cw">
      <div class="cl"><p class="t-xs">채널</p>${ch('일반')}${ch('1조 토의', true)}${ch('2조 토의')}${ch('교사 회의', false, K.ico('lock_closed:r', { s: 2.2 }))}</div>
      <div class="cm">
        <div class="row hd"><span class="tav">3-2</span><b class="t-b">1조 토의</b>${tabs(['게시물', '파일', 'Notes', ['', K.ico('add:r', { s: 2.4 })]], '게시물')}</div>
        <div class="post">
          <div class="bn">${K.ico('megaphone', { s: 3 })}<b>발표 자료 마감 안내</b></div>
          <div class="pb"><div class="row" style="gap:1.2cqw">${K.avatar('김', { s: 3.8 })}${K.skel('24%')}</div>${K.skel('88%', { style: 'margin-top:1.6cqw' })}${K.skel('64%', { style: 'margin-top:1.1cqw' })}</div>
        </div>
        ${K.btn('게시물 시작', { primary: true, icon: 'compose', style: 'margin-top:2cqw' })}
      </div>
    </div>`,
  }) + K.pill({ right: 4, bottom: 3.2, icon: 'chat_multiple', text: '조별 채널로 토의' });
}, {
  css: TABS + `
    .cw { display: grid; grid-template-columns: 24cqw 1fr; height: 100%; }
    .cl { display: grid; gap: .6cqw; align-content: start; padding: 2.4cqw 1.6cqw; background: #f6f6fb; border-right: .2cqw solid var(--line); }
    .cl .t-xs { margin: 0 0 .4cqw 1cqw; }
    .ch { display: flex; align-items: center; justify-content: space-between; padding: 1cqw 1.2cqw; border-radius: 1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .ch .ico { color: var(--ink-4); }
    .ch.on { background: #fff; color: var(--ink); font-weight: 700; box-shadow: 0 .3cqw 1cqw rgba(var(--tint), .16); }
    .cm { padding: 0 3cqw; }
    .hd { gap: 1.2cqw; border-bottom: .2cqw solid var(--line); }
    .hd .t-b { margin-right: 1.6cqw; }
    .tav { flex: none; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 1cqw; background: var(--m2); color: #fff; font-size: 1.85cqw; font-weight: 700; }
    .hd .tabs { padding: 0; border: 0; }
    .hd .tabs > span:last-child { color: var(--ink-4); }
    .post { margin-top: 2.4cqw; border-radius: 1.6cqw; overflow: hidden; box-shadow: 0 0 0 .22cqw var(--line-2), 0 1.4cqw 2.6cqw -1.6cqw rgba(var(--tint), .4); }
    .bn { display: flex; align-items: center; gap: 1.2cqw; padding: 2cqw 2.4cqw; color: #fff; background: linear-gradient(120deg, rgb(var(--tint)), var(--m1)); }
    .bn b { font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .pb { padding: 2cqw 2.4cqw 2.4cqw; }
  `,
});
})();
