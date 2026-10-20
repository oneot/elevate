/* Teams 모둠 과제 — 새 과제의 할당 대상 '학생 그룹'과 모둠별 공동 편집 파일 */
(() => {

scene('teams/thumbtest-teams-group-project', (K) => {
  const grp = (name, people, on) => `<div class="gp${on ? ' on' : ''}">
      <b class="gn">${name}</b>
      <span class="av">${people.map((p) => K.avatar(on ? p : '', { s: 3.8 })).join('')}</span>
      ${on
        ? `<div class="fl">${K.app('powerpoint', { s: 3 })}<span>발표 자료</span></div>`
        : `<div class="fl sk">${K.skel('100%', { h: 1.4 })}</div>`}
    </div>`;
  return K.win({
    x: 6, y: 11, w: 84, h: 52, title: '3학년 2반', sub: ' › 과제',
    body: `<div class="ga">
      <div class="row hd">${K.ico('clipboard_task', { s: 3.4 })}<b class="nm">모둠 발표 · 우리 고장 문화재</b><span class="grow"></span>${K.btn('할당', { primary: true })}</div>
      <div class="row to"><span class="lb">할당 대상</span><span class="sel">${K.ico('people_team', { s: 2.8 })}학생 그룹${K.ico('chevron_down', { s: 2.2 })}</span><span class="grow"></span>${K.chip('4모둠 · 12명', { tint: true })}</div>
      <div class="gs">
        ${grp('1모둠', ['김', '이', '박'], true)}
        ${grp('2모둠', ['최', '정', '강'])}
        ${grp('3모둠', ['조', '윤', '장'])}
        ${grp('4모둠', ['임', '한', '오'])}
      </div>
    </div>`,
  }) + K.pill({ right: 4, y: 4.2, icon: 'people_team', text: '모둠별로 한 번에 배정', dark: true });
}, {
  css: `
    .ga { padding: 3cqw 3.2cqw; }
    .hd { gap: 1.3cqw; }
    .hd > .ico { color: rgb(var(--tint)); }
    .nm { font-size: 2.9cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
    .hd .btn { padding: 1.1cqw 3cqw; }
    .to { gap: 1.6cqw; margin: 2.6cqw 0 2.4cqw; padding-top: 2.4cqw; border-top: .2cqw solid var(--line); }
    .lb { font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); white-space: nowrap; }
    .sel { display: inline-flex; align-items: center; gap: 1cqw; padding: 1.1cqw 1.6cqw 1.1cqw 1.8cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .28cqw rgb(var(--tint)); font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .sel > .ico { color: rgb(var(--tint)); }
    .sel > .ico:last-child { color: var(--ink-3); }
    .gs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5cqw; }
    .gp { display: flex; flex-direction: column; gap: 1.5cqw; padding: 2cqw 1.8cqw 2.2cqw; border-radius: 1.6cqw; background: rgba(255,255,255,.6); box-shadow: inset 0 0 0 .2cqw var(--line); }
    .gp.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 1.2cqw 2.4cqw -1.4cqw rgba(var(--tint), .55); }
    .gn { font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .av { display: flex; gap: .7cqw; }
    .gp:not(.on) .avatar { background: color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
    .fl { display: flex; align-items: center; gap: .9cqw; height: 4.4cqw; padding: 0 1.1cqw; border-radius: 1cqw; background: #fff; font-size: 2.05cqw; font-weight: 650; white-space: nowrap; }
    .fl.sk { background: var(--fill); }
  `,
});

})();
