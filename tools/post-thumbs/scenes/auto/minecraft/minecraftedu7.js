/* Minecraft — PBL 수업하기: 수업 목표 및 조건 슬라이드(건축 발주서 + 사용자 5인 니즈) */
(() => {
  const pix = (rows, pal) => {
    let r = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        let n = 1;
        while (row[x + n] === row[x]) n += 1;
        if (pal[row[x]]) r += `<rect x="${x}" y="${y}" width="${n}" height="1.02" fill="${pal[row[x]]}"/>`;
        x += n;
      }
    });
    return `<svg class="px" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges">${r}</svg>`;
  };
  const HANOK = [
    '......rrrr......',
    '...rrrrrrrrrr...',
    'r.rrrrrrrrrrrr.r',
    'rrrrrrrrrrrrrrrr',
    '.RRRRRRRRRRRRRR.',
    '..pwwwpwwpwwwp..',
    '..pwwwpddpwwwp..',
    '..pwwwpddpwwwp..',
    '.ssssssssssssss.',
    'gggggggggggggggg',
  ];
  const PAL = { r: '#4a5260', R: '#353b46', p: '#8a5a32', w: '#f6eedb', d: '#c08850', s: '#c3c7cb', g: '#6fb24a' };

  scene('minecraft/minecraftedu7', (K) => {
    const req = (t) => `<li><i class="check on"></i>${t}</li>`;
    const users = [['#4a7fd6', 'person'], ['#e0912f', 'person'], ['var(--pink)', 'person'], ['#7b61c9', 'person'], ['#2f9a8f', 'person']];
    return K.win({
      x: 4, y: 9.5, w: 64, h: 50, title: '수업 목표 및 조건', icon: false,
      barRight: K.chip('3 / 12', { line: true }),
      body: `<div class="cv"><div class="page sl">
          ${K.chip('건축 발주서', { solid: true, icon: 'clipboard_task_list_ltr' })}
          <p class="hd">한국 전통 건축 재창작</p>
          <div class="two">
            <ul class="rq">${req('전통 지붕·처마 살리기')}${req('친환경 구조')}${req('공동체 공간')}</ul>
            <div class="pic">${pix(HANOK, PAL)}</div>
          </div>
          <div class="out">${K.chip('웹 포트폴리오', { line: true, icon: 'globe_desktop' })}${K.chip('영상 녹화', { line: true, icon: 'video_clip' })}${K.chip('발표', { line: true, icon: 'presenter' })}</div>
        </div></div>`,
    })
      + K.card({
        x: 60, y: 25, w: 35, cls: 'nd',
        body: `<p class="nh">${K.ico('people_community', { s: 2.8 })}사용자 5인의 니즈</p>
          <div class="us">${users.map(([c, i], n) => `<span class="u${n === 1 ? ' on' : ''}" style="--c:${c}">${K.ico(i, { s: 2.6 })}</span>`).join('')}</div>
          <p class="need"><b>어르신</b>문턱 없는 마루</p>`,
      })
      + K.tile({ x: 1.4, y: 3.6, s: 10.5 })
      + K.float({ right: 8, y: 14, icon: 'checkmark', far: true, s: 5.4 })
      + K.pill({ right: 4, y: 3.4, icon: 'building_home', text: '발주서로 여는 PBL' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .win__bar { padding-left: 12.5cqw; }
      .win__bar .chip { font-size: 2.1cqw; padding: .6cqw 1.4cqw; }
      .cv { height: 100%; padding: 2.2cqw 3cqw 0; background: rgba(240, 246, 236, .7); }
      .sl { height: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 1.3cqw; padding: 2.4cqw 3.2cqw 0; border-radius: 1.4cqw 1.4cqw 0 0; }
      .sl > .chip { font-size: 2.2cqw; }
      .hd { font-size: 3.5cqw; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap; }
      .two { display: flex; gap: 2.4cqw; width: 100%; align-items: flex-start; }
      .rq { list-style: none; display: flex; flex-direction: column; gap: 1.5cqw; padding: 0; margin: .6cqw 0 0; }
      .rq li { display: flex; align-items: center; gap: 1.2cqw; font-size: 2.5cqw; font-weight: 650; white-space: nowrap; color: var(--ink); }
      .out { display: flex; gap: 1.2cqw; width: 100%; margin-top: .6cqw; padding-top: 1.8cqw; border-top: .2cqw solid var(--line); }
      .out .chip { font-size: 2.2cqw; }
      .out .chip .ico { color: rgb(var(--tint)); }
      .pic { flex: none; width: 19cqw; display: grid; place-items: end center; height: 13.4cqw; padding: 0 1.4cqw; border-radius: 1.4cqw; background: linear-gradient(180deg, #bfe6ff, #eef8ff); overflow: hidden; }
      .pic .px { width: 100%; display: block; }
      .nd { z-index: 3; padding: 2.6cqw 2.8cqw; display: flex; flex-direction: column; gap: 1.8cqw; }
      .nh { display: flex; align-items: center; gap: .9cqw; font-size: 2.6cqw; font-weight: 750; white-space: nowrap; }
      .nh .ico { color: rgb(var(--tint)); }
      .us { display: flex; justify-content: space-between; }
      .u { display: grid; place-items: center; width: 4.8cqw; height: 4.8cqw; border-radius: 50%; background: var(--c); color: #fff; box-shadow: inset 0 .15cqw 0 rgba(255, 255, 255, .3); }
      .u.on { box-shadow: 0 0 0 .4cqw #fff, 0 0 0 .75cqw rgb(var(--tint)); }
      .need { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.2cqw; background: color-mix(in srgb, rgb(var(--tint)) 12%, #fff); font-size: 2.5cqw; font-weight: 650; white-space: nowrap; }
      .need b { color: rgb(var(--tint)); font-weight: 800; }
    `,
  });
})();
