// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EventCalendar from '../src/components/posts/EventCalendar';

let root;
let host;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([
  [new Date(2026, 0, 31, 12), '›', '2026년 2월'],
  [new Date(2026, 2, 31, 12), '‹', '2026년 2월'],
  [new Date(2024, 0, 31, 12), '›', '2024년 2월'],
  [new Date(2026, 11, 31, 12), '›', '2027년 1월'],
])('moves exactly one month from %s', async (today, direction, expected) => {
  vi.setSystemTime(today);
  await act(() => root.render(<EventCalendar onSelectEvent={() => {}} />));
  const button = [...host.querySelectorAll('button')].find((item) => item.textContent === direction);
  await act(() => button.click());
  expect(host.querySelector('.rbc-top-label').textContent).toBe(expected);
  await act(() => host.querySelector('.rbc-today-btn').click());
  expect(host.querySelector('.rbc-top-label').textContent).toBe(`${today.getFullYear()}년 ${today.getMonth() + 1}월`);
});
