/* copilot/copilot1 — 시작하기: school-account M365 Copilot Chat (수학 도우미 agent, OneDrive file) with the enterprise data protection promises in focus. */
(() => {
  scene('copilot/copilot1', (K) => {
    const ok = (t) => `<div class="ok">${K.ico('checkmark_circle', { s: 2.8, c: 'var(--green)' })}<span>${t}</span></div>`;
    return K.win({
      x: 33, y: 9, w: 64, h: 50, icon: false, title: 'M365 Copilot Chat',
      barRight: `<span class="sh">${K.ico('shield_checkmark', { s: 2.6 })}보호됨</span>`,
      body: `<div class="ly">
        <div class="sd">
          <p class="lb">에이전트</p>
          <div class="ag on"><span class="ti">${K.ico('calculator', { s: 2.4 })}</span>수학 도우미</div>
          <p class="lb">채팅 기록</p>
          ${K.skel('86%')}${K.skel('70%')}${K.skel('78%')}
        </div>
        <div class="mn">
          <div class="me">
            <span class="file">${K.app('onedrive', { s: 2.8 })}단원 계획.pdf</span>
            ${K.bubble('2학년 3반<br>복습 문제 만들어 줘', { me: true })}
          </div>
          <div class="ans">${K.app('copilot', { s: 3.6 })}<div class="col">${K.skel('92%')}${K.skel('80%')}${K.skel('60%')}</div></div>
        </div>
      </div>`,
    })
      + K.card({
        x: 3.4, y: 22, w: 35.4, cls: 'edp', body: `
          <div class="eh"><span class="si">${K.ico('shield_lock', { s: 3 })}</span><b>엔터프라이즈<br>데이터 보호</b></div>
          ${ok('광고에 쓰지 않음')}${ok('AI 훈련에 쓰지 않음')}${ok('암호화해 저장·전송')}`,
      })
      + K.tile({ x: 28.4, y: 3.6, s: 10.5 })
      + K.float({ x: 9, y: 8, icon: 'hat_graduation', s: 6.4 })
      + K.pill({ right: 4, bottom: 4.4, icon: 'shield_checkmark', text: '학교 계정은 안전하게' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 9.6cqw; }
      .sh { display: inline-flex; align-items: center; gap: .7cqw; height: 4.4cqw; padding: 0 1.5cqw; border-radius: 99px; background: color-mix(in srgb, var(--green) 12%, #fff); color: var(--green); font-size: 2.3cqw; font-weight: 700; white-space: nowrap; }
      .ly { display: flex; height: 100%; }
      .sd { flex: none; width: 25cqw; display: flex; flex-direction: column; gap: 1.5cqw; padding: 2.8cqw 1.6cqw 0 8.4cqw; background: rgba(243, 243, 248, .7); }
      .sd .lb { font-size: 2cqw; font-weight: 650; color: var(--ink-3); }
      .sd .lb:not(:first-child) { margin-top: 1cqw; }
      .ag { display: flex; align-items: center; gap: 1cqw; padding: 1cqw 1.4cqw 1cqw 1cqw; margin-left: -1cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 700; white-space: nowrap; }
      .ag.on { background: #fff; box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); color: rgb(var(--tint)); }
      .ti { flex: none; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 1.1cqw; background: var(--grad); color: #fff; }
      .mn { flex: 1; display: flex; flex-direction: column; gap: 2.8cqw; padding: 3cqw 3cqw 0; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2cqw; }
      .file { display: inline-flex; align-items: center; gap: 1cqw; padding: .9cqw 1.6cqw .9cqw 1.1cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .me .bubble { max-width: 100%; font-size: 2.5cqw; line-height: 1.35; text-align: right; }
      .ans { display: flex; gap: 1.4cqw; align-items: flex-start; }
      .ans .col { flex: 1; gap: 1.4cqw; padding-top: .6cqw; }
      .edp { z-index: 3; display: flex; flex-direction: column; gap: 1.7cqw; padding: 2.6cqw 2.8cqw 2.8cqw; }
      .eh { display: flex; align-items: center; gap: 1.4cqw; margin-bottom: .4cqw; }
      .eh b { font-size: 2.8cqw; font-weight: 750; line-height: 1.2; letter-spacing: -0.03em; }
      .si { flex: none; display: grid; place-items: center; width: 5.4cqw; height: 5.4cqw; border-radius: 1.5cqw; background: var(--grad); color: #fff; }
      .ok { display: flex; align-items: center; gap: 1cqw; font-size: 2.5cqw; font-weight: 650; white-space: nowrap; }
    `,
  });
})();
