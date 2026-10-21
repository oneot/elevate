/* 데이터 입력하고 서식 바꾸기: [홈] 맞춤 그룹의 '병합하고 가운데 맞춤'으로 제목 행 정리 — see STYLE_GUIDE.md */
(() => {
  scene('excel/excelonline2', (K) => {
    const ib = (name, on) => `<span class="ib${on ? ' on' : ''}">${K.ico(`${name}:r`, { s: 2.8 })}</span>`;
    const cells = `
      <div class="h top"></div><div class="h top on">A</div><div class="h top on">B</div><div class="h top on">C</div><div class="h top"></div>
      <div class="h on r1"></div><div class="mg">2학년 현장체험학습 물품<i class="fh"></i></div><div></div>
      <div class="h"></div><div class="th">품목</div><div class="th c">수량</div><div class="th r">금액</div><div></div>
      <div class="h"></div><div>돗자리</div><div class="c">30</div><div class="r num">150,000</div><div></div>
      <div class="h"></div><div>${K.skel('70%', { h: 1.6 })}</div><div class="c">${K.skel('40%', { h: 1.6 })}</div><div class="r">${K.skel('60%', { h: 1.6 })}</div><div></div>
      <div class="h"></div><div></div><div></div><div></div><div></div>`;
    return K.win({
      x: 4, y: 10, w: 68, h: 50, title: '학급 물품 구입', icon: false,
      body: `<div class="rib">
          <div class="tabs"><span class="on">홈</span>${K.skel('5cqw', { h: 1.4 })}${K.skel('6cqw', { h: 1.4 })}${K.skel('4.5cqw', { h: 1.4 })}</div>
          <div class="cmds">
            ${ib('align_top')}${ib('align_center_vertical', true)}${ib('align_bottom')}<i class="vr"></i>
            ${ib('text_align_left')}${ib('text_align_center', true)}${ib('text_align_right')}<i class="vr"></i>
            <span class="mb">${K.ico('table_cells_merge', { s: 2.8 })}병합하고 가운데 맞춤${K.ico('chevron_down', { s: 2 })}</span>
          </div>
        </div>
        <div class="xl" style="--cols: 3.2cqw 19cqw 10cqw 15cqw 1fr; --rh: 5cqw">${cells}</div>`,
    })
      + K.cursor({ x: 64.8, y: 27.4 })
      + K.tile({ x: 1, y: 4.2, s: 11 })
      + K.float({ right: 8, y: 27, icon: 'text_align_center' })
      + K.pill({ right: 4, y: 3.6, icon: 'table_cells_merge', text: '제목 칸 깔끔하게 병합', dark: true });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .rib { background: rgba(247, 248, 250, .9); border-bottom: .2cqw solid var(--line); }
      .rib .tabs { display: flex; align-items: center; gap: 3cqw; padding: 1.2cqw 3cqw 0; }
      .rib .tabs .on { padding-bottom: .9cqw; font-size: 2.4cqw; font-weight: 750; color: rgb(var(--tint)); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
      .rib .tabs .skel { margin-bottom: .9cqw; }
      .cmds { display: flex; align-items: center; gap: .3cqw; padding: 1.1cqw 2.2cqw; border-top: .2cqw solid var(--line); }
      .ib { display: grid; place-items: center; width: 4.3cqw; height: 4.3cqw; border-radius: .9cqw; color: var(--ink-3); }
      .ib.on { background: color-mix(in srgb, rgb(var(--tint)) 13%, #fff); color: rgb(var(--tint)); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .vr { width: .2cqw; height: 3.2cqw; margin: 0 .9cqw; background: var(--line-2); }
      .mb { display: flex; align-items: center; gap: .8cqw; height: 4.6cqw; padding: 0 1.2cqw 0 1.4cqw; border-radius: 1cqw; background: var(--grad); color: #fff; font-size: 2.5cqw; font-weight: 750; white-space: nowrap; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(var(--tint), .7); }
      .xl { background: rgba(255, 255, 255, .9); }
      .xl > .h.top { height: 3.4cqw; font-size: 1.9cqw; }
      .xl > .h.on { background: color-mix(in srgb, rgb(var(--tint)) 16%, #fff); color: rgb(var(--tint)); }
      .xl > :not(.h) { font-size: 2.6cqw; color: var(--ink); }
      .xl > .mg { grid-column: span 3; position: relative; z-index: 2; height: 7.2cqw; justify-content: center; overflow: visible;
        background: linear-gradient(90deg, color-mix(in srgb, rgb(var(--tint)) 14%, #fff), color-mix(in srgb, var(--f1) 30%, #fff));
        box-shadow: inset 0 0 0 .38cqw rgb(var(--tint)); font-size: 3cqw; font-weight: 800; color: color-mix(in srgb, rgb(var(--tint)) 70%, #000); }
      .xl > .h.r1 { height: 7.2cqw; }
      .xl > .mg + div { height: 7.2cqw; }
      .fh { position: absolute; right: -.7cqw; bottom: -.7cqw; width: 1.4cqw; height: 1.4cqw; background: rgb(var(--tint)); box-shadow: 0 0 0 .25cqw #fff; }
      .xl > .th { font-size: 2.6cqw; }
      .xl > .c { justify-content: center; }
      .xl > .r { justify-content: flex-end; }
      .xl > .num { font-weight: 650; font-variant-numeric: tabular-nums; }
      .xl .skel { flex: none; }
    `,
  });
})();
