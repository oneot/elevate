/**
 * @file ProgramNews.jsx
 * @description Microsoft Elevate 행사 및 프로그램 소식 목록 페이지.
 *
 * "행사 소식(event)"과 "프로그램 소식(program-news)" 두 탭으로 구성되며,
 * 현재 탭은 URL의 ?tab 파라미터로 관리된다 (?tab=event / ?tab=program).
 * 기본 탭은 행사 소식이다.
 *
 * - 탭 전환 시 q/tags/page 파라미터를 초기화해 이전 탭 상태가 잔류하지 않도록 한다.
 * - NewsTabContent에 key={activeTab}을 부여해 탭 전환 시 강제 remount하여 훅 상태를 초기화한다.
 *
 * /all 페이지에는 program-news 게시글이 노출되지 않는다.
 * (BASE_CATEGORIES / POST_LIST_CATEGORIES에 포함되지 않음)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import Footer from '../components/layout/Footer';
import EventCalendar from '../components/posts/EventCalendar';
import { POST_LIST_PAGE_SIZE, useCategoryPostList } from '../hooks/useCategoryPostList';
import { listCalendarEvents } from '../api/calendarEvents';
import { sortByEventDates } from '../utils/eventSorting';

// 탭 설정: key는 URL의 tab 파라미터 값, category는 API 카테고리 슬러그
const TABS = [
  { key: 'event', label: '행사 소식', category: 'event' },
  { key: 'program', label: '프로그램 소식', category: 'program-news' },
];

const PAGE_TITLE = '행사 및 프로그램 소식';
const CALENDAR_EVENT_LIMIT = 500;

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarEventRange(today = new Date()) {
  return {
    start: toDateString(new Date(today.getFullYear() - 1, 0, 1)),
    end: toDateString(new Date(today.getFullYear() + 2, 11, 31)),
  };
}

function sortPostsByCalendarEvents(posts, calendarEvents) {
  const eventDatesByPostId = new Map();
  for (const event of calendarEvents) {
    if (!event.linkedPostId || !Array.isArray(event.eventDates)) continue;
    const currentDates = eventDatesByPostId.get(event.linkedPostId) || [];
    eventDatesByPostId.set(event.linkedPostId, [...currentDates, ...event.eventDates]);
  }

  return sortByEventDates(posts, (post) => eventDatesByPostId.get(post.id));
}

/**
 * 탭 하나의 콘텐츠 (게시글 목록 + 검색 + 태그 필터).
 * key={activeTab}으로 강제 remount되므로 탭 전환 시 훅 상태가 완전히 초기화된다.
 *
 * @param {{ category: string, displayName: string, activeTab: string, onTabChange: (key: string) => void }} props
 */
