# 아키텍처 개요 

이 문서는 `Elevate.Web` 애플리케이션의 아키텍처 개요와 데이터 흐름을 설명합니다.

## 요약 

- 한국어: 이 프로젝트는 마크다운 기반 게시글을 빌드 시점에 JSON으로 변환해 정적 API로 서비스하는 JAMstack 패턴을 따릅니다.

## 데이터 흐름 

1. 작성자 → `posts/<category>/<slug>.md` (마크다운 + frontmatter)
2. `scripts/generate-posts.js` 실행
   - `gray-matter`로 frontmatter 파싱 (title, tags, date, series, seriesOrder 등)
   - 이미지(상대경로) 복사 → `public/images/`
   - `public/api/posts.json` 생성(목록, content 제외)
   - `public/api/posts/{category}--{slug}.json` 생성(상세, content 포함)
   - 시리즈 인덱스 생성 → `posts.json`의 `seriesByCategory` 필드
3. 클라이언트(React) → `/api/posts.json` fetch → 화면 렌더링

텍스트 다이어그램:

```
posts/*.md  -->  scripts/generate-posts.js  -->  public/api/*.json
                                     -->  public/images/*
React client --fetch--> public/api/posts.json --> PostList / PostDetail
                                              --> seriesByCategory 추출
```

### 시리즈 데이터 흐름

1. **작성 단계**:
   - 마크다운 파일 frontmatter에 `series`, `seriesOrder` 추가
   ```yaml
   series: "Excel 활용 가이드"
   seriesOrder: 1
   ```

2. **빌드 단계** (`scripts/generate-posts.js`):
   - Frontmatter에서 `series`, `seriesOrder` 추출
   - 카테고리별로 시리즈 그룹화
   - `posts.json`에 `seriesByCategory` 객체 추가:
   ```json
   {
     "items": [...],
     "seriesByCategory": {
       "excel": {
         "Excel 활용 가이드": [
           { "id": "excel/excel-1", "slug": "excel-1", "title": "...", "seriesOrder": 1 },
           { "id": "excel/excel-2", "slug": "excel-2", "title": "...", "seriesOrder": 2 }
         ]
       }
     }
   }
   ```
   - `seriesOrder`로 오름차순 정렬

3. **런타임 단계** (`PostList.jsx`):
   - `posts.json` fetch
   - 현재 카테고리의 `seriesByCategory[category]` 추출
   - 표시 중인 게시글들의 시리즈 집계
   - 가장 많은 게시글을 가진 시리즈를 `SeriesNavigator`에 전달
   - 시리즈 게시글이 2개 미만이면 사이드바 숨김

4. **렌더링** (`SeriesNavigator.jsx`):
   - 우측 사이드바에 시리즈 제목과 순서대로 게시글 목록 표시
   - Sticky 위치로 스크롤 시 고정
   - 사용자 클릭 시 해당 게시글로 라우팅

## 라우팅 책임 

- `/` : 홈
- `/blog` : 블로그 카테고리 선택
- `/blog/:category` : 카테고리별 목록 (`PostList`) — 클라이언트에서 `posts.json`을 필터
  - 3단 레이아웃: TagFilter (좌) | PostGrid (중앙) | SeriesNavigator (우)
  - SeriesNavigator는 시리즈가 있을 때만 표시되며, 없으면 2단 레이아웃으로 축소
- `/blog/:category/:postId` : 게시글 상세 (`PostDetail`) — 개별 JSON fetch 가능
  - 2단 레이아웃: 본문 (좌) | TableOfContents (우)

## 빌드 및 배포 고려사항 

- `prebuild` 훅: `npm run build` 실행 시 `scripts/generate-posts.js`가 자동 실행됩니다. 정적 호스팅(예: Netlify, Vercel)에서 빌드 시점에 JSON이 생성되어야 합니다.
- 이미지 경로 규칙: 상대경로 이미지 사용 시 `imageUrl`은 `/images/<name>` 형태로 변경됩니다.
- 캐시: 정적 JSON은 CDN 캐시가 유리합니다. 콘텐츠 업데이트 시 빌드 후 캐시 무효화 전략 필요합니다.

## 운영(콘텐츠 관리) 워크플로우 제안 

- 콘텐츠 수정 → 로컬에서 `npm run generate-posts` 실행 → 변경 확인 → 배포
- 장기 확장: 외부 CMS(예: Netlify CMS, Sanity, Contentful)로 마이그레이션하면 작성자 경험 개선 가능

## 관련 문서 

- 프로젝트 개요: `README.md`
- 게시글 작성 가이드: `POSTS_GUIDE.md`
- 컴포넌트 설명: `COMPONENTS.md`
