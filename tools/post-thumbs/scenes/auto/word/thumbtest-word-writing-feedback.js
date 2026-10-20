/* Word — 검토 기능으로 학생 글쓰기 피드백 (see STYLE_GUIDE.md) */
(() => {
  // 검토 탭 → 변경 내용 추적 켬, 학생 논설문의 삭제·추가 표시 + 변경 풍선(수락/거부)
  scene('word/thumbtest-word-writing-feedback', (K) => {
    const tabs = ['홈', '삽입', '검토', '보기']
      .map((t) => `<span${t === '검토' ? ' class="on"' : ''}>${t}</span>`).join('');
    const rb = (ico, t) => `<span class="rbt">${K.ico(ico, { s: 2.6 })}${t}</span>`;
    return K.win({
      x: 21, y: 7, w: 83, h: 54, title: '2학년 3반 논설문.docx',
      body: `<div class="ed">
        <div class="tabs">${tabs}</div>
        <div class="rb">
          ${rb('comment_add:r', '새 메모')}
          <i class="vs"></i>
          <span class="trk">${K.ico('document_edit', { s: 2.6 })}변경 내용 추적<i class="toggle on"></i></span>
          <i class="vs"></i>
          ${rb('document_checkmark:r', '수락')}
          ${rb('document_dismiss:r', '거부')}
        </div>
        <div class="cv"><div class="page pg">
          ${K.skel('40%', { h: 2.2, tint: true })}
          ${K.skel('92%')}
          <p class="tx">스마트폰 사용 시간을 <del>많이</del> <ins>하루 2시간으로</ins> 줄여야 한다.</p>
          ${K.skel('86%')}${K.skel('90%')}${K.skel('64%')}
        </div></div>
      </div>`,
    })
      + K.card({
        x: 4.5, y: 31, w: 30, cls: 'bl',
        body: `<div class="who">${K.avatar('김', { s: 3.6 })}<b>김 선생님</b></div>
          <p class="what"><em>추가함:</em> 하루 2시간으로</p>
          <div class="acts">
            <span class="ok">${K.ico('checkmark', { s: 2.4 })}</span>
            <span class="no">${K.ico('dismiss', { s: 2.4 })}</span>
          </div>`,
      })
      + K.pill({ right: 4, y: 3.2, icon: 'document_edit', text: '고친 이유가 보이는 피드백' });
  }, {
    css: `
      .ed { display: flex; flex-direction: column; height: 100%; }
      .tabs { display: flex; align-items: center; gap: 2.4cqw; height: 5cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
      .tabs > .on { color: rgb(var(--tint)); font-weight: 750; }
      .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .rb { flex: none; display: flex; align-items: center; gap: 1.6cqw; height: 8cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; white-space: nowrap; }
      .vs { flex: none; width: .2cqw; height: 4.6cqw; background: var(--line); }
      .rbt { display: inline-flex; align-items: center; gap: .8cqw; font-size: 2.1cqw; font-weight: 650; color: var(--ink-2); }
      .rbt .ico { color: var(--ink-3); }
      .trk { display: inline-flex; align-items: center; gap: 1cqw; height: 5cqw; padding: 0 1.2cqw 0 1.3cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); font-size: 2.45cqw; font-weight: 750; color: rgb(var(--tint)); }
      .trk .toggle { margin-left: .4cqw; }
      .cv { flex: 1; padding: 2.8cqw 0 0 15.5cqw; background: #f3f3f5; }
      .pg { width: 63cqw; height: 100%; display: flex; flex-direction: column; gap: 1.6cqw; padding: 4cqw 4.4cqw 0; }
      .pg .skel:first-child { margin-bottom: .8cqw; }
      .tx { margin: .6cqw 0; font-size: 2.65cqw; font-weight: 650; color: var(--ink); white-space: nowrap; letter-spacing: -0.02em; }
      .tx del { color: var(--red); text-decoration-thickness: .25cqw; }
      .tx ins { color: rgb(var(--tint)); text-decoration-thickness: .25cqw; text-underline-offset: .5cqw; font-weight: 750; }
      .bl { z-index: 3; padding: 2.4cqw 2.6cqw 2.2cqw; display: flex; flex-direction: column; gap: 1.5cqw; }
      .bl::before { content: ''; position: absolute; left: 0; top: 2.2cqw; bottom: 2.2cqw; width: .5cqw; border-radius: 0 99px 99px 0; background: rgb(var(--tint)); }
      .who { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.1cqw; font-weight: 700; color: var(--ink-3); }
      .what { font-size: 2.4cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .what em { font-style: normal; color: rgb(var(--tint)); }
      .acts { display: flex; gap: 1cqw; }
      .acts span { display: grid; place-items: center; width: 4.6cqw; height: 4.2cqw; border-radius: 1.1cqw; }
      .acts .ok { background: var(--grad); color: #fff; }
      .acts .no { box-shadow: inset 0 0 0 .2cqw var(--line-2); color: var(--ink-3); }
    `,
  });
})();
