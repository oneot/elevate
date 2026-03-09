title: 🔎 수행평가 채점은 끝났는데... 다음 수업은 어떻게 하시나요? ‘분석가(Analyst)’로 수행평가 결과 바로 수업에 쓰기
tags: [copilot, productivity, agent]
date: 2026-01-26
excerpt: ‘분석가(Analyst)’로 수행평가 결과 바로 수업에 쓰기
series: "Copilot 입문 가이드"
seriesOrder: 9
---
> **이런 순간, 익숙하지 않으신가요?** <br>
별도로 정리하지 않은 채점표 데이터를 그대로 Microsoft 365 Copilot의 ‘분석가(Analyst)’에 맡겨보면, 반 전체에서 공통으로 막힌 지점과 학습 격차가 자연스럽게 드러납니다. 교사는 감이 아닌 근거를 바탕으로 보충 지도가 필요한 학생을 묶고, 다음 차시에서 무엇을 다시 설명할지 판단할 수 있습니다. 채점 이후의 애매한 고민이, 수업 설계로 이어지는 명확한 출발점이 되는 순간입니다.

> ⚠️ 참고 <br>
분석가(Analyst)는 Microsoft 365 Copilot이 활성화된 사용자만 사용할 수 있습니다. <br>
본 시나리오는 Copilot 사용 환경을 기준으로 진행합니다. <br>
자세한 플랜은 [Microsoft 365 Copilot 플랜 및 가격—비즈니스용 AI | Microsoft 365](https://www.microsoft.com/ko-kr/microsoft-365-copilot/pricing) 을 참고하세요.

# 📚 STEP 0. 사전 준비 환경

**사용 데이터**

- 수행평가_루브릭_점수_더미데이터_25명_완전실제버전.xlsx 

**이 파일의 특징**

- 아래 정보 포함 
    - 학생 정보 
    - 수행평가명 
    - 제출 상태 
    - 루브릭 점수(1~4) 
        - 개념 이해 
        - 풀이 과정 
        - 서술/표현 
        - 태도/참여 
    - 교사 코멘트(선택) 

# 🧠 STEP 1. 분석가(Analyst) 실행

![image](/images/m365Copilot/analyst/img1.png)

먼저 **Microsoft 365 Copilot**을 실행한 뒤, 좌측 **[에이전트]** 메뉴에서  **[분석가]**를 선택합니다.

# 🔎 STEP 2. 반 전체 흐름 먼저 보기

![image](/images/m365Copilot/analyst/img2.png)

**[작업 콘텐츠 추가]**를 통해 수행평가 채점 **엑셀 파일을 업로드**합니다. 

![image](/images/m365Copilot/analyst/img3.png)

![image](/images/m365Copilot/analyst/img4.png)

아래 프롬프트을 **분석가에게 그대로 입력**합니다.

> 이 수행평가 루브릭 점수를 바탕으로 반 전체에서 가장 약한 루브릭 항목이 무엇인지 정리해줘.

![image](/images/m365Copilot/analyst/img5.png)

![image](/images/m365Copilot/analyst/img6.png)

분석가는 자동으로

- 루브릭 항목별 평균 비교
- 반 전체에서 가장 취약한 영역 

을 정리해서 보여줍니다.


# 👥 STEP 3. 학생별·소그룹으로 보기

이번에는 학생 단위로 질문해봅니다.

> 각 학생별로 가장 취약한 루브릭 항목 1~2개씩 정리해줘.

![image](/images/m365Copilot/analyst/img7.png)

그리고 이어서 이렇게 묻습니다.

> 이 결과를 바탕으로 소그룹 보충 지도가 필요해 보이는 학생들을 묶어줘.

![image](/images/m365Copilot/analyst/img8.png)

![image](/images/m365Copilot/analyst/img9.png)

👉 선생님이 명단을 하나하나 보지 않아도

👉 **보충 대상 학생들이 자동으로 정리**됩니다.

# ✍️ STEP 4. 다음 차시 수업 결정하기

이제 분석 결과를 수업으로 바로 연결합니다.

> 다음 수업에서 전체 학생 대상으로 꼭 짚고 가야 할 보충 내용 3가지를 제안해줘.

![image](/images/m365Copilot/analyst/img10.png)

Copilot이 추천해 준 프롬프트로 수업 활동안을 만들어볼 수 있습니다.

![image](/images/m365Copilot/analyst/img11.png)

![image](/images/m365Copilot/analyst/img12.png)

## 📌 분석가가 해준 일 정리

분석가는 다음 일을 대신 해주었습니다.

- 루브릭 점수 자동 계산 
- 반 전체 강·약점 정리 
- 학생 유형별 분류 
- 소그룹 지도 대상 추천 
- 다음 차시 수업 방향 제안 

이걸 하나하나 보려면 명단 들고 다시 엑셀을 열게 됩니다.

분석가는 이 정리를 데이터를 기반으로 몇 초 만에 해줍니다.

# 🎉 마무리

이제 **'분석가'**와 함께라면 다음 수업을 **감이 아니라 근거로 결정**하고 보충 대상 학생을 **놓치지 않고** 수행평가 결과를 **바로 수업에 활용**할 수 있습니다. 

**💡 TIP — 이렇게도 확장할 수 있어요**

- 중간·기말·수행평가 통합 분석 
- 생활기록부 서술 초안 생성 
- 학생별 학습 코칭 문장 자동 제안
    