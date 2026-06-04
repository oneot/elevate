/**
 * @file clarity.js
 * @description Microsoft Clarity 세션 분석 연동 모듈.
 *
 * 환경변수 두 가지가 모두 설정된 경우에만 Clarity가 활성화된다:
 * - `VITE_CLARITY_ENABLED=true`
 * - `VITE_CLARITY_PROJECT_ID=<프로젝트 ID>`
 *
 * 활성화된 이후에는 `started` 플래그로 중복 초기화를 방지한다.
 */
import Clarity from '@microsoft/clarity';

const enabled = import.meta.env.VITE_CLARITY_ENABLED === 'true';
const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

// 초기화 여부 추적: startClarity가 여러 번 호출되어도 한 번만 init되도록 한다.
let started = false;
const pendingClarityTags = new Map();
const pendingClarityEvents = [];

function flushPendingClarityCalls() {
  for (const [key, value] of pendingClarityTags) {
    Clarity.setTag(key, value);
  }
  pendingClarityTags.clear();

  for (const eventName of pendingClarityEvents) {
    Clarity.event(eventName);
  }
  pendingClarityEvents.length = 0;
}

/**
 * Clarity 세션을 초기화한다.
 *
 * `enabled`가 false이거나 `projectId`가 없거나 이미 초기화된 경우 아무 작업도 하지 않는다.
 * 앱 진입점(main.jsx)에서 한 번만 호출해야 한다.
 */
export function startClarity() {
  if (!enabled || !projectId || started) {
    return;
  }

  Clarity.init(projectId);
  started = true;
  flushPendingClarityCalls();
}

export function startClarityWhenIdle() {
  if (!enabled || !projectId || started) {
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => startClarity(), { timeout: 3000 });
    return;
  }

  window.setTimeout(() => startClarity(), 2000);
}

/**
 * Clarity 세션에 커스텀 태그(key-value)를 설정한다.
 *
 * Clarity 대시보드에서 세그먼트 분류에 활용된다 (예: 현재 라우트 경로).
 *
 * @param {string} key - 태그 키
 * @param {string} value - 태그 값
 */
export function setClarityTag(key, value) {
  if (!key || typeof value === 'undefined') {
    return;
  }

  if (!started) {
    if (enabled && projectId) pendingClarityTags.set(key, value);
    return;
  }

  Clarity.setTag(key, value);
}

/**
 * Clarity에 커스텀 이벤트를 기록한다.
 *
 * @param {string} eventName - 이벤트 이름 (예: 'page_view')
 */
export function trackClarityEvent(eventName) {
  if (!eventName) {
    return;
  }

  if (!started) {
    if (enabled && projectId) pendingClarityEvents.push(eventName);
    return;
  }

  Clarity.event(eventName);
}
