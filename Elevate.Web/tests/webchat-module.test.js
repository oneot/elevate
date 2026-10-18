// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

let session;
let resolveModule;
let rejectModule;
let createDirectLine;

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubEnv('VITE_BOT_TOKEN_ENDPOINT', 'https://token.example.test');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ token: 'fixture-token' })));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  createDirectLine = vi.fn();
  const module = new Promise((resolve, reject) => { resolveModule = resolve; rejectModule = reject; });
  vi.doMock('botframework-webchat', () => module);
  vi.doMock('../src/components/common/ChatWidgetWebChat', () => ({ default: () => null }));
});

afterEach(() => {
  session?.dispose();
  vi.doUnmock('botframework-webchat');
  vi.doUnmock('../src/components/common/ChatWidgetWebChat');
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('requests the token while the SDK is still downloading and exposes a module failure without an orphan connection', async () => {
  const { createWebChatSession } = await import('../src/services/webChatSession');
  session = createWebChatSession();
  session.start();
  await vi.advanceTimersByTimeAsync(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(session.getSnapshot().status).toBe('preparing');
  rejectModule(new Error('Fixture chunk unavailable'));
  await vi.dynamicImportSettled();
  expect(session.getSnapshot().status).toBe('error');
  expect(session.getSnapshot().WebChat).toBeNull();
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  expect(console.error).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(60_000);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('bounds a stalled module load and ignores it if it completes after the deadline', async () => {
  const { createWebChatSession, CHAT_CONNECTION_TIMEOUT_MS } = await import('../src/services/webChatSession');
  session = createWebChatSession();
  session.start();
  await vi.advanceTimersByTimeAsync(CHAT_CONNECTION_TIMEOUT_MS - 1);
  expect(session.getSnapshot().status).toBe('preparing');
  await vi.advanceTimersByTimeAsync(1);
  expect(session.getSnapshot().status).toBe('error');
  resolveModule({ createDirectLine, createStore: vi.fn() });
  await vi.dynamicImportSettled();
  expect(createDirectLine).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('does not start a connection when module loading finishes after disposal', async () => {
  const { createWebChatSession } = await import('../src/services/webChatSession');
  session = createWebChatSession();
  session.start();
  await vi.advanceTimersByTimeAsync(1);
  session.dispose();
  resolveModule({ createDirectLine, createStore: vi.fn() });
  await vi.dynamicImportSettled();
  expect(createDirectLine).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
