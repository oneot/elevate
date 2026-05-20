import { useState, useMemo } from 'react';
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

/**
 * posts: Array<{ slug, title, eventDates: Array<{start, end}> }>
 * selectedSlug: string | null — 현재 선택된 이벤트 slug
 * onSelectEvent: (slug: string | null) => void — 이벤트 클릭 핸들러
 */
export default function EventCalendar({ posts = [], selectedSlug, onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // posts → react-big-calendar 이벤트 변환
  const events = useMemo(() => {
    const result = [];
    posts.forEach(post => {
      if (!Array.isArray(post.eventDates)) return;
      post.eventDates.forEach(d => {
        if (!d.start) return;
        // react-big-calendar allDay 이벤트: end는 exclusive → +1일
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

  // 선택 상태에 따라 CSS 클래스를 추가하여 스타일 제어
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
        messages={{
          next: '›',
          previous: '‹',
          today: '오늘',
          month: '월',
          showMore: (count) => `+${count}개 더`,
        }}
        popup
      />
    </div>
  );
}
