/* m365/signup (v3) — the final 'account info' step of the education office portal, with the new school-domain ID. */
(() => {
  scene('m365/signup', (K) => {
    const field = (label, inner, cls = '') => `<div class="fd ${cls}"><label>${label}</label><div class="box">${inner}</div></div>`;
    return K.win({
      x: 34, y: 9, w: 62, h: 52, icon: false, title: '교직원 계정 생성', sub: ' · o365.sen.go.kr',
      body: `<div class="fm">
        <div class="hd"><h4>계정 정보 입력</h4>${K.chip('4 / 4 단계', { tint: true })}</div>
        ${field('아이디', `<b class="id">kim.teacher</b><span class="dm">@sen.go.kr</span>`, 'on')}
        ${field('비밀번호', `<span class="pw">●●●●●●●●</span>${K.ico('eye_off:r', { s: 2.8, c: 'var(--ink-4)' })}`)}
        ${field('보조 이메일', K.skel('58%'))}
        ${K.btn('계정 생성', { primary: true, icon: 'person_add', cls: 'go' })}
      </div>`,
    })
      + K.card({
        x: 4, y: 22, w: 31, cls: 'ok',
        body: `<span class="ck">${K.ico('checkmark_circle', { s: 4.4 })}</span>
          <div><b>계정 생성 완료</b><p>OneDrive 자동 생성</p></div>`,
      })
      + K.tile({ x: 29.4, y: 3.6, s: 11 })
      + K.float({ x: 13, y: 8.5, icon: 'shield_checkmark' })
      + K.pill({ x: 4, bottom: 5, icon: 'hat_graduation', text: '학교 공식 계정 받기' });
  }, {
    deco: { big: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 9.5cqw; }
      .fm { display: flex; flex-direction: column; gap: 2cqw; height: 100%; padding: 3cqw 3.2cqw 0 4cqw; }
      .hd { display: flex; align-items: center; justify-content: space-between; }
      h4 { font-size: 3.6cqw; font-weight: 750; letter-spacing: -0.035em; }
      .hd .chip { font-size: 2.1cqw; padding: .7cqw 1.5cqw; }
      .fd { display: grid; grid-template-columns: 12.4cqw 1fr; align-items: center; }
      .fd label { font-size: 2.3cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
      .box { display: flex; align-items: center; gap: 1cqw; height: 6cqw; padding: 0 1.8cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .8); box-shadow: inset 0 0 0 .2cqw #e3e6ea; }
      .box .skel { margin: 0; }
      .fd.on .box { height: 7cqw; background: #fff; box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)), 0 0 0 .9cqw color-mix(in srgb, rgb(var(--tint)) 14%, transparent); }
      .id { font-size: 3cqw; font-weight: 750; letter-spacing: -0.02em; color: var(--ink); }
      .dm { margin-left: auto; padding: .7cqw 1.4cqw; border-radius: 1cqw; background: var(--grad); color: #fff; font-size: 2.7cqw; font-weight: 750; white-space: nowrap; }
      .pw { flex: 1; font-size: 2.2cqw; letter-spacing: .25em; color: var(--ink-2); }
      .go { align-self: flex-end; padding: 1.6cqw 3cqw; border-radius: 1.4cqw; font-size: 2.7cqw; }
      .go .ico { --s: 3cqw; }
      .ok { z-index: 3; display: flex; align-items: center; gap: 1.6cqw; padding: 2.4cqw 2.6cqw; }
      .ck { display: grid; color: var(--green); }
      .ok b { display: block; font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .ok p { margin-top: .4cqw; font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    `,
  });
})();
