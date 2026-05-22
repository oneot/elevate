# 데이터 모델 및 API 계약 (DATA_MODEL_AND_API_CONTRACT.md)

> **마지막 업데이트**: 2026년 5월 22일  
> **선행 문서**: [AUTHORIZATION_MODEL.md](../03-architecture/AUTHORIZATION_MODEL.md)

---

## 1. 공통 규약

> **💡 AZ-900 개념 — Azure Functions REST API**  
> Elevate.Server는 Azure Functions v4 런타임으로 제공되는 HTTP 트리거 함수들의 집합이다. 각 함수가 하나의 API 엔드포인트 역할을 한다. `host.json`에서 `routePrefix: ""`로 설정하여 기본 접두사(`/api`)가 코드 라우트에 포함되도록 한다. 함수는 요청이 들어올 때만 실행되는 서버리스 방식이라 유휴 상태에서는 비용이 거의 발생하지 않는다.

> **💡 AZ-900 개념 — Azure Cosmos DB (NoSQL)**  
> Cosmos DB는 JSON 문서를 저장하는 NoSQL 데이터베이스다. 관계형 DB와 달리 고정 스키마가 없어 필드를 자유롭게 추가할 수 있다. 데이터는 "파티션 키"라는 필드로 여러 서버에 분산 저장된다. Elevate는 `category` 필드를 파티션 키로 사용하여 게시글을 카테고리별로 분산한다. 같은 컨테이너(`posts`)에 게시글과 에셋 메타데이터를 함께 저장하고 `documentType` 필드로 구분한다.

### 1.1 기본 URL 구조

```
https://{function-app-host}/api/{경로}
```

> `{function-app-host}` = `func-elv-server-ep-dev.azurewebsites.net`. host.json에서 routePrefix=""로 설정되어 있어 `/api` 접두사는 각 함수 route에 포함됨.

### 1.2 인증 헤더

관리자 API: `Authorization: Bearer {Entra ID Access Token}`

### 1.3 상관 관계 ID

모든 요청에 `x-correlation-id` 헤더가 응답에 포함됨.

### 1.4 에러 응답 표준

```json
{
  "code": "에러 코드 (string)",
  "message": "에러 설명 (string)",
  "correlationId": "요청 상관 ID (string)",
  "details": { "reason": "상세 내용" }  // 선택적
}
```

| HTTP 상태 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | `BadRequest` | 유효성 검사 실패, 잘못된 파라미터 |
| 401 | `Unauthorized` | 토큰 없음 또는 JWT 검증 실패 |
| 403 | `Forbidden` | 테넌트 불일치 또는 Guest 계정 |
| 404 | `NotFound` | 리소스 없음 |
| 409 | `Conflict` | 슬러그 중복 등 충돌 |
| 500 | `InternalServerError` | 서버 내부 오류 |

### 1.5 페이지네이션 규약 (페이지 기반)

- **방식**: `?limit=N&page=P`
- **limit 범위**: 1 – 100, 기본값 20
- **page 범위**: 1 – 10000, 기본값 1
- **응답 구조**:

```json
{
  "items": [...],
  "totalCount": 41,
  "totalPages": 3,
  "page": 1
}
```

- `page`는 1부터 시작
- `totalPages`는 `Math.ceil(totalCount / limit)` 기준
- 현재 공개/관리자 게시글 목록 API는 모두 이 페이지 기반 응답을 사용한다.

---

## 2. 공개 API

### 2.1 게시글 목록

```
GET /api/public/posts
```

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `limit` | number | 20 | 1–100 |
| `page` | number | 1 | 1–10000 |
| `category` | string | — | 단일 카테고리 필터 |
| `categories` | string | — | 쉼표 구분 복수 카테고리 OR 필터 (`copilot,m365` 등) |
| `tag` | string | — | 단일 태그 필터 |
| `tags` | string | — | 쉼표 구분 복수 태그 AND 필터 (`tags=teach,copilot`) |
| `q` | string | — | 제목 / 요약 / slug 대상 검색어 |

**응답 200**

```json
{
  "items": [
    {
      "id": "uuid",
      "slug": "string",
      "category": "string",
      "title": "string",
      "excerpt": "string",
      "tags": ["string"],
      "status": "published",
      "publishedAt": "ISO8601 | null",
      "updatedAt": "ISO8601",
      "thumbnail": {
        "url": "https://{storage}.blob.core.windows.net/images/...",
        "signedUrl": "https://{storage}.blob.core.windows.net/images/...?{sas}"
      },
      "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
      "eventLocation": "string | null",
      "eventTarget": "string | null"
    }
  ],
  "totalCount": 41,
  "totalPages": 3,
  "page": 1
}
```

