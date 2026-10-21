/* Word — 메모와 공유 기능 알아보기: 공유 › 링크 설정 (조직 범위 선택 + 편집 권한·만료 날짜·암호) */
(() => {
  scene('word/wordonline3', (K) => {
    const op = (ico, label, on) => `<div class="op${on ? ' on' : ''}"><span class="oi">${K.ico(ico, { s: 2.8 })}</span><b>${label}</b><span class="grow"></span><i class="radio${on ? ' on' : ''}"></i></div>`;
    return K.win({
      x: 30, y: 10, w: 66, h: 50, title: '링크 설정', sub: '수행평가 안내', icon: false,
      body: `<div class="ls">
        ${op('globe', '누구나')}
        ${op('building', '재현고등학교 사용자', true)}
        ${op('people_checkmark', '기존 액세스 권한이 있는 사용자')}
        ${op('person_add', '선택한 사용자')}
        <div class="st">
          <span class="dd">${K.ico('pen', { s: 2.6 })}편집 가능${K.ico('chevron_down:r', { s: 2 })}</span>
          <span class="dd">${K.ico('calendar_ltr:r', { s: 2.6 })}10월 31일</span>
          <span class="dd">${K.ico('lock_closed:r', { s: 2.6 })}암호<i class="toggle on"></i></span>
        </div>
      </div>`,
    })
      + K.tile({ x: 25, y: 4.6, s: 10.5 })
      + K.float({ x: 14, y: 22, s: 7.4, icon: 'link' })
      + K.float({ x: 4.5, y: 6.5, s: 6.2, icon: 'lock_closed', far: true })
      + K.pill({ right: 4, y: 3.2, icon: 'share', text: '필요한 사람만 함께 편집' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .win__bar em { font-size: 2.3cqw; }
      .ls { display: flex; flex-direction: column; gap: .7cqw; padding: 2.6cqw 3cqw 0; }
      .op { display: flex; align-items: center; gap: 1.6cqw; height: 5.4cqw; padding: 0 1.8cqw 0 1cqw; border-radius: 1.4cqw; white-space: nowrap; }
      .op b { font-size: 2.6cqw; font-weight: 600; color: var(--ink-2); }
      .oi { display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 50%; background: rgba(20, 22, 30, .05); color: var(--ink-3); }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1.6cqw 3.2cqw -1.8cqw rgba(var(--tint), .55); }
      .op.on b { font-size: 2.9cqw; font-weight: 750; color: rgb(var(--tint)); }
      .op.on .oi { background: var(--grad); color: #fff; }
      .st { display: flex; align-items: center; gap: 1.2cqw; margin-top: 1.6cqw; padding-top: 2.2cqw; border-top: .2cqw solid var(--line); }
      .dd { display: inline-flex; align-items: center; gap: .8cqw; height: 4.8cqw; padding: 0 1.3cqw; border-radius: 1.1cqw; box-shadow: inset 0 0 0 .2cqw var(--line-2); background: rgba(255, 255, 255, .8); font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .dd .ico { color: rgb(var(--tint)); }
      .dd .toggle { margin-left: .4cqw; }
    `,
  });
})();
