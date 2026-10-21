/* minecraft/minecraftedu5 — 수업 라이브러리: 추천 수업 '픽셀 초상화' 상세 + 추천 3가지 목록 (v3) */
(() => {
  const pix = (rows, pal) => {
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
    return `<svg class="px" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${r}</svg>`;
  };
  const FACE = [[
    '...hhhhhh...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhsssssshh.', '.hssssssssh.', '.hsEssssEsh.', '.hssssssssh.',
    '.hpssssssph.', '..ssmssmss..', '..sssmmsss..', '...ssssss...', '..tttttttt..', '.tttttttttt.',
  ], { h: '#6b4226', s: '#f3c6a0', E: '#3a2c2a', p: '#f29a9a', m: '#c2584f', t: '#5b8def' }];
  const HOURGLASS = [['fffffffff', '.f.....f.', '.fsssssf.', '..fsssf..', '...fsf...', '....f....', '...f.f...', '..f.s.f..', '.f.sss.f.', '.fsssssf.', 'fffffffff'], { f: '#f6d27a', s: '#fff1c4' }];
  const WOOL = ['#6b4226', '#f3c6a0', '#f29a9a', '#c2584f', '#5b8def', '#3a2c2a'];

  scene('minecraft/minecraftedu5', (K) => {
    const row = (cls, thumb, name, tag, on) => `<div class="lr${on ? ' on' : ''}"><span class="th ${cls}">${thumb}</span><div class="ln"><b>${name}</b>${tag}</div></div>`;
    return K.win({
      x: 4, y: 9.5, w: 64, h: 49, title: '수업 라이브러리', icon: false,
      body: `<div class="dt">
          <div class="cvs">
            <div class="grid">${pix(...FACE)}</div>
            <div class="hot">${WOOL.map((c, i) => `<i class="${i === 4 ? 'on' : ''}" style="background:${c}"></i>`).join('')}</div>
          </div>
          <div class="info">
            ${K.chip('블록 아트', { tint: true, icon: 'grid' })}
            <p class="nm">픽셀 초상화</p>
            ${K.skel('92%')}${K.skel('74%')}
            <div class="acts">
              <span class="go">${K.ico('play')}월드 만들기</span>
              <span class="vd">${K.ico('video:r')}영상 보기</span>
            </div>
          </div>
        </div>`,
    })
      + K.card({
        x: 61, y: 16.5, w: 34, cls: 'rec',
        body: `<p class="rh">${K.ico('library', { s: 2.8 })}추천 수업 3</p>
          ${row('t1', pix(...FACE), '픽셀 초상화', '', true)}
          ${row('t2', pix(...HOURGLASS), 'TimeCraft', K.chip('한국어', { line: true }))}
          ${row('t3', K.ico('leaf_two', { s: 3.2, c: '#fff' }), '지속 가능성 도시', '')}`,
      })
      + K.tile({ x: 1.2, y: 4, s: 10.5 })
      + K.float({ x: 51, y: 2.4, icon: 'video' })
      + K.pill({ right: 4, y: 3.6, icon: 'sparkle', text: '처음엔 추천 수업부터', dark: true });
  }, {
    deco: { big: 'sphere', small: 'fold', v: 2 },
    css: `
      .win__bar { padding-left: 11cqw; }
      .dt { position: absolute; inset: 0; display: grid; grid-template-columns: 27cqw 1fr; gap: 3cqw; padding: 3cqw 3cqw 0; background: rgba(244, 247, 241, .7); }
      .cvs { display: flex; flex-direction: column; gap: 1.6cqw; }
      .grid { display: grid; place-items: end center; height: 27cqw; border-radius: 1.6cqw; overflow: hidden; background: #fde6d6; background-image: linear-gradient(rgba(255, 255, 255, .65) .2cqw, transparent .2cqw), linear-gradient(90deg, rgba(255, 255, 255, .65) .2cqw, transparent .2cqw); background-size: 2.25cqw 2.25cqw; box-shadow: inset 0 0 0 .22cqw rgba(0, 0, 0, .05); }
      .grid .px { width: 21cqw; display: block; }
      .hot { display: flex; gap: .6cqw; padding: .8cqw; border-radius: 1.3cqw; background: rgba(28, 30, 34, .86); align-self: center; }
      .hot i { width: 3.2cqw; height: 3.2cqw; border-radius: .5cqw; box-shadow: inset 0 -.35cqw 0 rgba(0, 0, 0, .2); }
      .hot i.on { box-shadow: 0 0 0 .35cqw #fff; }
      .info { display: flex; flex-direction: column; align-items: flex-start; gap: 1.6cqw; padding-top: .6cqw; }
      .info .chip { font-size: 2.2cqw; }
      .nm { font-size: 4.2cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; margin-bottom: .4cqw; }
      .acts { display: flex; flex-direction: column; gap: 1.3cqw; margin-top: 1.4cqw; width: 23cqw; }
      .go, .vd { display: flex; align-items: center; justify-content: center; gap: 1cqw; height: 5.6cqw; border-radius: 1cqw; font-size: 2.6cqw; font-weight: 750; white-space: nowrap; }
      .go .ico, .vd .ico { --s: 2.8cqw; }
      .go { background: #52a12f; color: #fff; box-shadow: inset 0 -.55cqw 0 #33721b, inset 0 .25cqw 0 rgba(255, 255, 255, .3), 0 1.2cqw 2.4cqw -1.2cqw rgba(30, 80, 10, .6); }
      .vd { background: #fff; color: var(--ink); box-shadow: inset 0 0 0 .22cqw var(--line-2); }
      .rec { z-index: 3; padding: 2.6cqw 2.4cqw; display: flex; flex-direction: column; gap: 1.4cqw; }
      .rh { display: flex; align-items: center; gap: 1cqw; font-size: 2.6cqw; font-weight: 750; color: var(--ink); margin-bottom: .4cqw; }
      .rh .ico { color: rgb(var(--tint)); }
      .lr { display: flex; align-items: center; gap: 1.4cqw; padding: .9cqw; border-radius: 1.3cqw; }
      .lr.on { background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); box-shadow: inset 0 0 0 .25cqw rgb(var(--tint)); }
      .th { flex: none; display: grid; place-items: center; width: 5.8cqw; height: 5.8cqw; border-radius: 1cqw; overflow: hidden; }
      .t1 { background: #fde6d6; place-items: end center; }
      .t1 .px { width: 4.8cqw; display: block; }
      .t2 { background: linear-gradient(150deg, #7b6cf0, #4a8fe6); }
      .t2 .px { width: 3.4cqw; display: block; }
      .t3 { background: linear-gradient(150deg, #5cc0e8, #4caf50); }
      .ln { display: flex; align-items: center; gap: 1cqw; }
      .ln b { font-size: 2.45cqw; font-weight: 700; white-space: nowrap; }
      .ln .chip { font-size: 2cqw; }
    `,
  });
})();
