# 게시글 작성 가이드 

이 프로젝트는 `posts/` 폴더 내부의 마크다운 파일을 정적 게시글 데이터로 변환하여 사이트에 표시합니다. 빌드 시점에 `scripts/generate-posts.js`가 실행되어 `public/api/posts.json`을 생성합니다.

- 폴더 구조
	- `posts/<category>/<slug>.md` — 카테고리별로 하위 폴더에 마크다운 파일을 둡니다. 예: `posts/copilot/copilot.md`

- Frontmatter(권장 키)
	- `title`: 게시글 제목 (필수 권장)
	- `date`: 발행일자 (권장, 형식 `YYYY-MM-DD`)
	- `tag` 또는 `tags`: 태그(선택)
	- `excerpt`: 요약(선택; 없으면 본문 첫 문단을 160자 내로 사용)
	- `image`: 대표 이미지 경로(상대경로 또는 외부 URL)
	- `slug`: (선택) 파일명 기반 슬러그를 덮어씁니다.

- 슬러그 규칙
	- 기본적으로 파일명(확장자 없이)을 슬러그로 사용합니다. 예: `copilot.md` → `copilot`.
	- frontmatter의 `slug`가 있으면 파일명 우선 규칙을 덮어씁니다.

- 이미지 처리
	- `image`에 상대 경로를 넣으면 빌드 시 `public/images/`로 복사됩니다. 복사된 경로는 `imageUrl`에 `/images/<name>` 형태로 저장됩니다.
	- 외부 URL인 경우 그대로 사용합니다.

- 출력 JSON 형식
	- 생성 파일: `public/api/posts.json`
	- 형태: `{ items: Post[], total: number }`
	- `Post` 객체(주요 필드):
		- `id`: 고유 id (예: `category/slug`)
		- `slug`: 포스트 슬러그
		- `title`: 제목
		- `excerpt`: 요약
		- `imageUrl`: 이미지 URL (빈 문자열 가능)
		- `author`: `{ name: string }`
		- `publishedAt`: 발행일 (`YYYY-MM-DD`)
		- `likes`: number
		- `comments`: number
		- `category`: 카테고리 이름

## 빌드 및 개발

- 로컬에서 게시글 데이터를 생성하려면 수동으로 실행:

```bash
npm run generate-posts
```

- 빌드 전에 자동으로 생성하려면 다음 명령을 사용합니다 (이미 `prebuild` 스크립트가 등록되어 있음):

```bash
npm run build
```

## 작성 가이드 예시

`posts/copilot/copilot.md` 예시 (간단한 형태):

```markdown
title: Copilot에 대해
tag: copilot
date: 2026-01-01
---
# H1태그
이곳에 본문 내용을 작성하세요.
```

문서에 문제가 있거나 자동 변환에서 누락되는 항목이 있다면 알려주세요.
