
# Elevate Web

Elevate 공개 블로그 SPA입니다. React + Vite 기반으로 빌드되며, 운영 환경은 GitHub Pages(`https://microsoft-elevate.com`)에 배포됩니다. Azure Static Web Apps(`swa-elv-web-test`)는 테스트/보조 환경입니다.

## 빠른 시작

Node.js 22.x(저장소 루트 `.nvmrc`)를 사용합니다.

```bash
npm ci --legacy-peer-deps
npm run dev
```

로컬 설정은 `.env.example`을 참고합니다. 배포 빌드에는 `VITE_API_BASE_URL`이 필요합니다.
운영 공개 API와 관리자 API의 인증 경계는 변경하지 않습니다.

빌드:

```bash
npm run build
```

## 접속 및 게시글 요청

운영 도메인은 HTTPS로 접속해야 합니다. GitHub Pages의 **Enforce HTTPS**가 기본 보호이며,
`index.html`도 `http://microsoft-elevate.com`에서 경로·쿼리·해시를 유지한 HTTPS 주소로
앱 부트스트랩 전에 이동합니다. `localhost`, 로컬 IP 및 별도 미리보기 호스트의 HTTP 개발 환경은 유지합니다.

공개 API 요청은 응답 본문과 재시도 대기를 포함해 **요청당 15초**로 제한합니다.
GET의 네트워크 오류 및 502/503/504는 300ms 후 한 번만 자동 재시도하며, 시간 제한은 연장하지 않습니다.
취소, 404, 429, 잘못된 JSON 및 쓰기 요청은 자동 재시도하지 않습니다.
화면의 **다시 시도**는 현재 URL의 검색·태그·페이지를 보존합니다.

목록·상세·최신 글·행사 일정은 동일한 요청 수명 훅을 사용합니다.
화면 전환/재시도/해제 시 이전 응답이 새 화면을 덮어쓰지 않으며, 네트워크 오류를 404나 빈 목록으로 표시하지 않습니다.
카테고리 목록은 모든 API 페이지를 조회하고, 진행 중인 요청만 공유하며 성공 결과를 60초간 재사용합니다.
한 소비자의 취소가 다른 소비자를 중단하지 않고, 마지막 소비자가 떠나면 요청을 취소합니다.
실패·만료된 결과를 오프라인 콘텐츠로 대체하지 않습니다.

VPN 연결 상태에서 API의 TCP 연결이 차단되는 문제는 이 클라이언트 처리만으로 해결되지 않습니다.
정적 GitHub Pages는 API 프록시가 아니므로 네트워크 담당자의 기존 공개 API 접근 경로 확인이 필요합니다.
VPN on/off 재현 방법과 운영 조치는 [접속 장애 런북](../documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md#http--vpn-접속-장애)을 참고하세요.

## 회귀 검증

```bash
npm test
npm run check:seo
npm run test:chunk-recovery
npm run test:build-id
npm run test:post-detail-enhancement
```

Vitest와 jsdom은 개발 의존성입니다. 테스트는 실제 React 화면과 API 클라이언트를 실행하되
`fetch`와 시간을 모의하여 무응답, 본문 정체, 취소 경쟁, 재시도, 페이지/검색/카테고리와 상세 진입을 검증합니다.
실제 VPN on/off 또는 기업 네트워크 정책을 검증하는 테스트는 아닙니다.
`Repository checks` PR 워크플로는 외부 API·비밀값 없이 Web·Admin·Server의
회귀 검증과 프런트엔드 빌드를 실행합니다.

전체 소스 회귀는 `npm run test:source`로 실행합니다. 활동 영상의 실패 표시/재시도,
월말 달력 이동, 챗 첫 열림과 대화 상태 보존, SEO 빌드의 필수 수집 오류도 검증합니다.

## 지연 로딩과 SEO 빌드

챗 UI·WebChat은 처음 열 때 로드하며 이후 닫았다 열어도 대화를 유지합니다.
토큰 선조회와 기존 토큰 엔드포인트는 그대로 사용합니다.
활동 영상 API 실패 시 기존 기본 목록임을 표시하고 재시도할 수 있으며,
정상 빈 응답을 기본 콘텐츠로 대체하지 않습니다.

`npm run build`는 Vite 빌드 뒤 기존 SEO 메타데이터 shell을 생성합니다.
`REQUIRE_API_ROUTES=true`인 배포에서는 API 오류·잘못된 페이지 정보·20페이지 초과가
빌드 실패입니다. 이는 본문·이미지를 정적으로 복제하는 기능이 아닙니다.
외부 API 없이 확인하려면 다음처럼 Vite와 오프라인 shell 생성을 구분합니다.

```bash
VITE_API_BASE_URL=https://api.example.test/api/public npx --no-install vite build
VITE_API_BASE_URL= REQUIRE_API_ROUTES=false npm run generate:seo-routes
```

## 문서

모든 상세 문서는 저장소 루트 `documents/` 폴더에 있습니다.

| 문서 | 위치 |
|------|------|
| 개발·검증 시작점 | [README.md](../README.md) |
| 프로젝트 전체 계획 | [documents/01-getting-started/PLAN.md](../documents/01-getting-started/PLAN.md) |
| 전체 주요 경로 분석·변경 근거 | [MODERNIZATION.md](../documents/04-application/MODERNIZATION.md) |
| 배포 및 운영 | [documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md](../documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md) |

현재 없는 아키텍처·정책 문서는 복구된 PLAN의 확인 범위에 따르며,
누락된 운영 구성을 코드만으로 추정하지 않습니다.
