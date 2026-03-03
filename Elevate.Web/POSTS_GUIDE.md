# 게시글 작성 가이드 

이 프로젝트는 `posts/` 폴더 내부의 마크다운 파일을 정적 게시글 데이터로 변환하여 사이트에 표시합니다. 빌드 시점에 `scripts/generate-posts.js`가 실행되어 `public/api/posts.json`을 생성합니다.

## 빠른 시작

### 1. 게시글 파일 생성
```
posts/<category>/<slug>.md
```

예시:
- `posts/copilot/copilot.md`
- `posts/excel/excel-tutorial.md`
- `posts/m365/onedrive-tutorial.md`

### 2. 마크다운 파일 구조

게시글은 **YAML frontmatter** + **마크다운 본문**으로 구성됩니다:

```markdown
---
title: "게시글 제목"
date: 2026-02-16
tags: [copilot, ai]
excerpt: "선택: 요약 텍스트 (없으면 자동으로 첫 문단 160자 추출)"
image: "./images/thumbnail.png"
---

# 본문 제목

게시글 본문을 마크다운 형식으로 작성합니다.

## 소제목
더 많은 내용...
```

> **주의**: Frontmatter는 반드시 `---`로 시작하고 끝나야 합니다.

### 3. 빌드 및 확인

```bash
# 로컬에서 게시글 JSON 생성
npm run generate-posts

# 결과 확인
cat public/api/posts.json
cat public/api/posts/<category>--<slug>.json
```

---

## Frontmatter 필드 상세

### 필수 필드

#### title
- **타입**: 문자열
- **설명**: 게시글의 제목
- **예시**: 
  ```yaml
  title: "Excel 기초 가이드"
  ```
- **주의**: 반드시 작성해야 합니다. 없으면 파일명을 기본 제목으로 사용합니다.

### 권장 필드

#### date
- **타입**: 문자열 (ISO 8601 형식 `YYYY-MM-DD`)
- **설명**: 게시글 발행 또는 업데이트 날짜
- **예시**:
  ```yaml
  date: 2026-02-16
  ```
- **주의**: 없으면 파일 수정 시간을 기본값으로 사용합니다.

#### tags (또는 tag)
- **타입**: 배열 또는 문자열
- **설명**: 게시글을 분류하는 태그들
- **예시**:
  ```yaml
  tags: [copilot, ai, tutorial]
  ```
  또는:
  ```yaml
  tags: "copilot"
  ```
- **주의**: 태그는 게시글 카드에서 표시되며, 독자가 태그로 필터할 수 있습니다.

#### excerpt
- **타입**: 문자열
- **설명**: 게시글 요약 (게시글 카드와 목록에 표시)
- **예시**:
  ```yaml
  excerpt: "이 튜토리얼에서는 Excel의 기본 셀 수식을 배웁니다."
  ```
- **주의**: 없으면 본문의 첫 문단을 마크다운 형식 제거 후 160자로 자동 추출합니다.

#### image
- **타입**: 문자열 (경로 또는 URL)
- **설명**: 게시글의 대표 이미지
- **상대경로 예시**:
  ```yaml
  image: "./images/banner.png"
  ```
  - 빌드 시 `public/images/`로 자동 복사되고, `imageUrl`은 `/images/...` 형태로 변환됩니다.
- **외부 URL 예시**:
  ```yaml
  image: "https://example.com/image.png"
  ```
  - 외부 URL은 그대로 사용되며 복사되지 않습니다.
- **주의**: 상대경로는 마크다운 파일과 같은 디렉터리 기준입니다.

### 선택 필드

#### slug
- **타입**: 문자열
- **설명**: URL 슬러그 (파일명 기반 기본값 재정의)
- **예시**:
  ```yaml
  slug: "custom-slug"
  ```
- **주의**: 보통 파일명으로 충분하므로 생략해도 됩니다. 파일명과 다른 URL을 원할 때만 사용하세요.

#### series
- **타입**: 문자열
- **설명**: 게시글이 속한 시리즈 이름 (연속 학습 콘텐츠 그룹화)
- **예시**:
  ```yaml
  series: "Excel 기초 튜토리얼"
  ```
- **주의**: `seriesOrder`와 함께 사용해야 사이드바에 표시됩니다. 2개 이상의 게시글이 같은 시리즈를 가져야 표시됩니다.

#### seriesOrder
- **타입**: 숫자 (1부터 시작)
- **설명**: 시리즈 내 순서
- **예시**:
  ```yaml
  seriesOrder: 1
  ```
- **주의**: `series`와 함께 사용해야 합니다.

---

## 슬러그 규칙

