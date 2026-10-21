/* PowerPoint — 텍스트·도형·이미지 넣기 (v3) */
(() => {
  // [삽입] › [그림] 메뉴에서 사진 출처를 골라 운동회 팸플릿 슬라이드에 넣는 장면
  scene('powerpoint/pptonline2', (K) => {
    const tool = (ico, label, on) => `<span class="tl${on ? ' on' : ''}">${K.ico(ico, { s: 3.2 })}${label}${on ? K.ico('chevron_down:r', { s: 2 }) : ''}</span>`;
    const item = (lead, label, on) => `<div class="mi${on ? ' on' : ''}">${lead}<span>${label}</span></div>`;
    const handles = ['0 0', '50% 0', '100% 0', '0 50%', '100% 50%', '0 100%', '50% 100%', '100% 100%']
      .map((p) => { const [l, t] = p.split(' '); return `<i class="hd" style="left:${l};top:${t}"></i>`; }).join('');
    return K.win({
      right: 3.5, y: 7.5, w: 65, h: 52, title: '운동회 팸플릿', icon: false,
      body: `<div class="ed">
        <div class="tabs"><span>홈</span><span class="on">삽입</span><span>디자인</span></div>
        <div class="rib">${tool('image', '그림', true)}${tool('shapes:r', '도형')}${tool('textbox:r', '텍스트 상자')}
          <span class="vs"></span>${K.ico('video_clip:r', { s: 3.2 })}${K.ico('emoji_sparkle:r', { s: 3.2 })}</div>
        <div class="cv"><div class="slide pm">
          <div class="pic">
            <div class="art"><svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMax slice">
              <circle cx="78" cy="18" r="8" fill="#ffc46b"/>
              <path d="M-2 52 C 22 44, 60 44, 102 50 L 102 82 L -2 82 Z" fill="#f6b48f"/>
              <ellipse cx="50" cy="68" rx="46" ry="11" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 2.4"/>
              <path d="M10 30 L 90 30" stroke="#d98a6a" stroke-width=".8"/>
              ${['#ff7a59', '#ffc94d', '#5cc37a', '#4f8fe6', '#ff8fa3', '#ff7a59', '#ffc94d'].map((c, i) => `<path d="M${14 + i * 11} 30 l 4 7 l 4 -7 Z" fill="${c}"/>`).join('')}
            </svg></div>
            ${handles}
          </div>
          <div class="info">
            <h3>가을 운동회</h3>
            ${K.skel('82%', { h: 1.4 })}${K.skel('64%', { h: 1.4 })}
            <div class="sh">10월 30일 (목)</div>
          </div>
        </div></div>
      </div>`,
    })
      + K.card({
        x: 5, y: 22.5, w: 31, cls: 'menu',
        body: `${item(K.ico('laptop:r', { s: 3 }), '이 장치')}
          ${item(K.ico('image_multiple', { s: 3 }), '스톡 이미지', true)}
          ${item(K.ico('globe_search:r', { s: 3 }), '웹 검색')}
          ${item(K.ico('phone:r', { s: 3 }), '모바일 장치')}
          ${item(K.app('onedrive', { s: 3 }), 'OneDrive')}`,
      })
      + K.tile({ x: 26.5, y: 2.6, s: 11 })
      + K.float({ x: 8, y: 9, icon: 'image_add' })
      + K.pill({ right: 4.5, y: 3.4, icon: 'image', text: '사진을 슬라이드에 쏙' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 10cqw; }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .tabs { display: flex; align-items: center; gap: 3cqw; height: 5cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
      .tabs > .on { color: rgb(var(--tint)); font-weight: 750; }
      .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .rib { display: flex; align-items: center; gap: 1.2cqw; height: 7cqw; padding: 0 2.4cqw; border-bottom: .2cqw solid #eef0f3; color: var(--ink-3); }
      .tl { display: inline-flex; align-items: center; gap: .8cqw; padding: .9cqw 1.3cqw; border-radius: 1.2cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .tl.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); }
      .vs { width: .2cqw; height: 3.6cqw; margin: 0 .6cqw; background: var(--line); }
      .cv { flex: 1; display: grid; place-items: start center; padding-top: 2.6cqw; background: rgba(243, 243, 246, .75); }
      .pm { width: 50cqw; display: grid; grid-template-columns: 48% 1fr; }
      .pic { position: relative; margin: 2.8cqw 0 2.8cqw 2.8cqw; outline: .3cqw solid rgb(var(--tint)); outline-offset: .2cqw; }
      .art { position: absolute; inset: 0; overflow: hidden; border-radius: .4cqw; background: linear-gradient(180deg, #ffe2cc, #fff4ea); }
      .art svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .hd { position: absolute; z-index: 2; width: 1.3cqw; height: 1.3cqw; translate: -50% -50%; border-radius: .3cqw; background: #fff; box-shadow: 0 0 0 .25cqw rgb(var(--tint)); }
      .info { display: flex; flex-direction: column; gap: 1.4cqw; padding: 3.6cqw 2.6cqw 0 3cqw; }
      h3 { margin-bottom: .6cqw; font-size: 3.8cqw; font-weight: 800; letter-spacing: -0.045em; line-height: 1.1; white-space: nowrap; }
      .sh { margin-top: 1cqw; align-self: flex-start; display: flex; align-items: center; height: 4.6cqw; padding: 0 2cqw; border-radius: 1.4cqw; background: var(--grad); color: #fff; font-size: 2.4cqw; font-weight: 750; white-space: nowrap; }
      .menu { z-index: 3; padding: 1.1cqw; display: flex; flex-direction: column; gap: .3cqw; }
      .mi { display: flex; align-items: center; gap: 1.4cqw; height: 5.2cqw; padding: 0 1.4cqw; border-radius: 1.1cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .mi .ico { color: var(--ink-3); }
      .mi.on { background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: var(--ink); font-weight: 750; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 42%, #fff); }
      .mi.on .ico { color: rgb(var(--tint)); }
    `,
  });
})();
