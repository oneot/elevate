/* copilot-studio/copilot-studio-workshop-chemicalfactory — 반응기 과열 topic canvas: risk branches + generative answer on selected sources */
(() => {
  const geo = (stage) => {
    const b = stage.getBoundingClientRect();
    const k = 100 / b.width;
    return (sel) => {
      const r = stage.querySelector(sel).getBoundingClientRect();
      const l = (r.left - b.left) * k, t = (r.top - b.top) * k, w = r.width * k, h = r.height * k;
      return { l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 };
    };
  };

  scene('copilot-studio/copilot-studio-workshop-chemicalfactory', (K) => {
    const br = (name, cls, c) => `<div class="br ${cls}"><i class="dt" style="--c:${c}"></i>${name}</div>`;
    const doc = (name) => `<div class="dc">${K.ico('document_pdf', { s: 2.6 })}<span>${name}</span></div>`;
    return K.win({
      x: 4, y: 8.4, w: 67, h: 50, title: '반응기 과열', icon: false,
      barRight: K.btn('저장', { primary: true, icon: 'save' }),
      body: `<div class="cv">
        <div class="ac">${K.ico('form', { s: 3 })}<b>적응형 카드</b><span>온도 차이 · 상승 여부</span></div>
        <div class="bs">${br('정상', 'b0', 'var(--green)')}${br('위험', 'b1', 'var(--amber)')}${br('긴급', 'b2 on', 'var(--red)')}</div>
        <div class="ga">
          <p class="gh">${K.ico('sparkle', { s: 3 })}생성형 답변</p>
          <div class="sw"><span>선택한 원본만 검색</span><i class="toggle on"></i></div>
          <div class="ds">${doc('반응기 SOP')}${doc('비상 매뉴얼')}</div>
        </div>
      </div>`,
    })
      + '<div class="links"></div>'
      + K.tile({ x: 1.4, y: 3.2, s: 10.5 })
      + K.float({ right: 7, y: 6, s: 7.4, icon: 'temperature' })
      + K.float({ x: 75, y: 24, s: 5.4, icon: 'warning', far: true })
      + K.pill({ right: 2.6, bottom: 5, icon: 'alert_urgent', text: '위험도별로 대응 안내' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.4cqw; font-size: 3cqw; font-weight: 700; }
      .win__bar .btn { padding: .9cqw 1.9cqw; font-size: 2.3cqw; }
      .cv { position: relative; height: 100%; padding: 2.4cqw 3.2cqw; display: flex; flex-direction: column; align-items: center;
        background: radial-gradient(circle, rgba(255, 255, 255, .13) .16cqw, transparent .2cqw) 0 0 / 2.4cqw 2.4cqw; }
      .ac { z-index: 3; display: flex; align-items: center; gap: 1.1cqw; padding: 1.3cqw 2.2cqw 1.3cqw 1.6cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .1); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .18); color: rgb(var(--tint)); white-space: nowrap; }
      .ac b { font-size: 2.6cqw; font-weight: 700; color: var(--ink); }
      .ac span { font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); }
      .bs { z-index: 3; display: flex; justify-content: space-between; width: 100%; margin-top: 4.2cqw; padding: 0 1cqw; }
      .br { display: flex; align-items: center; gap: 1cqw; width: 15.4cqw; justify-content: center; padding: 1.2cqw 0; border-radius: 99px;
        background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16); font-size: 2.7cqw; font-weight: 700; color: var(--ink-2); }
      .dt { width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: var(--c); box-shadow: 0 0 1.2cqw var(--c); }
      .br.on { background: rgba(255, 92, 88, .2); box-shadow: inset 0 0 0 .3cqw #ff6b66, 0 0 3cqw -.6cqw rgba(255, 92, 88, .6); color: #fff; }
      .ga { z-index: 3; align-self: flex-end; width: 38.6cqw; margin: 2.4cqw 1.2cqw 0 0; padding: 2cqw 2.4cqw 2.4cqw; border-radius: 1.8cqw;
        background: rgba(var(--tint), .1); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3.4cqw -1cqw rgba(var(--tint), .55); }
      .gh { display: flex; align-items: center; gap: 1cqw; font-size: 2.8cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .gh .ico { color: rgb(var(--tint)); }
      .sw { display: flex; align-items: center; justify-content: space-between; margin-top: 1.4cqw; padding: 1cqw 1.6cqw; border-radius: 1.2cqw;
        background: rgba(255, 255, 255, .08); }
      .sw span { font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .ds { display: flex; gap: 1.1cqw; margin-top: 1.4cqw; }
      .dc { display: flex; align-items: center; gap: .7cqw; padding: 1cqw 1.3cqw; border-radius: 1.1cqw; background: rgba(255, 255, 255, .08);
        box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); font-size: 2.1cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .dc .ico { color: #ff7d74; }
    `,
    after(stage, K) {
      const g = geo(stage);
      const a = g('.ac');
      const line = 'rgba(255, 255, 255, .42)';
      const red = '#ff6b66';
      let svg = '';
      ['.b0', '.b1', '.b2'].forEach((s) => {
        const b = g(s);
        svg += K.curve(a.cx, a.b + 0.2, b.cx, b.t - 0.7, { c: s === '.b2' ? red : line, bend: 'v', dot: s === '.b0' });
      });
      const b2 = g('.b2');
      const ga = g('.ga');
      svg += K.curve(b2.cx, b2.b + 0.2, b2.cx, ga.t - 0.7, { c: red, bend: 'none' });
      stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
    },
  });
})();
