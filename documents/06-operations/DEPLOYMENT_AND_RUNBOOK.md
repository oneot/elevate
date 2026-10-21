# Deployment and Incident Runbook

## 빌드·PR 검증 경계

개발·Actions 빌드의 Node 버전은 루트 `.nvmrc`의 22.x를 사용한다.
Web과 Admin은 각각의 잠금 파일로 `npm ci --legacy-peer-deps`를 실행한다.
`Repository checks`는 `main`, `develop`, `admin` 대상 PR에서 Web/Admin/Server의
로컬 회귀 검증을 수행한다. 운영 API·MSAL·SAS 비밀값이 필요한 테스트가 아니다.

`main` → GitHub Pages와 `admin` → Azure Static Web Apps 배포 경계는 유지한다.
이 변경은 Azure Functions의 실배포 Node 버전이나 GitHub/Azure 설정을 변경하지 않는다.
Server 배포 자동화는 저장소에 없다. 수동 배포 방법과 현재 운영 버전은 아래 '서버(Function App) 배포'에 기록한다.

### 배포 전 실패를 확인할 항목

- Web 배포의 `REQUIRE_API_ROUTES=true`는 필수 SEO 메타데이터 수집을 뜻한다.
  API 실패·응답 페이지 정보 오류·기존 20페이지 한도 초과 시 이제 배포 빌드가 실패한다.
  오류를 숨겨 성공한 것처럼 배포하지 말고 API 응답과 페이지 한도를 확인한다.
  생성 대상은 기존 SEO shell이며, 본문·이미지 정적 스냅샷이 아니다.
- Admin은 Vite 빌드 후 `npm run check:bundle`이 기본 목록의 정적 JavaScript
  의존성 합계와 편집기 분리를 검사한다. 600 KiB 초과 또는 Tiptap 즉시 로딩이면
  실패한다. 번들 경고를 숨기거나 한도만 높이기 전에 manifest의 import 경로를 확인한다.
- 모의 API/루프백 fixture/로컬 번들 성공과 실제 운영 로그인·게시·업로드·삭제,
  CORS 및 VPN 검증 결과는 분리해 기록한다.

분석 범위·실제 수정·미검증 항목은
[모더나이즈 문서](../04-application/MODERNIZATION.md)에 기록한다.

## HTTP / VPN 접속 장애

운영 코드는 `main` push를 배포하는 `.github/workflows/deploy.yml`과
`Elevate.Web`을 기준으로 확인한다. 이 절차는 공개 게시글 경로에 한정하며,
누락된 정책 문서나 `infra/`의 운영 구성을 추정해 복구하지 않는다.

### 확인된 원인과 아직 확인하지 못한 범위

2026-10-18 운영 진단에서 다음을 구분했다. 이 기록은 당시의 관찰이며 이후 운영 상태를 보장하지 않는다.

| 경로 / 조건 | 관찰 | 해석 / 조치 |
| --- | --- | --- |
| HTTP 운영 Origin → 공개 API | API는 200이지만 HTTP Origin용 `Access-Control-Allow-Origin`은 없었다. HTTPS Origin은 허용됐다. | 브라우저가 HTTP 페이지에서 API 응답을 읽을 수 없는 조건이다. HTTP를 CORS에 추가하지 말고 HTTPS로 이동한다. |
| GitHub Pages HTTPS 강제 | 승인 후 `https_enforced=true`. `/`에 이어 11:02 KST에는 `/all`도 301 → 동일 경로 HTTPS 200으로 확인했다. | 설정 반영 전 캐시된 HTTP 200과 현재 설정을 구분한다. |
| 실제 VPN OFF | 운영 `/all`의 게시글 표시 및 공개 API JSON 응답을 확인했다. | 기존 API·화면은 일반 경로에서 정상 동작했다. |
| 실제 VPN ON | 사이트 HTML은 200. 같은 공개 API의 DNS 결과는 OFF와 동일했지만, VPN 경유 TCP 연결은 8초 제한 내 성립하지 않았다. TLS/HTTP 응답도 없었다. | DNS 변경이나 CORS 차단으로 단정할 근거가 없다. VPN 경로, 송출 정책 또는 상위망 상태 확인이 필요하다. |
| 기존 프런트엔드 | `apiFetch`가 무기한 대기하고, 공유 카테고리 요청이 대기 상태를 재사용했다. 일부 오류는 빈 목록·404로 바뀌었다. | 연결 장애가 무한 스켈레톤으로 증폭됐다. 시간 제한·취소·명시적 실패/재시도를 적용한다. |

