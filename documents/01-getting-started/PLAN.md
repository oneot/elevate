# Elevate 개발 기준과 확인 범위

이 문서는 2026-10-18 `main`의 애플리케이션 코드와 저장소 설정을 기준으로 복구한
개발 진입점이다. 삭제된 정책 문서나 Azure 배포 구성을 복구 완료한 것으로 간주하지 않는다.

## 참조 순서

1. 조직 정책이 복구되면 `POLICY.md`를 최우선으로 적용하고, 확인된 Azure 아키텍처,
   인증, API, 인프라, 운영 문서를 순서대로 대조한다.
2. 현재는 `.github/copilot-instructions.md`와
   `.github/instructions/recovery.instructions.md`의 금지 사항을 준수한다.
3. 실제 동작은 `Elevate.Web/src`, `Elevate.Admin/src`, `Elevate.Server/src`,
   각 앱의 `package.json`, `.github/workflows`로 확인한다.
4. 확인된 접속 장애 기록은
   [운영 런북](../06-operations/DEPLOYMENT_AND_RUNBOOK.md)을 참조한다.
5. 로컬 개발·명령은 [루트 README](../../README.md), 이번 주요 경로 분석·수정·회귀 근거는
   [모더나이즈 문서](../04-application/MODERNIZATION.md)를 참조한다.

## 현재 코드 경계

| 영역 | 진입점과 책임 |
| --- | --- |
| 공개 Web | `Elevate.Web/src/main.jsx`, `App.jsx`: React SPA, 공개 API 조회, 본문·영상·행사 표시 |
| Admin | `Elevate.Admin/src/main.jsx`, `App.jsx`: MSAL 로그인, 공개 사이트 13개 앱별 게시글 작성·편집, SAS 업로드 ([Admin README](../../Elevate.Admin/README.md)) |
| Server | `Elevate.Server/src/functions/index.js`: Azure Functions HTTP 등록, 관리자 인증, 컨트롤러, Cosmos/Blob 접근 |
| 배포 | `.github/workflows/deploy.yml`: `main` → GitHub Pages. `deploy-admin-azure-swa.yml`: `admin` → Azure Static Web Apps (`admin.microsoft-elevate.com`, 기본 호스트) |

일반 PR 대상은 저장소 지침의 `develop`이다. 이번 전체 모더나이즈는 사용자가 승인한
예외에 따라 [PR #271](https://github.com/oneot/elevate/pull/271)을 포함한 `main`을 기준으로 별도 PR을 준비한다.
배포 브랜치, GitHub 기본 브랜치, 운영 리소스 설정을 변경하지 않는다.

## 이번 개선의 경계

- Web/Admin/Server와 빌드·의존성·CI를 함께 살피고, 확인된 결함과 중복을 기존
  구조 안에서 개선한다.
- 기존 디자인, URL, 정상 요청의 API 계약, 인증·권한, 작성·게시·수정·삭제 의미를 유지한다.
- 회귀 테스트는 로컬 fixture와 모의를 사용한다. 실제 Azure 데이터 변경이나
  기업 네트워크 검증으로 보고하지 않는다.
- VPN 경유 공개 API 접속 장애는 **미해결·보류** 상태다. VPN/DNS/라우팅,
  프록시·호스팅 추가, 콘텐츠 스냅샷 전환은 포함하지 않는다.
- Git 이력 재작성, 대량 콘텐츠 삭제, 생성물 커밋을 하지 않는다.

## 복구되지 않은 기준

`documents/02-governance`, `documents/03-architecture`의 정책·아키텍처 문서,
API 계약 기준 문서 및 `infra/`는 현재 없다. Azure 실제 리소스 조회·export와
운영 설정 교차 확인 없이는 리전·리소스 수·인증 고정값이나 Bicep을 재구성하지 않는다.
후속 인프라 복구는 정책 → 아키텍처·인증/API → Bicep → 운영 절차 순으로,
문서와 실제 배포 상태를 함께 확인해야 한다.

## 검증 기준

각 앱의 잠금 파일로 의존성을 설치하고, 영향받는 회귀 테스트와 프런트엔드 빌드를
Node 22에서 실행한다. `Repository checks`의 세 앱 검사와 Admin 600 KiB 초기 목록
예산을 확인한다. 공개 Web의 HTTPS 진입·요청 수명·카테고리 캐시 회귀를 유지한다.
Server의 Azure 연결 테스트는 명시적으로 선택하는 별도 검증이며 기본 테스트에
운영 접근이 필요해서는 안 된다. 실제 실행한 명령과 미검증 범위는 PR에 구분해 기록한다.
