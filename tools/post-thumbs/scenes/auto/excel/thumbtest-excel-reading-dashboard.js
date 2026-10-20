/* Excel — 학급 독서 기록 대시보드: 월 슬라이서로 분야별 피벗 차트 바꿔 보기 */
(() => {
  scene('excel/thumbtest-excel-reading-dashboard', (K) => {
    const parts = [['문학', 14], ['과학', 9], ['역사', 6], ['예술', 5]];
    const total = parts.reduce((s, [, n]) => s + n, 0);
    const shades = ['rgb(var(--tint))', 'color-mix(in srgb, rgb(var(--tint)) 58%, #fff)', 'color-mix(in srgb, rgb(var(--tint)) 36%, #fff)', 'color-mix(in srgb, rgb(var(--tint)) 18%, #fff)'];
    let acc = 0;
    const stops = parts.map(([, n], i) => { const a = acc; acc += (n / total) * 100; return `${shades[i]} ${a}% ${acc}%`; }).join(', ');
    const legend = parts.map(([name, n], i) => `<div class="lg${i ? '' : ' on'}"><i style="background:${shades[i]}"></i><span>${name}</span><b>${n}권</b></div>`).join('');
    const months = ['3월', '4월', '5월', '6월'].map((m) => `<div class="sl${m === '4월' ? ' on' : ''}">${m}</div>`).join('');
    return K.win({
      x: 23, y: 9.5, w: 73, h: 50, title: '독서 기록 대시보드', sub: ' · 3학년 2반',
      body: `<div class="db">
          <div class="dh"><b>분야별 독서 비율</b>${K.chip('피벗 차트', { icon: 'data_pie' })}</div>
          <div class="dm">
            <div class="pie" style="background: conic-gradient(${stops})"><div class="hole"><b>${total}권</b><span>4월 독서</span></div></div>
            <div class="lgs">${legend}</div>
          </div>
        </div>`,
    }) + K.card({
      x: 5, y: 17, w: 23, cls: 'slicer',
      body: `<div class="sh"><b>월</b><span class="si">${K.ico('multiselect_ltr:r', { s: 2.4 })}${K.ico('filter_dismiss:r', { s: 2.4 })}</span></div>${months}`,
    }) + K.cursor({ x: 21, y: 30.5 })
      + K.pill({ x: 5, y: 3.4, icon: 'filter', text: '클릭 한 번에 월별 보기' });
  }, {
    css: `
      .db { padding: 3cqw 3.2cqw 3cqw 8.6cqw; }
      .dh { display: flex; align-items: center; gap: 1.6cqw; font-size: 2.6cqw; }
      .dm { display: flex; align-items: center; gap: 4.2cqw; margin-top: 2.8cqw; }
      .pie { position: relative; flex: none; width: 27cqw; height: 27cqw; border-radius: 50%; }
      .hole { position: absolute; inset: 6.2cqw; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; background: #fff; }
      .hole b { font-size: 5.6cqw; font-weight: 800; line-height: 1.05; color: var(--ink); }
      .hole span { font-size: 2.1cqw; font-weight: 650; color: var(--ink-3); }
      .lgs { display: flex; flex-direction: column; gap: .8cqw; flex: 1; }
      .lg { display: flex; align-items: center; gap: 1.4cqw; height: 5.2cqw; padding: 0 1.6cqw; border-radius: 1.1cqw; font-size: 2.45cqw; font-weight: 600; color: var(--ink-2); }
      .lg i { flex: none; width: 2cqw; height: 2cqw; border-radius: .5cqw; }
      .lg span { flex: 1; }
      .lg b { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
      .lg.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .lg.on span, .lg.on b { color: rgb(var(--tint)); font-weight: 700; }
      .slicer { z-index: 3; display: flex; flex-direction: column; gap: 1cqw; padding: 2cqw 2cqw 2.2cqw; }
      .sh { display: flex; align-items: center; justify-content: space-between; padding: 0 .4cqw .6cqw; font-size: 2.5cqw; }
      .si { display: flex; gap: .8cqw; color: var(--ink-4); }
      .sl { display: grid; place-items: center; height: 5cqw; border-radius: 1cqw; background: #f2f3f5; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .sl.on { background: var(--grad); color: #fff; font-weight: 700; }
    `,
  });
})();
