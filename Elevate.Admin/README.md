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
| `/apps/:appKey` | 앱별 게시글. 게시 상태 필터(`?status=`), 검색(`?q=`), 페이지(`?page=`)는 주소에 남는다 |
| `/posts/new?app=:appKey` | 새 게시글. 앱을 고르면 서버 category와 앱 태그를 자동으로 맞춘다 |
| `/posts/:postId` | 게시글 편집·삭제 |
| `/category/:categoryId` | 이전 주소. `/apps/:categoryId`로 이동한다 |

제거한 기능: Sub category(Agenthon, Update, MEE, 행사 소식, 프로그램 소식) 목록·작성,
달력 이벤트 편집과 게시글 연결, Management(활동 영상) 목록·편집.
관리 대상이 아닌 category의 게시글을 주소로 열면 편집 양식 대신 안내만 보여 줍니다.
서버 API와 데이터, 공개 사이트 표시는 그대로입니다.

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
  앱 태그가 함께 바뀝니다. 앱 태그를 지우면 공개 사이트에서 다른 앱에 표시될 수 있습니다.
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
- API 토큰 검증, CORS 허용 origin은 Server/Azure 설정입니다. 사용자 지정 도메인 origin
  `https://admin.microsoft-elevate.com`이 Function App CORS에 있어야 합니다.

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
```

`check:bundle`은 `index.html`과 기본 목록(`src/pages/AppPosts.jsx`)의 정적 의존성을 합산하고
편집기(Tiptap) 즉시 로딩을 실패로 처리합니다. 앱 아이콘·유리 타일 이미지는 JS에 인라인하지 않습니다
(`vite.config.js`의 `assetsInlineLimit: 0`).

## 배포

1. 변경은 `main`에 병합합니다.
2. 운영 반영은 `main`을 `admin` 브랜치로 병합해 push할 때 `.github/workflows/deploy-admin-azure-swa.yml`이 수행합니다.
3. 배포 후 두 호스트에서 각각 로그인·목록·앱별 새 글 저장·편집·로그아웃을 확인합니다.

자세한 운영 절차는 [배포 런북](../documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md#관리자-배포와-도메인)을 참고합니다.
