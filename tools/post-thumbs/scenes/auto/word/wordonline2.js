/* word/wordonline2 — 화면 구성 알아보기: 메뉴 바·리본이 보이는 Word 창에서 [리본 메뉴] → 클래식 리본으로 추천 초기 세팅 */
(() => {
  scene('word/wordonline2', (K) => {
    const tabs = ['파일', '홈', '삽입', '레이아웃', '추천', '검토', '보기'];
    const ib = (n) => `<span class="ib">${K.ico(n, { s: 2.7 })}</span>`;
    const opt = (label, rows, on) => `<div class="op${on ? ' on' : ''}">
        <span class="pv">${rows.map((w) => `<i style="width:${w}"></i>`).join('')}</span>
        <b>${label}</b><span class="grow"></span>
        ${on ? `<span class="ck">${K.ico('checkmark', { s: 2.4 })}</span>` : ''}
      </div>`;
    return K.win({
      x: 4, y: 9.5, w: 66, h: 50, icon: false,
      title: `3반 가정통신문${K.ico('cloud_checkmark:r', { s: 2.8, c: 'var(--ink-4)', style: 'margin-left:1cqw' })}`,
      barRight: `<span class="rbtn">리본 메뉴${K.ico('chevron_down', { s: 2 })}</span>`,
      body: `<div class="ed">
        <div class="mb">${tabs.map((t) => `<span${t === '홈' ? ' class="on"' : ''}>${t}</span>`).join('')}</div>
        <div class="rb">
          <div class="g">${K.ico('clipboard_paste:r', { s: 4.6, c: 'var(--ink-3)' })}</div>
          <i class="vs"></i>
          <div class="g col2">
            <div class="r"><span class="dd">${K.skel('6cqw', { h: 1.2 })}</span><span class="dd sm">${K.skel('2cqw', { h: 1.2 })}</span></div>
            <div class="r">${ib('text_bold')}${ib('text_italic')}${ib('text_underline')}${ib('text_color')}</div>
          </div>
          <i class="vs"></i>
          <div class="g col2">
            <div class="r">${ib('text_bullet_list_ltr:r')}${ib('text_number_list_ltr:r')}${ib('text_indent_increase_ltr:r')}</div>
            <div class="r">${ib('text_align_left:r')}${ib('text_align_center:r')}${ib('text_align_right:r')}</div>
          </div>
          <i class="vs"></i>
          <div class="g row"><span class="sb"></span><span class="sb on"></span></div>
        </div>
        <div class="cv"><div class="page pg">${K.skel('46%', { h: 2.4, tint: true })}${K.skel('92%')}${K.skel('84%')}${K.skel('90%')}${K.skel('66%')}</div></div>
      </div>`,
    })
      + K.card({
        x: 55, y: 15.5, w: 37, cls: 'pop',
        body: `<p class="ph">리본 레이아웃</p>
          ${opt('클래식 리본', ['92%', '92%'], true)}
          ${opt('한 줄 리본', ['92%'], false)}`,
      })
      + K.tile({ x: 0.8, y: 3.6, s: 11 })
      + K.float({ right: 5, y: 3.6, icon: 'cloud_checkmark', far: true })
      + K.pill({ right: 4, bottom: 4.4, icon: 'checkmark_circle', text: '클래식 리본으로 시작' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .rbtn { display: inline-flex; align-items: center; gap: .7cqw; height: 4.6cqw; padding: 0 1.4cqw 0 1.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: rgb(var(--tint)); font-size: 2.5cqw; font-weight: 750; white-space: nowrap; }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .mb { flex: none; display: flex; align-items: center; gap: 2.1cqw; height: 5.6cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .mb > span { position: relative; display: flex; align-items: center; height: 100%; }
      .mb > .on { color: rgb(var(--tint)); font-weight: 750; }
      .mb > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .rb { flex: none; display: flex; align-items: center; gap: 1.6cqw; height: 11cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; background: rgba(255, 255, 255, .55); }
      .g { display: flex; align-items: center; }
      .col2 { flex-direction: column; align-items: flex-start; gap: .9cqw; }
      .g .r { display: flex; align-items: center; gap: .5cqw; }
      .row { gap: 1cqw; }
      .vs { flex: none; width: .2cqw; height: 7.6cqw; background: var(--line); }
      .dd { display: inline-flex; align-items: center; height: 3.4cqw; padding: 0 1.2cqw; border-radius: .8cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .ib { display: grid; place-items: center; width: 3.5cqw; height: 3.5cqw; border-radius: .8cqw; color: var(--ink-2); }
      .sb { width: 6.2cqw; height: 7.4cqw; border-radius: 1cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); background: #fff; }
      .sb.on { box-shadow: inset 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); }
      .cv { flex: 1; padding: 2.6cqw 0 0 12cqw; background: rgba(243, 243, 246, .7); }
      .pg { width: 38cqw; height: 100%; display: flex; flex-direction: column; gap: 1.6cqw; padding: 4cqw 4.4cqw 0; border-radius: 1cqw 1cqw 0 0; }
      .pg .skel:first-child { margin-bottom: .8cqw; }
      .pop { z-index: 3; display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.6cqw 2.6cqw 2.8cqw; }
      .ph { padding-left: .6cqw; font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .op { display: flex; align-items: center; gap: 1.8cqw; padding: 1.5cqw 1.6cqw; border-radius: 1.4cqw; white-space: nowrap; }
      .op b { font-size: 2.6cqw; font-weight: 650; color: var(--ink-2); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .op.on b { font-size: 3cqw; font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
      .pv { flex: none; display: flex; flex-direction: column; justify-content: center; gap: .6cqw; width: 8cqw; height: 6cqw; padding: .8cqw; border-radius: .8cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .pv i { display: block; height: 1.4cqw; border-radius: .4cqw; background: color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
      .op.on .pv i { background: var(--grad); }
      .ck { display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 50%; background: var(--grad); color: #fff; }
    `,
  });
})();
