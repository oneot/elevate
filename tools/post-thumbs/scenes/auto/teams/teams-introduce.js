/* 시작하기 — 설정 › 알림 및 활동: 모든 알림 음소거로 수업 중 알림 끄기 */
(() => {
  scene('teams/teams-introduce', (K) => {
    const nav = (icon, label, on) => `<div class="nv${on ? ' on' : ''}">${K.ico(on ? icon : `${icon}:r`, { s: 2.7 })}<span>${label}</span></div>`;
    const row = (label) => `<div class="rw"><span>${label}</span><span class="off">끔${K.ico('chevron_down:r', { s: 2.2 })}</span></div>`;
    return K.win({
      x: 31, y: 9.5, w: 66, h: 50, title: '설정', icon: false,
      barRight: `<span class="mr">${K.ico('more_horizontal', { s: 3 })}</span>`,
      body: `<div class="st">
        <div class="sn">
          ${nav('settings', '일반')}
          ${nav('paint_brush', '모양 및 접근성')}
          ${nav('alert', '알림 및 활동', true)}
          <div class="nv sk">${K.ico('lock_closed:r', { s: 2.7 })}${K.skel('10cqw')}</div>
        </div>
        <div class="sp">
          <b class="hd">알림 및 활동</b>
          <div class="mute">${K.ico('alert_off', { s: 3.4 })}<b>모든 알림 음소거</b><i class="toggle on"></i></div>
          ${row('채팅 메시지 알림')}
          ${row('멘션')}
          ${row('부재 중 활동 메일')}
        </div>
      </div>`,
    })
      + K.tile({ x: 25.6, y: 3.6, s: 11 })
      + K.float({ x: 23.4, y: 33, s: 6, icon: 'dark_theme' })
      + K.pill({ x: 3.5, y: 22, icon: 'speaker_mute', text: '수업 중 알림 끄기', dark: true });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; font-size: 2.9cqw; font-weight: 700; }
      .mr { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: var(--fill); color: var(--ink-2); }
      .st { display: grid; grid-template-columns: 23cqw 1fr; height: 100%; }
      .sn { display: flex; flex-direction: column; gap: .8cqw; padding: 2.6cqw 1.6cqw; background: rgba(246, 246, 251, .78); border-right: .2cqw solid var(--line); }
      .nv { display: flex; align-items: center; gap: 1.1cqw; padding: 1.1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.3cqw; font-weight: 600; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      .nv .ico { color: var(--ink-3); }
      .nv.on { background: #fff; color: var(--ink); font-weight: 750; box-shadow: 0 .3cqw 1cqw rgba(var(--tint), .18); }
      .nv.on .ico { color: rgb(var(--tint)); }
      .nv.sk .skel { margin: 0; }
      .sp { display: flex; flex-direction: column; gap: 1cqw; padding: 2.6cqw 3cqw 0; }
      .hd { margin-bottom: .6cqw; font-size: 3cqw; font-weight: 750; letter-spacing: -0.03em; }
      .mute { display: flex; align-items: center; gap: 1.4cqw; height: 7.4cqw; margin-bottom: .6cqw; padding: 0 2cqw; border-radius: 1.6cqw; background: color-mix(in srgb, rgb(var(--tint)) 11%, #fff); box-shadow: inset 0 0 0 .32cqw rgb(var(--tint)), 0 1.2cqw 2.6cqw -1.4cqw rgba(var(--tint), .55); white-space: nowrap; }
      .mute > .ico { color: rgb(var(--tint)); }
      .mute b { flex: 1; font-size: 2.9cqw; font-weight: 750; letter-spacing: -0.03em; }
      .mute .toggle { width: 7cqw; height: 3.9cqw; }
      .mute .toggle::after { top: .45cqw; width: 3cqw; height: 3cqw; }
      .rw { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; height: 5.2cqw; padding: 0 1.6cqw 0 2cqw; border-bottom: .2cqw solid var(--line); font-size: 2.4cqw; font-weight: 650; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      .off { display: inline-flex; align-items: center; gap: .8cqw; height: 3.8cqw; padding: 0 1cqw 0 1.4cqw; border-radius: 1cqw; background: var(--fill); font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
    `,
  });
})();
