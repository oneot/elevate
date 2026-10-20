# Deployment and Incident Runbook

## 빌드·PR 검증 경계

개발·Actions 빌드의 Node 버전은 루트 `.nvmrc`의 22.x를 사용한다.
Web과 Admin은 각각의 잠금 파일로 `npm ci --legacy-peer-deps`를 실행한다.
`Repository checks`는 `main`, `develop`, `admin` 대상 PR에서 Web/Admin/Server의
로컬 회귀 검증을 수행한다. 운영 API·MSAL·SAS 비밀값이 필요한 테스트가 아니다.

`main` → GitHub Pages와 `admin` → Azure Static Web Apps 배포 경계는 유지한다.
이 변경은 Azure Functions의 실배포 Node 버전이나 GitHub/Azure 설정을 변경하지 않는다.
Server 배포 자동화는 현재 저장소에서 확인되지 않았으므로 별도 운영 확인이 필요하다.

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
4. 썸네일: 테스트 글을 '게시'로 저장해도 관리자는 썸네일을 만들지 않는다(요청에 `thumbnail` 없음). 저장하면 Actions에 `Post thumbnails on save`
   실행이 생기고, 마지막 저장 10분 뒤 `Post thumbnails`가 시작돼 보통 15~20분 안에 그 글의 썸네일 PR이 열린다(아래 '게시글 썸네일 자동 생성').
   게시한 글은 공개 사이트에 바로 보이므로 확인 후 보관으로 바꾸거나 삭제한다.
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

## 게시글 썸네일 자동 생성

관리자에서 글을 '게시' 상태로 저장(새 글·수정)하면 서버가 `.github/workflows/post-thumbnails-on-save.yml`을 실행한다.
이 workflow는 마지막 저장 뒤 10분(저장소 변수 `THUMBNAIL_WAIT_MINUTES`) 동안 다시 저장이 없으면 `.github/workflows/post-thumbnails.yml`을 실행하고,
그 사이 다시 저장하면 기다리던 실행을 취소한다. 정기 실행은 없다. 글이 없는 동안에는 아무것도 돌지 않고,
공개 저장소에서 60일 동안 커밋이 없으면 예약 실행이 자동으로 꺼지는 문제도 없다.
대상이 없으면 확인만 하고 약 30초 만에 끝나며 AI를 부르지 않는다. 게시 후 PR이 열리기까지 보통 15~20분, 병합 후 반영까지 약 5분이다.
새 글과, 이미지를 그린 뒤 제목·요약·본문이 바뀐 글(`tools/post-thumbs/sources/`의 내용 지문과 비교)이 대상이다.
GitHub Copilot CLI가 글 본문 전체를 읽고 'UI 미니어처' 키트(`tools/post-thumbs`)로 장면을 설계·렌더·검수한 뒤,
별도 job이 결과를 검사해 PR(라벨 `thumbnail`)로 올린다. 사람이 PR을 병합하면 공개 사이트와 관리자에 반영된다.
구조와 로컬 사용법은 `tools/post-thumbs/README.md`에 있다.

| 상황 | 조치 |
| --- | --- |
| 처음 켤 때 | ① Settings → Actions → General → Workflow permissions에서 "Allow GitHub Actions to create and approve pull requests"를 켠다. 꺼져 있으면 브랜치만 올라가고 실패 이슈에 PR 만들기 링크가 남는다. ② 서버 토큰: fine-grained 토큰(`oneot/elevate`만, Repository permissions는 Actions: Read and write만, 만료일 지정)을 만들어 Function App `func-elv-server-ep-dev` 앱 설정 `THUMBNAIL_DISPATCH_TOKEN`에 넣는다(`rg-elv-dev` ReadOnly 잠금은 잠시 풀고 바로 다시 건다). ③ 이 설정을 읽는 서버 코드(`services/thumbnailTrigger.js`)가 배포됐는지 확인한다. 만드는 방법은 `tools/post-thumbs/README.md`의 '필요한 설정' |
| 토큰 갱신 | 만료 전에 새 토큰을 만들어 `THUMBNAIL_DISPATCH_TOKEN`을 바꾼다. 게시 글을 저장해 `Post thumbnails on save` 실행이 생기면 된다. 만료되면 저장은 되지만 Function App 로그에 `[thumbnailTrigger] dispatch failed ... HTTP 401`이 남는다 |
| 썸네일 확인 | PR 본문의 이미지와 AI 설명을 보고 병합한다. 병합 뒤 `Deploy to GitHub Pages`와 `Sync post thumbnails to admin`(→ 관리자 배포)이 돈다 |
| 다시 만들기 | Actions → Post thumbnails → Run workflow에 `key`(`<앱>/<slug>`)와 `feedback`을 넣는다. 열린 PR은 새 이미지로 바뀐다 |
| 쓰지 않기 | PR을 닫는다. 같은 내용으로는 자동으로 다시 만들지 않고, 글이 다시 바뀌면 새 버전을 만든다 |
| 글 수정 | 제목·요약·본문을 고쳐 저장하면 10분 뒤 실행이 '썸네일 새 버전' PR(지금 이미지와 새 이미지 비교)을 연다. 병합 전까지는 지금 이미지가 보인다. 게시 상태 변경·내용 없는 저장은 대상이 아니다 |
| 실패 | `썸네일 자동 생성 실패: <key>` 이슈(라벨 `thumbnail-failed`)와 실행 아티팩트 `log-<앱>__<slug>`(Copilot 작업 기록·렌더 이미지)를 본다. 이슈를 닫은 뒤 아무 글이나 '게시'로 저장하거나 수동 실행하면 다시 시도한다 |
| 비용 | Actions 쪽 비밀값 없이 `GITHUB_TOKEN`(`copilot-requests: write`)으로 Copilot CLI를 쓰며, 개인 소유 저장소라 저장소 소유자의 Copilot 이용량에서 차감된다. 모델은 Claude Opus 5.5(저장소 변수 `THUMBNAIL_MODEL`로 변경)이고, 첫 실행 기준 글 하나에 2~3분, AI 크레딧 약 65~125(본문 길이에 따라)였다. 한 번에 최대 2개 글, 대상이 없으면 AI를 부르지 않는다. Actions 시간은 공개 저장소라 무료다 |
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
