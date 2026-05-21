import { useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { ko },
});

// 한국 공휴일 (2025~2026)
const KR_HOLIDAYS = new Set([
  '2025-01-01','2025-01-28','2025-01-29','2025-01-30',
  '2025-03-01','2025-05-05','2025-05-06','2025-06-06',
  '2025-08-15','2025-10-03','2025-10-05','2025-10-06','2025-10-07','2025-10-09',
  '2025-12-25',
  '2026-01-01','2026-02-17','2026-02-18','2026-02-19',
  '2026-03-01','2026-03-02','2026-05-05','2026-05-25',
  '2026-06-06','2026-08-15','2026-08-17',
  '2026-09-24','2026-09-25','2026-09-26',
  '2026-10-03','2026-10-09','2026-12-25',
]);

function CustomDateHeader({ date, label }) {
  const isSunday = date.getDay() === 0;
  const isHoliday = KR_HOLIDAYS.has(format(date, 'yyyy-MM-dd'));
  const isRed = isSunday || isHoliday;
  return (
    <span style={isRed ? { color: '#ef4444', fontWeight: 600 } : {}}>
      {label}
    </span>
  );
}

function formatDateRange(start, end) {
  if (!start) return '';
  const s = format(parseISO(start), 'yyyy.MM.dd', { locale: ko });
  if (!end || start === end) return s;
  const e = format(parseISO(end), 'yyyy.MM.dd', { locale: ko });
  return `${s} ~ ${e}`;
}

function EventBar({ event }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const { title, resource } = event;
  const { eventDate, eventLocation, eventTarget } = resource;

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, []);

  const handleMouseLeave = useCallback(() => setPos(null), []);

  const dateLabel = eventDate ? formatDateRange(eventDate.start, eventDate.end) : '';

  return (
    <>
      <div
        ref={ref}
        style={{ width: '100%', height: '100%' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {title}
      </div>
      {pos && createPortal(
        <div
          className="event-tooltip"
          style={{ left: pos.x, top: pos.y }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="event-tooltip-title">{title}</div>
          {dateLabel && (
            <div className="event-tooltip-row">
              <span className="event-tooltip-icon">📅</span>
              <span>{dateLabel}</span>
            </div>
          )}
          {eventLocation && (
            <div className="event-tooltip-row">
              <span className="event-tooltip-icon">📍</span>
              <span>{eventLocation}</span>
            </div>
          )}
          {eventTarget && (
            <div className="event-tooltip-row">
              <span className="event-tooltip-icon">👥</span>
              <span>{eventTarget}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}


/**
 * posts: Array<{ slug, title, eventDates, eventLocation, eventTarget }>
 * selectedSlug: string | null — 현재 선택된 이벤트 slug
 * onSelectEvent: (slug: string | null) => void — 이벤트 클릭 핸들러
 */
export default function EventCalendar({ posts = [], selectedSlug, onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useCallback((action) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (action === 'TODAY') return new Date();
      if (action === 'PREV') { d.setMonth(d.getMonth() - 1); return d; }
      if (action === 'NEXT') { d.setMonth(d.getMonth() + 1); return d; }
      return d;
    });
  }, []);

  // posts → react-big-calendar 이벤트 변환
  const events = useMemo(() => {
    const result = [];
    posts.forEach(post => {
      if (!Array.isArray(post.eventDates)) return;
      post.eventDates.forEach(d => {
        if (!d.start) return;
        const endDate = addDays(parseISO(d.end || d.start), 1);
        result.push({
          title: post.title,
          start: parseISO(d.start),
          end: endDate,
          allDay: true,
          resource: {
            slug: post.slug,
            eventDate: { start: d.start, end: d.end || d.start },
            eventLocation: post.eventLocation || null,
            eventTarget: post.eventTarget || null,
          },
        });
      });
    });
    return result;
  }, [posts]);

  const handleSelectEvent = (event) => {
    const slug = event.resource.slug;
    onSelectEvent(selectedSlug === slug ? null : slug);
  };

  const eventPropGetter = (event) => {
    const isSelected = event.resource.slug === selectedSlug;
    return {
      className: isSelected ? 'event-bar--selected' : 'event-bar--default',
    };
  };

  return (
    <div className="rbc-calendar-wrapper">
      {/* 년월 레이블: 달력 상단 중앙 */}
      <div className="rbc-top-label">
        {format(currentDate, 'yyyy년 M월', { locale: ko })}
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={setCurrentDate}
        view="month"
        views={['month']}
        defaultView="month"
        style={{ height: 520 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        culture="ko"
        toolbar={false}
        components={{
          month: { dateHeader: CustomDateHeader, event: EventBar },
        }}
        messages={{ showMore: (count) => `+${count}개 더` }}
        popup
      />
      {/* 탐색 버튼: 달력 하단 중앙 */}
      <div className="rbc-bottom-toolbar">
        <button className="rbc-nav-btn" onClick={() => navigate('PREV')}>‹</button>
        <button className="rbc-nav-btn rbc-today-btn" onClick={() => navigate('TODAY')}>오늘</button>
        <button className="rbc-nav-btn" onClick={() => navigate('NEXT')}>›</button>
      </div>
    </div>
  );
}
