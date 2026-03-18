# Elevate.Web Microsoft Clarity 적용 가이드

이 문서는 Elevate.Web(React + Vite + GitHub Pages)에 Microsoft Clarity를 안정적으로 도입하기 위한 실무 가이드입니다.
목표는 다음과 같습니다.

- 신규 개발자/에이전트가 문서만 보고 도입 작업을 끝낼 수 있을 것
- 개인정보/동의(Consent) 요구사항을 놓치지 않을 것
- 배포 후 검증 및 장애 대응까지 표준화할 것

---

## 1) 범위와 전제

### 적용 대상

- 프로젝트: Elevate.Web
- 런타임: React SPA (Vite)
- 배포: GitHub Pages

### Clarity 공식 문서(필수 참조)

- Setup and install: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
- Verify installation: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup#verify-your-installation
- Identify API: https://learn.microsoft.com/en-us/clarity/identify-api
- Consent management: https://learn.microsoft.com/en-us/clarity/consent-management
- Consent API v2: https://learn.microsoft.com/en-us/clarity/clarity-consent-api-v2
- Privacy disclosure: https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
- NPM package: https://www.npmjs.com/package/@microsoft/clarity

### 중요 제약

- Clarity는 18세 미만 대상 사이트/앱에 사용하면 안 됩니다(공식 문서 명시).
- EEA/UK/CH 유입 트래픽은 Consent 신호 처리 품질이 매우 중요합니다.
- 운영 환경에서 개인정보 고지(사이트/개인정보처리방침) 문구를 반드시 반영합니다.

---

## 2) 구현 방식 결정

Clarity 설치 방식은 2가지가 현실적으로 유효합니다.

### 권장: NPM 방식

- 장점
  - React/Vite 코드 흐름에서 초기화 제어가 쉽습니다.
  - 환경별 분기(개발/운영)가 간단합니다.
  - Identify/Event/Consent API를 코드 레벨에서 일관되게 호출할 수 있습니다.
- 단점
  - 패키지 의존성이 하나 추가됩니다.

### 대안: index.html head 스크립트 직접 삽입

- 장점
  - 의존성 추가 없이 즉시 삽입 가능합니다.
- 단점
  - 환경 분기/동의/식별 로직을 코드와 분리 관리하기 어려워집니다.

Elevate.Web는 SPA이며 라우트 이동 추적·동의 이벤트 연동이 중요하므로 NPM 방식을 기본 표준으로 채택합니다.

---

## 3) 사전 준비

### 3.1 Clarity 프로젝트 생성

1. https://clarity.microsoft.com 접속
2. 프로젝트 생성
3. Settings > Overview에서 Project ID 확보

### 3.2 환경 변수 정의

Vite 규칙에 맞춰 VITE_ 접두사를 사용합니다.

- VITE_CLARITY_PROJECT_ID: Clarity 프로젝트 ID
- VITE_CLARITY_ENABLED: 활성화 여부(true/false)

예시(.env.production)

```dotenv
VITE_CLARITY_ENABLED=true
VITE_CLARITY_PROJECT_ID=xxxxxxxxxx
```

예시(.env.development)

```dotenv
VITE_CLARITY_ENABLED=false
VITE_CLARITY_PROJECT_ID=
```

운영 환경에서만 활성화하는 전략을 기본으로 권장합니다.

---

## 4) 표준 구현 절차 (NPM)

### 4.1 패키지 설치

```bash
npm install @microsoft/clarity
```

### 4.2 초기화 유틸 파일 생성

권장 경로: src/lib/clarity.js

```javascript
import Clarity from '@microsoft/clarity';

const enabled = import.meta.env.VITE_CLARITY_ENABLED === 'true';
const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

let started = false;

export function startClarity() {
  if (!enabled || !projectId || started) {
    return;
  }

  Clarity.init(projectId);
  started = true;
}

export function identifyClarity(customId, customSessionId, customPageId, friendlyName) {
  if (!started || !customId) {
    return;
  }
  Clarity.identify(customId, customSessionId, customPageId, friendlyName);
}

export function trackClarityEvent(eventName) {
  if (!started || !eventName) {
    return;
  }
  Clarity.event(eventName);
}

export function setClarityTag(key, value) {
  if (!started || !key || typeof value === 'undefined') {
    return;
  }
  Clarity.setTag(key, value);
}

export function setClarityConsentV2(adStorage, analyticsStorage) {
  if (!started) {
    return;
  }

  Clarity.consentV2({
    ad_Storage: adStorage,
    analytics_Storage: analyticsStorage,
  });
}
```

### 4.3 앱 엔트리에서 시작 호출

권장 위치: src/main.jsx

```javascript
import { startClarity } from './lib/clarity';

startClarity();
```

startClarity 호출은 React 렌더 이전 또는 직후 모두 가능하지만, 중복 초기화 방지 로직을 반드시 포함하세요.

### 4.4 SPA 라우트 식별(권장)

