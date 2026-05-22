# Event Calendar 설계 문서

**날짜**: 2026-05-20  
**브랜치**: YoonKeumJae/update-news-section  
**관련 페이지**: `/program-news?tab=event` (행사 소식 탭)

---

## 1. 개요

행사 소식 탭(`event` 카테고리)에 react-big-calendar 기반 달력을 추가한다.  
달력에는 각 게시글의 행사 일정이 표시되며, 이벤트를 클릭하면 하단 게시글 목록이 해당 게시글만 보이도록 필터링된다.

---

## 2. 데이터 모델

### 2.1 Cosmos DB 스키마 추가 필드

`event` 카테고리 게시글에 `eventDates` 필드를 추가한다.

```json
{
  "eventDates": [
    { "start": "2026-06-10", "end": "2026-06-12" },
    { "start": "2026-06-20", "end": "2026-06-20" }
  ]
}
```

- `eventDates`는 optional — `event` 외 카테고리 또는 일정 없는 게시글은 `null`
- `start` / `end`: `YYYY-MM-DD` 형식의 ISO 날짜 문자열
- **단일 날짜**: `start === end` 인 원소 1개
- **기간**: `start ≠ end` 인 원소 1개
- **다중 날짜**: 원소 여러 개 (각 원소는 단일 날짜 또는 기간)
- Cosmos DB NoSQL 특성상 스키마 마이그레이션 불필요 — 기존 게시글은 `eventDates: null`로 자동 처리

### 2.2 Admin 입력 타입 (UI 전용 상태, DB에 저장하지 않음)

| 타입 | 입력 방식 | 저장 형식 |
|------|----------|----------|
| 단발 | 날짜 1개 | `[{ start: D, end: D }]` |
| 다중 | 날짜 N개 (+ 날짜 추가 버튼) | `[{ start: D1, end: D1 }, { start: D2, end: D2 }, ...]` |
| 기간 | 시작일 + 종료일 | `[{ start: D1, end: D2 }]` |

---

## 3. 백엔드 변경 (`Elevate.Server`)

### 3.1 `src/controllers/postController.js`

1. `buildListQuery` — SELECT에 `p.eventDates` 추가
2. `toPostSummary` — `eventDates: post.eventDates || null` 추가

### 3.2 `src/controllers/adminController.js`

3. `createPost` — `eventDates: req.body.eventDates || null` 저장
4. `updatePost` — `eventDates: req.body.eventDates !== undefined ? req.body.eventDates : existing.eventDates`
5. `toPostResponse` — `eventDates` 필드 포함 (Admin 편집 화면 값 복원용)
6. 유효성 검사 — `eventDates`가 존재할 때 `[{ start: string, end: string }]` 형식 확인

---

## 4. Admin UI 변경 (`Elevate.Admin`)

### 4.1 신규 컴포넌트: `src/components/editor/EventDatesEditor.jsx`

- `post.category === 'event'`일 때만 `PostMetaSidebar`에서 렌더링
- 기존 메타데이터 카드 아래 별도 `Card`로 추가

**UI 구조**:
```
[행사 일정] Card
  ├─ 일정 없음 상태: "행사 일정 추가" 버튼
  └─ 일정 목록 (items)
       ├─ [타입 드롭다운: 단발 | 다중 | 기간]
       │    단발 → date input 1개
       │    다중 → date input N개 + "+ 날짜 추가" 버튼
       │    기간 → date input 2개 (시작 ~ 종료)
       └─ [삭제] 버튼
```

**Props**:
- `eventDates: Array<{ start: string, end: string }>` — 현재 값
- `onChange: (newEventDates) => void` — 변경 콜백

**내부 상태**: 각 일정 항목의 `type` (`single` | `multi` | `range`) — UI 편의용, onChange 시 `{ start, end }` 배열로 정규화해서 전달

### 4.2 `PostEditor.jsx` 변경

- post 상태에 `eventDates` 필드 추가
- 저장/불러오기 시 `eventDates` 포함
- `PostMetaSidebar`에 `eventDates` / `onEventDatesChange` prop 전달

### 4.3 `PostMetaSidebar.jsx` 변경

- `eventDates`, `onEventDatesChange` prop 추가
- `post.category === 'event'`일 때 `<EventDatesEditor>` 렌더링

---

