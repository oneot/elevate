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
    // 동일 이벤트 재클릭 → 선택 해제
    if (selectedSlug === slug) {
      onSelectEvent(null);
    } else {
      onSelectEvent(slug);
    }
  };

  // 선택된 이벤트 하이라이트 스타일
  const eventPropGetter = (event) => {
    const isSelected = event.resource.slug === selectedSlug;
    return {
      style: {
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.4)',
        border: isSelected ? '1px solid rgba(59, 130, 246, 1)' : '1px solid rgba(59, 130, 246, 0.6)',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '0.75rem',
      },
    };
  };

  return (
    <div className="rbc-calendar-wrapper">
      {/* 글래스모피즘 스타일은 기존 웹앱 스타일 패턴에 맞게 적용 */}
      <Calendar
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={setCurrentDate}
        view="month"
        views={['month']}
        defaultView="month"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        culture="ko"
        messages={{
          next: '다음',
          previous: '이전',
          today: '오늘',
          month: '월',
        }}
        popup
      />
    </div>
  );
}
