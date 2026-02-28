# 웹 (GitHub Pages) 방문자 통계 추적 구현 계획

이 문서는 `Elevate.Web` 프로젝트에 **Azure Application Insights**를 연동하여 블로그 방문자의 유입, 조회수(PV/UV), 체류시간 등을 추적하고, 이를 Admin 대시보드에서 활용할 수 있도록 설정하는 계획을 다룹니다.

## 1. 개요 및 설계 목표

현재 블로그는 **GitHub Pages**를 통해 정적 사이트로 배포되고 있습니다. 서버 측 로그를 수집하기 어려운 정적 호스팅 환경에서는 클라이언트(웹 브라우저) 측에서 사용자 행동 이벤트를 수집하여 통계 서버로 전송하는 방식이 필수적입니다.
이를 위해 Microsoft의 **Azure Application Insights JavaScript SDK**를 탑재하여 다음과 같은 데이터를 수집합니다.

- **기본 트래픽 지표**: 총 페이지뷰(PV), 순 방문자 수(UV)
- **사용자 행동 지표**: 유입 경로(Referrer), 세션 정보, 기기 및 브라우저 정보, 체류 시간
- **라우팅 추적**: SPA(Single Page Application) 혹은 라우트 전환 시 포스트별 조회 이벤트 식별

## 2. 세부 구현 단계

### Phase 1: Application Insights SDK 연동

- [ ] Azure Portal에서 **Application Insights** 인스턴스 생성 및 `Instrumentation Key`(또는 Connection String) 확보.
- [ ] `Elevate.Web` 프로젝트에 MS Application Insights React 플러그인 또는 바닐라 JS SDK 설치 (`npm install @microsoft/applicationinsights-web`).
- [ ] 환경 변수(`.env`)에 Connection String 등 필수 정보 셋팅 가이드라인 작성.

### Phase 2: 클라이언트 추적 로직(Tracking Service) 삽입

- [ ] `src/lib/` 혹은 유사한 디렉토리에 `analytics.js` (추적 유틸리티 모듈) 신규 작성.
- [ ] App 최상단에서 Application Insights 초기화 수행.
- [ ] 라우터 전환 시 페이지 이동 이벤트를 자동으로 추적하도록 설정 (React Router 연동).
    - `trackPageView({ name: 'PageName', uri: window.location.href })` 자동 호출 처리.

### Phase 3: 커스텀 이벤트 설계 (Optional)

- [ ] (필요시) 특정 포스트에서 특정 버튼(공유, 태그 클릭 등) 클릭 시 `trackEvent` 커스텀 이벤트를 발송하여 사용자 상호작용 지표 강화. 
- [ ] 페이지 이탈 전 체류시간을 계산 혹은 Scroll Depth 등 상세 페이지 측정 보강.

## 3. 검증 및 테스트 계획

1. 로컬 환경(`npm run dev`)에서 Application Insights 콘솔 도구를 활용해 페이지 전송 이벤트(Tracking Beacon)가 네트워크 탭에 정상적으로 잡히는지 확인.
2. Azure Application Insights 포털의 `Live Metrics` 및 `Logs (AppPageViews)` 테이블에 개발자 본인의 접속 로그가 실시간으로 수집되는지 검증.
3. 배포(GitHub Pages) 후, URL 파라미터나 레퍼러가 운영 통계 지표로 올바르게 파싱되는지 검증. 

해당 구현이 완료되면, Admin 측에서 구축한 백엔드 API가 이 데이터를 KQL 쿼리로 조회하여 관리자에게 리포팅할 수 있는 통합 파이프라인이 완성됩니다.
