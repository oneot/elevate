# Elevate.Admin

Microsoft Elevate 공개 블로그의 **앱별 게시글을 작성·편집**하는 관리자 SPA입니다.
React + Vite로 빌드하며, `admin` 브랜치 push 때 Azure Static Web Apps에 배포됩니다.

| 접속 주소 | 비고 |
| --- | --- |
| `https://admin.microsoft-elevate.com` | 사용자 지정 도메인 |
| `https://white-sea-0567ed600.4.azurestaticapps.net` | Static Web Apps 기본 호스트 (계속 동작) |

## 화면 흐름

디자인은 공개 사이트 블로그(`https://microsoft-elevate.com/all`, `Elevate.Web`의
`DocsShell`/`DocsHero`/`DocsList`)와 같은 구성입니다: 스크롤하면 사라지는 헤더,
상단에 붙는 문서 바(사이드바 토글·검색·저장 버튼), 왼쪽 앱 내비게이터(모바일은 드로어),
앱 색 히어로, 카드 그리드.

| 경로 | 화면 |
| --- | --- |
| `/` | `/apps/all`로 이동 |
| `/apps/all` | 전체 게시글 (13개 앱) |
| `/apps/:appKey` | 앱별 게시글. 상태 필터(`?status=published` 또는 `archived`), 검색(`?q=`), 페이지(`?page=`)는 주소에 남는다 |
| `/posts/new?app=:appKey` | 새 게시글. 앱을 고르면 서버 category와 앱 태그를 자동으로 맞춘다 |
| `/posts/:postId` | 게시글 편집·삭제 |
| `/category/:categoryId` | 이전 주소. `/apps/:categoryId`로 이동한다 |

제거한 기능: Sub category(Agenthon, Update, MEE, 행사 소식, 프로그램 소식) 목록·작성,
달력 이벤트 편집과 게시글 연결, Management(활동 영상) 목록·편집,
편집 화면의 slug·태그·시리즈(분류)·미디어(YouTube, 썸네일 업로드) 입력.
관리 대상이 아닌 category의 게시글을 주소로 열면 편집 양식 대신 안내만 보여 줍니다.
서버 API와 데이터, 공개 사이트 표시는 그대로입니다.

## 편집 화면

본문 편집기를 넓게 두고, 오른쪽 세로 열에 제목·요약, 게시 설정(앱·상태·썸네일), 첨부파일을 둡니다.
넓은 화면에서는 본문 상자의 아래 끝을 오른쪽 열(첨부파일 패널) 아래 끝에 맞추고, 넘치는 본문은 편집기 안에서 스크롤합니다.
좁은 화면에서는 제목·요약 → 본문 → 게시 설정 순으로 쌓입니다.

본문은 공개 사이트 글 상세와 같은 모양으로 보입니다. 공개 사이트와 같은 클래스(`edoc-article` 안의
`prose prose-slate max-w-none post-content`)를 쓰고, 본문 CSS는 Web 원본(`Elevate.Web/src/index.css`의 `.prose`,
`src/styles/elevate-docs.css`의 `.edoc-article .prose`)을 그대로 옮긴 `src/styles/post-content.css`를 씁니다.
인라인 코드는 흰 키캡, 인용은 안내 아이콘(i)이 있는 흰 카드, 코드 블록은 점 3개가 있는 어두운 창으로 구분됩니다.
`post-content.css`는 직접 고치지 않습니다. Web 원본을 고친 뒤 `npm run sync:post-content`로 다시 만들고,
`tests/post-content-style.test.js`가 원본과 같은지 검사합니다. 편집기에만 필요한 보정(이미지 크기 조절, 코드 블록 감싸개 여백)은
`scripts/sync-post-content-css.mjs`의 4번 영역에 있습니다.

| 항목 | 동작 |
| --- | --- |
| 상태 | **게시**(공개)와 **보관**(비공개) 두 가지. 새 글의 기본값은 보관이며 서버에는 `archived`로 저장합니다. 서버의 `draft` 글은 보관으로 보이고, 보관을 유지하면 `draft` 그대로 둡니다 |
| slug | 입력하지 않습니다. 새 글을 만들 때 서버가 제목으로 만듭니다(영문·숫자만 사용, 없으면 `post`, 겹치면 `-2`, `-3` …). 저장 후에는 바뀌지 않습니다 |
| 태그·시리즈 | 편집하지 않습니다. 새 글에는 앱 태그만 자동으로 붙고, 기존 글의 태그·시리즈는 수정 요청에 보내지 않아 그대로 남습니다 |
| 썸네일 | 직접 올리지 않습니다. 아래 자동 썸네일이 처음 게시할 때 한 번 만들고, 편집 화면에서는 공개 카드에 표시되는 이미지를 미리보기로만 보여 줍니다. 썸네일이 아직 없으면 칸을 보여 주지 않습니다 |
| 첨부파일 | '링크 복사' 후 본문에 붙여 넣으면 파일 이름이 링크 글자로 들어갑니다(주소는 서명 없는 Blob URL, 서버가 읽을 때 서명). 다른 입력란에 붙여 넣으면 URL이 들어갑니다. macOS에서 올린 한글 파일 이름(NFD)은 NFC로 맞춰 등록합니다 |

