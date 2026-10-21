/* minecraft/minecraftedu4 — 건축 창작 수업: E 아이템 창에서 참나무 판자를 1번 단축 슬롯으로 */
(() => {
  // [top, left, right] faces of a flat isometric block
  const BL = {
    plank: ['#e2bb80', '#cba26a', '#b08a56'],
    stone: ['#c3c7cb', '#a9adb2', '#91959a'],
    brick: ['#d68168', '#bd6752', '#a35642'],
    glass: ['#e8f7fd', '#c4e7f6', '#a8d8ed'],
    quartz: ['#faf8f3', '#e9e4da', '#d5cec1'],
    log: ['#cfa86f', '#80603b', '#6b4e30'],
    leaves: ['#6cbb4e', '#57a23f', '#478932'],
    grass: ['#8cc75e', '#9a6c45', '#83593a'],
    sand: ['#efe0a8', '#dcc98c', '#c7b276'],
    cobble: ['#a8acb1', '#8e9298', '#777b81'],
    wred: ['#ef6b5e', '#d6574b', '#bb473d'],
    wyel: ['#ffd25a', '#eebd3f', '#d6a52c'],
    wblu: ['#5aa7ee', '#468fd6', '#3879bb'],
    water: ['#79c8f4', '#5caee0', '#4b97c8'],
    dark: ['#7a5a3a', '#634829', '#523b21'],
    lamp: ['#ffe9a6', '#f4cf6a', '#dcb24c'],
  };
  const cube = (t) => {
    const [a, b, c] = BL[t];
    let x = '';
    if (t === 'plank' || t === 'dark') x = '<path d="M1 11 L10 15.5 L19 11" fill="none" stroke="rgba(90,55,20,.32)" stroke-width=".7"/>';
    if (t === 'glass') x = '<path d="M3.4 9 L6 12.4 M12.6 15.6 L15.6 11.4" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>';
    if (t === 'grass') x = '<path d="M1 5.5 L10 10 L19 5.5 L19 8 L10 12.5 L1 8 Z" fill="#79b54d"/>';
    return `<svg class="cb" viewBox="0 0 20 22"><path d="M10 1 L19 5.5 L10 10 L1 5.5 Z" fill="${a}"/><path d="M1 5.5 L10 10 L10 21 L1 16.5 Z" fill="${b}"/><path d="M10 10 L19 5.5 L19 16.5 L10 21 Z" fill="${c}"/>${x}</svg>`;
  };

  scene('minecraft/minecraftedu4', (K) => {
    const grid = ['stone', 'cobble', 'plank', 'dark', 'brick', 'quartz', 'glass', 'log',
      'grass', 'sand', 'leaves', 'wred', 'wyel', 'wblu', 'water', 'lamp'];
    const cells = grid.map((t) => `<span class="cell${t === 'plank' ? ' pick' : ''}">${cube(t)}${t === 'plank' ? '<b class="tip">참나무 판자</b>' : ''}</span>`).join('');
    const hot = ['plank', 'glass', 'brick', '', '', '', '', ''];
    const slots = hot.map((t, i) => `<span class="slot${i ? '' : ' on'}">${t ? cube(t) : ''}<i class="no">${i + 1}</i></span>`).join('');
    const tabs = `<span class="tab on">${K.ico('cube', { s: 2.6 })}건축</span>
      <span class="tab">${K.ico('wrench', { s: 2.6 })}</span>
      <span class="tab">${K.ico('backpack', { s: 2.6 })}</span>
      <span class="tab">${K.ico('leaf_one', { s: 2.6 })}</span>
      <span class="find">${K.ico('search:r', { s: 2.4 })}${K.skel('9cqw', { h: 1.4 })}</span>`;
    return K.win({
      x: 5, y: 10, w: 66, h: 50, title: '아이템 창', icon: false,
      barRight: `<span class="key">E</span>`,
      body: `<div class="inv">
          <div class="tabs">${tabs}</div>
          <div class="grid">${cells}</div>
          <div class="hot">${slots}</div>
        </div>`,
    })
      + K.wires(K.curve(26.6, 32.4, 12.4, 45, { bend: 'v', dash: '1.1 .9', w: 0.5, dot: true, dotR: 0.7 }), { z: 4 })
      + K.cursor({ x: 13.4, y: 48.2 })
      + K.tile({ x: 2, y: 5, s: 10.5 })
      + K.float({ x: 75, y: 37, icon: 'tap_single' })
      + K.pill({ right: 3.6, y: 3.4, icon: 'cube', text: '자주 쓰는 블록 바로 꺼내기' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 11.4cqw; font-size: 2.8cqw; }
      .key { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: .9cqw; background: #fff; color: var(--ink); font-size: 2.5cqw; font-weight: 800; box-shadow: inset 0 -.4cqw 0 #c9cdd3, 0 0 0 .18cqw #b9bec5; }
      .inv { position: absolute; inset: 0; padding: 2.2cqw 3.1cqw 0; background: rgba(243, 245, 240, .72); }
      .tabs { display: flex; align-items: center; gap: 1cqw; height: 4.8cqw; }
      .tab { display: flex; align-items: center; justify-content: center; gap: .8cqw; min-width: 5.2cqw; height: 4.8cqw; padding: 0 1.2cqw; border-radius: 1cqw; background: rgba(255, 255, 255, .7); color: var(--ink-4); font-size: 2.6cqw; font-weight: 700; box-shadow: inset 0 0 0 .18cqw var(--line); }
      .tab.on { background: var(--grad); color: #fff; box-shadow: none; padding: 0 1.8cqw; }
      .find { margin-left: auto; display: flex; align-items: center; gap: 1cqw; height: 4.8cqw; padding: 0 1.6cqw; border-radius: 99px; background: #fff; color: var(--ink-4); box-shadow: inset 0 0 0 .18cqw var(--line); }
      .grid { margin-top: 1.6cqw; display: grid; grid-template-columns: repeat(8, 6.6cqw); gap: 1cqw; }
      .cell, .slot { position: relative; display: grid; place-items: center; width: 6.6cqw; height: 6.6cqw; border-radius: 1cqw; background: #fff; box-shadow: inset 0 0 0 .18cqw var(--line); }
      .cb { width: 4.1cqw; display: block; }
      .slot .cb { width: 3.7cqw; translate: .5cqw .6cqw; }
      .cell.pick { box-shadow: inset 0 0 0 .4cqw rgb(var(--tint)), 0 0 0 .7cqw color-mix(in srgb, rgb(var(--tint)) 22%, transparent); z-index: 2; }
      .tip { position: absolute; left: calc(100% + .2cqw); top: 50%; translate: 0 -50%; padding: .7cqw 1.4cqw; border-radius: .9cqw; background: #1f2226; color: #fff; font-size: 2.4cqw; font-weight: 700; white-space: nowrap; box-shadow: 0 .8cqw 1.6cqw -.6cqw rgba(0, 0, 0, .4); }
      .hot { margin: 4cqw -1cqw 0; display: grid; grid-template-columns: repeat(8, 6.6cqw); gap: 1cqw; padding: 1cqw; border-radius: 1.6cqw; background: rgba(32, 35, 40, .9); width: max-content; }
      .slot { background: rgba(255, 255, 255, .1); box-shadow: inset 0 0 0 .18cqw rgba(255, 255, 255, .14); }
      .slot.on { background: rgba(255, 255, 255, .22); box-shadow: inset 0 0 0 .42cqw #fff, 0 0 0 .5cqw rgba(var(--tint), .7); }
      .no { position: absolute; left: .5cqw; top: .2cqw; font-style: normal; font-size: 1.9cqw; font-weight: 800; color: rgba(255, 255, 255, .75); }
      .slot.on .no { color: #fff; }
    `,
  });
})();
