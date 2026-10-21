/* Reflect — Insights 리플렉션 report: one student's check-in mood over two weeks, a low day picked out */
(() => {
  scene('teams/teams-reflect', (K) => {
    const F = [
      ['emoji_sad', '#e5484d'],
      ['emoji_sad_slight', '#f08a3c'],
      ['emoji_meh', '#f0b429'],
      ['emoji_smile_slight', '#86c34f'],
      ['emoji_laugh', '#22a96f'],
    ];
    const days = [3, 4, 3, 3, 2, 3, 1, 0, 1, 3];
    const pick = 7;
    const top = (l) => 10 + (4 - l) * 20;
    const left = (i) => i * 10 + 5;
    const line = days.map((l, i) => `${left(i)},${top(l)}`).join(' ');
    const dots = days.map((l, i) => `<span class="dt${i === pick ? ' on' : ''}" style="left:${left(i)}%;top:${top(l)}%">${K.ico(`${F[l][0]}_24_filled`, { s: i === pick ? 4.6 : 3.4, c: F[l][1] })}</span>`).join('');
    return K.win({
      x: 4, y: 11, w: 66, h: 50, title: 'Insights', sub: ' · 리플렉션', icon: false,
      body: `<div class="rf">
        <div class="row hd">${K.avatar('김', { s: 4.8 })}<b class="nm">김○○</b>${K.chip('체크인 10회', { tint: true })}<span class="grow"></span>${K.chip('최근 2주', { line: true, icon: 'calendar_ltr:r' })}</div>
        <div class="ch">
          <div class="gl">${'<i></i>'.repeat(5)}</div>
          <span class="band"></span>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${line}" /></svg>
          ${dots}
        </div>
        <div class="ax"><span>10월 6일</span><span>10월 17일</span></div>
      </div>`,
    })
      + K.card({
        x: 62, y: 25, w: 31, cls: 'pop',
        body: `<div class="pp">
          <p class="t-s">10월 15일 체크인</p>
          <div class="row fc">${K.ico('emoji_sad_24_filled', { s: 5.4, c: '#e5484d' })}<b>힘들어요</b></div>
          ${K.skel('92%')}${K.skel('64%')}
        </div>`,
      })
      + K.tile({ x: 1.2, y: 5, s: 11 })
      + K.float({ right: 7, y: 14, icon: 'heart' })
      + K.pill({ right: 4, bottom: 3.4, icon: 'person_heart', text: '감정 흐름으로 상담 준비' });
  }, {
    deco: { big: 'bubbles', small: 'sphere', v: 2 },
    css: `
      .win__bar { padding-left: 13cqw; }
      .rf { padding: 2.8cqw 3.2cqw 0; }
      .hd { gap: 1.4cqw; }
      .nm { font-size: 3cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .ch { position: relative; height: 22cqw; margin: 2.8cqw 9cqw 0 .4cqw; }
      .gl { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 2.2cqw 0; }
      .gl i { height: .16cqw; background: rgba(20, 22, 30, .07); }
      .band { position: absolute; left: 70%; width: 10%; top: -1cqw; bottom: -1cqw; border-radius: 1.4cqw; background: color-mix(in srgb, var(--red) 9%, transparent); box-shadow: inset 0 0 0 .22cqw color-mix(in srgb, var(--red) 30%, transparent); }
      .ch svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
      .ch polyline { fill: none; stroke: color-mix(in srgb, rgb(var(--tint)) 55%, #fff); stroke-width: .5cqw; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
      .dt { position: absolute; translate: -50% -50%; display: grid; place-items: center; padding: .35cqw; border-radius: 50%; background: #fff; box-shadow: 0 .4cqw 1cqw -.4cqw rgba(20, 22, 30, .3); }
      .dt.on { box-shadow: 0 0 0 .4cqw var(--red), 0 .8cqw 1.8cqw -.6cqw rgba(229, 72, 77, .6); }
      .ax { display: flex; justify-content: space-between; margin: 2.2cqw 7cqw 0 0; font-size: 2.1cqw; font-weight: 600; color: var(--ink-4); }
      .pop { z-index: 4; }
      .pp { display: flex; flex-direction: column; gap: 1.4cqw; padding: 2.6cqw 2.8cqw 3cqw; }
      .fc { gap: 1.4cqw; margin-bottom: .6cqw; }
      .fc b { font-size: 3.4cqw; font-weight: 750; letter-spacing: -0.03em; white-space: nowrap; }
    `,
  });
})();