- **기본값**: 파일명 (확장자 제외)
  - `copilot.md` → 슬러그 `copilot` → URL `/blog/copilot/copilot`
  - `excel-1.md` → 슬러그 `excel-1` → URL `/blog/excel/excel-1`
- **커스텀**: frontmatter의 `slug` 필드로 재정의 가능
  - `posts/excel/excel-1.md`에서 `slug: "intro"`라고 하면 → URL `/blog/excel/intro`

---

## 이미지 처리

### 상대경로 이미지 (지역 이미지)

마크다운 파일과 같은 디렉터리에 이미지를 두고, frontmatter와 본문에서 상대경로로 참조하면 자동 복사됩니다:

```markdown
---
title: "Excel 튜토리얼"
image: "./thumbnail.png"
---

# 본문

![스크린샷](./screenshot.png)
```

**빌드 후**:
- `./thumbnail.png` → `/images/excel-thumbnail-<timestamp>.png`
- `./screenshot.png` → `/images/excel-screenshot-<timestamp>.png`
- URL은 자동으로 `/images/...` 형태로 변환됩니다.

### 외부 URL 이미지

HTTPS URL을 사용하면 복사하지 않고 그대로 사용됩니다:

```markdown
---
image: "https://cdn.example.com/banner.png"
---
```

---

## 본문 마크다운 문법

게시글 본문은 표준 마크다운을 지원합니다:

```markdown
# 제목 1
## 제목 2
### 제목 3

**강조** 또는 __강조__

*기울임* 또는 _기울임_

- 목록 1
- 목록 2
  - 중첩 목록

1. 번호 목록 1
2. 번호 목록 2

> 인용문
> 여러 줄 인용

[링크](https://example.com)

![이미지](./image.png)

`인라인 코드`

\`\`\`javascript
// 코드 블록
const x = 42;
\`\`\`
```

### 추가 지원 문법

- **GFM (GitHub Flavored Markdown)**:
  ```markdown
  | 헤더 1 | 헤더 2 |
  |--------|--------|
  | 셀 1   | 셀 2   |
  ```
- **Footnote, Strikethrough** 등도 지원됩니다.

---

## 출력 JSON 형식

빌드 후 생성되는 JSON 구조:

### `public/api/posts.json` (목록)
```json
{
  "items": [
    {
      "id": "copilot/copilot",
      "slug": "copilot",
      "title": "Copilot에 대해",
      "excerpt": "Copilot 소개...",
      "imageUrl": "/images/copilot-banner.png",
      "author": { "name": "Elevate" },
      "publishedAt": "2026-02-16",
      "likes": 0,
      "comments": 0,
      "category": "copilot",
      "tags": ["copilot", "ai"],
      "series": null,
      "seriesOrder": null
    }
  ],
  "total": 1,
  "seriesByCategory": {
    "excel": {
      "Excel 기초 튜토리얼": [
        {
          "id": "excel/excel-1",
          "slug": "excel-1",
          "title": "Excel 기본 기능 (1) - 셀 편집",
          "seriesOrder": 1
        },
        {
          "id": "excel/excel-2",
          "slug": "excel-2",
          "title": "Excel 기본 기능 (2) - 수식 활용",
          "seriesOrder": 2
        }
      ]
    }
  }
}
```

### `public/api/posts/<category>--<slug>.json` (상세)
```json
{
  "id": "copilot/copilot",
  "slug": "copilot",
  "title": "Copilot에 대해",
  "excerpt": "Copilot 소개...",
  "imageUrl": "/images/copilot-banner.png",
  "author": { "name": "Elevate" },
  "publishedAt": "2026-02-16",
  "likes": 0,
  "comments": 0,
  "category": "copilot",
  "tags": ["copilot", "ai"],
  "series": null,
  "seriesOrder": null,
  "content": "# Copilot 본문 HTML..."
}
```

---

## 실제 작성 예시

### 예시 1: 기본 게시글

파일: `posts/copilot/copilot-chat.md`

```markdown
---
title: "Copilot Chat 사용하기"
date: 2026-02-16
tags: [copilot, ai, productivity]
excerpt: "Microsoft Copilot Chat의 기본 사용법을 배웁니다."
image: "./chat-banner.png"
---

# Copilot Chat 기능 소개

Copilot Chat은 AI 기반의 대화 인터페이스를 제공합니다.

## 주요 기능

- 자연어 질문에 빠른 응답
- 문맥 이해 및 추적
- 코드 작성 지원

더 자세한 내용은 [공식 문서](https://example.com/docs)를 참조하세요.
```

### 예시 2: 시리즈 게시글

파일: `posts/excel/excel-1.md`

