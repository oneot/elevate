/* PowerPoint · 전환 효과와 애니메이션 넣기 — [전환] 탭에서 모핑을 고르고 효과 옵션(개체·단어·문자)을 정한다 */
(() => {
  scene('powerpoint/pptonline4', (K) => {
    const tab = (t, on) => `<span${on ? ' class="on"' : ''}>${t}</span>`;
    const fx = (ico, label, on) => `<div class="fx${on ? ' on' : ''}"><span class="fi">${K.ico(ico, { s: 3.2 })}</span><b>${label}</b></div>`;
    const opt = (label, on) => `<div class="op${on ? ' on' : ''}"><i class="radio${on ? ' on' : ''}"></i><b>${label}</b></div>`;
    const blob = (cls) => `<i class="mo ${cls}"></i>`;
    const thumb = (cls, mark) => `<div class="tw"><div class="slide th ${cls}"><i class="tm"></i></div>${mark ? K.ico('star', { s: 1.9, cls: 'tr' }) : ''}</div>`;
    return K.win({
      x: 3.5, y: 9, w: 64, h: 50, icon: false, title: '3학년 2반 학급 소개',
      body: `<div class="ed">
        <div class="tabs">${tab('디자인')}${tab('전환', true)}${tab('애니메이션')}</div>
        <div class="gal">
          ${fx('square_shadow:r', '페이드')}${fx('arrow_right:r', '밀어내기')}${fx('sparkle', '모핑', true)}
          <span class="vsep"></span>
          <span class="eo">효과 옵션${K.ico('chevron_down', { s: 2.2 })}</span>
        </div>
        <div class="cv">
          <div class="rail">${thumb('a')}${thumb('b on', true)}</div>
          <div class="slide st">
            ${K.skel('11cqw', { h: 1.5, style: 'position:absolute;left:3cqw;top:2.8cqw' })}
            <svg class="path" viewBox="0 0 100 56"><path d="M14 37 C 28 8, 54 4, 70 28" fill="none" stroke="rgb(var(--tint))" stroke-width=".9" stroke-dasharray="2 1.8" stroke-linecap="round"/></svg>
            ${blob('m1')}${blob('m2')}${blob('m3')}${blob('m4')}
          </div>
        </div>
      </div>`,
    })
      + K.card({
        x: 61, y: 22, w: 27, cls: 'pop',
        body: `${opt('개체', true)}${opt('단어')}${opt('문자')}`,
      })
      + K.tile({ x: 1, y: 3.4, s: 10.5 })
      + K.float({ right: 5, bottom: 5.5, icon: 'play', far: true })
      + K.pill({ right: 4, y: 4.4, icon: 'sparkle', text: '모핑으로 부드럽게' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12cqw; }
      .ed { display: flex; flex-direction: column; height: 100%; }
      .tabs { display: flex; align-items: center; gap: 3cqw; height: 5.4cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tabs > span { position: relative; display: flex; align-items: center; height: 100%; }
      .tabs > .on { color: rgb(var(--tint)); font-weight: 750; }
      .tabs > .on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1cqw; height: .45cqw; border-radius: 99px; background: rgb(var(--tint)); }
      .gal { display: flex; align-items: center; gap: 1.2cqw; height: 9.6cqw; padding: 0 3cqw; border-bottom: .2cqw solid #eef0f3; }
      .fx { display: flex; flex-direction: column; align-items: center; gap: .6cqw; padding: .8cqw 1.2cqw; border-radius: 1.2cqw; font-size: 2.1cqw; color: var(--ink-3); white-space: nowrap; }
      .fx b { font-weight: 650; }
      .fi { display: grid; place-items: center; width: 7cqw; height: 4.4cqw; border-radius: .8cqw; background: #f3f4f6; color: var(--ink-4); }
      .fx.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .25cqw color-mix(in srgb, rgb(var(--tint)) 50%, #fff); color: rgb(var(--tint)); }
      .fx.on b { font-weight: 800; font-size: 2.5cqw; }
      .fx.on .fi { background: var(--grad); color: #fff; }
      .vsep { width: .2cqw; height: 6cqw; margin: 0 .8cqw; background: var(--line); }
      .eo { display: inline-flex; align-items: center; gap: .6cqw; padding: 1.1cqw 1.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); font-size: 2.6cqw; font-weight: 750; white-space: nowrap; }
      .cv { flex: 1; display: flex; gap: 2.4cqw; padding: 2.6cqw 3cqw 0; background: rgba(243, 243, 246, .75); }
      .rail { display: flex; flex-direction: column; gap: 1.6cqw; width: 9cqw; }
      .tw { position: relative; }
      .th { width: 100%; }
      .th.on { box-shadow: 0 0 0 .35cqw rgb(var(--tint)); }
      .tm { position: absolute; width: 22%; aspect-ratio: 1; border-radius: 30%; background: var(--grad); }
      .th.a .tm { left: 14%; top: 50%; }
      .th.b .tm { left: 60%; top: 28%; width: 30%; rotate: 35deg; }
      .tr { position: absolute; left: -2.4cqw; bottom: .1cqw; color: rgb(var(--tint)); }
      .st { flex: 1; align-self: start; }
      .path { position: absolute; inset: 0; width: 100%; height: 100%; }
      .mo { position: absolute; aspect-ratio: 1; border-radius: 30%; translate: -50% -50%; background: linear-gradient(135deg, var(--f1), rgb(var(--tint))); box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(var(--tint), .6); }
      .m1 { left: 14%; top: 66%; width: 5.4cqw; opacity: .3; background: var(--f1); }
      .m2 { left: 31%; top: 30%; width: 6.4cqw; rotate: 12deg; opacity: .42; }
      .m3 { left: 50%; top: 18%; width: 7.4cqw; rotate: 24deg; opacity: .62; }
      .m4 { left: 70%; top: 48%; width: 9.6cqw; rotate: 38deg; }
      .pop { z-index: 3; padding: 1.4cqw; display: flex; flex-direction: column; gap: .6cqw; }
      .op { display: flex; align-items: center; gap: 1.6cqw; padding: 1.4cqw 1.8cqw; border-radius: 1.2cqw; font-size: 2.8cqw; color: var(--ink-2); white-space: nowrap; }
      .op b { font-weight: 650; }
      .op.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, rgb(var(--tint)) 40%, #fff); color: var(--ink); }
      .op.on b { font-weight: 800; }
    `,
  });
})();
