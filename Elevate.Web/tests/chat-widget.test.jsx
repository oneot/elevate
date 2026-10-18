// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, StrictMode, useEffect, useLayoutEffect, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../src/App';
import { CHAT_CONNECTION_TIMEOUT_MS, CHAT_TOKEN_TIMEOUT_MS } from '../src/services/webChatSession';

const { lines, stores, sdkBehavior } = vi.hoisted(() => ({ lines: [], stores: [], sdkBehavior: { crash: false } }));
vi.mock('../src/services/clarity', () => ({ setClarityTag: vi.fn(), trackClarityEvent: vi.fn() }));
vi.mock('../src/pages/Home', () => ({ default: () => <h1>홈 게시글</h1> }));
vi.mock('../src/pages/PostList', () => ({ default: () => <h1>전체 게시글</h1> }));
vi.mock('../src/pages/Elevathon', () => ({ default: () => <h1>Elevathon</h1> }));

vi.mock('botframework-webchat', () => ({
  createDirectLine: vi.fn(options => {
    let status = 0;
    const statuses = new Set();
    const activities = new Set();
    const controller = new AbortController();
    const line = {
      ...options,
      options,
      controller,
      watermark: options.watermark || '',
      emit(value) {
        status = value;
        statuses.forEach(observer => observer.next(value));
      },
      receive(activity) {
        line.watermark = activity.id;
        activities.forEach(observer => observer.next(activity));
      },
      connectionStatus$: {
        subscribe(observer) {
          statuses.add(observer);
          observer.next(status);
          return { unsubscribe: vi.fn(() => statuses.delete(observer)) };
        },
      },
      activity$: {
        subscribe: vi.fn(observer => {
          activities.add(observer);
          if (status === 0) {
            line.emit(1);
            fetch(`https://directline.example.test/conversations${options.conversationId ? `/${options.conversationId}` : ''}`, {
              method: options.conversationId ? 'GET' : 'POST',
              signal: controller.signal,
            }).then(response => response.json()).then(data => {
              if (controller.signal.aborted) return;
              line.conversationId = data.conversationId;
              line.token = data.token;
              line.emit(2);
            }, () => {
              if (!controller.signal.aborted) line.emit(4);
            });
          }
          return { unsubscribe: vi.fn(() => activities.delete(observer)) };
        }),
      },
      end: vi.fn(() => {
        controller.abort();
        line.emit(5);
      }),
    };
    lines.push(line);
    return line;
  }),
  createStore: vi.fn((_, middleware) => {
    let activities = [];
    const listeners = new Set();
    const store = {
      actions: [],
      getState: () => activities,
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    store.dispatch = middleware({ dispatch: action => store.dispatch(action) })(action => {
      store.actions.push(action);
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        activities = [...activities, action.payload.activity];
        listeners.forEach(listener => listener());
      }
      return action;
    });
    stores.push(store);
    return store;
  }),
  default: function TestWebChat({ directLine, store, userID, disabled, styleOptions }) {
    if (sdkBehavior.crash) throw new Error('Fixture SDK rendering failure');
    const activities = useSyncExternalStore(store.subscribe, store.getState);
    useEffect(() => {
      const statusSubscription = directLine.connectionStatus$.subscribe({
        next: status => {
          if (status === 2) store.dispatch({
            type: 'DIRECT_LINE/CONNECT_FULFILLED', payload: { directLine }, meta: { userID: userID || 'fixture-user' },
          });
        },
      });
      const activitySubscription = directLine.activity$.subscribe({
        next: activity => store.dispatch({ type: 'DIRECT_LINE/INCOMING_ACTIVITY', payload: { activity } }),
      });
      return () => {
        statusSubscription.unsubscribe();
        activitySubscription.unsubscribe();
      };
    }, [directLine, store, userID]);
    return (
      <div data-webchat style={{ backgroundColor: styleOptions.backgroundColor }}>
        {activities.map(activity => (
          <p key={activity.id} style={{ backgroundColor: styleOptions.bubbleBackground, color: styleOptions.bubbleTextColor }}>
            {activity.text}
          </p>
        ))}
        <div className="webchat__send-box" data-user-id={userID || 'fixture-user'}>
          <div className="webchat__send-box__main">
            <input aria-label="메시지 입력" disabled={disabled} />
          </div>
        </div>
      </div>
    );
  },
}));

