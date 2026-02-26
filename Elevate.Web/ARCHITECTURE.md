# 아키텍처 개요 

이 문서는 `Elevate.Web` 애플리케이션의 아키텍처, 데이터 흐름, 빌드 과정, 그리고 런타임 동작을 설명합니다.

## 핵심 개념

이 프로젝트는 **JAMstack** (JavaScript, APIs, Markup) 패턴으로 구성되어 있습니다:

- **Static Content**: 마크다운 게시글을 빌드 시점에 정적 JSON으로 변환
- **Client-Side Rendering**: React로 JSON 데이터를 클라이언트에서 렌더링
- **No Backend Required**: 순수 정적 파일 호스팅만으로 운영 가능 (Netlify, Vercel, GitHub Pages 등)

---

## 데이터 흐름

### Phase 1: 콘텐츠 작성 (Content Authoring)

콘텐츠 작성자가 마크다운 파일을 작성합니다:

```
posts/
├── copilot/
│   ├── copilot.md
│   └── copilot-chat.md
├── excel/
│   ├── excel-1.md
│   └── excel-2.md
└── m365/
    └── onedrive-tutorial.md
```

각 마크다운 파일은 **YAML Frontmatter** + **본문**으로 구성됩니다:

```markdown
---
title: "게시글 제목"
date: 2026-02-16
tags: [tag1, tag2]
series: "Optional 시리즈"
seriesOrder: 1
image: "./images/banner.png"
excerpt: "선택적 요약"
---

# 본문을 마크다운으로 작성
...
```

### Phase 2: 빌드 시점 (Build-Time Processing)

#### Step 2.1: `npm run build` 또는 `npm run generate-posts` 실행

`package.json`의 `prebuild` 스크립트가 자동으로 실행됩니다:

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-posts.js",
    "build": "vite build"
  }
}
```

#### Step 2.2: `scripts/generate-posts.js` 실행

스크립트가 다음을 수행합니다:

1. **Frontmatter 파싱** (gray-matter 라이브러리 사용):
   - `title`, `date`, `tags`, `series`, `seriesOrder`, `image`, `excerpt`, `slug` 등 메타데이터 추출
   - YAML 형식 검증

2. **이미지 처리**:
   - 마크다운에 포함된 상대경로 이미지 감지
   - `public/images/`로 복사
   - 이미지 URL을 `/images/<filename>` 형태로 변환
   - 외부 URL (http/https)은 그대로 사용

3. **Excerpt 자동 생성** (필수):
   - Frontmatter에 `excerpt` 필드가 없으면 본문의 첫 문단 추출
   - 마크다운 형식 제거 (제목, 링크, 이미지, 코드 등)
   - 160자 제한

4. **JSON 생성**:
   - `public/api/posts.json` — 전체 포스트 목록 (content 제외)
   - `public/api/posts/<category>--<slug>.json` — 개별 포스트 상세 (content 포함)

5. **시리즈 인덱싱**:
   - 같은 `series` 이름을 가진 게시글들을 카테고리별로 그룹화
   - `seriesOrder` 기준으로 정렬
   - `posts.json`의 `seriesByCategory` 필드에 추가

#### Step 2.3: Vite 빌드

- 스크립트가 생성한 공개 폴더 (`public/api/`, `public/images/`) 포함
- React 컴포넌트 번들링 (최소화, 코드 분할)
- 최종 산출물: `dist/` 디렉터리

### Phase 3: 런타임 (Runtime - Client-Side)

#### Step 3.1: 홈페이지 로드

**경로**: `/`

- `src/pages/Home.jsx` 렌더링
- 여러 섹션 컴포넌트 조합:
  - **MapSection** (지역별 학습 센터/사무소)
  - **FeatureCard** (기능 소개)
  - **CopilotStudioSection** (Copilot 소개)
  - **MEESection** (Microsoft Education Essentials)
  - **ChatWidget** (챗봇)

#### Step 3.2: 블로그 카테고리 선택

**경로**: `/blog`

- `src/pages/Blog.jsx` 렌더링
- 사용 가능한 카테고리 나열
- 사용자가 카테고리 클릭 → `/blog/:category`로 이동

#### Step 3.3: 카테고리별 게시글 목록

**경로**: `/blog/:category`

- `src/pages/PostList.jsx` 렌더링
- **데이터 페칭**:
  ```javascript
  const response = await fetch('/api/posts.json');
  const data = await response.json();
  // data.items, data.seriesByCategory 사용
  ```
- **3단 레이아웃** (큰 화면):
  - **좌측** (2열): `TagFilter` — 태그 선택, URL 쿼리 업데이트
  - **중앙** (8열): 
    - `PostGrid` — 필터된 게시글 카드 표시
    - `Pagination` — 페이지 이동
  - **우측** (2열): `SeriesNavigator` — 시리즈 정보 표시 (조건부)
- **조건부 렌더링**:
  - 시리즈가 있는 게시글이 2개 이상 → 우측 사이드바 표시
  - 없으면 중앙 영역 확대 (2단 레이아웃)
- **반응형**:
  - 작은 화면: 스택 레이아웃 (좌 → 중 → 우)

#### Step 3.4: 게시글 상세 페이지

**경로**: `/blog/:category/:postId`

- `src/pages/PostDetail.jsx` 렌더링
- **데이터 페칭**:
  ```javascript
  // 방법 1: 전체 posts.json 페치 → ID로 필터
  const response = await fetch('/api/posts.json');
  
  // 방법 2: 개별 포스트 JSON 페치 (권장, 빠름)
  const response = await fetch('/api/posts/<category>--<slug>.json');
  ```
- **2단 레이아웃** (큰 화면):
  - **좌측**: 본문 렌더링
    - 마크다운 콘텐츠 (react-markdown 사용)
    - HTML 지원 (rehype-raw)
    - 제목 자동 앵커 (rehype-slug)
  - **우측**: `TableOfContents` — H1~H3 제목 목차
- **메타정보** (상단):
  - 제목, 발행일, 태그, 작성자, 좋아요 수 등
- **네비게이션** (하단):
  - 다른 카테고리 또는 시리즈의 다음 게시글 이동 링크

---

## 시리즈 상세 흐름

시리즈는 순차적 학습을 돕기 위한 기능입니다. 예: "Excel 기초 튜토리얼" (1부 → 2부 → 3부)

### 1. 콘텐츠 작성
```yaml
# excel-1.md
series: "Excel 기초 튜토리얼"
seriesOrder: 1

