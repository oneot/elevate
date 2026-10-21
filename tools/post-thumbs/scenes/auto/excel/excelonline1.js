/* 웹 버전 시작하기: 이름 입력 칸에서 통합 문서 이름을 바꾸고 리본 레이아웃을 고르는 화면 — see STYLE_GUIDE.md */
(() => {
  scene('excel/excelonline1', (K) => {
    const tabs = ['홈', '삽입', '수식', '데이터', '보기'].map((t, i) => `<span class="${i ? '' : 'on'}">${t}</span>`).join('');
    const cmds = ['clipboard_paste', 'text_bold', 'text_italic', 'text_underline', 'paint_bucket', 'text_align_center', 'border_all', 'arrow_sort', 'filter']
      .map((n) => `<span class="cb">${K.ico(`${n}:r`, { s: 2.6 })}</span>`).join('');
    let grid = '<div class="h"></div>' + '<div class="h"></div>'.repeat(4);
    [62, 48, 70, 54, 66, 44].forEach((w, i) => {
      grid += `<div class="h"></div><div>${K.skel(`${w}%`, { h: 1.4 })}</div><div>${K.skel(`${w - 18}%`, { h: 1.4 })}</div><div>${i % 2 ? '' : K.skel('40%', { h: 1.4 })}</div><div></div>`;
    });
    const opt = (icon, label, on, dot = on) => `<div class="op${on ? ' on' : ''}"><span class="radio${dot ? ' on' : ''}"></span>${K.ico(`${icon}:r`, { s: 2.8 })}<b>${label}</b></div>`;
    return K.win({
      x: 4, y: 9.5, w: 66, h: 51, icon: false,
      title: `<span class="nm">1학년 3반 출결<i class="caret"></i></span>`,
      body: `<div class="rib">
          <div class="tabs">${tabs}</div>
          <div class="cmds">${cmds}</div>
        </div>
        <div class="xl" style="--cols: 3.4cqw 15cqw 15cqw 15cqw 1fr; --rh: 4.6cqw">${grid}</div>`,
    })
      + K.card({
        x: 57, y: 17.5, w: 38, cls: 'menu',
        body: `<p class="mh">리본 레이아웃</p>
          ${opt('panel_top_gallery', '클래식 리본')}
          ${opt('app_title', '한 줄 리본', true)}
          <div class="sep"></div>
          <p class="mh">리본 표시</p>
          ${opt('layout_row_two', '항상 리본 표시')}
          ${opt('tab_desktop', '탭만 표시')}
          ${opt('layout_dynamic', '자동으로 조정', false, true)}`,
      })
      + K.tile({ x: 1.6, y: 3.6, s: 11 })
      + K.float({ x: 41, y: 2.4, s: 6, icon: 'cloud_checkmark' })
      + K.pill({ x: 4, bottom: 3.6, icon: 'layout_row_two_settings', text: '넓게 쓰는 한 줄 리본', dark: true });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12.6cqw; }
      .nm { display: inline-flex; align-items: center; height: 4.8cqw; padding: 0 1.6cqw; border-radius: 1cqw; background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); font-size: 2.8cqw; font-weight: 750; color: var(--ink); }
      .caret { width: .25cqw; height: 3cqw; margin-left: .4cqw; background: rgb(var(--tint)); }
      .rib { border-bottom: .2cqw solid var(--line); background: rgba(255, 255, 255, .7); }
      .tabs { display: flex; align-items: center; gap: 3.4cqw; padding: 1.2cqw 2.4cqw 0 3cqw; font-size: 2.5cqw; font-weight: 600; color: var(--ink-3); }
      .tabs > span { padding-bottom: 1cqw; }
      .tabs .on { color: rgb(var(--tint)); font-weight: 750; box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
      .cmds { display: flex; gap: .8cqw; padding: .9cqw 2.4cqw; background: rgba(247, 248, 250, .9); border-top: .2cqw solid var(--line); }
      .cb { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: .9cqw; color: var(--ink-3); }
      .cb:first-child { color: rgb(var(--tint)); }
      .xl > .h { height: 3cqw; }
      .xl > div:nth-child(5n+1) { height: var(--rh); }
      .xl > div:nth-child(-n+5) { height: 3cqw; }
      .xl > :not(.h) .skel { flex: none; }
      .menu { z-index: 3; padding: 2.2cqw 1.8cqw; }
      .mh { padding: 0 1.2cqw .8cqw; font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .menu .sep { margin: 1cqw 1.2cqw 1.6cqw; }
      .op { display: flex; align-items: center; gap: 1.3cqw; height: 5cqw; padding: 0 1.3cqw; border-radius: 1.1cqw; color: var(--ink-3); white-space: nowrap; }
      .op b { font-size: 2.6cqw; font-weight: 650; color: var(--ink-2); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: rgb(var(--tint)); }
      .op.on b { color: rgb(var(--tint)); font-weight: 750; }
    `,
  });
})();