코드 패치는 무기한 대기와 잘못된 오류 표시를 해결하지만 **VPN에서 API 콘텐츠 접근을 복원하지는 않는다.**
VPN 정책/상위망 중 어느 설정이 실제 원인인지는 아직 확정되지 않았다.
정적 GitHub Pages에는 서버 측 `/api` 프록시가 없다. 같은 목적지의 별칭, `no-cors`,
클라이언트의 DNS 변경 또는 비검증 공개 프록시는 해결책으로 사용하지 않는다.
빌드 시점 콘텐츠 복제는 최신성·삭제 반영·이미지 SAS 만료를 바꾸므로 자동 도입하지 않는다.
새 게이트웨이·호스팅·도메인·Azure 설정 변경은 별도 승인과 배포 계획이 필요하다.

### 클라이언트 동작

- 운영 호스트의 HTTP 진입을 HTML 초기 스크립트에서 HTTPS로 이동하며 경로·쿼리·해시를 유지한다.
  이는 Pages의 서버 측 HTTPS 강제를 대체하지 않는다. 이전에 캐시된 HTML에는 새 보호 코드가 없을 수 있다.
- 공개 API의 **각 HTTP 요청**은 본문 읽기와 자동 재시도를 합쳐 15초 제한이다.
  GET 네트워크 오류·502/503/504만 300ms 후 한 번 재시도한다. 429는 자동 재시도하지 않는다.
- 목록·상세·최신 글·행사 일정은 라우트/요청 소유권이 바뀌면 취소하고 이전 결과를 숨긴다.
  실제 404와 연결/서버 오류를 구분한다. 실패 화면의 재시도는 현재 필터·페이지를 유지한다.
- 카테고리 캐시는 성공한 결과만 60초간 유지한다. 100개를 넘는 목록은 모든 페이지를 조회한다.
  공유 요청은 소비자별로 취소되며 마지막 소비자가 떠나면 네트워크 요청도 취소한다.
  오류·만료된 콘텐츠를 정상 빈 목록이나 오프라인 결과로 대체하지 않는다.
- 보조 사이드바·행사 일정의 실패는 본문과 분리해 표시한다. 본문 실패 후 전체 카테고리 선조회는 시작하지 않는다.

### 재현 및 운영 조치

1. 사용자가 승인하고 직접 선택한 VPN 연결 상태와 관찰 시각을 먼저 기록한다.
   기기의 VPN, DNS, 라우팅, 인증서 검사나 보안 정책을 임의 변경하지 않는다.
2. 브라우저 개발자 도구에서 실제 게시글 요청 URL을 확인한다. HTML 200만으로 콘텐츠 성공을 판단하지 않는다.
   HTTP 진입은 리다이렉트 후 HTTPS Origin인지 확인한다.
3. VPN OFF/ON 각각에서 같은 HTTPS 페이지와 공개 API 요청을 비교한다.
   DNS, TCP, TLS, HTTP 응답 단계와 브라우저 Console/Network를 나눠 기록한다.
   `curl`은 브라우저 CORS를 강제하지 않으므로 200만으로 CORS 성공을 판단하지 않는다.
4. VPN ON에서 TCP가 성립하지 않으면 네트워크 담당자에게 목적 공개 API 호스트,
   발생 시각, 단계별 실패 증거를 전달하고 기존 허용 경로·송출 정책·상위망 상태를 확인하도록 요청한다.
   내부 주소, DNS 서버, 전체 라우팅 목록과 원본 VPN 스크린샷은 비공개 지원 채널에만 보관한다.
5. 네트워크 조치 후 동일 VPN ON 상태에서 목록·검색·다음 페이지·상세와 이미지 접근을 확인한다.
   API가 회복된 뒤 화면의 **다시 시도**로 실제 콘텐츠가 표시되는지 확인한다.
   이 검증이 끝나기 전에는 VPN 게시글 문제가 완전히 해결됐다고 보고하지 않는다.

브라우저에서 확인한 공개 API 주소만 입력하여 읽기 전용으로 측정할 수 있다.
인증 토큰, SAS 쿼리, 내부 호스트 또는 비밀값을 명령/공개 로그에 넣지 않는다.

```bash
PUBLIC_POSTS_URL='https://<public-api-host>/api/public/posts?limit=12'
curl --silent --show-error --output /dev/null --connect-timeout 8 --max-time 20 \
  --header 'Origin: https://microsoft-elevate.com' \
  --write-out 'http=%{http_code} dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} total=%{time_total}\n' \
  "$PUBLIC_POSTS_URL"
```

