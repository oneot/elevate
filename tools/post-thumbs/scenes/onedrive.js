/* onedrive scenes — see STYLE_GUIDE.md */
(() => {

// Save · share · collaborate: OneDrive web file list, with the share dialog for the selected file on top.
scene('onedrive/onedrive-tutorial', (K) => {
  const row = (icon, name, on) => `<div class="r${on ? ' on' : ''}">${icon}<span>${name}</span>${on ? K.ico('checkmark_circle', { s: 2.9, cls: 'ok' }) : ''}</div>`;
  return K.win({
    x: 4.5, y: 12.5, w: 66, h: 47, title: 'OneDrive',
    barRight: K.chip('1TB', { tint: true, icon: 'cloud', cls: 'tb' }),
    body: `<div class="od">
        <nav>${K.ico('home:r', { s: 3 })}<b>${K.ico('folder', { s: 3 })}</b>${K.ico('people:r', { s: 3 })}${K.ico('clock:r', { s: 3 })}</nav>
        <div class="ls">
          <h4>내 파일</h4>
          ${row(K.ico('folder', { s: 3.8, c: '#f2b631' }), '수업 자료')}
          ${row(K.app('word', { s: 3.6 }), '수행평가 안내.docx', true)}
          ${row(K.app('excel', { s: 3.6 }), '출결 현황.xlsx')}
          ${row(K.app('powerpoint', { s: 3.6 }), '3단원 수업.pptx')}
        </div>
      </div>`,
  })
    + K.card({
      x: 47, y: 22, w: 48.5, cls: 'sh',
      body: `<div class="hd">${K.ico('share', { s: 3.2 })}<b>‘수행평가 안내’ 공유</b></div>
        <div class="to">${K.chip('3학년 1반', { tint: true, icon: 'people_team' })}${K.chip('2모둠', { tint: true, icon: 'people' })}<span class="caret"></span></div>
        <div class="ft"><span class="perm">${K.ico('edit', { s: 2.6 })}편집 가능${K.ico('chevron_down:r', { s: 2.3 })}</span>${K.btn('보내기', { primary: true, cls: 'go' })}</div>`,
    })
    + K.pill({ right: 4.5, y: 4.2, icon: 'share', text: '반 전체와 안전하게 공유' });
}, {
  css: `
    .tb { padding: .55cqw 1.3cqw; font-size: 2.1cqw; font-weight: 700; }
    .od { display: grid; grid-template-columns: 8.4cqw 1fr; height: 100%; }
    nav { display: flex; flex-direction: column; align-items: center; gap: 2.4cqw; padding-top: 2.6cqw; background: #f7f9fc; border-right: .2cqw solid #eef1f5; color: var(--ink-4); }
    nav b { display: grid; place-items: center; width: 5.2cqw; height: 5.2cqw; margin: -1.1cqw 0; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
    .ls { padding: 2.8cqw 2.6cqw 0; }
    h4 { margin: 0 0 1.6cqw 1.6cqw; font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.035em; }
    .r { display: flex; align-items: center; gap: 1.7cqw; padding: 1.25cqw 1.6cqw; border-radius: 1.3cqw; font-size: 2.5cqw; font-weight: 600; color: var(--ink); white-space: nowrap; }
    .r + .r { margin-top: .5cqw; }
    .r.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 28%, #fff); }
    .r .ok { margin-left: auto; color: rgb(var(--tint)); }
    .sh { padding: 2.9cqw 3cqw 3.1cqw; }
    .sh .hd { display: flex; align-items: center; gap: 1.3cqw; margin-bottom: 2.2cqw; color: rgb(var(--tint)); }
    .sh .hd b { font-size: 2.95cqw; font-weight: 750; letter-spacing: -0.035em; color: var(--ink); white-space: nowrap; }
    .to { display: flex; align-items: center; gap: 1cqw; padding: 1.2cqw; border-radius: 1.4cqw; box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
    .to .chip { padding: .8cqw 1.5cqw .8cqw 1.2cqw; font-size: 2.3cqw; font-weight: 650; }
    .caret { width: .25cqw; height: 3cqw; margin-left: .4cqw; background: rgb(var(--tint)); }
    .ft { display: flex; align-items: center; justify-content: space-between; margin-top: 2.2cqw; }
    .perm { display: flex; align-items: center; gap: .9cqw; font-size: 2.35cqw; font-weight: 650; color: var(--ink-2); }
    .perm .ico:first-child { color: rgb(var(--tint)); }
    .perm .ico:last-child { color: var(--ink-4); }
    .go { padding: 1.3cqw 3.2cqw; font-size: 2.45cqw; border-radius: 1.2cqw; }
  `,
});

// Mobile: OneDrive phone app (파일 tab); tapping the top-left avatar opens the account list.
scene('onedrive/onedrive-mobile', (K) => {
  const item = (icon, name) => `<div class="it">${icon}<b>${name}</b></div>`;
  const acct = (av, name, mail, on) => `<div class="ac${on ? ' on' : ''}">${av}<div><b>${name}</b><small>${mail}</small></div>${on ? K.ico('checkmark_circle', { s: 3.2, cls: 'ok' }) : ''}</div>`;
  return K.card({
    x: 8, y: 11.5, w: 46.5, cls: 'acs',
    body: `${acct(K.avatar('개', { s: 4.8, c: '#8a94a6' }), '개인 계정', 'me@outlook.com')}
      ${acct(K.avatar('학', { s: 4.8 }), '학교 계정', 'teacher01@sen.go.kr', true)}
      <div class="add">${K.ico('add:r', { s: 2.8 })}계정 추가</div>`,
  })
    + `<div class="phone" style="--w:24.5cqw;${K.pos({ x: 66, y: 3.2 })}"><div class="phone__screen">
      <div class="hd">${K.avatar('학', { s: 3.8 })}<b>파일</b>${K.ico('search:r', { s: 2.7 })}</div>
      <div class="li">
        ${item(K.ico('folder', { s: 4, c: '#f2b631' }), '수업 자료')}
        ${item(K.ico('folder', { s: 4, c: '#f2b631' }), '학교 업무')}
        ${item(K.app('word', { s: 3.7 }), '학부모 안내문')}
        ${item(K.app('powerpoint', { s: 3.7 }), '3단원 수업')}
      </div>
      <div class="tabs">${K.ico('home:r', { s: 2.8 })}<b>${K.ico('folder', { s: 2.8 })}</b>${K.ico('image:r', { s: 2.8 })}${K.ico('people:r', { s: 2.8 })}</div>
    </div></div>`
    + K.wires(K.curve(67.9, 11.05, 55.6, 28, { dash: true, dot: true, dotR: .7 }))
    + K.pill({ x: 8, bottom: 4.6, dark: true, icon: 'phone', text: 'PC 문서를 폰에서 그대로' });
}, {
  css: `
    .acs { padding: 2.4cqw; }
    .ac { display: flex; align-items: center; gap: 1.8cqw; padding: 1.5cqw 1.8cqw; border-radius: 1.5cqw; }
    .ac + .ac { margin-top: .6cqw; }
    .ac div { display: flex; flex-direction: column; gap: .35cqw; }
    .ac b { font-size: 2.55cqw; font-weight: 700; letter-spacing: -0.02em; }
    .ac small { font-size: 2cqw; font-weight: 550; color: var(--ink-3); }
    .ac .ok { margin-left: auto; color: rgb(var(--tint)); }
    .ac.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 28%, #fff); }
    .add { display: flex; align-items: center; gap: 1.4cqw; margin-top: 1cqw; padding: 1.4cqw 2.4cqw; font-size: 2.35cqw; font-weight: 650; color: var(--ink-3); border-top: .2cqw solid #eef0f3; }
    .phone__screen .hd { display: flex; align-items: center; gap: 2cqw; padding: 5.2cqw 2cqw 1.4cqw; color: var(--ink-3); }
    .phone__screen .hd .avatar { box-shadow: 0 0 0 .45cqw #fff, 0 0 0 .85cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
    .phone__screen .hd b { flex: 1; font-size: 3cqw; font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
    .li { padding: 1.2cqw 1.6cqw 0; }
    .it { display: flex; align-items: center; gap: 1.6cqw; padding: 1.5cqw .5cqw; }
    .it + .it { border-top: .18cqw solid #f0f2f5; }
    .it b { font-size: 2.2cqw; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; }
    .tabs { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-around; align-items: center; padding: 1.5cqw 1.2cqw 2.6cqw; border-top: .2cqw solid #eef0f3; background: #fafbfc; color: var(--ink-4); }
    .tabs b { display: grid; place-items: center; width: 4.6cqw; height: 3.8cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
  `,
});

})();
