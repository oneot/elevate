/* copilot-studio/copilot-studio-multi-agent — parent agent overview: three connected child agents, request routed to one */
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

  scene('copilot-studio/copilot-studio-multi-agent', (K) => {
    const agent = (icon, name, on) => `<div class="ag${on ? ' on' : ''}">
      <span class="ni">${K.ico(icon, { s: 3 })}</span>
      <div class="grow"><b>${name}</b>${K.skel(on ? '78%' : '62%', { h: 1.3 })}</div>
      ${on ? K.chip('위임', { icon: 'arrow_routing', solid: true }) : `<i class="dt"></i>`}
    </div>`;
    return K.win({
      x: 5, y: 9, w: 64, h: 50, title: '정보 수업 도우미', icon: false,
      barRight: K.btn('게시', { primary: true, icon: 'cloud_arrow_up' }),
      body: `<div class="ov">
        <div class="sh">${K.ico('bot', { s: 3 })}<b>에이전트</b>${K.chip('3', { tint: true })}<span class="grow"></span>${K.btn('에이전트 추가', { line: true, icon: 'add' })}</div>
        ${agent('clipboard_task', '수업 설계안')}
        ${agent('code', '파이썬 코딩 테스트')}
        ${agent('document_text', '학습지 제작', true)}
        <div class="ws">${K.ico('globe_off', { s: 2.8 })}<b>웹 검색</b><span class="grow"></span><i class="toggle"></i></div>
      </div>`,
    })
      + K.card({
        x: 71, y: 19, w: 26.5, cls: 'rq',
        body: `${K.bubble('중2 학습지 만들어 줘', { me: true })}
          <p class="to">${K.ico('document_text', { s: 2.6 })}학습지.docx</p>`,
      })
      + '<div class="links"></div>'
      + K.tile({ x: 1.6, y: 3.6, s: 11 })
      + K.float({ x: 81, y: 41, s: 6.4, icon: 'checkmark' })
      + K.pill({ right: 4, y: 4.6, icon: 'organization', text: '요청을 알맞게 위임' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.4cqw; font-size: 3cqw; font-weight: 700; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .ov { display: flex; flex-direction: column; gap: 1.2cqw; padding: 2.2cqw 3cqw; }
      .sh { display: flex; align-items: center; gap: 1.1cqw; color: rgb(var(--tint)); }
      .sh b { font-size: 2.9cqw; font-weight: 750; color: var(--ink); letter-spacing: -0.02em; }
      .sh .chip { font-size: 2.2cqw; font-weight: 700; }
      .sh .btn { font-size: 2.2cqw; padding: .9cqw 1.6cqw; }
      .ag { display: flex; align-items: center; gap: 1.6cqw; padding: 1cqw 1.8cqw 1cqw 1.1cqw; border-radius: 1.6cqw;
        background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
      .ag .ni { flex: none; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.3cqw; background: rgba(var(--tint), .18); color: rgb(var(--tint)); }
      .ag .grow { display: flex; flex-direction: column; gap: .8cqw; }
      .ag b { font-size: 2.65cqw; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; white-space: nowrap; }
      .ag .dt { width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 .5cqw rgba(63, 214, 143, .18); }
      .ag.on { background: rgba(var(--tint), .12); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 3cqw -1cqw rgba(var(--tint), .5); }
      .ag.on .ni { background: var(--grad); color: #fff; }
      .ag .chip { font-size: 2.2cqw; font-weight: 700; }
      .ws { display: flex; align-items: center; gap: 1.1cqw; margin-top: .2cqw; padding: 0 1.8cqw 0 1.6cqw; color: var(--ink-3); }
      .ws b { font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); }
      .rq { z-index: 4; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.2cqw 2cqw; }
      .rq .bubble { align-self: flex-end; max-width: 100%; padding: 1.2cqw 1.6cqw; font-size: 2.3cqw; white-space: nowrap; }
      .to { display: flex; align-items: center; gap: .8cqw; align-self: flex-start; padding: .9cqw 1.4cqw; border-radius: 1.1cqw;
        background: rgba(255, 255, 255, .1); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .16);
        font-size: 2.3cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
      .to .ico { color: #7fb4ff; }
    `,
    after(stage, K) {
      const g = geo(stage);
      const a = g('.rq .bubble');
      const t = g('.ag.on .chip');
      const c = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      stage.querySelector('.links').outerHTML = K.wires(K.curve(a.l - 0.6, a.cy, t.r + 0.9, t.cy, { c, dot: true, dash: true }), { z: 5 });
    },
  });
})();