`npm test`는 네트워크와 시간을 모의한 회귀 검증이다. 실제 VPN 상태 비교나 운영 접근 복원 검증을 대체하지 않는다.
이 절차를 수정할 때에는 실제 측정과 모의 결과를 따로 기록한다.

## 관리자 배포와 도메인

관리자(`Elevate.Admin`)는 같은 빌드를 두 호스트에서 서비스한다.

| 호스트 | 용도 |
| --- | --- |
| `https://admin.microsoft-elevate.com` | 사용자 지정 도메인 (DNS: GoDaddy, Static Web Apps 사용자 지정 도메인) |
| `https://white-sea-0567ed600.4.azurestaticapps.net` | Static Web Apps 기본 호스트 |

### 배포 절차

1. Admin 변경을 `main`에 병합한다.
2. `main`을 `admin` 브랜치에 병합해 push하면 `.github/workflows/deploy-admin-azure-swa.yml`이 빌드·번들 예산 검사 후 배포한다.
   `admin`은 `main`보다 뒤처질 수 있으므로 병합 전 차이를 확인한다. 이 workflow는 `Elevate.Admin/**`,
   공개 사이트 정적 썸네일(`Elevate.Web/src/assets/post-thumbs/**`), 공개 사이트 화면용 제목·요약
   (`Elevate.Web/src/constants/postText.js`) 변경 때 실행된다. 뒤의 두 파일은 관리자 빌드에 함께 들어간다.
   AI 썸네일 PR이 `main`에 병합되면 `.github/workflows/sync-admin-thumbnails.yml`이 `admin` 브랜치에 이미지 폴더만 맞추고
   관리자 배포를 직접 실행한다(`main`의 다른 변경은 가져오지 않는다).
3. 빌드 값은 GitHub secrets에서 주입한다: `ADMIN_VITE_API_BASE_URL`, `ADMIN_VITE_AZURE_AD_CLIENT_ID`,
   `ADMIN_VITE_AZURE_AD_AUTHORITY`, `ADMIN_VITE_AZURE_AD_API_SCOPE`, `ADMIN_VITE_AZURE_AD_REDIRECT_URI`,
   `AZURE_STATIC_WEB_APPS_API_TOKEN_ADMIN`.
   `ADMIN_VITE_AZURE_AD_REDIRECT_URI`는 같은 호스트에서만 쓰이는 선택 값이다. 앱은 현재 origin을 기본으로 쓴다.

### 인증·CORS 전제 (2026-10-20 코디네이터 확인)

- Entra 앱 등록의 SPA 리디렉션 URI: 두 호스트의 origin을 끝 슬래시 있는 형태와 없는 형태로 모두 등록했다.
  앱은 끝 슬래시 없는 현재 origin을 보낸다(예: `https://admin.microsoft-elevate.com`).
- Function App CORS에 `https://admin.microsoft-elevate.com`을 추가했다. 기본 호스트 origin도 유지한다.
- Storage(`stelvdevimiruajbu5bya`) Blob 서비스 CORS에도 `https://admin.microsoft-elevate.com`을 추가했다(2026-10-20 17:2x).
  본문 이미지·첨부는 브라우저가 사용자 위임 SAS로 Blob에 바로 PUT하므로 이 설정이 없으면 업로드만 실패한다.
  - 규칙 1개: 메서드 `OPTIONS, PUT, GET, HEAD`, 허용 헤더 `content-type, x-ms-blob-type, x-ms-version, authorization, x-ms-*`,
    노출 헤더 `etag, last-modified, x-ms-*`, Max-Age 3600초
  - 허용 origin: `https://white-sea-0567ed600.4.azurestaticapps.net`, `http://localhost:5173`, `https://admin.microsoft-elevate.com`
  - 확인: 관리자 origin에서 `PUT` preflight(헤더 `content-type,x-ms-blob-cache-control,x-ms-blob-type`)가 200이고
    `Access-Control-Allow-Origin`이 그 origin이어야 한다. 목록에 없는 origin은 403이다.
- `rg-elv-dev`에는 ReadOnly 잠금이 있다. 관리자 호스트를 추가하는 등 Function App·Storage CORS를 바꿀 때는
  잠금을 잠시 풀고, 기존 규칙에 origin만 더한 뒤 바로 ReadOnly로 다시 건다.
- MSAL 캐시는 `sessionStorage`이므로 두 호스트의 로그인 상태는 공유되지 않는다. 호스트마다 한 번씩 로그인한다.

### 배포 후 확인