Clarity 공식 문서는 페이지 단위 식별 호출을 권장합니다.
라우트 변경 시 아래 중 하나를 수행하세요.

- identify 호출(사용자/세션/페이지 식별자 전달)
- custom event 또는 custom tag를 라우트 기준으로 기록

예시(개념)

```javascript
identifyClarity(userStableId, sessionId, location.pathname, userHint);
setClarityTag('route', location.pathname);
```

주의: customId는 내부 안정 식별자 사용을 권장하며, 이메일/전화번호 등 직접 식별 가능한 값 사용은 최소화하세요.

---

## 5) Consent(동의) 연동 표준

### 5.1 왜 필요한가

- EEA/UK/CH 트래픽에서 동의 처리 미흡 시 쿠키 기반 기능이 제한될 수 있습니다.
- Clarity 최신 권장 API는 consentv2입니다.

### 5.2 이벤트 기반 연동 예시

사이트 쿠키 배너(CMP 또는 자체 배너)에서 동의 상태가 확정되면 아래 함수를 호출합니다.

```javascript
setClarityConsentV2('granted', 'granted');
// 또는
setClarityConsentV2('denied', 'granted');
// 또는
setClarityConsentV2('denied', 'denied');
```

실무 포인트

- 기본 상태를 denied로 시작하고, 사용자 선택 시 갱신하는 방식이 안전합니다.
- 배너 이벤트가 앱 최초 로드 이후 발생할 수 있으므로, Clarity 초기화 순서와 이벤트 타이밍을 함께 점검하세요.

---

## 6) 검증 절차 (반드시 수행)

### 6.1 브라우저 네트워크 검증

1. 사이트 접속 후 개발자 도구 Network 탭 열기
2. collect 요청 필터링
3. https://www.clarity.ms/collect POST 요청 존재 확인

### 6.2 Clarity 콘솔 검증

1. 프로젝트 대시보드에서 실시간 사용자 유입 확인
2. Recordings/Heatmaps 데이터 유입 확인

### 6.3 SPA 라우트 검증

1. 페이지 전환(홈 -> 목록 -> 상세) 수행
2. route 태그/이벤트/식별자가 의도대로 구분되는지 확인

### 6.4 Consent 검증

1. 동의 거부 상태에서 쿠키/기능 제한 동작 확인
2. 동의 허용 후 추적 동작 확장 확인

---

## 7) 문제 해결 가이드

### 증상 A: 데이터가 전혀 안 들어옴

- VITE_CLARITY_ENABLED 값 확인
- VITE_CLARITY_PROJECT_ID 오타 확인
- 빌드 산출물에 환경변수 반영 여부 확인
- Network에 collect 요청 유무 확인

### 증상 B: 특정 페이지만 추적 누락

- SPA 라우트 전환 시 식별/태그 호출 여부 확인
- 조건부 렌더링 분기에서 호출이 스킵되는지 확인

### 증상 C: 동의 배너 연동 후 추적 불안정

- consentv2 호출 시점 점검(초기화 이후인지)
- 배너 상태 이벤트가 중복 발생하는지 확인
- granted/denied 값 오탈자 확인

---

## 8) 보안/개인정보 운영 기준

- 개인정보처리방침에 Clarity 사용 목적, 수집 항목, Microsoft Privacy Statement 링크를 반영합니다.
- 사이트 푸터 또는 접근 쉬운 위치에 사이트 고지 문구를 추가합니다.
- 민감한 입력 필드는 기본 마스킹 외에 추가 보호 정책(필요 시 CSS selector 기반 마스킹 설정)을 검토합니다.

권장 참조

- Privacy disclosure 샘플: https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
- Microsoft Privacy Statement: https://www.microsoft.com/privacy/privacystatement

---

## 9) 운영 체크리스트

- [ ] 운영용 Clarity 프로젝트 ID가 정확히 설정됨
- [ ] 운영 빌드에서만 활성화됨
- [ ] collect POST 요청 확인 완료
- [ ] Clarity 대시보드 유입 확인 완료
- [ ] SPA 라우트별 식별/태그 전략 반영 완료
- [ ] 동의(Consent v2) 연동 및 거부/허용 시나리오 검증 완료
- [ ] 개인정보처리방침/사이트 고지 문구 반영 완료

---

## 10) 권장 작업 순서(에이전트/개발자 공통)

1. Clarity 프로젝트 생성 및 Project ID 확보
2. 환경변수 파일 반영(.env.production 중심)
3. src/lib/clarity.js 유틸 작성
4. src/main.jsx에서 초기화 연결
5. 라우트 변경 시 identify/tag/event 전략 반영
6. 동의 배너와 consentv2 연동
7. Network/대시보드/라우트/동의 시나리오 검증
8. 개인정보 고지 문구 업데이트

이 순서를 따르면 신규 작업자도 누락 없이 배포 가능한 수준까지 도달할 수 있습니다.
