/* m365/powershell (v3) — see STYLE_GUIDE.md */
(() => {
  // The sample CSV (userPrincipalName → displayName) driving Update-MgUser, with the PowerShell output beside it.
  scene('m365/powershell', (K) => {
    const rows = [
      ['s20301@school.kr', '20301 김○○'],
      ['s20302@school.kr', '20302 이○○', true],
      ['s20303@school.kr', '20303 박○○'],
    ];
    const ok = K.ico('checkmark_circle', { s: 3, c: 'var(--green)' });
    const cells = rows.map(([upn, name, on]) => `<div class="m">${upn}</div><div class="nm${on ? ' sel' : ''}">${name}</div><div class="ck">${ok}</div>`).join('');
    const blank = '<div><i class="sk" style="width:70%"></i></div><div class="nm"><i class="sk" style="width:55%"></i></div><div></div>'.repeat(2);
    return K.win({
      x: 30, y: 10, w: 66, h: 50, icon: false,
      title: 'Sample.csv',
      barRight: K.chip('CSV', { line: true, icon: 'document_table:r' }),
      body: `<div class="xl sh" style="--cols:1.15fr 1fr 6cqw">
        <div class="th">userPrincipalName</div><div class="th hot">displayName</div><div class="th"></div>
        ${cells}${blank}
      </div>`,
    })
      + K.card({
        x: 4, y: 41, w: 37, cls: 'ps',
        body: `<div class="pt">${K.ico('chevron_right', { s: 2.2 })}Windows PowerShell</div>
          <div class="term"><div><span class="m">PS&gt;</span> <span class="y">Update-MgUser</span></div><div class="g">updated to '20302 이○○'</div></div>`,
      })
      + K.tile({ x: 25, y: 4.6, s: 10.5 })
      + K.float({ right: 2.2, y: 3, icon: 'people_sync' })
      + K.pill({ right: 4.5, bottom: 4.4, tint: true, icon: 'person_edit', text: '표시 이름 한 번에 변경' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 3 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .win__bar > span:not(.sp) { font-size: 2.6cqw; font-weight: 700; }
      .win__bar .chip { font-size: 2.1cqw; padding: .6cqw 1.3cqw; }
      .sh { --rh: 6.2cqw; font-size: 2.45cqw; }
      .sh > * { padding: 0 1.8cqw; }
      .sh > .th { font-size: 2.3cqw; color: var(--ink-3); }
      .sh > .th.hot { color: rgb(var(--tint)); box-shadow: inset 0 -.4cqw 0 rgb(var(--tint)); }
      .sh > .m { color: var(--ink-3); font-weight: 600; }
      .sh > .nm { color: var(--ink); font-weight: 750; font-size: 2.75cqw; background: color-mix(in srgb, rgb(var(--tint)) 4%, #fff); }
      .sh > .nm.sel { box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)); background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); }
      .sh > .ck { justify-content: center; }
      .sk { display: block; height: 1.4cqw; border-radius: 1cqw; background: rgba(20, 22, 30, .08); }
      .ps { z-index: 4; padding: 0; overflow: hidden; background: rgba(22, 27, 34, .94); }
      .pt { display: flex; align-items: center; gap: .8cqw; padding: 1.4cqw 2.4cqw; font-size: 2cqw; font-weight: 650; color: #c9d1d9; background: rgba(255, 255, 255, .06); }
      .ps .term { padding: 1.6cqw 2.4cqw 2cqw; font-size: 2.35cqw; line-height: 1.6; }
      .ps .g { color: #7ee787; font-weight: 600; }
    `,
  });
})();
