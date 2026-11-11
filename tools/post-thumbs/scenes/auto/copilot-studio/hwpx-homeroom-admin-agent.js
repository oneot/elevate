/* copilot-studio/hwpx-homeroom-admin-agent — two photos in the chat, three HWPX absence forms back, saved to OneDrive */
(() => {
  scene('copilot-studio/hwpx-homeroom-admin-agent', (K) => {
    const shot = (icon, label) => `<div class="ph">${K.ico(icon, { s: 3.4 })}<span>${label}</span></div>`;
    const file = (name, on) => `<div class="fl${on ? ' on' : ''}"><span class="fi">${K.ico('document_text', { s: 2.8 })}</span><b>${name}</b><span class="dl">${K.ico('arrow_download', { s: 2.8 })}</span></div>`;
    return K.win({
      x: 4, y: 9, w: 63, h: 52, title: '우리반 행정 에이전트', icon: false,
      body: `<div class="ct">
        <div class="me">
          <div class="att">${shot('chat_multiple', '문자')}${shot('image', '진료확인서')}</div>
          ${K.bubble('결석 서류 3종 만들어 줘', { me: true })}
        </div>
        <div class="bot">
          ${K.app(null, { s: 3.6 })}
          <div class="col fs">
            <p class="sm"><b>최서준</b> 10. 22. 결석·질병</p>
            ${file('출결_신고서.hwpx', true)}
            ${file('출결_담임의견서.hwpx')}
            ${file('출결_학부모의견서.hwpx')}
          </div>
        </div>
      </div>`,
    })
      + K.card({
        right: 4.5, y: 9, w: 29, cls: 'od',
        body: `<div class="oh">${K.app('onedrive', { s: 4.2 })}<b>/결석 서류</b></div>
          <div class="ob"><span class="n t-num">5</span><span class="nl">사진 2 + 서류 3<br>저장 완료</span></div>`,
      })
      + K.tile({ x: 1.2, y: 3.4, s: 10.5 })
      + K.float({ right: 6, y: 30, icon: 'checkmark', s: 5.2, far: true })
      + K.pill({ right: 4, bottom: 4.4, icon: 'image_multiple', text: '사진 2장으로 서류 3종' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 13cqw; }
      .ct { display: flex; flex-direction: column; gap: 2cqw; padding: 2.4cqw 3.2cqw; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2cqw; }
      .att { display: flex; gap: 1.2cqw; }
      .ph { display: flex; align-items: center; gap: .9cqw; height: 5cqw; padding: 0 1.6cqw 0 1.2cqw; border-radius: 1.2cqw;
        background: rgba(255, 255, 255, .7); box-shadow: inset 0 0 0 .18cqw var(--line); font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .ph .ico { color: var(--pink); }
      .me .bubble { font-size: 2.6cqw; font-weight: 650; white-space: nowrap; max-width: none; }
      .bot { display: flex; gap: 1.4cqw; align-items: flex-start; }
      .fs { gap: 1cqw; flex: 1; }
      .sm { font-size: 2.5cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; margin-bottom: .2cqw; }
      .sm b { font-weight: 750; color: var(--ink); margin-right: .6cqw; }
      .fl { display: flex; align-items: center; gap: 1.4cqw; height: 5.4cqw; padding: 0 1.6cqw 0 1cqw; border-radius: 1.4cqw;
        background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .18cqw var(--line); }
      .fl b { flex: 1; font-size: 2.6cqw; font-weight: 700; white-space: nowrap; letter-spacing: -0.01em; }
      .fi { position: relative; display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 1cqw;
        background: color-mix(in srgb, var(--blue) 16%, #fff); color: var(--blue); }
      .dl { display: flex; color: rgb(var(--tint)); }
      .fl.on { box-shadow: inset 0 0 0 .28cqw rgba(var(--tint), .75); background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); }
      .od { z-index: 3; display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 2.8cqw 2.8cqw; }
      .oh { display: flex; align-items: center; gap: 1.2cqw; }
      .oh b { font-size: 2.8cqw; font-weight: 750; white-space: nowrap; }
      .ob { display: flex; align-items: center; gap: 1.6cqw; }
      .ob .n { font-size: 7cqw; line-height: 1; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .nl { font-size: 2.4cqw; font-weight: 650; line-height: 1.35; color: var(--ink-2); white-space: nowrap; }
      .win__bar > span:not(.sp) { font-weight: 700; }
      &.dark {
        .ph, .fl { background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .15cqw rgba(255, 255, 255, .14); }
        .ph { color: rgba(255, 255, 255, .85); }
        .ph .ico { color: #ff9ccf; }
        .sm, .nl { color: rgba(255, 255, 255, .78); }
        .sm b { color: #fff; }
        .fi { background: rgba(90, 162, 255, .22); color: #9cc6ff; }
        .fl.on { background: rgba(var(--tint), .14); box-shadow: inset 0 0 0 .28cqw rgba(var(--tint), .7); }
        .ob .n { background: linear-gradient(135deg, rgb(var(--tint)), #8fd8ff); -webkit-background-clip: text; background-clip: text; }
      }
    `,
  });
})();
