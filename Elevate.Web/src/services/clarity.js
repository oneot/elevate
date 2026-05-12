import Clarity from '@microsoft/clarity';

const enabled = import.meta.env.VITE_CLARITY_ENABLED === 'true';
const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

let started = false;

export function startClarity() {
  if (!enabled || !projectId || started) {
    return;
  }

  Clarity.init(projectId);
  started = true;
}

export function setClarityTag(key, value) {
  if (!started || !key || typeof value === 'undefined') {
    return;
  }

  Clarity.setTag(key, value);
}

export function trackClarityEvent(eventName) {
  if (!started || !eventName) {
    return;
  }

  Clarity.event(eventName);
}