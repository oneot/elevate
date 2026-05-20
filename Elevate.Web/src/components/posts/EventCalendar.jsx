import { useState, useMemo, useRef, useCallback } from 'react';
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

/**
 * posts: Array<{ slug, title, eventDates: Array<{start, end}> }>
 * selectedSlug: string | null — 현재 선택된 이벤트 slug
 * onSelectEvent: (slug: string | null) => void — 이벤트 클릭 핸들러
 */
export default function EventCalendar({ posts = [], selectedSlug, onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const labelRef = useRef(null);

  // 커스텀 툴바: 라벨은 외부 div에 DOM 직접 업데이트, 버튼만 렌더링
  const BottomToolbar = useCallback(({ label, onNavigate }) => {
    if (labelRef.current) labelRef.current.textContent = label;
    return (
      <div className="rbc-bottom-toolbar">
        <button className="rbc-nav-btn" onClick={() => onNavigate('PREV')}>‹</button>
        <button className="rbc-nav-btn rbc-today-btn" onClick={() => onNavigate('TODAY')}>오늘</button>
        <button className="rbc-nav-btn" onClick={() => onNavigate('NEXT')}>›</button>
      </div>
    );
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
          resource: { slug: post.slug },
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
      className: isSelected ? 'rbc-selected' : '',
      style: isSelected ? {
        background: 'linear-gradient(135deg, #0078D4 0%, #002050 100%)',
        boxShadow: '0 3px 12px rgba(0,120,212,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
      } : {},
    };
  };

  return (
    <div className="rbc-calendar-wrapper">
      {/* 년월 레이블: 달력 상단 중앙 */}
      <div className="rbc-top-label" ref={labelRef}>
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
        components={{
          toolbar: BottomToolbar,
          month: { dateHeader: CustomDateHeader },
        }}
        messages={{ showMore: (count) => `+${count}개 더` }}
        popup
      />
    </div>
  );
}
