/* onedrive/thumbtest-onedrive-folder-sharing — see STYLE_GUIDE.md */
(() => {

// Folder structure + safe link: '1학기' folder tiles on the right, the 링크 설정 card for '1_수업자료' on the left
// with '우리 학교 사용자' chosen instead of '누구나'.
scene('onedrive/thumbtest-onedrive-folder-sharing', (K) => {
  const tile = (name, on) => `<div class="tl${on ? ' on' : ''}">${K.ico('folder', { s: 6.4, c: '#f2b631' })}${on ? `<span class="lk">${K.ico('link', { s: 2 })}</span>` : ''}<b>${name}</b></div>`;
  const opt = (icon, name, on, off) => `<div class="op${on ? ' on' : ''}${off ? ' off' : ''}"><span class="radio${on ? ' on' : ''}"></span>${K.ico(icon, { s: 2.9 })}<b>${name}</b></div>`;
  return K.win({
    x: 28, y: 9.5, w: 70, h: 52, title: 'OneDrive',
    body: `<div class="od">
        <nav>${K.skel('70%', { h: 1.3 })}${K.skel('55%', { h: 1.3 })}${K.skel('65%', { h: 1.3 })}${K.skel('45%', { h: 1.3 })}</nav>
        <div class="mn">
          <h4>${K.ico('folder', { s: 3.4, c: '#f2b631' })}1학기</h4>
          <div class="gr">
            ${tile('1_수업자료', true)}
            ${tile('2_평가')}
            ${tile('3_학급운영')}
            ${tile('4_공유받은자료')}
          </div>
        </div>
      </div>`,
  })
    + K.card({
      x: 3.5, y: 15.6, w: 40, cls: 'ls',
      body: `<div class="hd">${K.ico('link_settings', { s: 3.3 })}<b>링크 설정</b></div>
        ${opt('globe:r', '누구나', false, true)}
        ${opt('building', '우리 학교 사용자', true)}
        ${opt('person:r', '특정 사용자')}
        <div class="ft"><span class="perm">${K.ico('eye', { s: 2.6 })}보기 가능${K.ico('chevron_down:r', { s: 2.2 })}</span>${K.btn('적용', { primary: true, cls: 'go' })}</div>`,
    })
    + K.pill({ x: 3.5, y: 3.4, tint: true, icon: 'shield_checkmark', text: '필요한 사람에게만 공유' });
}, {
  css: `
    .od { display: grid; grid-template-columns: 15cqw 1fr; height: 100%; }
    nav { display: flex; flex-direction: column; gap: 2.4cqw; padding: 3cqw 2.4cqw; background: #f7f9fc; border-right: .2cqw solid #eef1f5; }
    .mn { padding: 2.8cqw 3cqw 0; }
    h4 { display: flex; align-items: center; gap: 1.3cqw; margin: 0 0 1.8cqw; font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.035em; }
    .gr { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6cqw; }
    .tl { position: relative; display: flex; flex-direction: column; align-items: center; gap: .9cqw; padding: 1.7cqw 1.2cqw 1.8cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .55); box-shadow: inset 0 0 0 .18cqw #eef1f5; }
    .tl b { font-size: 2.4cqw; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
    .tl.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .24cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
    .lk { position: absolute; top: 1.4cqw; right: 1.4cqw; display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
    .ls { padding: 2.8cqw 2.8cqw 3cqw; }
    .hd { display: flex; align-items: center; gap: 1.3cqw; margin: 0 0 1.6cqw .4cqw; color: rgb(var(--tint)); }
    .hd b { font-size: 3cqw; font-weight: 750; letter-spacing: -0.035em; color: var(--ink); }
    .op { display: flex; align-items: center; gap: 1.4cqw; padding: 1.3cqw 1.5cqw; border-radius: 1.3cqw; color: var(--ink-3); }
    .op + .op { margin-top: .4cqw; }
    .op b { font-size: 2.45cqw; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
    .op.off { opacity: .55; }
    .op.on { color: rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
    .ft { display: flex; align-items: center; justify-content: space-between; margin-top: 2cqw; padding: 2cqw .4cqw 0; border-top: .2cqw solid #eef0f3; }
    .perm { display: flex; align-items: center; gap: .9cqw; font-size: 2.35cqw; font-weight: 650; color: var(--ink-2); }
    .perm .ico:first-child { color: rgb(var(--tint)); }
    .perm .ico:last-child { color: var(--ink-4); }
    .go { padding: 1.2cqw 3.2cqw; font-size: 2.4cqw; border-radius: 1.2cqw; }
  `,
});

})();