function NewsTabContent({ category, displayName, activeTab, onTabChange }) {
  const {
    qParam,
    allPosts,
    allTags,
    selectedTags,
    loading,
    error,
    filteredPosts,
    paginatedPosts,
    currentPage,
    totalPages,
    handleTagToggle,
    handleClearAllTags,
    handlePageChange,
    handleSearchSubmit,
    updateUrlParams,
  } = useCategoryPostList(category, { sortEventPosts: activeTab !== 'event' });

  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    if (activeTab !== 'event') return;
    let isMounted = true;
    const controller = new AbortController();
    const range = getCalendarEventRange();
    listCalendarEvents({ signal: controller.signal, ...range, limit: CALENDAR_EVENT_LIMIT })
      .then(data => { if (isMounted) setCalendarEvents(Array.isArray(data?.items) ? data.items : []); })
      .catch(err => { if (err?.name !== 'AbortError') console.error('[ProgramNews] calendarEvents fetch failed', err); });
    return () => { isMounted = false; controller.abort(); };
  }, [activeTab]);

  const [searchParams] = useSearchParams();
  const selectedEventId = searchParams.get('event') || null;

  const handleCalendarSelect = (id) => {
    updateUrlParams({ event: id || '' });
  };

  const selectedCalendarEvent = selectedEventId
    ? calendarEvents.find(ce => ce.id === selectedEventId)
    : null;

  const eventFilteredPosts = useMemo(() => (
    activeTab === 'event'
      ? sortPostsByCalendarEvents(filteredPosts, calendarEvents)
      : filteredPosts
  ), [activeTab, filteredPosts, calendarEvents]);

  const eventTotalPages = Math.max(1, Math.ceil(eventFilteredPosts.length / POST_LIST_PAGE_SIZE));
  const eventCurrentPage = Math.min(Math.max(currentPage, 1), eventTotalPages);
  const eventPaginatedPosts = eventFilteredPosts.slice(
    (eventCurrentPage - 1) * POST_LIST_PAGE_SIZE,
    eventCurrentPage * POST_LIST_PAGE_SIZE
  );

  const displayedPosts = activeTab === 'event' && selectedCalendarEvent?.linkedPostId
    ? allPosts.filter(p => p.id === selectedCalendarEvent.linkedPostId)
    : (activeTab === 'event' ? eventPaginatedPosts : paginatedPosts);

  const calendarSlot = activeTab === 'event' ? (
    <EventCalendar
      calendarEvents={calendarEvents}
      selectedEventId={selectedEventId}
      onSelectEvent={handleCalendarSelect}
    />
  ) : null;

  // PostListLayout의 navTabs에 전달할 탭 버튼 UI — PostList.jsx의 카테고리 이동 버튼과 동일한 스타일
  const navTabs = (
    <ul className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <li key={tab.key}>
          <button
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`inline-block px-3.5 py-2 rounded-full border text-sm sm:text-base transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ms-blue ${
              activeTab === tab.key
                ? 'bg-ms-blue text-white border-ms-blue shadow-[0_10px_24px_-12px_rgba(0,120,212,0.95)]'
                : 'bg-white/85 backdrop-blur border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue'
            }`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <PostListLayout
      title={
        <>
          <Logo isBlog={true} />
          <p className="text-slate-400">|</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{PAGE_TITLE}</h1>
        </>
      }
      searchBar={
        <SearchBar placeholder={`Search ${displayName}`} value={qParam} onSubmit={handleSearchSubmit} />
      }
      navTabs={navTabs}
      calendarSlot={calendarSlot}
      tagFilterProps={{
        allTags,
        selectedTags,
        onTagToggle: handleTagToggle,
        onClearAll: handleClearAllTags,
      }}
      posts={displayedPosts}
      loading={loading}
      error={error}
      countLabel={!loading && selectedTags.length > 0 ? `${eventFilteredPosts.length}개의 게시글이 일치합니다.` : undefined}
      activeQuery={qParam}
      currentPage={activeTab === 'event' && selectedCalendarEvent?.linkedPostId ? 1 : (activeTab === 'event' ? eventCurrentPage : currentPage)}
      totalPages={activeTab === 'event' && selectedCalendarEvent?.linkedPostId ? 1 : (activeTab === 'event' ? eventTotalPages : totalPages)}
      onPageChange={handlePageChange}
    />
  );
}

/**
 * 최상위 컴포넌트. URL의 ?tab 파라미터를 읽어 현재 탭을 결정하고,
 * 탭 전환 시 q/tags/page를 초기화한다.
 */
export default function ProgramNews() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ?tab 값이 없거나 유효하지 않으면 첫 번째 탭(event)으로 기본값 설정
  const tabParam = searchParams.get('tab');
  const activeTab = TABS.find((t) => t.key === tabParam)?.key ?? TABS[0].key;
  const activeTabConfig = TABS.find((t) => t.key === activeTab);

  /**
   * 탭 전환 핸들러.
   * tab 파라미터만 남기고 q/tags/page를 제거해 이전 탭의 필터 상태가 잔류하지 않도록 한다.
   */
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setSearchParams({ tab: newTab }, { replace: false });
  };

  return (
    <>
      {/* key={activeTab}: 탭 전환 시 컴포넌트를 강제 remount해 훅 상태(q/tags/page)를 초기화한다 */}
      <NewsTabContent
        key={activeTab}
        category={activeTabConfig.category}
        displayName={activeTabConfig.label}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <Footer />
    </>
  );
}