두 호스트에서 각각 다음을 확인한다. 테스트 글은 보관 상태로 만들고 확인 후 삭제한다.

1. 접속 → Microsoft 로그인 → 같은 호스트로 돌아와 `전체 게시글`과 13개 앱 개수가 표시된다.
   브라우저 탭 아이콘이 오리 이미지이고, 앱 목록 카드 썸네일이 공개 사이트 같은 앱 목록의 카드 이미지와 같다.
   탭 제목은 `Admin | Microsoft Elevate`다. 각 앱 목록의 제목·요약·순서(게시일 최신순)가 공개 사이트 같은 앱 목록과 같다.
2. Word와 GitHub에서 새 글을 보관 상태로 저장하면 각 앱 목록의 '보관' 필터에 나타난다
   (저장 category `m365`·`copilot-studio`, 태그 `word`·`github`, slug는 서버가 제목으로 생성).
3. 기존 글 편집 저장, 본문 이미지·첨부 업로드가 동작한다. 기존 글의 썸네일·slug·태그·시리즈는 바뀌지 않는다.
   편집 화면의 썸네일 미리보기가 공개 사이트 카드 이미지와 같다.
4. 썸네일·요약: 테스트 글을 '게시'로 저장해도 관리자는 썸네일과 요약을 만들지 않는다(요청에 `thumbnail`·`excerpt` 없음). 저장하면 Actions에 `Post thumbnails on save`
   실행이 생긴다. 마지막 저장 10분 뒤 `Post thumbnails`가 시작돼 AI가 요약 한 줄을 게시글에 기재하고(보통 15~20분), 썸네일 PR을 연다.
   Repository checks를 통과하면 자동으로 병합·배포해, 보통 25분 안팎에 공개 사이트와 관리자 카드에 썸네일이 보인다(아래 '게시글 썸네일 자동 생성').
   게시한 글은 공개 사이트에 바로 보이므로 확인 후 보관으로 바꾸거나 삭제한다. 테스트 글의 썸네일도 자동으로 병합되므로,
   필요 없으면 글을 먼저 보관·삭제한 뒤 병합 커밋을 되돌린다(글이 게시된 채로 이미지만 지우면 다시 만든다).
5. 첨부파일을 올리고 '링크 복사' 후 본문에 붙여 넣으면 파일 이름으로 된 링크가 들어간다. 게시 후 공개 사이트에서 그 링크로 원래 파일 이름으로 내려받아진다.
6. 로그아웃하면 같은 호스트로 돌아와 '로그아웃되었습니다' 안내와 '다시 로그인' 버튼이 보인다.

| 증상 | 확인할 것 |
| --- | --- |
| `AADSTS50011` | 로그인 요청의 `redirect_uri`와 Entra SPA 리디렉션 URI가 끝 슬래시까지 같은지 |
| 로그인 후 다른 호스트로 이동 | 배포 산출물이 이번 변경 이후 빌드인지 (이전 빌드는 secret 주소로 고정) |
| 목록에서 CORS 오류 | Function App CORS에 접속한 origin이 있는지 |
| 이미지·첨부 업로드 실패 (콘솔에 Blob CORS 오류) | Storage Blob CORS 허용 origin에 접속한 관리자 호스트가 있는지 (위 '인증·CORS 전제') |
| 목록 순서가 공개 사이트 앱 목록과 다름 | 브라우저 콘솔의 `[AdminPostsProvider] 공개 사이트 시리즈 순서 조회 실패`. 공개 API `GET /api/public/series` 응답과 Function App CORS. 받지 못해도 목록은 게시일순이며 같은 시각 글만 순서가 달라진다. 공개 사이트 '전체 게시글'은 같은 시각 글을 데이터베이스 순서로 보여 주므로 그 부분은 원래 다를 수 있다 |
| 목록 카드가 썸네일 대신 유리 타일 | 정적 썸네일이 없는 글이면 상세 조회(`GET /api/admin/posts/{id}`) 응답의 `thumbnail.variants`와 Blob 읽기. 공개 사이트 정적 썸네일을 새로 넣었다면 Admin이 다시 배포됐는지 |
| 게시했는데 썸네일 PR이 오지 않음 | 저장 때마다 Actions에 `Post thumbnails on save` 실행이 생기는지 본다. 없으면 Function App 로그의 `[thumbnailTrigger]` 경고(HTTP 401·403은 토큰 만료·권한)와 앱 설정 `THUMBNAIL_DISPATCH_TOKEN`. 있으면 이어진 `Post thumbnails` 실행 기록(plan 출력), `thumbnail-failed` 이슈, 브랜치 `thumbnail/<앱>/<slug>`가 이미 있는지 (아래 표) |
| 썸네일 PR이 열렸는데 병합되지 않음 | PR의 라벨 `thumbnail-merge-blocked`와 댓글(이유, 검사 링크). `Post thumbnails` 실행의 merge job 요약. 저장소 변수 `THUMBNAIL_AUTO_MERGE`가 `false`인지 (아래 표) |
| 병합됐는데 사이트에 썸네일이 없음 | merge job이 실행한 `Deploy to GitHub Pages`, `Sync post thumbnails to admin` → `Deploy Elevate.Admin To Azure Static Web Apps` 실행 결과 |
| 게시했는데 요약이 비어 있음 | `Post thumbnails` 실행 요약과 PR 본문의 '요약(AI)' 줄. 404면 서버가 automation 입구가 있는 코드로 배포됐는지, 401·403이면 Function App 로그의 `[automationAuth]` 경고(audience·저장소·브랜치·workflow claim), 409면 그 사이 저장돼 다음 실행이 다시 쓴다 (아래 '게시글 썸네일 자동 생성') |

