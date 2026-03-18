# 컴포넌트 개요 

이 문서는 `src/components/` 및 `src/pages/` 디렉터리의 주요 컴포넌트 목록, 책임, 그리고 props를 설명합니다. 

## 요약 

- 한국어: 이 프로젝트는 블로그 UI 컴포넌트 외에도 홈, 지도, 챗 등 다양한 섹션 컴포넌트로 구성되어 있습니다. 각 컴포넌트는 단일 책임 원칙을 따르며, 재사용 가능하고 테스트 가능한 구조를 유지합니다.

---

## 사이트 주요 섹션 컴포넌트 

홈페이지와 각 섹션을 구성하는 주요 컴포넌트들입니다.

### 네비게이션 및 레이아웃
- **Navigation.jsx** ([src/components/Navigation.jsx](src/components/Navigation.jsx))
  - 사이트 헤더의 네비게이션 바와 로고 표시
  - Props: `links` (라우팅 메뉴)
  - 역할: 전체 페이지의 상단 고정 네비게이션 제공

- **Logo.jsx** ([src/components/Logo.jsx](src/components/Logo.jsx))
  - 로고 이미지/텍스트 렌더링
  - 역할: 브랜드 아이덴티티 표시, Navigation에서 사용

### 지도 섹션 (홈 페이지)
- **MapSection.jsx** ([src/components/MapSection.jsx](src/components/MapSection.jsx))
  - 한국 지도와 지역별 학습 센터/사무소 정보 표시 (히어로 섹션)
  - Props: `offices` (사무소 데이터)
  - 내부 컴포넌트: `KoreaMap`, `MapTooltip` 사용
  - 특징:
    - PC: 지도 위에 마우스 오버 시 툴팁 표시
    - 모바일: 지역 클릭 시 확인 대화 후 외부 링크 이동
    - 반응형 디자인 (모바일 우선)

- **KoreaMap.jsx** ([src/components/KoreaMap.jsx](src/components/KoreaMap.jsx))
  - SVG로 그린 한반도 지도 (시/도별 영역 클릭 가능)
  - Props: 
    - `onRegionHover(code)` - 마우스 호버 콜백
    - `onRegionClick(code)` - 클릭 콜백
    - `hoveredRegion` - 현재 호버된 지역 코드 (스타일 반영용)
  - 역할: 인터랙티브 지도 렌더링, 지역별 학습 센터 위치 표시

- **MapTooltip.jsx** ([src/components/MapTooltip.jsx](src/components/MapTooltip.jsx))
  - 지도 호버 시 표시되는 풍선(팝업) UI
  - Props: 
    - `position` - 절대 좌표 (x, y)
    - `office` - 사무소 정보 (이름, 연락처, URL 등)
  - 역할: 지역 정보 표시, 동적 위치 지정

### 블로그 게시글 관련 컴포넌트
- **PostCard.jsx** ([src/components/PostCard.jsx](src/components/PostCard.jsx))
  - 게시글 카드 (이미지, 제목, 태그, 메타 정보)
  - Props:
    - `post` - 게시글 객체 (id, title, excerpt, imageUrl, tags, publishedAt, category)
    - `onClick` - 클릭 콜백
  - 역할: 게시글 목록에서 각 게시글 표시

- **PostGrid.jsx** ([src/components/PostGrid.jsx](src/components/PostGrid.jsx))
  - 카드 그리드 레이아웃 (`PostCard`를 자식으로 사용)
  - Props: 
    - `items` - Post 배열
    - `columns` - 그리드 열 수 (선택)
  - 역할: 게시글 카드들을 유동 레이아웃으로 정렬

- **TagFilter.jsx** ([src/components/TagFilter.jsx](src/components/TagFilter.jsx))
  - 태그 필터 UI 및 선택 로직
  - Props: 
    - `tags` - 사용 가능한 태그 목록
    - `selectedTags` - 선택된 태그들
    - `onTagChange(tag)` - 태그 선택 콜백
  - 역할: 게시글 목록 필터링, URL 쿼리 연동

- **SeriesNavigator.jsx** ([src/components/SeriesNavigator.jsx](src/components/SeriesNavigator.jsx))
  - 카테고리 내 시리즈를 선택해 게시글 순서를 표시하는 우측 사이드바
  - Props:
    - `seriesOptions` - 선택 가능한 시리즈 배열 (`key`, `title`, `posts`)
    - `selectedSeries` - 현재 선택된 시리즈 key
    - `onSeriesChange(seriesKey)` - 시리즈 변경 콜백
    - `category` - 카테고리
    - `currentPostId` - 현재 게시글 ID (선택)
    - `buildPostHref(post)` - 상세 페이지 문맥(쿼리 포함) 링크 생성 콜백 (선택)
    - `previousPost` / `nextPost` - 사이드바 하단 요약형 이전/다음 이동 데이터 (선택)
    - `sticky` - sticky 적용 여부 (기본값 true)
  - 역할: 연속 학습 콘텐츠 네비게이션
  - 특징: Sticky 위치, 드롭다운 선택 UI, 모바일에서 숨김

