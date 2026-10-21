/* PowerPoint 6. 3D 모델과 번역 기능 쓰기 — [스톡 3D 모델] 창에서 영어로 검색해 움직이는 모델 고르기 */
(() => {
  scene('powerpoint/pptonline6', (K) => {
    const model = (ico, name, tone, o = {}) => `<div class="md ${tone}${o.on ? ' on' : ''}">
        <span class="gd"></span>${K.ico(ico, { s: 9, cls: 'mi' })}
        ${o.run ? `<span class="run">${K.ico('person_walking', { s: 2.8 })}</span>` : ''}
        ${o.on ? `<span class="ck">${K.ico('checkmark', { s: 2.2 })}</span>` : ''}
        ${name ? `<b>${name}</b>` : ''}
      </div>`;
    return K.win({
      x: 4.5, y: 10, w: 65, h: 50, title: '스톡 3D 모델', icon: false,
      barRight: K.btn('삽입 (1)', { primary: true }),
      body: `<div class="dlg">
        <div class="q">${K.ico('search:r', { s: 2.8 })}<span>animal</span><span class="grow"></span>${K.ico('dismiss:r', { s: 2.2 })}</div>
        <div class="grid">
          ${model('animal_cat', 'Cat', 'mint')}
          ${model('animal_rabbit', 'Rabbit', 'peach', { on: true, run: true })}
          ${model('animal_dog', 'Dog', 'sky')}
          ${model('animal_turtle', '', 'lemon')}
          ${model('animal_paw_print', '', 'lilac')}
          ${model('bug', '', 'mint')}
        </div>
      </div>`,
    })
      + K.tile({ x: 1, y: 3.6, s: 11 })
      + K.float({ x: 73, y: 30, icon: 'translate' })
      + K.float({ right: 6, y: 17, icon: 'cube', s: 5.6, far: true })
      + K.pill({ right: 4, y: 5, icon: 'search', text: '영어로 찾아 3D 삽입' });
  }, {
    deco: { big: 'sphere', small: 'fold', v: 0 },
    css: `
      .win__bar { padding-left: 12.4cqw; font-size: 2.9cqw; font-weight: 700; }
      .win__bar .btn { padding: 1.1cqw 2.2cqw; font-size: 2.5cqw; font-weight: 700; }
      .dlg { height: 100%; padding: 2.6cqw 3cqw 0; display: flex; flex-direction: column; gap: 2.4cqw; }
      .q { display: flex; align-items: center; gap: 1.3cqw; height: 6cqw; padding: 0 1.8cqw; border-radius: 99px; background: #fff;
        box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)), 0 0 0 .8cqw color-mix(in srgb, rgb(var(--tint)) 12%, transparent); font-size: 2.9cqw; font-weight: 700; color: var(--ink); }
      .q > .ico:first-child { color: rgb(var(--tint)); }
      .q > .ico:last-child { color: var(--ink-4); }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2cqw; }
      .md { position: relative; height: 15.6cqw; border-radius: 2cqw; display: grid; place-items: center; overflow: hidden;
        background: radial-gradient(90% 80% at 50% 30%, #fff 0, var(--bg) 100%); box-shadow: inset 0 0 0 .18cqw rgba(20, 22, 30, .05); }
      .md.mint { --bg: #d9f4ea; --a: #6fdcb4; --b: #1f9a76; }
      .md.peach { --bg: #ffe2d4; --a: #ffb27d; --b: #e0532f; }
      .md.sky { --bg: #dcebff; --a: #8cc2ff; --b: #3b6fd8; }
      .md.lemon { --bg: #fff1c4; --a: #ffd35c; --b: #d98a12; }
      .md.lilac { --bg: #ece2ff; --a: #c3a6ff; --b: #7a52d6; }
      .md .mi { position: relative; z-index: 1; margin-top: -1.6cqw; background: linear-gradient(150deg, var(--a) 10%, var(--b) 90%);
        filter: drop-shadow(0 .5cqw .5cqw rgba(20, 22, 30, .18)); }
      .gd { position: absolute; left: 50%; top: 66%; width: 9cqw; height: 1.8cqw; translate: -50% 0; border-radius: 50%; background: rgba(20, 22, 30, .12); filter: blur(.35cqw); }
      .md b { position: absolute; left: 1.6cqw; bottom: 1.2cqw; font-size: 2.2cqw; font-weight: 700; color: var(--ink-2); }
      .md.on { box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)), 0 1.4cqw 2.6cqw -1.2cqw rgba(var(--tint), .6); }
      .md.on b { color: rgb(var(--tint)); }
      .run { position: absolute; left: 1.2cqw; top: 1.2cqw; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%; background: rgba(255, 255, 255, .95); color: rgb(var(--tint)); box-shadow: 0 .4cqw 1cqw rgba(20, 22, 30, .18); }
      .ck { position: absolute; right: 1.2cqw; top: 1.2cqw; display: grid; place-items: center; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: var(--grad); color: #fff; }
    `,
  });
})();