# excel-2.md
series: "Excel 기초 튜토리얼"
seriesOrder: 2
```

### 2. 빌드 시점 (generate-posts.js)
- 같은 카테고리에서 같은 `series` 값을 찾음
- `seriesOrder` 기준으로 정렬
- `posts.json`에 추가:
  ```json
  {
    "items": [...],
    "seriesByCategory": {
      "excel": {
        "Excel 기초 튜토리얼": [
          { "id": "excel/excel-1", "title": "...", "seriesOrder": 1 },
          { "id": "excel/excel-2", "title": "...", "seriesOrder": 2 }
        ]
      }
    }
  }
  ```

### 3. 런타임 (PostList.jsx)
```javascript
// 현재 카테고리의 시리즈 데이터 추출
const categorySeries = seriesByCategory[category];

// 표시 중인 게시글들의 시리즈 집계
const seriesCounts = {};
posts.forEach(post => {
  if (post.series) {
    seriesCounts[post.series] = (seriesCounts[post.series] || 0) + 1;
  }
});

// 가장 많은 게시글을 가진 시리즈 선택
const mainSeries = Object.entries(seriesCounts)
  .sort(([,a], [,b]) => b - a)[0];

// SeriesNavigator에 전달
<SeriesNavigator 
  seriesPosts={categorySeries[mainSeries[0]]}
  seriesTitle={mainSeries[0]}
  category={category}
/>
```

### 4. 렌더링 (SeriesNavigator.jsx & PostList.jsx)
```
[우측 사이드바]
┌─────────────────┐
│ Excel 기초 튜토리얼 │
├─────────────────┤
│ 1. 셀 편집 방법  │ ← 클릭 가능
│ 2. 수식 활용    │
│ 3. 차트 작성    │
└─────────────────┘
```

---

## 라우팅 맵 

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | `Home.jsx` | 홈페이지 (변수 섹션) |
| `/blog` | `Blog.jsx` | 블로그 카테고리 선택 |
| `/blog/:category` | `PostList.jsx` | 카테고리별 게시글 목록 (필터, 페이지네이션) |
| `/blog/:category/:postId` | `PostDetail.jsx` | 개별 게시글 상세 |
| `*` | `NotFound.jsx` | 404 에러 |

---

## 빌드 및 배포 고려사항

### 로컬 개발
```bash
# 게시글만 생성
npm run generate-posts

