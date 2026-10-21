/* 설치하고 시작하기: 운영체제 고르고 [설치] → 설치 완료 후 [열기] */
(() => {
  scene('minecraft/minecraft-tutorial', (K) => {
    const os = (icon, name, on) => `<div class="os${on ? ' on' : ''}">${on ? `<i class="ck">${K.ico('checkmark', { s: 2 })}</i>` : ''}${K.ico(icon, { s: 4.6 })}<b>${name}</b></div>`;
    return K.win({
      x: 4, y: 9, w: 61, h: 50, title: 'Minecraft Education 다운로드', icon: false,
      body: `<div class="dl">
          <p class="hd">운영체제를 선택하세요</p>
          <div class="grid">
            ${os('window', 'Windows', true)}${os('laptop', 'Mac')}${os('desktop', 'Chromebook')}
            ${os('tablet', 'iPad')}${os('phone', 'Android')}${os('phone:r', 'iPhone')}
          </div>
          <div class="go"><span>${K.ico('window', { s: 2.6 })}Windows용 설치 파일</span>${K.btn('설치', { primary: true, icon: 'arrow_download' })}</div>
        </div>`,
    })
      + K.card({
        x: 63, y: 19, w: 33, cls: 'done',
        body: `<div class="dh">${K.app(null, { s: 4.6 })}<div><b>Minecraft Education</b><p>${K.ico('checkmark_circle', { s: 2.4, c: 'var(--green)' })}설치 완료</p></div></div>
          <div class="progress" style="--p:100%"><i></i></div>
          ${K.btn('열기', { primary: true, icon: 'open' })}`,
      })
      + K.tile({ x: 1.2, y: 3.6, s: 11 })
      + K.float({ right: 6, bottom: 4.6, icon: 'arrow_download' })
      + K.pill({ right: 4, y: 4, icon: 'shield_checkmark', text: '어떤 기기든 무료 설치' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 12.4cqw; }
      .dl { height: 100%; padding: 2.6cqw 3cqw 0; display: flex; flex-direction: column; gap: 1.8cqw; }
      .hd { font-size: 2.8cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4cqw; }
      .os { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .8cqw; height: 9.8cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .78); box-shadow: inset 0 0 0 .22cqw var(--line); color: var(--ink-3); }
      .os b { font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .os.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)), 0 1.2cqw 2.4cqw -1.2cqw rgba(var(--tint), .6); color: rgb(var(--tint)); }
      .os.on b { color: var(--ink); font-weight: 750; font-size: 2.7cqw; }
      .ck { position: absolute; top: 1cqw; right: 1cqw; display: grid; place-items: center; width: 3cqw; height: 3cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .go { display: flex; align-items: center; justify-content: space-between; padding: 1.4cqw 1.6cqw 1.4cqw 2.2cqw; border-radius: 1.6cqw; background: rgba(243, 246, 240, .85); }
      .go span { display: flex; align-items: center; gap: 1cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .go span .ico { color: rgb(var(--tint)); }
      .go .btn { height: 5cqw; padding: 0 2.6cqw; font-size: 2.6cqw; color: #fff; }
      .go .btn .ico, .done .btn .ico { color: #fff; }
      .done .btn { color: #fff; }
      .done { z-index: 3; padding: 2.6cqw 2.4cqw; display: flex; flex-direction: column; gap: 1.8cqw; }
      .dh { display: flex; align-items: center; gap: 1.2cqw; }
      .dh b { font-size: 2.2cqw; font-weight: 750; white-space: nowrap; }
      .dh p { display: flex; align-items: center; gap: .6cqw; margin-top: .4cqw; font-size: 2.6cqw; font-weight: 750; color: var(--green); white-space: nowrap; }
      .done .btn { height: 5cqw; justify-content: center; font-size: 2.6cqw; }
    `,
  });
})();