- **TableOfContents.jsx** ([src/components/TableOfContents.jsx](src/components/TableOfContents.jsx))
  - 게시글 상세 페이지의 목차 우측 사이드바
  - Props: 
    - `headings` - H1~H3 제목 데이터
  - 역할: 긴 글 네비게이션, `SeriesNavigator`와 유사한 스타일

- **Pagination.jsx** ([src/components/Pagination.jsx](src/components/Pagination.jsx))
  - 페이지 이동 UI
  - Props: 
    - `current` - 현재 페이지
    - `total` - 전체 페이지 수
    - `onPageChange(page)` - 페이지 변경 콜백
  - 역할: 게시글 목록 페이지네이션

- **SearchBar.jsx** ([src/components/SearchBar.jsx](src/components/SearchBar.jsx))
  - 검색 입력 UI
  - Props: 
    - `placeholder` - 입력창 힌트 텍스트
    - `onSearch(query)` - 검색 콜백
  - 역할: 게시글 검색 (필요 시 활성화)

### 추가 섹션 컴포넌트
- **ChatWidget.jsx** ([src/components/ChatWidget.jsx](src/components/ChatWidget.jsx))
  - 챗봇/채팅 위젯 (예: Microsoft Bot Framework Webchat)
  - Props: 채팅 설정 (채널 강좌, 사용자 정보 등)
  - 역할: AI 에이전트/챗봇 인터페이스 제공
  - 위치: 홈페이지 또는 특정 섹션

- **CopilotStudioSection.jsx** ([src/components/CopilotStudioSection.jsx](src/components/CopilotStudioSection.jsx))
  - Microsoft Copilot Studio 관련 섹션
  - Props: Copilot 정보 (설명, 이미지, 링크 등)
  - 역할: Copilot 소개 및 리소스 링크

- **FeatureCard.jsx** ([src/components/FeatureCard.jsx](src/components/FeatureCard.jsx))
  - 기능/특징 소개 카드
  - Props: 
    - `title` - 카드 제목
    - `description` - 설명
    - `icon`/`image` - 아이콘 또는 이미지
  - 역할: 기능 소개, 특징 강조

- **MEESection.jsx** ([src/components/MEESection.jsx](src/components/MEESection.jsx))
  - Microsoft Education Essentials (MEE) 섹션
  - Props: MEE 정보 (설명, 리소스, 링크 등)
  - 역할: 교육 프로그램 소개 및 정보 제공

---

## 페이지 컴포넌트 

애플리케이션의 각 라우팅 경로에 해당하는 페이지 컴포넌트입니다.

### Home.jsx ([src/pages/Home.jsx](src/pages/Home.jsx))
- **설명**: 홈페이지 레이아웃
- **주요 컴포넌트**: `MapSection`, `FeatureCard`, `CopilotStudioSection` 등 여러 섹션을 조합
- **역할**: 랜딩 페이지 구성

### Blog.jsx ([src/pages/Blog.jsx](src/pages/Blog.jsx))
- **설명**: 블로그 카테고리 선택 페이지
- **역할**: 사용자가 콘텐츠 카테고리를 선택하도록 안내

### PostList.jsx ([src/pages/PostList.jsx](src/pages/PostList.jsx))
- **설명**: 카테고리별 게시글 목록 페이지
- **요소**: 
  - 좌측: `TagFilter`
  - 중앙: `PostGrid` + `Pagination`
  - 우측: `SeriesNavigator` (조건부, 시리즈 선택형)
- **레이아웃**: 3단 또는 2단 (시리즈 유무에 따라)
- **역할**: 게시글 필터링, 페이지네이션, 시리즈 네비게이션
- **URL 상태**: `?series=<seriesName>` 쿼리로 선택 상태 유지

### PostDetail.jsx ([src/pages/PostDetail.jsx](src/pages/PostDetail.jsx))
- **설명**: 게시글 상세 페이지
- **요소**:
  - 좌측: 본문 (마크다운 렌더링)
  - 우측: `SeriesNavigator` + `TableOfContents` (조건부, 시리즈가 있으면 상단에 시리즈 박스 표시)
  - 본문 하단: 상세형 이전/다음 글 카드 (시리즈 내부 순서 기준)
