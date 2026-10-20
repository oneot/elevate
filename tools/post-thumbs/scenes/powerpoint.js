/* PowerPoint scenes — see STYLE_GUIDE.md */
(() => {
  // ---------- shared bits ----------
  const tabsRow = (list, on) => `<div class="tabs">${list.map((t) => `<span${t === on ? ' class="on"' : ''}>${t}</span>`).join('')}</div>`;
  const handles = () => ['0 0', '50% 0', '100% 0', '0 50%', '100% 50%', '0 100%', '50% 100%', '100% 100%']
    .map((p) => { const [l, t] = p.split(' '); return `<i class="hd" style="left:${l};top:${t}"></i>`; }).join('');
  const BASE = `
    .tabs { display: flex; align-items: center; gap: 2.4cqw; height: 5.2cqw; padding: 0 2.8cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
    .tabs > .on { color: rgb(var(--tint)); font-weight: 700; }
    .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
    .hero { position: absolute; }
    .sel { outline: .3cqw solid rgb(var(--tint)); outline-offset: .2cqw; }
    .hd { position: absolute; z-index: 2; width: 1.3cqw; height: 1.3cqw; translate: -50% -50%; border-radius: .3cqw; background: #fff; box-shadow: 0 0 0 .25cqw rgb(var(--tint)); }
  `;

  // 1. 웹 버전 시작하기 — OneDrive 폴더에서 [새로 추가] → PowerPoint 프레젠테이션
  scene('powerpoint/pptonline1', (K) => {
    const file = (lead, w, d) => `<div class="fr">${lead}${K.skel(w, { h: 1.35 })}<span class="grow"></span>${K.skel(d, { h: 1.2 })}</div>`;
    const item = (lead, label, on) => `<div class="mi${on ? ' on' : ''}">${lead}<span>${label}</span></div>`;
    return K.win({
      x: 9, y: 10, w: 82, h: 50, icon: 'onedrive', title: '내 파일', sub: ' › 2학기 수업자료',
      body: `<div class="od">
        <div class="cmd">${K.btn('새로 추가', { primary: true, icon: 'add' })}${K.btn('업로드', { icon: 'arrow_upload:r' })}</div>
        ${file(K.ico('folder', { s: 3.2, c: '#f0b941' }), '20cqw', '9cqw')}
        ${file(K.app('word', { s: 3.2 }), '26cqw', '9cqw')}
        ${file(K.app('excel', { s: 3.2 }), '17cqw', '9cqw')}
        ${file(K.app('powerpoint', { s: 3.2 }), '23cqw', '9cqw')}
        ${file(K.app('word', { s: 3.2 }), '19cqw', '9cqw')}
      </div>`,
    })
      + K.card({
        x: 11.8, y: 24.2, w: 41, cls: 'menu',
        body: `${item(K.ico('folder', { s: 3.2, c: '#f0b941' }), '폴더')}<div class="msep"></div>
          ${item(K.app('word', { s: 3.2 }), 'Word 문서')}
          ${item(K.app('excel', { s: 3.2 }), 'Excel 통합 문서')}
          ${item(K.app('powerpoint', { s: 3.2 }), 'PowerPoint 프레젠테이션', true)}
          ${item(K.app('onenote', { s: 3.2 }), 'OneNote 전자 필기장')}`,
      })
      + K.cursor({ x: 46, y: 45.2 })
      + K.pill({ right: 5.5, y: 4.8, app: true, text: '원하는 폴더에 바로' });
  }, {
    css: BASE + `
      .od { padding: 2.2cqw 2.8cqw 0; }
      .cmd { display: flex; gap: 1.2cqw; margin-bottom: 1.6cqw; }
      .fr { display: flex; align-items: center; gap: 1.6cqw; height: 5.4cqw; padding: 0 1cqw; border-bottom: .18cqw solid #f0f1f4; }
      .menu { padding: 1cqw; }
      .mi { display: flex; align-items: center; gap: 1.5cqw; padding: 1.15cqw 1.4cqw; border-radius: 1.1cqw; font-size: 2.35cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .mi.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: var(--ink); font-weight: 700; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .msep { height: .2cqw; margin: .6cqw 1.2cqw; background: var(--line); }
    `,
  });

  // 2. 텍스트·도형·이미지 넣기 — [삽입] 탭 도구 + 안내 팸플릿 슬라이드
  scene('powerpoint/pptonline2', (K) => {
    const tool = (ico, label, on) => `<div class="tl${on ? ' on' : ''}">${K.ico(ico, { s: 3.6 })}<span>${label}</span></div>`;
    return K.card({
      x: 4, y: 3.4, cls: 'rib',
      body: `<span class="tab">삽입</span><span class="vsep"></span>
        ${tool('slide_add:r', '새 슬라이드')}${tool('textbox:r', '텍스트 상자')}${tool('shapes:r', '도형')}${tool('image:r', '그림', true)}${tool('video_clip:r', '비디오')}`,
    })
      + `<div class="slide hero pam" style="${K.pos({ x: 13, y: 12.6, w: 74 })}">
        <div class="pic sel">
          <div class="art"><svg viewBox="0 0 100 82" preserveAspectRatio="xMidYMax slice">
            <circle cx="70" cy="24" r="8.5" fill="#ffb066"/>
            <path d="M-2 60 C 16 47, 34 47, 54 58 L 54 84 L -2 84 Z" fill="#f7c6a6"/>
            <path d="M44 62 C 62 50, 84 50, 102 57 L 102 84 L 44 84 Z" fill="#f2a784"/>
            <rect x="27" y="50" width="36" height="16" fill="#fffaf6"/>
            <path d="M31 50 A 14 14 0 0 1 59 50 Z" fill="#fff"/>
            <path d="M34 50 A 11 11 0 0 1 56 50" fill="none" stroke="#f4d9c6" stroke-width="1.2"/>
            <rect x="40.5" y="56" width="9" height="10" rx="1.2" fill="#f2c4a6"/>
            <path d="M-2 69 C 30 62, 70 62, 102 69 L 102 84 L -2 84 Z" fill="#e3825f"/>
          </svg></div>
          ${handles()}
        </div>
        <div class="info">
          <span class="kick">2학년 안내</span>
          <h3>현장체험학습</h3>
          <p>${K.ico('calendar_ltr:r', { s: 2.8 })}10월 24일 (금)</p>
          <p>${K.ico('location:r', { s: 2.8 })}국립과천과학관</p>
          <div class="shape">준비물 · 도시락, 물</div>
        </div>
      </div>`
      + K.pill({ right: 4, bottom: 4.2, icon: 'shapes', text: '팸플릿도 뚝딱 완성' });
  }, {
    css: BASE + `
      .rib { display: flex; align-items: center; gap: .6cqw; padding: 1.2cqw 1.6cqw 1.2cqw 2.4cqw; z-index: 3; }
      .tab { position: relative; font-size: 2.6cqw; font-weight: 700; color: rgb(var(--tint)); padding: .6cqw 0; }
      .tab::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.4cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .vsep { width: .2cqw; height: 6.4cqw; margin: 0 1.2cqw 0 1.6cqw; background: var(--line); }
      .tl { display: flex; flex-direction: column; align-items: center; gap: .7cqw; padding: 1cqw 1.3cqw; border-radius: 1.2cqw; font-size: 2cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .tl .ico { color: var(--ink-3); }
      .tl.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .tl.on .ico { color: rgb(var(--tint)); }
      .pam { display: grid; grid-template-columns: 47% 1fr; overflow: visible; border-radius: 1.2cqw; }
      .pic { position: relative; margin: 3.6cqw 0 3.2cqw 3.2cqw; }
      .art { position: absolute; inset: 0; overflow: hidden; border-radius: .5cqw; background: linear-gradient(180deg, #ffe2cc, #fff4ea); }
      .art svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .info { display: flex; flex-direction: column; gap: 1.5cqw; padding: 4.4cqw 3cqw 0 3.6cqw; }
      .kick { align-self: flex-start; padding: .5cqw 1.3cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); font-size: 1.95cqw; font-weight: 700; }
      h3 { margin: .2cqw 0 .8cqw; font-size: 4.5cqw; font-weight: 800; letter-spacing: -0.045em; line-height: 1.1; white-space: nowrap; }
      p { display: flex; align-items: center; gap: 1cqw; font-size: 2.35cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      p .ico { color: rgb(var(--tint)); }
      .shape { margin-top: 1cqw; padding: 1.3cqw 2cqw; border-radius: 1.4cqw; background: rgb(var(--tint)); color: #fff; font-size: 2.25cqw; font-weight: 700; white-space: nowrap; align-self: flex-start; }
    `,
  });

  // 3. 그리기와 디자인 — 태블릿에서 펜으로 슬라이드에 바로 표시
  scene('powerpoint/pptonline3', (K) => {
    const pen = (c, on) => `<span class="pen${on ? ' on' : ''}">${K.ico('pen', { s: 3.2, c })}</span>`;
    return `<div class="tablet" style="${K.pos({ x: 6, y: 6.5, w: 78, h: 56 })}"><div class="scr">
        ${tabsRow(['홈', '삽입', '그리기', '디자인', '전환'], '그리기')}
        <div class="tools">
          <span class="tb">${K.ico('cursor:r', { s: 3 })}</span>
          <span class="tb on">${K.ico('inking_tool:r', { s: 3 })}터치로 그리기</span>
          <span class="vsep"></span>
          ${pen('#2b2d31')}${pen('rgb(var(--tint))', true)}${pen('#2f7de1')}
          <span class="pen">${K.ico('highlight', { s: 3.2, c: '#f5c400' })}</span>
          <span class="vsep"></span>
          <span class="tb">${K.ico('eraser:r', { s: 3 })}</span><span class="tb">${K.ico('lasso:r', { s: 3 })}</span><span class="tb">${K.ico('ruler:r', { s: 3 })}</span>
        </div>
        <div class="cv">
          <div class="slide s3">
            <h4>삼각형의 넓이</h4>
            <svg class="tri" viewBox="0 0 100 70"><path d="M8 62 L58 8 L92 62 Z" fill="color-mix(in srgb, rgb(var(--tint)) 10%, #fff)" stroke="rgb(var(--tint))" stroke-width="1.6" stroke-linejoin="round"/><path d="M58 8 L58 62" stroke="#8a8f98" stroke-width="1.2" stroke-dasharray="3 2.4"/><path d="M58 56 h-6 v6" fill="none" stroke="#8a8f98" stroke-width="1"/></svg>
            <span class="lb lb-b">밑변</span><span class="lb lb-h">높이</span>
            <div class="fx"><small>넓이 =</small>밑변 × 높이 <b class="half">÷ 2</b></div>
          </div>
        </div>
      </div></div>
      <div class="ink"></div><div class="stylus"><i class="body"></i><i class="cone"></i></div>`
      + K.pill({ right: 4.5, y: 4.4, icon: 'pen', text: '펜으로 바로 표시', dark: true });
  }, {
    css: BASE + `
      .tablet { position: absolute; padding: 1.5cqw; border-radius: 3.6cqw; background: #1b1d22; box-shadow: 0 4cqw 7cqw -3cqw rgba(var(--tint), .55), 0 1cqw 2cqw -1cqw rgba(0, 0, 0, .35); }
      .scr { position: relative; height: 100%; overflow: hidden; border-radius: 2.2cqw; background: #fff; display: flex; flex-direction: column; }
      .tools { display: flex; align-items: center; gap: 1cqw; height: 6.2cqw; padding: 0 2.4cqw; border-bottom: .2cqw solid #eef0f3; }
      .tb { display: flex; align-items: center; gap: .8cqw; padding: .8cqw 1cqw; border-radius: 1cqw; color: var(--ink-3); font-size: 2.1cqw; font-weight: 650; white-space: nowrap; }
      .tb.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .vsep { width: .2cqw; height: 3.6cqw; margin: 0 .6cqw; background: var(--line); }
      .pen { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; }
      .pen.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .cv { flex: 1; display: grid; place-items: start center; padding-top: 2.4cqw; background: #f3f3f5; }
      .s3 { width: 58cqw; }
      .s3 h4 { position: absolute; left: 3.6cqw; top: 3cqw; font-size: 3.3cqw; font-weight: 800; letter-spacing: -0.035em; }
      .tri { position: absolute; left: 3.4cqw; top: 9.4cqw; width: 25cqw; }
      .lb { position: absolute; font-size: 2cqw; font-weight: 650; color: var(--ink-3); }
      .lb-b { left: 14.2cqw; top: 27.6cqw; }
      .lb-h { left: 13.6cqw; top: 17.2cqw; }
      .fx { position: absolute; left: 31.5cqw; top: 12.6cqw; font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; white-space: nowrap; }
      .fx small { display: block; margin-bottom: .6cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-4); }
      .fx b { margin-left: 1.2cqw; font-weight: 800; }
      .stylus { position: absolute; z-index: 6; width: 0; height: 0; rotate: 27deg; transform-origin: 0 0; filter: drop-shadow(0 1.4cqw 1.4cqw rgba(0, 0, 0, .28)); }
      .stylus .body { position: absolute; left: -1.25cqw; bottom: 2.3cqw; width: 2.5cqw; height: 24cqw; border-radius: 1.25cqw 1.25cqw .25cqw .25cqw; background: linear-gradient(90deg, #c2c7cf, #f8f9fb 42%, #b3b9c2); }
      .stylus .cone { position: absolute; left: -1.25cqw; bottom: 0; width: 0; height: 0; border-left: 1.25cqw solid transparent; border-right: 1.25cqw solid transparent; border-top: 2.3cqw solid #cfd4db; }
    `,
    // Ink: a hand-drawn loop around "÷ 2"; the stylus tip rests where the stroke ends.
    after(stage, K) {
      const box = stage.getBoundingClientRect();
      const U = (v) => (v / box.width) * 100;
      const tint = `rgb(${getComputedStyle(stage).getPropertyValue('--tint').trim()})`;
      const r = stage.querySelector('.half').getBoundingClientRect();
      const cx = U(r.left + r.width / 2 - box.left);
      const cy = U(r.top + r.height / 2 - box.top);
      const rx = U(r.width) / 2 + 1.3;
      const ry = U(r.height) / 2 + 1;
      let d = '';
      let end = [0, 0];
      const N = 72;
      for (let i = 0; i <= N; i += 1) {
        const t = i / N;
        const a = (-12 + t * 400) * (Math.PI / 180);
        const k = 1 + 0.04 * Math.sin(a * 2.3) + t * 0.1;
        const x = cx + Math.cos(a) * rx * k;
        const y = cy + Math.sin(a) * ry * k;
        d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)} `;
        end = [x, y];
      }
      stage.querySelector('.ink').outerHTML = K.wires(`<path d="${d}" fill="none" stroke="${tint}" stroke-width=".6" stroke-linecap="round" stroke-linejoin="round"/>`, { z: 4 });
      const st = stage.querySelector('.stylus');
      st.style.left = `${end[0].toFixed(2)}cqw`;
      st.style.top = `${end[1].toFixed(2)}cqw`;
    },
  });

  // 4. 전환 효과와 애니메이션 — 애니메이션 창으로 순서·효과 지정
  scene('powerpoint/pptonline4', (K) => {
    const star = (c, on) => `<span class="st${on ? ' on' : ''}">${K.ico('star', { s: 2.8, c })}</span>`;
    const item = (n, c, label, on) => `<div class="ai${on ? ' on' : ''}"><span class="n">${n}</span>${K.ico('star', { s: 2.8, c })}<b>${label}</b></div>`;
    const tag = (n) => `<span class="tag">${n}</span>`;
    return K.win({
      x: 9, y: 12, w: 86, h: 50, title: '식물의 한살이', sub: ' · 과학 3단원',
      body: `<div class="ap">
        ${tabsRow(['삽입', '그리기', '디자인', '전환', '애니메이션', '슬라이드 쇼'], '애니메이션')}
        <div class="gal">${star('var(--green)')}${star('var(--green)', true)}${star('var(--green)')}<span class="gs"></span>${star('var(--amber)')}${star('var(--amber)')}<span class="gs"></span>${star('var(--red)')}${star('var(--red)')}</div>
        <div class="main">
          <div class="cv"><div class="slide s4">
            <h4>씨앗에서 꽃까지</h4>
            <div class="stages">
              <div class="sg"><svg viewBox="0 0 40 40"><ellipse cx="20" cy="22" rx="8" ry="10" fill="#b07a4f"/><path d="M20 13 C 22 18, 22 26, 20 31" stroke="#8a5a36" stroke-width="1.4" fill="none"/></svg>${tag(1)}</div>
              <i class="ar"></i>
              <div class="sg sel"><svg viewBox="0 0 40 40"><path d="M20 34 V 18" stroke="#3a9b55" stroke-width="2.4" stroke-linecap="round"/><path d="M20 22 C 12 22, 8 16, 9 10 C 16 10, 20 15, 20 22 Z" fill="#5cc37a"/><path d="M20 18 C 26 18, 31 13, 31 7 C 24 7, 20 12, 20 18 Z" fill="#43ad63"/></svg>${tag(2)}</div>
              <i class="ar"></i>
              <div class="sg"><svg viewBox="0 0 40 40"><path d="M20 36 V 20" stroke="#3a9b55" stroke-width="2.4" stroke-linecap="round"/><path d="M20 30 C 14 30, 11 26, 11 22 C 16 22, 20 25, 20 30 Z" fill="#5cc37a"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="20" cy="9" rx="4.6" ry="6.4" fill="#ff8fa3" transform="rotate(${a} 20 15)"/>`).join('')}<circle cx="20" cy="15" r="4" fill="#ffc94d"/></svg>${tag(3)}</div>
            </div>
          </div></div>
          <div class="pane">
            <div class="ph"><b>애니메이션 창</b>${K.ico('dismiss:r', { s: 2.4 })}</div>
            ${item(1, 'var(--green)', '밝기 변화')}
            ${item(2, 'var(--green)', '날아오기', true)}
            ${item(3, 'var(--amber)', '펄스')}
          </div>
        </div>
      </div>`,
    }) + K.pill({ x: 4.5, y: 4.6, icon: 'sparkle', text: '생동감 있는 발표', dark: true });
  }, {
    css: BASE + `
      .ap { display: flex; flex-direction: column; height: 100%; }
      .gal { display: flex; align-items: center; gap: .9cqw; height: 6cqw; padding: 0 2.8cqw; border-bottom: .2cqw solid #eef0f3; }
      .st { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1cqw; background: #f5f6f8; }
      .st.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .gs { width: .2cqw; height: 3.4cqw; margin: 0 .8cqw; background: var(--line); }
      .main { flex: 1; display: grid; grid-template-columns: 1fr 29cqw; min-height: 0; }
      .cv { display: grid; place-items: start center; padding-top: 2.6cqw; background: #f3f3f5; }
      .s4 { width: 47cqw; }
      .s4 h4 { position: absolute; left: 3.2cqw; top: 2.6cqw; font-size: 3cqw; font-weight: 800; letter-spacing: -0.035em; }
      .stages { position: absolute; left: 3.6cqw; right: 3.6cqw; top: 10.2cqw; display: flex; align-items: center; justify-content: space-between; }
      .sg { position: relative; width: 10.4cqw; aspect-ratio: 1; border-radius: 50%; background: #f6f1ea; display: grid; place-items: center; }
      .sg svg { width: 76%; }
      .sg.sel { outline-offset: .6cqw; border-radius: .4cqw; background: #eef7ef; }
      .ar { flex: 1; height: .3cqw; margin: 0 1.4cqw; background: #d7dade; position: relative; }
      .ar::after { content: ''; position: absolute; right: -.2cqw; top: 50%; width: 1.2cqw; height: 1.2cqw; border-top: .3cqw solid #d7dade; border-right: .3cqw solid #d7dade; translate: 0 -50%; rotate: 45deg; }
      .tag { position: absolute; left: -.8cqw; top: -.8cqw; display: grid; place-items: center; width: 2.8cqw; height: 2.8cqw; border-radius: .5cqw; background: #fff; box-shadow: 0 0 0 .2cqw #c7cbd1; font-size: 1.9cqw; font-weight: 700; color: var(--ink-2); }
      .sel .tag { background: rgb(var(--tint)); box-shadow: none; color: #fff; }
      .pane { border-left: .2cqw solid #eef0f3; padding: 2.2cqw 2.2cqw 0; display: flex; flex-direction: column; gap: 1cqw; }
      .ph { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6cqw; font-size: 2.4cqw; color: var(--ink-4); }
      .ph b { color: var(--ink); }
      .ai { display: flex; align-items: center; gap: 1cqw; padding: 1.1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.3cqw; white-space: nowrap; }
      .ai b { font-weight: 650; flex: 1; }
      .ai .n { width: 2.6cqw; font-size: 1.9cqw; font-weight: 700; color: var(--ink-4); text-align: center; }
      .ai.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .ai.on .n { color: rgb(var(--tint)); }
    `,
  });

  // 5. 저장하고 공유하기 — 버전 기록에서 이전 버전 복원
  scene('powerpoint/pptonline5', (K) => {
    const ver = (time, who, right, on) => `<div class="v${on ? ' on' : ''}"><i class="dot"></i><div class="vt"><b>${time}</b><span>${who}</span></div>${right || ''}</div>`;
    const thumb = (on) => `<div class="slide th${on ? ' on' : ''}"><i class="t1"></i><i class="t2"></i></div>`;
    return K.win({
      x: 4, y: 10, w: 58, h: 50, title: '사회 모둠 발표',
      body: `<div class="ed">
        ${tabsRow(['디자인', '전환', '애니메이션', '슬라이드 쇼', '검토'], '검토')}
        <div class="cv">
          <div class="rail">${thumb(true)}${thumb()}${thumb()}</div>
          <div class="slide s5">
            <h4>우리 고장 문화재</h4>
            <div class="photo"><svg viewBox="0 0 100 78" preserveAspectRatio="xMidYMax slice">
              <rect y="62" width="100" height="16" fill="#ecd9c6"/>
              <rect x="15" y="57" width="70" height="5.5" rx="1" fill="#cfb8a1"/>
              <rect x="21" y="37" width="58" height="20" fill="#f7ebdd"/>
              <g fill="#d6b08c"><rect x="25.5" y="41" width="8.5" height="12.5"/><rect x="39" y="41" width="8.5" height="16"/><rect x="52.5" y="41" width="8.5" height="16"/><rect x="66" y="41" width="8.5" height="12.5"/></g>
              <g fill="#b9472b"><rect x="21" y="37" width="3" height="20"/><rect x="35" y="37" width="3" height="20"/><rect x="48.5" y="37" width="3" height="20"/><rect x="62" y="37" width="3" height="20"/><rect x="76" y="37" width="3" height="20"/></g>
              <rect x="18" y="34" width="64" height="3.4" fill="#3f7a66"/>
              <path d="M2 26 C 10 30, 22 28, 29 17 L 71 17 C 78 28, 90 30, 98 26 L 92 34.5 L 8 34.5 Z" fill="#4b3b34"/>
              <path d="M28 17.2 L 72 17.2" stroke="#2e2420" stroke-width="2.6" stroke-linecap="round"/>
            </svg></div>
            <div class="lines">${K.skel('92%')}${K.skel('78%')}${K.skel('86%')}${K.skel('60%')}</div>
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 56, y: 6.5, w: 39.5, cls: 'vh',
        body: `<div class="vh-h">${K.ico('history', { s: 3 })}<b>버전 기록</b></div>
          <div class="vl">
            ${ver('오늘 오후 3:20', '김 선생님', K.chip('현재', { tint: true }))}
            ${ver('오늘 오전 11:05', '2모둠', K.btn('복원', { primary: true }), true)}
            ${ver('어제 오후 4:40', '1모둠')}
          </div>`,
      })
      + K.pill({ right: 4.5, bottom: 4.4, icon: 'arrow_counterclockwise', text: '실수해도 바로 복원' });
  }, {
    css: BASE + `
      .ed { display: flex; flex-direction: column; height: 100%; }
      .cv { flex: 1; display: grid; grid-template-columns: 9cqw 1fr; gap: 2cqw; padding: 2.4cqw 2.4cqw 0; background: #f3f3f5; }
      .rail { display: flex; flex-direction: column; gap: 1.2cqw; }
      .th { width: 100%; }
      .th.on { box-shadow: 0 0 0 .35cqw rgb(var(--tint)); }
      .th i { position: absolute; border-radius: 99px; background: #dcdfe4; }
      .th .t1 { left: 12%; top: 16%; width: 52%; height: 11%; }
      .th .t2 { left: 12%; top: 38%; width: 32%; height: 46%; border-radius: 6%; background: #f3dccb; }
      .s5 { align-self: start; }
      .s5 h4 { position: absolute; left: 2.6cqw; top: 2.4cqw; font-size: 2.8cqw; font-weight: 800; letter-spacing: -0.035em; }
      .photo { position: absolute; left: 2.6cqw; top: 7.6cqw; width: 17cqw; height: 13.4cqw; border-radius: .6cqw; overflow: hidden; background: linear-gradient(180deg, #ffe6d4, #fff5ec); }
      .photo svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .lines { position: absolute; left: 22.6cqw; right: 2.6cqw; top: 8.6cqw; display: grid; gap: 1.5cqw; }
      .vh { padding: 2.4cqw 2.4cqw 1.6cqw; }
      .vh-h { display: flex; align-items: center; gap: 1.1cqw; margin-bottom: 1.6cqw; font-size: 2.7cqw; }
      .vh-h .ico { color: rgb(var(--tint)); }
      .vl { position: relative; display: flex; flex-direction: column; gap: .8cqw; }
      .vl::before { content: ''; position: absolute; left: 2.15cqw; top: 3cqw; bottom: 3cqw; width: .25cqw; background: var(--line-2); }
      .v { position: relative; display: flex; align-items: center; gap: 1.4cqw; padding: 1.2cqw 1.4cqw; border-radius: 1.3cqw; }
      .v .dot { flex: none; width: 1.5cqw; height: 1.5cqw; border-radius: 50%; background: #c3c7ce; box-shadow: 0 0 0 .5cqw #fff; }
      .v.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .v.on .dot { background: rgb(var(--tint)); box-shadow: 0 0 0 .5cqw color-mix(in srgb, rgb(var(--tint)) 9%, #fff); }
      .vt { flex: 1; display: flex; flex-direction: column; gap: .5cqw; }
      .vt b { font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
      .vt span { display: flex; align-items: center; gap: .8cqw; font-size: 2cqw; font-weight: 600; color: var(--ink-4); white-space: nowrap; }
    `,
  });

  // 6. 3D 모델과 번역 — 3D 지구 모델 + 번역기 창
  scene('powerpoint/pptonline6', (K) => {
    const stars = [[6, 14], [14, 70], [22, 40], [31, 86], [40, 10], [47, 64], [26, 58], [91, 12], [95, 52], [88, 88], [72, 8], [62, 92], [83, 30]]
      .map(([x, y], i) => `<i style="left:${x}%;top:${y}%;--o:${0.35 + (i % 3) * 0.2}"></i>`).join('');
    return `<div class="slide hero sky" style="${K.pos({ x: 3, y: 6.5, w: 68 })}">
        <div class="stars">${stars}</div>
        <div class="tt"><span class="pick">지구의 자전</span></div>
        <div class="sub">${K.skel('17cqw', { h: 1.3 })}${K.skel('12cqw', { h: 1.3 })}</div>
        <div class="model">
          <div class="earth">
            <svg viewBox="0 0 100 100"><g fill="#5fc37b">
              <path d="M38 20 C 44 14, 54 14, 58 19 C 61 22, 66 21, 68 26 C 66 31, 59 32, 55 31 C 51 34, 46 34, 43 31 C 38 29, 35 24, 38 20 Z"/>
              <path d="M62 12 C 72 8, 86 14, 92 24 C 96 32, 91 40, 85 40 C 80 40, 78 36, 74 36 C 70 36, 68 32, 64 28 C 60 24, 57 16, 62 12 Z"/>
              <path d="M44 40 C 50 36, 59 37, 63 42 C 66 46, 70 47, 70 52 C 70 58, 64 62, 62 68 C 60 75, 56 82, 51 82 C 48 82, 48 75, 47 69 C 46 63, 41 59, 39 53 C 38 48, 40 43, 44 40 Z"/>
              <path d="M66 44 C 70 42, 76 44, 76 48 C 75 52, 70 53, 68 50 C 66 48, 65 46, 66 44 Z"/>
              <path d="M8 46 C 14 42, 22 46, 24 53 C 25 59, 20 63, 18 69 C 16 75, 12 81, 9 77 C 6 71, 5 63, 5 55 C 5 51, 6 48, 8 46 Z"/>
            </g></svg>
          </div>
          <span class="axis"></span>
          ${handles()}
          <span class="rot">${K.ico('arrow_rotate_clockwise', { s: 2.8 })}</span>
        </div>
      </div>`
      + K.card({
        x: 61.5, y: 12.5, w: 34.5, cls: 'tr',
        body: `<div class="tr-h">${K.ico('translate', { s: 3 })}<b>번역기</b><span class="grow"></span>${K.ico('dismiss:r', { s: 2.4, c: 'var(--ink-4)' })}</div>
          <div class="box"><small>한국어 (감지됨)</small><p>지구의 자전</p></div>
          <div class="box to"><small>영어${K.ico('chevron_down:r', { s: 2 })}</small><p>Earth's Rotation</p></div>
          <div class="act">${K.btn('삽입', { primary: true })}</div>`,
      })
      + K.pill({ x: 5, bottom: 7.6, icon: 'translate', text: '60개 언어로 번역' });
  }, {
    css: BASE + `
      .sky { z-index: 1; overflow: hidden; border-radius: 1.4cqw; background: radial-gradient(120% 120% at 70% 60%, #1f3a78 0%, #101c44 45%, #0a1230 100%); box-shadow: 0 0 0 .2cqw rgba(15, 23, 42, .07), 0 4cqw 7cqw -3cqw rgba(var(--tint), .5), 0 1cqw 2.2cqw -1cqw rgba(15, 23, 42, .25); }
      .tr { z-index: 2; }
      .stars i { position: absolute; width: .45cqw; height: .45cqw; border-radius: 50%; background: #fff; opacity: var(--o); }
      .tt { position: absolute; left: 4cqw; top: 5cqw; font-size: 4.6cqw; font-weight: 800; letter-spacing: -0.04em; color: #fff; }
      .pick { padding: 0 .4cqw; border-radius: .3cqw; background: rgba(120, 170, 255, .38); }
      .sub { position: absolute; left: 4.4cqw; top: 13.2cqw; display: grid; gap: 1.2cqw; }
      .sub .skel { background: rgba(255, 255, 255, .22); }
      .model { position: absolute; left: 31cqw; top: 6.4cqw; width: 25cqw; height: 25cqw; }
      .model::before { content: ''; position: absolute; inset: 0; border: .25cqw solid rgb(var(--tint)); border-radius: .2cqw; }
      .earth { position: absolute; inset: 1.6cqw; border-radius: 50%; overflow: hidden; background: radial-gradient(circle at 36% 32%, #7cc8ff 0%, #2f86e0 38%, #164a9a 72%, #0b2a63 100%); box-shadow: 0 0 2.4cqw rgba(110, 180, 255, .55); }
      .earth svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .earth::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 34% 28%, rgba(255, 255, 255, .55) 0, rgba(255, 255, 255, 0) 30%), radial-gradient(circle at 70% 75%, rgba(4, 12, 40, 0) 35%, rgba(4, 12, 40, .6) 80%); }
      .axis { position: absolute; left: 50%; top: -1.6cqw; bottom: -1.6cqw; width: 0; border-left: .25cqw dashed rgba(255, 255, 255, .55); rotate: 23.5deg; }
      .rot { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 50%; background: #fff; color: rgb(var(--tint)); box-shadow: 0 .6cqw 1.4cqw rgba(0, 0, 0, .35); }
      .tr { padding: 2.2cqw 2.4cqw 2.4cqw; display: flex; flex-direction: column; gap: 1.3cqw; }
      .tr-h { display: flex; align-items: center; gap: 1cqw; font-size: 2.7cqw; margin-bottom: .2cqw; }
      .tr-h > .ico:first-child { color: rgb(var(--tint)); }
      .box { padding: 1.3cqw 1.6cqw; border-radius: 1.2cqw; background: #f6f7f9; }
      .box small { display: flex; align-items: center; gap: .5cqw; font-size: 1.95cqw; font-weight: 650; color: var(--ink-4); }
      .box p { margin-top: .5cqw; font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .box.to { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 35%, #fff); }
      .box.to small { color: rgb(var(--tint)); }
      .act { display: flex; justify-content: flex-end; }
    `,
  });

  // 7. 강의 자료 쉽게 만들기 — 같은 자료를 웹(브라우저)과 앱(데스크톱)에서
  scene('powerpoint/powerpoint-tutorial', (K) => {
    const planets = `<svg class="sol" viewBox="0 0 100 34">
        <circle cx="-7" cy="17" r="19" fill="#ffb44d"/><circle cx="-7" cy="17" r="23" fill="none" stroke="#ffd59a" stroke-width="1"/>
        <circle cx="25" cy="17" r="2.4" fill="#b8ada4"/>
        <circle cx="36" cy="17" r="3.8" fill="#f0c27a"/>
        <circle cx="49" cy="17" r="4.2" fill="#4f8fe6"/><path d="M46.5 15.5 c 1.5 -1.4, 3.6 -1, 4.2 .6 c -1 .9, -2.6 .4, -4.2 -.6 z" fill="#5fc37b"/>
        <circle cx="61" cy="17" r="3" fill="#e0734f"/>
        <circle cx="80" cy="17" r="7.6" fill="#e7bf8e"/><path d="M73 15.6 h 14 M72.8 18.6 h 14.4" stroke="#d29e6a" stroke-width="1.1"/>
      </svg>`;
    const slide = (cls) => `<div class="slide ${cls}"><h5>태양계 행성</h5>${planets}</div>`;
    return K.win({
      x: 4, y: 6.5, w: 54, h: 37, icon: false,
      title: `<span class="url">${K.ico('lock_closed', { s: 2.2 })}office.com</span>`,
      body: `<div class="web">
          <div class="ib">${['cursor', 'textbox', 'shapes', 'image', 'video_clip'].map((i) => K.ico(`${i}:r`, { s: 2.6 })).join('')}</div>
          <div class="cv">${slide('sw')}</div>
        </div>`,
    })
      + K.win({
        x: 37, y: 16, w: 59, h: 44, cls: 'app', title: '태양계 수업', sub: ' · 저장됨',
        barRight: `<span class="auto">자동 저장<i class="toggle on"></i></span>`,
        body: `<div class="desk">
          ${tabsRow(['홈', '삽입', '그리기', '디자인', '전환'], '홈')}
          <div class="cv">${slide('sa')}</div>
        </div>`,
      })
      + K.pill({ x: 4.5, bottom: 5, app: true, text: '웹·앱 골라 쓰기' });
  }, {
    css: BASE + `
      .url { display: inline-flex; align-items: center; gap: .8cqw; padding: .7cqw 2cqw .7cqw 1.4cqw; border-radius: 99px; background: #f2f3f6; font-size: 2.15cqw; font-weight: 600; color: var(--ink-3); }
      .url .ico { color: var(--ink-4); }
      .web, .desk { display: flex; flex-direction: column; height: 100%; }
      .ib { display: flex; align-items: center; gap: 2.3cqw; height: 5cqw; padding: 0 2.8cqw; border-bottom: .2cqw solid #eef0f3; color: var(--ink-4); }
      .cv { flex: 1; padding: 2.4cqw 2.8cqw; background: #f3f3f5; }
      .slide h5 { position: absolute; left: 7%; top: 10%; font-weight: 800; letter-spacing: -0.035em; }
      .sol { position: absolute; left: 0; bottom: 14%; width: 100%; }
      .sw { width: 30cqw; }
      .sw h5 { font-size: 2.3cqw; }
      .sa { width: 40cqw; margin: 0 auto; }
      .sa h5 { font-size: 3.2cqw; }
      .auto { display: flex; align-items: center; gap: 1cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); }
      .auto .toggle { width: 4.6cqw; height: 2.6cqw; }
      .auto .toggle::after { top: .35cqw; width: 1.9cqw; height: 1.9cqw; }
    `,
  });
})();