## 서버(Function App) 배포

서버(`Elevate.Server`)는 저장소 workflow로 배포하지 않고, 운영자가 Azure CLI로 직접 배포한다.

| 항목 | 값 |
| --- | --- |
| 대상 | Function App `func-elv-server-ep-dev` (리소스 그룹 `rg-elv-dev`, ReadOnly 잠금) |
| 방법 | `az functionapp deployment source config-zip --build-remote` (원격 빌드, 패키지에서 실행). 잠금을 잠시 풀고 배포한 뒤 바로 다시 건다 |
| 현재 운영 | `main` 5eb21e8 (2026-10-21 00:29 KST 배포, 패키지 `20261020152852.zip`). 이전 운영은 a501460 (2026-08-21) |
| 되돌리기 | 이전 패키지 `20260820181540.zip`이 `SitePackages`에 남아 있다. `packagename.txt`를 그 이름으로 바꾸고 재시작한다(잠금 해제 필요) |

### 2026-10-21 배포 기록 (코디네이터 수행)

- 이번 배포로 10-18 모더나이즈(24a6c2b)의 서버 변경이 처음 운영에 나갔다.
  - 본문 Blob 주소 서명 처리를 `services/postContent.js`로 통합했다.
  - 잘못된 JSON 요청을 400으로 응답한다.
  - 숫자가 아닌 파라미터는 400으로 거절한다(예: `limit=3x`, 의도된 변경).
- 저장 시 썸네일 작업 요청(`services/thumbnailTrigger.js`)도 함께 배포했다.
- 회귀 대조(SAS 서명을 뺀 비교): 공개 목록 190건, tags, activity-videos, calendar-events, 글 상세 163건이 배포 전과 같았다. 본문 이미지 서명과 읽기도 확인했다.
- 앱 설정 `THUMBNAIL_DISPATCH_TOKEN`을 추가했다. 값은 문서·저장소에 남기지 않는다.
  - GitHub fine-grained 토큰 이름은 `THUMBNAIL_DISPATCH_TOKEN`이다.
  - 소유자는 `oneot`, 대상 저장소는 `oneot/elevate` 하나다.
  - 권한은 Actions 읽기·쓰기와 Metadata 읽기만 있다.
  - **만료는 2027-10-20 0시(KST)다.** 그 전에 아래 '게시글 썸네일 자동 생성'의 '토큰 갱신' 절차로 교체한다.
- 저장 트리거 확인 범위
  - 확인함: 서버 코드로 GitHub 실행 요청을 보내 접수되는 것(확인용 실행은 취소).
  - 확인 안 함(2026-10-21 기준): 관리자에서 실제 글을 '게시'로 저장했을 때 실행이 생기는 것. 다음 실제 글 게시 때 확인한다.

### AI 요약 기재 입구 (automation)

`PUT /api/automation/posts/{id}/excerpt`는 관리자 로그인이 아니라 GitHub Actions OIDC 토큰으로 인증한다(`src/middleware/automationAuth.js`).
비밀값이 없고, 'Post thumbnails' publish job만 이 입구로 AI 요약을 게시글에 쓴다.

