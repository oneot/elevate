/* github scenes — see STYLE_GUIDE.md */
(() => {

// Stage-space geometry (cqw) of an element, for connector lines drawn in `after`.
const geo = (stage) => {
  const b = stage.getBoundingClientRect();
  const k = 100 / b.width;
  return (sel) => {
    const el = typeof sel === 'string' ? stage.querySelector(sel) : sel;
    const r = el.getBoundingClientRect();
    const l = (r.left - b.left) * k, t = (r.top - b.top) * k, w = r.width * k, h = r.height * k;
    return { l, t, r: l + w, b: t + h, cx: l + w / 2, cy: t + h / 2 };
  };
};
const tintOf = (stage) => `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;

/* 1. GitHub Pages — Settings › Pages with the live github.io address */
scene('github/github-pages', (K) => {
  const chev = K.ico('chevron_down:r', { s: 2.3 });
  const item = (inner, on) => `<div class="it${on ? ' on' : ''}">${inner}</div>`;
  return K.win({
    x: 6, y: 8.5, w: 88, h: 50, z: 2, title: 'oneot / ai',
    body: `<div class="tabs"><span>${K.ico('code', { s: 2.6 })}Code</span><span class="on">${K.ico('settings', { s: 2.6 })}Settings</span></div>
      <div class="cols">
        <div class="side">${item(K.skel('72%'))}${item(K.skel('54%'))}${item('Pages', true)}${item(K.skel('64%'))}${item(K.skel('48%'))}</div>
        <div class="main">
          <p class="h">GitHub Pages</p>
          <div class="live hl">${K.ico('checkmark_circle', { s: 3.6, c: 'var(--green)' })}<div class="grow"><small>Your site is live at</small><b>oneot.github.io/ai/</b></div>${K.btn('Visit site', { line: true, icon: 'open:r' })}</div>
          <div class="sel">Deploy from a branch ${chev}</div>
          <div class="row" style="gap:1.2cqw"><span class="sel">${K.ico('branch', { s: 2.4, c: 'var(--ink-3)' })}main ${chev}</span><span class="sel">/ (root) ${chev}</span>${K.btn('Save')}</div>
        </div>
      </div>`,
  })
    + K.mascot('ducky-side', { right: 19.6, bottom: 0.6, w: 11, flip: true })
    + K.mascot('mona-front', { right: 1, bottom: -2.2, w: 21 })
    + K.pill({ right: 3.5, y: 4.6, icon: 'globe', text: '내 주소로 웹앱 공개' });
}, {
  css: `
    .tabs { display: flex; gap: 3.4cqw; height: 5.4cqw; padding: 0 3cqw; border-bottom: .2cqw solid var(--line); }
    .tabs span { display: flex; align-items: center; gap: .9cqw; font-size: 2.35cqw; font-weight: 600; color: var(--ink-3); }
    .tabs .on { color: var(--ink); box-shadow: inset 0 -.45cqw 0 rgb(var(--tint)); }
    .cols { display: flex; height: calc(100% - 5.4cqw); }
    .side { flex: none; width: 19cqw; display: flex; flex-direction: column; gap: .6cqw; padding: 2.4cqw 1.8cqw; border-right: .2cqw solid var(--line); }
    .it { display: flex; align-items: center; height: 4.2cqw; padding: 0 1.3cqw; border-radius: .9cqw; }
    .it.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset .45cqw 0 0 rgb(var(--tint)); font-size: 2.35cqw; font-weight: 700; }
    .main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1.8cqw; padding: 2.6cqw 3.2cqw; }
    .h { font-size: 3cqw; font-weight: 700; letter-spacing: -0.02em; }
    .live { align-self: stretch; display: flex; align-items: center; gap: 1.6cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.4cqw; background: #fff; }
    .live small { display: block; font-size: 2cqw; font-weight: 600; color: var(--ink-3); }
    .live b { display: block; margin-top: .2cqw; font-size: 2.65cqw; font-weight: 700; letter-spacing: -0.01em; color: rgb(var(--tint)); }
    .sel { display: inline-flex; align-items: center; gap: .9cqw; padding: 1.1cqw 1.5cqw; border-radius: 1cqw; background: var(--fill); box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.3cqw; font-weight: 600; white-space: nowrap; }
    .sel .ico:last-child { color: var(--ink-4); }
  `,
});

/* 2. Agent → website — Copilot Studio "Web app" embed code, live on a github.io site */
scene('github/agent-to-website', (K) => {
  return K.card({
    x: 4, y: 21, w: 34, cls: 'emb',
    body: `<div class="eh">${K.app('copilot-studio', { s: 3.2 })}<b>Web app</b><span class="grow"></span>${K.btn('복사', { icon: 'copy:r', line: true })}</div>
      <div class="cd"><span class="tg">&lt;iframe</span><i style="width:86%"></i><i style="width:62%;--c:#bfe3c8"></i><span class="tg">&gt;&lt;/iframe&gt;</span></div>`,
  })
    + K.win({
      x: 34, y: 12, w: 62, h: 50, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}oneot.github.io/spellchecker</span>`,
      body: `<div class="site">
        <div class="brand"><span class="logo">${K.ico('book', { s: 2.6 })}</span><b>바른말 탐험대</b><small>초등 맞춤법 학습</small></div>
        <div class="chat">
          <div class="ch">${K.app('copilot-studio', { s: 2.8 })}<b>맞춤법 탐정단</b></div>
          ${K.bubble('틀린 말을 찾아보세요!<br><span class="qs">어제 재미있게 <u>놀았읍니다</u>.</span>')}
          ${K.bubble('놀았습니다!', { me: true })}
        </div>
      </div>`,
    })
    + K.mascot('copilot-down', { right: 4, y: 0.6, w: 14.5, z: 4 })
    + K.pill({ x: 4, y: 5.2, icon: 'globe', text: '웹에서 바로 대화' });
}, {
  deco: { v: 0 }, // keep the glass objects away from the Copilot mascot (top right)
  css: `
    .emb { z-index: 3; padding: 2.2cqw 2.2cqw 2.4cqw; }
    .eh { display: flex; align-items: center; gap: 1.1cqw; }
    .eh b { font-size: 2.5cqw; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; }
    .eh .btn { padding: .8cqw 1.4cqw; font-size: 2.1cqw; }
    .cd { display: flex; flex-direction: column; gap: 1.1cqw; margin-top: 1.8cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.2cqw; background: var(--fill); font-family: var(--mono); font-size: 2cqw; font-weight: 600; }
    .cd .tg { color: rgb(var(--tint)); white-space: nowrap; }
    .cd i { display: block; height: 1.3cqw; margin-left: 2.4cqw; border-radius: 99px; background: var(--c, #c9d9f2); }
    .win__bar .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 1.8cqw .7cqw 1.4cqw; border-radius: 99px; background: var(--fill); font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); }
    .win__bar .url .ico { color: var(--ink-3); }
    .site { height: 100%; display: flex; flex-direction: column; gap: 2cqw; padding: 2.4cqw 3cqw 0 6cqw; background: linear-gradient(180deg, #f6f5fe, #fff 60%); }
    .brand { display: flex; align-items: center; gap: 1.2cqw; }
    .logo { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 1.2cqw; background: rgb(var(--tint)); color: #fff; }
    .brand b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.03em; }
    .brand small { font-size: 2cqw; font-weight: 600; color: var(--ink-4); }
    .chat { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2cqw 2.4cqw 2.6cqw; border-radius: 2cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2), 0 2cqw 4cqw -2.4cqw rgba(var(--tint), .45); }
    .ch { display: flex; align-items: center; gap: 1cqw; padding-bottom: 1.4cqw; border-bottom: .2cqw solid var(--line); font-size: 2.35cqw; }
    .ch b { font-weight: 700; }
    .chat .bubble { max-width: 90%; }
    .qs { display: block; margin-top: .4cqw; font-weight: 650; color: var(--ink); }
    .qs u { text-decoration: underline wavy var(--red); text-decoration-thickness: .22cqw; text-underline-offset: .5cqw; }
  `,
});

