# Elevate 프로젝트 - GitHub Copilot 지시사항

> **마지막 업데이트**: 2026년 3월 31일  
> **버전**: 2.2  
> **필수 참조 문서**: [documents/01-getting-started/PLAN.md](../documents/01-getting-started/PLAN.md)

---

## 📋 기본 원칙

### 1. 언어 설정
- **모든 응답과 검색 결과는 항상 한국어로 진행해야 한다.**
- 코드 주석, 변수명, 함수명은 영문 유지
- 에러 메시지, 분석 결과, 설명은 모두 한국어 제공

### 2. 작업 시작 전 필수 절차
- **세션의 첫 작업 이전에는 반드시 [documents/01-getting-started/PLAN.md](../documents/01-getting-started/PLAN.md)를 참조하여 전체 계획을 파악한다.**
- PLAN.md가 제시하는 문서 참조 우선순위를 따른다.
- 단, `documents/` 또는 `infra/` 폴더 삭제로 인해 PLAN.md가 존재하지 않으면, 이를 **복구 작업 예외 상황**으로 간주하고 아래 "복구 작업 특별 지침"을 우선 적용한다.
- 작업 종류에 따라 필요한 문서를 선택적으로 읽는다:
  - 정책 검토: `POLICY.md`, `AZURE_POLICY_MAPPING.md`
  - 아키텍처 설계/변경: `AZURE_ARCHITECTURE.md`, `AUTHORIZATION_MODEL.md`, `IMAGE_POLICY.md`
  - Bicep 구현: `BICEP_IMPLEMENTATION_PLAN.md`, `DATA_MODEL_AND_API_CONTRACT.md`
  - 배포/운영: `DEPLOYMENT_AND_RUNBOOK.md`

### 3. GitHub commit, push 금지
- **코드 변경 사항을 에이전트가 GitHub에 커밋하거나 푸시하는 행위는 절대 금지한다.**
- 변경 사항을 GitHub에 반영해야 하는 경우, 수동으로 커밋하고 푸시한다.

### 4. 보안 및 인증 원칙 준수
- **보안 및 인증 관련 정책을 엄격히 준수한다.**
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

## 🛠️ 문서/인프라 복구 작업 특별 지침

### 적용 조건
- `documents/` 폴더가 삭제되었거나 핵심 기준 문서가 없는 경우
- `infra/` 폴더가 삭제되어 IaC 원본이 없는 경우
- 배포된 Azure 리소스 상태를 기준으로 문서와 Bicep을 재구성해야 하는 경우

### 복구 작업의 기준 원천
복구 작업에서는 기존 문서 대신 아래 순서로 사실 기준을 수집한다:
1. 현재 Azure에 배포된 실제 리소스 상태
2. Azure CLI로 export 또는 조회한 배포 템플릿과 리소스 속성
3. 애플리케이션 코드의 실제 동작 (`Elevate.Admin/`, `Elevate.Server/`, `Elevate.Web/`)
4. 현재 저장소의 설정 파일 (`package.json`, `staticwebapp.config.json`, `host.json`, 환경 변수 예시 파일)
5. 확인 가능한 운영 스크립트와 테스트 코드

### 복구 작업 기본 원칙
- 삭제된 문서가 없다는 이유로 임의의 정책, 고정값, 리소스 구성을 만들어 넣지 않는다.
- 확인되지 않은 값은 추정하지 말고 `TODO`, `확인 필요`, 또는 플레이스홀더로 명시한다.
- 보안 관련 고정값(Tenant ID, Subscription ID, App Registration 이름, 리디렉션 URI, CORS 허용 출처)은 코드, 배포 리소스, 운영 설정 중 최소 2개 이상에서 교차 확인한다.
- 문서 복구와 infra 복구를 분리하지 말고, 서로 검증 가능한 형태로 동기화한다.

### infra 복구 절차
1. Azure CLI로 현재 배포 상태를 export 또는 조회하여 ARM 템플릿과 리소스 속성을 확보한다.
2. export 결과는 원본 증적으로 보관하고, 바로 최종 Bicep으로 간주하지 않는다.
3. ARM 템플릿을 기반으로 Bicep으로 변환한 뒤, 모듈 구조, 네이밍, 태그, 파라미터 전략을 현재 프로젝트 규칙에 맞게 다시 정리한다.
4. 복구된 Bicep은 반드시 환경별 파라미터 분리, 비밀값 외부 주입, Managed Identity 우선 원칙을 만족해야 한다.
5. export 결과에 포함된 우발적 설정, 임시 리소스 속성, 런타임 생성값은 그대로 고정하지 않고 의도된 구성인지 검토한다.

