# Event Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 행사 소식 탭에 react-big-calendar 달력을 추가하고, 관리자가 `event` 카테고리 게시글에 행사 일정을 저장할 수 있도록 한다.

**Architecture:** 백엔드(Elevate.Server)에 `eventDates` 필드를 추가하고, Admin UI(Elevate.Admin)에 EventDatesEditor 컴포넌트를 추가한다. 웹(Elevate.Web)에서는 react-big-calendar로 월 뷰 달력을 렌더링하며, 이벤트 클릭 시 `?event=<slug>` URL 파라미터로 게시글 목록을 필터링한다.

**Tech Stack:** Node.js/Express (Server), React 19 + Tailwind (Admin/Web), react-big-calendar + date-fns@2 (Web)

---

## File Map

| 작업 | 파일 | 유형 |
|------|------|------|
| Task 1 | `Elevate.Server/src/controllers/postController.js` | 수정 |
| Task 2 | `Elevate.Server/src/controllers/adminController.js` | 수정 |
| Task 3 | `Elevate.Web/src/hooks/useCategoryPostList.js` | 수정 |
| Task 4 | `Elevate.Admin/src/components/editor/EventDatesEditor.jsx` | **신규** |
| Task 5 | `Elevate.Admin/src/components/editor/PostMetaSidebar.jsx` | 수정 |
| Task 5 | `Elevate.Admin/src/components/editor/index.js` | 수정 |
| Task 5 | `Elevate.Admin/src/pages/PostEditor.jsx` | 수정 |
| Task 6 | `Elevate.Web/src/components/posts/EventCalendar.jsx` | **신규** |
| Task 7 | `Elevate.Web/src/components/posts/PostListLayout.jsx` | 수정 |
| Task 8 | `Elevate.Web/src/pages/ProgramNews.jsx` | 수정 |

---

## Task 1: postController.js — eventDates 공개 API 노출

**Files:**
- Modify: `Elevate.Server/src/controllers/postController.js:66-81` (toPostSummary)
- Modify: `Elevate.Server/src/controllers/postController.js:124-126` (buildListQuery SELECT)

- [ ] **Step 1: SELECT에 p.eventDates 추가**

`postController.js` line 124-126을 찾아 SELECT 절을 수정한다:

```js
// 변경 전:
query: `SELECT p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt, p.series, p.seriesOrder, p.thumbnail
        FROM p

// 변경 후:
query: `SELECT p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt, p.series, p.seriesOrder, p.thumbnail, p.eventDates
        FROM p
```

- [ ] **Step 2: toPostSummary에 eventDates 추가**

`toPostSummary` 함수 (line 66)의 반환 객체 마지막에 추가:

```js
function toPostSummary(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
    publishedAt: post.publishedAt || null,
    updatedAt: post.updatedAt,
    series: post.series || null,
    seriesOrder: post.seriesOrder ?? null,
    thumbnail: normalizeThumbnail(post.thumbnail),
    eventDates: post.eventDates || null,   // <-- 추가
  };
}
```

- [ ] **Step 3: 파일 문법 확인**

```bash
cd "Elevate.Server" && node -e "require('./src/controllers/postController.js'); console.log('OK')"
```

Expected: `OK`

---

## Task 2: adminController.js — eventDates 저장/응답

**Files:**
- Modify: `Elevate.Server/src/controllers/adminController.js:113-163` (validation)
- Modify: `Elevate.Server/src/controllers/adminController.js:201-217` (toPostResponse)
- Modify: `Elevate.Server/src/controllers/adminController.js:371-388` (createPost post object)
- Modify: `Elevate.Server/src/controllers/adminController.js:424-435` (updatePost updated object)

- [ ] **Step 1: validatePostCreatePayload에 eventDates 검증 추가**

`validatePostCreatePayload` 함수 (line 113)의 `return null;` 직전에 추가:

```js
  if (body.eventDates !== undefined && body.eventDates !== null) {
    if (!Array.isArray(body.eventDates)) return 'eventDates must be an array';
    for (const item of body.eventDates) {
      if (!item || typeof item !== 'object') return 'each eventDate must be an object with start and end';
      if (typeof item.start !== 'string' || typeof item.end !== 'string') return 'eventDate start and end must be strings';
    }
  }

  return null;
```