/* 3. Vibe coding with GitHub Copilot — ask for a modern design, get the diff */
scene('github/github-copilot', (K) => {
  const L = (n, html, kind = '') => `<div class="l ${kind}"><span class="ln">${n}</span><span class="mk">${kind === 'add' ? '+' : kind === 'del' ? '-' : ' '}</span>${html}</div>`;
  const code = [
    L(8, '<span class="t">&lt;style&gt;</span>'),
    L(9, '  <span class="f">.chat</span> {'),
    L(10, '    <span class="n">border-radius</span>: <span class="a">4px</span>;', 'del'),
    L(11, '    <span class="n">border-radius</span>: <span class="a">24px</span>;', 'add'),
    L(12, '    <span class="n">backdrop-filter</span>: <span class="a">blur(16px)</span>;', 'add'),
    L(13, '  }'),
    L(14, '<span class="t">&lt;/style&gt;</span>'),
    L(15, '<i class="sk" style="width:26cqw"></i>'),
    L(16, '  <i class="sk" style="width:17cqw"></i>'),
  ].join('');
  return K.mascot('copilot-front', { x: 70, y: 2.2, w: 14, z: 2 })
    + K.win({
    x: 4, y: 8, w: 62, h: 51, dark: true, icon: 'ico:code', title: 'ai', sub: ' / index.html',
    body: `<div class="code ed">${code}</div>`,
  })
    + K.card({
      x: 58, y: 12, w: 38, cls: 'cp',
      body: `<div class="ch">${K.ico('bot_sparkle', { s: 3.2 })}<b>Copilot</b></div>
        <div class="in">
          ${K.bubble('모던하고 세련된 디자인으로 수정해 줘', { me: true })}
          <div class="blk"><span>index.html</span><span class="grow"></span>${K.btn('Copy code', { icon: 'copy:r', line: true })}</div>
        </div>`,
    })
    + K.mascot('ducky-side', { x: 1.5, bottom: -1.2, w: 13 })
    + K.pill({ right: 4, bottom: 4.6, icon: 'sparkle', text: '말로 고치는 내 웹앱' });
}, {
  deco: { v: 0, small: false },
  css: `
    .ed { padding: 2.6cqw 0; font-size: 2.2cqw; }
    .l { padding: 0 2cqw 0 1.6cqw; }
    .l .ln { width: 3.4cqw; }
    .mk { display: inline-block; width: 2.4cqw; color: #8b949e; }
    .l.del { background: rgba(248, 81, 73, .16); }
    .l.del .mk { color: #ff7b72; }
    .l.add { background: rgba(46, 160, 67, .2); }
    .l.add .mk { color: #7ee787; }
    .sk { display: inline-block; height: 1.2cqw; vertical-align: middle; border-radius: 99px; background: rgba(255, 255, 255, .12); }
    .cp { z-index: 3; }
    .ch { display: flex; align-items: center; gap: 1cqw; padding: 1.8cqw 2.4cqw; border-bottom: .2cqw solid var(--line); color: rgb(var(--tint)); }
    .ch b { font-size: 2.5cqw; font-weight: 700; color: var(--ink); }
    .in { display: flex; flex-direction: column; gap: 2cqw; padding: 2.4cqw 2.4cqw 2.4cqw; }
    .cp .bubble { word-break: keep-all; }
    .blk { display: flex; align-items: center; gap: 1cqw; padding: 1cqw 1cqw 1cqw 1.6cqw; border-radius: 1.2cqw; background: var(--fill); font-family: var(--mono); font-size: 1.95cqw; font-weight: 600; color: var(--ink-3); }
    .blk .btn { font-family: var(--font); font-size: 2.1cqw; padding: .8cqw 1.4cqw; }
  `,
});