> `thumbnail.signedUrl`: 서버사이드에서 선주입된 읽기 SAS URL (1시간 유효). 클라이언트는 `signedUrl`을 우선 사용, 없으면 `url` 폴백.

> `eventDates`, `eventLocation`, `eventTarget`: `category = "event"`인 게시글에만 포함. 나머지 카테고리에서는 `null`.

---

### 2.2 게시글 상세 (공개)

```
GET /api/public/posts/{category}/{slug}
```

**경로 파라미터** 

| 파라미터 | 설명 |
|---------|------|
| `category` | 게시글 카테고리 |
| `slug` | 게시글 슬러그 |

**응답 200**

```json
{
  "id": "uuid",
  "slug": "string",
  "category": "string",
  "title": "string",
  "excerpt": "string",
  "tags": ["string"],
  "status": "published",
  "publishedAt": "ISO8601 | null",
  "updatedAt": "ISO8601",
  "contentMarkdown": "string (HTML, 본문 내 blob URL은 SAS URL로 치환됨)",
  "series": "string | null",
  "seriesOrder": "number | null",
  "thumbnail": {
    "url": "https://{storage}.blob.core.windows.net/images/...",
    "signedUrl": "https://{storage}.blob.core.windows.net/images/...?{sas}"
  },
  "youtube": "string | null",
  "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
  "eventLocation": "string | null",
  "eventTarget": "string | null"
}
```

> `thumbnail.signedUrl` 및 `contentMarkdown` 내 모든 blob URL에 읽기 SAS (1시간 유효)가 서버사이드에서 선주입됨.

**에러**:  
- `404 NotFound`: 게시글 없음 또는 비공개

---

### 2.3 시리즈 게시글 목록

```
GET /api/public/series/{seriesSlug}/posts
```

**경로 파라미터**

| 파라미터 | 설명 |
|---------|------|
| `seriesSlug` | 시리즈 슬러그 (`p.series` 필드 값) |

**쿼리 파라미터**: 없음 (전체 목록 반환, 페이지네이션 미지원)

**응답 200**

```json
{
  "items": [...],
  "nextCursor": null
}
```

> `items` 구조는 2.1과 동일. `status = 'published'`인 게시글만 포함. `seriesOrder ASC` 정렬.

---

### 2.4 카테고리별 시리즈 목록

```
GET /api/public/series
```

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `category` | string (선택) | 카테고리 필터. 미입력 시 전체 카테고리 |

**응답 200**

```json
{
  "items": [
    {
      "name": "시리즈명",
      "posts": [
        { "id": "uuid", "slug": "string", "title": "string", "seriesOrder": 1 }
      ]
    }
  ]
}
```

---

### 2.5 태그 목록

```
GET /api/public/tags
```

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `categories` | string | 쉼표 구분 카테고리 필터 (`update,agenthon` 등). 미입력 시 전체 카테고리 |

**응답 200**

```json
{
  "items": ["string"]  // 알파벳 정렬, 중복 제거, published 게시글 기준
}
```

---

### 2.6 헬스 체크 (구 2.7)

```
GET /api/health
```

**응답 200**: `{"status":"healthy","version":"1.0.0","correlationId":"..."}`

> `GET /api/public/image` (이미지 프록시) 엔드포인트는 2026년 4월 22일 제거됨. 이미지 접근은 게시글 API의 `thumbnail.signedUrl` 및 `contentMarkdown` 내 SAS URL 선주입 방식으로 대체됨.

---

## 3. 관리자 API

> 모든 관리자 API: `Authorization: Bearer {token}` 필수

### 3.1 게시글 목록 (관리자)

```
GET /api/admin/posts
```

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `limit` | number | 20 | 1–100 |
| `page` | number | 1 | 1–10000 |
| `category` | string | — | 카테고리 필터 |
| `tag` | string | — | 태그 필터 |
| `status` | string | — | `draft`, `published`, `archived` 중 하나 |

**응답 200**: 2.1과 동일 구조, `status` 필드에 모든 상태 포함, `seriesOrder` 필드 포함

---

### 3.2 게시글 상세 (관리자)

```
GET /api/admin/posts/{id}
```

**응답 200**