- **레이아웃**: 2단
- **역할**: 전체 게시글 콘텐츠 표시 + 시리즈 탐색/순차 이동

### NotFound.jsx ([src/pages/NotFound.jsx](src/pages/NotFound.jsx))
- **설명**: 404 에러 페이지
- **역할**: 존재하지 않는 경로 처리

---

## 컴포넌트 상호작용 흐름 

### 게시글 목록 화면
1. **URL 쿼리 변경** → `useSearchParams` 훅으로 감지
2. **`TagFilter`** 가 사용자 선택 태그를 URL 쿼리로 반영
3. **`PostList`** 가 쿼리를 읽고 `posts.json` 필터링
4. **`PostGrid`** + **`PostCard`** 가 필터된 목록 표시
5. **`Pagination`** 이 페이지 이동 처리
6. **`SeriesNavigator`** 가 현재 카테고리의 시리즈 정보 표시 (조건부)

### 게시글 상세 화면
1. 라우팅: `/:category/:postId`
2. **`PostDetail`** 가 URL 파라미터로부터 ID 추출
3. 개별 JSON 또는 전체 `posts.json`에서 게시글 데이터 로드
4. 마크다운 렌더링 (좌측)
5. **`TableOfContents`** 가 제목 목록 표시 (우측)

### 지도 섹션 (홈)
1. **`MapSection`** 이 `offices` 데이터 수신
2. **`KoreaMap`** 에 호버 콜백 전달
3. 사용자 마우스 호버 시 **`MapTooltip`** 위치 업데이트
4. 모바일에서는 클릭 이벤트 처리

---

## props 계약 예시 

### PostCard
```js
{
  post: {
    id: string,           // "category/slug"
    title: string,
    excerpt: string,
    imageUrl: string,     // URL 또는 빈 문자열
    tags: string[],
    publishedAt: string,  // "YYYY-MM-DD"
    category: string
  },
  onClick: () => void
}
```

### PostGrid
```js
{
  items: Post[],
  columns: number // optional, default 3
}
```

### SeriesNavigator
```js
{
  seriesOptions: Array<{
    key: string,
    title: string,
    posts: Array<{
      id: string,
      slug: string,
      title: string,
      seriesOrder: number
    }>
  }>,
  selectedSeries: string,
  onSeriesChange: (seriesKey: string) => void,
  category: string,
  currentPostId?: string  // optional, 현재 게시글 강조용
}
```

### MapSection
```js
{
  offices: Array<{
    code: string,             // 지역 코드
    name: string,             // 지역명
    cityName: string,         // 도시명
    address: string,          // 주소
    phone?: string,           // 전화번호
    url?: string,             // 웹사이트 URL
    latitude?: number,        // 좌표
    longitude?: number
  }>
}
```

### KoreaMap
```js
{
  onRegionHover: (code: string) => void,
  onRegionClick: (code: string) => void,
  hoveredRegion?: string  // optional, 호버 상태 스타일
}
```

### MapTooltip
```js
{
  position: { x: number, y: number },  // 절대 좌표
  office: {
    name: string,
    address: string,
    phone?: string,
    url?: string
  }
}
```

---

## 스타일 가이드 

- **Tailwind CSS** 유틸 클래스를 우선 사용합니다.
- 중복되는 스타일은 작은 유틸 컴포넌트나 CSS 함수로 추출합니다.
- 반응형 디자인: 모바일 우선 (`sm:`, `lg:`, `xl:` 브레이크포인트)
- 다크 모드: 필요 시 `dark:` 모드 클래스 추가 (현재는 라이트 모드만 사용)

---

## 확장 및 테스 제안 

- **Storybook** 도입으로 컴포넌트 시각 테스트 및 문서화
- 각 컴포넌트에 대해 단위 테스트 작성 (Jest + React Testing Library)
- 스냅샷 테스트로 레이아웃 회귀 감지
- E2E 테스트 (Cypress 또는 Playwright)로 사용자 흐름 검증

---

## 관련 파일 및 폴더

- 컴포넌트 디렉터리: [src/components/](src/components/)
- 페이지 디렉터리: [src/pages/](src/pages/)
- 카테고리별 페이지: [src/pages/categories/](src/pages/categories/)
- 스타일: [src/App.css](src/App.css), [src/index.css](src/index.css)
- Tailwind 설정: [tailwind.config.js](tailwind.config.js)

---

## 마이그레이션 노트

- **이전 문서**: `Footer.jsx` 언급 제거 (현재 미사용)
- **신규 추가**: 지도, 챗, Copilot 등 홈페이지 섹션 컴포넌트 문서화
