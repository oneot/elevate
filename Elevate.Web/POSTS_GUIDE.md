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
	- `series`: 시리즈 이름 (선택, 연속된 학습 게시글을 그룹화할 때 사용)
	- `seriesOrder`: 시리즈 내 순서 (선택, 1부터 시작하는 숫자)

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

## 시리즈 게시글 작성하기

연속된 학습 내용이나 튜토리얼을 작성할 때 시리즈 기능을 사용하세요. 같은 카테고리 내에서 동일한 `series` 값을 가진 게시글들이 자동으로 그룹화되며, 게시글 리스트 화면에서 우측 사이드바에 순서대로 표시됩니다.

### series (optional)
- **타입**: string
- **설명**: 게시글이 속한 시리즈 이름. 같은 시리즈의 게시글들을 그룹화함
- **예시**: `series: "Excel 기초 튜토리얼"`
- **주의**: `seriesOrder`와 함께 사용해야 사이드바에 표시됨

### seriesOrder (optional)
- **타입**: number
- **설명**: 시리즈 내에서의 순서 (1부터 시작)
- **예시**: `seriesOrder: 1`
- **주의**: `series`와 함께 사용해야 사이드바에 표시됨

### 시리즈 예시

`posts/excel/excel-1.md`:
```markdown
---
title: "Excel 기본 기능 (1) - 셀 편집"
series: "Excel 기초 튜토리얼"
seriesOrder: 1
tags: [excel, m365, tutorial]
date: 2026-02-16
---
# Excel 셀 편집 방법
...
```

`posts/excel/excel-2.md`:
```markdown
---
title: "Excel 기본 기능 (2) - 수식 활용"
series: "Excel 기초 튜토리얼"
seriesOrder: 2
tags: [excel, m365, tutorial]
date: 2026-02-17
---
# Excel 수식 사용법
...
```

이렇게 작성하면 Excel 카테고리 리스트 화면에서 우측 사이드바에 "Excel 기초 튜토리얼" 제목과 함께 순서대로 게시글 목록이 표시됩니다. 독자가 순서대로 학습할 수 있도록 도와줍니다.

---

문서에 문제가 있거나 자동 변환에서 누락되는 항목이 있다면 알려주세요.
