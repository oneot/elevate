/* PowerPoint — 강의 자료 쉽게 만들기 (v3 fluid) */
(() => {
  // 웹 PowerPoint 시작 화면: 교육용 계정으로 로그인 → '빈 프레젠테이션' 만들기, 최근 항목은 OneDrive에 자동 저장
  scene('powerpoint/powerpoint-tutorial', (K) => {
    const tpl = (cls, label, inner) => `<div class="tp ${cls}"><div class="slide th">${inner}</div><span>${label}</span></div>`;
    const recent = (name, when) => `<div class="rc">${K.app('powerpoint', { s: 3.4 })}<b>${name}</b><span class="grow"></span><span class="od">${K.ico('cloud_checkmark', { s: 2.6 })}${when}</span></div>`;
    return K.win({
      x: 31, y: 8.5, w: 65, h: 52, icon: false, title: 'PowerPoint',
      barRight: `<span class="sb">${K.ico('search:r', { s: 2.4 })}${K.skel('9cqw', { h: 1.2 })}</span>${K.avatar('김', { s: 4.4 })}`,
      body: `<div class="hm">
        <h4>새로 만들기</h4>
        <div class="row nw">
          ${tpl('on', '빈 프레젠테이션', `<span class="plus"><span class="pc">${K.ico('add', { s: 4 })}</span></span>`)}
          ${tpl('t1', '학급 소개', `<i class="b1"></i><i class="b2"></i><i class="sun"></i>`)}
          ${tpl('t2', '수업 안내', `<i class="b1"></i><i class="b2"></i><i class="bx"></i>`)}
        </div>
        <h4>최근 항목</h4>
        ${recent('3학년 과학 수업자료', '방금')}
        ${recent('수행평가 안내', '어제')}
      </div>`,
    })
      + K.cursor({ x: 49.5, y: 29.5 })
      + K.tile({ x: 26, y: 3.4, s: 10.5 })
      + K.float({ x: 17, y: 25, icon: 'cloud_checkmark' })
      + K.float({ x: 7, y: 9, s: 5.4, icon: 'hat_graduation', far: true })
      + K.pill({ x: 3, bottom: 5.5, icon: 'globe', text: '설치 없이 바로 시작' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; font-size: 2.8cqw; font-weight: 700; }
      .sb { display: flex; align-items: center; gap: 1cqw; height: 4.4cqw; padding: 0 1.6cqw; border-radius: 99px; background: rgba(240, 241, 244, .9); color: var(--ink-4); }
      .hm { height: 100%; padding: 2.6cqw 3.2cqw 0; display: flex; flex-direction: column; gap: 1.6cqw; }
      h4 { font-size: 2.4cqw; font-weight: 700; color: var(--ink-3); }
      .nw { gap: 2.4cqw; align-items: flex-start; margin-bottom: 1cqw; }
      .tp { display: flex; flex-direction: column; gap: 1.1cqw; font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .tp .th { width: 16.5cqw; }
      .tp.on .th { width: 19.5cqw; box-shadow: 0 0 0 .4cqw rgb(var(--tint)), 0 1.6cqw 3.2cqw -1.4cqw rgba(var(--tint), .55); }
      .tp.on > span { font-size: 2.7cqw; font-weight: 800; color: rgb(var(--tint)); }
      .plus { position: absolute; inset: 0; display: grid; place-items: center; color: rgb(var(--tint)); }
      .pc { display: grid; place-items: center; width: 6.6cqw; height: 6.6cqw; border-radius: 50%; background: var(--grad); color: #fff; box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(var(--tint), .6); }
      .th i { position: absolute; border-radius: 99px; }
      .t1 .th { background: linear-gradient(135deg, #ffd9c2, #ffb79a); }
      .t1 .b1 { left: 10%; top: 22%; width: 48%; height: 11%; background: #fff; }
      .t1 .b2 { left: 10%; top: 42%; width: 30%; height: 8%; background: rgba(255, 255, 255, .7); }
      .t1 .sun { right: 10%; bottom: 14%; width: 26%; aspect-ratio: 1; border-radius: 50%; background: #ff8a5c; }
      .t2 .th { background: linear-gradient(135deg, #fff1e6, #ffe0cf); }
      .t2 .b1 { left: 10%; top: 18%; width: 56%; height: 11%; background: rgb(var(--tint)); opacity: .85; }
      .t2 .b2 { left: 10%; top: 40%; width: 40%; height: 8%; background: #e9b9a1; }
      .t2 .bx { left: 10%; right: 10%; bottom: 12%; height: 22%; border-radius: .6cqw; background: #fff; }
      .rc { display: flex; align-items: center; gap: 1.6cqw; height: 5.6cqw; padding: 0 1.4cqw; border-radius: 1.2cqw; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .15cqw rgba(20, 22, 30, .05); }
      .rc b { font-size: 2.5cqw; font-weight: 700; white-space: nowrap; }
      .od { display: flex; align-items: center; gap: .7cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
      .od .ico { color: var(--green); }
    `,
  });
})();
