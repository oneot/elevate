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

## 상호작용 예시 

- `TagFilter`가 URL 쿼리(`useSearchParams`)를 업데이트하면 `PostList`가 해당 쿼리를 읽어 `posts.json`을 필터링합니다.
- `Pagination`은 `page` 쿼리 파라미터를 제어합니다.

## 스타일 가이드 

- Tailwind CSS를 사용합니다. 유틸 클래스를 우선 사용하고, 중복되는 스타일은 작은 유틸 컴포넌트나 함수로 추출하세요.

## 확장 제안

- Storybook 도입으로 컴포넌트 문서화·시각 테스트 추가 권장
- 각 컴포넌트에 대해 간단한 단위 테스트와 스냅샷 테스트 권장

## 관련 파일 참조
- 컴포넌트 디렉터리: `src/components/`
- 카테고리 페이지들: `src/pages/categories/`