- [ ] **Step 2: validatePostUpdatePayload에 eventDates 검증 추가**

`validatePostUpdatePayload` 함수 (line 141)의 `return null;` 직전에 동일하게 추가:

```js
  if (body.eventDates !== undefined && body.eventDates !== null) {
    if (!Array.isArray(body.eventDates)) return 'eventDates must be an array';
    for (const item of body.eventDates) {
      if (!item || typeof item !== 'object') return 'each eventDate must be an object with start and end';
      if (typeof item.start !== 'string' || typeof item.end !== 'string') return 'eventDate start and end must be strings';
    }
  }

  return null;
```

- [ ] **Step 3: toPostResponse에 eventDates 추가**

`toPostResponse` 함수 (line 201)의 반환 객체 마지막에 추가:

```js
function toPostResponse(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt || '',
    contentMarkdown: post.contentMarkdown || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
    publishedAt: post.publishedAt || null,
    updatedAt: post.updatedAt,
    series: post.series || null,
    thumbnail: post.thumbnail || null,
    youtube: post.youtube || null,
    eventDates: post.eventDates || null,   // <-- 추가
  };
}
```

- [ ] **Step 4: createPost에 eventDates 저장 추가**

`createPost` 함수 (line 371)의 `post` 객체에 추가 (youtube 줄 다음):

```js
    const post = {
      id: createUuid(),
      partitionKey: req.body.category,
      documentType: 'post',
      slug,
      category: req.body.category,
      title: req.body.title,
      excerpt: req.body.excerpt || '',
      contentMarkdown: stripBlobSasFromHtml(req.body.contentMarkdown),
      tags: req.body.tags,
      series: req.body.series || null,
      thumbnail: req.body.thumbnail ? Object.assign({}, req.body.thumbnail, { url: stripBlobSas(req.body.thumbnail.url) }) : null,
      youtube: req.body.youtube || null,
      eventDates: req.body.eventDates || null,   // <-- 추가
      status: req.body.status,
      publishedAt: req.body.status === 'published' ? now : null,
      updatedAt: now,
      createdAt: now
    };
```

- [ ] **Step 5: updatePost에 eventDates 유지/업데이트 추가**

`updatePost` 함수 (line 424)의 `updated` 객체에 추가 (youtube 줄 다음):

```js
    const updated = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      excerpt: req.body.excerpt !== undefined ? req.body.excerpt : existing.excerpt,
      contentMarkdown: stripBlobSasFromHtml(incomingContent),
      tags: req.body.tags !== undefined ? req.body.tags : existing.tags,
      series: req.body.series !== undefined ? req.body.series : existing.series,
      thumbnail: normalizedThumbnail,
      youtube: req.body.youtube !== undefined ? (req.body.youtube || null) : (existing.youtube || null),
      eventDates: req.body.eventDates !== undefined ? (req.body.eventDates || null) : (existing.eventDates || null),  // <-- 추가
      status: req.body.status !== undefined ? req.body.status : existing.status,
      updatedAt: now
    };
```

- [ ] **Step 6: 파일 문법 확인**

```bash
node -e "require('./src/controllers/adminController.js'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 7: 백엔드 변경 커밋**

```bash
git add Elevate.Server/src/controllers/postController.js Elevate.Server/src/controllers/adminController.js
git commit -m "feat(server): add eventDates field to post create/update/list APIs

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: useCategoryPostList.js — allPosts, updateUrlParams 노출

**Files:**
- Modify: `Elevate.Web/src/hooks/useCategoryPostList.js:147-162` (return)

- [ ] **Step 1: return에 allPosts, updateUrlParams 추가**

현재 return 블록 (line 147)에 두 개 항목 추가:

```js
  return {
    qParam,
    qParamLower,
    allPosts,           // <-- 추가: 달력용 전체 게시글 목록
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
    updateUrlParams,    // <-- 추가: ?event= 파라미터 관리용
  };
```

---

## Task 4: EventDatesEditor.jsx — 신규 컴포넌트

**Files:**
- Create: `Elevate.Admin/src/components/editor/EventDatesEditor.jsx`

- [ ] **Step 1: EventDatesEditor.jsx 생성**