/* 4. Multi-model agent — the parent routes each question to the right model */
scene('github/copilot-studio-multi-model-ai-agent-github-pages', (K) => {
  const m = (icon, name, role, i, on) => `<div class="m m${i}${on ? ' on' : ''}">${K.ico(icon, { s: 2.7 })}<div><b>${name}</b><small>${role}</small></div></div>`;
  return K.mascot('mona-34', { x: 6.5, y: 9.4, w: 12 })
    + K.card({
    x: 4, y: 19.5, w: 26, cls: 'q',
    body: `<div class="in"><p class="qh">${K.ico('globe', { s: 2.2 })}oneot.github.io/ai</p>${K.bubble('이 풀이가 맞는지 검증해 줘', { me: true })}</div>`,
  })
    + K.card({
      x: 36, y: 17.5, w: 19.5, z: 2, cls: 'par',
      body: `${K.app('copilot-studio', { s: 5 })}<b>Multi Model<br>AI Agent</b><small>부모 에이전트</small>`,
    })
    + K.card({
      x: 63, y: 8.5, w: 33, cls: 'list',
      body: `${m('translate', 'Claude Sonnet 5', '번역 · 요약', 0)}${m('slide_text', 'Claude Opus 5', 'PPT · 장문 분석', 1)}${m('chat_sparkle', 'GPT-5.5 Chat', '대화 · 브레인스토밍', 2)}${m('brain_circuit', 'GPT-5.6 Reasoning', '추론 · 수학 · 검증', 3, true)}`,
    })
    + '<div class="links"></div>'
    + K.pill({ x: 4, bottom: 5, icon: 'arrow_routing', text: '질문마다 알맞은 모델로' });
}, {
  deco: { v: 0, small: false }, // Mona sits top left
  css: `
    .q .in { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.2cqw; }
    .qh { display: flex; align-items: center; gap: .7cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    .q .bubble { max-width: 100%; word-break: keep-all; }
    .par { display: flex; flex-direction: column; align-items: center; padding: 2.4cqw 1.4cqw 2.2cqw; text-align: center; }
    .par b { margin-top: 1.2cqw; font-size: 2.45cqw; font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; white-space: nowrap; }
    .par small { margin-top: .6cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); }
    .list { display: flex; flex-direction: column; gap: 1.2cqw; padding: 0; overflow: visible; background: none; box-shadow: none; }
    .m { display: flex; align-items: center; gap: 1.3cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.6cqw; background: #fff; color: var(--ink-4); box-shadow: 0 0 0 .22cqw rgba(15, 23, 42, .05), 0 .8cqw 1.8cqw -1cqw rgba(15, 23, 42, .14); }
    .m b { display: block; font-size: 2.25cqw; font-weight: 700; letter-spacing: -0.01em; color: var(--ink-2); white-space: nowrap; }
    .m small { display: block; margin-top: .15cqw; font-size: 1.9cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    .m.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 60%, #fff), 0 2.4cqw 4.8cqw -2.4cqw rgba(var(--tint), .65); color: rgb(var(--tint)); }
    .m.on b { color: var(--ink); }
  `,
  after(stage, K) {
    const g = geo(stage);
    const c = tintOf(stage);
    const q = g('.q');
    const p = g('.par');
    let svg = K.curve(q.r + 0.4, q.cy, p.l - 0.9, p.cy, { c, dot: true });
    [0, 1, 2, 3].forEach((i) => {
      const r = g(`.m${i}`);
      svg += i === 3
        ? K.curve(p.r + 0.4, p.cy, r.l - 0.9, r.cy, { c, w: 0.6 })
        : K.curve(p.r + 0.4, p.cy, r.l - 0.6, r.cy, { c: '#c3c8d0', w: 0.4, dash: true, arrow: false });
    });
    stage.querySelector('.links').outerHTML = K.wires(svg, { z: 2 });
  },
});

})();
