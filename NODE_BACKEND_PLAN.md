# 🚀 Elevate 백엔드(Node.js) 구축 상세 계획

## 1. 아키텍처 및 기술 스택
Node.js 서버는 `Elevate.Web`(프론트엔드 블로그)에 퍼블릭 데이터를 제공하고, `Elevate.Admin`(관리자 페이지)에서 블로그 발행 및 이미지 업로드를 돕는 중추 역할을 합니다.

*   **백엔드 환경**: **Azure Functions (Node.js)** 권장
    *   *이유*: 유지보수/운영 부담이 적고(서버리스 우선 원칙), 사용한 만큼만 비용을 지불하므로 경제적입니다.
*   **주요 패키지 (NPM)**:
    *   `@azure/cosmos`: NoSQL 문서 저장 (포스트 본문, 메타데이터)
    *   `@azure/storage-blob`: Admin의 파일 업로드 권한 제어(SAS 발급)
    *   `applicationinsights`: (선택) 백엔드 로그 및 Web에서 수집한 데이터 보완
*   **데이터베이스**: Azure Cosmos DB for NoSQL
*   **파일 저장소**: Azure Blob Storage (바이너리 이미지 직접 저장)

---

## 2. 데이터 버킷(Cosmos DB) 설계
Node.js 서버가 Cosmos DB와 어떻게 통신할지 스키마를 정의합니다.

1.  **`posts` 컨테이너**
    *   **역할**: 블로그 게시글의 HTML 본문 및 메타데이터 저장
    *   **구조**: `id`, `partitionKey` (예: `type`), `title`, `htmlBody`, `slug`, `tags`, `category`, `status` (draft/published), `createdAt`, `updatedAt`
2.  **`assets` 컨테이너**
    *   **역할**: Blob Storage에 업로드된 이미지 메타데이터 관리 (Cosmos DB에는 이미지 바이너리를 넣지 않음)
    *   **구조**: `id`, `postId` (연관된 게시물), `blobUrl`, `contentType`, `sizeBytes`

---

## 3. Node.js API 엔드포인트 (Azure Functions) 설계
백엔드 서버는 크게 **Web을 위한 조회(Read) API**와 **Admin을 위한 관리(CUD) API**로 나뉩니다.

### 🌐 [A] Elevate.Web (블로그 프론트엔드)용 Public API
마크다운을 렌더링하던 정적 방식을 대체하여, 서버에서 데이터를 패치해 렌더링합니다. (캐싱 고려)
*   **`GET /api/posts`**
    *   기능: Published 상태의 게시글 목록 조회 (페이지네이션 지원)
*   **`GET /api/posts/:slug`**
    *   기능: 특정 slug의 게시글 상세 정보 및 `htmlBody` 반환

### 🛠 [B] Elevate.Admin (관리자)용 Private API (Entra ID 인증 필수)
Azure Static Web Apps 라우팅 및 Entra ID 기반의 Role 승인을 거친 요청만 처리합니다.
*   **포스트 관리**
    *   **`POST /api/admin/posts`**: 새 게시물 생성 (초안 저장)
    *   **`PUT /api/admin/posts/:id`**: 게시물 수정 및 발행(Publish) 처리
    *   **`DELETE /api/admin/posts/:id`**: 게시물 삭제
*   **이미지 업로드 처리 (SAS 방식)**
    *   **`POST /api/admin/upload-sas`**
        *   기능: Admin 프론트엔드가 이미지를 Blob에 직접 올릴 수 있는 임시 권한(Shared Access Signature, SAS URL)을 Node.js가 발급해 응답.
        *   *이유*: Node.js 서버에 큰 이미지가 거쳐 가지 않아 성능과 비용 측면에서 가장 최적화된 방법입니다.
    *   **`POST /api/admin/assets`**
        *   기능: 업로드가 완료된 후 해당 이미지의 URL과 크기를 DB 내 `assets` 컨테이너에 등록.

---

## 4. 프론트엔드와 Node.js 서버 간의 마이그레이션 및 연동 계획

### 📍 Elevate.Web 변경 사항
1.  **데이터 소스 변경**:
    *   기존 디렉토리에 있는 `.md` 파일을 읽던 방식에서 벗어나, 페이지 마운트 시 브라우저에서 `GET /api/posts` (Node.js API)를 호출해 렌더링하도록 코드를 수정합니다.
2.  **사용자 분석 파이프라인(Analytics) 구축**: 
    *   웹 트래픽, PV/UV, 체류 시간, 유입경로를 측정하기 위해 Github Pages 내 `index.html`에 **Application Insights JavaScript SDK** 스니펫을 삽입합니다. (정적 사이트 특징 상 코드 레벨 연동이 필수)
    *   React 라우팅 기반 SPA일 경우 라우터가 변할 때마다 `trackPageView` 이벤트를 발생시켜 정확한 경로를 추적합니다.

### 📍 Elevate.Admin 변경 사항
1.  **에디터 연동**: HTML 에디터(ex. React Quill 등)에서 작성된 내용을 그대로 JSON 형태(`htmlBody`)로 감싸 `POST /api/admin/posts`로 전달합니다.
2.  **업로드 플로우 적용**:
    *   이미지 첨부 버튼 클릭 ➡️ Node.js에 SAS 토큰 요청 (`/api/admin/upload-sas`) ➡️ 얻어온 토큰으로 Blob Storage에 이미지 직접 `PUT` ➡️ 완료 후 메타데이터를 저장(`POST`)하는 3단계 자바스크립트 로직을 구현합니다.
3.  **트래픽 대시보드 연동**: Application Insights에 쌓인 트래픽 데이터를 조회하는 Azure Monitor의 REST API 혹은 백엔드의 리포팅 API를 찔러 **Recharts** 등으로 대시보드를 시각화합니다.

---

## 5. 실행 로드맵 (마일스톤)

*   **Phase 1. Azure 리소스 프로비저닝**
    *   Azure Portal에서 Cosmos DB 컨테이너(`posts`, `assets`) 구성.
    *   Azure Blob Storage 프로비저닝 및 Application Insights 생성.
*   **Phase 2. Node.js 백엔드 기반 작업**
    *   Azure Functions 프로젝트(Node.js v20+) 초기화.
    *   Cosmos DB SDK, Storage SDK 연결 모듈 및 환경변수 설정 세팅.
*   **Phase 3. API 개발 및 Admin 연동**
    *   CRUD API 개발(Post, Update, Publish).
    *   SAS 발급 API 개발 및 Admin 측 에디터 연동 테스트.
*   **Phase 4. Web 연동 및 Analytics 심기**
    *   Elevate.Web의 Markdown 렌더러를 Node.js API 호출 방식(HTML 주입)으로 개선.
    *   클라이언트 측 Application Insights JS SDK 심기 및 수집 테스트.
*   **Phase 5. 보안 점검 및 튜닝**
    *   API가 Admin의 인증(Entra ID) 컨텍스트를 제대로 검증하는지 확인.
    *   앱 대시보드(Admin)에서 PV/UV 등이 정상적으로 튀어나오는지 확인.
