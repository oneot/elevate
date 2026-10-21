/* Minecraft — 블록 코딩 시작하기: Code Builder의 run(distance) 블록 + 채팅 run 10 → 챌린지 1 완료 */
(() => {
  scene('minecraft/minecraft-education-block-coding', (K) => {
    const hat = (cmd, param) => `<div class="blk hat">다음 채팅명령어를 입력하면 <span class="sv">"${cmd}"</span>${param ? `<span class="vr">${param}</span>` : ''}</div>`;
    return K.win({
      x: 33, y: 10, w: 64, h: 50, title: 'Code Builder', sub: 'agent_tutorial', icon: false,
      barRight: `<span class="run">${K.ico('play', { s: 2.6 })}</span>`,
      body: `<div class="cb">
          <div class="canvas">
            <div class="grp">${hat('run', 'distance')}
              <div class="inner"><div class="blk ag">에이전트 앞으로 이동 <span class="vr hot">distance</span></div></div>
              <i class="foot"></i></div>
            <div class="grp">${hat('come')}
              <div class="inner"><div class="blk ag">플레이어 위치로 순간이동</div></div>
              <i class="foot"></i></div>
          </div>
        </div>`,
    })
      + K.card({
        x: 3.5, y: 26, w: 33, cls: 'chat',
        body: `<p class="old">&lt;교사&gt; come</p>
          <div class="in">${K.ico('chat', { s: 2.8 })}<b>run <em>10</em></b><i class="caret"></i></div>
          <div class="done">${K.ico('checkmark_circle', { s: 3 })}챌린지 1 완료</div>`,
      })
      + K.tile({ x: 28.4, y: 4.6, s: 10.5 })
      + K.float({ x: 7, y: 11, icon: 'flag' })
      + K.pill({ right: 4, y: 3, icon: 'puzzle_piece', text: '블록으로 에이전트 조종' });
  }, {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .run { display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 50%; background: var(--grad); color: #fff; }
      .cb { position: absolute; inset: 0; display: flex; }
      .canvas { flex: 1; display: flex; flex-direction: column; gap: 2.6cqw; padding: 3.2cqw 2.6cqw 0 5.6cqw; background-color: rgba(255, 255, 255, .85); background-image: radial-gradient(#dfe3e8 .18cqw, transparent .2cqw); background-size: 2.6cqw 2.6cqw; }
      .grp { display: flex; flex-direction: column; align-items: flex-start; }
      .blk { --bc: #1e90ff; display: inline-flex; align-items: center; gap: 1cqw; height: 6cqw; padding: 0 1.8cqw; border-radius: .9cqw; background: var(--bc); color: #fff; font-size: 2.5cqw; font-weight: 700; white-space: nowrap; box-shadow: inset 0 -.4cqw 0 rgba(0, 0, 0, .16); }
      .blk.hat { border-radius: 2.6cqw 2.6cqw .9cqw 0; }
      .blk.ag { --bc: #d83b01; }
      .sv { display: inline-grid; place-items: center; height: 4cqw; padding: 0 1.2cqw; border-radius: .7cqw; background: #fff; color: var(--ink); font-size: 2.4cqw; }
      .vr { display: inline-grid; place-items: center; height: 4cqw; padding: 0 1.4cqw; border-radius: 99px; background: #e5484d; color: #fff; font-size: 2.4cqw; box-shadow: inset 0 0 0 .25cqw rgba(255, 255, 255, .55); }
      .vr.hot { margin-left: .5cqw; box-shadow: 0 0 0 .45cqw #fff, 0 0 0 .8cqw #ffb020; }
      .inner { display: flex; flex-direction: column; align-items: flex-start; padding: .4cqw 0; border-left: 2.4cqw solid #1e90ff; }
      .foot { width: 16cqw; height: 2.2cqw; border-radius: 0 .9cqw .9cqw .9cqw; background: #1e90ff; box-shadow: inset 0 -.4cqw 0 rgba(0, 0, 0, .16); }
      .chat { z-index: 3; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.8cqw; }
      .old { font-size: 2.2cqw; font-weight: 600; color: var(--ink-3); white-space: nowrap; }
      .in { display: flex; align-items: center; gap: 1.2cqw; height: 6.4cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; background: rgba(30, 33, 38, .9); color: #fff; }
      .in .ico { color: #9fe07a; }
      .in b { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 3cqw; font-weight: 700; white-space: nowrap; }
      .in b em { font-style: normal; color: #ffb020; }
      .caret { width: .3cqw; height: 3.4cqw; background: #fff; }
      .done { display: flex; align-items: center; gap: 1cqw; align-self: flex-start; height: 5cqw; padding: 0 1.8cqw; border-radius: 99px; background: color-mix(in srgb, var(--green) 14%, #fff); color: #23802f; font-size: 2.7cqw; font-weight: 750; white-space: nowrap; }
    `,
  });
})();