| 항목 | 값 |
| --- | --- |
| 받는 토큰 | 발급자 `https://token.actions.githubusercontent.com`, audience `api://elevate-post-automation`, `repository` `oneot/elevate`, `repository_id` `1125077519`, `ref` `refs/heads/main`, `workflow_ref` `oneot/elevate/.github/workflows/post-thumbnails.yml@refs/heads/main` |
| 쓰는 범위 | 게시된 글의 `excerpt` 한 칸과 `excerptSource`(`ai`)·`excerptGeneratedAt`·`excerptRunId`. `updatedAt`은 바꾸지 않는다 |
| 건너뜀 | AI가 읽은 뒤 저장된 글(요청의 `expectedUpdatedAt`과 다름)·읽고 쓰는 사이 저장된 글(Cosmos ETag 다름)·게시가 아닌 글은 409, 없는 글·slug가 다르면 404 |
| 앱 설정 | 기본값이 코드에 있어 설정할 것이 없다. 바꿀 때만 `AUTOMATION_OIDC_AUDIENCE`, `AUTOMATION_GITHUB_REPOSITORY`, `AUTOMATION_GITHUB_REPOSITORY_ID`, `AUTOMATION_GITHUB_WORKFLOW`, `AUTOMATION_GITHUB_REF` |
| 바깥 연결 | 토큰 서명을 확인하려고 GitHub 공개 키(`https://token.actions.githubusercontent.com/.well-known/jwks`)를 읽는다 |
| 배포 | 이 입구가 들어간 서버 코드를 배포해야 동작한다. 그 전에는 publish가 404를 받아 요약만 건너뛴다. **서버를 먼저 배포한 뒤 관리자를 배포한다**: 관리자에는 요약 칸이 없으므로, 관리자를 먼저 배포하면 그 사이 게시한 새 글은 요약이 빈 채로 남고 그 글을 다시 저장해야 채워진다 |

## 게시글 썸네일 자동 생성

관리자에서 글을 '게시' 상태로 저장(새 글·수정)하면 서버가 `.github/workflows/post-thumbnails-on-save.yml`을 실행한다.
이 workflow는 마지막 저장 뒤 10분(저장소 변수 `THUMBNAIL_WAIT_MINUTES`) 동안 다시 저장이 없으면 `.github/workflows/post-thumbnails.yml`을 실행하고,
그 사이 다시 저장하면 기다리던 실행을 취소한다. 정기 실행은 없다. 글이 없는 동안에는 아무것도 돌지 않고,
공개 저장소에서 60일 동안 커밋이 없으면 예약 실행이 자동으로 꺼지는 문제도 없다.
대상이 없으면 확인만 하고 약 30초 만에 끝나며 AI를 부르지 않는다. 게시 후 공개 사이트 카드에 보이기까지 보통 25분 안팎이다
(대기 10분, 생성·검사·병합 10분 안팎, 배포 몇 분).
새 글과, 이미지를 그린 뒤 제목·요약·본문이 바뀐 글(`tools/post-thumbs/sources/`의 내용 지문과 비교)이 대상이다.
GitHub Copilot CLI가 글 본문 전체를 읽고 'UI 미니어처' 키트(`tools/post-thumbs`)로 장면을 설계·렌더·검수하고, 같은 글의 요약 한 줄도 쓴다.
새 썸네일은 v3 플루이드 스킨(부드러운 3D 형태, 선명한 인접색, 앱 아이콘 타일)으로 그린다. 처음 공개된 80개는 v2 이미지 그대로다(`tools/post-thumbs/README.md`의 '디자인').
관리자에는 요약 입력 칸이 없다. publish job이 요약을 위 'AI 요약 기재 입구'로 게시글에 기재한 뒤(실패해도 썸네일은 진행),
결과를 검사해 PR(라벨 `thumbnail`)로 올린다. 버전 기록의 지문은 AI 요약으로 계산하므로, 요약을 기재한 글을 내용 없이 다시 저장해도 다시 만들지 않는다.
이어서 merge job이 사람 없이 병합한다.
- PR 브랜치에서 `Repository checks`(`web-checks.yml`)를 workflow_dispatch로 실행한다. GITHUB_TOKEN으로 만든 PR에는 pull_request 검사가 돌지 않기 때문이다.
- 검사가 통과하고 PR이 publish가 올린 커밋 그대로면 병합하고 브랜치를 지운다. 병합 요청에 커밋 SHA를 함께 보낸다.
- 하나라도 병합하면 `Deploy to GitHub Pages`와 `Sync post thumbnails to admin`을 직접 실행한다. GITHUB_TOKEN으로 병합한 커밋은 push 이벤트를 만들지 않기 때문이다.

