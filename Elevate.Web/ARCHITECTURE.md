# 아키텍처 개요

이 문서는 `Elevate.Web` 애플리케이션의 아키텍처, 데이터 흐름, 런타임 동작을 설명합니다.

## 핵심 개념

이 프로젝트는 **API 기반 SPA** 패턴으로 구성되어 있습니다:

- **React SPA**: Vite로 빌드된 클라이언트 사이드 렌더링 애플리케이션
- **Azure Functions REST API**: `/api/public/*` 엔드포인트에서 게시글 데이터 제공
- **Cosmos DB**: 게시글 원본 데이터 저장소 (`elevate` DB, `posts` 컨테이너)
- **Azure Static Web Apps**: 빌드된 정적 파일 호스팅 (`swa-elv-web-test`)

---

## 데이터 흐름

```
콘텐츠 작성자
    │ Elevate.Admin CMS 사용
    ▼
Cosmos DB (elevate.posts)
    │ REST API
    ▼
Azure Functions (func-elv-server-ep-dev)
    │ /api/public/*
    ▼
postsApi.js ← apiClient.js ← VITE_API_BASE_URL
    │
    ▼
React 컴포넌트 (PostList, PostDetail, Microsoft365Update 등)
    │
    ▼
Azure Static Web Apps (swa-elv-web-test)
```

### Phase 1: 콘텐츠 관리 (Content Management)

콘텐츠 작성자는 **Elevate.Admin** CMS (`white-sea-0567ed600.4.azurestaticapps.net`)를 통해 게시글을 작성·수정합니다.

- Admin SPA에서 게시글 제목, 본문(HTML), 카테고리, 태그, 이미지 URL, 시리즈 등을 입력
- Admin → Azure Functions (`/api/admin/*`) → Cosmos DB (`elevate.posts`) 에 저장
- 별도 빌드 작업 없이 즉시 API에 반영됨

### Phase 2: 데이터 제공 (API Layer)

Azure Functions가 Cosmos DB에서 게시글을 읽어 클라이언트에 제공합니다:

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/public/posts` | 게시글 목록 (카테고리, 태그, 페이지 파라미터 지원) |
| `GET /api/public/posts/{category}/{slug}` | 개별 게시글 상세 |
| `GET /api/public/posts/tags` | 태그 목록 |
| `GET /api/public/posts/series/{category}` | 카테고리 내 시리즈 목록 |
| `GET /api/public/posts/series/{category}/{seriesName}` | 시리즈 전체 게시글 |

### Phase 3: 런타임 (Runtime - Client-Side)

#### 홈페이지 로드

**경로**: `/`

- `src/pages/Home.jsx` 렌더링
- 섹션 컴포넌트: **MapSection**, **FeatureCard**, **CopilotStudioSection**, **MEESection**, **ChatWidget**

#### 카테고리별 게시글 목록

**경로**: `/:category`

- `src/pages/PostList.jsx` 렌더링
- **데이터 페칭** (`postsApi.js` 경유):
  ```javascript
  // listPosts({ category, tag, page, pageSize })
  const { items, total } = await listPosts({ category, tag, page });
  ```
- **3단 레이아웃** (큰 화면): 좌측 `TagFilter` / 중앙 `PostGrid` + `Pagination` / 우측 `SeriesNavigator` (조건부)
- 시리즈 드롭다운 선택 상태는 `?series=` 쿼리로 유지

#### Microsoft 365 업데이트 목록

**경로**: `/update`

- `src/pages/Microsoft365Update.jsx` 렌더링
- `listPosts({ category: 'update' })` 호출

#### 게시글 상세 페이지

**경로**: `/:category/:postId`

- `src/pages/PostDetail.jsx` 렌더링
- **데이터 페칭**:
  ```javascript
  // getPost(category, slug)
  const post = await getPost(category, slug);
  ```
- `post.contentMarkdown` 필드에 HTML 저장 (마이그레이션 시 `marked()`로 변환됨)
- `dangerouslySetInnerHTML` + `DOMPurify`로 렌더링
- **2단 레이아웃**: 좌측 본문 / 우측 `TableOfContents`

---

## API 클라이언트 구조

```
src/lib/
├── apiClient.js      # fetch 래퍼, VITE_API_BASE_URL 기반 URL 구성
└── postsApi.js       # listPosts / getPost / listTags / listSeriesByCategory / listSeriesPosts
```

`VITE_API_BASE_URL` 기본값: `https://func-elv-server-ep-dev.azurewebsites.net/api/public`

---

## 시리즈 처리 흐름

1. **작성 시**: Admin에서 `series`/`seriesOrder` 필드 입력 → Cosmos DB에 저장
2. **목록 페이지**: `listSeriesByCategory(category)` 호출 → 우측 `SeriesNavigator` 렌더링
3. **시리즈 선택**: `?series=<name>` 쿼리 → `listSeriesPosts(category, seriesName)` 호출
4. **사이드바**: 시리즈 게시글 순서대로 표시, 현재 게시글 하이라이트

---

## 라우팅 맵

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | `Home.jsx` | 홈페이지 |
| `/:category` | `PostList.jsx` | 카테고리별 게시글 목록 |
| `/:category/:postId` | `PostDetail.jsx` | 개별 게시글 상세 (`update/slug` 포함) |
| `/update` | `Microsoft365Update.jsx` | M365 업데이트 목록 |
| `*` | `NotFound.jsx` | 404 에러 |

---

## 빌드 및 배포

```bash
npm run build   # Vite 빌드 → dist/
```

`generate-posts` 스크립트는 더 이상 사용하지 않습니다. 게시글 데이터는 빌드 시점이 아닌 런타임에 API에서 가져옵니다.

- 배포: Azure Static Web Apps (`swa-elv-web-test`)
- 자세한 배포 절차: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 관련 문서

- 프로젝트 개요: [README.md](README.md)
- 컴포넌트: [COMPONENTS.md](COMPONENTS.md)
- 게시글 관리: [POSTS_GUIDE.md](POSTS_GUIDE.md)
- 배포: [DEPLOYMENT.md](DEPLOYMENT.md)

