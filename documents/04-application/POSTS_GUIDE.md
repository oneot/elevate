# 게시글 관리 가이드 (POSTS_GUIDE.md)

> **마지막 업데이트**: 2026년 5월 22일  
> **선행 문서**: [DATA_MODEL_AND_API_CONTRACT.md](./DATA_MODEL_AND_API_CONTRACT.md), [AZURE_ARCHITECTURE.md](../03-architecture/AZURE_ARCHITECTURE.md)

이 문서는 Elevate 플랫폼에서 게시글을 작성·수정·관리하는 방법을 설명합니다.

게시글은 **Elevate.Admin CMS**에서 작성하며, Cosmos DB에 저장됩니다. 별도의 빌드나 배포 없이 즉시 사이트에 반영됩니다.

> **기술 구현 세부사항**: 게시글 API 스키마, 에러 코드, 데이터 모델은 [DATA_MODEL_AND_API_CONTRACT.md](./DATA_MODEL_AND_API_CONTRACT.md)를 참조하세요.

---

## 1. 게시글 관리 시스템 개요

> **💡 AZ-900 개념 — CMS (Content Management System)**  
> CMS는 콘텐츠 작성자가 코딩 없이 웹사이트 콘텐츠를 만들고 관리할 수 있는 시스템이다. Elevate.Admin이 CMS 역할을 한다. 작성자가 Admin에서 게시글을 저장하면 Cosmos DB에 직접 저장되어 즉시 공개 사이트에 반영된다. 별도의 빌드·배포 과정이 필요 없다.

```
콘텐츠 작성자
    │ Admin SPA 사용
    ▼
Elevate.Admin (https://white-sea-0567ed600.4.azurestaticapps.net)
    │ /api/admin/*  (Entra ID 인증 필수)
    ▼
Azure Functions
    │
    ▼
Cosmos DB (elevate.posts)
    │ /api/public/*  (인증 없음)
    ▼
Elevate.Web (https://microsoft-elevate.com)
```

---

## 2. Elevate.Admin 사용법

### 2.1 접속

- **URL**: `https://white-sea-0567ed600.4.azurestaticapps.net`
- **인증**: Microsoft Entra ID (조직 계정 `@microsoft.com` 로그인 필요)
- Guest 계정 및 외부 계정은 접속 불가

### 2.2 게시글 작성

1. Admin에 로그인
2. **새 게시글 작성** 버튼 클릭
3. 아래 필드 입력:
   - **제목** (필수)
   - **카테고리** (필수): 아래 카테고리 목록 참조
   - **본문**: TipTap v3 HTML 에디터에서 작성
   - **태그**: 쉼표로 구분
   - **대표 이미지(thumbnail)**: 이미지 업로드 버튼으로 Azure Blob Storage에 업로드 → URL 자동 입력
   - **요약(excerpt)**: 게시글 카드에 표시되는 짧은 설명 (미입력 시 본문에서 자동 생성 가능)
   - **시리즈**: 시리즈에 포함할 경우 시리즈 이름과 순서 입력
   - **공개 상태**: `draft`(임시저장), `published`(공개), `archived`(보관)
4. **저장** 클릭 → 즉시 사이트에 반영

### 2.3 게시글 수정

1. Admin에서 게시글 목록 조회
2. 수정할 게시글 선택
3. 내용 수정 후 저장

---

## 3. 게시글 데이터 구조 (Cosmos DB)

> **💡 AZ-900 개념 — Azure Cosmos DB 파티션 키**  
> Cosmos DB는 대규모 데이터를 여러 서버에 분산 저장하기 위해 "파티션 키" 필드를 사용한다. 같은 파티션 키 값을 가진 문서들은 같은 물리적 파티션에 저장된다. Elevate는 `category` 필드를 파티션 키로 사용하여 카테고리별로 데이터를 분산한다. 게시글 조회 시 `category`를 지정하면 해당 파티션만 읽어 빠른 성능을 얻는다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 ID (자동 생성 UUID) |
| `slug` | string | URL 슬러그 (예: `26-04-01`, `copilot-intro`) |
| `category` | string | 카테고리 — **파티션 키** (`copilot`, `m365`, `update` 등) |
| `title` | string | 게시글 제목 |
| `contentMarkdown` | string | 본문 HTML (필드명과 달리 HTML 저장) |
| `excerpt` | string | 요약 |
| `thumbnail` | string (URL) \| null | 대표 이미지 Blob URL |
| `tags` | string[] | 태그 배열 |
| `series` | string \| null | 시리즈 이름 (선택) |
| `seriesOrder` | number \| null | 시리즈 내 순서 (선택) |
| `status` | string | `draft` \| `published` \| `archived` |
| `publishedAt` | string \| null | 발행일 (ISO 8601), draft/archived이면 null |
| `updatedAt` | string | 마지막 수정일 (ISO 8601) |
| `createdAt` | string | 생성일 (ISO 8601) |
| `eventDates` | Array \| null | 행사 날짜 배열 (`event` 카테고리 전용) |
| `eventLocation` | string \| null | 행사 장소 (`event` 카테고리 전용) |
| `eventTarget` | string \| null | 행사 대상 (`event` 카테고리 전용) |

