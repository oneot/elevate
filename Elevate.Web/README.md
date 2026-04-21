
# Elevate Web — 프로젝트 개요 / Project Overview

한국어: 이 저장소는 Microsoft Elevate의 교육 사례 공유를 위한 공개 블로그 SPA입니다. 게시글 데이터는 Azure Functions REST API를 통해 Cosmos DB에서 동적으로 불러옵니다.

English: This repository contains the public blog SPA for Microsoft Elevate. Post data is fetched dynamically from Cosmos DB via an Azure Functions REST API.

## 주요 기능 / Key features

- Azure Functions API(`/api/public/*`)를 통해 게시글 목록·상세·시리즈·태그 동적 조회.
- React + Vite 기반 SPA, Tailwind CSS 스타일링.
- 카테고리별 포스트 목록, 태그 필터링, 페이지네이션, 포스트 상세 페이지 제공.
- 카테고리 페이지에서 시리즈 드롭다운 선택 지원 (`?series=` 쿼리로 선택 상태 유지).
- Microsoft Clarity 사용자 분석 통합.
- Azure Bot Framework 기반 ChatWidget 통합.

## 기술 스택 / Tech stack

- React 19, Vite 7
- Tailwind CSS, react-router-dom, DOMPurify
- 백엔드: Azure Functions v4 (Node.js), Cosmos DB (`elevate.posts`)
- 호스팅: Azure Static Web Apps (`swa-elv-web-test`)

## 빠른 시작 / Quick start

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 환경변수 / Environment variables

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_API_BASE_URL` | 권장 | Function App public API 기본 URL. 기본값: `https://func-elv-server-ep-dev.azurewebsites.net/api/public` |
| `VITE_CLARITY_ENABLED` | 운영 | `true`면 Clarity 활성화 |
| `VITE_CLARITY_PROJECT_ID` | 운영 | Microsoft Clarity 프로젝트 ID |
| `VITE_DIRECT_LINE_SECRET` | 운영 | Azure Bot Framework Direct Line 시크릿 |

로컬 개발에서는 `.env.example`을 복사하여 `.env.local`로 사용합니다.

## 프로젝트 구조 (요약) / Project structure (summary)

- `src/` — React 소스
  - `lib/apiClient.js` — fetch 래퍼 (API 기본 URL 설정)
  - `lib/postsApi.js` — 게시글 API 함수 (`listPosts`, `getPost`, `listSeriesPosts` 등)
- `public/` — 정적 에셋 (이미지 등)

## 문서 / Documentation

1. **프로젝트 아키텍처** ([ARCHITECTURE.md](ARCHITECTURE.md)) — 데이터 흐름, 라우팅, API 연동 구조
2. **컴포넌트 설명** ([COMPONENTS.md](COMPONENTS.md)) — UI 컴포넌트 역할 및 props
3. **게시글 관리 가이드** ([POSTS_GUIDE.md](POSTS_GUIDE.md)) — 콘텐츠 작성·관리 방법 (Elevate.Admin CMS)
4. **배포 가이드** ([DEPLOYMENT.md](DEPLOYMENT.md)) — Azure SWA 빌드 및 배포 절차
5. **Microsoft Clarity 적용 가이드** ([CLARITY_INTEGRATION_GUIDE.md](CLARITY_INTEGRATION_GUIDE.md)) — 분석 도입

## 기여 / Contributing

- 콘텐츠 추가·수정: [POSTS_GUIDE.md](POSTS_GUIDE.md) 참고 (Elevate.Admin 사용)
- 코드 수정·기능 추가: [CONTRIBUTING.md](CONTRIBUTING.md) 참고
- 배포: [DEPLOYMENT.md](DEPLOYMENT.md) 참고

