# Microsoft Elevate Korea 공식 Blog

React 공개 사이트와 관리자, Azure Functions API를 관리하는 저장소입니다.
공개 사이트는 GitHub Pages와 실시간 Azure API를 사용하며, 관리자의 작성·게시·수정·삭제
흐름은 별도 Admin 앱(`https://admin.microsoft-elevate.com`)에서 유지합니다.

| 영역 | 책임 | 개발 시작점 |
| --- | --- | --- |
| [Elevate.Web](Elevate.Web/README.md) | 게시글·활동 영상·행사·챗 UI | `src/main.jsx`, `src/App.jsx` |
| [Elevate.Admin](Elevate.Admin/README.md) | MSAL 인증, 13개 앱별 게시글 작성·편집, 이미지·첨부 업로드 | `src/main.jsx`, `src/App.jsx` |
| Elevate.Server | 공개/관리자 API, Cosmos DB, Blob SAS | `src/functions/index.js` |

## 개발 환경

개발·CI 기준은 **Node.js 22.x**이며 루트 `.nvmrc`를 사용합니다.
이는 Azure Functions에 설정된 실제 런타임을 변경하는 명령이 아닙니다.
각 앱은 독립적인 `package.json`과 잠금 파일을 유지합니다.

```bash
npm --prefix Elevate.Web ci --legacy-peer-deps
npm --prefix Elevate.Admin ci --legacy-peer-deps
npm --prefix Elevate.Server ci
```

프런트엔드는 기존 잠금 파일의 peer 의존성 설치 방식을 유지합니다.
임의 버전 갱신 대신 `npm ci`로 설치하며, 직접 import하는 패키지는 해당 앱의
직접 의존성으로 선언합니다.

Web/Admin은 각 앱의 `.env.example`을 참고합니다. Admin 실행에는 해당 환경의
MSAL 설정과 `/api/admin` API 기준 URL이 필요합니다. Server 로컬 설정 예시는
`Elevate.Server/local.settings.json.example`이며, 실제 인증·리소스 값은 운영 확인 후
별도로 주입해야 합니다. 비밀값이나 실제 로컬 설정 파일을 커밋하지 않습니다.

```bash
npm --prefix Elevate.Web run dev
npm --prefix Elevate.Admin run dev
```

Server 실행은 Azure Functions Core Tools가 설치된 환경에서
`cd Elevate.Server && npm start`로 시작합니다. 기본 단위 테스트에는 Azure 접속이 필요하지 않습니다.

## 검증

| 영역 | 명령 |
| --- | --- |
| Web | `npm test`, `npm run test:source`, `npm run lint`, `npm run check:seo` |
| Admin | `npm test`, `npm run test:source`, `npm run lint`, `npm run build`, `npm run check:bundle` |
| Server | `npm test` |

표의 명령은 각 앱 디렉터리에서 실행합니다. Admin 번들 검사는 먼저 빌드한
`dist/.vite/manifest.json`을 사용하여 기본 목록 진입의 정적 의존성을 합산합니다.
편집기 즉시 로딩 또는 **600 KiB 초과**를 실패로 처리합니다.

`Repository checks` 워크플로는 `main`, `develop`, `admin` 대상 PR에서 세 앱을 검사합니다.
Web의 필수 SEO 메타데이터 수집은 로컬 HTTP fixture로, UI는 jsdom과 모의 API로 확인합니다.
CI용 빌드는 운영 API·Entra·SAS 비밀값을 사용하지 않습니다.
실제 Azure 연결 테스트(`npm run test:azure`)는 별도 선택 검증입니다.

## 배포와 문서

기존 배포 경계는 `main` → GitHub Pages, `admin` → Azure Static Web Apps입니다.
Admin 변경은 `main`에 병합한 뒤 `main`을 `admin`에 병합해야 배포됩니다.
기본 브랜치나 운영 리소스를 이 문서만으로 변경하지 않습니다. Server 배포 워크플로는
현재 저장소에 없으며 실제 배포 절차는 운영 확인이 필요합니다.
인프라(Bicep)와 설계·정책·인수인계 문서는 비공개 레포 `oneot/elevate-infra`에서 관리합니다.

- [개발 기준과 확인 범위](documents/01-getting-started/PLAN.md)
- [전체 주요 경로 분석과 모더나이즈 근거](documents/04-application/MODERNIZATION.md)
- [배포·접속 장애 런북](documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md)

**VPN 경유 공개 API 접속 장애는 미해결·보류 상태입니다.**
콘텐츠 스냅샷 전환, 새 프록시·호스팅, Git 이력 재작성은 이번 개선에 포함하지 않습니다.
