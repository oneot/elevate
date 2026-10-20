/* OneNote — student portfolio page in a Class Notebook personal section. See STYLE_GUIDE.md */
(() => {

// A student's own section: activity photo + one-line reflection, with the teacher's pen feedback floating on top.
scene('onenote/thumbtest-onenote-portfolio', (K) => {
  const pg = (label, on, icon) => `<div class="pp${on ? ' on' : ''}">${K.ico(icon, { s: 2.4 })}<span>${label}</span></div>`;
  return K.win({
    x: 13, y: 9.5, w: 92, h: 50, title: '6학년 2반 과학', sub: ' · 수업용 전자 필기장',
    body: `<div class="pf">
      <nav>
        <div class="me">${K.avatar('14', { s: 3.6, c: '#9b3fd0' })}<b>나의 포트폴리오</b></div>
        ${pg('학기 초 나의 목표', false, 'target:r')}
        ${pg('3단원 대표 활동', true, 'image:r')}
        ${pg('성장 돌아보기', false, 'arrow_trending:r')}
      </nav>
      <div class="pg">
        <h4>3단원 대표 활동</h4>
        <div class="row ev">
          <div class="photo">${K.ico('leaf_two', { s: 5.4 })}<span class="tag">${K.ico('camera', { s: 2 })}실험 사진</span></div>
        </div>
        <div class="refl">
          <small>${K.ico('lightbulb', { s: 2.3 })}한 줄 성찰</small>
          <p>식물은 빛 쪽으로 자란다는 걸 알았다</p>
        </div>
      </div>
    </div>`,
  })
    + K.card({
      x: 67.5, y: 23, w: 28.5, cls: 'fb',
      body: `<div class="hd"><span class="pen">${K.ico('pen', { s: 2.6 })}</span><b>선생님 피드백</b></div>
        <p>관찰이 꼼꼼해요!</p>`,
    })
    + K.pill({ x: 4, y: 3, dark: true, icon: 'notebook', text: '한 학기 성장을 한곳에' });
}, {
  css: `
    .pf { display: grid; grid-template-columns: 26.5cqw 1fr; height: 100%; }
    nav { display: flex; flex-direction: column; gap: .7cqw; padding: 2.4cqw 1.6cqw; background: #faf7fc; border-right: .2cqw solid #f0eaf4; }
    .me { display: flex; align-items: center; gap: 1.1cqw; margin: 0 .4cqw 1.2cqw; padding-bottom: 1.6cqw; border-bottom: .2cqw solid #eee6f3; white-space: nowrap; }
    .me .avatar { font-size: 1.7cqw; }
    .me b { font-size: 2.4cqw; font-weight: 750; letter-spacing: -0.03em; }
    .pp { display: flex; align-items: center; gap: 1cqw; padding: 1cqw 1.2cqw; border-radius: 1.1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    .pp .ico { color: var(--ink-4); }
    .pp.on { background: #fff; color: var(--ink); box-shadow: 0 .3cqw 1cqw rgba(119, 25, 170, .14); }
    .pp.on .ico { color: rgb(var(--tint)); }
    .pg { padding: 3cqw 3.2cqw 0; }
    h4 { margin-bottom: 2cqw; font-size: 3.5cqw; font-weight: 750; letter-spacing: -0.035em; }
    .ev { gap: 2.4cqw; align-items: center; }
    .photo { position: relative; flex: none; display: grid; place-items: center; width: 22cqw; height: 13cqw; border-radius: 1.4cqw; background: linear-gradient(140deg, #e3f4e2, #bfe3c4 55%, #9fd0b0); color: #2f8a52; rotate: -2deg; box-shadow: 0 .8cqw 1.8cqw -.8cqw rgba(30, 90, 50, .45), 0 0 0 .5cqw #fff; }
    .tag { position: absolute; left: 1cqw; bottom: 1cqw; display: flex; align-items: center; gap: .5cqw; padding: .4cqw .9cqw; border-radius: 99px; background: rgba(255, 255, 255, .9); font-size: 1.85cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
    .tag .ico { color: var(--ink-3); }
    .notes { flex: 1; gap: 1.3cqw; }
    .refl { margin-top: 2.6cqw; width: 55cqw; padding: 1.6cqw 2cqw; border-radius: 1.3cqw; background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 30%, #fff); }
    .refl small { display: flex; align-items: center; gap: .6cqw; font-size: 2cqw; font-weight: 700; color: rgb(var(--tint)); }
    .refl p { margin: .7cqw 0 0; font-size: 2.85cqw; font-weight: 650; color: var(--ink); letter-spacing: -0.02em; white-space: nowrap; }
    .fb { padding: 2.2cqw 2.6cqw 2.4cqw; rotate: 2deg; }
    .fb .hd { display: flex; align-items: center; gap: 1.1cqw; }
    .fb .pen { display: grid; place-items: center; width: 4.2cqw; height: 4.2cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
    .fb b { font-size: 2.4cqw; font-weight: 700; }
    .fb p { margin: 1.3cqw 0 0; font-size: 2.7cqw; font-weight: 700; color: rgb(var(--tint)); letter-spacing: -0.02em; white-space: nowrap; }
  `,
});
})();