```jsx
/**
 * EventDatesEditor
 *
 * event 카테고리 게시글의 행사 일정을 편집하는 컴포넌트.
 * eventDates 배열 (Array<{ start: string, end: string }>) 형식으로 onChange를 호출한다.
 *
 * 내부적으로 "entry" 단위로 관리한다:
 *  - 단발(single): 날짜 1개 → { start: D, end: D }
 *  - 기간(range) : 시작일+종료일 → { start: D1, end: D2 }
 *  - 다중(multi) : 날짜 N개 → [{ start: D1, end: D1 }, ...]
 *
 * Props:
 *  - eventDates     {Array<{start, end}>|null} 현재 저장된 값
 *  - onChange       {(Array<{start, end}>) => void} 변경 콜백
 */
import { useState, useEffect } from 'react'
import { Card } from '../ui/index.js'

let _uid = 0
const nextId = () => String(++_uid)

function entriesToEventDates(entries) {
  return entries.flatMap(entry => {
    if (entry.type === 'single') {
      return entry.date ? [{ start: entry.date, end: entry.date }] : []
    }
    if (entry.type === 'range') {
      return (entry.rangeStart && entry.rangeEnd)
        ? [{ start: entry.rangeStart, end: entry.rangeEnd }]
        : []
    }
    if (entry.type === 'multi') {
      return entry.dates.filter(Boolean).map(d => ({ start: d, end: d }))
    }
    return []
  })
}

function eventDatesToEntries(eventDates) {
  if (!Array.isArray(eventDates) || eventDates.length === 0) return []
  return eventDates.map(item => ({
    _id: nextId(),
    type: item.start === item.end ? 'single' : 'range',
    date: item.start === item.end ? item.start : '',
    rangeStart: item.start !== item.end ? item.start : '',
    rangeEnd: item.start !== item.end ? item.end : '',
    dates: [],
  }))
}

function EventDatesEditor({ eventDates, onChange }) {
  const [entries, setEntries] = useState(() => eventDatesToEntries(eventDates))

  // 게시글 로드 시 외부 값 반영 (마운트 이후 변경은 무시 — 편집 중 외부 변경 없음)
  useEffect(() => {
    setEntries(eventDatesToEntries(eventDates))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notify = (newEntries) => {
    setEntries(newEntries)
    onChange(entriesToEventDates(newEntries))
  }

  const addEntry = (type) => {
    notify([...entries, {
      _id: nextId(),
      type,
      date: '',
      rangeStart: '',
      rangeEnd: '',
      dates: type === 'multi' ? [''] : [],
    }])
  }

  const removeEntry = (id) => notify(entries.filter(e => e._id !== id))

  const updateEntry = (id, patch) => {
    notify(entries.map(e => e._id === id ? { ...e, ...patch } : e))
  }

  const addMultiDate = (id) => {
    notify(entries.map(e => e._id === id ? { ...e, dates: [...e.dates, ''] } : e))
  }

  const updateMultiDate = (id, index, value) => {
    notify(entries.map(e => {
      if (e._id !== id) return e
      const dates = [...e.dates]
      dates[index] = value
      return { ...e, dates }
    }))
  }

  const removeMultiDate = (id, index) => {
    notify(entries.map(e => {
      if (e._id !== id) return e
      return { ...e, dates: e.dates.filter((_, i) => i !== index) }
    }))
  }

  const inputClass = 'w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue'

  return (
    <Card colorScheme="orange" className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-800">행사 일정</h3>

      {entries.length === 0 && (
        <p className="text-xs text-neutral-400">등록된 행사 일정이 없습니다.</p>
      )}

      {entries.map(entry => (
        <div key={entry._id} className="rounded-md border border-neutral-200 bg-white p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <select
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue"
              value={entry.type}
              onChange={e => updateEntry(entry._id, {
                type: e.target.value,
                date: '', rangeStart: '', rangeEnd: '',
                dates: e.target.value === 'multi' ? [''] : [],
              })}
            >
              <option value="single">단발</option>
              <option value="range">기간</option>
              <option value="multi">다중</option>
            </select>
            <button
              type="button"
              onClick={() => removeEntry(entry._id)}
              className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
            >
              삭제
            </button>
          </div>

          {entry.type === 'single' && (
            <input
              type="date"
              className={inputClass}
              value={entry.date}
              onChange={e => updateEntry(entry._id, { date: e.target.value })}
            />
          )}

          {entry.type === 'range' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue"
                value={entry.rangeStart}
                onChange={e => updateEntry(entry._id, { rangeStart: e.target.value })}
              />
              <span className="text-xs text-neutral-400">~</span>
              <input
                type="date"
                className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue"
                value={entry.rangeEnd}
                onChange={e => updateEntry(entry._id, { rangeEnd: e.target.value })}
              />
            </div>
          )}

          {entry.type === 'multi' && (
            <div className="space-y-2">
              {entry.dates.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="date"
                    className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue"
                    value={d}
                    onChange={e => updateMultiDate(entry._id, i, e.target.value)}
                  />
                  {entry.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMultiDate(entry._id, i)}
                      className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addMultiDate(entry._id)}
                className="text-xs text-ms-blue hover:underline"
              >
                + 날짜 추가
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => addEntry('single')} className="text-xs text-ms-blue hover:underline">+ 단발 추가</button>
        <button type="button" onClick={() => addEntry('range')} className="text-xs text-ms-blue hover:underline">+ 기간 추가</button>
        <button type="button" onClick={() => addEntry('multi')} className="text-xs text-ms-blue hover:underline">+ 다중 추가</button>
      </div>
    </Card>
  )
}

export default EventDatesEditor
```

