# Elevate 프로젝트 - GitHub Copilot 지시사항

> **마지막 업데이트**: 2026년 5월 18일  
> **버전**: 2.3  
> **필수 참조 문서**: [documents/01-getting-started/PLAN.md](../documents/01-getting-started/PLAN.md)

---

## 🚀 작업 시작 플로우

모든 작업은 아래 순서를 따른다:

1. **계획 파악**: `documents/01-getting-started/PLAN.md` 읽기
2. **예외 확인**: PLAN.md 또는 `infra/`가 없으면 [복구 지침](.github/instructions/recovery.instructions.md) 적용
3. **Skills 확인**: 관련 Skill이 1%라도 있으면 즉시 호출 (§기본원칙 3 참조)
4. **정책 검토**: 변경안이 `POLICY.md` 위반 여부 확인
5. **아키텍처 정합성**: 관련 문서와 일치하는지 확인
6. **구현**: 문서 기준에 맞춰 코드/IaC 작성
7. **검증**: 빌드/테스트/`verification-before-completion` Skill 실행
8. **문서 동기화 + 완료 보고**: 변경사항 문서 반영 후 변경 내역 요약

---

## 📋 기본 원칙

### 1. 언어 설정
- **모든 응답과 검색 결과는 항상 한국어로 진행해야 한다.**
- 코드 주석, 변수명, 함수명은 영문 유지
- 에러 메시지, 분석 결과, 설명은 모두 한국어 제공

### 2. 작업 시작 전 필수 절차
- **세션의 첫 작업 이전에는 반드시 [documents/01-getting-started/PLAN.md](../documents/01-getting-started/PLAN.md)를 참조하여 전체 계획을 파악한다.**
- PLAN.md가 제시하는 문서 참조 우선순위를 따른다.
- 단, `documents/` 또는 `infra/` 폴더 삭제로 인해 PLAN.md가 존재하지 않으면, [복구 작업 특별 지침](.github/instructions/recovery.instructions.md)을 우선 적용한다.
- 작업 종류에 따라 필요한 문서를 선택적으로 읽는다:
  - 정책 검토: `POLICY.md`, `AZURE_POLICY_MAPPING.md`
  - 아키텍처 설계/변경: `AZURE_ARCHITECTURE.md`, `AUTHORIZATION_MODEL.md`, `IMAGE_POLICY.md`
  - Bicep 구현: `BICEP_IMPLEMENTATION_PLAN.md`, `DATA_MODEL_AND_API_CONTRACT.md`
  - 배포/운영: `DEPLOYMENT_AND_RUNBOOK.md`

### 3. Skills 및 MCP 서버 최대 활용
- **작업을 시작하기 전, 사용 가능한 모든 Skills와 MCP 서버를 반드시 확인하고 최대한 활용한다.**
- 관련 Skill이 1%라도 적용될 가능성이 있으면 반드시 먼저 호출한다.

| 작업 유형 | 사용 Skill |
|-----------|-----------|
| 계획·설계 | `brainstorming`, `writing-plans` |
| 구현 | `test-driven-development`, `subagent-driven-development` |
| 디버깅 | `systematic-debugging` |
| 독립 병렬 작업 | `dispatching-parallel-agents` |
| 브랜치/PR 준비 | `using-git-worktrees`, `finishing-a-development-branch` |
| 코드리뷰 요청/수신 | `requesting-code-review`, `receiving-code-review` |
| 완료 선언 전 | `verification-before-completion` |
| 대규모 계획 실행 | `executing-plans` |

- MCP 서버(GitHub, Bicep, Playwright 등)가 제공하는 도구를 bash 명령보다 우선 사용한다.
- 독립적인 작업은 `dispatching-parallel-agents` Skill을 통해 병렬 처리한다.

### 4. 브랜치 및 커밋 규칙
- **브랜치명**: `YoonKeumJae/{작업내용-kebab-case}` 형식, 반드시 `develop`에서 분기
- **커밋 단위**: 논리적 변경 단위 1 커밋 (WIP/임시 커밋 금지)
- **커밋 메시지**: 명령형 현재시제 영문 subject, 필요 시 한국어 body 허용
- **커밋 트레일러**: 아래 트레일러를 모든 커밋에 반드시 포함
  ```
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```
- **PR 대상**: upstream(`oneot/elevate`)의 `develop` 브랜치

### 5. GitHub commit/push 금지
- **사용자가 명시적으로 요청하지 않는 한, 코드 변경 사항을 에이전트가 GitHub에 커밋하거나 푸시하는 행위는 절대 금지한다.**

### 6. 보안 및 인증 원칙 준수
- `documents/02-governance/POLICY.md`에 명시된 보안 요구사항과 인증 방식을 철저히 따른다.
- 민감한 정보는 절대 코드에 하드코딩하지 않는다.
- Storage 계정 키 기반 인증 사용 금지 (Managed Identity + 사용자 위임 SAS 사용)
- 비프로덕션 환경은 Western Europe 리전 사용 금지

---

## 🔍 작업별 문서 참조 가이드

