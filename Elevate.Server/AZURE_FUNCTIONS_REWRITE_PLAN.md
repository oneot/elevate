# Elevate.Server Azure Functions 재작성 계획

## 목적
- 현재 Express 서버 구현을 Azure Functions 배포 모델과 일치하도록 재작성한다.
- OpenAPI 계약을 유지하면서 Azure Functions 런타임에서 안정적으로 동작하도록 구조를 전환한다.
- Managed Identity, Cosmos DB, Blob Storage, Entra 인증 정책을 현재 문서 기준과 일치시킨다.

## 현재 상태 요약
### 현재 구현
- `index.js`에서 Express 앱을 직접 구동한다.
- 라우팅은 Express Router 기반이다.
- 컨트롤러/서비스 계층은 분리되어 있어 재사용 가능성이 있다.
- Azure 연결 테스트와 RBAC 점검 코드는 이미 존재한다.

### 현재 문제
- 인프라는 Azure Function App 기준인데 애플리케이션은 일반 Node 서버 구조다.
- Express `listen()` 모델은 Azure Functions의 HTTP trigger 모델과 맞지 않는다.
- 현재 배포 시 코드 패키징이 되더라도 엔트리포인트 불일치로 런타임 기동 실패 가능성이 높다.
- 로컬 테스트와 Azure 배포 테스트가 같은 진입점을 공유하지 않는다.

## 목표 구조
### 런타임 모델
- Azure Functions v4 Node.js 프로그래밍 모델 사용
- HTTP Trigger 기반으로 엔드포인트를 직접 노출
- 공통 로직은 `src/` 아래에 유지하고, Function 엔트리 파일은 얇게 유지

### 목표 디렉터리 예시
```text
Elevate.Server/
  host.json
  local.settings.json (git ignore)
  package.json
  src/
    functions/
      publicPostsList.js
      publicPostDetail.js
      publicSeriesPosts.js
      publicTags.js
      adminCreatePost.js
      adminUpdatePost.js
      adminDeletePost.js
      adminIssueAssetSas.js
      adminCreateAsset.js
      adminDeleteAsset.js
      adminAnalyticsSummary.js
      health.js
    controllers/
    services/
    middleware/
    utils/
  tests/
```

### 엔드포인트 매핑 원칙
- `GET /api/health` → health function
- `GET /api/public/posts` → publicPostsList function
- `GET /api/public/posts/{category}/{slug}` → publicPostDetail function
- `GET /api/public/series/{seriesSlug}/posts` → publicSeriesPosts function
- `GET /api/public/tags` → publicTags function
- `POST /api/admin/posts` → adminCreatePost function
- `PUT /api/admin/posts/{id}` → adminUpdatePost function
- `DELETE /api/admin/posts/{id}` → adminDeletePost function
- `POST /api/admin/assets/sas` → adminIssueAssetSas function
- `POST /api/admin/assets` → adminCreateAsset function
- `DELETE /api/admin/assets/{assetId}` → adminDeleteAsset function
- `GET /api/admin/analytics/summary` → adminAnalyticsSummary function

## 설계 원칙
### 1. 컨트롤러 재사용 우선
현재 `src/controllers`, `src/services`, `src/utils`, `src/middleware`의 도메인 로직은 가능한 한 유지한다.
단, Express 전용 `req`, `res` 의존은 Azure Functions의 `HttpRequest`, `InvocationContext`에 맞게 어댑터 계층으로 치환한다.

### 2. 프레임워크 의존 축소
- Express Router 제거
- `app.listen()` 제거
- Function별 엔트리 파일에서 필요한 핸들러만 호출
- 공통 응답 포맷은 별도 helper로 유지

### 3. 인증/인가 유지
- Admin 경로는 Entra Bearer 토큰 검증 유지
- `aud`, `tid`, guest 차단 규칙 유지
- Express middleware 형태를 Function 친화적인 `authorizeRequest(request)` 형태로 변경

### 4. 에러/로깅 일관성 유지
- `correlationId`는 Functions 환경에서도 동일하게 생성 및 응답 헤더 반영
- OpenAPI 에러 스키마 `{ code, message, correlationId, details? }` 유지
- `InvocationContext` 기반 로그로 전환

