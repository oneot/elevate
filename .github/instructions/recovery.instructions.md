---
applyTo: '*'
---

# 문서/인프라 복구 작업 특별 지침

> 이 파일은 `documents/` 또는 `infra/` 폴더가 삭제되거나 핵심 기준 문서가 없는 **복구 상황에서만** 적용된다.  
> 일반 작업 지침은 `.github/copilot-instructions.md`를 참조한다.

---

## 적용 조건

- `documents/` 폴더가 삭제되었거나 핵심 기준 문서가 없는 경우
- `infra/` 폴더가 삭제되어 IaC 원본이 없는 경우
- 배포된 Azure 리소스 상태를 기준으로 문서와 Bicep을 재구성해야 하는 경우

---

## 복구 작업의 기준 원천

복구 작업에서는 기존 문서 대신 아래 순서로 사실 기준을 수집한다:

1. 현재 Azure에 배포된 실제 리소스 상태
2. Azure CLI로 export 또는 조회한 배포 템플릿과 리소스 속성
3. 애플리케이션 코드의 실제 동작 (`Elevate.Admin/`, `Elevate.Server/`, `Elevate.Web/`)
4. 현재 저장소의 설정 파일 (`package.json`, `staticwebapp.config.json`, `host.json`, 환경 변수 예시 파일)
5. 확인 가능한 운영 스크립트와 테스트 코드

---

## 복구 작업 기본 원칙

- 삭제된 문서가 없다는 이유로 임의의 정책, 고정값, 리소스 구성을 만들어 넣지 않는다.
- 확인되지 않은 값은 추정하지 말고 `TODO`, `확인 필요`, 또는 플레이스홀더로 명시한다.
- 보안 관련 고정값(Tenant ID, Subscription ID, App Registration 이름, 리디렉션 URI, CORS 허용 출처)은 코드, 배포 리소스, 운영 설정 중 최소 2개 이상에서 교차 확인한다.
- 문서 복구와 infra 복구를 분리하지 말고, 서로 검증 가능한 형태로 동기화한다.

---

## infra 복구 절차

1. Azure CLI로 현재 배포 상태를 export 또는 조회하여 ARM 템플릿과 리소스 속성을 확보한다.
2. export 결과는 원본 증적으로 보관하고, 바로 최종 Bicep으로 간주하지 않는다.
3. ARM 템플릿을 기반으로 Bicep으로 변환한 뒤, 모듈 구조, 네이밍, 태그, 파라미터 전략을 현재 프로젝트 규칙에 맞게 다시 정리한다.
4. 복구된 Bicep은 반드시 환경별 파라미터 분리, 비밀값 외부 주입, Managed Identity 우선 원칙을 만족해야 한다.
5. export 결과에 포함된 우발적 설정, 임시 리소스 속성, 런타임 생성값은 그대로 고정하지 않고 의도된 구성인지 검토한다.

---

## 문서 복구 절차

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

---

## 문서 작성 기준

- **PLAN.md**: 복구 우선순위, 참조 관계, 선행 문서, 검증 절차를 명시한다.
- **POLICY.md**: 실제로 강제해야 하는 보안/인증/리전/비밀관리 금지 사항만 기록한다.
- **AZURE_ARCHITECTURE.md**: 확정된 Azure 리소스, 인증 경계, 네트워크/배포 구조만 기록한다.
- **DATA_MODEL_AND_API_CONTRACT.md**: 현재 서버 코드 기준의 엔드포인트, 요청/응답, 에러 스키마만 기록한다.
- **BICEP_IMPLEMENTATION_PLAN.md**: 복구된 infra 디렉터리 구조, 모듈 경계, 파라미터/태그/네이밍 전략을 기록한다.
- **DEPLOYMENT_AND_RUNBOOK.md**: 실제 배포 절차, 운영 점검 항목, 장애 대응 절차를 기록한다.

---

## 복구 완료 검증

- 복구된 `infra/` 전체에 대해 Bicep 빌드가 성공해야 한다.
- 복구된 문서의 고정값이 코드 및 Azure 배포 상태와 충돌하지 않아야 한다.
- 인증 관련 문서는 `Elevate.Admin/`, `Elevate.Server/`의 실제 인증 처리와 일치해야 한다.
- API 문서는 서버 함수와 컨트롤러 구현과 일치해야 한다.
- 문서에 기록한 배포 절차는 실제 Azure CLI 또는 운영 절차로 재현 가능해야 한다.

---

## 복구 작업 중 절대 금지 사항

- ARM export 결과를 검토 없이 그대로 최종 산출물로 확정하는 행위
- 현재 코드와 맞지 않는 과거 추정 문서를 복원하는 행위
- 확인되지 않은 정책값이나 운영값을 사실처럼 문서화하는 행위
- 비밀값, 키, 토큰, 연결 문자열을 문서나 Bicep 기본값으로 넣는 행위
- 키 기반 인증을 복구 편의상 임시 허용하는 행위
