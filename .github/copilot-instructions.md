# Elevate 프로젝트 - GitHub Copilot 지시사항

> **마지막 업데이트**: 2026년 3월 6일  
> **버전**: 1.0  
> **참조 문서**: [PLAN.md](../documents/PLAN.md), [POLICY.md](../documents/POLICY.md)

---

## 📋 기본 원칙

### 1. 언어 설정
- **모든 응답과 검색 결과는 항상 한국어로 진행해야 한다.**
- 코드 주석, 변수명, 함수명은 영문 유지
- 에러 메시지, 분석 결과, 설명은 모두 한국어 제공

### 2. 작업 시작 전 진행 사항 파악
- **세션의 첫 작업 이전에는 반드시 [documents/PLAN.md](../documents/PLAN.md)를 참조하여 전체 계획을 파악한다. 파일이 존재하지 않는다면 이를 생략한다.**
- Elevate 프로젝트의 아키텍처, 정책 준수 기준, 구현 순서를 명확히 인지
- 현재 진행 단계, 완료된 작업, 남은 작업을 확인

---

## 🔐 보안 및 인증 원칙

### 정책 준수

#### ✅ 필수 준수 사항
| 영역 | 정책 요구사항 | 구현 방식 |
|------|-------------|---------|
| **VM 사용** | H, N, M 시리즈 금지 | Azure App Service (PaaS) 사용 |
| **데이터베이스** | SQL 금지 | Cosmos DB (NoSQL) 필수 |
| **인증** | Entra ID 기반 | 모든 인증은 회사 계정 사용 |
| **스토리지** | 키 기반 인증 금지 | Managed Identity + RBAC |
| **Analytics** | 키 비활성화 | Managed Identity (서버) + JS SDK (클라이언트) |
| **임시 허용** | SecurityControl:Ignore 금지 | 14일 임시 허용 사용 불가 |

#### ❌ 절대 금지 사항
- Connection String, Access Key, API Key를 코드에 하드코딩
- Azure SQL Database 사용
- VM 기반 인프라 (IaaS)
- 임시 보안 예외 (SecurityControl: Ignore) 사용