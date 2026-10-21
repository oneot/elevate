/* OneNote basics — a to-do in meeting notes becomes an Outlook task from the classic ribbon. See STYLE_GUIDE.md */
(() => {
  scene('onenote/onenote', (K) => {
    const rb = (icon, label, on) => `<span class="rb${on ? ' on' : ''}">${K.ico(icon, { s: 3 })}<b>${label}</b></span>`;
    const due = (label, date, on) => `<div class="due${on ? ' on' : ''}"><span>${label}</span>${date ? `<em>${date}</em>` : ''}${on ? K.ico('checkmark', { s: 2.6 }) : ''}</div>`;
    return K.win({
      x: 4, y: 10.5, w: 66, h: 50, title: '교무수첩', icon: false,
      body: `<div class="rib">
          <div class="tabs"><span class="on">홈</span>${K.skel('5cqw', { h: 1.2 })}${K.skel('6cqw', { h: 1.2 })}${K.skel('5cqw', { h: 1.2 })}</div>
          <div class="btns">${rb('mic', '받아쓰기')}${rb('sparkle', 'Copilot')}<i class="vr"></i>${rb('flag', 'Outlook 작업', true)}</div>
        </div>
        <div class="pg">
          <h4>3월 학년 협의회</h4>
          ${K.skel('70%')}
          <div class="todo"><i class="check"></i><span>체험학습 동의서 수합</span>${K.ico('flag', { s: 2.6, cls: 'fl' })}</div>
          ${K.skel('58%')}${K.skel('64%')}
        </div>`,
    })
      + K.card({
        x: 57.5, y: 28.4, w: 35, cls: 'pop',
        body: `<div class="hd">${K.ico('flag', { s: 2.8 })}<b>Outlook 작업</b></div>
          ${due('오늘')}${due('내일')}${due('이번 주', '3/20 금', true)}`,
      })
      + K.wires(K.curve(38.6, 45, 56.6, 49.5, { dash: true, dot: true, dotR: 0.6 }), { z: 3 })
      + K.tile({ x: 0.8, y: 4.2, s: 10.5 })
      + K.float({ right: 3.2, y: 22.6, s: 6, z: 5, icon: 'alert' })
      + K.pill({ right: 4, y: 3.8, tint: true, icon: 'task_list_ltr', text: '메모 속 할 일을 작업으로' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 11.6cqw; }
      .rib { padding: 1.4cqw 2.8cqw 1.6cqw; background: rgba(250, 246, 252, .82); border-bottom: .2cqw solid #efe6f5; }
      .tabs { display: flex; align-items: center; gap: 2.6cqw; margin-bottom: 1.4cqw; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
      .tabs .on { color: rgb(var(--tint)); box-shadow: 0 .55cqw 0 -.1cqw rgb(var(--tint)); }
      .btns { display: flex; align-items: center; gap: 1.2cqw; }
      .rb { display: inline-flex; align-items: center; gap: .9cqw; padding: 1cqw 1.5cqw; border-radius: 1.2cqw; font-size: 2.3cqw; color: var(--ink-2); white-space: nowrap; }
      .rb b { font-weight: 650; }
      .rb .ico { color: rgb(var(--tint)); }
      .rb.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 35%, #fff); color: rgb(var(--tint)); }
      .rb.on .ico { color: var(--red); }
      .vr { width: .2cqw; height: 3.6cqw; margin: 0 .4cqw; background: #e6dcec; }
      .pg { display: flex; flex-direction: column; gap: 1.7cqw; padding: 3cqw 3.2cqw 0; }
      h4 { margin-bottom: .4cqw; font-size: 3.6cqw; font-weight: 750; letter-spacing: -0.035em; }
      .todo { align-self: flex-start; display: flex; align-items: center; gap: 1.3cqw; margin: .2cqw 0 .2cqw -1.2cqw; padding: 1.1cqw 1.6cqw 1.1cqw 1.2cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 30%, #fff); font-size: 2.7cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .todo .check { width: 3cqw; height: 3cqw; }
      .todo .fl { color: var(--red); }
      .pop { z-index: 4; padding: 2.4cqw 2.4cqw 2.2cqw; display: flex; flex-direction: column; gap: .6cqw; }
      .pop .hd { display: flex; align-items: center; gap: 1.1cqw; margin: 0 0 1cqw .6cqw; font-size: 2.8cqw; }
      .pop .hd b { font-weight: 750; letter-spacing: -0.03em; }
      .pop .hd .ico { color: var(--red); }
      .due { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.2cqw; font-size: 2.5cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .due span { flex: 1; }
      .due em { font-style: normal; font-size: 2.2cqw; font-weight: 600; color: var(--ink-4); }
      .due.on { background: var(--grad); color: #fff; box-shadow: 0 1cqw 2.2cqw -1cqw rgba(var(--tint), .6); }
      .due.on em { color: rgba(255, 255, 255, .85); }
    `,
  });
})();
