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

목록의 제목·요약과 순서는 공개 블로그와 같습니다.

- 제목·요약: 공개 사이트가 화면에서 다듬어 보여 주는 문구(`Elevate.Web/src/constants/postText.js`)를 그대로 씁니다
  (`src/utils/postText.js`). 검색은 이 문구와 서버에 저장된 원래 문구를 모두 찾습니다.
- 순서: 게시일 최신순이고, 같은 시각에 올린 시리즈 글은 시리즈 순서가 큰 글이 먼저입니다(공개 블로그 앱 목록과 같은 규칙,
  `src/utils/postOrder.js`). 관리자 목록 API 요약에는 `seriesOrder`가 없어 공개 API `GET /api/public/series`(약 12 KB, 인증 없음)로 받고,
  4초 안에 받지 못하면 같은 시각 안에서는 서버 제목 역순으로 둡니다. 게시한 적 없는 글은 마지막 수정 시각을 게시일 대신 씁니다.
  카드 아래에는 마지막 수정 시각을 표시합니다.
- 공개 사이트 '전체 게시글'은 서버 정렬(게시일)만 쓰므로 같은 시각 글의 순서는 데이터베이스 순서입니다.
  그래서 같은 시각에 한꺼번에 올린 기존 시리즈 글(예: 2026-03-11 Teams·Forms)은 관리자 '전체 게시글'과 순서가 다를 수 있습니다.
  공개 사이트 앱 목록(예: `/teams`)과는 같습니다.

목록 카드 이미지는 공개 사이트 카드(`DocsPostCard`)와 같은 규칙과 같은 `<img sizes>`로 고릅니다
(`src/hooks/useCardImage.js`, `src/utils/postImages.js`).

1. 공개 사이트가 미리 만든 정적 썸네일(`Elevate.Web/src/assets/post-thumbs/<앱>/<slug>-480|960.webp`).
2. 없으면 DB 썸네일 variants(480·960px). 관리자 목록 API 요약에는 썸네일이 없으므로 이런 글만 상세를 조회하고,
   같은 세션에서 30분 동안 재사용합니다(읽기 SAS 1시간). 이미지가 실패하면 한 번 새 서명 주소를 받고, 그래도 실패하면 3번으로 넘어갑니다.
3. 둘 다 없으면 앱 유리 타일.

게시 상태는 썸네일을 가리지 않도록 카드 아래 날짜 옆에 표시합니다.
브라우저 탭 제목은 `Admin | Microsoft Elevate`이고, 아이콘은 오리 이미지로 만든 `public/favicon.ico`(16·32·48px),
`favicon-192.png`, `apple-touch-icon.png`(180px, 흰 배경)입니다.

제거한 기능: Sub category(Agenthon, Update, MEE, 행사 소식, 프로그램 소식) 목록·작성,
달력 이벤트 편집과 게시글 연결, Management(활동 영상) 목록·편집,
편집 화면의 slug·태그·시리즈(분류)·미디어(YouTube, 썸네일 업로드) 입력.
관리 대상이 아닌 category의 게시글을 주소로 열면 편집 양식 대신 안내만 보여 줍니다.
서버 API와 데이터, 공개 사이트 표시는 그대로입니다.

## 편집 화면

본문 편집기와 제목, 게시 설정(앱·상태·썸네일), 첨부파일 패널로 이루어집니다. 배치는 본문 영역(왼쪽 사이드바를 뺀 폭) 기준입니다.

| 본문 영역 | 배치 |
| --- | --- |
| 1024px 이상 | 왼쪽 본문, 오른쪽 세로 열에 제목·게시 설정·첨부파일. 사이드바를 연 창은 약 1300px부터 |
| 600–1023px | 본문 위 두 열: 왼쪽 제목·첨부파일, 오른쪽 게시 설정(아래 끝을 맞춤). 본문은 폭을 다 씀 |
| 600px 미만 (휴대폰) | 제목 → 게시 설정 → 첨부파일 → 본문 순으로 쌓임 |

- 본문 영역 600px 이상에서는 본문 상자를 화면 높이에 맞춥니다(높이 `100dvh − 문서 바 − 48px`, 최소 480px).
  - 상자 위쪽이 문서 바 아래 24px에 오도록 스크롤하면 상자가 화면을 채우고 아래에도 24px만 남습니다.
  - 패널 길이나 썸네일 유무와 관계없이 높이가 같습니다. 넓은 화면에서 오른쪽 열이 더 길면 페이지를 스크롤해 나머지 설정을 봅니다.
