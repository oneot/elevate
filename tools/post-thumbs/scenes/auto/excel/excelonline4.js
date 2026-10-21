/* 공유하고 인쇄하기: 링크 설정에서 대상과 권한을 골라 공유 */
(() => {
  scene('excel/excelonline4', (K) => {
    const opt = (icon, label, on) => `<div class="op${on ? ' on' : ''}"><span class="oi">${K.ico(icon, { s: 2.8 })}</span><b>${label}</b><i class="radio${on ? ' on' : ''}"></i></div>`;
    return K.win({
      x: 5, y: 8.5, w: 64, h: 50, title: '링크 설정', sub: ' · 체험학습 명단', icon: false,
      barRight: K.btn('적용', { primary: true }),
      body: `<div class="ls">
          <p class="q">링크를 사용할 수 있는 사용자</p>
          ${opt('globe', '링크가 있는 모든 사용자')}
          ${opt('building', '우리 학교 사용자', true)}
          ${opt('people', '선택한 사용자')}
          <p class="q mt">설정 더 보기</p>
          <div class="st"><span class="oi">${K.ico('edit', { s: 2.8 })}</span><b>편집 가능</b>${K.ico('chevron_down', { s: 2.4 })}</div>
          <div class="st"><span class="oi">${K.ico('arrow_download_off', { s: 2.8 })}</span><b>다운로드 차단</b><i class="toggle on"></i></div>
        </div>`,
    })
      + K.card({
        x: 66, y: 41.5, w: 30, cls: 'cp',
        body: `<span class="li">${K.ico('link', { s: 3 })}</span>${K.skel('8cqw')}${K.btn('링크 복사', { primary: true })}`,
      })
      + K.tile({ x: 1.6, y: 4, s: 11 })
      + K.float({ x: 75, y: 18, icon: 'people_team' })
      + K.pill({ right: 4, y: 4.6, icon: 'share', text: '권한 골라 링크 공유' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .win__bar .btn { padding: 1cqw 2.2cqw; font-size: 2.4cqw; }
      .ls { display: flex; flex-direction: column; gap: .9cqw; padding: 2.2cqw 3.2cqw; }
      .q { font-size: 2.2cqw; font-weight: 700; color: var(--ink-3); }
      .q.mt { margin-top: .9cqw; }
      .op, .st { display: flex; align-items: center; gap: 1.6cqw; height: 4.8cqw; padding: 0 1.8cqw 0 1cqw; border-radius: 1.2cqw; font-size: 2.6cqw; white-space: nowrap; }
      .op b, .st b { flex: 1; font-weight: 600; color: var(--ink-2); }
      .oi { display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 50%; background: #f1f3f5; color: var(--ink-3); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); }
      .op.on b { color: rgb(var(--tint)); font-weight: 750; }
      .op.on .oi { background: var(--grad); color: #fff; }
      .st { box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .st > .ico:last-child { color: var(--ink-4); }
      .cp { z-index: 3; display: flex; align-items: center; gap: 1.4cqw; padding: 1.8cqw 2cqw; }
      .li { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .cp .skel { flex: 1; }
      .cp .btn { font-size: 2.4cqw; white-space: nowrap; }
    `,
  });
})();
