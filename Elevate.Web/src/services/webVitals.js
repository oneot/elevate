import { setClarityTag, trackClarityEvent } from './clarity';

const INP_REPORT_INTERVAL_MS = 1000;
const MAX_INP_MEASUREMENTS = 50;
const MAX_INP_INTERACTIONS = 200;

function getRoutePath() {
  return window.location.pathname || '/';
}

function createInpCandidate(entry) {
  return {
    route: getRoutePath(),
    name: entry.name,
    interactionId: entry.interactionId,
    startTime: Math.round(entry.startTime),
    duration: entry.duration,
    inputDelay: entry.processingStart - entry.startTime,
    processingDuration: entry.processingEnd - entry.processingStart,
    presentationDelay: entry.startTime + entry.duration - entry.processingEnd,
  };
}

function reportInpMeasurement(measurement) {
  window.__elevateInpMeasurements = window.__elevateInpMeasurements || [];
  window.__elevateInpMeasurements.push(measurement);
  if (window.__elevateInpMeasurements.length > MAX_INP_MEASUREMENTS) {
    window.__elevateInpMeasurements.splice(
      0,
      window.__elevateInpMeasurements.length - MAX_INP_MEASUREMENTS,
    );
  }
  window.__elevateLatestInp = measurement;

  setClarityTag('inp_route', measurement.route);
  setClarityTag('inp_latest_ms', String(Math.round(measurement.duration)));
  trackClarityEvent('inp_measurement');

  if (import.meta.env.DEV) {
    console.info('[web-vitals] INP candidate', measurement);
  }
}

function pruneOldestInteractions(interactions) {
  while (interactions.size > MAX_INP_INTERACTIONS) {
    const oldestInteractionId = interactions.keys().next().value;
    interactions.delete(oldestInteractionId);
  }
}

function getWorstInteraction(interactions) {
  let worst = null;
  for (const interaction of interactions.values()) {
    if (!worst || interaction.duration > worst.duration) {
      worst = interaction;
    }
  }
  return worst;
}

export function startInpMeasurement() {
  if (typeof PerformanceObserver === 'undefined') return;
  if (!PerformanceObserver.supportedEntryTypes?.includes('event')) return;

  const interactions = new Map();
  let lastReport = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.interactionId) continue;

      const current = interactions.get(entry.interactionId);
      if (!current || entry.duration > current.duration) {
        interactions.set(entry.interactionId, createInpCandidate(entry));
      }
    }

    pruneOldestInteractions(interactions);
    const worst = getWorstInteraction(interactions);
    const now = performance.now();
    if (worst && now - lastReport > INP_REPORT_INTERVAL_MS) {
      lastReport = now;
      reportInpMeasurement(worst);
    }
  });

  try {
    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch {
    observer.observe({ entryTypes: ['event'] });
  }
}
