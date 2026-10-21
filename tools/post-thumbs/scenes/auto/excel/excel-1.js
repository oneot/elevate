/* 학급 성적 관리하기: Copilot이 통합 성적으로 만든 '피벗 분석' 시트 — see STYLE_GUIDE.md */
(() => {
  scene('excel/excel-1', (K) => {
    const subj = [['국어', 78.4], ['수학', 71.2], ['영어', 81.6], ['통합사회', 76.0]];
    const rows = subj.map(([s, v]) => `<div class="pr${v === 81.6 ? ' top' : ''}"><span class="lb">${s}</span><span class="val"><i style="width:${((v - 55) / 30) * 20}cqw"></i><b>${v.toFixed(1)}</b></span></div>`).join('');
    return K.win({
      right: 4, y: 10, w: 63, h: 50, title: '성적 통합 분석', icon: false,
      body: `<div class="pv">
          <div class="flt"><span class="fb">${K.ico('filter', { s: 2.2 })}과목명 (모두)</span>${K.skel('10cqw', { h: 1.6 })}</div>
          <div class="ph"><span>행 레이블 ${K.ico('caret_down', { s: 2 })}</span><span>평균: 원점수</span></div>
          ${rows}
          <div class="pr ghost"><span>${K.skel('8cqw', { h: 1.8 })}</span><span class="val">${K.skel('60%', { h: 1.8 })}</span></div>
        </div>`,
    })
      + K.card({
        x: 4, y: 16, w: 30.5, cls: 'cp',
        body: `<div class="cph">${K.app('copilot', { s: 3.6 })}<b>Copilot</b></div>
          ${K.bubble('과목별 피벗테이블을 만들어 줘', { me: true })}
          <div class="done">${K.ico('checkmark_circle', { s: 2.8 })}<span>피벗 2개 완성</span></div>`,
      })
      + K.tile({ x: 28.4, y: 4.2, s: 11 })
      + K.float({ x: 7, y: 5, icon: 'arrow_sync', far: true })
      + K.pill({ x: 4, bottom: 4.6, icon: 'table_lightning', text: '피벗 분석 자동 생성', dark: true });
  }, {
    deco: { big: 'sphere', small: 'fold', v: 1 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .pv { height: 100%; padding: 2.4cqw 3cqw 0 5cqw; background: rgba(255, 255, 255, .55); }
      .flt { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: 1.8cqw; }
      .fb { display: flex; align-items: center; gap: .8cqw; height: 4cqw; padding: 0 1.4cqw; border-radius: .8cqw; background: #fff; color: var(--ink-2); font-size: 2.2cqw; font-weight: 650; white-space: nowrap; box-shadow: inset 0 0 0 .18cqw var(--line-2); }
      .fb .ico { color: rgb(var(--tint)); }
      .ph, .pr { display: grid; grid-template-columns: 18cqw 33cqw; align-items: center; }
      .ph { height: 5cqw; padding: 0 1.4cqw; border-radius: 1cqw 1cqw 0 0; background: var(--grad); color: #fff; font-size: 2.4cqw; font-weight: 700; }
      .ph span { display: flex; align-items: center; gap: .6cqw; white-space: nowrap; }
      .ph span:last-child { justify-content: flex-end; }
      .pr { height: 5.6cqw; padding: 0 1.4cqw; border-bottom: .18cqw solid var(--line); background: rgba(255, 255, 255, .9); }
      .lb { font-size: 2.7cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .val { position: relative; display: flex; align-items: center; justify-content: flex-end; height: 3.6cqw; padding-left: 21cqw; }
      .val i { position: absolute; left: 0; top: 0; bottom: 0; max-width: 20cqw; border-radius: .6cqw; background: linear-gradient(90deg, color-mix(in srgb, rgb(var(--tint)) 30%, #fff), color-mix(in srgb, rgb(var(--tint)) 8%, #fff)); }
      .val b { position: relative; font-size: 2.8cqw; font-weight: 750; color: var(--ink); font-variant-numeric: tabular-nums; }
      .pr.top { position: relative; z-index: 1; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)); }
      .pr.top .val i { background: var(--grad); }
      .pr.top .val b { padding: .2cqw .9cqw; border-radius: .6cqw; background: #fff; color: rgb(var(--tint)); }
      .pr.ghost { border-bottom: none; }
      .pr.ghost .val { justify-content: flex-start; padding-left: 0; }
      .cp { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw; }
      .cph { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.6cqw; }
      .cp .bubble { max-width: 100%; font-size: 2.5cqw; word-break: keep-all; }
      .done { display: flex; align-items: center; gap: 1cqw; font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .done .ico { color: rgb(var(--tint)); }
    `,
  });
})();
