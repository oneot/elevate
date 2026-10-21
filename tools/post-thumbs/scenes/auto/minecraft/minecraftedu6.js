/* minecraft/minecraftedu6 — 명령어와 코딩 수업하기 (v3): MakeCode 모양 블록 → 유리 돔 */
(() => {
  const F = (n) => +n.toFixed(2);
  const P = (x, y, z) => [x - y, (x + y) / 2 - z * 1.05];
  const BL = {
    grass: ['#8cc75e', '#9a6c45', '#83593a'],
    glass: ['#dff4fd', '#b4dff2', '#94cde6'],
    rim: ['#f8f6f1', '#e2ddd2', '#cfc7b8'],
  };

  /** Small isometric diorama: grass plate + unit cubes, painter-sorted. */
  const iso = (cubes, gw, gd) => {
    const bb = [Infinity, Infinity, -Infinity, -Infinity];
    const fit = ([a, b]) => { bb[0] = Math.min(bb[0], a); bb[1] = Math.min(bb[1], b); bb[2] = Math.max(bb[2], a); bb[3] = Math.max(bb[3], b); };
    let out = '';
    const poly = (pts, c) => { pts.forEach(fit); out += `<polygon points="${pts.map(([a, b]) => `${F(a)},${F(b)}`).join(' ')}" fill="${c}" stroke="${c}" stroke-width=".04" stroke-linejoin="round"/>`; };
    const set = new Set(cubes.map(([x, y, z]) => `${x},${y},${z}`));
    const has = (x, y, z) => set.has(`${x},${y},${z}`);
    const box = (x, y, z, t, w = 1, d = 1, h = 1, solo = false) => {
      const [cT, cL, cR] = BL[t];
      if (solo || !has(x, y + 1, z)) poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], cL);
      if (solo || !has(x + 1, y, z)) poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], cR);
      if (solo || !has(x, y, z + 1)) poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], cT);
      if (t === 'glass' && !has(x + 1, y, z)) out += `<path d="M${F(P(x + 1, y + 0.25, z + 0.78)[0])} ${F(P(x + 1, y + 0.25, z + 0.78)[1])}L${F(P(x + 1, y + 0.45, z + 0.5)[0])} ${F(P(x + 1, y + 0.45, z + 0.5)[1])}" stroke="rgba(255,255,255,.95)" stroke-width=".08" stroke-linecap="round"/>`;
    };
    box(0, 0, 0, 'grass', gw, gd, 1, true);
    for (let i = 1; i < gw; i++) out += `<path d="M${F(P(i, 0, 1)[0])} ${F(P(i, 0, 1)[1])}L${F(P(i, gd, 1)[0])} ${F(P(i, gd, 1)[1])}" stroke="rgba(30,70,20,.15)" stroke-width=".035"/>`;
    for (let j = 1; j < gd; j++) out += `<path d="M${F(P(0, j, 1)[0])} ${F(P(0, j, 1)[1])}L${F(P(gw, j, 1)[0])} ${F(P(gw, j, 1)[1])}" stroke="rgba(30,70,20,.15)" stroke-width=".035"/>`;
    cubes.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]) || a[2] - b[2]).forEach(([x, y, z, t]) => box(x, y, z, t));
    const pad = 0.2;
    return `<svg class="iso" viewBox="${[bb[0] - pad, bb[1] - pad, bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2].map(F).join(' ')}">${out}</svg>`;
  };

  scene('minecraft/minecraftedu6', (K) => {
    // Hollow glass dome (radius 4) centred on a 11×11 plot.
    const C = [];
    const r = 4.6; const cx = 5; const cy = 5;
    for (let x = 0; x < 11; x++) {
      for (let y = 0; y < 11; y++) {
        for (let z = 0; z <= 5; z++) {
          const d = Math.hypot(x - cx, y - cy, z * 0.95);
          if (d <= r) C.push([x, y, z + 1, 'glass']);
          else if (z === 0 && d <= r + 1) C.push([x, y, 1, 'rim']);
        }
      }
    }
    const dome = iso(C, 11, 11);
    const axis = `<svg class="ax" viewBox="0 0 20 20"><g stroke-width="1.3" stroke-linecap="round" fill="none">
        <path d="M6 13 L17 13" stroke="#e5484d"/><path d="M6 13 L6 2" stroke="#3fa34d"/><path d="M6 13 L1.5 18" stroke="#2f7fe0"/></g></svg>`;
    const v = (t, cls = '') => `<span class="v ${cls}">${t}</span>`;
    const cats = [['모양', '#7a5cd6', 1], ['', '#7cc35a'], ['', '#e0612f'], ['', '#4c97ff']];
    return K.win({
      x: 33, y: 9, w: 66, h: 50, title: 'MakeCode', icon: false,
      barRight: `<span class="run">${K.ico('play', { s: 2.6 })}</span>`,
      body: `<div class="cb">
          <div class="tools">${cats.map(([n, c, on]) => `<div class="cat${on ? ' on' : ''}"><i style="background:${c}"></i>${n || K.skel('70%', { h: 1.6 })}</div>`).join('')}</div>
          <div class="canvas">
            <div class="blk hat">채팅 명령어 ${v('"dome"')}</div>
            <div class="blk sh hl2">
              <div class="l1">구 만들기 ${v('유리', 'gl')}</div>
              <div class="l2">중심 ${v('~0 ~0 ~0', 'xyz')}</div>
              <div class="l2">반지름 ${v('4')}</div>
            </div>
            <div class="gz">${axis}<b class="gx">X</b><b class="gy">Y</b><b class="gzz">Z</b></div>
          </div>
        </div>`,
    })
      + K.card({ x: 3.5, y: 16, w: 31.5, cls: 'res', body: dome })
      + K.tile({ x: 28.5, y: 3.6, s: 10 })
      + K.float({ x: 13, y: 5, s: 7.2, text: 'C', square: true })
      + K.pill({ x: 3.5, bottom: 3.8, icon: 'shapes', text: '모양 블록으로 뚝딱 건축', tint: true });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 1 },
    css: `
      .win__bar { padding-left: 9.5cqw; }
      .run { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .cb { position: absolute; inset: 0; display: grid; grid-template-columns: 16cqw 1fr; }
      .tools { display: flex; flex-direction: column; gap: .6cqw; padding: 2.6cqw 1.2cqw; background: rgba(246, 247, 249, .8); border-right: .2cqw solid var(--line); }
      .cat { display: flex; align-items: center; gap: 1.1cqw; height: 5cqw; padding: 0 1.2cqw; border-radius: 1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
      .cat i { width: 2.2cqw; height: 2.2cqw; border-radius: 50%; flex: none; }
      .cat.on { background: #fff; color: var(--ink); font-weight: 750; box-shadow: 0 0 0 .25cqw #7a5cd6; }
      .canvas { position: relative; display: flex; flex-direction: column; align-items: flex-start; padding: 3cqw 2.8cqw; background-color: rgba(255, 255, 255, .85); background-image: radial-gradient(#dfe3e8 .18cqw, transparent .2cqw); background-size: 2.6cqw 2.6cqw; }
      .blk { display: flex; align-items: center; gap: 1cqw; padding: 0 1.8cqw; border-radius: .9cqw; color: #fff; font-size: 2.9cqw; font-weight: 750; white-space: nowrap; box-shadow: inset 0 -.4cqw 0 rgba(0, 0, 0, .14); }
      .blk.hat { height: 6.2cqw; background: #4c97ff; border-radius: 2.6cqw 2.6cqw .9cqw .9cqw; }
      .blk.sh { flex-direction: column; align-items: flex-start; gap: 1.1cqw; margin: .4cqw 0 0 2.4cqw; padding: 1.5cqw 2cqw 1.8cqw; background: #7a5cd6; box-shadow: inset 0 -.4cqw 0 rgba(0, 0, 0, .16), 0 0 0 .45cqw #fff, 0 0 0 .8cqw rgba(122, 92, 214, .45), 0 1.6cqw 3cqw -1cqw rgba(60, 30, 140, .35); }
      .l1, .l2 { display: flex; align-items: center; gap: 1.1cqw; }
      .l2 { font-size: 2.6cqw; font-weight: 650; padding-left: 1.2cqw; }
      .v { display: inline-grid; place-items: center; min-width: 4cqw; height: 4.2cqw; padding: 0 1.2cqw; border-radius: 99px; background: #fff; color: var(--ink); font-size: 2.4cqw; font-weight: 700; }
      .v.gl { background: #dff4fd; color: #1f6f92; border-radius: .7cqw; }
      .v.xyz { font-family: var(--mono); font-size: 2.3cqw; color: #6a46c9; }
      .gz { position: absolute; right: 4.4cqw; bottom: 5.6cqw; width: 12cqw; height: 12cqw; }
      .ax { position: absolute; inset: 0; width: 100%; height: 100%; }
      .gz b { position: absolute; font-family: var(--mono); font-size: 2.4cqw; font-weight: 800; }
      .gx { right: -1.2cqw; top: 6.4cqw; color: #e5484d; }
      .gy { left: 2.4cqw; top: -2.6cqw; color: #3fa34d; }
      .gzz { left: -1.4cqw; bottom: -1.6cqw; color: #2f7fe0; }
      .res { z-index: 3; padding: 2.6cqw 2.4cqw 2.8cqw; background: linear-gradient(180deg, rgba(196, 231, 255, .92), rgba(238, 248, 255, .92)); }
      .res .iso { display: block; width: 100%; }
    `,
  });
})();
