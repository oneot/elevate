# Elevate Admin

사내 전용 블로그 관리용 Admin 앱입니다. HTML 에디터 기반 포스팅 작성/발행, 이미지 업로드, 메타데이터 관리 흐름을 지원하며, 운영 데이터는 Azure의 서버리스 구성으로 관리합니다.

## 주요 기능

- HTML 에디터 기반 포스트 작성/저장/발행
- 리치 텍스트 포매팅 (B/I, 제목, 목록, 인용)
- 이미지 삽입 및 표 생성
- 코드 블록 및 텍스트 정렬
- 포스트 메타데이터 관리 (제목, 슬러그, 상태, 태그, 카테고리)
- 포스트 상태(draft/published) 관리
- 역할 기반 접근 제어(Static Web Apps 내장 인증)
- 향후 Copilot Studio 연계를 고려한 메타데이터 중심 구조
- 블로그 방문자 분석(PV, UV, 체류시간 및 유입경로 수집) 및 Admin 대시보드 제공

## 아키텍처 개요

이 Admin 앱은 Azure 기반의 서버리스 아키텍처를 전제로 설계됩니다.

- **Admin 프론트엔드**: Azure Static Web Apps (Entra ID 로그인 + 역할 기반 라우팅)
- **Backend API**: Azure Functions (HTTP Trigger)
- **운영 데이터**: Azure Cosmos DB for NoSQL (포스트/메타데이터 저장)
- **이미지 저장소**: Azure Blob Storage (바이너리 저장)
- **블로그 트래킹**: Application Insights JS SDK (GitHub Pages에 삽입)

### 데이터 흐름 (요약)

1. Admin에서 HTML 에디터로 글 작성 → API로 저장
2. Backend가 Cosmos DB에 draft 저장
3. 이미지 업로드는 SAS 발급 후 Blob Storage에 직접 업로드
4. 업로드 완료 후 assets 메타데이터를 Cosmos DB에 저장
5. 발행 시 상태를 published로 변경

## 블로그 방문자 트래킹 및 대시보드

정적 사이트인 GitHub Pages의 사용자 트래픽을 관리자가 통계로 파악할 수 있도록 데이터 파이프라인과 대시보드 기능을 구축합니다.

1. **데이터 수집 (GitHub Pages)**: 클라이언트 사이드에 **Application Insights SDK (JavaScript)** 탑재, `trackPageView` 및 `trackEvent` 전송
2. **통계 분석 및 제공 (Azure Functions)**: Azure Monitor Data Access API를 호출하여 KQL (Kusto Query Language) 기반 통계 데이터(일자별 PV/UV, 유입 경로, 개별 포스트 방문수) 가공 및 전달
3. **관리자 시각화 (Admin Frontend)**: Admin 앱 내 대시보드(Dashboard) 페이지를 신설하고 차트 라이브러리(Recharts 등)를 활용하여 요약 지표 및 트래픽 시각화 제공

## 환경 변수

- `VITE_API_BASE_URL`: Azure Functions API 엔드포인트 (예: `https://<app>.azurewebsites.net/api`)

예시는 [.env.example](.env.example)를 참고하세요.

API가 아직 준비되지 않은 경우, Admin은 목업 데이터를 사용해 UI를 미리 확인할 수 있습니다.

## 인증/라우팅 설정

Static Web Apps의 내장 인증을 사용합니다. 모든 Admin 경로는 `authenticated` 역할로 제한되어 있으며, 구성은 [staticwebapp.config.json](staticwebapp.config.json)에 정의됩니다.

## API 계약 (가정)

Admin 클라이언트는 아래 REST 엔드포인트를 가정합니다.

- `GET /posts` : 포스트 목록
- `GET /posts/{id}` : 포스트 상세
- `POST /posts` : 포스트 생성
- `PUT /posts/{id}` : 포스트 업데이트
- `DELETE /posts/{id}` : 포스트 삭제
- `POST /assets/sas` : 이미지 업로드용 SAS 발급
- `POST /assets` : 업로드 메타데이터 등록

## 기술 스택

- **React** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **TipTap** - HTML 에디터
- **JavaScript** - 프로그래밍 언어

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 [http://localhost:5173](http://localhost:5173)에서 실행됩니다.

### 빌드

```bash
npm run build
```

프로덕션 빌드를 생성합니다.

### 미리보기

```bash
npm run preview
```

프로덕션 빌드를 로컬에서 미리 볼 수 있습니다.

## 프로젝트 구조

```
Elevate.Admin/
├── src/
│   ├── components/   # 공통 UI 컴포넌트
│   ├── lib/          # API 클라이언트/유틸리티
│   ├── pages/        # 화면 구성
│   ├── App.jsx       # 라우팅 구성
│   ├── main.jsx      # 앱 진입점
│   └── index.css     # Tailwind CSS 설정
├── public/           # 공개 정적 파일
├── index.html        # HTML 템플릿
├── vite.config.js    # Vite 설정
├── tailwind.config.js # Tailwind CSS 설정
├── staticwebapp.config.json # SWA 라우트/권한 설정
├── .env.example       # 환경 변수 예시
└── package.json      # 프로젝트 의존성
```

## Tailwind CSS

이 프로젝트는 Tailwind CSS를 사용합니다. [src/index.css](src/index.css)에서 Tailwind 지시문을 확인할 수 있습니다.

커스텀 설정은 [tailwind.config.js](tailwind.config.js)에서 관리됩니다.
