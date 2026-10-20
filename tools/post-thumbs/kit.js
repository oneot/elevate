/* =====================================================================
   Elevate blog thumbnails — scene kit
   Scenes register with scene(key, (K, c) => html, { css, after }).
   key = "<display category>/<slug>" (the post URL path).
   K = helpers below, c = category palette (name, icon, tint, ...).
   Coordinates are cqw: x 0–100 (left→right), y 0–56.25 (top→bottom).
   Skin: v3 'fluid' by default (fluid forms, vivid analogous colours, app tile);
   render.html?skin=v2 draws the soft-glass skin of the first 80 cards.
   ===================================================================== */
(function () {
  const CAT = {
    m365: { name: 'M365', icon: 'app/m365-64.webp', tint: '216, 59, 1', m: ['#2f8fe0', '#c25bb4', '#6fbf6a', '#e3c24a'], heroA: '#fcefe9', heroB: '#fdf7f3' },
    copilot: { name: 'Copilot', icon: 'app/copilot-64.webp', tint: '108, 92, 231', m: ['#1aa0e8', '#d653ad', '#ff7d5c', '#f4b63a'], heroA: '#eef0fe', heroB: '#fbf2f8' },
    'copilot-studio': { name: 'Copilot Studio', icon: 'app/copilot-studio-64.webp', tint: '0, 128, 128', m: ['#2fd0bd', '#e157be', '#24b3d8', '#a958e0'], heroA: '#e7f4f3', heroB: '#f1f7fb',
      dark: { tint: '72, 222, 202', solid: 'linear-gradient(135deg, #14a191, #0d7d93)' } },
    teams: { name: 'Teams', icon: 'app/teams-64.webp', tint: '91, 95, 199', m: ['#8f97fc', '#6c5cf0', '#b4a8ff', '#5d74f2'], heroA: '#eeeefb', heroB: '#f6f6fd', d2: '#dcdaf8' },
    onenote: { name: 'OneNote', icon: 'app/onenote-64.webp', tint: '119, 25, 170', m: ['#dd67fd', '#9b3fd0', '#f0a0ec', '#b65cf0'], heroA: '#f4ebf9', heroB: '#faf5fc', d2: '#ead6f5' },
    forms: { name: 'Forms', icon: 'app/forms.svg', tint: '3, 120, 124', m: ['#27c7d4', '#0f8fa3', '#6fe0e6', '#1a9fbd'], heroA: '#e6f4f4', heroB: '#f2f9f9', d2: '#cfeced' },
    onedrive: { name: 'OneDrive', icon: 'app/onedrive.svg', tint: '0, 120, 212', m: ['#2895fc', '#2bcaf8', '#5aa8ff', '#1d7af0'], heroA: '#e9f2fc', heroB: '#f4f8fd' },
    powerpoint: { name: 'PowerPoint', icon: 'app/powerpoint.svg', tint: '196, 62, 28', m: ['#ff9a4d', '#e5513f', '#ff8a8a', '#f26a5c'], heroA: '#fcefea', heroB: '#fdf7f4' },
    excel: { name: 'Excel', icon: 'app/excel-64.webp', tint: '16, 124, 65', m: ['#9ce671', '#2f9a45', '#6fd36a', '#c3f08a'], heroA: '#e8f4ec', heroB: '#f3f9f5' },
    word: { name: 'Word', icon: 'app/word.svg', tint: '24, 90, 189', m: ['#42d6ff', '#2f62e8', '#98bcfe', '#1592ef'], heroA: '#eaf1fb', heroB: '#f4f8fd' },
    minecraft: { name: 'Minecraft', icon: 'app/minecraft-64.webp', tint: '76, 135, 52', m: ['#7cc33a', '#4f8f1a', '#a9dc6a', '#c79a6b'], heroA: '#edf5e7', heroB: '#f6f9f1' },
    github: { name: 'GitHub', icon: 'app/github.svg', tint: '130, 80, 223', m: ['#8957e5', '#2f81f7', '#3fb950', '#db61a2'], heroA: '#f1edfb', heroB: '#f6f8fd' },
    azure: { name: 'Azure', icon: 'app/azure.svg', tint: '0, 120, 212', m: ['#50e6ff', '#0078d4', '#3ccbf4', '#2f5fd9'], heroA: '#e8f2fc', heroB: '#f3f8fd' },
  };

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixD2 = (tint, heroA) => {
    const t = tint.split(',').map(Number);
    const a = hex(heroA);
    return `rgb(${a.map((v, i) => Math.round(v * 0.85 + t[i] * 0.15)).join(',')})`;
  };
  // Fluid ramps (assets/fluid/palette.json, served as palette.js): the same colours as the fluid forms.
  const FLUID = window.FLUID_PALETTE || {};
  for (const [key, c] of Object.entries(CAT)) {
    c.key = key;
    c.d2 = c.d2 || mixD2(c.tint, c.heroA);
    const f = FLUID[key] || c.m;
    c.f = [f[0], f[1], f[2], f[f.length - 1]];
  }
  const SKIN = typeof location !== 'undefined' && new URLSearchParams(location.search).get('skin') === 'v2' ? 'v2' : 'fluid';

  const vars = (c) => [
    `--tint:${c.tint}`, `--heroA:${c.heroA}`, `--heroB:${c.heroB}`, `--d2:${c.d2}`,
    `--m1:${c.m[0]}`, `--m2:${c.m[1]}`, `--m3:${c.m[2]}`, `--m4:${c.m[3]}`,
    `--f1:${c.f[0]}`, `--f2:${c.f[1]}`, `--f3:${c.f[2]}`, `--f4:${c.f[3]}`,
    c.solid && `--solid:${c.solid}`,
  ].filter(Boolean).join(';');

  const u = (v) => (typeof v === 'number' ? `${v}cqw` : v);
  /** position/size style from {x, y, right, bottom, w, h} in cqw */
  const pos = (o = {}) => [
    o.x != null && `left:${u(o.x)}`, o.y != null && `top:${u(o.y)}`,
    o.right != null && `right:${u(o.right)}`, o.bottom != null && `bottom:${u(o.bottom)}`,
    o.w != null && `width:${u(o.w)}`, o.h != null && `height:${u(o.h)}`,
    o.z != null && `z-index:${o.z}`, o.rotate != null && `rotate:${o.rotate}deg`,
    o.style,
  ].filter(Boolean).join(';');

  let uid = 0;
  let current = null; // palette of the scene being rendered

  const K = {
    pos,
    /** Fluent icon. name: 'send' (24 filled), 'send:r' (24 regular) or a full name like 'mic_sparkle_24_regular'. */
    ico(name, o = {}) {
      let file = name;
      if (!/_\d+_(filled|regular|color)$/.test(name)) {
        const [base, v] = name.split(':');
        file = `${base}_24_${v === 'r' ? 'regular' : 'filled'}`;
      }
      const st = [`--ico:url('icons/${file}.svg')`, o.s != null && `--s:${u(o.s)}`, o.c && `color:${o.c}`, o.style].filter(Boolean).join(';');
      return `<i class="ico ${o.cls || ''}" style="${st}"></i>`;
    },
    /** App icon: K.app() = this category, K.app('teams'), or a path. */
    app(which, o = {}) {
      const src = !which ? current.icon : CAT[which] ? CAT[which].icon : which;
      return `<img class="app ${o.cls || ''}" src="${src}" alt="" style="${o.s != null ? `--s:${u(o.s)};` : ''}${o.style || ''}">`;
    },
    /** Window with title bar. icon: default category icon, false = none, 'teams' = other app, 'ico:name' = Fluent icon. */
    win(o) {
      let icon = '';
      if (o.icon !== false) {
        if (typeof o.icon === 'string' && o.icon.startsWith('ico:')) icon = K.ico(o.icon.slice(4), { s: 3.4, c: o.dark ? '#c9ced6' : `rgb(${current.tint})` });
        else icon = K.app(o.icon || null, { s: 3.5 });
      }
      const bar = o.bar === false ? '' : `<div class="win__bar">${o.dots === false ? '' : '<span class="win__dots"><i></i><i></i><i></i></span>'}${icon}<span>${o.title || ''}</span>${o.sub ? `<em>${o.sub}</em>` : ''}${o.barRight ? `<span class="sp"></span>${o.barRight}` : ''}</div>`;
      return `<div class="win ${o.dark ? 'win--dark' : ''} ${o.cls || ''}" style="${pos(o)}">${bar}<div class="win__body">${o.body || ''}</div></div>`;
    },
    /** Floating card without a bar. top: true adds the tint strip. */
    card(o) {
      return `<div class="card ${o.flat ? 'card--flat' : ''} ${o.cls || ''}" style="${pos(o)}">${o.top ? '<div class="card__top"></div>' : ''}${o.body || ''}</div>`;
    },
    /** Floating takeaway pill. icon: Fluent name, app: true/'teams' for an app icon. */
    pill(o) {
      const lead = o.app ? K.app(o.app === true ? null : o.app) : o.icon ? `<span class="pi">${K.ico(o.icon)}</span>` : '';
      const kind = o.dark ? 'pill--dark' : o.tint ? 'pill--tint' : '';
      return `<div class="pill ${kind} ${o.cls || ''}" style="${pos(o)}">${lead}${o.text}</div>`;
    },
    chip(text, o = {}) {
      const kind = o.solid ? 'chip--solid' : o.tint ? 'chip--tint' : o.line ? 'chip--line' : '';
      const lead = o.dot ? `<i class="dot" style="${o.dot === true ? '' : `--c:${o.dot}`}"></i>` : o.icon ? K.ico(o.icon) : '';
      return `<span class="chip ${kind} ${o.cls || ''}" style="${o.style || ''}">${lead}${text}</span>`;
    },
    btn(text, o = {}) {
      const kind = o.primary ? 'btn--primary' : o.line ? 'btn--line' : '';
      return `<span class="btn ${kind} ${o.cls || ''}" style="${o.style || ''}">${o.icon ? K.ico(o.icon) : ''}${text}</span>`;
    },
    skel(w = '80%', o = {}) {
      return `<div class="skel ${o.tint ? 'skel--tint' : ''}" style="width:${u(w)};${o.h ? `height:${u(o.h)};` : ''}${o.style || ''}"></div>`;
    },
    avatar(text, o = {}) {
      return `<span class="avatar" style="${o.c ? `--c:${o.c};` : ''}${o.s ? `--s:${u(o.s)};` : ''}">${text}</span>`;
    },
    /** Donut gauge. value/label are the centre text. */
    ring(o) {
      const st = [`--p:${o.p}`, o.s && `--s:${u(o.s)}`, o.c && `--c:${o.c}`].filter(Boolean).join(';');
      return `<div class="ring" style="${st}"><div><span class="t-num" style="${o.vs ? `font-size:${u(o.vs)}` : ''}">${o.value ?? ''}</span>${o.label ? `<span class="t-xs" style="margin-top:.5cqw">${o.label}</span>` : ''}</div></div>`;
    },
    /** Bar chart. values: heights in %, on: indexes drawn in full tint. */
    bars(values, o = {}) {
      const on = new Set(o.on || []);
      return `<div class="bars ${o.cls || ''}" style="${o.h ? `--bh:${u(o.h)};` : ''}${o.gap ? `gap:${u(o.gap)};` : ''}${o.style || ''}">${values.map((v, i) => `<i class="${on.has(i) ? 'on' : ''}" style="--h:${v}%${o.colors && o.colors[i] ? `;--c:${o.colors[i]}` : ''}"></i>`).join('')}</div>`;
    },
    bubble(text, o = {}) {
      return `<div class="bubble ${o.me ? 'bubble--me' : 'bubble--bot'} ${o.cls || ''}" style="${o.style || ''}">${text}</div>`;
    },
    prompt(text, o = {}) {
      return `<div class="prompt ${o.cls || ''}" style="${o.style || ''}">${o.lead || ''}<span>${text}</span><span class="send">${K.ico(o.icon || 'send')}</span></div>`;
    },
    /** SVG overlay in stage coordinates (viewBox 0 0 100 56.25). Use K.curve / K.line inside. */
    wires(inner, o = {}) {
      return `<svg class="wires" viewBox="0 0 100 56.25" style="${o.z != null ? `z-index:${o.z}` : ''}">${inner}</svg>`;
    },
    _marker(color) {
      uid += 1;
      const id = `ah${uid}`;
      return { id, def: `<defs><marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="2.4" markerHeight="2.4" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>` };
    },
    /** Path between two points. o: { c, w, dash, arrow (default true), dot (start dot), bend: 'h'|'v'|'none' } */
    curve(x1, y1, x2, y2, o = {}) {
      const color = o.c || `rgb(${current.tint})`;
      const m = o.arrow === false ? null : K._marker(color);
      let d;
      if (o.bend === 'none') d = `M${x1} ${y1} L${x2} ${y2}`;
      else if (o.bend === 'v') { const my = (y1 + y2) / 2; d = `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`; }
      else { const mx = (x1 + x2) / 2; d = `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`; }
      const dash = o.dash ? `stroke-dasharray="${o.dash === true ? '1.2 1' : o.dash}"` : '';
      const dot = o.dot ? `<circle cx="${x1}" cy="${y1}" r="${o.dotR || 0.9}" fill="${color}"/>` : '';
      return `${m ? m.def : ''}${dot}<path d="${d}" fill="none" stroke="${color}" stroke-width="${o.w || 0.55}" stroke-linecap="round" ${dash} ${m ? `marker-end="url(#${m.id})"` : ''}/>`;
    },
    /** GitHub mascot head (assets/mascots/<name>.png): mona-*, copilot-*, ducky-*. o: {x,y,right,bottom,w,z,rotate,flip,cls} */
    mascot(name, o = {}) {
      const st = [pos(o), o.flip && 'scale:-1 1'].filter(Boolean).join(';');
      return `<img class="mascot ${o.cls || ''}" src="assets/mascots/${name}.png" alt="" style="${st}">`;
    },
    /** Mouse pointer whose tip is at (x, y). */
    cursor(o) {
      return `<svg class="cursor" style="left:${u(o.x)};top:${u(o.y)}" viewBox="0 0 24 24"><path d="M5 2.5 L5 19.5 L9.6 15.2 L12.6 21.6 L15.3 20.4 L12.3 14.1 L18.6 14.1 Z" fill="#1d1d1f" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    },
    /**
     * App tile (v3): the refreshed app icon with its letter plate on a frosted glass tile, floating over a corner
     * of the main UI like the cards of the Microsoft 365 icon refresh. o: {x|right, y|bottom, s (size, default 10),
     * app ('teams' … for another app), rotate, z, plinth (stands on a small white pedestal)}
     */
    tile(o = {}) {
      const src = !o.app ? current.icon : CAT[o.app] ? CAT[o.app].icon : o.app;
      const st = [pos(o), o.s != null && `--s:${u(o.s)}`].filter(Boolean).join(';');
      return `<div class="k-tilebox ${o.cls || ''}" style="${st}">${o.plinth ? '<span class="k-plinth"></span>' : ''}<div class="k-tile"><img src="${src}" alt=""></div></div>`;
    },
    /**
     * Small floating glass piece around the main UI (v3 'constellation'): a Fluent icon, an app icon or a short
     * number in the app gradient. o: {x|right, y|bottom, s (size, default 6.4), icon | app | text, square, far (blurred), z}
     */
    float(o = {}) {
      const app = o.app && (o.app === true ? current : CAT[o.app]);
      const inner = app ? `<img src="${app.icon}" alt="">` : o.icon ? K.ico(o.icon) : o.text != null ? `<b>${o.text}</b>` : '';
      const st = [pos(o), o.s != null && `--fs:${u(o.s)}`].filter(Boolean).join(';');
      return `<div class="k-float ${o.square ? 'k-float--sq' : ''} ${o.far ? 'far' : ''} ${o.cls || ''}" style="${st}">${inner}</div>`;
    },
  };

  window.CAT = CAT;
  window.K = K;
  window.SKIN = SKIN;
  window.SCENES = {};
  // render.html sets AUTO_SCENES while it loads scenes/auto (AI scenes get the stricter v3 audit).
  window.scene = (key, render, opts = {}) => { window.SCENES[key] = { render, ...opts, auto: Boolean(window.AUTO_SCENES) }; };

  // ---------- Decor: glossy 3D glass objects behind the UI (assets/glass/<cat>/<shape>.webp, 640px) ----------
  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  const SHAPES = ['blob', 'torus', 'orb', 'pebble', 'capsule'];
  // Placement for variant 0 (big object bottom-right, small one top-left); other variants mirror it.
  const BIG = { blob: { o: [-11, -14], w: 44, r: 0 }, torus: { o: [-12, -15], w: 42, r: 0 }, orb: { o: [-10, -13], w: 38, r: 0 }, pebble: { o: [-12, -12], w: 44, r: -10 }, capsule: { o: [-7, -12], w: 40, r: 0 } };
  const SMALL = { blob: { o: [2.6, 2.2], w: 10.5 }, torus: { o: [2.4, 2], w: 10 }, orb: { o: [3, 2.6], w: 7.6 }, pebble: { o: [2.4, 2.4], w: 10.5 }, capsule: { o: [2, 1.6], w: 10 } };
  /** One glass object (v2). o: {x|right, y|bottom, w, rotate, far (blurred), z, flip} */
  const glassV2 = (shape, o = {}) => {
    const st = [pos(o), o.flip && 'scale:-1 1'].filter(Boolean).join(';');
    return `<img class="glass3d ${o.far ? 'far' : ''}" src="assets/glass/${current.key}/${shape}.webp" alt="" style="${st}">`;
  };

  // ---------- v3 fluid forms (assets/fluid/<cat>/<form>.webp, make_fluid.py) ----------
  const FORMS = ['fold', 'ribbon', 'sphere', 'bubbles'];
  const SMALL_FORMS = ['sphere', 'bubbles', 'fold'];
  // Scenes written for the glass objects keep working: each glass shape maps to the closest fluid form.
  const FROM_GLASS = { orb: 'sphere', pebble: 'sphere', blob: 'bubbles', torus: 'fold', capsule: 'ribbon' };
  const formName = (shape) => (FORMS.includes(shape) ? shape : FROM_GLASS[shape] || 'sphere');
  // Placement for variant 0 (big form bottom-right, small one top-left); other variants mirror it.
  const BIG_FORM = { fold: { o: [-8, -12], w: 52 }, ribbon: { o: [-14, -4], w: 66 }, sphere: { o: [-7, -10], w: 36 }, bubbles: { o: [-6, -9], w: 40 } };
  const SMALL_FORM = { fold: { o: [2.2, 2], w: 11 }, ribbon: { o: [1.6, 2.6], w: 14 }, sphere: { o: [3, 2.6], w: 7.6 }, bubbles: { o: [2.4, 2], w: 10 } };
  /** One fluid form. shape: fold | ribbon | sphere | bubbles. o: {x|right, y|bottom, w, rotate, far (blurred), z, flip} */
  K.form = (shape, o = {}) => {
    const st = [pos(o), o.flip && 'scale:-1 1'].filter(Boolean).join(';');
    return `<img class="glass3d form3d ${o.far ? 'far' : ''}" src="assets/fluid/${current.key}/${formName(shape)}.webp" alt="" style="${st}">`;
  };
  /** Glass object of the current skin (v3 draws the matching fluid form). */
  K.glass = (shape, o = {}) => (SKIN === 'fluid' ? K.form(shape, o) : glassV2(shape, o));
  const decoFluid = (key, opt) => {
    const h = hash(key);
    const v = opt && opt.v != null ? opt.v : h % 4;
    if (opt === false) return { v, html: '' };
    if (Array.isArray(opt)) return { v, html: opt.map(([shape, o]) => K.form(shape, o)).join('') };
    if (opt && Array.isArray(opt.items)) return { v, html: opt.items.map(([shape, o]) => K.form(shape, o)).join('') };
    const fx = v & 1; const fy = (v >> 1) & 1;
    const big = formName((opt && opt.big) || FORMS[(h >>> 4) % FORMS.length]);
    let small = formName((opt && opt.small) || SMALL_FORMS[(h >>> 9) % SMALL_FORMS.length]);
    if (small === big) small = SMALL_FORMS[(SMALL_FORMS.indexOf(big) + 1) % SMALL_FORMS.length];
    const b = BIG_FORM[big]; const sm = SMALL_FORM[small];
    // Mirrored to the other side, a form is also flipped so its fold still opens towards the stage.
    const place = (off, w, far, mirrorX, mirrorY, flip) => ({ [mirrorX ? 'x' : 'right']: off[0], [mirrorY ? 'y' : 'bottom']: off[1], w, far, flip });
    const html = [
      opt && opt.small === false ? '' : K.form(small, place(sm.o, sm.w, true, !fx, !fy, !!fx)),
      opt && opt.big === false ? '' : K.form(big, place(b.o, b.w, false, !!fx, !!fy, !!fx)),
    ].join('');
    return { v, html };
  };
  const decoFor = (key, opt) => {
    if (SKIN === 'fluid') return decoFluid(key, opt);
    if (opt === false) return { v: hash(key) % 4, html: '' };
    const h = hash(key);
    const v = opt && opt.v != null ? opt.v : h % 4;
    if (Array.isArray(opt)) return { v, html: opt.map(([shape, o]) => glassV2(shape, o)).join('') };
    if (opt && Array.isArray(opt.items)) return { v, html: opt.items.map(([shape, o]) => glassV2(shape, o)).join('') };
    const fx = v & 1; const fy = (v >> 1) & 1;
    const big = (opt && opt.big) || SHAPES[(h >>> 4) % SHAPES.length];
    let small = (opt && opt.small) || SHAPES[(h >>> 9) % SHAPES.length];
    if (small === big) small = SHAPES[(SHAPES.indexOf(big) + 2) % SHAPES.length];
    const b = BIG[big]; const sm = SMALL[small];
    const place = (off, w, far, mirrorX, mirrorY, r) => ({ [mirrorX ? 'x' : 'right']: off[0], [mirrorY ? 'y' : 'bottom']: off[1], w, far, rotate: r || undefined });
    const html = [
      opt && opt.small === false ? '' : glassV2(small, place(sm.o, sm.w, true, !fx, !fy)),
      opt && opt.big === false ? '' : glassV2(big, place(b.o, b.w, false, !!fx, !!fy, b.r)),
    ].join('');
    return { v, html };
  };

  /** Renders one scene into a .tD stage string. */
  window.renderScene = (key, category) => {
    const base = CAT[category];
    const c = base.dark ? { ...base, ...base.dark, isDark: true } : base;
    current = c;
    const s = window.SCENES[key];
    const inner = s ? s.render(K, c) : `<div class="abs" style="inset:0;display:grid;place-items:center;font-size:3cqw;font-weight:700;color:#b33">TODO · ${key}</div>`;
    // Scene CSS is scoped to its own stage with native CSS nesting.
    const css = s && s.css ? `<style>[data-scene="${key}"] { ${s.css} }</style>` : '';
    const deco = decoFor(key, s ? s.deco : false);
    return `<div class="tD${c.isDark ? ' dark' : ''}${SKIN === 'fluid' ? ' fluid' : ''}" data-scene="${key}" data-v="${deco.v}" style="${vars(c)}">${css}<div class="deco">${deco.html}</div>${inner}</div>`;
  };
})();