---

## Task 5: Admin 통합 — PostMetaSidebar + index.js + PostEditor

**Files:**
- Modify: `Elevate.Admin/src/components/editor/index.js`
- Modify: `Elevate.Admin/src/components/editor/PostMetaSidebar.jsx`
- Modify: `Elevate.Admin/src/pages/PostEditor.jsx`

- [ ] **Step 1: index.js에 EventDatesEditor export 추가**

`Elevate.Admin/src/components/editor/index.js` 전체:

```js
export { default as HtmlEditor } from './HtmlEditor.jsx'
export { default as AttachUploader } from './AttachUploader.jsx'
export { default as PostMetaSidebar } from './PostMetaSidebar.jsx'
export { default as EventDatesEditor } from './EventDatesEditor.jsx'
```

- [ ] **Step 2: PostMetaSidebar.jsx — eventDates props + 조건부 렌더링**

파일 상단 import에 `EventDatesEditor` 추가:

```js
import { Card, FormField } from '../ui/index.js'
import AttachUploader from './AttachUploader.jsx'
import EventDatesEditor from './EventDatesEditor.jsx'
```

Props 목록에 `eventDates`와 `onEventDatesChange` 추가 (기존 props 유지):

```js
function PostMetaSidebar({
  post,
  tagsInput,
  youtubeInput,
  youtubeError,
  isUploading,
  isNew,
  onChange,
  onTagsChange,
  onYoutubeChange,
  onThumbnailUpload,
  postId,
  categories,
  eventDates,           // <-- 추가
  onEventDatesChange,   // <-- 추가
}) {
```

첨부파일 `<Card>` 위에 `EventDatesEditor` 조건부 렌더링 추가:

```jsx
      {/* event 카테고리일 때만 행사 일정 편집기를 표시한다 */}
      {post.category === 'event' && (
        <EventDatesEditor
          eventDates={eventDates}
          onChange={onEventDatesChange}
        />
      )}

      <Card colorScheme="blue" className="space-y-4">
        <h3 className="text-base font-semibold text-neutral-700">첨부파일</h3>
        ...
```

- [ ] **Step 3: PostEditor.jsx — eventDates 상태 추가**

`emptyPost` 상수에 `eventDates: null` 추가:

```js
const emptyPost = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  tags: [],
  excerpt: '',
  thumbnailUrl: '',
  htmlBody: '',
  youtube: '',
  eventDates: null,   // <-- 추가
}
```

`<PostMetaSidebar>` 사용 위치 (line ~302)에 두 props 추가:

```jsx
          <PostMetaSidebar
            post={post}
            tagsInput={tagsInput}
            youtubeInput={youtubeInput}
            youtubeError={youtubeError}
            isUploading={isUploading}
            isNew={isNew}
            onChange={handleChange}
            onTagsChange={setTagsInput}
            onYoutubeChange={handleYoutubeChange}
            onThumbnailUpload={uploadThumbnail}
            postId={postId}
            categories={CATEGORIES}
            eventDates={post.eventDates}
            onEventDatesChange={(dates) => setPost((prev) => ({ ...prev, eventDates: dates }))}
          />
```