```json
{
  "id": "uuid",
  "slug": "string",
  "category": "string",
  "title": "string",
  "excerpt": "string",
  "contentMarkdown": "string",
  "tags": ["string"],
  "status": "draft | published | archived",
  "publishedAt": "ISO8601 | null",
  "updatedAt": "ISO8601",
  "series": "string | null",
  "seriesOrder": "number | null",
  "thumbnail": "string (URL) | null",
  "youtube": "string | null",
  "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
  "eventLocation": "string | null",
  "eventTarget": "string | null"
}
```

**에러**: `404 NotFound`

---

### 3.3 게시글 생성

```
POST /api/admin/posts
```

**요청 바디**

```json
{
  "title": "string (필수)",
  "category": "string (필수)",
  "contentMarkdown": "string (필수)",
  "tags": ["string"] "(필수, 빈 배열 가능)",
  "status": "draft | published | archived (필수)",
  "excerpt": "string (선택)",
  "slug": "string (선택, 미입력 시 title에서 자동 생성)",
  "series": "string | null (선택)",
  "seriesOrder": "number | null (선택, 시리즈 내 순서)",
  "thumbnail": "string (URL) | null (선택)",
  "youtube": "string | null (선택)",
  "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
  "eventLocation": "string | null (선택, event 카테고리 전용)",
  "eventTarget": "string | null (선택, event 카테고리 전용)"
}
```

**썸네일 자동 추출 규칙** (서버 측 적용):
- `thumbnail` 미전달(`undefined`) → 게시글 본문 HTML에서 첫 번째 `<img>` src 자동 추출 (Azure Blob URL 한정)
- `thumbnail: null` 명시 → 썸네일 없음으로 저장 (`null`)
- `thumbnail: { url: "..." }` 또는 URL 문자열 → 해당 값 저장

**상태 전이 규칙**:
- `status = 'published'` → `publishedAt = now`
- `status = 'draft'` 또는 `'archived'` → `publishedAt = null`

**슬러그 생성 규칙**:
- `slug` 입력 시: `toSlugBase(slug)` 처리 후 중복 시 `409 Conflict`
- `slug` 미입력 시: `toSlugBase(title)` 후 중복이면 자동으로 `-2`, `-3` 증가

**응답 201**

```json
{
  "id": "uuid",
  "slug": "string",
  "category": "string",
  "title": "string",
  "excerpt": "string",
  "contentMarkdown": "string",
  "tags": ["string"],
  "status": "string",
  "publishedAt": "ISO8601 | null",
  "updatedAt": "ISO8601",
  "series": "string | null",
  "seriesOrder": "number | null",
  "thumbnail": "string | null"
}
```

**에러**: `400 BadRequest` (검증 실패), `409 Conflict` (슬러그 중복)

---

### 3.4 게시글 수정

```
PUT /api/admin/posts/{id}
```

**요청 바디** (모든 필드 선택적 – Partial Update)

```json
{
  "title": "string (선택)",
  "excerpt": "string (선택)",
  "contentMarkdown": "string (선택)",
  "tags": ["string"] "(선택)",
  "status": "draft | published | archived (선택)",
  "series": "string | null (선택)",
  "seriesOrder": "number | null (선택)",
  "thumbnail": "string | null (선택)",
  "youtube": "string | null (선택)",
  "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
  "eventLocation": "string | null (선택, event 카테고리 전용)",
  "eventTarget": "string | null (선택, event 카테고리 전용)"
}
```

**썸네일 업데이트 규칙** (서버 측 적용):
- `thumbnail` 미전달 → 기존 썸네일 있으면 유지, 없으면 본문에서 자동 추출
- `thumbnail: null` 명시 → null로 초기화
- `thumbnail` 값 전달 → 해당 값으로 갱신

**상태 전이 규칙**:
- 비공개 → `published`: `publishedAt = now` 자동 설정
- 임의 상태 → `draft`: `publishedAt = null` 초기화

**응답 200**: 3.2와 동일 구조  
**에러**: `400 BadRequest`, `404 NotFound`

---

### 3.5 게시글 삭제

```
DELETE /api/admin/posts/{id}
```

**응답 204** (No Content)  
**에러**: `404 NotFound`

---

### 3.6 게시글 일괄 삭제

> ⚠️ **미구현**: 현재 코드에 해당 엔드포인트가 존재하지 않음. `adminDeletePost` 함수는 단건 삭제(`DELETE /api/admin/posts/{id}`)만 처리한다. 이 섹션은 향후 구현 계획 기준 문서임.

```
DELETE /api/admin/posts/bulk
```

**요청 바디**

```json
{
  "ids": ["uuid", "uuid", ...]
}
```

- `ids`: 삭제할 게시글 ID 배열 (1개 이상 필수)
- 존재하지 않는 ID는 무시 (멱등성 보장)
- 모든 삭제가 병렬 처리됨

