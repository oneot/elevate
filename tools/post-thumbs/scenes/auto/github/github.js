/* github/github — sign-up form with Create account, then two-factor methods in settings/security */
(() => {
  scene('github/github', (K) => {
    const fd = (label, value, cls = '') => `<div class="fd ${cls}"><small>${label}</small><div class="in">${value}</div></div>`;
    const mt = (icon, name, on) => `<div class="mt${on ? ' on' : ''}">${K.ico(icon, { s: 3 })}<b>${name}</b>${on ? K.ico('checkmark_circle', { s: 3, c: 'var(--green)' }) : K.skel(4.6, { h: 1.3 })}</div>`;
    return K.win({
      x: 5, y: 9, w: 60, h: 50, icon: false, title: 'github.com/signup',
      body: `<div class="su">
        <p class="h">Sign up to GitHub</p>
        <div class="sso"><span>Continue with Google</span><span>Apple</span></div>
        ${fd('Email', 'kim@school.kr')}
        ${fd('Password', '<span class="dots">••••••••••</span>')}
        <div class="go hl">${K.btn('Create account', { primary: true })}</div>
      </div>`,
    })
      + K.card({
        x: 59, y: 18.5, w: 36, cls: 'tf',
        body: `<div class="th">${K.ico('shield_lock', { s: 3.2, c: 'rgb(var(--tint))' })}<b>Two-factor methods</b></div>
          ${mt('phone_key', 'Authenticator app', true)}
          ${mt('chat_lock', 'SMS', false)}
          ${mt('phone', 'GitHub Mobile', false)}`,
      })
      + K.tile({ x: 1.4, y: 4.2, s: 10.5 })
      + K.float({ x: 70, bottom: 1.8, icon: 'mail_checkmark', s: 6.4 })
      + K.pill({ right: 4, y: 4.4, icon: 'shield_checkmark', text: '가입부터 2차 인증까지' });
  }, {
    deco: { big: 'sphere', small: 'bubbles', v: 0 },
    css: `
      .win__bar { padding-left: 11cqw; }
      .su { height: 100%; display: flex; flex-direction: column; gap: 1.6cqw; width: 52cqw; padding: 2.4cqw 4.6cqw 0; }
      .h { font-size: 3.3cqw; font-weight: 750; letter-spacing: -0.02em; }
      .sso { display: flex; gap: 1.4cqw; }
      .sso span { flex: 1; display: grid; place-items: center; height: 4.4cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.2cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .sso span:last-child { flex: none; width: 13cqw; }
      .fd { display: flex; flex-direction: column; gap: .5cqw; }
      .fd small { font-size: 2.2cqw; font-weight: 650; color: var(--ink-3); }
      .fd .in { display: flex; align-items: center; height: 4.6cqw; padding: 0 1.8cqw; border-radius: 1.2cqw; background: #fff; box-shadow: inset 0 0 0 .2cqw var(--line-2); font-size: 2.6cqw; font-weight: 650; white-space: nowrap; }
      .dots { letter-spacing: .18em; color: var(--ink-2); }
      .go { margin-top: .4cqw; border-radius: 1.6cqw; }
      .go .btn { width: 100%; justify-content: center; height: 5.6cqw; font-size: 2.8cqw; font-weight: 750; }
      .tf { z-index: 3; display: flex; flex-direction: column; gap: 1.3cqw; padding: 2.6cqw; }
      .th { display: flex; align-items: center; gap: 1cqw; margin-bottom: .4cqw; }
      .th b { font-size: 2.6cqw; font-weight: 750; letter-spacing: -0.02em; white-space: nowrap; }
      .mt { display: flex; align-items: center; gap: 1.2cqw; padding: 1.2cqw 1.6cqw; border-radius: 1.3cqw; background: var(--fill); color: var(--ink-3); }
      .mt b { flex: 1; font-size: 2.3cqw; font-weight: 650; color: var(--ink-2); white-space: nowrap; }
      .mt.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); box-shadow: 0 0 0 .3cqw color-mix(in srgb, rgb(var(--tint)) 55%, #fff); color: rgb(var(--tint)); }
      .mt.on b { font-weight: 750; color: var(--ink); }
    `,
  });
})();