> **Note:** `handleSave`의 `payload`는 `...post`를 펼치므로 `eventDates`가 자동 포함된다. 별도 수정 불필요.

- [ ] **Step 4: Admin 빌드 확인**

```bash
cd "Elevate.Admin" && npm run build 2>&1 | tail -20
```

Expected: `built in X.XXs` (에러 없음)

- [ ] **Step 5: Admin 변경 커밋**

```bash
git add Elevate.Admin/src/components/editor/EventDatesEditor.jsx \
        Elevate.Admin/src/components/editor/index.js \
        Elevate.Admin/src/components/editor/PostMetaSidebar.jsx \
        Elevate.Admin/src/pages/PostEditor.jsx
git commit -m "feat(admin): add EventDatesEditor for event category posts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: EventCalendar.jsx — 신규 달력 컴포넌트

**Files:**
- Create: `Elevate.Web/src/components/posts/EventCalendar.jsx`

- [ ] **Step 1: react-big-calendar + date-fns@2 설치**

```bash
cd "Elevate.Web" && npm install react-big-calendar date-fns@2
```

Expected: 설치 완료 메시지 (에러 없음)

- [ ] **Step 2: EventCalendar.jsx 생성**

```jsx
/**
 * EventCalendar
 *
 * event 카테고리 게시글의 행사 일정을 월 뷰 달력으로 표시한다.
 * 이벤트 클릭 → onSelect(slug) 호출, 이미 선택된 이벤트 재클릭 → onDeselect() 호출.
 *
 * Props:
 *  - posts          {Array}         event 카테고리 전체 게시글 (eventDates 포함)
 *  - selectedSlug   {string|null}   현재 필터링 중인 게시글 slug
 *  - onSelect       {(slug) => void}
 *  - onDeselect     {() => void}
 */
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { ko };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const messages = {
  next: '›',
  previous: '‹',
  today: '오늘',
  month: '월',
  week: '주',
  day: '일',
  agenda: '목록',
  noEventsInRange: '이 기간에 행사가 없습니다.',
};

function postsToEvents(posts) {
  return posts.flatMap(post => {
    if (!Array.isArray(post.eventDates) || post.eventDates.length === 0) return [];
    return post.eventDates.map((d, i) => ({
      id: `${post.slug}-${i}`,
      slug: post.slug,
      title: post.title,
      // react-big-calendar allDay 이벤트는 end를 마지막 날 +1로 설정해야 다일 범위가 올바르게 렌더링된다
      start: parseISO(d.start),
      end: addDays(parseISO(d.end), 1),
      allDay: true,
    }));
  });
}

function EventCalendar({ posts, selectedSlug, onSelect, onDeselect }) {
  const events = useMemo(() => postsToEvents(posts), [posts]);

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.slug === selectedSlug ? '#0078d4' : '#60a5fa',
      borderRadius: '4px',
      border: 'none',
      color: '#fff',
      fontSize: '0.75rem',
      cursor: 'pointer',
    },
  });

  const handleSelectEvent = (event) => {
    if (event.slug === selectedSlug) {
      onDeselect();
    } else {
      onSelect(event.slug);
    }
  };

  return (
    <div className="mb-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm overflow-hidden p-4">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        defaultDate={new Date()}
        views={['month']}
        style={{ height: 450 }}
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
        culture="ko"
        messages={messages}
        popup
      />
    </div>
  );
}