let root;
let host;
let navigate;
let calls;

function LocationProbe() {
  const go = useNavigate();
  useLayoutEffect(() => { navigate = go; }, [go]);
  return null;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function defaultResponse(url) {
  return Response.json(url.includes('token.example')
    ? { token: 'fixture-token' }
    : { conversationId: new URL(url).pathname.split('/')[2] || `conversation-${lines.length}`, token: 'refreshed-token' });
}

function mockFetch(implementation = url => Promise.resolve(defaultResponse(url))) {
  fetch.mockImplementation((url, options) => {
    calls.push({ url, options, at: Date.now() });
    return implementation(url, options);
  });
}

async function renderRoute(route = '/', strict = false) {
  const app = <MemoryRouter initialEntries={[route]}><LocationProbe /><App /></MemoryRouter>;
  await act(() => root.render(strict ? <StrictMode>{app}</StrictMode> : app));
  await act(() => vi.dynamicImportSettled());
}

async function click(label) {
  const button = [...host.querySelectorAll('button')].find(item =>
    item.getAttribute('aria-label') === label || item.textContent === label);
  expect(button, label).toBeTruthy();
  await act(() => button.click());
  await act(() => vi.dynamicImportSettled());
}

function greeting(id = 'greeting') {
  return { id, type: 'message', from: { role: 'bot' }, text: '로컬 모의 대화입니다.' };
}

function startEvents() {
  return stores.flatMap(store => store.actions).filter(action => action.type === 'WEB_CHAT/SEND_EVENT');
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubEnv('VITE_BOT_TOKEN_ENDPOINT', 'https://token.example.test');
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  calls = [];
  lines.length = 0;
  stores.length = 0;
  sdkBehavior.crash = false;
  mockFetch();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it.each(['/', '/all'])('starts token and connection requests before any click on %s, without holding page rendering', async route => {
  mockFetch(url => new Promise(resolve => setTimeout(
    () => resolve(defaultResponse(url)), url.includes('token.example') ? 2000 : 3000,
  )));
  await renderRoute(route);
  expect(host.querySelector('h1').textContent).toContain('게시글');
  expect(calls.map(call => call.at)).toEqual([0]);
  expect(host.querySelector('.chat-panel-stage').getAttribute('aria-hidden')).toBe('true');
  expect(host.querySelector('.chat-panel-stage').hasAttribute('inert')).toBe(true);
  expect(host.querySelector('.chat-toggle').getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('preparing');

  await act(() => vi.advanceTimersByTimeAsync(2000));
  expect(lines).toHaveLength(1);
  expect(calls[1].url).toBe('https://directline.example.test/conversations');
  expect(calls[1].at).toBe(2000);
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('connecting');
  expect(host.querySelector('input').disabled).toBe(true);

  await act(() => vi.advanceTimersByTimeAsync(3000));
  await act(() => lines[0].receive(greeting()));
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('connected');
  await act(() => vi.advanceTimersByTimeAsync(3000));
  await click('채팅 열기');
  expect(Date.now()).toBe(8000);
  expect(host.querySelector('input').disabled).toBe(false);
  expect(host.textContent).toContain('로컬 모의 대화입니다.');
  expect(calls).toHaveLength(2);
  expect(startEvents()).toHaveLength(1);
});

it('opens immediately during a slow token and connection, but never labels them connected early', async () => {
  const token = deferred();
  const connect = deferred();
  mockFetch(url => url.includes('token.example') ? token.promise : connect.promise);
  await renderRoute('/all');
  await click('채팅 열기');
  expect(host.querySelector('h1').textContent).toBe('전체 게시글');
  expect(host.querySelector('.chat-panel-stage').getAttribute('aria-hidden')).toBe('false');
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('preparing');
  await act(() => token.resolve(Response.json({ token: 'fixture-token' })));
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('connecting');
  await act(() => connect.resolve(Response.json({ conversationId: 'conversation-1', token: 'refreshed-token' })));
  expect(host.querySelector('.chat-online-dot').dataset.status).toBe('connected');
  expect(host.querySelector('input').disabled).toBe(false);
  expect(host.querySelector('.chat-connection-state')).toBeNull();
});

it('keeps a single conversation and store through close, repeated toggles, navigation, and the hidden Elevathon route', async () => {
  await renderRoute('/all');
  await act(() => lines[0].receive(greeting()));
  await click('채팅 열기');
  await click('채팅 닫기');
  await click('채팅 열기');
  const toggle = host.querySelector('.chat-toggle');
  await act(() => { toggle.click(); toggle.click(); });
  await act(() => navigate('/'));
  await act(() => vi.dynamicImportSettled());
  await act(() => navigate('/elevathon'));
  await act(() => vi.dynamicImportSettled());
  expect(host.querySelector('.chat-toggle').parentElement.style.display).toBe('none');
  expect(lines[0].end).not.toHaveBeenCalled();
  await act(() => navigate('/all'));
  await act(() => vi.dynamicImportSettled());
  expect(host.querySelector('.chat-toggle').parentElement.style.display).toBe('');
  expect(host.textContent).toContain('로컬 모의 대화입니다.');
  expect(lines).toHaveLength(1);
  expect(stores).toHaveLength(1);
  expect(calls).toHaveLength(2);
  expect(startEvents()).toHaveLength(1);
});

it('also prepares a hidden session on a direct Elevathon entry', async () => {
  await renderRoute('/elevathon');
  expect(host.querySelector('h1').textContent).toBe('Elevathon');
  expect(host.querySelector('.chat-toggle').parentElement.style.display).toBe('none');
  expect(calls).toHaveLength(2);
  await act(() => navigate('/all'));
  await act(() => vi.dynamicImportSettled());
  expect(lines).toHaveLength(1);
});

it('surfaces a background token failure and only retries once for duplicate retry clicks', async () => {
  mockFetch(() => Promise.resolve(new Response('', { status: 503 })));
  await renderRoute();
  expect(lines).toHaveLength(0);
  await act(() => vi.advanceTimersByTimeAsync(60_000));
  expect(calls).toHaveLength(1);
  await click('채팅 열기');
  expect(host.querySelector('[role="alert"]').textContent).toContain('보안 연결을 준비하지 못했어요');
  mockFetch();
  const retry = host.querySelector('.chat-retry-button');
  await act(() => { retry.click(); retry.click(); });
  await act(() => vi.dynamicImportSettled());
  expect(lines).toHaveLength(1);
  expect(calls.filter(call => call.url.includes('token.example'))).toHaveLength(2);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(console.error).toHaveBeenCalled();
});

it.each(['response', 'body'])('bounds a stalled token %s and rejects a late result after the deadline', async phase => {
  const pending = deferred();
  mockFetch(() => phase === 'body' ? Promise.resolve({ ok: true, json: () => pending.promise }) : pending.promise);
  await renderRoute();
  await act(() => vi.advanceTimersByTimeAsync(CHAT_TOKEN_TIMEOUT_MS - 1));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(calls[0].options.signal.aborted).toBe(true);
  expect(host.querySelector('[role="alert"]').textContent).toContain('응답 시간이 초과');
  await act(() => pending.resolve(phase === 'body' ? { token: 'late-token' } : Response.json({ token: 'late-token' })));
  expect(lines).toHaveLength(0);
  expect(vi.getTimerCount()).toBe(0);
});

it('bounds a stalled Direct Line connection, ends it, and does not retry in the background', async () => {
  const pending = deferred();
  mockFetch(url => url.includes('token.example') ? Promise.resolve(defaultResponse(url)) : pending.promise);
  await renderRoute();
  await act(() => vi.advanceTimersByTimeAsync(CHAT_CONNECTION_TIMEOUT_MS - 1));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(host.querySelector('[role="alert"]').textContent).toContain('연결 시간이 초과');
  expect(lines[0].end).toHaveBeenCalledTimes(1);
  expect(calls[1].options.signal.aborted).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(60_000));
  expect(calls).toHaveLength(2);
  expect(vi.getTimerCount()).toBe(0);
});

it('reconnects a failed transport with its latest token, conversation ID, watermark, and existing history', async () => {
  await renderRoute();
  await act(() => lines[0].receive(greeting()));
  lines[0].token = 'sdk-refreshed-token';
  await act(() => lines[0].emit(4));
  await click('채팅 열기');
  await click('다시 연결');
  expect(lines).toHaveLength(2);
  expect(lines[0].end).toHaveBeenCalledTimes(1);
  expect(lines[1].options).toEqual({
    conversationId: 'conversation-1', token: 'sdk-refreshed-token', watermark: 'greeting',
  });
  expect(calls[2].options.method).toBe('GET');
  expect(calls.filter(call => call.url.includes('token.example'))).toHaveLength(1);
  expect(stores).toHaveLength(1);
  expect(host.querySelector('.webchat__send-box').dataset.userId).toBe('fixture-user');
  expect(startEvents()).toHaveLength(1);
  expect(host.textContent).toContain('로컬 모의 대화입니다.');
});

it.each([3, 5])('does not silently replace an expired/ended conversation (%s) on a late first open', async status => {
  await renderRoute();
  await act(() => lines[0].receive(greeting()));
  await act(() => vi.advanceTimersByTimeAsync(60 * 60 * 1000));
  await act(() => lines[0].emit(status));
  await click('채팅 열기');
  expect(host.querySelector('[role="alert"]').textContent).toContain('새 대화');
  expect(calls).toHaveLength(2);
  await click('새 대화로 연결');
  expect(lines[1].options).toEqual({ token: 'fixture-token' });
  expect(stores).toHaveLength(1);
  expect(host.textContent).toContain('로컬 모의 대화입니다.');
  expect(startEvents()).toHaveLength(2);
});

it('retries a failed explicit new conversation with a fresh token, not the discarded expired conversation', async () => {
  await renderRoute();
  await act(() => lines[0].emit(3));
  mockFetch(() => Promise.resolve(new Response('', { status: 503 })));
  await click('채팅 열기');
  await click('새 대화로 연결');
  expect(host.querySelector('[role="alert"]').textContent).toContain('보안 연결');
  expect(host.querySelectorAll('.chat-retry-button')).toHaveLength(1);
  mockFetch();
  await click('다시 연결');
  expect(lines[1].options).toEqual({ token: 'fixture-token' });
  expect(calls.filter(call => call.url.includes('token.example'))).toHaveLength(3);
  expect(calls.at(-1).options.method).toBe('POST');
});

it('rechecks the same conversation after a long suspended tab without sending a second start event', async () => {
  await renderRoute();
  await act(() => lines[0].receive(greeting()));
  const visibility = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  await act(() => vi.advanceTimersByTimeAsync(16 * 60 * 1000));
  visibility.mockReturnValue(false);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  await act(() => vi.dynamicImportSettled());
  expect(lines).toHaveLength(2);
  expect(lines[1].conversationId).toBe('conversation-1');
  expect(startEvents()).toHaveLength(1);
  expect(stores).toHaveLength(1);
  expect(calls.filter(call => call.url.includes('token.example'))).toHaveLength(1);
});

it('ends an offline connection and requires a user retry instead of an online-event retry loop', async () => {
  await renderRoute();
  await act(() => window.dispatchEvent(new Event('offline')));
  expect(host.querySelector('[role="alert"]').textContent).toContain('인터넷에 연결한 뒤');
  expect(lines[0].end).toHaveBeenCalledTimes(1);
  await act(() => window.dispatchEvent(new Event('online')));
  await act(() => vi.advanceTimersByTimeAsync(60_000));
  expect(calls).toHaveLength(2);
});

it('coalesces StrictMode initialization and releases the active connection and typing timer on unmount', async () => {
  await renderRoute('/', true);
  expect(calls).toHaveLength(2);
  expect(lines).toHaveLength(1);
  expect(lines[0].activity$.subscribe).toHaveBeenCalledTimes(1);
  await act(() => lines[0].receive({ id: 'typing', type: 'typing', from: { role: 'bot' } }));
  expect(host.querySelector('.chat-typing-indicator')).toBeTruthy();
  await act(() => root.render(null));
  expect(lines[0].end).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it('cancels an unmounted token request and never creates a late orphan connection', async () => {
  const token = deferred();
  mockFetch(() => token.promise);
  await renderRoute();
  await act(() => root.render(null));
  expect(calls[0].options.signal.aborted).toBe(true);
  await act(() => token.resolve(Response.json({ token: 'late-token' })));
  expect(lines).toHaveLength(0);
  expect(console.error).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('contains an SDK rendering failure in the chat panel and can retry without replacing the page', async () => {
  sdkBehavior.crash = true;
  await renderRoute('/all');
  expect(host.querySelector('h1').textContent).toBe('전체 게시글');
  expect(host.querySelector('[role="alert"]').textContent).toContain('채팅 화면을 불러오지 못했어요');
  expect(lines[0].end).toHaveBeenCalledTimes(1);
  sdkBehavior.crash = false;
  await click('채팅 열기');
  await click('다시 연결');
  expect(host.querySelector('h1').textContent).toBe('전체 게시글');
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector('input').disabled).toBe(false);
});

it.each([{}, { token: '' }, { token: 42 }])('rejects an invalid token response without treating it as connected: %j', async data => {
  mockFetch(() => Promise.resolve(Response.json(data)));
  await renderRoute();
  expect(host.querySelector('[role="alert"]').textContent).toContain('응답 형식');
  expect(lines).toHaveLength(0);
});

it('distinguishes malformed token JSON and missing configuration from an active connection', async () => {
  mockFetch(() => Promise.resolve(new Response('{', { status: 200 })));
  await renderRoute();
  expect(host.querySelector('[role="alert"]').textContent).toContain('응답 형식');
  vi.stubEnv('VITE_BOT_TOKEN_ENDPOINT', '');
  await click('채팅 열기');
  await click('다시 연결');
  expect(host.querySelector('[role="alert"]').textContent).toContain('연결 설정');
  expect(calls).toHaveLength(1);
  expect(lines).toHaveLength(0);
});

it('uses opaque header, body, bubbles, input and footer surfaces, not wrapper opacity', async () => {
  const css = readFileSync(resolve('src/index.css'), 'utf8');
  const style = document.createElement('style');
  style.textContent = css.slice(css.indexOf('/* --- Chat Widget:'), css.indexOf('/* =====================================================', css.indexOf('/* --- Chat Widget:')))
    .replace(/@apply[^;]+;/g, '');
  document.head.append(style);
  try {
    await renderRoute();
    await act(() => lines[0].receive(greeting()));
    await click('채팅 열기');
    for (const selector of ['.chat-panel-header', '.chat-privacy-note', '.webchat__send-box', '.webchat__send-box__main', '[data-webchat] p']) {
      expect(getComputedStyle(host.querySelector(selector)).backgroundColor, selector).toBe('rgb(255, 255, 255)');
    }
    for (const selector of ['.chat-panel-body', '[data-webchat]']) {
      expect(getComputedStyle(host.querySelector(selector)).backgroundColor).toBe('rgb(248, 250, 252)');
    }
    expect(getComputedStyle(host.querySelector('[data-webchat] p')).color).toBe('rgb(15, 23, 42)');
    expect(host.querySelector('.chat-panel-stage').style.opacity).toBe('');
    expect(getComputedStyle(host.querySelector('.chat-glass-panel')).backgroundImage).toContain('#ffffff');
    expect(host.querySelector('.chat-glass-panel').className).not.toContain('min-h-[430px]');
  } finally {
    style.remove();
  }
});