> **주의**: `contentMarkdown` 필드명은 역사적 이유로 유지되지만 실제로는 HTML을 저장합니다. 프론트엔드는 `dangerouslySetInnerHTML` + DOMPurify로 렌더링합니다.  
> **이전 문서와 다른 필드**: `imageUrl` → `thumbnail` (변경됨), `author` 필드는 현재 미사용.

---

## 4. 카테고리 목록

| 카테고리 | 표시명 | URL | 설명 |
|---------|--------|-----|------|
| `copilot` | Copilot | `/copilot` | Microsoft Copilot 관련 |
| `copilot-studio` | Copilot Studio | `/copilot-studio` | Microsoft Copilot Studio 관련 |
| `m365` | M365 | `/m365` | Microsoft 365 콘텐츠 |
| `teams` | Teams | `/teams` | Microsoft Teams 관련 |
| `minecraft` | Minecraft | `/minecraft` | Minecraft Education |
| `excel` | Excel | `/excel` | Excel 관련 |
| `onenote` | OneNote | `/onenote` | OneNote 관련 |
| `update` | (M365 업데이트) | `/update` | M365 업데이트 소식 |
| `event` | 행사 소식 | `/program-news?tab=event` | 행사 일정, 날짜·장소·대상 포함 (event 전용 필드 사용) |
| `program-news` | 프로그램 소식 | `/program-news?tab=program` | 프로그램 소식 |
| `agenthon` | Agenthon | `/agenthon` | Agenthon 이벤트 |
| `teach` | (태그 필터용) | — | 교육 관련 태그 분류 |
| `all` | ALL | — | 전체 카테고리 필터 (라우트 없음, 필터 UI용) |

> **라우팅 주의**: `update`는 전용 페이지(`/update`)로, `agenthon`은 최신 1개 게시글을 표시(`/agenthon`)하는 방식으로 동작한다. `event`와 `program-news`는 `/program-news` 페이지 내 탭으로 분리되어 있다.

---

## 4.1 event 카테고리 전용 필드

`event` 카테고리 게시글은 일반 필드 외에 아래 필드를 추가로 사용한다. Admin에서 카테고리를 `event`로 선택할 때만 입력 UI가 표시된다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `eventDates` | `Array<{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }>` \| null | 행사 날짜 범위 배열. 단발성이면 `start = end`. |
| `eventLocation` | string \| null | 행사 장소 (예: "서울 광화문", "온라인") |
| `eventTarget` | string \| null | 행사 대상 (예: "교사", "학생", "전체") |

Web의 행사 달력(`EventCalendar`)은 `eventDates`를 기준으로 이벤트 막대를 표시하며, 마우스 오버 시 툴팁으로 날짜·장소·대상을 보여준다. 게시글 목록은 "오늘과 가장 가까운 이벤트 우선" 기준으로 정렬된다.

---

## 5. 시리즈 게시글 작성

연속 학습 콘텐츠를 시리즈로 묶을 수 있습니다.

예: "Excel 기초 튜토리얼" 시리즈 (3부작)

1. 각 게시글에 **동일한 `series` 이름** 입력
2. `seriesOrder`를 1, 2, 3... 으로 순서 지정
3. 같은 카테고리 내에서 2개 이상이어야 사이드바에 표시됨

---

## 6. 이미지 관리

게시글 대표 이미지는 Azure Blob Storage를 사용합니다:

> **💡 AZ-900 개념 — 이미지 업로드 흐름 (SAS)**  
> 이미지를 직접 서버에 전송하는 대신, Admin이 API에서 "업로드 전용 SAS URL"을 받아 브라우저가 Azure Storage에 직접 업로드한다. 서버를 거치지 않아 속도가 빠르고 서버 부하가 줄어든다. 업로드 SAS는 15분 유효하며 쓰기(`cw`) 권한만 있다.

1. Admin에서 이미지 업로드 버튼 클릭
2. 서버에서 업로드 SAS URL 발급 (`POST /api/admin/assets/sas`)
3. 브라우저가 SAS URL로 Azure Blob Storage에 직접 PUT 업로드
4. 서버에 에셋 메타데이터 등록 (`POST /api/admin/assets`)
5. 업로드된 이미지 URL이 게시글 `thumbnail` 필드에 자동 입력

상세 이미지 정책: [IMAGE_POLICY.md](../03-architecture/IMAGE_POLICY.md)

---

## 7. 게시글 URL 형식

```
https://microsoft-elevate.com/{category}/{slug}
```

예시:
- `https://microsoft-elevate.com/update/26-04-01`
- `https://microsoft-elevate.com/copilot/copilot-intro`

---

## 8. 관련 문서

- 아키텍처: [ELEVATE_WEB_ARCHITECTURE.md](./ELEVATE_WEB_ARCHITECTURE.md)
- API 계약 및 기술 구현: [DATA_MODEL_AND_API_CONTRACT.md](./DATA_MODEL_AND_API_CONTRACT.md)
- 이미지 정책: [IMAGE_POLICY.md](../03-architecture/IMAGE_POLICY.md)
- 배포 가이드: [DEPLOYMENT_AND_RUNBOOK.md](../06-operations/DEPLOYMENT_AND_RUNBOOK.md)
