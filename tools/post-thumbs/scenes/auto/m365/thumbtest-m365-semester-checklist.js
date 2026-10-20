/* m365/thumbtest-m365-semester-checklist — see STYLE_GUIDE.md */
(() => {

// First-week check: the class OneDrive folder set, with 01_수업자료 shared to students as view-only.
scene('m365/thumbtest-m365-semester-checklist', (K) => {
  const folders = [
    ['01_수업자료', '읽기 전용', 'eye:r', true],
    ['02_과제제출', '학생 제출', 'arrow_upload:r'],
    ['03_모둠활동', '공동 작업', 'people_team:r'],
  ];
  const row = ([name, use, icon, on]) => `<div class="f${on ? ' on' : ''}">
      <span class="fi">${K.ico('folder', { s: 4.6 })}</span>
      <b>${name}</b>${K.chip(use, { icon, tint: on })}
      <span class="grow"></span>${K.skel(7)}</div>`;
  return K.win({
    x: 4.5, y: 9.5, w: 72, h: 52, icon: 'onedrive', title: '내 파일', sub: ' › 1학년 3반 과학',
    body: `<div class="od">
      <div class="tb">${K.btn('새로 만들기', { primary: true, icon: 'add' })}${K.skel(9)}${K.skel(6)}</div>
      ${folders.map(row).join('')}
    </div>`,
  })
    + K.card({
      x: 62, y: 18, w: 33.5, cls: 'pop',
      body: `<div class="ph">${K.ico('share', { s: 2.8, c: 'rgb(var(--tint))' })}<b>01_수업자료 공유</b></div>
        ${K.chip('1학년 3반 학생', { icon: 'people:r', line: true })}
        <div class="op on"><span class="radio on"></span>${K.ico('eye', { s: 2.8 })}<b>보기 가능</b></div>
        <div class="op"><span class="radio"></span>${K.ico('edit:r', { s: 2.8 })}<b>편집 가능</b></div>`,
    })
    + K.pill({ right: 4.5, y: 4, icon: 'folder_people', text: '폴더 3개로 수업 준비 끝' });
}, {
  css: `
    .od { display: flex; flex-direction: column; gap: 1.6cqw; padding: 3cqw; }
    .tb { display: flex; align-items: center; gap: 1.8cqw; margin-bottom: 1.2cqw; }
    .tb .btn { padding: 1.2cqw 2.4cqw; font-size: 2.4cqw; }
    .f { display: flex; align-items: center; gap: 1.7cqw; padding: 1.7cqw 2cqw; border-radius: 1.8cqw; }
    .f b { font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.02em; }
    .f .chip { padding: .6cqw 1.3cqw; font-size: 1.95cqw; }
    .f .chip .ico { --s: 2.3cqw; }
    .fi { display: grid; place-items: center; color: #e8b13c; }
    .f.on { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
    .pop { display: flex; flex-direction: column; align-items: flex-start; gap: 1.3cqw; padding: 2.6cqw; }
    .ph { display: flex; align-items: center; gap: 1.1cqw; font-size: 2.5cqw; }
    .ph b { font-weight: 700; letter-spacing: -0.02em; }
    .pop .chip { font-size: 2cqw; }
    .op { display: flex; align-items: center; gap: 1.3cqw; width: 100%; padding: 1.2cqw 1.4cqw; border-radius: 1.4cqw; font-size: 2.45cqw; color: var(--ink-3); }
    .op b { font-weight: 650; }
    .op.on { background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); color: var(--ink); box-shadow: inset 0 0 0 .22cqw rgb(var(--tint)); }
    .op.on .ico { color: rgb(var(--tint)); }
  `,
});
})();
