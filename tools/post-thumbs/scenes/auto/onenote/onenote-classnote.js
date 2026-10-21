/* OneNote Class Notebook — 학생 과제물 검토: lock a submitted page for chosen students, then 적용. See STYLE_GUIDE.md */
(() => {
  scene('onenote/onenote-classnote', (K) => {
    const stu = (av, c, name, on) => `<div class="st${on ? ' on' : ''}"><i class="check${on ? ' on' : ''}"></i>${K.avatar(av, { s: 4.6, c })}<span>${name}</span>${on ? `<em class="lk">${K.ico('lock_closed', { s: 2.4 })}잠김</em>` : ''}</div>`;
    return K.win({
      x: 30, y: 10, w: 66, h: 50, title: '학생 과제물 검토', sub: ' · 1학년 2반 과학', icon: false,
      body: `<div class="rv">
          <nav>
            <div class="sc">${K.ico('notebook', { s: 2.6 })}<b>과제</b>${K.ico('chevron_down:r', { s: 2.2 })}</div>
            <div class="pgi on">${K.ico('document_text', { s: 2.6 })}<span>3단원 활동지</span></div>
            <div class="pgi">${K.skel('11cqw')}</div>
            <div class="pgi">${K.skel('9cqw')}</div>
            <div class="pgi">${K.skel('12cqw')}</div>
          </nav>
          <div class="lp">
            <div class="hd">${K.ico('lock_closed', { s: 3 })}<b>페이지 잠금</b></div>
            ${stu('김', '#9b3fd0', '1번', true)}
            ${stu('이', '#e0569a', '2번', true)}
            ${stu('박', '#2f7de1', '3번', false)}
            ${K.btn('적용', { primary: true, cls: 'go' })}
          </div>
        </div>`,
    })
      + K.tile({ x: 25, y: 4.2, s: 10.5 })
      + K.float({ x: 9, y: 9, s: 7, icon: 'lock_closed' })
      + K.pill({ x: 4, bottom: 6, tint: true, icon: 'clipboard_task', text: '과제 페이지 잠가 검토' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; }
      .rv { display: grid; grid-template-columns: 25cqw 1fr; height: 100%; }
      nav { display: flex; flex-direction: column; gap: .9cqw; padding: 2.6cqw 1.8cqw; background: rgba(250, 246, 252, .82); border-right: .2cqw solid #efe6f5; }
      .sc { display: flex; align-items: center; gap: 1cqw; margin-bottom: .8cqw; padding: 1cqw 1.3cqw; border-radius: 1.1cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw #e7dcee; color: var(--ink-3); }
      .sc .ico:first-child { color: rgb(var(--tint)); }
      .sc b { flex: 1; font-size: 2.4cqw; font-weight: 700; color: var(--ink); }
      .pgi { display: flex; align-items: center; gap: 1cqw; height: 4.6cqw; padding: 0 1.3cqw; border-radius: 1.1cqw; font-size: 2.4cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .pgi.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 32%, #fff); color: var(--ink); }
      .pgi.on .ico { color: rgb(var(--tint)); }
      .lp { display: flex; flex-direction: column; gap: 1cqw; padding: 2.6cqw 3cqw 0; }
      .lp .hd { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: 1cqw; font-size: 3.2cqw; color: rgb(var(--tint)); }
      .lp .hd b { font-weight: 750; letter-spacing: -0.03em; color: var(--ink); }
      .st { display: flex; align-items: center; gap: 1.6cqw; padding: 1.1cqw 1.6cqw; border-radius: 1.3cqw; font-size: 2.7cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .st span { flex: 1; }
      .st .check { width: 3.2cqw; height: 3.2cqw; }
      .st.on { background: rgba(255, 255, 255, .85); box-shadow: 0 .4cqw 1.4cqw rgba(119, 25, 170, .12); color: var(--ink); }
      .st .avatar { flex: none; font-size: 2cqw; }
      .st .lk { display: inline-flex; align-items: center; gap: .5cqw; padding: .6cqw 1.2cqw; border-radius: 99px; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); font-style: normal; font-size: 2.2cqw; font-weight: 700; color: rgb(var(--tint)); }
      .go { align-self: flex-end; margin-top: 1cqw; padding: 1.3cqw 3.6cqw; font-size: 2.6cqw; border-radius: 1.3cqw; box-shadow: 0 1.2cqw 2.4cqw -1cqw rgba(119, 25, 170, .55); }
    `,
  });
})();