**응답 204** (No Content)  
**에러**: `400 BadRequest` (ids 미입력 또는 빈 배열), `500 InternalServerError` (일부 삭제 실패)

> **라우팅 주의**: `api/admin/posts/bulk`는 `api/admin/posts/{id}` 보다 먼저 등록되어 exact match가 우선됨.

---

### 3.7 카테고리 목록

> ⚠️ **미구현**: 현재 코드에 해당 엔드포인트가 존재하지 않음. `adminController.js`에 `getCategories` 함수 없음. 이 섹션은 향후 구현 계획 기준 문서임.

```
GET /api/admin/categories
```

Cosmos DB에 존재하는 모든 게시글의 카테고리 값을 중복 없이 반환한다. Admin 필터 UI에서 사용.

**응답 200**

```json
{
  "items": ["string"]
}
```

> 내부 쿼리: `SELECT DISTINCT VALUE p.category FROM p WHERE ...` (파티션 교차 쿼리)

---

### 3.8 카테고리별 시리즈 목록

> ⚠️ **미구현**: 현재 코드에 해당 엔드포인트가 존재하지 않음. `adminController.js`에 `getAdminSeries` 함수 없음. 이 섹션은 향후 구현 계획 기준 문서임.

```
GET /api/admin/series?category={category}
```

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `category` | string (필수) | 카테고리 이름 |

**응답 200**

```json
{
  "items": [
    {
      "name": "string",
      "maxOrder": "number"
    }
  ]
}
```

- `name`: 시리즈 이름
- `maxOrder`: 해당 시리즈의 현재 최대 `seriesOrder` 값 (다음 순서 제안에 사용: `maxOrder + 1`)

> 내부 쿼리: `SELECT p.series as name, MAX(p.seriesOrder) as maxOrder ... GROUP BY p.series`

---

### 3.9 업로드 SAS 발급

```
POST /api/admin/assets/sas
```

**요청 바디**

```json
{
  "fileName": "string (필수, 원본 파일명)",
  "contentType": "string (필수, MIME 타입)",
  "sizeBytes": "number (선택, 최대 10485760)"
}
```

