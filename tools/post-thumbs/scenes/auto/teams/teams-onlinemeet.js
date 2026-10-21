/* 화상 회의하기 — 모임 옵션: 대기실·발표자 역할·참가자 권한 */
(() => {
  scene('teams/teams-onlinemeet', (K) => {
    const sel = (inner, cls = '') => `<span class="sel ${cls}">${inner}${K.ico(cls ? 'chevron_up' : 'chevron_down', { s: 2.4 })}</span>`;
    const opt = (inner, on) => `<div class="op${on ? ' on' : ''}">${inner}${on ? K.ico('checkmark', { s: 3 }) : ''}</div>`;
    return K.win({
      x: 5, y: 7.5, w: 61, h: 52, title: '모임 옵션', icon: false,
      barRight: K.btn('적용', { primary: true }),
      body: `<div class="mo">
        <p class="sec">${K.ico('door', { s: 2.6 })}모임 액세스</p>
        <div class="rw"><span>누가 대기실을 지나갈 수 있나요?</span>${sel('모든 사용자')}</div>
        <div class="rw"><span>참가하거나 나갈 때 알림</span><i class="toggle"></i></div>
        <p class="sec">${K.ico('person_board', { s: 2.6 })}역할</p>
        <div class="rw"><span>발표할 수 있는 사람</span>${sel(K.skel('9cqw', { tint: true }), 'open')}</div>
        <div class="rw pm"><span>마이크 허용</span><i class="toggle on"></i><span>카메라 허용</span><i class="toggle on"></i></div>
        <div class="rw pm"><span>채팅 허용</span><i class="toggle on"></i><span>반응 허용</span><i class="toggle on"></i></div>
      </div>`,
    })
      + K.card({
        x: 50.6, y: 41.6, w: 41, cls: 'pop',
        body: `${opt('<span>모든 사용자</span>')}${opt('<b>이끌이 및 공동 이끌이 전용</b>', true)}`,
      })
      + K.tile({ x: 1.6, y: 3.2, s: 10.5 })
      + K.float({ right: 7, y: 21, icon: 'video' })
      + K.pill({ right: 4, y: 5, icon: 'settings', text: '수업에 맞춘 모임 옵션' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12.6cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .btn { padding: 1cqw 2.4cqw; font-size: 2.4cqw; }
      .mo { display: flex; flex-direction: column; gap: .9cqw; padding: 2cqw 3cqw 0; }
      .sec { display: flex; align-items: center; gap: .9cqw; margin-top: .3cqw; font-size: 2.2cqw; font-weight: 750; color: rgb(var(--tint)); }
      .rw { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; height: 5.3cqw; padding: 0 1.8cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .72); box-shadow: inset 0 0 0 .18cqw var(--line); font-size: 2.45cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
      .rw.pm { justify-content: flex-start; gap: 1.6cqw; }
      .rw.pm .toggle { margin-right: 2.6cqw; }
      .sel { display: inline-flex; align-items: center; gap: 1.2cqw; height: 4cqw; padding: 0 1.2cqw 0 1.6cqw; border-radius: 1cqw; background: var(--fill); font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); }
      .sel.open { background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); color: rgb(var(--tint)); }
      .sel .skel { margin: 0; }
      .pop { z-index: 3; display: flex; flex-direction: column; gap: .5cqw; padding: 1.1cqw; }
      .op { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; height: 4.8cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); color: var(--ink); }
      .op.on b { font-size: 2.75cqw; font-weight: 750; letter-spacing: -0.02em; }
      .op.on .ico { color: rgb(var(--tint)); }
    `,
  });
})();
