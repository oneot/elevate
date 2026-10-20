/* azure/thumbtest-azure-student-lab — budget alert in Cost Management before the first lab */
(() => {
  scene('azure/thumbtest-azure-student-lab', (K) => {
    const rule = (p, label) => `<div class="rule">
        <span class="pct">${p}</span><span class="lb">${label}</span>
        <span class="sp"></span>${K.ico('mail', { s: 2.6, c: 'rgb(var(--tint))' })}<i class="toggle on"></i>
      </div>`;
    return K.win({
      x: 12, y: 8.5, w: 92, h: 54, title: '비용 관리', sub: '예산', cls: 'pw',
      body: `<div class="grid">
        <div class="sum">
          <div class="row nm">${K.ico('savings', { s: 3, c: 'rgb(var(--tint))' })}<b>실습 예산</b></div>
          ${K.chip('rg-class-web-01', { icon: 'folder' })}
          <div class="amt"><span class="t-num">₩3,200</span><em>/ ₩10,000</em></div>
          <div class="progress"><i style="--p:32%"></i></div>
          <div class="sk">${K.skel('70%')}</div>
        </div>
        <div class="al hl">
          <div class="row ah">${K.ico('alert', { s: 2.8, c: 'rgb(var(--tint))' })}<b>알림 조건</b></div>
          ${rule('50%', '실제 비용')}
          ${rule('80%', '실제 비용')}
          ${K.skel('58%')}
        </div>
      </div>`,
    })
      + K.pill({ x: 3.5, bottom: 3.4, icon: 'mail_alert', text: '비용 걱정 없는 실습' });
  }, {
    css: `
      .grid { display: grid; grid-template-columns: 34cqw 42cqw; gap: 3.4cqw; padding: 3.4cqw 3.2cqw; }
      .sum { display: flex; flex-direction: column; align-items: flex-start; gap: 1.8cqw; }
      .nm b, .ah b { font-size: 2.8cqw; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
      .amt { display: flex; align-items: baseline; gap: 1cqw; margin-top: .6cqw; white-space: nowrap; }
      .amt em { font-style: normal; font-size: 2.3cqw; font-weight: 600; color: var(--ink-4); }
      .sum .progress { align-self: stretch; height: 1.6cqw; }
      .sk { display: flex; flex-direction: column; gap: 1cqw; align-self: stretch; margin-top: .6cqw; }
      .al { display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.6cqw 2.8cqw 3cqw; border-radius: 2.2cqw; background: rgba(255, 255, 255, .78); }
      .ah { margin-bottom: .2cqw; }
      .rule { display: flex; align-items: center; gap: 1.4cqw; padding: 1.3cqw 1.6cqw; border-radius: 1.4cqw; background: var(--fill); white-space: nowrap; }
      .rule .pct { font-size: 3cqw; font-weight: 700; letter-spacing: -0.03em; color: rgb(var(--tint)); }
      .rule .lb { font-size: 2.4cqw; font-weight: 600; color: var(--ink-3); }
      .rule .sp { flex: 1; }
    `,
  });
})();
