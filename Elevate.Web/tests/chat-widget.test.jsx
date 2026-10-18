// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ChatWidget from '../src/components/common/ChatWidget';

const { loadPanel } = vi.hoisted(() => ({ loadPanel: vi.fn() }));
vi.mock('../src/components/common/ChatWidgetPanel', () => {
  loadPanel();
  return {
    default: function TestPanel() {
      const [messages, setMessages] = useState(0);
      return <button data-panel onClick={() => setMessages((count) => count + 1)}>Messages: {messages}</button>;
    },
  };
});

let root;
let host;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubEnv('VITE_BOT_TOKEN_ENDPOINT', 'https://token.example.test');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ token: 'fixture-token' })));
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('loads the chat UI on first open and preserves conversation state across later toggles', async () => {
  await act(() => root.render(<ChatWidget />));
  await act(() => vi.dynamicImportSettled());
  expect(loadPanel).not.toHaveBeenCalled();
  expect(host.querySelector('[data-panel]')).toBeNull();

  await act(() => host.querySelector('[aria-label="채팅 열기"]').click());
  await act(() => vi.dynamicImportSettled());
  expect(loadPanel).toHaveBeenCalledTimes(1);
  await act(() => host.querySelector('[data-panel]').click());
  await act(() => host.querySelector('[aria-label="채팅 닫기"]').click());
  expect(host.querySelector('.chat-panel-stage').getAttribute('aria-hidden')).toBe('true');
  await act(() => host.querySelector('[aria-label="채팅 열기"]').click());
  expect(host.querySelector('[data-panel]').textContent).toBe('Messages: 1');
  expect(loadPanel).toHaveBeenCalledTimes(1);
});