**허용 MIME 타입**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`, `image/avif`

**응답 200**

```json
{
  "uploadUrl": "https://...blob.core.windows.net/.../...?sasToken (유효 15분, PUT 업로드용)",
  "blobUrl": "https://...blob.core.windows.net/.../... (퍼블릭 접근 URL)",
  "expiresAt": "ISO8601"
}
```

**에러**: `400 BadRequest` (fileName/contentType 미입력, 허용되지 않는 MIME 타입, 크기 초과)

---

### 3.10 에셋 메타데이터 등록

```
POST /api/admin/assets
```

**요청 바디**

```json
{
  "blobUrl": "string (필수, 유효한 URL)",
  "contentType": "string (필수, 허용 MIME 타입)",
  "sizeBytes": "integer (필수, 1 ~ 10485760)",
  "fileName": "string (필수)",
  "postId": "string | null (선택)"
}
```

**응답 201**

```json
{
  "assetId": "uuid",
  "url": "string (blobUrl)",
  "mimeType": "string",
  "sizeBytes": "number",
  "width": 0,
  "height": 0
}
```

**에러**: `400 BadRequest`

---

### 3.11 에셋 삭제

```
DELETE /api/admin/assets/{assetId}
```

**처리 순서**:
1. Cosmos DB에서 에셋 메타데이터 삭제
2. Azure Blob Storage에서 파일 삭제 (`deleteIfExists`)

**응답 204** (No Content)  
**에러**: `404 NotFound`

---

### 3.12 분석 요약

```
GET /api/admin/analytics/summary
```

**응답 200**

```json
{
  "totalPv": "number (전체 페이지뷰 합산)",
  "totalUv": "number (전체 유니크 방문자 합산)",
  "avgTimeOnPage": "string (현재 구현: '00:00:00' 고정)",
  "dailyTrend": "array (현재 구현: 빈 배열)",
  "topPosts": [
    {
      "title": "string",
      "views": "number",
      "slug": "string"
    }
  ]
}
```

> **주의**: `views`, `uniqueVisitors`는 Cosmos DB 포스트 도큐먼트의 필드로, 현재 자동 수집 메커니즘이 구현되어 있지 않을 수 있다 (운영 확인 필요).

---

### 3.13 첨부파일 업로드 SAS 발급

```
POST /api/admin/files/sas
```

> 이미지 외 첨부파일(문서, PDF 등)을 Azure Blob Storage에 업로드하기 위한 SAS 토큰을 발급한다. 이미지 업로드 SAS(`/api/admin/assets/sas`)와 유사하지만 허용 MIME 타입이 다를 수 있다.

**요청 바디**

```json
{
  "fileName": "string (필수, 원본 파일명)",
  "contentType": "string (필수, MIME 타입)",
  "sizeBytes": "number (선택)"
}
```

**응답 200**

```json
{
  "uploadUrl": "https://...blob.core.windows.net/.../...?sasToken (유효 15분, PUT 업로드용)",
  "blobUrl": "https://...blob.core.windows.net/.../...",
  "expiresAt": "ISO8601"
}
```

**에러**: `400 BadRequest` (fileName/contentType 미입력)

---

### 3.14 첨부파일 메타데이터 등록

```
POST /api/admin/files
```

> Azure Blob에 업로드 완료된 첨부파일의 메타데이터를 Cosmos DB에 등록한다.

**요청 바디**

```json
{
  "blobUrl": "string (필수, 유효한 URL)",
  "contentType": "string (필수)",
  "sizeBytes": "integer (필수)",
  "fileName": "string (필수)",
  "postId": "string | null (선택)"
}
```

**응답 201**

```json
{
  "fileId": "uuid",
  "url": "string (blobUrl)",
  "contentType": "string",
  "sizeBytes": "number",
  "fileName": "string"
}
```

**에러**: `400 BadRequest`

---

### 3.15 첨부파일 삭제

```
DELETE /api/admin/files/{fileId}
```

**처리 순서**:
1. Cosmos DB에서 첨부파일 메타데이터 삭제
2. Azure Blob Storage에서 파일 삭제 (`deleteIfExists`)

**응답 204** (No Content)  
**에러**: `404 NotFound`

---

## 4. 데이터 모델

### 4.1 Post 도큐먼트 (Cosmos DB)

```json
{
  "id": "uuid",
  "documentType": "post",
  "partitionKey": "{category값}",
  "category": "string",
  "slug": "string (고유)",
  "title": "string",
  "excerpt": "string",
  "contentMarkdown": "string",
  "tags": ["string"],
  "status": "draft | published | archived",
  "publishedAt": "ISO8601 | null",
  "updatedAt": "ISO8601",
  "createdAt": "ISO8601",
  "series": "string | null",
  "seriesOrder": "number | null",
  "thumbnail": "string (URL) | null",
  "youtube": "string | null",
  "eventDates": [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }],
  "eventLocation": "string | null",
  "eventTarget": "string | null",
  "views": "number (선택, 분석용)",
  "uniqueVisitors": "number (선택, 분석용)",
  "_ts": "Cosmos 내부 타임스탬프"
}
```

### 4.2 Asset 도큐먼트 (Cosmos DB, posts 컨테이너 공유)

```json
{
  "id": "uuid",
  "documentType": "asset",
  "category": "_asset",
  "partitionKey": "_asset",
  "postId": "string | null",
  "blobUrl": "string (Azure Storage URL)",
  "contentType": "string (MIME 타입)",
  "sizeBytes": "number",
  "fileName": "string (원본 파일명)",
  "width": 0,
  "height": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "_ts": "Cosmos 내부 타임스탬프"
}
```

---

## 5. 환경 변수 요약 (Elevate.Server)

| 환경 변수 | 설명 | 기본값 |
|---------|------|--------|
| `COSMOS_ENDPOINT` | Cosmos DB 엔드포인트 | 필수 |
| `COSMOS_DATABASE_NAME` | 데이터베이스 이름 | `elevate` |
| `COSMOS_CONTAINER_NAME` | 포스트 컨테이너 이름 | `posts` |
| `COSMOS_ASSETS_CONTAINER_NAME` | 에셋 컨테이너 이름 | `posts` (포스트와 동일) |
| `COSMOS_KEY` | Cosmos 계정 키 (개발 환경만) | — |
| `STORAGE_ACCOUNT_NAME` | Storage 계정 이름 | 필수 |
| `STORAGE_CONTAINER_NAME` | Blob 컨테이너 이름 | `images` |
| `ENTRA_TENANT_ID` / `AUTH_TENANT_ID` | Tenant ID | `62ae463a-9f12-4edf-8544-4f6ca3834524` |
| `ENTRA_AUDIENCE` / `AUTH_API_AUDIENCE` | API Audience | `c4ea0eaf-6aaa-42e0-85ff-eef864cd2728` (GUID-only) |
