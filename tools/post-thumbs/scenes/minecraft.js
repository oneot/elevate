/* Minecraft scenes — see STYLE_GUIDE.md */
(() => {
  /* ===================== shared voxel / pixel helpers ===================== */
  const F = (n) => +n.toFixed(2);
  const V = 1.05;
  const P = (x, y, z) => [x - y, (x + y) / 2 - z * V];
  // [top, left(+y), right(+x), grass band left, grass band right] — own flat palette
  const BL = {
    grass: ['#8cc75e', '#9a6c45', '#83593a', '#79b54d', '#679c41'],
    stone: ['#c3c7cb', '#a9adb2', '#91959a'],
    road: ['#a9adb2', '#94989d', '#7f8388'],
    path: ['#dcc493', '#c3a979', '#a98f63'],
    plank: ['#dfb87e', '#c9a168', '#ae8855'],
    log: ['#c9a46c', '#80603b', '#6b4e30'],
    leaves: ['#67b64a', '#55a03d', '#488a33'],
    glass: ['#e4f6fd', '#bfe5f5', '#a4d6ec'],
    quartz: ['#f8f6f1', '#e9e4da', '#d7d0c3'],
    brick: ['#d27c63', '#bb6650', '#a35642'],
    solar: ['#3d5c9a', '#5d6b80', '#4d596b'],
    water: ['#73c3f2', '#5aaade', '#4b95c6'],
    agent: ['#d9dee4', '#bcc3cc', '#a3abb5'],
  };

  /** Isometric diorama. items: [x, y, z, type, {w, d, h, k}] boxes or {k, svg, pts} drawings. */
  const iso = (items, o = {}) => {
    const unit = (b) => !(b[4] && (b[4].w || b[4].d || b[4].h));
    const full = new Set(items.filter((b) => Array.isArray(b) && unit(b)).map(([x, y, z]) => `${x},${y},${z}`));
    const has = (x, y, z) => full.has(`${x},${y},${z}`);
    const seam = new Set(o.seam || []);
    const bb = [Infinity, Infinity, -Infinity, -Infinity];
    const fit = ([a, b]) => { bb[0] = Math.min(bb[0], a); bb[1] = Math.min(bb[1], b); bb[2] = Math.max(bb[2], a); bb[3] = Math.max(bb[3], b); };
    let out = '';
    const poly = (pts, c, sc) => { pts.forEach(fit); out += `<polygon points="${pts.map(([a, b]) => `${F(a)},${F(b)}`).join(' ')}" fill="${c}" stroke="${sc || c}" stroke-width="${sc ? 0.05 : 0.04}" stroke-linejoin="round"/>`; };
    const seg = (a, b, c, w = 0.05) => { out += `<path d="M${F(a[0])} ${F(a[1])}L${F(b[0])} ${F(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
    const box = (x, y, z, t, s = {}) => {
      const w = s.w || 1; const d = s.d || 1; const h = s.h || 1;
      const u = !(s.w || s.d || s.h);
      const [cT, cL, cR, bL, bR] = BL[t];
      const sc = seam.has(t) ? 'rgba(45,50,58,.2)' : null;
      const top = !u || !has(x, y, z + 1);
      const left = !u || !has(x, y + 1, z);
      const right = !u || !has(x + 1, y, z);
      const band = Math.min(h * 0.3, 0.3);
      if (left) {
        poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], cL, sc);
        if (bL && top) poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x, y + d, z + h - band)], bL);
      }
      if (right) {
        poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], cR, sc);
        if (bR && top) poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - band), P(x + w, y, z + h - band)], bR);
      }
      if (top) poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], cT, sc);
      if (t === 'plank') {
        if (left) seg(P(x, y + d, z + h / 2), P(x + w, y + d, z + h / 2), 'rgba(110,70,30,.3)', 0.045);
        if (right) seg(P(x + w, y, z + h / 2), P(x + w, y + d, z + h / 2), 'rgba(110,70,30,.3)', 0.045);
      }
      if (t === 'glass') {
        if (left) seg(P(x + 0.22, y + d, z + 0.78), P(x + 0.42, y + d, z + 0.5), 'rgba(255,255,255,.95)', 0.08);
        if (right) seg(P(x + w, y + 0.25, z + 0.78), P(x + w, y + 0.45, z + 0.5), 'rgba(255,255,255,.95)', 0.08);
      }
      if (t === 'solar' && top) {
        const zt = z + h;
        [1 / 3, 2 / 3].forEach((f) => seg(P(x + f * w, y, zt), P(x + f * w, y + d, zt), 'rgba(255,255,255,.5)', 0.035));
        seg(P(x, y + d / 2, zt), P(x + w, y + d / 2, zt), 'rgba(255,255,255,.5)', 0.035);
      }
      if (t === 'agent') {
        const sx = x + w;
        poly([P(sx, y + 0.14, z + 0.86), P(sx, y + 0.86, z + 0.86), P(sx, y + 0.86, z + 0.22), P(sx, y + 0.14, z + 0.22)], '#2b3443');
        [[0.27, 0.41], [0.59, 0.73]].forEach(([a, b]) => poly([P(sx, y + a, z + 0.68), P(sx, y + b, z + 0.68), P(sx, y + b, z + 0.46), P(sx, y + a, z + 0.46)], '#7fe6ff'));
      }
    };
    if (o.ground) {
      const g = o.ground; const gh = g.h || 1;
      box(0, 0, 0, g.t || 'grass', { w: g.w, d: g.d, h: gh });
      if (g.grid) {
        for (let i = 1; i < g.w; i++) seg(P(i, 0, gh), P(i, g.d, gh), 'rgba(30,70,20,.17)', 0.035);
        for (let j = 1; j < g.d; j++) seg(P(0, j, gh), P(g.w, j, gh), 'rgba(30,70,20,.17)', 0.035);
      }
    }
    const key = (b) => (Array.isArray(b) ? b[0] + b[1] + b[2] + ((b[4] && b[4].k) || 0) : b.k);
    items.slice().sort((a, b) => key(a) - key(b) || (Array.isArray(a) && Array.isArray(b) ? a[2] - b[2] : 0)).forEach((b) => {
      if (Array.isArray(b)) box(b[0], b[1], b[2], b[3], b[4] || {});
      else { (b.pts || []).forEach(fit); out += b.svg; }
    });
    const pad = o.pad ?? 0.25;
    const vb = [bb[0] - pad, bb[1] - pad, bb[2] - bb[0] + pad * 2, bb[3] - bb[1] + pad * 2];
    return {
      svg: `<svg class="iso" viewBox="${vb.map(F).join(' ')}">${out}</svg>`,
      at: (x, y, z) => { const [a, b] = P(x, y, z); return `left:${F(((a - vb[0]) / vb[2]) * 100)}%;top:${F(((b - vb[1]) / vb[3]) * 100)}%`; },
    };
  };
  const cube = (t) => iso([[0, 0, 0, t]], { pad: 0.06 }).svg;

  /** Wind turbine standing on cell (x, y) at height z. */
  const turbine = (x, y, z, hgt = 4) => {
    const hub = P(x + 0.5, y + 0.5, z + hgt);
    const tips = [-90, 30, 150].map((deg) => { const r = (deg * Math.PI) / 180; return [hub[0] + Math.cos(r) * 1.45, hub[1] + Math.sin(r) * 1.45]; });
    let svg = '';
    tips.forEach(([a, b]) => { svg += `<path d="M${F(hub[0])} ${F(hub[1])}L${F(a)} ${F(b)}" stroke="#bdb9ae" stroke-width=".3" stroke-linecap="round"/><path d="M${F(hub[0])} ${F(hub[1])}L${F(a)} ${F(b)}" stroke="#fbfaf6" stroke-width=".18" stroke-linecap="round"/>`; });
    svg += `<circle cx="${F(hub[0])}" cy="${F(hub[1])}" r=".2" fill="#d9d5ca"/>`;
    return [[x + 0.4, y + 0.4, z, 'quartz', { w: 0.2, d: 0.2, h: hgt, k: 0.2 }], { k: x + y + z + 0.7, svg, pts: [...tips, hub] }];
  };
  /** Goal flag on cell (x, y) at height z. */
  const flag = (x, y, z, c = '#e5484d') => {
    const b = P(x + 0.5, y + 0.5, z); const t = P(x + 0.5, y + 0.5, z + 1.9);
    const svg = `<path d="M${F(b[0])} ${F(b[1])}L${F(t[0])} ${F(t[1])}" stroke="#6b5b4a" stroke-width=".1" stroke-linecap="round"/><path d="M${F(t[0])} ${F(t[1])}L${F(t[0] + 1)} ${F(t[1] + 0.32)}L${F(t[0])} ${F(t[1] + 0.66)}Z" fill="${c}"/>`;
    return { k: x + y + z + 0.5, svg, pts: [b, t, [t[0] + 1, t[1] + 0.32]] };
  };

  /** Pixel art: rows of palette chars ('.' = transparent). */
  const pix = (rows, pal, cls = '') => {
    const h = rows.length; const w = Math.max(...rows.map((r) => r.length));
    let r = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        let n = 1;
        while (row[x + n] === row[x]) n += 1;
        if (pal[row[x]]) r += `<rect x="${x}" y="${y}" width="${n}" height="1.02" fill="${pal[row[x]]}"/>`;
        x += n;
      }
    });
    return `<svg class="px ${cls}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${r}</svg>`;
  };
  /** Side-view blocky hills for title screens. */
  const hills = (hs, pal, cls = '') => {
    const n = hs.length; const H = Math.max(...hs);
    let r = '';
    hs.forEach((h, x) => { r += `<rect x="${x}" y="${H - h}" width="1.03" height="${h}" fill="${pal[1]}"/><rect x="${x}" y="${H - h}" width="1.03" height=".5" fill="${pal[0]}"/>`; });
    return `<svg class="hills ${cls}" viewBox="0 0 ${n} ${H}" preserveAspectRatio="none" shape-rendering="crispEdges">${r}</svg>`;
  };
  const FAR = [9, 9, 10, 10, 11, 11, 11, 10, 10, 9, 9, 9, 10, 11, 12, 12, 11, 11, 10, 10, 10, 11, 11, 12, 12, 12, 11, 10, 10, 9, 9, 10];
  const NEAR = [5, 5, 5, 6, 6, 6, 6, 5, 5, 5, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 5, 5, 5, 5, 4, 4, 5, 5, 6, 6, 6, 5];

  const ART = {
    apple: [['....b....', '....bgg..', '.rrrbrrr.', 'rrwrrrrrr', 'rwrrrrrrr', 'rrrrrrrrd', 'rrrrrrrrd', '.rrrrrrd.', '..rrdrd..'], { r: '#e5483f', d: '#b9312b', w: '#ffb3a6', b: '#6b4a2b', g: '#5fae45' }],
    gem: [['..ccccc..', '.cwwcccd.', 'cwcccccdd', 'ccccccddd', '.cccccdd.', '..cccdd..', '...cdd...', '....d....'], { c: '#4fd1de', w: '#d2f8fb', d: '#2a9fb2' }],
    tree: [['..ggGgg..', '.gggggGg.', 'gGgggggGg', 'gggGggggg', '.gggggGg.', '..ggggg..', '....t....', '....t....', '...ttt...'], { g: '#5cb043', G: '#3f8f30', t: '#8a5a32' }],
    cookie: [['..kkkkk..', '.kkdkkkk.', 'kkkkkkdkk', 'kdkkkkkkk', 'kkkkdkkkk', 'kkkkkkkdk', '.kdkkkkk.', '..kkkkk..'], { k: '#d9a061', d: '#6b4426' }],
    hero: [[
      '..hhhhhhhh..', '..hhhhhhhh..', '..hssssssh..', '..ssssssss..', '..sWEssEWs..', '..ssssssss..', '..sssmmsss..', '..ssssssss..',
      'aattttttttaa', 'aattTTttttaa', 'aattttttttaa', 'aattttttttaa', 'ssttttttttss', 'ssttttttttss',
      '..ppppPppp..', '..ppppPppp..', '..ppppPppp..', '..ppppPppp..', '..ppppPppp..', '..kkkkkkkk..',
    ], { h: '#5a3c22', s: '#eab58f', W: '#ffffff', E: '#3b2c26', m: '#b5715a', a: '#3f7a2a', t: '#4f9a33', T: '#7cc35a', p: '#3c4a6b', P: '#323e5b', k: '#4a4a4a' }],
    face: [[
      '...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hssssssssh.', '.hsEssssEsh.', '.hssssssssh.',
      '.hpssssssph.', '..ssmssmss..', '..sssmmsss..', '...ssssss...', '..tttttttt..', '.tttttttttt.',
    ], { h: '#6b4226', s: '#f3c6a0', E: '#3a2c2a', p: '#f29a9a', m: '#c2584f', t: '#5b8def' }],
    glass: [['fffffffff', '.f.....f.', '.fsssssf.', '..fsssf..', '...fsf...', '....f....', '...f.f...', '..f.s.f..', '.f.sss.f.', '.fsssssf.', 'fffffffff'], { f: '#f6d27a', s: '#fff1c4' }],
  };

  const BASE = `
    .sky { position: absolute; inset: 0; background: linear-gradient(180deg, #b4e0ff 0%, #d9f0ff 58%, #f0f9ff 100%); }
    .iso { display: block; width: 100%; overflow: visible; }
    .px { display: block; }
  `;
  const MCB = `
    .mcb { display: flex; align-items: center; justify-content: center; gap: 1cqw; height: 5.4cqw; padding: 0 2.4cqw; border-radius: .9cqw; background: #dcdee2; color: #26282c; font-size: 2.4cqw; font-weight: 700; white-space: nowrap; box-shadow: inset 0 -.55cqw 0 #aeb2b8, inset 0 .25cqw 0 rgba(255, 255, 255, .7), 0 0 0 .22cqw #2e3136; }
    .mcb .ico { --s: 2.7cqw; }
    .mcb.go { background: #52a12f; color: #fff; box-shadow: inset 0 -.55cqw 0 #33721b, inset 0 .25cqw 0 rgba(255, 255, 255, .3), 0 0 0 .22cqw #1d3a10; }
  `;

  /* ---------- PBL 수업하기: 미션 카드 + 모둠이 짓는 미래 도시 ---------- */
  scene('minecraft/minecraftedu7', (K) => {
    const B = [];
    const add = (x, y, z, t, s) => B.push([x, y, z, t, s]);
    for (let i = 0; i < 7; i++) { add(3, i, 1, 'road', { h: 0.12 }); if (i !== 3) add(i, 3, 1, 'road', { h: 0.12 }); }
    const sq = (x, y) => [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]];
    for (let z = 1; z <= 5; z++) sq(0, 0).forEach(([x, y]) => add(x, y, z, z % 2 ? 'quartz' : 'glass'));
    sq(0, 0).forEach(([x, y]) => add(x, y, 6, 'solar', { h: 0.22 }));
    for (let z = 1; z <= 2; z++) sq(4, 4).forEach(([x, y]) => add(x, y, z, z === 2 && (x + y) % 2 ? 'glass' : 'plank'));
    sq(4, 4).forEach(([x, y]) => add(x, y, 3, 'solar', { h: 0.22 }));
    sq(0, 4).forEach(([x, y]) => add(x, y, 1, 'water', { h: 0.1 }));
    [[2, 6], [0, 6], [2, 0], [6, 0], [6, 2]].forEach(([x, y]) => add(x, y, 1, 'leaves'));
    B.push(...turbine(5, 1, 1, 4.2));
    const city = iso(B, { ground: { w: 7, d: 7, h: 1 } });
    const team = [['김', '#4a7fd6'], ['이', 'var(--pink)'], ['박', '#e0912f']].map(([t, c]) => K.avatar(t, { s: 3.6, c })).join('');
    const step = (n, label, st) => `<div class="st ${st}"><b class="n">${st === 'done' ? K.ico('checkmark', { s: 2 }) : n}</b><span>${label}</span></div>`;
    return K.win({
      x: 27, y: 7, w: 69, h: 51, title: '미래 도시 프로젝트', sub: ' · 3모둠',
      barRight: `<span class="team">${team}</span>`,
      body: `<div class="sky"></div><div class="city">${city.svg}</div>`,
    }) + K.card({
      x: 4, y: 13, w: 31, cls: 'mis',
      body: `<p class="eye">${K.ico('flag', { s: 2.4 })}프로젝트 미션</p>
        <p class="q">지속 가능한 미래 도시를 설계하라</p>
        <div class="steps">${step(1, '조사', 'done')}${step(2, '계획', 'done')}${step(3, '설계', 'now')}${step(4, '발표', '')}</div>`,
    }) + K.pill({ x: 4, bottom: 3.6, icon: 'people_team', text: '팀으로 푸는 현실 문제' });
  }, {
    css: `${BASE}
      .team { display: flex; padding-left: .9cqw; }
      .team .avatar { margin-left: -.9cqw; box-shadow: 0 0 0 .3cqw #fff; }
      .city { position: absolute; left: 15cqw; width: 47.5cqw; top: 1.2cqw; }
      .mis { padding: 2.6cqw 2.6cqw 2.4cqw; }
      .eye { display: flex; align-items: center; gap: .8cqw; font-size: 2.2cqw; font-weight: 700; color: rgb(var(--tint)); }
      .q { margin: 1.1cqw 0 2cqw; font-size: 2.65cqw; font-weight: 700; line-height: 1.38; letter-spacing: -0.02em; word-break: keep-all; }
      .steps { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); padding-top: 2cqw; border-top: .2cqw solid var(--line); }
      .steps::before { content: ''; position: absolute; left: 12.5%; right: 12.5%; top: 3.65cqw; height: .3cqw; background: linear-gradient(90deg, rgb(var(--tint)) 66.6%, #e3e6ea 66.6%); }
      .st { position: relative; display: flex; flex-direction: column; align-items: center; gap: .8cqw; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .n { display: grid; place-items: center; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 .25cqw #dfe2e6; font-size: 1.85cqw; font-weight: 700; color: var(--ink-4); }
      .st.done .n { background: rgb(var(--tint)); box-shadow: none; color: #fff; }
      .st.done { color: var(--ink-2); }
      .st.now .n { background: #fff; box-shadow: inset 0 0 0 .3cqw rgb(var(--tint)), 0 0 0 .6cqw color-mix(in srgb, rgb(var(--tint)) 18%, transparent); color: rgb(var(--tint)); }
      .st.now { color: rgb(var(--tint)); font-weight: 700; }
    `,
  });

  /* ---------- 명령어와 코딩: /fill 한 줄 → 두 좌표 사이를 돌로 채움 ---------- */
  scene('minecraft/minecraftedu6', (K) => {
    const B = [];
    for (let z = 1; z <= 3; z++) for (let x = 3; x <= 7; x++) for (let y = 1; y <= 4; y++) B.push([x, y, z, 'stone']);
    [[1, 5], [0, 1], [8, 6]].forEach(([x, y]) => B.push([x, y, 1, 'leaves']));
    const world = iso(B, { ground: { w: 9, d: 7, h: 1 }, seam: ['stone'] });
    return K.win({
      x: 5, y: 7, w: 90, h: 49.5, title: '나의 월드', sub: ' · 크리에이티브',
      body: `<div class="sky"></div>
        <div class="world">${world.svg}<i class="pt a" style="${world.at(3, 5, 1)}"></i><i class="pt b" style="${world.at(8, 1, 4)}"></i></div>
        <div class="chat">
          <div class="ln old">/give @s stone 64</div>
          <div class="ln in"><span class="cm">/fill</span><span class="ca">~1 ~ ~1</span><span class="cb">~5 ~2 ~4</span><span class="bk">stone</span><i class="caret"></i></div>
        </div>`,
    }) + K.pill({ right: 4, y: 3.4, icon: 'code', text: '명령어 한 줄로 뚝딱 건축', dark: true });
  }, {
    css: `${BASE}
      .world { position: absolute; left: 34cqw; width: 50cqw; top: 2.6cqw; }
      .pt { position: absolute; width: 2.4cqw; height: 2.4cqw; translate: -50% -50%; border-radius: 50%; box-shadow: 0 0 0 .45cqw #fff, 0 .6cqw 1.2cqw rgba(0, 0, 0, .3); }
      .pt.a { background: #f5a524; }
      .pt.b { background: #e0569a; }
      .chat { position: absolute; left: 3cqw; bottom: 4cqw; width: 50cqw; padding: 1.8cqw 2.2cqw; border-radius: 1.6cqw; background: rgba(24, 26, 30, .88); box-shadow: 0 2cqw 4cqw -2cqw rgba(0, 0, 0, .5); font-family: var(--mono); font-size: 2.3cqw; font-weight: 600; white-space: nowrap; }
      .ln { display: flex; align-items: center; height: 4.4cqw; padding: 0 1.2cqw; gap: 1.4cqw; }
      .ln.old { color: #9aa3ad; }
      .ln.in { margin-top: .8cqw; border-radius: .9cqw; background: rgba(255, 255, 255, .1); color: #fff; box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .16); }
      .cm { color: #a6e27d; } .ca { color: #ffc35c; } .cb { color: #ff8cc6; } .bk { color: #e8ecf0; }
      .caret { width: .25cqw; height: 2.8cqw; margin-left: -.8cqw; background: #fff; }
    `,
  });

  /* ---------- 수업 라이브러리: 처음 해 보기 좋은 추천 수업 3가지 ---------- */
  scene('minecraft/minecraftedu5', (K) => {
    const C = [];
    C.push(...turbine(3, 0, 1, 2.6));
    for (const [x, y] of [[0, 1], [1, 1]]) { C.push([x, y, 1, 'quartz']); C.push([x, y, 2, 'solar', { h: 0.22 }]); }
    for (const [x, y] of [[2, 2], [3, 2]]) C.push([x, y, 1, 'water', { h: 0.1 }]);
    C.push([0, 3, 1, 'leaves']);
    const town = iso(C, { ground: { w: 4, d: 4, h: 0.8 } });
    const play = `<span class="play">${K.ico('play', { s: 2.4 })}</span>`;
    const card = (cls, cover, title, chip, on) => `<div class="lc${on ? ' hl' : ''}"><div class="cv ${cls}">${cover}${play}</div><p class="tt">${title}</p>${chip}</div>`;
    return K.win({
      x: 6, y: 8, w: 88, h: 50, title: '수업 라이브러리', sub: ' · 추천 수업',
      body: `<div class="lib">
          ${card('c1', pix(...ART.face), '픽셀 초상화', K.chip('블록 아트', { line: true }), true)}
          ${card('c2', pix(...ART.glass), 'TimeCraft', K.chip('한국어', { tint: true }))}
          ${card('c3', town.svg, '지속 가능성 도시', K.chip('친환경 에너지', { line: true }))}
        </div>`,
    }) + K.pill({ right: 4.5, y: 3.4, icon: 'library', text: '처음이라면 이 3가지', tint: true });
  }, {
    css: `${BASE}
      .lib { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6cqw; padding: 3cqw 3cqw 0; background: #f6f8f4; }
      .lc { align-self: start; display: flex; flex-direction: column; align-items: flex-start; gap: 1.2cqw; padding: 1.2cqw 1.2cqw 2cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line), 0 1.4cqw 2.8cqw -1.8cqw rgba(15, 23, 42, .25); }
      .lc .chip { margin-left: 1cqw; }
      .cv { position: relative; width: 100%; height: 21cqw; display: grid; place-items: center; overflow: hidden; border-radius: 1.2cqw; }
      .c1 { background: #fde6d6; background-image: linear-gradient(rgba(255, 255, 255, .6) .2cqw, transparent .2cqw), linear-gradient(90deg, rgba(255, 255, 255, .6) .2cqw, transparent .2cqw); background-size: 2.3cqw 2.3cqw; }
      .c1 .px { width: 14cqw; align-self: end; }
      .c2 { background: linear-gradient(150deg, #7b6cf0, #4a8fe6); }
      .c2 .px { width: 10cqw; }
      .c3 { background: linear-gradient(180deg, #bfe6ff, #e8f7ff); }
      .c3 .iso { width: 18cqw; margin-top: 1.4cqw; }
      .play { position: absolute; right: 1.2cqw; bottom: 1.2cqw; display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 50%; background: rgba(255, 255, 255, .94); color: rgb(var(--tint)); box-shadow: 0 .6cqw 1.4cqw -.6cqw rgba(0, 0, 0, .35); }
      .tt { padding: 0 1cqw; font-size: 2.55cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    `,
  });

  /* ---------- 건축 창작 수업: 10×10 대지 위 집 + 핫바 8칸 ---------- */
  scene('minecraft/minecraftedu4', (K) => {
    const B = [];
    for (let x = 3; x <= 6; x++) {
      for (let y = 3; y <= 6; y++) {
        if (x === 3 || x === 6 || y === 3 || y === 6) {
          if (!(y === 6 && x === 4)) B.push([x, y, 1, 'plank']);
          const win = (y === 6 && x === 5) || (x === 6 && (y === 4 || y === 5));
          B.push([x, y, 2, win ? 'glass' : 'plank']);
        }
        B.push([x, y, 3, 'brick']);
      }
    }
    for (let x = 4; x <= 5; x++) for (let y = 4; y <= 5; y++) B.push([x, y, 4, 'brick']);
    [7, 8, 9].forEach((y) => B.push([4, y, 1, 'path', { h: 0.12 }]));
    B.push([1, 1, 1, 'log'], [1, 1, 2, 'leaves'], [1, 2, 2, 'leaves'], [2, 1, 2, 'leaves'], [1, 1, 3, 'leaves']);
    B.push([8, 1, 1, 'leaves'], [1, 7, 1, 'log'], [1, 7, 2, 'leaves'], [9, 6, 1, 'leaves']);
    const plot = iso(B, { ground: { w: 10, d: 10, h: 1, grid: true } });
    const slots = ['plank', 'glass', 'brick', 'stone', 'quartz', 'log', 'leaves', 'grass'];
    return `<div class="plot">${plot.svg}
        <span class="dim l" style="${plot.at(5, 10, 1)}">10블록</span>
        <span class="dim r" style="${plot.at(10, 5, 1)}">10블록</span>
      </div>
      <div class="bar">${slots.map((t, i) => `<span class="slot${i ? '' : ' on'}">${cube(t)}${i ? '' : '<b class="tip">참나무 판자</b>'}</span>`).join('')}</div>`
      + K.pill({ x: 4.5, y: 4, icon: 'cube', text: '블록으로 짓는 창작 수업' });
  }, {
    css: `${BASE}
      .plot { position: absolute; left: 21cqw; width: 58cqw; top: 2.6cqw; filter: drop-shadow(0 2.4cqw 2.4cqw rgba(var(--tint), .35)); }
      .dim { position: absolute; translate: -50% -50%; padding: .7cqw 1.5cqw; border-radius: 99px; background: #fff; color: rgb(var(--tint)); font-size: 2.2cqw; font-weight: 700; white-space: nowrap; box-shadow: 0 .8cqw 1.6cqw -.8cqw rgba(15, 23, 42, .3); }
      .dim.l { margin: 3.2cqw 0 0 -3.6cqw; }
      .dim.r { margin: 3.2cqw 0 0 3.6cqw; }
      .bar { position: absolute; left: 50%; bottom: 3cqw; translate: -50% 0; display: flex; gap: .6cqw; padding: .8cqw; border-radius: 1.6cqw; background: rgba(28, 30, 34, .88); box-shadow: 0 2cqw 4cqw -2cqw rgba(0, 0, 0, .5); }
      .slot { position: relative; display: grid; place-items: center; width: 5.6cqw; height: 5.6cqw; border-radius: .8cqw; background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 .2cqw rgba(255, 255, 255, .12); }
      .slot .iso { width: 3.6cqw; }
      .slot.on { background: rgba(255, 255, 255, .2); box-shadow: inset 0 0 0 .4cqw #fff; }
      .tip { position: absolute; bottom: calc(100% + 1.2cqw); left: 50%; translate: -50% 0; padding: .6cqw 1.3cqw; border-radius: .8cqw; background: #1d1f23; color: #fff; font-size: 2cqw; font-weight: 700; white-space: nowrap; box-shadow: 0 0 0 .2cqw rgba(255, 255, 255, .15); }
    `,
  });

  /* ---------- 월드 만들고 수업 시작: 월드 설정 + 참여 코드 ---------- */
  scene('minecraft/minecraftedu3', (K) => {
    const row = (label, ctrl) => `<div class="sr"><span>${label}</span>${ctrl}</div>`;
    const tog = (on) => `<i class="tg${on ? ' on' : ''}"></i>`;
    return K.win({
      x: 4, y: 8, w: 55, h: 50, dark: true, title: '새로운 월드 만들기',
      body: `<div class="set">
          ${row('게임 모드', '<span class="seg"><b>서바이벌</b><b class="on">크리에이티브</b></span>')}
          ${row('난이도', `<span class="sel">평화로움${K.ico('chevron_down', { s: 2.2 })}</span>`)}
          ${row('좌표 보기', tog(true))}
          ${row('TNT 폭발', tog(false))}
          ${row('OneDrive 월드 백업', tog(true))}
        </div>`,
    }) + K.card({
      x: 57, y: 14, w: 38.5, cls: 'join', top: true,
      body: `<div class="jh">${K.ico('people_team', { s: 3 })}<b>참여 코드</b></div>
        <div class="tiles">${['apple', 'gem', 'tree', 'cookie'].map((k) => `<span class="tile">${pix(...ART[k])}</span>`).join('')}</div>
        <p class="t-s">학생은 같은 그림을 골라 입장</p>`,
    }) + K.pill({ right: 5, bottom: 4.5, app: true, text: '참여 코드로 함께 입장', dark: true });
  }, {
    css: `
      .set { display: flex; flex-direction: column; gap: 1cqw; padding: 2.4cqw 3cqw; }
      .sr { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; height: 6.4cqw; padding: 0 1.8cqw; border-radius: 1.1cqw; background: rgba(255, 255, 255, .05); font-size: 2.35cqw; font-weight: 600; color: #e3e6ea; white-space: nowrap; }
      .seg { display: flex; gap: .5cqw; }
      .seg b, .sel { display: flex; align-items: center; gap: .8cqw; height: 4.4cqw; padding: 0 1.6cqw; border-radius: .7cqw; background: #4a4e55; color: #d9dce0; font-size: 2.15cqw; font-weight: 700; box-shadow: inset 0 -.4cqw 0 rgba(0, 0, 0, .3); }
      .seg b.on { background: #52a12f; color: #fff; box-shadow: inset 0 -.4cqw 0 #33721b; }
      .tg { position: relative; width: 6cqw; height: 3.2cqw; border-radius: 99px; background: #4a4e55; }
      .tg::after { content: ''; position: absolute; top: .4cqw; left: .4cqw; width: 2.4cqw; height: 2.4cqw; border-radius: 50%; background: #c9ccd1; }
      .tg.on { background: #52a12f; }
      .tg.on::after { left: auto; right: .4cqw; background: #fff; }
      .join { padding-bottom: 2.6cqw; }
      .jh { display: flex; align-items: center; gap: 1cqw; padding: 2.4cqw 2.8cqw 0; font-size: 2.6cqw; color: rgb(var(--tint)); }
      .jh b { color: var(--ink); }
      .tiles { display: flex; gap: 1.4cqw; padding: 2cqw 2.8cqw 1.8cqw; }
      .tile { flex: 1; display: grid; place-items: center; aspect-ratio: 1; border-radius: 1.2cqw; background: #f3f5f0; box-shadow: inset 0 0 0 .22cqw #e4e8df; }
      .tile .px { width: 62%; }
      .join .t-s { padding: 0 2.8cqw; }
    `,
  });

  /* ---------- 기본 화면과 설정: 첫 화면 메뉴 ---------- */
  scene('minecraft/minecraftedu2', (K) => K.win({
    x: 6, y: 7, w: 88, h: 51, title: 'Minecraft Education',
    barRight: `${K.avatar('T', { s: 3.6 })}${K.btn('로그아웃', { line: true, icon: 'sign_out:r' })}`,
    body: `<div class="sky"></div><i class="cl c1"></i><i class="cl c2"></i>
      ${hills(FAR, ['#a8d48a', '#b9d9a4'], 'far')}${hills(NEAR, ['#7dbb51', '#9a6c45'], 'near')}
      <div class="hero">${pix(...ART.hero)}<span class="mcb">${K.ico('emoji_hand:r')}의상 변경</span></div>
      <div class="menu">
        <span class="mcb go">${K.ico('play')}플레이</span>
        <span class="mcb">${K.ico('code')}Hour of Code</span>
        <div class="two"><span class="mcb">${K.ico('settings')}설정</span><span class="mcb">${K.ico('question_circle')}도움말</span></div>
      </div>`,
  }) + K.pill({ right: 4.5, bottom: 3.6, icon: 'home', text: '첫 화면 메뉴 한눈에' }), {
    css: `${BASE}${MCB}
      .cl { position: absolute; height: 2.4cqw; background: rgba(255, 255, 255, .9); }
      .cl.c1 { left: 8cqw; top: 4cqw; width: 14cqw; box-shadow: 4cqw -2.4cqw 0 rgba(255, 255, 255, .9); }
      .cl.c2 { right: 10cqw; top: 7cqw; width: 11cqw; }
      .hills { position: absolute; left: 0; bottom: 0; width: 100%; }
      .hills.far { height: 22cqw; opacity: .9; }
      .hills.near { height: 9cqw; }
      .hero { position: absolute; left: 9cqw; bottom: 5.4cqw; display: flex; flex-direction: column; align-items: center; gap: 1.6cqw; }
      .hero .px { width: 11cqw; filter: drop-shadow(0 1.2cqw 1cqw rgba(0, 0, 0, .25)); }
      .menu { position: absolute; left: 36cqw; top: 6.5cqw; width: 30cqw; display: flex; flex-direction: column; gap: 1.6cqw; }
      .menu .mcb.go { height: 6.4cqw; font-size: 2.8cqw; }
      .two { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6cqw; }
    `,
  });

  /* ---------- 설치하고 시작하기: 학교(교육용) 계정으로 로그인 ---------- */
  scene('minecraft/minecraft-tutorial', (K) => `<div class="tab"><div class="scr">
      <div class="sky"></div>${hills(FAR, ['#9fd07f', '#b3d79c'], 'far')}${hills(NEAR, ['#7dbb51', '#9a6c45'], 'near')}
      <div class="login">
        ${K.app(null, { s: 6 })}
        <p class="t-h2">Minecraft Education</p>
        <p class="t-s">교육용 계정으로 로그인</p>
        <div class="in">${K.ico('mail:r', { s: 2.6 })}<span>teacher@school.kr</span></div>
        ${K.btn('로그인', { primary: true })}
      </div>
    </div></div>` + K.pill({ x: 4, bottom: 3.6, icon: 'shield_checkmark', text: '학교 계정이면 무료', tint: true }), {
    css: `${BASE}
      .tab { position: absolute; left: 9cqw; top: 7.5cqw; width: 82cqw; height: 53cqw; padding: 1.3cqw; border-radius: 3.4cqw; background: #16181d; box-shadow: 0 4cqw 7cqw -3cqw rgba(var(--tint), .55), 0 1cqw 2cqw -1cqw rgba(0, 0, 0, .35); }
      .scr { position: relative; height: 100%; overflow: hidden; border-radius: 2.2cqw; display: grid; place-items: start center; }
      .hills { position: absolute; left: -2cqw; bottom: 0; width: calc(100% + 4cqw); filter: blur(.4cqw); }
      .hills.far { height: 26cqw; }
      .hills.near { height: 12cqw; }
      .login { position: relative; margin-top: 3.4cqw; width: 38cqw; display: flex; flex-direction: column; align-items: center; gap: 1cqw; padding: 3cqw 3.2cqw; border-radius: 2.2cqw; background: #fff; box-shadow: 0 3cqw 6cqw -2cqw rgba(20, 50, 10, .45); }
      .login .t-h2 { margin-top: .4cqw; }
      .login .t-s { margin-bottom: 1cqw; }
      .in { display: flex; align-items: center; gap: 1.2cqw; width: 100%; height: 5.2cqw; padding: 0 1.8cqw; border-radius: 1.1cqw; box-shadow: inset 0 0 0 .22cqw var(--line-2); font-size: 2.3cqw; font-weight: 550; color: var(--ink-2); }
      .in .ico { color: var(--ink-4); }
      .login .btn { width: 100%; height: 5.2cqw; font-size: 2.5cqw; }
    `,
  });

  /* ---------- 블록 코딩: Code Builder 블록 → 에이전트가 길을 놓음 ---------- */
  scene('minecraft/minecraft-education-block-coding', (K) => {
    const G = [];
    for (let x = 0; x <= 3; x++) G.push([x, 1, 1, 'plank', { h: 0.18 }]);
    G.push([4, 1, 1, 'agent'], flag(5, 1, 1), [0, 2, 1, 'leaves'], [5, 0, 1, 'leaves']);
    const game = iso(G, { ground: { w: 6, d: 3, h: 1, grid: true } });
    const cats = [['플레이어', '#4c97ff'], ['블록', '#7cc35a'], ['에이전트', '#e0612f', 1], ['반복', '#3fa34d'], ['논리', '#5bc0c8']];
    const v = (t) => `<span class="v">${t}</span>`;
    return K.win({
      x: 4, y: 8, w: 62, h: 50, title: 'Code Builder',
      barRight: `<span class="run">${K.ico('play', { s: 2.6 })}</span>`,
      body: `<div class="cb">
          <div class="tools">${cats.map(([n, c, on]) => `<div class="cat${on ? ' on' : ''}"><i style="background:${c}"></i>${n}</div>`).join('')}</div>
          <div class="canvas">
            <div class="blk hat">채팅 명령어 ${v('"go"')}</div>
            <div class="loop"><div class="blk">반복 ${v('4')} 회</div>
              <div class="inner"><div class="blk ag">에이전트 앞으로 이동 ${v('1')}</div><div class="blk ag">에이전트 블록 놓기</div></div>
              <i class="foot"></i></div>
          </div>
        </div>`,
    }) + `<div class="card game">${game.svg}</div>` + K.pill({ right: 4, bottom: 3.6, icon: 'puzzle_piece', text: '게임처럼 배우는 코딩', dark: true });
  }, {
    css: `${BASE}
      .run { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%; background: rgb(var(--tint)); color: #fff; }
      .cb { position: absolute; inset: 0; display: grid; grid-template-columns: 16.5cqw 1fr; }
      .tools { display: flex; flex-direction: column; gap: .4cqw; padding: 2cqw 1.2cqw; background: #f6f7f9; border-right: .2cqw solid var(--line); }
      .cat { display: flex; align-items: center; gap: 1.1cqw; height: 4.6cqw; padding: 0 1.2cqw; border-radius: 1cqw; font-size: 2.2cqw; font-weight: 600; color: var(--ink-2); }
      .cat i { width: 2.2cqw; height: 2.2cqw; border-radius: 50%; }
      .cat.on { background: #fff; color: var(--ink); font-weight: 700; box-shadow: 0 0 0 .2cqw var(--line-2); }
      .canvas { padding: 3cqw 2.8cqw; background-color: #fff; background-image: radial-gradient(#dfe3e8 .18cqw, transparent .2cqw); background-size: 2.6cqw 2.6cqw; }
      .blk { --bc: #3fa34d; display: inline-flex; align-items: center; gap: .9cqw; height: 5.4cqw; padding: 0 1.6cqw; border-radius: .8cqw; background: var(--bc); color: #fff; font-size: 2.45cqw; font-weight: 700; white-space: nowrap; box-shadow: inset 0 -.35cqw 0 rgba(0, 0, 0, .14); }
      .blk.hat { --bc: #4c97ff; height: 6cqw; border-radius: 2.4cqw 2.4cqw .8cqw .8cqw; }
      .blk.ag { --bc: #e0612f; }
      .v { display: inline-grid; place-items: center; min-width: 3.6cqw; height: 3.6cqw; padding: 0 1cqw; border-radius: 99px; background: #fff; color: var(--ink); font-size: 2.2cqw; }
      .loop { display: flex; flex-direction: column; align-items: flex-start; margin-top: .3cqw; }
      .loop > .blk { border-bottom-left-radius: 0; }
      .inner { display: flex; flex-direction: column; align-items: flex-start; gap: .35cqw; padding: .35cqw 0; border-left: 2.4cqw solid #3fa34d; }
      .foot { width: 15cqw; height: 2.2cqw; border-radius: 0 .8cqw .8cqw .8cqw; background: #3fa34d; box-shadow: inset 0 -.35cqw 0 rgba(0, 0, 0, .14); }
      .game { left: 61cqw; top: 15cqw; width: 35cqw; padding: 3cqw 2.4cqw 2.6cqw; background: linear-gradient(180deg, #c4e7ff, #eef8ff); }
    `,
  });
})();
