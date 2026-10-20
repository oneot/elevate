/* m365 scenes — see STYLE_GUIDE.md */
(() => {

// PowerShell: dark terminal with the Graph commands + the updated display names.
scene('m365/powershell', (K) => {
  const P = '<span class="m">PS&gt;</span> ';
  const C = '<span class="m">&gt;&gt;</span> ';
  const code = [
    `${P}<span class="y">Connect-MgGraph</span> <span class="o">-Scopes</span> <span class="b">"User.ReadWrite.All"</span>`,
    `${P}<span class="p">$users</span> = <span class="y">Import-Csv</span> <span class="o">-Path</span> <span class="p">$csvPath</span>`,
    `${P}<span class="k">foreach</span> (<span class="p">$user</span> <span class="k">in</span> <span class="p">$users</span>) {`,
    `${C}  <span class="y">Update-MgUser</span> \``,
    `${C}    <span class="o">-UserId</span> <span class="p">$user</span>.UserPrincipalName \``,
    `${C}    <span class="o">-DisplayName</span> <span class="p">$user</span>.DisplayName }`,
  ];
  const row = (ini, name, mail, on) => `<div class="u${on ? ' on' : ''}">${K.avatar(ini, { s: 4.4 })}<div class="grow"><b>${name}</b><small>${mail}</small></div>${K.ico('checkmark_circle', { s: 3.1, c: 'var(--green)' })}</div>`;
  return K.win({
    x: 4.5, y: 6, w: 68, h: 37.5, dark: true, icon: false,
    title: '<i class="psi">&gt;_</i>관리자: Windows PowerShell',
    body: `<div class="term tm">${code.map((l) => `<div>${l}</div>`).join('')}<div>${P}<i class="caret"></i></div></div>`,
  })
    + K.card({
      x: 57, y: 22.5, w: 38.5, cls: 'res',
      body: `<div class="hd"><span>표시 이름</span>${K.chip('변경 완료', { dot: 'var(--green)' })}</div>
        ${row('김', '10101 김○○', 's10101@sen.go.kr', true)}
        ${row('이', '10102 이○○', 's10102@sen.go.kr')}
        ${row('박', '10103 박○○', 's10103@sen.go.kr')}`,
    })
    + K.pill({ x: 4.5, bottom: 4.6, icon: 'people_sync', text: '수백 계정도 한 번에' });
}, {
  css: `
    .win__bar span { display: inline-flex; align-items: center; gap: 1.2cqw; }
    .psi { display: inline-grid; place-items: center; width: 3.5cqw; height: 3.5cqw; border-radius: .8cqw; background: linear-gradient(160deg, #3b7bd6, #1f4f9c); color: #fff; font: 700 1.7cqw/1 var(--mono); font-style: normal; letter-spacing: -0.05em; }
    .tm { padding: 2.8cqw 3cqw; font-size: 2cqw; }
    .tm .o { color: #8b949e; } .tm .k { color: #ff7b72; } .tm .b { color: #a5d6ff; }
    .caret { display: inline-block; width: 1.1cqw; height: 2.3cqw; vertical-align: -.35cqw; background: #e6edf3; opacity: .85; }
    .res { padding: 2.4cqw 2.4cqw 1.2cqw; }
    .hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4cqw; font-size: 2.15cqw; font-weight: 650; color: var(--ink-3); }
    .hd .chip { padding: .6cqw 1.3cqw; font-size: 1.95cqw; }
    .u { display: flex; align-items: center; gap: 1.4cqw; padding: .95cqw 1.2cqw; border-radius: 1.3cqw; }
    .u + .u { margin-top: .5cqw; }
    .u.on { background: color-mix(in srgb, rgb(var(--tint)) 7%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 22%, #fff); }
    .u b { display: block; font-size: 2.45cqw; font-weight: 700; letter-spacing: -0.02em; }
    .u small { display: block; margin-top: .2cqw; font-size: 1.85cqw; font-weight: 600; color: var(--ink-4); }
  `,
});

// Office install: the portal's "Office 설치" page with the app set it installs.
scene('m365/newversionoffice-download', (K) => {
  const apps = ['word', 'excel', 'powerpoint', 'onenote', 'teams', 'onedrive'];
  const rail = ['home', 'sparkle:r', 'add_circle:r', 'folder:r', 'apps:r'];
  return K.win({
    x: 7, y: 10, w: 86, h: 50, title: 'Microsoft 365', sub: ' · 내 계정',
    body: `<div class="ms">
      <div class="rail">${rail.map((n, i) => `<span class="${i === 0 ? 'on' : ''}">${K.ico(n, { s: 2.8 })}</span>`).join('')}</div>
      <div class="main">
        <p class="t-s">앱 및 디바이스</p>
        <h4>Office</h4>
        <p class="t-m">Word, Excel, PowerPoint 최신 버전</p>
        <div class="row" style="gap:1.6cqw;margin-top:3cqw">${K.btn('Office 설치', { primary: true, icon: 'arrow_download', cls: 'go' })}${K.chip('PC 5대까지', { icon: 'laptop:r', line: true })}</div>
      </div>
      <div class="apps">${apps.map((a) => `<span>${K.app(a, { s: 6.4 })}</span>`).join('')}</div>
    </div>`,
  })
    + K.cursor({ x: 40.5, y: 41 })
    + K.pill({ right: 4.5, y: 4.4, icon: 'arrow_sync_checkmark', text: '항상 최신 버전으로', tint: true });
}, {
  css: `
    .ms { display: grid; grid-template-columns: 8.4cqw 1fr auto; height: 100%; }
    .rail { display: flex; flex-direction: column; align-items: center; gap: 1.2cqw; padding-top: 2.4cqw; background: #faf8f7; border-right: .2cqw solid #f1ece9; }
    .rail span { display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 1.3cqw; color: var(--ink-3); }
    .rail span.on { background: #fff; color: rgb(var(--tint)); box-shadow: 0 .3cqw 1cqw rgba(216, 59, 1, .14); }
    .main { padding: 3.4cqw 0 0 3.6cqw; }
    h4 { margin: .6cqw 0 .9cqw; font-size: 4.2cqw; font-weight: 750; letter-spacing: -0.04em; }
    .go { padding: 1.5cqw 2.8cqw; border-radius: 1.4cqw; font-size: 2.6cqw; box-shadow: 0 1.2cqw 2.4cqw -1cqw rgba(216, 59, 1, .55); }
    .go .ico { --s: 3cqw; }
    .apps { display: grid; grid-template-columns: repeat(3, 8.8cqw); gap: 1.6cqw; align-content: start; padding: 4.2cqw 3.6cqw 0 0; }
    .apps span { display: grid; place-items: center; height: 8.8cqw; border-radius: 2cqw; background: #fff; box-shadow: 0 0 0 .2cqw #f0f1f4, 0 1cqw 2cqw -1.2cqw rgba(15, 23, 42, .18); }
  `,
});

// Account signup: the education office portal's step flow, at the school-code step.
scene('m365/signup', (K) => {
  const steps = ['약관 동의', '본인 인증', '학교 인증코드', '계정 정보'];
  const st = steps.map((s, i) => {
    const kind = i < 2 ? 'done' : i === 2 ? 'on' : '';
    return `<div class="st ${kind}"><em>${i < 2 ? K.ico('checkmark', { s: 2.2 }) : i + 1}</em><span>${s}</span></div>`;
  }).join('');
  const code = ['7', 'K', '2', 'Q', '', ''];
  return K.win({
    x: 5, y: 10.5, w: 90, h: 50, icon: 'ico:globe', title: 'o365.sen.go.kr', sub: ' · 교직원 계정 생성',
    body: `<div class="su">
      <div class="steps">${st}</div>
      <div class="frm">
        <h4>학교 인증코드 입력</h4>
        <p class="t-s">학교 담당 부서에서 받은 코드를 입력하세요</p>
        <div class="row" style="gap:2.2cqw;margin-top:2.8cqw">
          <div class="code">${code.map((c, i) => `<span class="${i === 4 ? 'cur' : ''}">${c}</span>`).join('')}</div>
          ${K.btn('다음', { primary: true, cls: 'nx' })}
        </div>
      </div>
    </div>`,
  })
    + K.pill({ right: 4.5, bottom: 4.6, dark: true, icon: 'hat_graduation', text: '학교 계정으로 바로 시작' });
}, {
  css: `
    .su { display: grid; grid-template-columns: 27cqw 1fr; height: 100%; }
    .steps { position: relative; display: flex; flex-direction: column; gap: 1cqw; padding: 3cqw 2.2cqw; background: #fbf8f7; border-right: .2cqw solid #f2eeec; }
    .steps::before { content: ''; position: absolute; left: 4.9cqw; top: 6cqw; height: 17.4cqw; width: .25cqw; background: #e8e3e1; }
    .st { position: relative; display: flex; align-items: center; gap: 1.3cqw; padding: 1cqw 1.2cqw; border-radius: 1.3cqw; font-size: 2.3cqw; font-weight: 650; color: var(--ink-4); white-space: nowrap; }
    .st em { display: grid; place-items: center; width: 3.4cqw; height: 3.4cqw; border-radius: 50%; background: #eef0f3; font: 700 1.9cqw/1 var(--font); font-style: normal; color: var(--ink-4); }
    .st.done { color: var(--ink-2); }
    .st.done em { background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); color: rgb(var(--tint)); }
    .st.on { background: #fff; color: var(--ink); box-shadow: 0 .4cqw 1.4cqw -.4cqw rgba(15, 23, 42, .14); }
    .st.on em { background: rgb(var(--tint)); color: #fff; }
    .frm { padding: 4cqw 3.6cqw; }
    h4 { font-size: 3.5cqw; font-weight: 750; letter-spacing: -0.035em; margin-bottom: .9cqw; }
    .code { display: flex; gap: 1cqw; }
    .code span { display: grid; place-items: center; width: 5.6cqw; height: 7cqw; border-radius: 1.2cqw; background: #f6f7f9; box-shadow: inset 0 0 0 .2cqw #e3e6ea; font: 700 3.3cqw/1 var(--font); color: var(--ink); }
    .code span.cur { background: #fff; box-shadow: inset 0 0 0 .35cqw rgb(var(--tint)), 0 0 0 .9cqw color-mix(in srgb, rgb(var(--tint)) 14%, transparent); }
    .code span.cur::after { content: ''; width: .3cqw; height: 3.4cqw; background: rgb(var(--tint)); }
    .nx { padding: 1.7cqw 3cqw; font-size: 2.5cqw; border-radius: 1.3cqw; }
  `,
});
})();
