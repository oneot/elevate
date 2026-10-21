/* minecraft/minecraftedu3 — 새로운 월드 만들기: 평면 월드 선택 + 수업용 기본 설정 (v3) */
(() => {
  const F = (n) => +n.toFixed(2);
  const P = (x, y, z) => [x - y, (x + y) / 2 - z * 1.05];
  const BL = {
    grass: ['#8cc75e', '#9a6c45', '#83593a', '#79b54d', '#679c41'],
    plank: ['#dfb87e', '#c9a168', '#ae8855'],
    brick: ['#d27c63', '#bb6650', '#a35642'],
    glass: ['#e4f6fd', '#bfe5f5', '#a4d6ec'],
    leaves: ['#67b64a', '#55a03d', '#488a33'],
    log: ['#c9a46c', '#80603b', '#6b4e30'],
  };

  /** Small isometric diorama: ground slab + boxes [x, y, z, type, {w, d, h}]. */
  const iso = (items, g) => {
    const bb = [Infinity, Infinity, -Infinity, -Infinity];
    let out = '';
    const poly = (pts, c) => {
      pts.forEach(([a, b]) => { bb[0] = Math.min(bb[0], a); bb[1] = Math.min(bb[1], b); bb[2] = Math.max(bb[2], a); bb[3] = Math.max(bb[3], b); });
      out += `<polygon points="${pts.map(([a, b]) => `${F(a)},${F(b)}`).join(' ')}" fill="${c}" stroke="${c}" stroke-width=".04" stroke-linejoin="round"/>`;
    };
    const seg = (a, b, c) => { out += `<path d="M${F(a[0])} ${F(a[1])}L${F(b[0])} ${F(b[1])}" stroke="${c}" stroke-width=".035"/>`; };
    const box = (x, y, z, t, s = {}) => {
      const w = s.w || 1; const d = s.d || 1; const h = s.h || 1;
      const [cT, cL, cR, bL, bR] = BL[t];
      const band = Math.min(h * 0.3, 0.3);
      poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], cL);
      if (bL) poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x, y + d, z + h - band)], bL);
      poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], cR);
      if (bR) poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x + w, y, z + h - band)], bR);
      poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], cT);
    };
    box(0, 0, 0, 'grass', { w: g.w, d: g.d, h: g.h });
    for (let i = 1; i < g.w; i++) seg(P(i, 0, g.h), P(i, g.d, g.h), 'rgba(30,70,20,.18)');
    for (let j = 1; j < g.d; j++) seg(P(0, j, g.h), P(g.w, j, g.h), 'rgba(30,70,20,.18)');
    items.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2])).forEach((b) => box(...b));
    const pad = 0.2;
    return `<svg class="iso" viewBox="${[bb[0] - pad, bb[1] - pad, bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2].map(F).join(' ')}">${out}</svg>`;
  };

  /** Side-view blocky hills (infinite world preview). */
  const hills = (hs, top, side) => {
    const H = Math.max(...hs);
    const r = hs.map((h, x) => `<rect x="${x}" y="${H - h}" width="1.03" height="${h}" fill="${side}"/><rect x="${x}" y="${H - h}" width="1.03" height=".6" fill="${top}"/>`).join('');
    return `<svg class="hills" viewBox="0 0 ${hs.length} ${H}" preserveAspectRatio="none" shape-rendering="crispEdges">${r}</svg>`;
  };

  scene('minecraft/minecraftedu3', (K) => {
    const z1 = 0.6;
    const B = [];
    // a small student build on the flat plot
    B.push([2, 2, z1, 'plank', { w: 2, d: 2, h: 1.7 }]);
    B.push([1.85, 1.85, z1 + 1.7, 'brick', { w: 2.3, d: 2.3, h: 0.5 }]);
    B.push([2.5, 4, z1 + 0.6, 'glass', { w: 1, d: 0.04, h: 0.7 }]);
    B.push([4, 2.5, z1 + 0.6, 'glass', { w: 0.04, d: 1, h: 0.7 }]);
    B.push([0, 5, z1, 'leaves'], [5, 0, z1, 'leaves'], [0, 0, z1, 'log'], [0, 0, z1 + 1, 'leaves']);
    const flat = iso(B, { w: 6, d: 6, h: z1 });
    const far = hills([6, 6, 7, 8, 9, 9, 8, 7, 7, 8, 10, 11, 11, 10, 9, 8], '#9fd07f', '#b5dba0');
    const near = hills([4, 4, 5, 5, 4, 3, 3, 4, 5, 6, 6, 5, 4, 4, 5, 5], '#7dbb51', '#9a6c45');
    const tab = (icon, label, on) => `<div class="tb${on ? ' on' : ''}">${K.ico(icon, { s: 2.6 })}<span>${label}</span></div>`;
    const opt = (cls, art, label, on) => `<div class="op ${cls}${on ? ' hl' : ''}"><div class="pv">${art}</div><p>${on ? `<i class="ck">${K.ico('checkmark', { s: 1.9 })}</i>` : ''}${label}</p></div>`;
    const row = (label, val) => `<div class="sr"><span>${label}</span><b>${val}${K.ico('chevron_down', { s: 2.2 })}</b></div>`;
    return K.win({
      x: 31, y: 9.5, w: 65, h: 50, title: '새로운 월드 만들기', icon: false,
      barRight: K.btn('생성', { primary: true, icon: 'play' }),
      body: `<div class="wb">
          <nav class="nv">${tab('globe', '일반', true)}${tab('hat_graduation', '클래스룸')}${tab('settings', '고급')}</nav>
          <div class="mn">
            <div class="ops">
              ${opt('fl', flat, '평면', true)}
              ${opt('inf', `<div class="sky">${far}${near}</div>`, '무한')}
            </div>
            ${row('게임 모드', '크리에이티브')}
            ${row('난이도', '평화로움')}
          </div>
        </div>`,
    })
      + K.tile({ x: 26.6, y: 4.2, s: 10.5 })
      + K.float({ x: 15, y: 13, app: 'onedrive' })
      + K.pill({ x: 4, bottom: 5, icon: 'grid', text: '평면 월드로 수업 준비' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 10cqw; }
      .win__bar .btn { height: 4.8cqw; padding: 0 2.2cqw; font-size: 2.5cqw; }
      .wb { position: absolute; inset: 0; display: grid; grid-template-columns: 14.5cqw 1fr; }
      .nv { display: flex; flex-direction: column; gap: .8cqw; padding: 2.8cqw 1.4cqw; background: rgba(243, 245, 240, .75); border-right: .15cqw solid var(--line); }
      .tb { display: flex; align-items: center; gap: 1cqw; height: 5cqw; padding: 0 1.3cqw; border-radius: 1.1cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .tb .ico { color: var(--ink-4); }
      .tb.on { background: #fff; color: var(--ink); font-weight: 700; box-shadow: 0 0 0 .2cqw var(--line), 0 .8cqw 1.6cqw -1cqw rgba(15, 23, 42, .25); }
      .tb.on .ico { color: rgb(var(--tint)); }
      .mn { display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.8cqw 3cqw; }
      .ops { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4cqw; margin-bottom: 1cqw; }
      .op { display: flex; flex-direction: column; gap: 1cqw; padding: 1cqw 1cqw 1.2cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line); }
      .pv { position: relative; height: 14.5cqw; overflow: hidden; border-radius: 1.1cqw; display: grid; place-items: center; background: linear-gradient(180deg, #c4e7ff, #eef8ff); }
      .fl .iso { width: 17.5cqw; margin-top: .6cqw; }
      .sky { position: absolute; inset: 0; background: linear-gradient(180deg, #c4e7ff, #eef8ff); }
      .hills { position: absolute; left: 0; bottom: 0; width: 100%; height: 72%; }
      .hills + .hills { height: 36%; }
      .op p { display: flex; align-items: center; gap: .9cqw; padding-left: .6cqw; font-size: 2.7cqw; font-weight: 700; color: var(--ink-2); }
      .op.hl p { color: rgb(var(--tint)); }
      .ck { display: grid; place-items: center; width: 3cqw; height: 3cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .sr { display: flex; align-items: center; justify-content: space-between; height: 5.6cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; background: rgba(243, 245, 240, .85); font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .sr b { display: flex; align-items: center; gap: .8cqw; font-size: 2.6cqw; font-weight: 700; color: var(--ink); }
      .sr b .ico { color: var(--ink-4); }
    `,
  });
})();
