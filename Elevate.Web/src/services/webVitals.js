import { setClarityTag, trackClarityEvent } from './clarity';

const INP_REPORT_INTERVAL_MS = 1000;

function getRoutePath() {
  return window.location.pathname || '/';
}

function reportInpMeasurement(measurement) {
  window.__elevateInpMeasurements = window.__elevateInpMeasurements || [];
  window.__elevateInpMeasurements.push(measurement);
  window.__elevateLatestInp = measurement;

  setClarityTag('inp_route', measurement.route);
  setClarityTag('inp_latest_ms', String(Math.round(measurement.duration)));
  trackClarityEvent('inp_measurement');

  if (import.meta.env.DEV) {
    console.info('[web-vitals] INP candidate', measurement);
  }
}

export function startInpMeasurement() {
  if (typeof PerformanceObserver === 'undefined') return;
  if (!PerformanceObserver.supportedEntryTypes?.includes('event')) return;

  const interactions = new Map();
  let best = null;
  let lastReport = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.interactionId) continue;

      const current = interactions.get(entry.interactionId);
      if (!current || entry.duration > current.duration) {
        interactions.set(entry.interactionId, entry);
      }

      const candidate = interactions.get(entry.interactionId);
      if (!best || candidate.duration > best.duration) {
        best = candidate;
      }
    }

    const now = performance.now();
    if (best && now - lastReport > INP_REPORT_INTERVAL_MS) {
      lastReport = now;
      reportInpMeasurement({
        route: getRoutePath(),
        name: best.name,
        interactionId: best.interactionId,
        startTime: Math.round(best.startTime),
        duration: best.duration,
        inputDelay: best.processingStart - best.startTime,
        processingDuration: best.processingEnd - best.processingStart,
        presentationDelay: best.startTime + best.duration - best.processingEnd,
      });
    }
  });

  try {
    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch {
    observer.observe({ entryTypes: ['event'] });
  }
}
