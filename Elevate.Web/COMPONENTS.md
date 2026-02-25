# 컴포넌트 개요 

이 문서는 `src/components/` 디렉터리의 주요 컴포넌트 목록, 책임, 그리고 간단한 props 계약을 설명합니다. 

## 요약 

- 한국어: 주요 UI 조각은 재사용 가능한 React 컴포넌트로 분리되어 있으며, `PostGrid`/`PostCard` 콤비네이션으로 포스트 목록을 구성합니다.

## 주요 컴포넌트 인벤토리 

- `Navigation.jsx` — 사이트 네비게이션 및 로고 표시 ([src/components/Navigation.jsx](src/components/Navigation.jsx#L1))
- `Logo.jsx` — 로고 렌더링 ([src/components/Logo.jsx](src/components/Logo.jsx#L1))
- `PostCard.jsx` — 게시글 카드(이미지, 제목, 태그, 메타) ([src/components/PostCard.jsx](src/components/PostCard.jsx#L1))
- `PostGrid.jsx` — 카드 그리드 레이아웃, `PostCard`를 자식으로 사용 ([src/components/PostGrid.jsx](src/components/PostGrid.jsx#L1))
- `TagFilter.jsx` — 태그 필터 UI 및 선택 로직 ([src/components/TagFilter.jsx](src/components/TagFilter.jsx#L1))
- `SeriesNavigator.jsx` — 게시글 시리즈 순서 표시 사이드바 ([src/components/SeriesNavigator.jsx](src/components/SeriesNavigator.jsx#L1))
- `TableOfContents.jsx` — 게시글 상세 페이지의 목차 사이드바 ([src/components/TableOfContents.jsx](src/components/TableOfContents.jsx#L1))
- `Pagination.jsx` — 페이지 이동 UI 및 콜백 ([src/components/Pagination.jsx](src/components/Pagination.jsx#L1))
- `SearchBar.jsx` — 검색 입력 컴포넌트 ([src/components/SearchBar.jsx](src/components/SearchBar.jsx#L1))
- `Footer.jsx` — 푸터 ([src/components/Footer.jsx](src/components/Footer.jsx#L1))

## 컴포넌트 계약(예시) 

- `PostCard` props (예시):

```js
{
  post: {
    id: string,
    title: string,
    excerpt?: string,
    imageUrl?: string,
    tags?: string[],
    publishedAt?: string,
    category: string
  },
  onClick?: () => void
}
```

- `PostGrid` props (예시):

```js
{
  items: Post[],
  columns?: number, // 그리드 컬럼
}
```

- `SeriesNavigator` props:

```js
{
  seriesPosts: Array<{
    id: string,
    slug: string,
    title: string,
    seriesOrder: number
  }>,
  seriesTitle: string,
  category: string,
  currentPostId?: string // optional, 현재 게시글 강조용
}
```

**목적**: 게시글 리스트 화면에서 같은 시리즈에 속한 게시글들의 순서를 표시하는 우측 사이드바

**특징**:
- `TableOfContents`와 동일한 스타일링 패턴 사용
- Sticky 위치 (`sticky top-4`)로 스크롤 시 고정
- `seriesOrder` 순서대로 정렬된 목록 표시
- 클릭 시 해당 게시글로 이동
- 현재 게시글 active 상태 표시 (optional)
- 모바일에서는 숨김 처리 (`hidden lg:block`)

**사용 위치**:
- `PostList` 컴포넌트의 우측 사이드바
- 조건: 해당 카테고리에 series 정보가 있는 게시글이 2개 이상일 때만 표시

**데이터 소스**:
- `posts.json`의 `seriesByCategory[category][seriesName]` 배열

## 상호작용 예시 

- `TagFilter`가 URL 쿼리(`useSearchParams`)를 업데이트하면 `PostList`가 해당 쿼리를 읽어 `posts.json`을 필터링합니다.
- `Pagination`은 `page` 쿼리 파라미터를 제어합니다.
- `SeriesNavigator`는 `PostList`에서 현재 카테고리의 시리즈 정보를 받아 우측 사이드바에 표시합니다. 사용자가 시리즈 항목을 클릭하면 해당 게시글 상세 페이지로 이동합니다.
- `PostList`는 3단 레이아웃을 사용합니다:
  - 왼쪽: `TagFilter` (2 cols)
  - 중앙: `PostGrid` + `Pagination` (7-8 cols)
  - 오른쪽: `SeriesNavigator` (2-3 cols, 시리즈가 있을 때만 표시)

## 스타일 가이드 

- Tailwind CSS를 사용합니다. 유틸 클래스를 우선 사용하고, 중복되는 스타일은 작은 유틸 컴포넌트나 함수로 추출하세요.

## 확장 제안

- Storybook 도입으로 컴포넌트 문서화·시각 테스트 추가 권장
- 각 컴포넌트에 대해 간단한 단위 테스트와 스냅샷 테스트 권장

## 관련 파일 참조
- 컴포넌트 디렉터리: `src/components/`
- 카테고리 페이지들: `src/pages/categories/`
