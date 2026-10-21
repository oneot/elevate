/* copilot/prompt-coach — Prompt Coach answers a one-line request with a structured prompt; [bracket] slots to edit, then copy. */
(() => {
  scene('copilot/prompt-coach', (K) => K.win({
    x: 35, y: 8.5, w: 61, h: 51, icon: false, title: 'Prompt Coach', sub: '· 에이전트',
    body: `<div class="cv">
      ${K.bubble('한국사 수행평가 루브릭 프롬프트 써 줘', { me: true })}
      <div class="ans">
        <div class="ah"><span class="bi">${K.ico('prompt', { s: 2.6 })}</span><b>추천 프롬프트</b><span class="sp"></span>${K.btn('복사', { primary: true, icon: 'copy' })}</div>
        <div class="pb hl">
          <p class="l1">당신은 고등학교 한국사 교사입니다</p>
          <div class="sec"><b>1. 목표</b>${K.skel('62%')}</div>
          <div class="kv"><span>과목</span><i class="br">[고1 한국사]</i></div>
          <div class="kv"><span>과제</span><i class="br">[조사 보고서]</i>${K.skel('30%')}</div>
          ${K.skel('84%')}
        </div>
      </div>
    </div>`,
  })
    + K.cursor({ x: 90.6, y: 30.4 })
    + K.tile({ x: 30, y: 3.6, s: 10.5 })
    + K.float({ x: 17, y: 17, icon: 'sparkle', s: 6.4 })
    + K.pill({ x: 3.6, bottom: 5, icon: 'wand', text: '말하면 프롬프트 완성' }), {
    deco: { big: 'ribbon', small: 'sphere', v: 1 },
    css: `
      .win__bar { padding-left: 9cqw; }
      .cv { display: flex; flex-direction: column; gap: 2.4cqw; height: 100%; padding: 2.8cqw 3.2cqw 0; }
      .bubble { font-size: 2.5cqw; font-weight: 650; white-space: nowrap; }
      .ans { display: flex; flex-direction: column; gap: 1.8cqw; }
      .ah { display: flex; align-items: center; gap: 1.2cqw; }
      .ah b { font-size: 2.7cqw; font-weight: 750; letter-spacing: -0.02em; }
      .ah .sp { flex: 1; }
      .bi { display: grid; place-items: center; width: 4.4cqw; height: 4.4cqw; border-radius: 1.2cqw; background: var(--grad); color: #fff; }
      .ah .btn { padding: 1cqw 2cqw; font-size: 2.4cqw; }
      .pb { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.4cqw 2.6cqw 3cqw; border-radius: 1.8cqw; background: rgba(255, 255, 255, .94); }
      .l1 { font-size: 2.6cqw; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap; }
      .sec { display: flex; align-items: center; gap: 1.6cqw; }
      .sec b { flex: none; font-size: 2.4cqw; font-weight: 750; color: rgb(var(--tint)); }
      .kv { display: flex; align-items: center; gap: 1.4cqw; }
      .kv span { flex: none; font-size: 2.3cqw; font-weight: 600; color: var(--ink-3); }
      .br { flex: none; font-style: normal; padding: .5cqw 1.1cqw; border-radius: .7cqw; background: color-mix(in srgb, #f4b63a 26%, #fff); box-shadow: inset 0 -.3cqw 0 #f4b63a; font-size: 2.5cqw; font-weight: 750; color: var(--ink); white-space: nowrap; }
    `,
  });
})();
