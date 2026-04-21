# 게시글 관리 가이드

이 문서는 Elevate 플랫폼에서 게시글을 작성·수정·관리하는 방법을 설명합니다.

게시글은 **Elevate.Admin CMS**에서 작성하며, Cosmos DB에 저장됩니다. 별도의 빌드나 배포 없이 즉시 사이트에 반영됩니다.

---

## 게시글 관리 시스템 개요

```
콘텐츠 작성자
    │ Admin SPA 사용
    ▼
Elevate.Admin (https://white-sea-0567ed600.4.azurestaticapps.net)
    │ /api/admin/*
    ▼
Azure Functions
    │
    ▼
Cosmos DB (elevate.posts)
    │ /api/public/*
    ▼
Elevate.Web (사용자 노출)
```

---

## Elevate.Admin 사용법

### 접속

- URL: `https://white-sea-0567ed600.4.azurestaticapps.net`
- 인증: Microsoft Entra ID (조직 계정 로그인 필요)

### 게시글 작성

1. Admin에 로그인
2. **새 게시글 작성** 버튼 클릭
3. 아래 필드 입력:
   - **제목** (필수)
   - **카테고리** (필수): `copilot`, `m365`, `teams`, `minecraft`, `excel`, `onenote`, `update` 중 선택
   - **본문**: HTML 에디터에서 작성
   - **태그**: 쉼표로 구분
   - **대표 이미지 URL**: 외부 이미지 URL 또는 업로드 후 URL 입력
   - **요약(excerpt)**: 게시글 카드에 표시되는 짧은 설명
   - **시리즈**: 시리즈에 포함할 경우 시리즈 이름과 순서 입력
4. **저장** 클릭 → 즉시 사이트에 반영

### 게시글 수정

1. Admin에서 게시글 목록 조회
2. 수정할 게시글 선택
3. 내용 수정 후 저장

---

## 게시글 데이터 구조 (Cosmos DB)

게시글 아이템의 주요 필드:

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 ID (자동 생성) |
| `slug` | string | URL 슬러그 (예: `26-04-01`) |
| `category` | string | 카테고리 (`copilot`, `m365`, `update` 등) |
| `title` | string | 게시글 제목 |
| `contentMarkdown` | string | 본문 HTML (필드명과 달리 HTML 저장) |
| `excerpt` | string | 요약 |
| `imageUrl` | string | 대표 이미지 URL |
| `tags` | string[] | 태그 배열 |
| `series` | string | 시리즈 이름 (선택) |
| `seriesOrder` | number | 시리즈 내 순서 (선택) |
| `publishedAt` | string | 발행일 (ISO 8601) |
| `author` | object | 작성자 정보 |

> **참고**: `contentMarkdown` 필드명은 역사적 이유로 유지되지만 실제로는 HTML을 저장합니다. 프론트엔드는 `dangerouslySetInnerHTML`로 렌더링합니다.

---

## 카테고리 목록

| 카테고리 | 표시명 | URL |
|---------|--------|-----|
| `copilot` | Copilot | `/copilot` |
| `m365` | M365 | `/m365` |
| `teams` | Teams | `/teams` |
| `minecraft` | Minecraft | `/minecraft` |
| `excel` | Excel | `/excel` |
| `onenote` | OneNote | `/onenote` |
| `update` | (M365 업데이트) | `/update` |
| `all` | ALL | `/all` |

---

## 시리즈 게시글 작성

연속 학습 콘텐츠를 시리즈로 묶을 수 있습니다.

예: "Excel 기초 튜토리얼" 시리즈 (3부작)

1. 각 게시글에 **동일한 `series` 이름** 입력
2. `seriesOrder`를 1, 2, 3... 으로 순서 지정
3. 같은 카테고리 내에서 2개 이상이어야 사이드바에 표시

---

## 이미지 관리

게시글 대표 이미지는 외부 URL을 사용합니다:

- Azure Blob Storage, CDN 등에 이미지 업로드 후 URL 입력 권장
- 공개 접근 가능한 HTTPS URL 사용

---

## 게시글 URL 형식

```
https://microsoft-elevate.com/{category}/{slug}
```

예시:
- `https://microsoft-elevate.com/update/26-04-01`
- `https://microsoft-elevate.com/copilot/copilot-intro`

---

## 관련 문서

- [프로젝트 개요](README.md)
- [아키텍처](ARCHITECTURE.md)
- [배포 가이드](DEPLOYMENT.md)
