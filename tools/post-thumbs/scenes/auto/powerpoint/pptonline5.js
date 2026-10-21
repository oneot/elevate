/* PowerPoint · 저장하고 공유하기 — [파일] › [공유] › 링크 설정: 학교 구성원만 접근, 설정 더 보기에서 편집 가능 */
(() => {
  scene('powerpoint/pptonline5', (K) => {
    const opt = (ico, label, sub, on) => `<div class="op${on ? ' on' : ''}">
        <span class="oi">${K.ico(ico, { s: 3.2 })}</span>
        <div class="ot"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div>
        <i class="radio${on ? ' on' : ''}"></i>
      </div>`;
    const set = (ico, label, on) => `<div class="sr">${K.ico(ico, { s: 3 })}<b>${label}</b><span class="grow"></span><i class="toggle${on ? ' on' : ''}"></i></div>`;
    return K.win({
      x: 33, y: 6.5, w: 63.5, h: 52, icon: false, title: '링크 설정', sub: ' · 사회 모둠 발표',
      barRight: K.btn('적용', { primary: true }),
      body: `<div class="dl">
        ${opt('globe:r', '링크가 있는 모든 사용자')}
        ${opt('building', '링크가 있는 학교 구성원', '같은 학교 계정만', true)}
        ${opt('people:r', '선택한 사용자')}
        <div class="more">설정 더 보기</div>
        <div class="sets">${set('edit', '편집 가능', true)}${set('arrow_download_off:r', '다운로드 차단')}</div>
      </div>`,
    })
      + K.tile({ x: 28.6, y: 1.6, s: 10.5 })
      + K.float({ x: 14, y: 16, s: 7.4, icon: 'link' })
      + K.pill({ x: 3.5, bottom: 6, icon: 'people_team', text: '학교 안에서만 공유' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 1 },
    css: `
      .win { z-index: 2; }
      .win__bar { padding-left: 9.5cqw; font-size: 2.9cqw; font-weight: 750; }
      .win__bar .btn { padding: 1cqw 2.4cqw; font-size: 2.4cqw; }
      .dl { display: flex; flex-direction: column; gap: .8cqw; padding: 2.2cqw 3cqw 0; }
      .op { display: flex; align-items: center; gap: 1.8cqw; min-height: 5.6cqw; padding: .6cqw 1.8cqw; border-radius: 1.4cqw; color: var(--ink-2); }
      .oi { flex: none; display: grid; place-items: center; width: 5cqw; height: 5cqw; border-radius: 50%; background: #f1f2f5; color: var(--ink-3); }
      .ot { flex: 1; display: flex; flex-direction: column; gap: .3cqw; }
      .ot b { font-size: 2.6cqw; font-weight: 650; white-space: nowrap; }
      .ot small { font-size: 2.1cqw; font-weight: 650; color: rgb(var(--tint)); white-space: nowrap; }
      .op .radio { width: 2.8cqw; height: 2.8cqw; }
      .op.on { padding: 1.3cqw 1.8cqw; background: color-mix(in srgb, rgb(var(--tint)) 9%, #fff); box-shadow: inset 0 0 0 .28cqw color-mix(in srgb, rgb(var(--tint)) 50%, #fff); color: var(--ink); }
      .op.on .oi { width: 5.8cqw; height: 5.8cqw; background: var(--grad); color: #fff; }
      .op.on .ot b { font-size: 3.1cqw; font-weight: 800; letter-spacing: -0.02em; }
      .more { margin-top: .6cqw; padding-top: 1.6cqw; border-top: .2cqw solid #eef0f3; font-size: 2.3cqw; font-weight: 700; color: var(--ink-3); }
      .sets { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6cqw; }
      .sr { display: flex; align-items: center; gap: 1.2cqw; padding: 1.4cqw 1.8cqw; border-radius: 1.4cqw; background: #f5f6f8; color: var(--ink-3); }
      .sr b { font-size: 2.5cqw; font-weight: 700; color: var(--ink-2); white-space: nowrap; }
      .sr:first-child { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
      .sr:first-child .ico { color: rgb(var(--tint)); }
    `,
  });
})();