### 자동 썸네일

게시 상태로 저장할 때 글에 썸네일이 없으면 브라우저 Canvas로 썸네일을 만들어 올린 뒤 함께 저장합니다
(`src/utils/autoThumbnail.js`). 썸네일이 이미 있으면 다시 만들지 않으므로, 이후 글을 고쳐도 첫 썸네일이 유지됩니다.

- 기존 글: 공개 카드는 공개 사이트가 미리 만든 썸네일(`Elevate.Web/src/assets/post-thumbs`)을 DB 썸네일보다 먼저 씁니다.
  편집 화면 미리보기도 같은 순서로 보여 주고(`src/utils/publicThumbs.js`), 이 이미지가 있는 글에는 자동 썸네일을 만들지 않습니다.
  이 이미지는 빌드 때 Admin 산출물에 함께 들어가며 미리보기를 볼 때만 내려받습니다.
  개발 서버가 이 폴더를 읽도록 `vite.config.js`의 `server.fs.allow`에 추가했습니다.

- 모양: 공개 사이트 기존 썸네일(`Elevate.Web/src/assets/post-thumbs`)을 만든 'UI 미니어처' kit v2(소프트 글래스)와
  같은 규칙입니다. 앱 색 파스텔 무대와 흐린 글로우, 창 뒤의 유리 오브젝트, 프로스티드 글래스 창(앱 아이콘·이름, 제목,
  체크 행), 목차 또는 요약 카드, 검정 원형 아이콘의 흰 유리 알약 하나. Copilot Studio는 kit처럼 밝은 유리 다크 무대입니다.
- 내용: 제목, 본문 소제목(목차 카드), 목록 항목(체크 행, 첫 행 강조), 첫 문단, 요약에서 고릅니다.
  알약 문구는 요약 첫 구절이나 제목의 구절 등 말줄임 없이 한 줄에 들어가는 글을 고릅니다. 본문 이미지는 쓰지 않습니다.
  배치 규칙은 `src/utils/thumbnailLayout.js`(순수 함수, `tests/auto-thumbnail.test.js`)에 있습니다.
- 파일: 1440×810 PNG를 만들고, 업로드 때 공개 카드용 480·960·1440 WebP variants를 모두 올립니다.
  variants가 하나라도 실패하면 썸네일 없이 글만 저장하고 경고를 보여 주며, 다음에 게시 상태로 저장할 때 다시 만듭니다.
- 자산: 유리 오브젝트는 kit의 `assets/glass/<app>/<shape>.png`를 640px WebP로 줄인 것입니다
  (`src/assets/glass`, 13개 앱 × 5개, 약 1.5 MB). 썸네일을 만들 때 필요한 2개만 내려받습니다.
  알약·카드 아이콘은 Fluent UI System Icons(MIT)의 경로를 옮겼습니다(`src/utils/thumbnailIcons.js`).
- `ctx.filter`를 지원하지 않는 브라우저(일부 Safari)에서는 흐림을 축소·확대로 근사해 같은 구성으로 만듭니다.

## 앱과 서버 category

서버에 저장되는 게시글 category는 7개(`m365`, `copilot`, `copilot-studio`, `teams`,
`minecraft`, `excel`, `onenote`)입니다. 공개 사이트는 `CATEGORY_SPLIT_RULES`로 일부 글을
별도 앱으로 나눠 보여 주며, 관리자도 같은 규칙으로 13개 앱을 보여 줍니다
(`src/constants/apps.js`, Web 원본과의 일치는 `tests/app-classification.test.js`가 검사).

| 앱 | 저장 category | 판단 순서 (slug → 시리즈 → 태그) | 새 글에 붙는 태그 |
| --- | --- | --- | --- |
| Word / PowerPoint / Forms / OneDrive | `m365` | 시리즈 이름, 없으면 앱 태그 | `word` / `powerpoint` / `forms` / `onedrive` |
| GitHub / Azure | `copilot-studio` | 기존 글 slug 목록, 없으면 앱 태그 | `github` / `azure` |
| 나머지 7개 앱 | 앱 이름과 같음 | - | 없음 |

- 관리자 목록 API 요약에는 `series`가 없어 목록에서는 slug와 태그로 나눕니다.
  편집 화면은 시리즈까지 포함해 **공개 사이트 표시 앱**을 계산해 보여 줍니다.
