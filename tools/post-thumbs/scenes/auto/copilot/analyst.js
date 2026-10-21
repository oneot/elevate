/* copilot/analyst — STEP 3: the Analyst groups students who need small-group support by their weakest rubric item. */
(() => {
  scene('copilot/analyst', (K) => {
    const groups = [
      ['edit', '서술·표현 보충', 4, true],
      ['calculator', '풀이 과정 보충', 3],
      ['lightbulb', '개념 이해 보충', 2],
    ];
    const dots = (n) => Array.from({ length: n }, (_, i) => `<i style="--d:${i}"></i>`).join('');
    const row = ([icon, name, n, on]) => `<div class="gr${on ? ' on hl' : ''}">
      <span class="gi">${K.ico(icon, { s: 2.6 })}</span>
      <b>${name}</b>
      <span class="ds">${dots(n)}</span>
      <span class="ct">${n}명</span>
    </div>`;
    return K.win({
      x: 31, y: 7, w: 65, h: 52, icon: false, title: '분석가', sub: '· 에이전트',
      body: `<div class="an">
        <div class="me">
          <span class="fl">${K.app('excel', { s: 3 })}수행평가_루브릭_점수.xlsx</span>
          ${K.bubble('보충 지도가 필요한 학생들을 묶어줘', { me: true })}
        </div>
        <div class="rs">
          <p class="hd">${K.ico('people_team', { s: 3, c: 'rgb(var(--tint))' })}소그룹 보충 지도</p>
          ${groups.map(row).join('')}
        </div>
      </div>`,
    })
      + K.tile({ x: 26, y: 1.6, s: 10.5 })
      + K.float({ x: 12.5, y: 14, icon: 'data_bar_vertical_star', s: 6.4 })
      + K.pill({ x: 4, bottom: 5, icon: 'people_list', text: '보충 대상 자동 정리' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 8.4cqw; }
      .an { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.4cqw 3.2cqw 0; }
      .me { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2cqw; }
      .fl { display: inline-flex; align-items: center; gap: 1cqw; padding: .8cqw 1.6cqw .8cqw 1cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.1cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .me .bubble { max-width: 100%; font-size: 2.5cqw; font-weight: 650; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: var(--ink); white-space: nowrap; }
      .rs { display: flex; flex-direction: column; gap: 1.1cqw; }
      .hd { display: flex; align-items: center; gap: 1cqw; margin-bottom: .3cqw; font-size: 2.8cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
      .gr { display: flex; align-items: center; gap: 1.6cqw; height: 5.6cqw; padding: 0 2cqw 0 1.2cqw; border-radius: 1.4cqw; background: rgba(255, 255, 255, .9); box-shadow: inset 0 0 0 .2cqw var(--line-2); }
      .gi { flex: none; display: grid; place-items: center; width: 4cqw; height: 4cqw; border-radius: 1.1cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); color: rgb(var(--tint)); }
      .gr b { flex: 1; font-size: 2.6cqw; font-weight: 700; color: var(--ink); white-space: nowrap; }
      .ds { display: flex; }
      .ds i { width: 3.4cqw; height: 3.4cqw; margin-left: -1cqw; border-radius: 50%; border: .3cqw solid #fff; background: color-mix(in srgb, rgb(var(--tint)) calc(28% + var(--d) * 14%), #e9ecf3); }
      .ct { flex: none; min-width: 6cqw; text-align: right; font-size: 2.5cqw; font-weight: 700; color: var(--ink-3); white-space: nowrap; }
      .gr.on { background: color-mix(in srgb, rgb(var(--tint)) 8%, #fff); }
      .gr.on .gi { background: var(--grad); color: #fff; }
      .gr.on b, .gr.on .ct { color: rgb(var(--tint)); }
      .gr.on .ds i { background: var(--grad); }
    `,
  });
})();
