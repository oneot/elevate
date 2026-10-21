/* m365/newversionoffice-download — v3 fluid scene (see STYLE_GUIDE.md) */
(() => {
  // The Office installer after running OfficeSetup.exe: "준비가 완료되었습니다" with the installed apps.
  scene('m365/newversionoffice-download', (K) => {
    const apps = ['word', 'excel', 'powerpoint', 'onenote', 'teams'];
    return K.win({
      x: 31, y: 8.5, w: 64, h: 52, icon: false, title: 'Microsoft 365 앱 설치',
      body: `<div class="ins">
        <h4>준비가 완료되었습니다!</h4>
        <p class="lead">Word, Excel, PowerPoint 최신 버전</p>
        <div class="apps">${apps.map((a) => `<span>${K.app(a, { s: 5.6 })}<i>${K.ico('checkmark', { s: 1.7 })}</i></span>`).join('')}</div>
        <div class="bar"><div class="progress" style="--p:100%"><i></i></div><b>100%</b></div>
        <div class="ft">${K.btn('닫기', { primary: true, cls: 'cl' })}</div>
      </div>`,
    })
      + K.card({
        x: 3, y: 22, w: 33.4, cls: 'dl',
        body: `<span class="fi">${K.ico('arrow_download', { s: 3.4 })}</span>
          <div class="col"><b>OfficeSetup.exe</b>${K.chip('다운로드 완료', { dot: 'var(--green)' })}</div>`,
      })
      + K.tile({ x: 26, y: 3.2, s: 10.5 })
      + K.float({ right: 2.6, y: 2.4, icon: 'checkmark_circle' })
      + K.float({ x: 12, y: 8.6, icon: 'laptop', s: 5.4 })
      + K.pill({ x: 4.5, bottom: 4.6, icon: 'arrow_sync_checkmark', text: '항상 최신 버전으로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .ins { height: 100%; padding: 3.6cqw 3.4cqw 0 6.6cqw; display: flex; flex-direction: column; }
      h4 { font-size: 4.2cqw; font-weight: 780; letter-spacing: -0.04em; white-space: nowrap; }
      .lead { margin-top: .9cqw; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .apps { display: flex; gap: 1.6cqw; margin-top: 3cqw; }
      .apps span { position: relative; display: grid; place-items: center; width: 8.4cqw; height: 8.4cqw; border-radius: 2cqw; background: #fff; box-shadow: 0 0 0 .2cqw #eef0f4, 0 1cqw 2cqw -1.2cqw rgba(15, 23, 42, .2); }
      .apps span > i { position: absolute; right: -.7cqw; bottom: -.7cqw; display: grid; place-items: center; width: 3cqw; height: 3cqw; border-radius: 50%; background: var(--green); color: #fff; box-shadow: 0 0 0 .35cqw #fff; }
      .bar { display: flex; align-items: center; gap: 1.6cqw; margin-top: 3.4cqw; }
      .bar .progress { flex: 1; height: 1.3cqw; }
      .bar b { font-size: 2.6cqw; font-weight: 750; color: rgb(var(--tint)); }
      .ft { display: flex; justify-content: flex-end; margin-top: 2.6cqw; }
      .cl { padding: 1.4cqw 3.6cqw; border-radius: 1.4cqw; font-size: 2.6cqw; }
      .dl { z-index: 3; display: flex; align-items: center; gap: 1.6cqw; padding: 2.4cqw 2.6cqw; }
      .fi { display: grid; place-items: center; flex: none; width: 6cqw; height: 6cqw; border-radius: 1.6cqw; background: var(--grad); color: #fff; }
      .dl .col { gap: .8cqw; align-items: flex-start; }
      .dl b { font-size: 2.6cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .dl .chip { padding: .6cqw 1.3cqw; font-size: 2.1cqw; }
    `,
  });
})();
