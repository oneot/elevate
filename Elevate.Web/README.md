
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
VPN on/off 재현 방법과 운영 조치는 비공개 레포 `oneot/elevate-infra`의 배포·운영 런북("HTTP / VPN 접속 장애")을 참고하세요.

## 블로그 사이드바

블로그 목록(`/all`, `/:category`)과 게시글 상세의 사이드바에는 뒤로 가기 링크를 두지 않습니다.
홈은 상단 Microsoft Elevate 로고로, 전체 게시글은 문서 바의 **Blog**, 상단 **블로그** 메뉴
(모바일은 메뉴의 **블로그 전체 보기**), 블로그 글의 브레드크럼으로 이동합니다.
최신 정보·프로그램 소식·에이전톤 글의 문서 바와 브레드크럼은 각 섹션으로 이동하며,
전체 게시글은 상단 **블로그** 메뉴로 이동합니다.

목록 사이드바의 '카테고리' 제목은 화면에 표시하지 않고 스크린리더용 그룹 이름으로만 유지합니다.
상세 사이드바의 카테고리 제목(카테고리 목록 링크) 앞에는 `docsMeta.js`의 앱 아이콘을 표시하고,
아이콘이 없는 카테고리·섹션은 제목 글자만 표시합니다. 활동 사례(`/activity`) 사이드바의 머리글은 그대로입니다.

## 화면 카테고리(앱) 분류

서버에 저장되는 게시글 category는 7개(`BASE_CATEGORIES`)이고, 블로그는 `src/constants/categories.js`의
`CATEGORY_SPLIT_RULES`로 일부 글을 별도 앱으로 나눠 보여 줍니다. 판단 순서는 slug → 시리즈 이름 → 태그(대소문자 무시)입니다.

- Word·PowerPoint·Forms·OneDrive: M365 글 중 해당 시리즈, 없으면 `word`·`powerpoint`·`forms`·`onedrive` 태그.
- GitHub·Azure: Copilot Studio 글 중 기존 글 slug 목록, 없으면 `github`·`azure` 태그.
  태그 규칙은 관리자에서 새로 쓰는 GitHub·Azure 글을 위한 것이며, 2026-10-20 기준 공개 글의 분류는 바뀌지 않습니다
  (나뉘는 대상인 M365·Copilot Studio 공개 글 33건의 분류와 개수를 `tests/category-split-rules.test.js`가 고정).

관리자(`Elevate.Admin/src/constants/apps.js`)도 같은 규칙으로 앱별 목록과 새 글을 만듭니다.
규칙을 바꾸면 Admin의 `tests/app-classification.test.js`가 두 앱의 차이를 실패로 알립니다.

## 블로그 카테고리 소개

카테고리 목록(`/:category`) 머리글의 소개는 첫 화면 앱 카드와 같은 두 줄을 `src/constants/appIntros.js`에서 함께 씁니다.
첫 화면에 카드가 없는 M365·Word·PowerPoint·OneDrive는 `docsMeta.js`에 적은 한 문장을 씁니다.

## 블로그 카드 썸네일

블로그 카드(`DocsPostCard`)는 글 주소 `/<category>/<slug>`에 맞는 UI 미니어처 이미지가
`src/assets/post-thumbs/<category>/<slug>-480.webp`, `-960.webp`에 있으면 그 이미지를 쓰고,
없으면 관리자에서 올린 썸네일을 씁니다. 화면에서만 바꾸므로 서버 데이터와 OG·공유 미리보기 이미지는 그대로입니다.
새 글에 적용하려면 같은 이름 규칙으로 16:9 WebP 두 장(480×270, 960×540)을 추가합니다.
`<category>`는 글 주소의 화면 카테고리입니다(예: Copilot Studio에서 나뉜 GitHub·Azure 글은 `github`, `azure`).

## 회귀 검증

```bash
npm test
npm run check:seo
npm run test:chunk-recovery
npm run test:build-id
npm run test:post-detail-enhancement
```

Vitest와 jsdom은 개발 의존성입니다. 테스트는 실제 React 화면과 API 클라이언트를 실행하되
`fetch`와 시간을 모의하여 무응답, 본문 정체, 취소 경쟁, 재시도, 페이지/검색/카테고리와 상세 진입,
블로그 사이드바의 이동 경로와 앱 아이콘, 카드 썸네일 선택을 검증합니다.
실제 VPN on/off 또는 기업 네트워크 정책을 검증하는 테스트는 아닙니다.
`Repository checks` PR 워크플로는 외부 API·비밀값 없이 Web·Admin·Server의
회귀 검증과 프런트엔드 빌드를 실행합니다.

전체 소스 회귀는 `npm run test:source`로 실행합니다. 활동 영상의 실패 표시/재시도,
월말 달력 이동, 챗 진입 시 연결·대화 보존, SEO 빌드의 필수 수집 오류도 검증합니다.

## 웹챗 연결과 가독성