## 단계별 실행 계획

## Phase 1. 런타임 골격 전환
### 작업
- `index.js` 중심 구조를 제거하거나 보조 로컬 실행 용도로 축소
- `@azure/functions` 패키지 추가
- `host.json` 생성
- HTTP Trigger 엔트리 파일용 기본 구조 생성
- local 개발용 설정 파일 템플릿 정리

### 산출물
- `host.json`
- `src/functions/*.js` 초기 파일
- `package.json` 스크립트 갱신

### 완료 기준
- Azure Functions 런타임이 프로젝트를 인식한다.
- 최소 1개 health endpoint가 로컬 Functions 호스트에서 동작한다.

## Phase 2. HTTP 어댑터 계층 작성
### 작업
- Express `req`, `res` 의존 제거용 어댑터 작성
- query, params, body, headers를 추상화하는 helper 작성
- 공통 JSON 응답 helper 작성
- correlationId 생성 및 헤더 설정 helper 작성

### 구현 방향
- `requestAdapter.js`: Function request를 기존 controller 입력 형태로 변환
- `responseBuilder.js`: OpenAPI 형식 응답 생성
- `functionContext.js`: correlationId, logger, user context 처리

### 완료 기준
- 컨트롤러가 직접 Express 객체를 몰라도 실행 가능하다.
- health, public posts 하나 이상이 adapter를 통해 정상 동작한다.

## Phase 3. 인증 미들웨어 Functions 전환
### 작업
- 현재 `src/middleware/auth.js`를 Functions 요청 모델에 맞게 변환
- Express middleware 체인을 제거하고 명시적 호출 방식으로 변경
- 인증 실패 시 즉시 표준 에러 응답 반환

### 구현 방향
- `authorizeAdminRequest(request, context)` 형태의 함수 제공
- 성공 시 사용자 클레임 객체 반환
- 실패 시 throw 또는 표준 응답 반환 전략 확정

### 완료 기준
- admin endpoint에서 토큰 없음/잘못된 토큰/guest 토큰 시 OpenAPI 규격대로 401/403 반환

## Phase 4. Public API 엔드포인트 이식
### 작업
- 게시글 목록, 상세, 시리즈 목록, 태그 목록 Function 작성
- 기존 `postController.js` 로직을 request adapter 기반으로 연결
- cursor pagination, category/tag filter 유지

### 완료 기준
- OpenAPI에 정의된 public endpoint 전부가 Azure Functions 엔트리로 연결된다.
- 기존 테스트를 Function 엔트리 기준으로 추가할 수 있다.

## Phase 5. Admin API 엔드포인트 이식
### 작업
- 게시글 CRUD Function 작성
- 자산 SAS 발급/메타 등록/삭제 Function 작성
- analytics summary Function 작성
- slug 생성/충돌 처리 유지

### 완료 기준
- OpenAPI에 정의된 admin endpoint 전부가 Azure Functions 엔트리로 연결된다.
- 인증/인가, OpenAPI 응답 포맷이 모두 유지된다.

## Phase 6. 설정 및 환경 변수 정합성 정리
### 작업
- 코드가 읽는 환경 변수명을 Function App app settings와 일치시킨다.
- 현재 `COSMOS_DB_NAME` vs `COSMOS_DATABASE_NAME`처럼 불일치하는 항목 정리
- Functions 로컬 실행용 `local.settings.json.example` 또는 문서 작성

### 정리 대상
- `COSMOS_ENDPOINT`
- `COSMOS_DB_NAME` 또는 `COSMOS_DATABASE_NAME`
- `STORAGE_ACCOUNT_NAME`
- `STORAGE_CONTAINER_NAME`
- `ENTRA_TENANT_ID` 또는 `AUTH_TENANT_ID`
- `ENTRA_AUDIENCE` 또는 `AUTH_API_AUDIENCE`

### 완료 기준
- 로컬/배포 환경 변수명이 하나의 기준으로 통일된다.

## Phase 7. 테스트 전략 재구성
### 작업
- 기존 `node:test` 유지
- 로직 테스트와 Functions 엔트리 테스트를 분리
- Azure 연결 테스트는 계속 게이트 방식 유지

