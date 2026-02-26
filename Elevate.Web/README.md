
# Elevate Web — 프로젝트 개요 / Project Overview

한국어: 이 저장소는 Microsoft Elevate의 교육 사례 공유를 위한 정적 블로그 애플리케이션입니다. 마크다운 기반 게시글을 빌드 시점에 JSON으로 변환하여 클라이언트에서 불러오는 JAMstack 패턴을 사용합니다.

English: This repository contains a static blog application for Microsoft Elevate content. It uses a JAMstack approach: markdown posts are converted to JSON at build time and consumed by a React client.

## 주요 기능 / Key features

- Markdown 기반 게시글을 정적 JSON으로 변환 (`scripts/generate-posts.js`).
- React + Vite 기반 SPA, Tailwind CSS로 스타일링.
- 카테고리별 포스트 목록, 태그 필터링, 페이지네이션, 포스트 상세 페이지 제공.

## 기술 스택 / Tech stack

- React 19, Vite 7
- Tailwind CSS, react-router-dom, react-markdown

## 빠른 시작 / Quick start

```bash
npm install
npm run dev
```

빌드(정적 JSON 생성 포함):

```bash
npm run build
```

## 프로젝트 구조 (요약) / Project structure (summary)

- `src/` — React 소스
- `posts/` — 마크다운 원본 게시글
- `scripts/generate-posts.js` — 마크다운 → JSON 변환 스크립트
- `public/api/` — 빌드 결과(생성된 `posts.json`, 개별 포스트 JSON)

## 문서 / Documentation

프로젝트를 이해하고 기여하기 위해 다음 문서들을 순서대로 읽으시면 됩니다:

1. **프로젝트 아키텍처** ([ARCHITECTURE.md](ARCHITECTURE.md))
   - 마크다운 → JSON 변환 흐름, 빌드 과정, 데이터 구조 이해
   - 처음 프로젝트를 접할 때, 또는 빌드/배포 문제를 해결할 때 참고

2. **컴포넌트 설명** ([COMPONENTS.md](COMPONENTS.md))
   - 각 UI 컴포넌트의 역할, props, 상호작용 방식
   - 기존 컴포넌트를 수정하거나 새로운 컴포넌트를 만들 때 참고

3. **게시글 작성 가이드** ([POSTS_GUIDE.md](POSTS_GUIDE.md))
   - 마크다운 파일 작성 규칙, frontmatter 필드, 이미지 처리, 시리즈 설정
   - 새로운 콘텐츠를 추가하려는 콘텐츠 작성자·기고자가 참고

4. **개발 기여 가이드** ([CONTRIBUTING.md](CONTRIBUTING.md))
   - 개발 환경 설정, 브랜치/PR 규칙, 코드 스타일, 로컬 테스트
   - 코드를 수정하거나 새로운 기능을 추가하려는 개발자가 참고

5. **배포 가이드** ([DEPLOYMENT.md](DEPLOYMENT.md))
   - 로컬 빌드 절차, 배포 전 체크리스트, 환경변수 설정
   - 프로덕션 배포나 CI/CD 파이프라인 구성 시 참고

## 기여 / Contributing

프로젝트에 기여하려면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

- 콘텐츠 추가: [POSTS_GUIDE.md](POSTS_GUIDE.md) 참고
- 코드 수정/기능 추가: [CONTRIBUTING.md](CONTRIBUTING.md) 참고
- 배포 업무: [DEPLOYMENT.md](DEPLOYMENT.md) 참고

