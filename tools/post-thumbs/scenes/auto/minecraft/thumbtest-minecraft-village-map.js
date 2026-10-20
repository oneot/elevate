/* Minecraft — 우리 마을 지도 만들기: 모둠별로 맡은 장소를 지은 공유 월드 + 지역 지도 */
(() => {
  const F = (n) => +n.toFixed(2);
  const V = 1.05;
  const P = (x, y, z) => [x - y, (x + y) / 2 - z * V];
  const BL = {
    grass: ['#8cc75e', '#9a6c45', '#83593a', '#79b54d', '#679c41'],
    road: ['#a9adb2', '#94989d', '#7f8388'],
    path: ['#dcc493', '#c3a979', '#a98f63'],
    plank: ['#dfb87e', '#c9a168', '#ae8855'],
    log: ['#c9a46c', '#80603b', '#6b4e30'],
    leaves: ['#67b64a', '#55a03d', '#488a33'],
    glass: ['#e4f6fd', '#bfe5f5', '#a4d6ec'],
    quartz: ['#f8f6f1', '#e9e4da', '#d7d0c3'],
    brick: ['#d27c63', '#bb6650', '#a35642'],
    awning: ['#f1c75b', '#dcae3f', '#c79a32'],
    water: ['#73c3f2', '#5aaade', '#4b95c6'],
  };

  const iso = (items, o = {}) => {
    const unit = (b) => !(b[4] && (b[4].w || b[4].d || b[4].h));
    const full = new Set(items.filter((b) => Array.isArray(b) && unit(b)).map(([x, y, z]) => `${x},${y},${z}`));
    const has = (x, y, z) => full.has(`${x},${y},${z}`);
    const bb = [Infinity, Infinity, -Infinity, -Infinity];
    const fit = ([a, b]) => { bb[0] = Math.min(bb[0], a); bb[1] = Math.min(bb[1], b); bb[2] = Math.max(bb[2], a); bb[3] = Math.max(bb[3], b); };
    let out = '';
    const poly = (pts, c) => { pts.forEach(fit); out += `<polygon points="${pts.map(([a, b]) => `${F(a)},${F(b)}`).join(' ')}" fill="${c}" stroke="${c}" stroke-width="0.04" stroke-linejoin="round"/>`; };
    const seg = (a, b, c, w = 0.05) => { out += `<path d="M${F(a[0])} ${F(a[1])}L${F(b[0])} ${F(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
    const box = (x, y, z, t, s = {}) => {
      const w = s.w || 1; const d = s.d || 1; const h = s.h || 1;
      const u = !(s.w || s.d || s.h);
      const [cT, cL, cR, bL, bR] = BL[t];
      const top = !u || !has(x, y, z + 1);
      const left = !u || !has(x, y + 1, z);
      const right = !u || !has(x + 1, y, z);
      const band = Math.min(h * 0.3, 0.3);
      if (left) {
        poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], cL);
        if (bL && top) poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x, y + d, z + h - band)], bL);
      }
      if (right) {
        poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], cR);
        if (bR && top) poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x + w, y, z + h - band)], bR);
      }
      if (top) poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], cT);
      if (t === 'glass') {
        if (left) seg(P(x + 0.22, y + d, z + 0.78), P(x + 0.42, y + d, z + 0.5), 'rgba(255,255,255,.95)', 0.08);
        if (right) seg(P(x + w, y + 0.25, z + 0.78), P(x + w, y + 0.45, z + 0.5), 'rgba(255,255,255,.95)', 0.08);
      }
    };
    if (o.ground) {
      const g = o.ground;
      box(0, 0, 0, 'grass', { w: g.w, d: g.d, h: 1 });
      for (let i = 1; i < g.w; i++) seg(P(i, 0, 1), P(i, g.d, 1), 'rgba(30,70,20,.15)', 0.035);
      for (let j = 1; j < g.d; j++) seg(P(0, j, 1), P(g.w, j, 1), 'rgba(30,70,20,.15)', 0.035);
    }
    const key = (b) => (Array.isArray(b) ? b[0] + b[1] + b[2] + ((b[4] && b[4].k) || 0) : b.k);
    items.slice().sort((a, b) => key(a) - key(b) || (Array.isArray(a) && Array.isArray(b) ? a[2] - b[2] : 0)).forEach((b) => {
      if (Array.isArray(b)) box(b[0], b[1], b[2], b[3], b[4] || {});
      else { (b.pts || []).forEach(fit); out += b.svg; }
    });
    const pad = 0.25;
    const vb = [bb[0] - pad, bb[1] - pad, bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2];
    return {
      svg: `<svg class="iso" viewBox="${vb.map(F).join(' ')}">${out}</svg>`,
      at: (x, y, z) => { const [a, b] = P(x, y, z); return `left:${F(((a - vb[0]) / vb[2]) * 100)}%;top:${F(((b - vb[1]) / vb[3]) * 100)}%`; },
    };
  };

  /* top-down zone map: q 학교, b 시장, g 공원, w 하천, r 도로, G 풀밭 */
  const MAP = ['qqqGrbbbbb', 'qqqGrbbbbb', 'qqqGrGGGGG', 'rrrrrrrrrr', 'ggggrGGGGG', 'ggggrGGGGG', 'ggggrwwwww', 'ggggrwwwww'];
  const MPAL = { q: '#efe9dc', b: '#e9b949', g: '#6fb24f', w: '#6fbde9', r: '#a7a196', G: '#cfe3a6' };

  scene('minecraft/thumbtest-minecraft-village-map', (K) => {
    const B = [];
    const add = (x, y, z, t, s) => B.push([x, y, z, t, s]);
    for (let y = 0; y < 8; y++) if (y !== 3) add(4, y, 1, 'road', { h: 0.12 });
    for (let x = 0; x < 10; x++) add(x, 3, 1, 'road', { h: 0.12 });
    // 학교 (1모둠)
    for (let x = 0; x <= 2; x++) {
      for (let y = 0; y <= 2; y++) {
        add(x, y, 1, 'quartz');
        const win = (x === 2 && y < 2) || (y === 2 && x < 2);
        add(x, y, 2, win ? 'glass' : 'quartz');
        add(x, y, 3, 'quartz');
      }
    }
    // 시장 (2모둠): 차양 노점 세 칸
    [5, 7, 9].forEach((x) => {
      add(x, 0, 1, 'plank', { h: 0.6, d: 2 });
      add(x, 0, 1.75, 'awning', { h: 0.3, d: 2, k: 1 });
    });
    // 공원 (3모둠)
    [[0, 5], [2, 7], [3, 4]].forEach(([x, y]) => { add(x, y, 1, 'log'); add(x, y, 2, 'leaves'); });
    add(1, 4, 1, 'leaves'); add(3, 6, 1, 'leaves');
    [[1, 5], [1, 6], [2, 5]].forEach(([x, y]) => add(x, y, 1, 'path', { h: 0.12 }));
    // 하천 (4모둠)
    for (let x = 5; x < 10; x++) for (let y = 6; y < 8; y++) add(x, y, 1, 'water', { h: 0.1 });
    add(6, 5, 1, 'leaves'); add(9, 5, 1, 'leaves');

    const vil = iso(B, { ground: { w: 10, d: 8 } });
    const tag = (n, label, pos, cls = '') => `<span class="tag ${cls}" style="${pos}"><b>${n}</b>${label}</span>`;
    const teams = ['1', '2', '3', '4'].map((t) => K.avatar(t, { s: 3.6 })).join('');
    return K.win({
      x: 3, y: 7, w: 67, h: 52, title: '우리 마을 공유 월드', sub: ' · 4학년 2반',
      barRight: `<span class="team">${teams}</span>`,
      body: `<div class="sky"></div>
        <div class="vil">${vil.svg}
          ${tag(1, '학교', vil.at(1.5, 1.5, 4.3))}
          ${tag(2, '시장', vil.at(7.5, 1, 2.6))}
          ${tag(3, '공원', vil.at(1.5, 6, 2.2))}
          ${tag(4, '하천', vil.at(7.5, 7, 1.2), 'low')}
        </div>`,
    }) + K.card({
      x: 64, y: 16, w: 31.5, cls: 'mapc',
      body: `<p class="mh">${K.ico('map', { s: 2.8 })}<b>우리 지역 지도</b></p>
        <div class="paper">${(() => {
          let r = '';
          MAP.forEach((row, y) => [...row].forEach((ch, x) => { r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${MPAL[ch]}"/>`; }));
          return `<svg viewBox="0 0 10 8" shape-rendering="crispEdges">${r}</svg>`;
        })()}
          <i class="pin">${K.ico('location', { s: 2.6 })}</i>
        </div>
        <p class="cap">4구역 · 모둠별 1곳</p>`,
    }) + K.pill({ right: 4.5, y: 3, icon: 'people_team', text: '함께 짓는 우리 마을', dark: true });
  }, {
    css: `
      .sky { position: absolute; inset: 0; background: linear-gradient(180deg, #b4e0ff 0%, #d9f0ff 58%, #f0f9ff 100%); }
      .iso { display: block; width: 100%; overflow: visible; }
      .team { display: flex; padding-left: .9cqw; }
      .team .avatar { margin-left: -.9cqw; box-shadow: 0 0 0 .3cqw #fff; }
      .vil { position: absolute; left: 3cqw; width: 57cqw; top: 3.4cqw; filter: drop-shadow(0 2cqw 2cqw rgba(var(--tint), .3)); }
      .tag { position: absolute; translate: -50% -100%; display: flex; align-items: center; gap: .8cqw; padding: .55cqw 1.4cqw .55cqw .6cqw; border-radius: 99px; background: #fff; color: var(--ink); font-size: 2.4cqw; font-weight: 700; white-space: nowrap; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(15, 23, 42, .35); }
      .tag b { display: grid; place-items: center; width: 2.9cqw; height: 2.9cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; font-size: 1.85cqw; }
      .tag.low { translate: -50% -40%; }
      .mapc { padding: 2.6cqw 2.6cqw 2.4cqw; }
      .mh { display: flex; align-items: center; gap: 1cqw; font-size: 2.6cqw; color: rgb(var(--tint)); }
      .mh b { color: var(--ink); }
      .paper { position: relative; margin: 1.8cqw 0 1.6cqw; padding: 1.2cqw; border-radius: 1.2cqw; background: #f3e4bd; box-shadow: inset 0 0 0 .4cqw #e2cc94; }
      .paper svg { display: block; width: 100%; border-radius: .4cqw; }
      .pin { position: absolute; left: 19%; top: 14%; translate: -50% -60%; display: grid; place-items: center; color: #e5484d; filter: drop-shadow(0 .3cqw .4cqw rgba(0, 0, 0, .35)); }
      .cap { font-size: 2.1cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
    `,
  });
})();