## 5. 프론트엔드 변경 (`Elevate.Web`)

### 5.1 의존성 추가

```bash
npm install react-big-calendar date-fns
```

### 5.2 신규 컴포넌트: `src/components/posts/EventCalendar.jsx`

**Props**:
```js
{
  posts: Array,          // event 카테고리 게시글 (eventDates 포함)
  selectedSlug: string | null,  // 현재 선택된 게시글 slug
  onSelect: (slug) => void,
  onDeselect: () => void
}
```

**동작**:
- `react-big-calendar` 월 뷰, `defaultView="month"`, `defaultDate={new Date()}`
- 각 post의 `eventDates` → `{ title: post.title, start, end, slug }` 변환
- `eventDates`가 null/빈 post는 달력에 미표시
- 이벤트 클릭: `onSelect(event.slug)`, 이미 선택된 slug면 `onDeselect()`
- 스타일: `bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm` 래퍼 적용 (기존 글래스모피즘 패턴 유지)
- date-fns localizer, 한국어 로케일

### 5.3 `ProgramNews.jsx` — `NewsTabContent` 수정 (event 탭)

**URL 상태**: `?event=<slug>` 파라미터 추가 (기존 `tab`, `q`, `tags`, `page`와 공존)

**필터 로직**:
```
selectedSlug = searchParams.get('event')

표시할 posts:
  selectedSlug 있음 → slug가 일치하는 게시글만 표시
  selectedSlug 없음 → 전체 paginatedPosts 표시

달력 이벤트 클릭 (onSelect):
  → updateUrlParams({ event: slug })

달력 이벤트 재클릭 / 해제 (onDeselect):
  → updateUrlParams({ event: '' })  ← 파라미터 삭제
```

**레이아웃** (event 탭 전용):
```
PostListLayout
  title: Logo | 행사 및 프로그램 소식
  navTabs: 행사소식/프로그램소식 탭 버튼
  [EventCalendar — 전체 너비, navTabs 아래]  ← event 탭에만 추가
  tagFilterProps + posts (기존 그대로)
```

`PostListLayout`의 `navTabs` 아래(`<nav>` 다음)에 `eventCalendar` slot을 추가하거나, `NewsTabContent`에서 `PostListLayout` 위에 별도 렌더링하는 방식 중 택일.
→ **`PostListLayout`에 `calendarSlot` prop 추가** 방식 선택 (기존 레이아웃 구조 유지).

---

## 6. 컴포넌트 변경 요약

| 파일 | 변경 유형 |
|------|----------|
| `Elevate.Server/src/controllers/postController.js` | 수정 (eventDates SELECT/summary) |
| `Elevate.Server/src/controllers/adminController.js` | 수정 (create/update/response) |
| `Elevate.Admin/src/components/editor/EventDatesEditor.jsx` | **신규** |
| `Elevate.Admin/src/components/editor/PostMetaSidebar.jsx` | 수정 (EventDatesEditor 통합) |
| `Elevate.Admin/src/pages/PostEditor.jsx` | 수정 (eventDates 상태/저장) |
| `Elevate.Web/src/components/posts/EventCalendar.jsx` | **신규** |
| `Elevate.Web/src/components/posts/PostListLayout.jsx` | 수정 (calendarSlot prop 추가) |
| `Elevate.Web/src/pages/ProgramNews.jsx` | 수정 (EventCalendar 통합, ?event URL) |

---

## 7. 비기능 요구사항

- `eventDates`가 없거나 빈 달(행사 없는 달)에도 달력은 항상 표시
- `event` 카테고리 백엔드 미생성 시 게시글 없음 상태로 graceful 처리 (기존 useCategoryPostList 동작 유지)
- 달력 월 탐색 시 게시글 필터 유지 (selectedSlug URL 보존)
- 태그 필터와 달력 필터는 독립 작동 — 태그 필터 + 달력 선택 동시 적용 시 AND 조건

---

## 8. 구현 순서

1. **Elevate.Server** — `eventDates` 필드 추가 (백엔드 먼저)
2. **Elevate.Admin** — `EventDatesEditor` + `PostEditor` 연동
3. **Elevate.Web** — `EventCalendar` 컴포넌트 + `ProgramNews` 통합
4. 통합 검증 — Admin에서 행사 일정 저장 → 웹 달력에 표시 확인