검사 실패·시간 초과(30분), 브랜치 변경, 충돌이면 병합하지 않고 PR에 라벨 `thumbnail-merge-blocked`와 댓글을 남긴다.
검사가 실패하면 먼저 실패한 job만 한 번 다시 실행한다(`npm ci` 네트워크 끊김 같은 일시 오류 대비). 다시 실행해도 실패할 때만 병합을 멈춘다.
생성·검사(validate)에 실패한 글은 PR 없이 실패 이슈만 남으므로 병합 대상이 아니다.
`Post thumbnails`는 한 번에 하나씩만 돌고, 한 실행 안에서는 PR을 하나씩 병합한 뒤 배포를 한 번만 실행한다.
여러 실행이 이어지면 공개 사이트 배포는 `pages` 동시 실행 그룹에서 마지막 것만 끝까지 돈다. 관리자 동기화는 차례로 돌고 바뀐 것이 없으면 배포하지 않는다.
구조와 로컬 사용법은 `tools/post-thumbs/README.md`에 있다.

| 상황 | 조치 |
| --- | --- |
| 처음 켤 때 | ① Settings → Actions → General → Workflow permissions에서 "Allow GitHub Actions to create and approve pull requests"를 켠다. 꺼져 있으면 브랜치만 올라가고 실패 이슈에 PR 만들기 링크가 남는다. ② 서버 토큰: fine-grained 토큰(`oneot/elevate`만, Repository permissions는 Actions: Read and write만, 만료일 지정)을 만들어 Function App `func-elv-server-ep-dev` 앱 설정 `THUMBNAIL_DISPATCH_TOKEN`에 넣는다(`rg-elv-dev` ReadOnly 잠금은 잠시 풀고 바로 다시 건다). ③ 이 설정을 읽는 서버 코드(`services/thumbnailTrigger.js`)가 배포됐는지 확인한다. 만드는 방법은 `tools/post-thumbs/README.md`의 '필요한 설정' |
| 토큰 갱신 | 만료(2027-10-20 0시 KST) 전에 GitHub → Settings → Developer settings → Fine-grained tokens → `THUMBNAIL_DISPATCH_TOKEN` → **Regenerate token**으로 새 값을 만든다(권한은 그대로). 그 값으로 `THUMBNAIL_DISPATCH_TOKEN` 앱 설정을 바꾼다(`rg-elv-dev` 잠금 해제·복구, 값은 출력하지 않기). 게시 글을 저장해 `Post thumbnails on save` 실행이 생기면 된다. 만료되면 저장은 되지만 Function App 로그에 `[thumbnailTrigger] dispatch failed ... HTTP 401`이 남는다 |
| 썸네일 확인 | 할 일은 없다. 검사를 통과하면 자동으로 병합·배포된다. 결과는 병합된 PR(라벨 `thumbnail`)의 댓글과 `Post thumbnails` 실행 요약의 '자동 병합'에 남는다 |
| 병합되지 않은 PR | 라벨 `thumbnail-merge-blocked` PR의 댓글에서 이유와 검사 링크를 본다. 문제가 없으면 사람이 병합한다(push로 배포가 실행됨). 쓰지 않으려면 닫는다. 검사 실패 원인이 관리자 `check:bundle` 예산이면 썸네일 주소표 크기를 줄이는 코드 수정이 필요하다 |
| 다시 만들기 | Actions → Post thumbnails → Run workflow에 `key`(`<앱>/<slug>`)와 `feedback`을 넣는다. 열린 PR은 새 이미지로 바뀌고, 없으면 새 PR이 열린다. 어느 쪽이든 검사 후 자동으로 병합된다 |
| 병합된 썸네일 빼기 | 병합 커밋을 되돌리는(revert) PR을 올려 병합한다. 글이 게시된 채면 다음 실행이 다시 만들므로 먼저 글을 보관·삭제한다 |
| 기존 썸네일을 지금 디자인으로 | 스킨 변경만으로는 다시 만들지 않는다(글 지문·plan 규칙 그대로). 바꾸려면 Actions → **Redraw post thumbnails** → Run workflow(`keys` 비우면 사람이 그린 장면의 썸네일 전부, `limit` 비용 상한). 글마다 실패하면 한 번 더 그리고, 그래도 안 되면 지금 이미지를 둔 채 결과를 PR 하나로 모아 검사·병합·배포를 한 번씩 한다. AI 요약은 기재하지 않는다(`tools/post-thumbs/README.md` '한꺼번에 다시 그리기'). AI 없이 새 스킨만 입히려면 `node render.mjs export --cat <앱>`(지금 이미지 그대로는 `--skin v2`) |
| 자동 병합 끄기 | 저장소 변수 `THUMBNAIL_AUTO_MERGE`를 `false`로 둔다. PR까지만 열리고 사람이 병합한다(병합하면 배포는 push로 실행). 변수를 지우면 다시 자동이다 |
| 글 수정 | 제목·요약·본문을 고쳐 저장하면 10분 뒤 실행이 '썸네일 새 버전' PR(지금 이미지와 새 이미지 비교)을 열고, 검사 후 자동으로 병합한다. 병합·배포 전까지는 지금 이미지가 보인다. 게시 상태 변경·내용 없는 저장은 대상이 아니다 |
| 실패 | `썸네일 자동 생성 실패: <key>` 이슈(라벨 `thumbnail-failed`)와 실행 아티팩트 `log-<앱>__<slug>`(Copilot 작업 기록·렌더 이미지)를 본다. 이슈를 닫은 뒤 아무 글이나 '게시'로 저장하거나 수동 실행하면 다시 시도한다 |
| 비용 | Actions 쪽 비밀값 없이 `GITHUB_TOKEN`(`copilot-requests: write`)으로 Copilot CLI를 쓰며, 개인 소유 저장소라 저장소 소유자의 Copilot 이용량에서 차감된다. 모델은 Claude Opus 5.5(저장소 변수 `THUMBNAIL_MODEL`로 변경)이고, 첫 실행 기준 글 하나에 2~3분, AI 크레딧 약 65~125(본문 길이에 따라)였다. v3 디자인 샘플 5개(로컬, 같은 지시·모델)는 글 하나에 2.5~4분, 82~129 크레딧(1 크레딧 = $0.01)이었다. 한 번에 최대 2개 글, 대상이 없으면 AI를 부르지 않는다. Actions 시간은 공개 저장소라 무료다 |
| 멈추기 | Actions → Post thumbnails on save → Disable workflow(저장해도 시작하지 않음, 수동 실행은 됨). 서버 요청 자체를 멈추려면 `THUMBNAIL_DISPATCH_TOKEN`을 지운다 |