- category는 저장 후 바꿀 수 없습니다(서버 partition). 새 글에서 앱을 바꾸면 category와
  앱 태그가 함께 바뀝니다. 태그 편집이 없으므로 관리자에서 앱 태그가 지워지지 않습니다.
- 목록은 7개 category의 요약을 모두(100개/페이지) 받아 브라우저에서 분류하고,
  저장·삭제 직후와 30초가 지난 뒤 목록에 돌아올 때 다시 불러옵니다.

## 인증

- Entra ID(MSAL) 로그인 사용자만 화면을 엽니다. 로그인 계정이 없으면 한 번만 로그인 페이지로 이동합니다.
  헤더에서 로그아웃하면 같은 호스트로 돌아오며, 그 탭에서는 바로 다시 로그인시키지 않고 '다시 로그인' 버튼을 보여 줍니다.
- `redirectUri`와 `postLogoutRedirectUri`는 **현재 접속한 origin**(끝 슬래시 없음)입니다.
  같은 빌드가 두 호스트에서 서비스되므로 빌드 시점 주소를 쓰지 않습니다(`src/lib/redirectUri.js`).
- `VITE_AZURE_AD_REDIRECT_URI`는 선택 override입니다. 현재 origin과 같은 호스트의 절대 URL이거나
  `/`로 시작하는 경로일 때만 쓰고, 다른 호스트 값은 무시합니다.
- Entra 앱 등록의 SPA 리디렉션 URI에는 두 호스트의 origin이 등록되어 있어야 합니다.
  Entra는 끝 슬래시까지 정확히 비교하므로 앱이 보내는 값(끝 슬래시 없음)을 그대로 등록합니다.
- API 토큰 검증, CORS 허용 origin은 Server/Azure 설정입니다. 관리자 호스트의 origin
  (`https://admin.microsoft-elevate.com`, 기본 호스트)은 Function App CORS와 Storage Blob CORS에 모두 있어야 합니다.
  이미지·첨부·자동 썸네일 업로드는 브라우저가 사용자 위임 SAS로 Blob에 바로 PUT하므로 Blob CORS가 빠지면 업로드만 실패합니다.
  현재 값과 확인 방법은 [배포 런북](../documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md#인증cors-전제-2026-10-20-코디네이터-확인)에 있습니다.

## 환경 변수

`.env.example`을 복사해 사용합니다. 배포 빌드는 GitHub secrets `ADMIN_VITE_*`에서 주입합니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 예 | 관리자 API 기준 URL (`…/api/admin`) |
| `VITE_AZURE_AD_CLIENT_ID` | 예 | Entra 앱(클라이언트) ID |
| `VITE_AZURE_AD_AUTHORITY` | 예 | `https://login.microsoftonline.com/<tenant-id>` |
| `VITE_AZURE_AD_API_SCOPE` | 예 | API scope (`api://<app-id>/<scope>`) |
| `VITE_AZURE_AD_REDIRECT_URI` | 아니요 | 같은 호스트일 때만 쓰는 redirect override |
| `VITE_DEV_BEARER_TOKEN` | 아니요 | 로컬 개발 전용. 설정하면 MSAL 로그인 없이 이 토큰으로 API를 호출한다. 운영 빌드에 넣지 않는다 |

## 개발과 검증

Node 22(`.nvmrc`) 기준입니다.

```bash
npm ci --legacy-peer-deps
npm run dev
npm run lint
npm test              # Vitest + jsdom, 모의 API (운영 접근 없음)
npm run test:source   # 기존 소스 회귀 스크립트
npm run build && npm run check:bundle   # 초기 목록 JavaScript 600 KiB 예산
npm run sync:post-content   # Web 본문 CSS를 바꾼 뒤 편집기용 복사본(src/styles/post-content.css) 다시 만들기
```

`check:bundle`은 `index.html`과 기본 목록(`src/pages/AppPosts.jsx`)의 정적 의존성을 합산하고
편집기(Tiptap) 즉시 로딩을 실패로 처리합니다. 앱 아이콘·유리 타일·유리 오브젝트 이미지는 JS에 인라인하지 않습니다
(`vite.config.js`의 `assetsInlineLimit: 0`). 자동 썸네일 코드는 편집 화면 chunk에만 들어갑니다.

## 배포

1. 변경은 `main`에 병합합니다.
2. 운영 반영은 `main`을 `admin` 브랜치로 병합해 push할 때 `.github/workflows/deploy-admin-azure-swa.yml`이 수행합니다.
3. 배포 후 두 호스트에서 각각 로그인·목록·앱별 새 글 저장(보관)·게시와 자동 썸네일·편집·로그아웃을 확인합니다.

자세한 운영 절차는 [배포 런북](../documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md#관리자-배포와-도메인)을 참고합니다.
