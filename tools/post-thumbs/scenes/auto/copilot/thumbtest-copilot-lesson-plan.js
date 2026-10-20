/* copilot/thumbtest-copilot-lesson-plan — Copilot drafts a 40-minute lesson plan (도입·전개·정리), teacher reviews it. */
(() => {
  const mix = (p) => `color-mix(in srgb, rgb(var(--tint)) ${p}%, #fff)`;

  scene('copilot/thumbtest-copilot-lesson-plan', (K) => {
    const row = (step, min, body, on) => `<div class="st${on ? ' on' : ''}"><b>${step}</b><span class="mn">${min}</span><div class="sb">${body}</div></div>`;
    return K.win({
      x: 4, y: 7.5, w: 68, h: 53, title: 'Copilot', sub: '· 새 채팅',
      body: `<div class="lp">
        ${K.bubble('중2 과학 40분 지도안 만들어 줘', { me: true })}
        <div class="res">
          <div class="rh"><span class="ti">${K.ico('document_sparkle')}</span>물질의 상태 변화 · 40분 지도안</div>
          <div class="tl"><i style="--f:5"></i><i class="on" style="--f:30"></i><i style="--f:5"></i></div>
          ${row('도입', '5분', K.skel('72%'))}
          ${row('전개', '30분', `${K.chip('모둠 활동', { tint: true, icon: 'people_team' })}${K.skel('44%', { tint: true })}`, true)}
          ${row('정리', '5분', K.skel('60%'))}
        </div>
      </div>`,
    }) + K.card({
      x: 69, y: 11, w: 27, cls: 'rv', body: `
        <div class="hd"><span class="ti">${K.ico('clipboard_task_list_ltr')}</span>검토 요령</div>
        <div class="ck"><span class="check on"></span>사실 확인</div>
        <div class="ck"><span class="check on"></span>시간 배분</div>
        <div class="ck"><span class="check"></span>평가 연결</div>`,
    }) + K.pill({ right: 4, bottom: 5, icon: 'timer', text: '지도안 뼈대 15분 완성' });
  }, {
    css: `
      .bubble--me { background: ${mix(12)}; color: var(--ink); }
      .ti { flex: none; display: grid; place-items: center; width: 4.6cqw; height: 4.6cqw; border-radius: 1.3cqw; background: ${mix(12)}; color: rgb(var(--tint)); }
      .ti .ico { --s: 2.7cqw; }
      .lp { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 3cqw; }
      .lp .bubble { margin-right: 2.4cqw; font-size: 2.4cqw; }
      .res { display: flex; flex-direction: column; gap: 1.1cqw; width: 54cqw; padding: 2.2cqw 2.8cqw 2.6cqw; border-radius: 1.8cqw; background: #fff; box-shadow: 0 0 0 .2cqw var(--line-2); }
      .rh { display: flex; align-items: center; gap: 1.3cqw; font-size: 2.7cqw; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
      .tl { display: flex; gap: .5cqw; height: 1.4cqw; margin: .4cqw 0 .6cqw; }
      .tl i { flex: var(--f); border-radius: 99px; background: ${mix(22)}; }
      .tl i.on { background: var(--grad); }
      .st { display: flex; align-items: center; gap: 1.4cqw; padding: 1.1cqw 1.6cqw; border-radius: 1.3cqw; }
      .st b { flex: none; width: 5.4cqw; font-size: 2.45cqw; font-weight: 700; }
      .st .mn { flex: none; width: 5.6cqw; font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
      .st .sb { flex: 1; display: flex; align-items: center; gap: 1.4cqw; }
      .st.on { background: ${mix(7)}; box-shadow: inset 0 0 0 .25cqw ${mix(45)}; }
      .st.on .mn { color: rgb(var(--tint)); }
      .rv { display: flex; flex-direction: column; gap: 1.8cqw; padding: 2.6cqw 2.8cqw 2.8cqw; }
      .rv .hd { display: flex; align-items: center; gap: 1.2cqw; margin-bottom: .3cqw; font-size: 2.6cqw; font-weight: 700; }
      .ck { display: flex; align-items: center; gap: 1.3cqw; font-size: 2.4cqw; font-weight: 650; white-space: nowrap; }
      .ck:last-child { color: var(--ink-3); }
    `,
  });
})();
