# 배포 가이드 (DEPLOYMENT)

이 문서는 Elevate Web 프로젝트의 로컬 빌드 및 Azure Static Web Apps 배포 절차를 설명합니다.

---

## 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/YoonKeumJae/elevate.git
cd elevate/Elevate.Web

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 편집 (VITE_API_BASE_URL 등 설정)

# 4. 로컬 빌드
npm run build

# 5. 빌드 결과 미리보기
npm run preview
```

---

## 환경변수

### 개발 환경 (`.env.local`)

```bash
# Function App public API 기본 URL (필수)
VITE_API_BASE_URL=https://func-elv-server-ep-dev.azurewebsites.net/api/public

# Microsoft Clarity 분석 (선택 - 로컬에서는 보통 비활성)
VITE_CLARITY_ENABLED=false
VITE_CLARITY_PROJECT_ID=

# Azure Bot Framework Direct Line (선택)
VITE_DIRECT_LINE_SECRET=
```

### 운영 환경 (Azure SWA 앱 설정)

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | Function App URL (기본값으로도 동작하나 명시 권장) |
| `VITE_CLARITY_ENABLED` | `true` |
| `VITE_CLARITY_PROJECT_ID` | Clarity 프로젝트 ID |
| `VITE_DIRECT_LINE_SECRET` | Bot Framework Direct Line 시크릿 |

---

## 로컬 빌드

```bash
npm run build
```

Vite가 `src/`를 번들링하여 `dist/`를 생성합니다. 게시글 데이터는 빌드 시점이 아닌 런타임에 API에서 가져오므로 별도 스크립트 실행 불필요합니다.

빌드 결과 확인:

```bash
npm run preview
# http://localhost:4173 에서 확인
```

### 빌드 후 체크리스트

- [ ] `dist/index.html`이 생성되었는가?
- [ ] 홈페이지 로드가 정상인가?
- [ ] 카테고리 페이지에서 게시글 목록이 API에서 로드되는가?
- [ ] 게시글 상세 페이지가 정상 렌더링되는가?
- [ ] 콘솔 에러가 없는가?

---

## Azure Static Web Apps 배포

### 수동 배포 (Azure SWA CLI)

```bash
# SWA CLI 설치
npm install -g @azure/static-web-apps-cli

# 빌드 후 배포 (배포 토큰은 Azure Portal > SWA > Manage deployment token 에서 확인)
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token <AZURE_STATIC_WEB_APPS_API_TOKEN>
```

배포 토큰은 Azure Portal에서 확인합니다:
`Static Web Apps (swa-elv-web-test) > Overview > Manage deployment token`

### 배포 후 확인

- 운영 URL: `https://purple-mud-005887500.7.azurestaticapps.net`
- 커스텀 도메인: `https://microsoft-elevate.com`

---

## 운영 환경 구성 정보

| 리소스 | 값 |
|--------|-----|
| SWA 리소스명 | `swa-elv-web-test` |
| SWA URL | `purple-mud-005887500.7.azurestaticapps.net` |
| 커스텀 도메인 | `microsoft-elevate.com` |
| Function App | `func-elv-server-ep-dev.azurewebsites.net` |
| 리전 | West Europe (운영용 리전 정책 확인 필요) |

---

## 트러블슈팅

### 빌드 실패

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API 호출 실패 (CORS 또는 404)

1. `VITE_API_BASE_URL`이 올바른 Function App URL인지 확인
2. Function App이 실행 중인지 확인: `https://func-elv-server-ep-dev.azurewebsites.net/api/public/posts`
3. SWA의 CORS 설정에서 허용 출처 확인

### 배포 후 빈 화면

1. Azure Portal > SWA > Configuration에서 앱 설정(환경변수) 확인
2. `VITE_API_BASE_URL`이 설정되어 있는지 확인 (없으면 기본값 사용)
3. 브라우저 DevTools > 네트워크 탭에서 API 응답 확인

---

## 관련 문서

- [프로젝트 개요](README.md)
- [아키텍처](ARCHITECTURE.md)
- [게시글 관리 가이드](POSTS_GUIDE.md)

