/* word/wordonline5 — 템플릿으로 학교 문서 만들기: 더 많은 템플릿에서 '행사 전단'을 검색해 고르고 [만들기] */
(() => {
  scene('word/wordonline5', (K) => {
    const bulbs = [[10, 14, '#ff7eb6'], [26, 22, '#ffd166'], [42, 26, '#7ee0d2'], [58, 26, '#ff7eb6'], [74, 22, '#ffd166'], [90, 14, '#7ee0d2']]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y + 4}" r="4" fill="${c}"/>`).join('');
    const fly = `<div class="th fly">
        <div class="art"><svg viewBox="0 0 100 44" preserveAspectRatio="xMidYMid slice"><path d="M-2 10 Q 50 46, 102 10" fill="none" stroke="#9aa6d6" stroke-width="1.1"/>${bulbs}</svg></div>
        <b class="ft">가을 축제</b>
        <i class="slg"></i>${K.skel('86%', { h: 1 })}${K.skel('60%', { h: 1 })}
      </div>`;
    const rep = `<div class="th rep">
        <i class="cov"></i>
        ${K.skel('74%', { h: 1.4 })}${K.skel('90%', { h: 1 })}
        <div class="flow"><i></i><i></i><i></i></div>
        <div class="tbl">${Array.from({ length: 6 }, (_, i) => `<i class="${i < 3 ? 'h' : ''}"></i>`).join('')}</div>
      </div>`;
    const plain = `<div class="th">${K.skel('60%', { h: 1.6 })}${K.skel('88%', { h: 1 })}${K.skel('80%', { h: 1 })}${K.skel('86%', { h: 1 })}${K.skel('70%', { h: 1 })}${K.skel('54%', { h: 1 })}</div>`;
    return K.win({
      x: 4, y: 9, w: 66, h: 52, title: '더 많은 템플릿', icon: false,
      body: `<div class="gal">
        <div class="sr">${K.ico('search:r', { s: 2.8 })}<span>행사 전단</span></div>
        <div class="grid">
          <div class="tp on">${fly}<span>행사 전단</span></div>
          <div class="tp">${rep}<span>학생 보고서</span></div>
          <div class="tp">${plain}${K.skel('9cqw', { h: 1.4 })}</div>
        </div>
      </div>`,
    })
      + K.card({
        x: 61, y: 27, w: 31, cls: 'mk',
        body: `<div class="mh">${K.app('word', { s: 3.4 })}<b>행사 전단</b></div>
          <p>Word 템플릿</p>
          ${K.btn('만들기', { primary: true, icon: 'document_add' })}`,
      })
      + K.cursor({ x: 82, y: 44 })
      + K.tile({ x: 1.6, y: 3.2, s: 11 })
      + K.float({ right: 8, y: 14.5, icon: 'image', far: true })
      + K.pill({ right: 4, y: 4.4, icon: 'document_add', text: '템플릿 골라 바로 시작' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .gal { height: 100%; padding: 2.6cqw 3cqw 0; background: rgba(243, 243, 246, .6); }
      .sr { display: flex; align-items: center; gap: 1.2cqw; width: 32cqw; height: 5.6cqw; padding: 0 1.8cqw; border-radius: 99px; background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)); font-size: 2.8cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
      .sr .ico { color: rgb(var(--tint)); }
      .grid { display: flex; gap: 2.6cqw; margin-top: 2.8cqw; }
      .tp { width: 17.4cqw; display: flex; flex-direction: column; gap: 1.2cqw; font-size: 2.5cqw; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
      .tp.on > span { color: rgb(var(--tint)); font-weight: 800; font-size: 2.7cqw; }
      .th { height: 23cqw; display: flex; flex-direction: column; gap: 1cqw; padding: 2cqw 1.8cqw; border-radius: 1cqw; overflow: hidden; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .tp.on .th { box-shadow: 0 0 0 .45cqw rgb(var(--tint)), 0 1.4cqw 2.6cqw -1cqw rgba(var(--tint), .5); }
      .fly { padding: 0 0 1.6cqw; }
      .fly .skel { margin-left: 1.8cqw; }
      .art { height: 10cqw; margin-bottom: .6cqw; background: radial-gradient(120% 140% at 50% 0%, #2d3d86 0%, #1b2459 70%); }
      .art svg { width: 100%; height: 100%; display: block; }
      .ft { padding: 0 1.8cqw; font-size: 3.2cqw; font-weight: 850; letter-spacing: -0.05em; color: #1b2459; white-space: nowrap; }
      .slg { display: block; width: 70%; height: 1.2cqw; margin-left: 1.8cqw; border-radius: 99px; background: #f59ac4; }
      .cov { display: block; height: 5.6cqw; border-radius: .6cqw; background: linear-gradient(135deg, #5b8fe0, #9cc1f5); }
      .flow { display: flex; gap: 1cqw; margin: .6cqw 0; }
      .flow i { flex: 1; height: 2.6cqw; border-radius: .5cqw; background: color-mix(in srgb, rgb(var(--tint)) 14%, #fff); box-shadow: inset 0 0 0 .2cqw color-mix(in srgb, rgb(var(--tint)) 45%, #fff); }
      .tbl { display: grid; grid-template-columns: repeat(3, 1fr); gap: .3cqw; border-radius: .4cqw; overflow: hidden; }
      .tbl i { height: 2.2cqw; background: #f1f3f7; }
      .tbl i.h { background: rgb(var(--tint)); }
      .mk { z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 1.2cqw; padding: 2.8cqw 2.8cqw 2.8cqw; }
      .mh { display: flex; align-items: center; gap: 1.2cqw; }
      .mh b { font-size: 3.2cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; }
      .mk p { font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .mk .btn { margin-top: .8cqw; padding: 1.2cqw 2.6cqw; font-size: 2.8cqw; font-weight: 750; }
    `,
  });
})();