### 테스트 계층
1. 단위 테스트
- slug 생성
- 요청 검증
- 응답 포맷
- 인증 helper

2. Function 엔트리 테스트
- public health
- public posts
- admin unauthorized

3. Azure 연결 테스트
- Cosmos 연결
- Storage 연결
- User Delegation SAS 발급 가능 여부

### 완료 기준
- `npm test`는 로컬에서 빠르게 통과
- `npm run test:azure`는 허용된 네트워크 경로에서 통과

## Phase 8. 배포 구조 정리
### 작업
- Function App에 맞는 배포 아티팩트 구조 확인
- `WEBSITE_RUN_FROM_PACKAGE`와 호환되는 패키징 기준 확인
- 필요 시 GitHub Actions 또는 수동 zip deploy 기준 문서화

### 완료 기준
- Azure Functions 배포 후 `/api/health`와 `/api/public/posts`가 실제 응답한다.

## 코드 변경 세부 계획
### 제거 또는 축소 대상
- `index.js`의 Express 서버 직접 실행 로직
- `src/routes/publicRoutes.js`
- `src/routes/adminRoutes.js`
- Express에만 종속된 middleware 연결 방식

### 유지 대상
- `src/controllers/postController.js`
- `src/controllers/adminController.js`
- `src/services/cosmosClient.js`
- `src/services/storageClient.js`
- `src/utils/http.js`
- `src/utils/slug.js`

### 재작성 대상
- `src/middleware/auth.js`
- request context 처리
- 테스트의 서버 부팅 방식

## 기술 결정 사항
### 권장 패키지
- `@azure/functions`
- 필요 시 `jsonwebtoken` 대신 현재 `jose` 유지 가능

### 비권장 방향
- Express를 Azure Functions 안에 억지로 래핑하는 구조
- API별 단일 giant handler 작성
- 운영 정책을 우회하는 키 기반 인증 확대

## 주요 리스크
### 1. 환경 변수명 불일치
현재 IaC와 코드에서 이름이 일부 다르므로 런타임 실패 위험이 높다.

### 2. 네트워크 정책
dev 리소스가 `publicNetworkAccess=Disabled`라면 로컬 데이터 평면 테스트는 계속 실패할 수 있다.
Azure 내부 실행 환경 또는 허용된 네트워크 경로가 필요하다.

### 3. Storage/Cosmos 컨테이너 정합성
현재 코드가 가정하는 컨테이너(`posts`, `assets`)와 실제 배포된 Cosmos 구조가 일치하는지 재확인 필요하다.

### 4. 배포 파이프라인 부재
코드 재작성 후에도 Azure에 올리는 경로(zip deploy 또는 CI/CD)가 정리되지 않으면 최종 검증이 늦어진다.

## 선행 확인 필요 항목
- Cosmos에 `assets` 컨테이너가 실제 존재하는가
- Function App 배포 방식은 zip deploy인가, GitHub Actions인가
- dev 네트워크 정책을 유지할지 완화할지
- `adminClientSecret` 주입은 배포 시점에 어떻게 전달할지

## 완료 정의
다음 조건을 모두 만족하면 재작성 완료로 본다.
- Azure Functions 로컬 실행 가능
- OpenAPI 정의된 모든 endpoint 동작
- Admin 인증/인가 규칙 유지
- Azure 연결 테스트가 허용된 네트워크 경로에서 통과
- Function App 배포 후 `/api/health` 성공
- 문서와 실제 런타임 구조가 일치

## 권장 작업 순서
1. Phase 1~2로 Functions 골격과 adapter 작성
2. health endpoint 먼저 전환
3. public API 전환
4. admin API 전환
5. 환경 변수/인증 정리
6. 테스트 재작성
7. 실제 Azure 배포 검증

## 추가 문서화 권장
이 계획에 따라 구현이 시작되면 아래 문서도 함께 갱신한다.
- `documents/DEPLOYMENT_AND_RUNBOOK.md`
- `documents/AZURE_ARCHITECTURE.md`
- 필요 시 `documents/DATA_MODEL_AND_API_CONTRACT.md`