### 문서 복구 절차
1. 가장 먼저 `documents/01-getting-started/PLAN.md`를 재작성하여 이후 작업의 기준 문서로 복구한다.
2. 다음 순서로 핵심 문서를 복구한다:
  - `documents/02-governance/POLICY.md`
  - `documents/02-governance/AZURE_POLICY_MAPPING.md`
  - `documents/03-architecture/AZURE_ARCHITECTURE.md`
  - `documents/03-architecture/AUTHORIZATION_MODEL.md`
  - `documents/03-architecture/IMAGE_POLICY.md`
  - `documents/04-application/DATA_MODEL_AND_API_CONTRACT.md`
  - `documents/05-infrastructure/BICEP_IMPLEMENTATION_PLAN.md`
  - `documents/06-operations/DEPLOYMENT_AND_RUNBOOK.md`
3. 문서는 반드시 현재 코드와 복구된 infra를 기준으로 다시 작성한다.
4. 과거 문서 내용을 기억에 의존해 복원하지 말고, 확인 가능한 사실과 미확정 항목을 분리하여 기록한다.
5. 미확정 내용은 문서에서 숨기지 말고 "결정 필요", "운영 확인 필요", "Azure 설정 재확인 필요"로 드러낸다.

### 문서 작성 기준
- PLAN.md에는 복구 우선순위, 참조 관계, 선행 문서, 검증 절차를 명시한다.
- POLICY.md에는 실제로 강제해야 하는 보안/인증/리전/비밀관리 금지 사항만 기록한다.
- AZURE_ARCHITECTURE.md에는 확정된 Azure 리소스, 인증 경계, 네트워크/배포 구조만 기록한다.
- DATA_MODEL_AND_API_CONTRACT.md에는 현재 서버 코드 기준의 엔드포인트, 요청/응답, 에러 스키마만 기록한다.
- BICEP_IMPLEMENTATION_PLAN.md에는 복구된 infra 디렉터리 구조, 모듈 경계, 파라미터/태그/네이밍 전략을 기록한다.
- DEPLOYMENT_AND_RUNBOOK.md에는 실제 배포 절차, 운영 점검 항목, 장애 대응 절차를 기록한다.

### 복구 완료 검증
- 복구된 `infra/` 전체에 대해 Bicep 빌드가 성공해야 한다.
- 복구된 문서의 고정값이 코드 및 Azure 배포 상태와 충돌하지 않아야 한다.
- 인증 관련 문서는 `Elevate.Admin/`, `Elevate.Server/`의 실제 인증 처리와 일치해야 한다.
- API 문서는 서버 함수와 컨트롤러 구현과 일치해야 한다.
- 문서에 기록한 배포 절차는 실제 Azure CLI 또는 운영 절차로 재현 가능해야 한다.

### 복구 작업 중 절대 금지 사항
- ARM export 결과를 검토 없이 그대로 최종 산출물로 확정하는 행위
- 현재 코드와 맞지 않는 과거 추정 문서를 복원하는 행위
- 확인되지 않은 정책값이나 운영값을 사실처럼 문서화하는 행위
- 비밀값, 키, 토큰, 연결 문자열을 문서나 Bicep 기본값으로 넣는 행위
- 키 기반 인증을 복구 편의상 임시 허용하는 행위

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

## 🚀 일반 작업 플로우

1. **계획 파악**: `documents/01-getting-started/PLAN.md` 읽기
2. **예외 확인**: PLAN.md 또는 `infra/`가 없으면 "문서/인프라 복구 작업 특별 지침"부터 적용
3. **정책 검토**: 변경안이 `POLICY.md` 위반 여부 확인
4. **아키텍처 정합성**: 관련 문서와 일치하는지 확인
5. **구현**: 문서 기준에 맞춰 코드/IaC 작성
6. **검증**: 빌드/테스트 실행
7. **문서 동기화**: 변경사항 문서 반영
8. **완료 보고**: 변경 내역 요약

---

## 🔒 절대 금지 사항

- GitHub 자동 commit/push
- 계정 키 기반 인증 사용 (Managed Identity 사용 필수)
- 하드코딩된 비밀값/토큰
- `documents/02-governance/POLICY.md`에 명시된 리소스/리전/인증 제약사항 위반
- 문서와 불일치하는 고정 구성값 사용

---