```markdown
---
title: "Excel 기본 기능 (1) - 셀 편집 방법"
date: 2026-02-16
tags: [excel, m365, tutorial]
series: "Excel 기초 튜토리얼"
seriesOrder: 1
excerpt: "Excel에서 셀을 선택하고 편집하는 방법을 배웁니다."
image: "./excel-1-banner.png"
---

# Excel 셀 편집의 기초

이 게시글은 Excel 기초 튜토리얼 시리즈의 첫 번째 파트입니다.

## 셀 선택하기

마우스로 셀을 클릭하여 선택할 수 있습니다...

## 셀 데이터 입력

선택한 셀에 직접 입력하거나...
```

파일: `posts/excel/excel-2.md`

```markdown
---
title: "Excel 기본 기능 (2) - 수식 활용"
date: 2026-02-17
tags: [excel, m365, tutorial]
series: "Excel 기초 튜토리얼"
seriesOrder: 2
excerpt: "Excel 수식 함수를 사용하여 계산을 자동화합니다."
image: "./excel-2-banner.png"
---

# Excel 수식으로 데이터 계산하기

앞 파트에서 데이터 입력을 배웠으니, 이제 수식을 활용해봅시다.

## SUM 함수

\`\`\`
=SUM(A1:A10)
\`\`\`

이 수식은 A1부터 A10까지의 합을 계산합니다...
```

이렇게 작성하면 Excel 카테고리의 게시글 목록 화면에서 우측 사이드바에 "Excel 기초 튜토리얼" 시리즈가 표시되고, 순서대로 게시글 목록이 나타납니다.

---

## 빌드 및 개발

### 로컬에서 게시글 생성
```bash
npm run generate-posts
```

### 전체 빌드 (게시글 자동 생성 포함)
```bash
npm run build
```

`prebuild` 스크립트가 자동으로 실행되어 게시글 JSON을 생성한 후 Vite 빌드를 진행합니다.

### 개발 서버에서 확인
```bash
npm run dev
```

> **주의**: `npm run dev`로 시작한 경우, 마크다운 파일을 수정해도 자동으로 JSON이 재생성되지 않습니다. 수동으로 `npm run generate-posts`를 실행해야 합니다.

---

## 자주 묻는 질문 (FAQ)

### Q: 마크다운을 수정했는데 반영이 안 됩니다.
**A**: `npm run generate-posts`를 실행하여 JSON을 재생성하세요. 개발 모드에서는 자동 재생성이 안 됩니다.

### Q: 시리즈로 표시되지 않습니다.
**A**: 다음을 확인하세요:
- `series` 필드와 `seriesOrder` 필드가 모두 있는가?
- 같은 카테고리에서 동일한 `series` 이름을 가진 게시글이 2개 이상인가?
- 빌드 후 `public/api/posts.json`의 `seriesByCategory`를 확인했는가?

### Q: 이미지가 표시되지 않습니다.
**A**: 다음을 확인하세요:
- 상대경로가 정확한가? (예: `./images/image.png` ✓, `images/image.png` ✗)
- 이미지 파일이 마크다운 파일과 같은 디렉터리에 있는가?
- 빌드 후 `public/api/posts.json`의 `imageUrl` 필드를 확인했는가?

### Q: 외부 이미지를 사용하고 싶습니다.
**A**: HTTPS URL을 직접 사용하면 됩니다:
```yaml
image: "https://cdn.example.com/image.png"
```

### Q: 게시글 순서를 변경하고 싶습니다.
**A**: 목록은 `publishedAt` (발행일)의 역순으로 정렬됩니다. 최신 게시글이 맨 위에 나타나도록 `date` 필드를 조정하세요.

---

## 문제 해결

게시글을 추가했는데 사이트에 표시되지 않는 경우:

1. **파일 경로 확인**: `posts/<category>/<slug>.md` 형식인가?
2. **Frontmatter 형식 확인**: `---` 구분선이 있는가? YAML 문법이 올바른가?
3. **title 필드 확인**: title이 있는가? (필수는 아니지만 권장)
4. **JSON 생성 확인**: `npm run generate-posts` 실행 후 `public/api/posts.json` 확인
5. **빌드 실행**: `npm run build`로 전체 빌드 실행
6. **브라우저 캐시**: 브라우저 개발자 도구에서 캐시 비우기 (Ctrl+Shift+Delete 또는 Cmd+Shift+Delete)

---

## 관련 문서

- 프로젝트 개요: [README.md](README.md)
- 아키텍처: [ARCHITECTURE.md](ARCHITECTURE.md)
- 컴포넌트: [COMPONENTS.md](COMPONENTS.md)
- 개발 기여: [CONTRIBUTING.md](CONTRIBUTING.md) (예정)