## GitHub Pages Smoke Test

After deploy, verify these routes return `HTTP 200` and reference existing assets:

- `https://microsoft-elevate.com/`
- `https://microsoft-elevate.com/m365`
- `https://microsoft-elevate.com/program-news`

Manual command:

```bash
base_url="${GITHUB_PAGES_PAGE_URL:-https://microsoft-elevate.com}"
base_url="${base_url%/}"

for route in / /m365 /program-news; do
  curl -sS -L -D - -o /tmp/elevate-route.html "${base_url}${route}" | sed -n '1,8p'
  grep -Eo '/assets/[^"]+\.(js|css)' /tmp/elevate-route.html | sort -u
done
```

Use the GitHub Pages deployment `page_url` as `GITHUB_PAGES_PAGE_URL` when validating a just-finished workflow run.

본문 스타일을 바꾼 배포 후에는 글 상세 한 곳(예: `https://microsoft-elevate.com/copilot-studio/copilotstudio`)에서
인라인 코드(흰 키캡), 인용(안내 아이콘이 있는 흰 카드), 코드 블록(점 3개가 있는 어두운 창)과 '코드 펼치기'·'복사' 버튼을 확인한다.
관리자 편집기는 같은 CSS 복사본(`Elevate.Admin/src/styles/post-content.css`)을 쓰므로 `admin` 배포 후 같은 모양이어야 한다.

## Intermittent `/m365` Failure Capture

Ask reporter for:

- 발생 시각과 timezone
- URL
- OS/browser/version
- 일반 창 또는 시크릿 모드 여부
- Console 첫 오류 1-2줄
- Network에서 실패한 `/assets/*.js` 또는 `/assets/*.css` URL과 status
- 화면에 표시된 build id

## First Response

1. Ask user to try hard reload.
2. Ask user to retry in incognito mode with extensions disabled.
3. Compare failing asset URL hash with current deployed HTML asset hashes.

## Rollback Criteria

Disable chunk auto-recovery if either condition happens:

- Normal users enter repeated reload loops.
- `chunk_load_failed` appears repeatedly for the same session after one reload.

Rollback patch:

```js
// Elevate.Web/src/main.jsx
// Remove or comment out startChunkLoadRecovery() while preserving ErrorBoundary fallback.
```

## Four-Week Hosting Decision

After four weeks, review:

- `chunk_load_failed` count and affected route distribution
- support tickets requiring manual hard reload
- smoke test failures after deploy

If stale asset failures remain material, evaluate Azure Static Web Apps for stronger routing and cache header control.
