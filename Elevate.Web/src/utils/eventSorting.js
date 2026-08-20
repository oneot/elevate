function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEventDateSortKey(eventDates, today = new Date()) {
  const todayStr = toLocalDateString(today);
  if (!Array.isArray(eventDates) || eventDates.length === 0) {
    return { priority: 3, sortStr: '', desc: false };
  }

  let nearestFutureStart = null;
  let mostRecentPastEnd = null;
  let isOngoing = false;
  let ongoingStart = null;

  for (const d of eventDates) {
    if (!d?.start) continue;
    const start = d.start;
    const end = d.end || d.start;

    if (start <= todayStr && todayStr <= end) {
      isOngoing = true;
      if (ongoingStart === null || start < ongoingStart) ongoingStart = start;
    } else if (start > todayStr) {
      if (nearestFutureStart === null || start < nearestFutureStart) nearestFutureStart = start;
    } else if (mostRecentPastEnd === null || end > mostRecentPastEnd) {
      mostRecentPastEnd = end;
    }
  }

  if (isOngoing) return { priority: 0, sortStr: ongoingStart, desc: false };
  if (nearestFutureStart !== null) return { priority: 1, sortStr: nearestFutureStart, desc: false };
  if (mostRecentPastEnd !== null) return { priority: 2, sortStr: mostRecentPastEnd, desc: true };
  return { priority: 3, sortStr: '', desc: false };
}

export function sortByEventDates(items, getEventDates, today = new Date()) {
  return [...items].sort((a, b) => {
    const ka = getEventDateSortKey(getEventDates(a), today);
    const kb = getEventDateSortKey(getEventDates(b), today);
    if (ka.priority !== kb.priority) return ka.priority - kb.priority;
    if (ka.sortStr < kb.sortStr) return ka.desc ? 1 : -1;
    if (ka.sortStr > kb.sortStr) return ka.desc ? -1 : 1;
    return 0;
  });
}
