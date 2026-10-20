/* github/thumbtest-github-class-homepage — repo with posts/ + index.md, live on a phone as the class homepage */
(() => {
scene('github/thumbtest-github-class-homepage', (K) => {
  const row = (icon, name, msg, cls = '') => `<div class="fr ${cls}">${K.ico(icon, { s: 3 })}<b>${name}</b><span class="msg">${msg}</span>${K.skel('5cqw')}</div>`;
  return K.win({
    x: 4, y: 12, w: 74, h: 50, z: 2, title: 'oneot / class-5-3',
    body: `<div class="bar">${K.chip('main', { icon: 'branch:r', line: true })}${K.chip('github-pages', { dot: 'var(--green)' })}<span class="grow"></span>${K.btn('Add file', { icon: 'add:r', line: true })}</div>
      <div class="files">
        ${row('folder', 'posts', '5월 현장체험학습 추가', 'on hl')}
        ${row('document_text', 'index.md', '학급 소개와 이번 달 일정')}
        ${row('document', K.skel('11cqw'), K.skel('15cqw'), 'dim')}
        ${row('document', K.skel('8cqw'), K.skel('19cqw'), 'dim')}
      </div>`,
  })
    + `<div class="phone" style="${K.pos({ right: 4, y: 7, z: 3 })};--w:23cqw"><div class="phone__screen">
        <div class="url">${K.ico('lock_closed', { s: 1.7 })}class-5-3</div>
        <div class="hero">${K.ico('hat_graduation', { s: 3.2 })}<b>5학년 3반</b></div>
        <p class="sec">학급 소식</p>
        <div class="post"><div class="ph">${K.ico('image', { s: 4 })}</div><b>5월 현장체험학습</b>${K.skel('88%')}${K.skel('60%')}</div>
      </div></div>`
    + K.mascot('mona-tilt', { x: 61, y: 3.6, w: 11, z: 1 })
    + K.pill({ x: 4, y: 3.6, icon: 'globe', text: '저장소 하나로 학급 홈페이지' });
}, {
  deco: { v: 2, small: false },
  css: `
    .bar { display: flex; align-items: center; gap: 1.2cqw; padding: 2.6cqw 9cqw 2cqw 3cqw; }
    .files { margin: 0 9cqw 0 3cqw; display: flex; flex-direction: column; gap: 1.3cqw; }
    .fr { display: flex; align-items: center; gap: 1.4cqw; height: 6.2cqw; padding: 0 1.8cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .7); box-shadow: inset 0 0 0 .14cqw rgba(20, 22, 30, .06); color: var(--ink-4); }
    .fr b { flex: none; font-size: 2.5cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
    .fr .msg { flex: 1; min-width: 0; font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    .fr > .skel { flex: none; }
    .fr.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); color: rgb(var(--tint)); }
    .fr.on .msg { color: var(--ink-2); }
    .fr.dim .msg { display: flex; }
    .url { position: absolute; top: 3.6cqw; left: 1.6cqw; right: 1.6cqw; display: flex; align-items: center; justify-content: center; gap: .5cqw; height: 3.4cqw; border-radius: 99px; background: var(--fill); font-size: 1.85cqw; font-weight: 600; color: var(--ink-3); }
    .hero { position: absolute; top: 8.4cqw; left: 0; right: 0; display: flex; align-items: center; gap: 1cqw; padding: 2.2cqw 2cqw; background: var(--grad); color: #fff; }
    .hero b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
    .sec { position: absolute; top: 17.2cqw; left: 2cqw; font-size: 1.95cqw; font-weight: 700; color: var(--ink-3); }
    .post { position: absolute; top: 21cqw; left: 1.6cqw; right: 1.6cqw; display: flex; flex-direction: column; gap: 1cqw; padding: 1.2cqw 1.2cqw 1.8cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .14cqw var(--line-2), 0 1.6cqw 3cqw -1.8cqw rgba(var(--tint), .5); }
    .post .ph { display: grid; place-items: center; height: 10cqw; border-radius: 1.2cqw; background: linear-gradient(140deg, color-mix(in srgb, var(--m3) 35%, #fff), color-mix(in srgb, var(--m2) 30%, #fff)); color: rgba(255, 255, 255, .95); }
    .post b { margin-top: .4cqw; font-size: 2.35cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
  `,
});
})();
