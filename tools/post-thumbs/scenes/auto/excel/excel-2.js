/* Excel — 급식 지도 당번 배정하기 (v3) */
(() => {
  /* ---------- 날짜 줄 바로 아래 '배정 교사' 줄을 Copilot 에이전트 모드가 채움 ---------- */
  scene('excel/excel-2', (K) => {
    const days = [['월', 2], ['화', 3], ['수', 4], ['목', 5], ['금', 6]];
    const who = ['김', '박', '이', '최', '정'];
    const blank = '<div class="h"></div>';
    const dateRow = () => `${blank}${days.map(() => `<div class="dd">${K.skel('36%')}</div>`).join('')}`;
    const nextRow = (ws) => `${blank}${ws.map((w) => `<div class="nx">${K.skel(`${w}%`, { tint: true })}</div>`).join('')}`;
    let cells = `${blank}${days.map(([d, n]) => `<div class="dd">${d} ${n}</div>`).join('')}`;
    cells += `${blank}${who.map((n) => `<div class="as">${n} 교사</div>`).join('')}`;
    cells += dateRow() + nextRow([62, 54, 66, 58, 60]) + dateRow();
    return K.win({
      x: 4.5, y: 11, w: 60, h: 46, title: '급식지도 당번 표', icon: false,
      body: `<div class="xl" style="--cols: 2.6cqw repeat(5, 1fr); --rh: 6cqw">${cells}<span class="rng"></span></div>
        <div class="tabs"><span>교사정보</span><span class="on">3월 급식당번</span></div>`,
    })
      + K.card({
        x: 62.5, y: 21, w: 31, cls: 'ag',
        body: `<div class="agh">${K.app('copilot', { s: 3.6 })}<b>에이전트 모드</b><i class="toggle on"></i></div>
          <div class="pr">${K.skel('92%')}${K.skel('70%')}</div>
          <div class="ok">${K.ico('checkmark_circle', { s: 3 })}<b>불가능요일 제외</b></div>`,
      })
      + K.tile({ x: 1.6, y: 5.4, s: 10.5 })
      + K.float({ right: 12, bottom: 2.4, icon: 'calendar_person', far: true })
      + K.pill({ right: 4, y: 5, icon: 'calendar_checkmark', text: '당번표 한 번에 채우기', tint: true });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .xl { position: relative; margin: 2.4cqw 2.6cqw 0; border-radius: 1cqw; overflow: hidden; box-shadow: 0 0 0 .15cqw rgba(20, 22, 30, .08); }
      .xl > .dd { justify-content: center; background: #f5f6f8; font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); }
      .xl > .dd .skel { height: 1.2cqw; }
      .xl > .as { justify-content: center; padding: 0; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); font-size: 2.6cqw; font-weight: 750; color: var(--ink); }
      .xl > .nx { justify-content: center; background: color-mix(in srgb, rgb(var(--tint)) 5%, #fff); }
      .xl > .nx .skel { height: 1.6cqw; }
      .rng { position: absolute; left: 2.6cqw; right: 0; top: 6cqw; height: 6cqw; padding: 0; border: none; box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)); }
      .tabs { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: .8cqw; height: 6cqw; padding: 0 2.6cqw; background: rgba(246, 247, 249, .9); border-top: .2cqw solid var(--line); font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); }
      .tabs span { padding: .8cqw 1.7cqw; border-radius: .8cqw; white-space: nowrap; }
      .tabs .on { background: #fff; color: rgb(var(--tint)); font-weight: 700; box-shadow: 0 0 0 .2cqw var(--line-2), inset 0 -.45cqw 0 rgb(var(--tint)); }
      .ag { z-index: 3; display: flex; flex-direction: column; gap: 2cqw; padding: 2.6cqw; }
      .agh { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.5cqw; white-space: nowrap; }
      .agh b { flex: 1; font-weight: 750; }
      .pr { display: flex; flex-direction: column; gap: 1.1cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.2cqw; background: #f5f6f8; }
      .ok { display: flex; align-items: center; gap: 1cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-size: 2.5cqw; white-space: nowrap; }
      .ok b { font-weight: 750; color: var(--ink); }
    `,
  });
})();
