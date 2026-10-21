/* Forms · 시작하기 — [새 양식]을 누른 뒤 제목·양식 설명을 쓰고 [빠른 시작]으로 설문 형식을 고르는 편집 화면 */
(() => {
  scene('forms/forms-inschool', (K) => {
    const qs = (icon, label, on) => `<div class="qi${on ? ' on' : ''}"><span class="qc">${K.ico(icon, { s: 2.8 })}</span><b>${label}</b>${on ? K.ico('checkmark_circle', { s: 2.8, cls: 'ok' }) : ''}</div>`;
    return K.win({
      x: 4, y: 10.5, w: 64, h: 50, title: '새 양식', icon: false,
      barRight: K.btn('미리 보기', { icon: 'eye:r', cls: 'pv' }),
      body: `<div class="ed">
        <div class="hd"></div>
        <div class="sheet">
          <span class="lb">제목</span>
          <div class="fd hl">2학년 3반 학급 특성 조사<i class="caret"></i></div>
          <span class="lb">양식 설명</span>
          <div class="fd ds">${K.skel('88%')}${K.skel('56%')}</div>
          <div class="act">${K.btn('빠른 시작', { icon: 'flash', primary: true, cls: 'qs' })}${K.skel('24%', { style: 'margin-left:2cqw' })}</div>
        </div>
      </div>`,
    })
      + K.card({
        x: 59, y: 25.5, w: 35, cls: 'pop',
        body: `<div class="ph">${K.ico('flash', { s: 2.8 })}<b>빠른 시작</b></div>
          ${qs('clipboard_task:r', '형성 평가')}
          ${qs('emoji:r', '학교 만족도 조사', true)}
          ${qs('hat_graduation:r', '진학 설문')}`,
      })
      + K.cursor({ x: 26, y: 53.2 })
      + K.tile({ x: 0.8, y: 4.6, s: 10.5 })
      + K.float({ right: 7, y: 15.5, icon: 'qr_code', far: true })
      + K.pill({ right: 4, y: 5.2, icon: 'form_new', text: '제목 쓰고 바로 시작' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .win__bar .pv { padding: .9cqw 1.6cqw; font-size: 2.2cqw; }
      .ed { height: 100%; padding: 2.2cqw 3cqw 0; background: rgba(240, 247, 247, .55); }
      .hd { height: 2.4cqw; border-radius: 1.4cqw 1.4cqw 0 0; background: var(--grad); }
      .sheet { display: flex; flex-direction: column; align-items: flex-start; gap: 1cqw; height: 100%; padding: 2.4cqw 3cqw 0; background: #fff; }
      .fd { width: 44cqw; }
      .lb { font-size: 2.1cqw; font-weight: 650; color: var(--ink-3); }
      .fd { display: flex; align-items: center; padding: 1.3cqw 1.8cqw; border-radius: 1.2cqw; background: #f6f8f9; }
      .fd.hl { font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; margin-bottom: .8cqw; }
      .caret { display: inline-block; width: .3cqw; height: 3.6cqw; margin-left: .5cqw; background: rgb(var(--tint)); }
      .ds { flex-direction: column; align-items: flex-start; gap: 1.1cqw; padding: 1.5cqw 1.8cqw; }
      .act { display: flex; align-items: center; margin-top: 1cqw; }
      .act .qs { padding: 1.2cqw 2.2cqw; font-size: 2.6cqw; }
      .pop { z-index: 3; padding: 2.2cqw 2.2cqw 1.6cqw; display: flex; flex-direction: column; gap: .8cqw; }
      .ph { display: flex; align-items: center; gap: 1cqw; margin: 0 0 .6cqw .4cqw; color: rgb(var(--tint)); }
      .ph b { font-size: 2.7cqw; font-weight: 750; color: var(--ink); }
      .qi { display: flex; align-items: center; gap: 1.3cqw; padding: 1cqw 1.2cqw; border-radius: 1.2cqw; font-size: 2.5cqw; white-space: nowrap; }
      .qi b { flex: 1; font-weight: 650; color: var(--ink-2); }
      .qc { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.1cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); color: rgb(var(--tint)); }
      .qi.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .qi.on b { color: var(--ink); font-weight: 750; }
      .qi .ok { color: rgb(var(--tint)); }
    `,
  });
})();