사이트 진입 시 WebChat 모듈 다운로드와 `VITE_BOT_TOKEN_ENDPOINT`의 토큰 요청을
병렬로 시작하고, 준비되는 즉시 숨겨진 WebChat을 마운트하여 실제 Direct Line 연결을 시작합니다.
홈뿐 아니라 `/all` 등 직접 진입에서도 동일합니다. 클릭·hover·idle callback을 기다리지 않으며,
페이지 라우팅과 첫 렌더링은 모듈·토큰·연결 응답을 기다리지 않습니다.
**채팅을 열지 않아도 네트워크를 사용하는 의도적인 변경**입니다. SDK는 여전히 별도 비동기 청크이며,
다운로드 크기나 실제 네트워크 지연을 없애는 방식은 아닙니다.

토큰 주소는 Elevate API의 `GET /api/public/chat-token`입니다
(예: `VITE_BOT_TOKEN_ENDPOINT=https://<elevate-api-host>/api/public/chat-token`).
서버가 앱 설정 `DIRECT_LINE_SECRET`(Copilot Studio Direct Line 비밀값)으로 토큰을 발급받아
`{ "token": "..." }`만 돌려주므로 비밀값은 브라우저와 저장소에 두지 않습니다.
응답은 `Cache-Control: no-store`이고 Direct Line 호출은 8초로 제한합니다.
설정이 없으면 503, Direct Line 오류는 502, 시간 초과는 504로 답합니다. 오류 응답 본문에는 상태 이름(`code`)과
일반 메시지, `correlationId`만 담고, 원인은 서버 로그에 Direct Line 상태 코드로만 남깁니다.

창은 처음에는 닫혀 있습니다. 열기/닫기는 표시만 바꾸며 같은 연결과 대화 store를 유지합니다.
라우트 이동도 세션을 유지하고, `/elevathon`에서는 기존처럼 버튼과 창만 숨깁니다.
페이지 새로고침이나 탭 종료를 넘어서 기록을 저장하지 않으며, 토큰을 브라우저 저장소에 남기지 않습니다.
헤더·본문·메시지·입력창·하단 안내는 불투명한 밝은 표면을 사용하고 글자/패널 wrapper의
opacity로 투명도를 조절하지 않습니다.

헤더와 버튼의 상태 표시는 실제 SDK 연결 상태를 따릅니다. 연결 전에는 입력을 비활성화하고,
연결 후 첫 봇 인사가 늦더라도 입력창을 무기한 로딩 화면으로 가리지 않습니다.
기존 `startConversation` 이벤트는 대화 ID마다 한 번만 보내며 사용자 메시지를 자동으로 보내지 않습니다.

- 토큰 응답·본문은 15초, 모듈 준비와 연결 시작은 각각 30초로 제한합니다.
  실패는 채팅 안에 표시하고, 중복 재시도는 합치며 자동 재시도 루프를 추가하지 않습니다.
- SDK의 15분 주기 토큰 갱신은 창을 닫아도 유지합니다. 탭을 15분 이상 숨겼다가 돌아오면
  최신 토큰·대화 ID·watermark·사용자 ID로 같은 대화를 재확인합니다.
- 복구 가능한 연결 실패의 **다시 연결**도 같은 대화를 재사용합니다.
  만료/종료됐거나 기존 대화 복구가 불가능하면 사용자가 **새 대화로 연결**을 선택합니다.
  이때 이전 화면 기록은 보존하지만 **봇의 새 대화 문맥으로 시작**합니다.
  현재 토큰 엔드포인트가 만료된 특정 대화를 복구한다고 가정하지 않습니다.
- 해제 시 토큰 요청, SDK 연결·구독·타이머를 정리하고 늦은 응답은 무시합니다.
  React StrictMode의 effect 재실행은 실제 구독 시작 전 microtask에서 합쳐 중복 연결이나
  SDK가 `Connecting`에 머무는 취소 경쟁을 방지합니다. 모듈/SDK 렌더 오류도 페이지 전체로 전파하지 않습니다.

관련 회귀는 다음 명령으로 따로 실행할 수 있습니다.

```bash
npm test -- tests/chat-widget.test.jsx tests/webchat-module.test.js
```

느린 토큰/연결, 첫 클릭 전 요청, 준비된 연결 재사용, 라우트·취소·만료·명시적 재시도,
SDK/청크 실패 격리 및 불투명한 표면을 모의로 검증합니다.
실제 SDK를 사용한 로컬 브라우저 지연·화면 확인 근거와 한계는
비공개 레포 `oneot/elevate-infra`의 모더나이즈 문서("웹챗 후속 개선 (2026-10-18)")를 참고하세요.

## 활동 영상과 SEO 빌드

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

개발·검증 시작점은 [루트 README](../README.md)입니다.
개발 기준, 변경 기록(모더나이즈), 배포·운영 런북, 아키텍처·정책 문서와 인프라(Bicep)는
비공개 레포 `oneot/elevate-infra`에서 관리하며, 운영 구성을 코드만으로 추정하지 않습니다.