export default EventCalendar;
```

---

## Task 7: PostListLayout.jsx — calendarSlot prop 추가

**Files:**
- Modify: `Elevate.Web/src/components/posts/PostListLayout.jsx`

- [ ] **Step 1: calendarSlot prop 추가**

props 목록에 `calendarSlot` 추가 및 렌더링 위치 삽입:

```jsx
const PostListLayout = ({
  title,
  searchBar,
  navTabs,
  calendarSlot,        // <-- 추가
  tagFilterProps,
  posts,
  loading,
  error,
  countLabel,
  currentPage,
  totalPages,
  onPageChange,
  seriesNavigatorProps,
  activeQuery,
}) => {
  const hasSeriesSidebar = Boolean(seriesNavigatorProps);

  return (
    <div className="relative min-h-screen">
      <div className="pastel-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-12 py-8">
        <header className="mb-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {title}
            </div>
            {searchBar && <div className="w-full sm:w-80">{searchBar}</div>}
          </div>
          {navTabs && <nav>{navTabs}</nav>}
        </header>

        {calendarSlot}

        <div className={`flex flex-col lg:grid gap-6 ${hasSeriesSidebar ? 'lg:grid-cols-12' : 'lg:grid-cols-10'}`}>
          ...
```

---

## Task 8: ProgramNews.jsx — EventCalendar 통합 + ?event URL

**Files:**
- Modify: `Elevate.Web/src/pages/ProgramNews.jsx`

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 추가:

```js
import EventCalendar from '../components/posts/EventCalendar';
```

- [ ] **Step 2: NewsTabContent — allPosts + updateUrlParams 구조분해 추가**

`useCategoryPostList` 구조분해에 두 항목 추가:

```js
  const {
    qParam,
    allPosts,            // <-- 추가
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
    updateUrlParams,     // <-- 추가
  } = useCategoryPostList(category);
```

- [ ] **Step 3: selectedSlug 상태 + 필터 로직 추가**

`useCategoryPostList` 호출 아래에 추가:

```js
  const [searchParams] = useSearchParams();
  const isEventTab = activeTab === 'event';
  const selectedSlug = isEventTab ? (searchParams.get('event') || null) : null;

  // event 탭에서 slug 필터가 활성이면 해당 게시글만 표시 (태그/검색 필터와 AND)
  const displayedPosts = isEventTab && selectedSlug
    ? filteredPosts.filter(p => p.slug === selectedSlug)
    : paginatedPosts;

  const handleEventSelect = (slug) => updateUrlParams({ event: slug });
  const handleEventDeselect = () => updateUrlParams({ event: '' });
```

- [ ] **Step 4: calendarSlot prop 전달**

`PostListLayout`에 `calendarSlot` prop 추가:

```jsx
  return (
    <PostListLayout
      title={...}
      searchBar={...}
      navTabs={navTabs}
      calendarSlot={
        isEventTab ? (
          <EventCalendar
            posts={allPosts}
            selectedSlug={selectedSlug}
            onSelect={handleEventSelect}
            onDeselect={handleEventDeselect}
          />
        ) : null
      }
      tagFilterProps={{...}}
      posts={displayedPosts}
      loading={loading}
      error={error}
      countLabel={
        !loading && (selectedTags.length > 0 || selectedSlug)
          ? `${isEventTab && selectedSlug ? displayedPosts.length : filteredPosts.length}개의 게시글이 일치합니다.`
          : undefined
      }
      activeQuery={qParam}
      currentPage={isEventTab && selectedSlug ? 1 : currentPage}
      totalPages={isEventTab && selectedSlug ? 1 : totalPages}
      onPageChange={handlePageChange}
    />
  );
```

- [ ] **Step 5: Web 빌드 확인**

```bash
cd "Elevate.Web" && npm run build 2>&1 | tail -20
```

Expected: `built in X.XXs` (에러 없음)

- [ ] **Step 6: 최종 커밋**

```bash
git add Elevate.Web/src/hooks/useCategoryPostList.js \
        Elevate.Web/src/components/posts/EventCalendar.jsx \
        Elevate.Web/src/components/posts/PostListLayout.jsx \
        Elevate.Web/src/pages/ProgramNews.jsx \
        Elevate.Web/package.json Elevate.Web/package-lock.json
git commit -m "feat(web): add EventCalendar to event news tab

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## 통합 검증 체크리스트

모든 Task 완료 후 다음을 확인한다:

- [ ] Admin에서 `event` 카테고리 게시글 작성 시 "행사 일정" 카드가 표시됨
- [ ] 행사 일정 저장 후 API 응답에 `eventDates` 필드가 포함됨
- [ ] `/program-news?tab=event`에서 달력이 렌더링됨
- [ ] 달력에 행사 일정이 이벤트로 표시됨
- [ ] 이벤트 클릭 시 하단 게시글 목록이 해당 게시글만 표시됨
- [ ] 동일 이벤트 재클릭 시 전체 목록으로 복귀됨
- [ ] `program-news` 탭 전환 시 달력 미표시, 기존 게시글 목록 정상 표시됨
- [ ] Admin에서 `event` 외 카테고리 게시글에는 "행사 일정" 카드 미표시됨