- 넘치는 본문은 편집기 안에서 스크롤하며, 도구 모음은 상자 위쪽에 고정됩니다.
- 휴대폰 배치에서는 편집기가 화면 높이의 70%까지 커진 뒤 안에서 스크롤합니다.
- 화면 코드의 순서(제목 → 게시 설정 → 첨부파일 → 본문)가 좁은 배치에서 보이는 순서와 같아, 탭 키 이동 순서도 같습니다.

본문은 공개 사이트 글 상세와 같은 모양으로 보입니다. 공개 사이트와 같은 클래스(`edoc-article` 안의
`prose prose-slate max-w-none post-content`)를 쓰고, 본문 CSS는 Web 원본(`Elevate.Web/src/index.css`의 `.prose`,
`src/styles/elevate-docs.css`의 `.edoc-article .prose`)을 그대로 옮긴 `src/styles/post-content.css`를 씁니다.
인라인 코드는 흰 키캡, 인용은 안내 아이콘(i)이 있는 흰 카드, 코드 블록은 점 3개가 있는 어두운 창으로 구분됩니다.
`post-content.css`는 직접 고치지 않습니다. Web 원본을 고친 뒤 `npm run sync:post-content`로 다시 만들고,
`tests/post-content-style.test.js`가 원본과 같은지 검사합니다. 편집기에만 필요한 보정(이미지 크기 조절, 코드 블록 감싸개 여백)은
`scripts/sync-post-content-css.mjs`의 4번 영역에 있습니다.

| 항목 | 동작 |
| --- | --- |
| 제목 | 공개 사이트에 보이는 문구로 채웁니다. 공개 사이트가 화면에서 다듬은 글은 저장할 때 그 문구가 서버에 저장되고, 이후 공개 사이트는 저장된 문구를 그대로 보여 줍니다(다듬은 문구는 서버 문구가 원래 문구일 때만 적용) |
| 요약 | 입력하지 않습니다. 게시한 글은 아래 'AI 썸네일·요약'의 AI가 본문을 읽고 한 줄로 기재합니다. 저장 요청에 요약을 보내지 않으므로 기존 글의 요약(사람이 쓴 것이든 AI가 쓴 것이든)은 편집으로 지워지지 않습니다 |
| 상태 | **게시**(공개)와 **보관**(비공개) 두 가지. 새 글의 기본값은 보관이며 서버에는 `archived`로 저장합니다. 서버의 `draft` 글은 보관으로 보이고, 보관을 유지하면 `draft` 그대로 둡니다 |
| slug | 입력하지 않습니다. 새 글을 만들 때 서버가 제목으로 만듭니다(영문·숫자만 사용, 없으면 `post`, 겹치면 `-2`, `-3` …). 저장 후에는 바뀌지 않습니다 |
| 태그·시리즈 | 편집하지 않습니다. 새 글에는 앱 태그만 자동으로 붙고, 기존 글의 태그·시리즈는 수정 요청에 보내지 않아 그대로 남습니다 |
| 썸네일 | 관리자에서 만들거나 올리지 않습니다. 게시된 글은 아래 'AI 썸네일·요약'이 만들어 PR로 올리고, 편집 화면에서는 공개 카드에 표시되는 이미지를 미리보기로만 보여 줍니다. 썸네일이 아직 없으면 칸을 보여 주지 않습니다 |
| 첨부파일 | '링크 복사' 후 본문에 붙여 넣으면 파일 이름이 링크 글자로 들어갑니다(주소는 서명 없는 Blob URL, 서버가 읽을 때 서명). 다른 입력란에 붙여 넣으면 URL이 들어갑니다. macOS에서 올린 한글 파일 이름(NFD)은 NFC로 맞춰 등록합니다 |

### AI 썸네일·요약

