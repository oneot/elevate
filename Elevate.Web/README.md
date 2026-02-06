
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

- 게시글 작성 가이드: `POSTS_GUIDE.md`
- 아키텍처 상세: `ARCHITECTURE.md`
- 컴포넌트 설명: `COMPONENTS.md`

## 기여 / Contributing

간단한 기여 방법:

1. 새로운 브랜치 생성
2. 변경 사항 커밋
3. PR 생성

자세한 기여 가이드는 `CONTRIBUTING.md`를 추가할 예정입니다.

