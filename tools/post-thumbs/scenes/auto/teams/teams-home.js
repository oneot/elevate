/* 팀 홈페이지 만들기 — 편집 중인 2열 섹션에서 [+]로 웹 파트 추가 */
(() => {
  scene('teams/teams-home', (K) => {
    const wp = (icon, name, on) => `<div class="it${on ? ' on' : ''}"><span class="ii">${K.ico(icon, { s: 2.8 })}</span><span>${name}</span>${on ? K.ico('checkmark', { s: 2.8, cls: 'ck' }) : ''}</div>`;
    const task = (w, due) => `<div class="tk">${K.ico('backpack:r', { s: 2.6 })}${K.skel(w)}<span class="grow"></span>${due ? K.chip(due) : ''}</div>`;
    return K.win({
      x: 31, y: 11, w: 67, h: 50, title: '홈페이지', sub: ' · 3학년 2반', icon: false,
      barRight: K.btn('편집', { primary: true, icon: 'edit' }),
      body: `<div class="hp">
        <div class="hero">${K.skel('40%', { h: 2.6 })}${K.skel('26%')}</div>
        <div class="sec">
          <div class="col1"><div class="gl"><i></i><span class="plus">${K.ico('add', { s: 2.6 })}</span><i></i></div></div>
          <div class="col2">
            <p class="lb">${K.ico('backpack', { s: 2.8 })}과제</p>
            ${task('60%', '10/23')}${task('46%')}
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 4, y: 18.5, w: 34, cls: 'pk',
        body: `<p class="hd">웹 파트</p>
          ${wp('backpack', '과제')}
          ${wp('calendar_ltr', '그룹 일정')}
          ${wp('clipboard_task_list_ltr', 'Planner')}
          ${wp('timer', '카운트다운 타이머', true)}
          ${wp('video', 'YouTube')}`,
      })
      + K.tile({ x: 26, y: 4.6, s: 10.5 })
      + K.float({ x: 6, y: 7, icon: 'timer' })
      + K.pill({ right: 4, y: 3.4, icon: 'apps_add_in', text: '웹 파트로 홈 꾸미기' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9.4cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .btn { padding: 1cqw 2.2cqw; font-size: 2.4cqw; }
      .hp { display: flex; flex-direction: column; gap: 2cqw; padding: 2.6cqw 3cqw 0; }
      .hero { display: flex; flex-direction: column; justify-content: flex-end; gap: 1cqw; height: 9.6cqw; padding: 2cqw 2.6cqw; border-radius: 1.6cqw;
        background: radial-gradient(60% 140% at 85% 0%, rgba(255,255,255,.45), transparent 60%), var(--grad); }
      .hero .skel { background: rgba(255,255,255,.8); }
      .sec { display: grid; grid-template-columns: 1fr 1fr; gap: 2cqw; padding: 1.8cqw; border-radius: 1.6cqw; border: .25cqw dashed color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .col1 { display: grid; place-items: center; min-height: 17cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 6%, rgba(255,255,255,.6)); }
      .gl { display: flex; align-items: center; gap: .8cqw; width: 100%; padding: 0 1.4cqw; }
      .gl > i { flex: 1; height: .35cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .plus { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 50%; background: var(--grad); color: #fff; box-shadow: 0 0 0 .7cqw color-mix(in srgb, rgb(var(--tint)) 20%, transparent), 0 .6cqw 1.4cqw rgba(var(--tint), .45); }
      .col2 { display: flex; flex-direction: column; gap: 1.2cqw; padding: 1.6cqw 1.8cqw; border-radius: 1.2cqw; background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 .2cqw var(--line); }
      .lb { display: flex; align-items: center; gap: .8cqw; margin-bottom: .4cqw; font-size: 2.7cqw; font-weight: 750; }
      .lb .ico { color: rgb(var(--tint)); }
      .tk { display: flex; align-items: center; gap: 1.1cqw; height: 4.2cqw; color: rgb(var(--tint)); }
      .tk .skel { margin: 0; }
      .tk .chip { font-size: 2.1cqw; }
      .pk { z-index: 3; display: flex; flex-direction: column; gap: .5cqw; padding: 1.8cqw 1.4cqw 1.4cqw; }
      .hd { padding: 0 1.2cqw .6cqw; font-size: 2.2cqw; font-weight: 750; color: rgb(var(--tint)); }
      .it { display: flex; align-items: center; gap: 1.3cqw; height: 4.9cqw; padding: 0 1.2cqw; border-radius: 1.2cqw; font-size: 2.5cqw; font-weight: 650; letter-spacing: -0.02em; color: var(--ink-2); white-space: nowrap; }
      .ii { display: grid; place-items: center; width: 3.8cqw; height: 3.8cqw; border-radius: 1cqw; background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .it.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .28cqw rgb(var(--tint)); color: var(--ink); font-size: 2.75cqw; font-weight: 750; }
      .it.on .ii { background: var(--grad); color: #fff; }
      .it .ck { margin-left: auto; color: rgb(var(--tint)); }
    `,
  });
})();