# 전체 빌드 (게시글 자동 생성 포함)
npm run build

# 개발 서버 실행
npm run dev

# 프리뷰 (빌드 결과 확인)
npm run preview
```

> **주의**: `npm run dev` 중에는 마크다운 변경이 자동 반영되지 않습니다. 수동으로 `npm run generate-posts`를 실행해야 합니다.

### 배포 전 체크리스트
- [ ] 모든 마크다운 파일이 `posts/<category>/` 아래 있는가?
- [ ] Frontmatter가 YAML 형식인가? (`---` 구분선 포함)
- [ ] `title` 필드가 모든 게시글에 있는가?
- [ ] 상대경로 이미지는 마크다운 파일과 같은 디렉터리에 있는가?
- [ ] `npm run generate-posts` 성공적으로 실행? (에러 없음)
- [ ] `public/api/posts.json`이 생성되었는가?
- [ ] `npm run build` 성공적으로 실행? (에러 없음)
- [ ] `dist/` 디렉터리에 모든 파일이 포함되었는가?
- [ ] 로컬에서 `npm run preview`로 최종 확인?

### 정적 호스팅 (Netlify, Vercel 등)
```
Build Command: npm run build
Publish Directory: dist/
Environment: 특별한 환경변수 불필요
```

배포 시 자동으로 `prebuild` 스크립트가 실행되어 게시글 JSON이 생성됩니다.

### 캐싱 전략
- `index.html` — 캐시 비활성화 또는 짧은 TTL (콘텐츠 변경 필요)
- `assets/*` — 장기 캐시 (해시 기반 파일명)
- `api/*` — 중기 캐시 (1시간~1일, 콘텐츠 업데이트 빈도에 따라)

콘텐츠 업데이트 후 CDN 캐시 무효화 필요:
- Vercel: 배포 시 자동 무효화
- Netlify: 빌드 후 자동 무효화
- 기타: 수동 캐시 무효화 (관리자 패널)

### 이미지 최적화 (향후 개선 가능)
현재는 원본 이미지를 그대로 복사합니다. 향후 다음을 고려할 수 있습니다:
- WebP 변환
- 반응형 이미지 (`srcset`)
- 썸네일 자동 생성
- CDN 최적화 서비스 (Cloudinary, imgix 등)

---

## 성능 고려사항

### 번들 크기 최소화
- **Code Splitting**: React Router의 lazy loading으로 페이지별 코드 분할
- **Tree Shaking**: 사용하지 않는 라이브러리 제거 (ESM 모듈 필수)
- **CSS**: Tailwind의 PurgeCSS로 미사용 스타일 제거

### 페칭 최적화
- **posts.json**: 모든 포스트 메타 포함 (캐시하면 목록 빠르게 로드)
- **개별 포스트 JSON**: 대량 콘텐츠는 필요한 것만 페칭 (초기 로딩 빠름)
- **이미지**: CDN 호스팅 권장, HTTP 캐싱 설정

### 검색 엔진 최적화 (SEO)
- `react-helmet-async` 사용으로 메타 태그 관리
- 각 페이지에 고유한 `title`, `description` 설정
- 구조화된 데이터 (Schema.org) 추가 가능

---

## 확장 및 마이그레이션

### 현재 제약사항
- 콘텐츠 수정 후 배포 필요 (즉시 반영 불가)
- CMS 미사용 (작가 친화적 UI 없음)

### 향후 확장 옵션
1. **Netlify CMS / GitHubPages 연동**: Git 기반 CMS 추가
2. **Sanity / Contentful**: 클라우드 기반 CMS 마이그레이션
3. **GraphQL API**: 더 복잡한 콘텐츠 구조 지원
4. **댓글 시스템**: Disqus, Utterances 등 통합
5. **검색**: Algolia 또는 Meilisearch 추가

---

## 관련 문서

- 프로젝트 개요: [README.md](README.md)
- 컴포넌트: [COMPONENTS.md](COMPONENTS.md)
- 게시글 작성: [POSTS_GUIDE.md](POSTS_GUIDE.md)
- 개발 기여: [CONTRIBUTING.md](CONTRIBUTING.md)
- 배포: [DEPLOYMENT.md](DEPLOYMENT.md)