### Bicep/Infrastructure 작업 시
1. `POLICY.md` → 금지 사항 확인
2. `AZURE_POLICY_MAPPING.md` → 정책 적용 방식 확인
3. `AZURE_ARCHITECTURE.md` → 고정 구성값(Tenant, Subscription, App Registration) 확인
4. `BICEP_IMPLEMENTATION_PLAN.md` → 디렉터리 구조/네이밍/태깅/파라미터 전략 확인
5. 구현 후 `az bicep build` 실행하여 문법 검증

### API 개발 작업 시
1. `DATA_MODEL_AND_API_CONTRACT.md` → 엔드포인트/에러 스키마/페이지네이션 규약 확인
2. `AUTHORIZATION_MODEL.md` → 인증 경계(/api/admin vs /api/public) 확인
3. `IMAGE_POLICY.md` → 이미지 업로드/조회 정책 확인
4. 구현 후 API 계약과의 일치 여부 검증

### 인증/보안 작업 시
1. `AUTHORIZATION_MODEL.md` → Entra 고정 구성값, 토큰 검증 클레임 확인
2. `AZURE_ARCHITECTURE.md` → 고정 인증 기준값 재확인
3. `POLICY.md` → 로컬 인증 비활성화 정책 준수 여부 확인
4. guest 차단, member 전용, tid 검증 규칙 준수
5. **`ENTRA_AUDIENCE` 형식 주의**: 배포 환경에서는 UUID-only 형식 사용. `api://` 접두사는 로컬 개발용 코드 기본값으로만 사용
6. **`NODE_ENV=production` 필수**: 프로덕션 환경에서 올바른 인증 경로를 보장하기 위해 반드시 설정

### 배포/운영 작업 시
1. `DEPLOYMENT_AND_RUNBOOK.md` → 배포 토폴로지/SLO/임계값/장애 대응 절차 확인
2. `BICEP_IMPLEMENTATION_PLAN.md` → 배포 순서 준수
3. 배포 후 CORS/Redirect URI 실제 값을 문서에 반영

---

## ✅ 정책 준수 체크리스트 (필수)

작업 전 반드시 `documents/02-governance/POLICY.md`와 `documents/02-governance/AZURE_POLICY_MAPPING.md`를 확인하여 조직 정책을 준수한다:
- VM 시리즈 제한 준수
- 리소스 인스턴스 수 제한 준수
- 리전 선택 정책 준수
- 인증 방식 정책 준수 (Managed Identity 우선)
- 키 기반 인증 제한 정책 준수

---

## 🏗️ Bicep 작업 특별 지침

### AVM(Azure Verified Modules) 우선 사용
- 신규 리소스 추가 시 `br/public:avm/res/<service>/<resource>:<version>` 형식으로 먼저 검색
- AVM 모듈이 없는 경우에만 raw resource 선언 사용
- 버전은 반드시 명시적으로 고정

### 네이밍 규칙 준수
- `documents/05-infrastructure/BICEP_IMPLEMENTATION_PLAN.md`에 정의된 네이밍 규칙 준수
- 프로젝트별 접두사 사용
- 환경별 접미사 적용
- 리소스 그룹 명명 규칙 준수
- 필수 태그 적용 (env, owner, costCenter, service, managedBy)

### 파라미터 전략
- 공통 파라미터: `projectName`, `environment`, `location`, `tags`
- 환경별 파라미터: `appServicePlanSku` / `appServicePlanSkuTier` (dev: `EP1`/`ElasticPremium`, prod: `P1V2`/`PremiumV2`, 기본값: `Y1`/`Dynamic`)
- 보안 관련 값은 Key Vault 참조 또는 앱 설정으로 주입
- 기본값은 저비용/테스트 안전 값 사용
- `entraAudience`: 배포 환경에서는 UUID-only 형식 (`<app-registration-client-id>`), `api://` 접두사 사용 금지

### 배포 검증
```bash
az bicep upgrade
az bicep build --file infra/main.bicep
az bicep build --file infra/modules/*.bicep
```

---

## 📝 문서 갱신 규칙

### 문서 간 우선순위
1. `POLICY.md` (최우선)
2. `AZURE_ARCHITECTURE.md` (두 번째)
3. 나머지 세부 문서

### 변경 시 동기화 필수
- 아키텍처 변경 → `AZURE_ARCHITECTURE.md` 수정 후 하위 문서 동기화
- 인증 변경 → `AUTHORIZATION_MODEL.md` 수정 후 API/런북 반영
- API 변경 → `DATA_MODEL_AND_API_CONTRACT.md` 수정 후 구현 반영
- 운영 임계값 변경 → `DEPLOYMENT_AND_RUNBOOK.md` 수정

### 문서 업데이트 시 확인 사항
- 다른 문서와의 모순 여부 확인
- POLICY 위반 여부 확인
- 고정값(Tenant ID, Subscription ID, App Registration 이름) 일관성 확인

---

## 🔒 절대 금지 사항

- 사용자 요청 없이 GitHub commit/push
- 계정 키 기반 스토리지/Cosmos 인증 (Managed Identity 사용 필수)
- 하드코딩된 비밀값/토큰/연결 문자열
- `documents/02-governance/POLICY.md`에 명시된 리소스/리전/인증 제약사항 위반
- 문서와 불일치하는 고정 구성값 사용

---

> ⚠️ `documents/` 또는 `infra/`가 없는 **복구 상황**은 [`.github/instructions/recovery.instructions.md`](.github/instructions/recovery.instructions.md)를 참조한다.