게시된 글의 카드 썸네일과 요약 한 줄은 GitHub Actions **Post thumbnails**(`.github/workflows/post-thumbnails.yml`)가 만듭니다.
관리자에서 글을 '게시'로 저장하면 서버가 GitHub에 썸네일 작업을 요청하고, 마지막 저장 10분 뒤 썸네일 없는 새 글을 찾습니다.
GitHub Copilot CLI가 본문 전체를 읽어 기존 80개와 같은 'UI 미니어처' 장면을 설계·렌더·검수하고, 같은 글의 요약 한 줄(35~55자, '~니다.')도 씁니다.
요약은 서버의 automation 입구(GitHub OIDC 인증, 비밀값 없음)로 게시글에 바로 기재되고, 썸네일은 PR로 올립니다.
PR 브랜치에서 저장소 검사(Repository checks)를 통과하면 사람 없이 병합하고 공개 사이트와 관리자를 다시 배포합니다.
게시 후 요약은 보통 15~20분, 썸네일은 25분 안팎에 카드에 보이며, 그 사이 카드에는 앱 유리 타일이 보입니다.
게시한 글의 제목·본문을 고쳐 저장하면 요약을 다시 쓰고 썸네일은 새 버전을 만들어 '썸네일 새 버전' PR(지금 이미지와 나란히)로 올린 뒤 같은 방식으로 병합합니다.
병합·배포 전까지는 지금 썸네일이 그대로 보입니다. 게시 상태만 바꾸거나 내용 없이 저장하면 새로 만들지 않습니다.
검사에 실패한 PR은 병합하지 않고 라벨 `thumbnail-merge-blocked`로 남겨 사람이 확인합니다.
관리자 화면은 GitHub를 직접 부르지 않습니다(토큰은 서버 설정 `THUMBNAIL_DISPATCH_TOKEN`). 원할 때 다시 만들려면 Actions에서 직접 실행합니다.
자세한 구조와 운영 방법은 [tools/post-thumbs/README.md](../tools/post-thumbs/README.md)에 있습니다.

- 공개 카드는 공개 사이트 정적 썸네일(`Elevate.Web/src/assets/post-thumbs`)을 DB 썸네일보다 먼저 씁니다.
  목록 카드와 편집 화면 미리보기도 같은 순서로 보여 줍니다(`src/utils/publicThumbs.js`).
  이 이미지는 빌드 때 Admin 산출물에 함께 들어가며 화면에 보일 때만 내려받습니다. 그래서 이 폴더가 바뀌면 Admin도 다시 배포합니다
  (`main`에 병합되면 `Sync post thumbnails to admin`이 `admin` 브랜치에 이미지만 맞추고 배포).
  개발 서버가 이 폴더를 읽도록 `vite.config.js`의 `server.fs.allow`에 추가했습니다.
- 예전에 브라우저에서 만들던 자동 썸네일(Canvas)은 본문 요약 수준이라 없앴습니다. 그때 만들어진 DB 썸네일은 그대로 남고,
  AI 썸네일이 병합되면 정적 이미지가 우선합니다.

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
  저장·삭제 직후와 30초가 지난 뒤 목록에 돌아올 때 다시 불러옵니다. 이때 공개 API의 시리즈 순서도 함께 받습니다.
  공개 API 주소는 `VITE_API_BASE_URL`의 끝 `/admin`을 `/public`으로 바꿔 만듭니다(같은 Function App). 다른 형식이면 받지 않습니다.

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
  본문 이미지·첨부 업로드는 브라우저가 사용자 위임 SAS로 Blob에 바로 PUT하므로 Blob CORS가 빠지면 업로드만 실패합니다.
  현재 값과 확인 방법은 비공개 레포 `oneot/elevate-infra`의 배포·운영 런북에 있습니다.

## 환경 변수

`.env.example`을 복사해 사용합니다. 배포 빌드는 GitHub secrets `ADMIN_VITE_*`에서 주입합니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 예 | 관리자 API 기준 URL (`…/api/admin`). 목록 정렬에 쓰는 공개 API(`…/api/public`)도 이 값에서 만든다 |
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
(`vite.config.js`의 `assetsInlineLimit: 0`).
목록 카드가 쓰는 정적 썸네일 주소표(약 17 KB)는 초기 목록 JavaScript에 들어갑니다.
공개 사이트 화면 문구표(약 26 KB)는 별도 chunk로 두고 목록을 불러올 때 함께 받습니다.

## 배포

1. 변경은 `main`에 병합합니다.
2. 운영 반영은 `main`을 `admin` 브랜치로 병합해 push할 때 `.github/workflows/deploy-admin-azure-swa.yml`이 수행합니다.
   `Elevate.Admin/**`, 공개 사이트 정적 썸네일(`Elevate.Web/src/assets/post-thumbs/**`),
   공개 사이트 화면 문구(`Elevate.Web/src/constants/postText.js`)가 바뀌었을 때 실행됩니다.
3. 배포 후 두 호스트에서 각각 로그인·목록(카드 썸네일이 공개 사이트와 같은지)·앱별 새 글 저장(보관)·게시·편집·로그아웃을 확인합니다.

자세한 운영 절차는 비공개 레포 `oneot/elevate-infra`의 배포·운영 런북을 참고합니다.
