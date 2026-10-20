/**
 * @file postText.js
 * @description 블로그 게시글의 화면용 제목과 부제목(요약).
 *
 * 서버(관리자)에 저장된 글은 그대로 두고, 화면에서만 다듬은 제목과 부제목을 보여 준다.
 * - 제목: 이모지를 빼고, 카테고리 이름이 이미 보이므로 제목 안의 앱 이름은 덜어 냈다.
 * - 부제목: 제목에 이어서 읽히도록, 글에서 무엇을 어떻게 하는지 한 문장으로 적었다.
 * - 각 항목은 [서버의 원래 문구, 화면 문구] 쌍이다. 원래 문구와 같을 때만 바꾸므로,
 *   관리자에서 제목이나 요약을 고치면 고친 문구가 그대로 나온다 (항목마다 따로 판단).
 */

export const POST_TEXT_OVERRIDES = [
  // M365
  {
    title: ["💡PowerShell로 M365 이름 일괄변경하기", "PowerShell로 표시 이름 일괄 변경하기"],
    excerpt: ["PowershellM365 이름변경 방법", "관리 환경을 한 번 설정해 두고, 여러 계정의 표시 이름을 한꺼번에 바꿉니다."],
  },
  {
    title: ["🔽 M365 최신버전 오피스 설치하기", "최신 Office 설치하기"],
    excerpt: ["M365 최신버전 오피스 설치", "교육용 계정으로 포털에 접속해 최신 Office 앱을 설치하고 설치를 확인합니다."],
  },
  {
    title: ["📘 Microsoft 365 교육용 계정 만들기 - 교육청 포털에서 시작하기", "교육용 계정 만들기"],
    excerpt: ["STEP 0. 어디서 만들어야 할까?", "우리 교육청의 M365 포털을 찾아 계정을 만들고, 바로 쓰는 방법까지 안내합니다."],
  },

  // Copilot
  {
    title: ["Copilot과 함께 수업설계하기", "수업 설계하기"],
    excerpt: ["Copilot과 함께 수업설계를 해봅시다.", "Chat으로 자리 배치 활동과 세특 작성을 설계하고, 피드백 에이전트도 만들어 봅니다."],
  },
  {
    title: ["Teach와 함께 수업 설계 및 루브릭 생성하기", "Teach로 수업 계획과 루브릭 만들기"],
    excerpt: ["Teach로 수업설계, 루브릭 생성", "예시 프롬프트를 붙여 넣으면 학생 참여형 수업안과 평가 기준표가 문서로 나옵니다."],
  },
  {
    title: ["Copilot with Edge_ 코파일럿 교육 현장에서 활용하는 6가지 방법", "Edge 수업 활용법 6가지"],
    excerpt: ["1. Copilot + Edge로 AIDT처럼 활용하기", "교과서 PDF를 AI 교과서처럼 쓰는 법부터 외국어 공부, 나이스 연동까지 알아봅니다."],
  },
  {
    title: ["Copilot with Edge_ 엣지와 함께쓰면 더 빛나는 코파일럿의 기능들", "Edge와 함께 쓰기"],
    excerpt: ["1. Copilot with Edge를 하는 이유", "Edge 기본 설정을 마치고 뉴스 요약, PDF 분석 같은 기능을 수업에 활용합니다."],
  },
  {
    title: ["Microsoft Designer_ 학교 계정 코파일럿으로도 충분합니다. 당신도 AI 전문가!", "웹 버전 활용 꿀팁"],
    excerpt: ["1. Web Microsoft Copilot 인터페이스", "학교 계정으로 쓰는 웹 버전 화면을 익히고, 프롬프트 카드로 차트까지 만들어 봅니다."],
  },
  {
    title: ["Microsoft Designer + Copilot 예술 지식 없이도 전문 디자이너로!", "Designer로 이미지 만들기"],
    excerpt: ["1. Microsoft Designer 란?", "글로 원하는 장면을 설명해 수업에 쓸 이미지를 만들고 다듬는 방법을 알아봅니다."],
  },
  {
    title: ["Copilot_ 학교의 혁신을 이끄는 AI 파트너, 코파일럿, 지금 시작하세요!", "시작하기"],
    excerpt: ["1. Copilot이란?", "Copilot의 주요 기능과 종류를 알아보고, 학교 계정으로 접속하는 방법까지 익힙니다."],
  },
  {
    title: ["Prompt Coach", "Prompt Coach로 프롬프트 다듬기"],
    excerpt: ["‘프롬프트 코치(Prompt Coach)’로 똑똑하게 AI 프롬프트 작성하기", "하고 싶은 일을 말하듯 적으면 더 명확한 프롬프트를 추천받아 바로 쓸 수 있습니다."],
  },
  {
    title: ["🔎 작년 계획안 또 찾고 계신가요? '리서치 도구'로 바로 재사용하기", "리서치 도구로 계획안 재사용하기"],
    excerpt: ["‘리서치 도구(Researcher)’로 작년 계획안 바로 재사용하기", "흩어진 지난 몇 년의 현장체험학습 계획안을 한 번에 찾아 올해 초안으로 만듭니다."],
  },
  {
    title: ["M365 Copilot으로 나만의 에이전트 만들기", "나만의 에이전트 만들기"],
    excerpt: ["이런 순간, 익숙하지 않으신가요? <br \"이번 시험 범위가 어디인가요?\", \"과제 설명 다시 해주세요.\" 학급 운영 중 끊임없이 반복되는 학생들의 질문은 교사의 업무 피로도를 높이는 주요 원인입니다. 이러한 번거로움을 해결하기 위해 수업 규칙, 출석 규정, 활동 일정 등에 자동 응답하", "반복되는 학생 질문에 대신 답해 주는 학급 도우미 에이전트를 만들고 공유합니다."],
  },
  {
    title: ["M365 Copilot과 채팅하기", "채팅으로 수업 준비물 만들기"],
    excerpt: ["M365 Copilot 사용하기", "작년 학습지와 수행평가 결과를 함께 넣어 올해 학생에게 맞는 준비물로 다시 만듭니다."],
  },
  {
    title: ["🔎 수행평가 채점은 끝났는데... 다음 수업은 어떻게 하시나요? ‘분석가(Analyst)’로 수행평가 결과 바로 수업에 쓰기", "분석가로 수행평가 결과 활용하기"],
    excerpt: ["‘분석가(Analyst)’로 수행평가 결과 바로 수업에 쓰기", "채점표를 그대로 맡겨 반 전체와 학생별 흐름을 보고, 다음 차시 수업을 정합니다."],
  },

  // Copilot Studio
  {
    title: ["AI Creative Agent Team 제작하기", "AI Creative Agent Team 만들기"],
    excerpt: ["Copilot Studio를 활용해 AI Creative Agent Team을 만든다.", "아이디어 하나로 발표 자료와 포스터 등 5가지 결과물을 만드는 에이전트 팀을 꾸립니다."],
  },
  {
    title: ["Copilot Studio에서 단일 에이전트에서 멀티 에이전트까지 직접 만들어보기", "단일부터 멀티 에이전트까지 만들기"],
    excerpt: ["Copilot Studio에서 단일 에이전트를 시작으로 멀티 에이전트까지 직접 만들어보는 실습을 해봐요", "맞춤법 탐정단 챗봇부터 Skill, 부모·자식 에이전트 연결까지 차례로 만들어 봅니다."],
  },
  {
    title: ["Copilot Studio에서 Workflow로 API 연동하기", "Workflow로 날씨 API 연동하기"],
    excerpt: ["Copilot Studio에 기상청 API를 연결하여 사용자의 지역·시각 요청에 맞는 실제 관측 날씨를 조회하는 AI 에이전트를 구축합니다.", "기상청 API를 연결해 지역·시각에 맞는 실제 관측 날씨를 알려 주는 에이전트를 만듭니다."],
  },
  {
    title: ["나만의 무드 타입 테스트 만들기", "무드 타입 테스트 만들기"],
    excerpt: ["MBTI 테스트처럼 나만의 테스트를 만들어봅니다.", "질문 몇 개로 나의 무드 타입과 추천 활동을 알려 주는 MBTI 스타일 봇을 만듭니다."],
  },
  {
    title: ["조선소 용접 품질 및 작업 지원 AI Agent 구축", "조선소 용접 지원 에이전트 만들기"],
    excerpt: ["현장 작업자가 자연어로 질문하면 필요한 정보를 즉시 제공하는 AI Agent를 구축합니다.", "용접 조건, 결함 원인, 작업 표준을 현장에서 바로 묻고 답을 얻는 에이전트를 구축합니다."],
  },
  {
    title: ["화학 공장 운영 및 사고 대응 에이전트 만들기", "화학 공장 사고 대응 에이전트 만들기"],
    excerpt: ["Copilot Studio를 활용하여 화학 공장의 운영 및 사고 대응을 지원하는 AI 에이전트를 만들어봅니다. ", "SOP와 안전 자료를 바탕으로 설비 이상과 사고 상황에 빠르게 답하는 에이전트를 만듭니다."],
  },

  // Teams
  {
    title: ["Microsoft Teams 발표자 진행(Speaker Progress)으로 학생들의 발표 능력 향상하기", "발표자 진행으로 발표 실력 키우기"],
    excerpt: ["1. 발표자 진행(Speaker Progress)", "AI가 발음과 속도, 군말을 분석해 주는 발표 과제를 내고 결과를 확인합니다."],
  },
  {
    title: ["Microsoft Teams 검색코치로 안정적으로 정보얻기", "검색 코치로 정보 찾기"],
    excerpt: ["1. Search Coach", "학생이 믿을 만한 정보를 찾도록 돕고, 검색 활동을 인사이트로 함께 살펴봅니다."],
  },
  {
    title: ["Microsoft Teams로 과제 및 성적 생성 관리하기", "과제와 성적 관리하기"],
    excerpt: ["1. 팀즈 과제 및 성적", "파일·퀴즈 과제를 내고 채점 기준표로 채점해 돌려준 뒤 성적을 한눈에 봅니다."],
  },
  {
    title: ["Microsoft Teams Reflect로 학생 정서적 상태 파악하기", "Reflect로 학생 마음 살피기"],
    excerpt: ["리플렉트는 팀이나 학생들을 정기적으로 감정 상태나 심리 상태를 체크할 수 있도록 돕는 도구입니다. 학생들이 현재 감정을 포현하고 교사가 이를 바탕으로 학생들의 정서적 상태를 이해하고 지원할 수 있도록 도울 수 있는 도구 입니다.", "정기 체크인으로 학생의 감정을 모으고, 상담과 생활 지도에 바로 활용합니다."],
  },
  {
    title: ["Microsoft Teams Reading Progress로 학생 읽기능력 향상하기", "읽기 진행으로 읽기 실력 키우기"],
    excerpt: ["1. 읽기 진행(Reading Progress)", "학생이 소리 내어 읽은 녹음을 AI가 분석해 발음과 유창성을 함께 키웁니다."],
  },
  {
    title: ["Microsoft Teams 화상회의하기", "화상 회의하기"],
    excerpt: ["1. 팀즈 화상회의(모임) 예약 및 설정", "팀이나 일정에서 화상 수업을 예약하고, 화면 구성과 여러 기능을 익힙니다."],
  },
  {
    title: ["Microsoft Teams 수업용 전자필기장 생성하기", "수업용 전자필기장 만들기"],
    excerpt: ["1. 팀즈 수업용 전자필기장 생성", "팀에서 바로 전자필기장을 만들어 학생 노트를 한곳에서 보고 자료를 나눠 줍니다."],
  },
  {
    title: ["Microsoft Teams 팀 생성하기", "팀 만들기"],
    excerpt: ["Teams에서 팀을 생성하는 것은 업무를 위한 것이 될 수도 있고 수업을 위해 온라인 교실을 만드는 것이 될 수도 있습니다.", "수업·PLC·직원 중 알맞은 유형으로 팀을 만들고 구성원을 초대합니다."],
  },
  {
    title: ["Microsoft Teams란?", "시작하기"],
    excerpt: ["1. Microsoft Teams 소개 Microsoft Teams는 Microsoft 365에 속해있는 앱으로 마이크로소프트가 제공하는 다양한 서비스를 한 곳으로 연결하는 역할을 합니다. 다시 말해 Microsoft Teams는 대화, 콘텐츠 및 앱을 함께 제공하는 Microsoft의", "Teams가 무엇인지 알아보고 웹·데스크톱·모바일 사용법과 기본 설정을 익힙니다."],
  },
  {
    title: ["Microsoft Teams Insights로 학습관리 및 성과분석하기", "Insights로 학습 분석하기"],
    excerpt: ["1. Insights", "학생의 참여도와 과제, 읽기 기록을 데이터로 모아 학습 흐름을 분석합니다."],
  },
  {
    title: ["Microsoft Teams 홈페이지 생성하기", "팀 홈페이지 만들기"],
    excerpt: ["홈페이지는 팀즈의 전반적인 상황을 보여주거나 그 외에 이 팀에 필요한 다양한 요소나 콘텐츠를 추가 하여 보여줄 수 있는 옵션입니다. 정보 공유 허브, 공지 사항 및 업데이트, 맞춤형 콘텐츠 제공, 팀 생산성 향상을 돕습니다. 팀의 커뮤니케이션과 정보 전달을 원활하게 하고, 모든 팀원 이", "공지와 자료를 한 화면에 모은 팀 홈페이지를 만들고 섹션과 웹 파트로 꾸밉니다."],
  },
  {
    title: ["Microsoft Teams 파일탭으로 문서관리하기", "파일 탭으로 문서 관리하기"],
    excerpt: ["Teams의 파일탭은 우리 팀의 클라우드입니다. 파일에 저장되는여러 가지 문서는 SharePoint에 저장되어 팀즈 안에서 곳곳에서 확인할 수 있습니다. 예를 들어 게시물에 올린 파일을 파일 탭에서도 확인할 수 있습니다.", "팀 파일을 폴더로 정리하고, 올린 문서를 팀원과 함께 열어 편집합니다."],
  },
  {
    title: ["Microsoft Teams 수업활동으로 수업 체계적으로 관리하기", "수업 활동 모듈 만들기"],
    excerpt: ["수업활동은 팀즈의 학습 활동을 좀 더 체계적으로 모듈화 할 수 있도록 도와주는 메뉴입니다. 교사들이 수업 자료와 링크, 과제 또는 수업용 전자필기장을 추가하여 더 체계적으로 수업을 관리할 수 있습니다.", "수업 자료와 링크, 과제를 모듈로 묶어 차시별로 체계 있게 관리합니다."],
  },
  {
    title: ["Microsoft Teams 채널 및 게시물 생성 관리하기", "채널과 게시물 관리하기"],
    excerpt: ["채널은 Teams 안에 있는 소모임이라고 볼 수 있습니다. 채널에도 학생들을 할당할 수 있어 조별과제를 할 때 조별로 토의할 수 있는 인터넷 교실 공간을 만들어 줄 수 있습니다. 또는 업무용으로 팀즈를 사용할 때 업무별로 구분을 지어둘 수도 있습니다.", "조별·업무별 채널을 만들고 게시물로 공지와 토의를 나눕니다."],
  },

  // OneNote
  {
    title: ["📘 Onenote 수업용 전자필기장 - 과제, 수학도우미", "수업용 전자필기장 활용하기"],
    excerpt: ["1. OneNote ClassNote (수업용 전자필기장)의 구조", "페이지를 배포하고 과제를 검토하며, 수학 도우미 같은 기능까지 수업에 씁니다."],
  },
  {
    title: ["📘 캘린더와 더 편리하게 사용하기", "캘린더와 함께 쓰기"],
    excerpt: ["1. Onetastic", "Onetastic을 설치해 노트에 캘린더를 넣고 교무수첩·공문서철과 연결합니다."],
  },
  {
    title: ["📘 모바일에서도 노트 바로 확인하기", "모바일에서 노트 확인하기"],
    excerpt: ["1. 원노트 모바일 앱 활용하기", "휴대폰 앱으로 노트를 열어 보고, Lens로 종이 자료를 스캔해 바로 담습니다."],
  },
  {
    title: ["📘 Onenote 학교에서 바로 사용해보기 - 교무수첩, 공문서철, 상담록", "학교 업무에 바로 활용하기"],
    excerpt: ["STEP 1. Onenote 구조 이해하기", "교무수첩, 공문서철, 상담록을 노트로 만들어 학교 업무를 한곳에서 정리합니다."],
  },
  {
    title: ["📘 Onenote로 자료 정리하기 기초 - 기본 기능부터 유용한 Tip까지", "자료 정리 기초 익히기"],
    excerpt: ["이런 순간, 익숙하지 않으신가요? <br 학교 업무를 정리할 시간이 부족한 선생님에게 매 학기 반복되는 교무수첩 기록, 상담 내용 정리, 동아리 출석부 관리 등은 큰 부담으로 다가옵니다. 종이로 흩어진 문서와 자료가 책상 위에 쌓여갈수록 필요한 정보를 찾기 어려워지고, 업무 효율도 떨어", "흩어진 기록을 하나의 노트로 모으고, 음성·Copilot 기능으로 더 빠르게 정리합니다."],
  },

  // Forms
  {
    title: ["Microsoft Forms 설정 및 결과 확인하기", "설정하고 응답 확인하기"],
    excerpt: ["6. Forms 설정하기", "스타일과 응답 설정을 마친 뒤 결과를 확인하고 프레젠테이션으로 공유합니다."],
  },
  {
    title: ["Microsoft Forms 퀴즈 만들기", "퀴즈 만들기"],
    excerpt: ["5. Forms 퀴즈 만들기 및 기능", "문항별 점수와 자동 채점을 설정해 수업에서 바로 쓰는 퀴즈를 만듭니다."],
  },
  {
    title: ["Microsoft Forms 질문 항목 양식 알아보기", "질문 유형 알아보기"],
    excerpt: ["2. 질문 양식 알아보기", "선택형, 텍스트, 평가, 리커트 척도, 파일 업로드 등 질문 형식을 하나씩 살펴봅니다."],
  },
  {
    title: ["Microsoft Forms 섹션 나누기", "섹션 나누기"],
    excerpt: ["3. Forms 섹션 나누기", "질문을 섹션으로 묶고, 응답에 따라 다른 섹션으로 이동하도록 설정합니다."],
  },
  {
    title: ["Microsoft Forms 시작하기", "시작하기"],
    excerpt: ["Microsoft Forms란?", "설문과 퀴즈를 쉽게 만드는 Forms를 소개하고, 수업에서 쓰는 방법을 알아봅니다."],
  },

  // OneDrive
  {
    title: ["📖 Onedrive로 어디서나 안전하게 저장·공유·협업하기", "저장·공유·협업하기"],
    excerpt: ["STEP 1. Onedrive", "교육용 계정의 1TB 클라우드에 파일을 저장하고, 웹과 앱에서 공유하며 함께 작업합니다."],
  },
  {
    title: ["📖 OneDrive 모바일로 사용하기", "모바일에서 사용하기"],
    excerpt: ["1. 모바일 OneDrive", "iPhone과 Android 앱으로 학교 문서를 어디서나 열어 보고 관리합니다."],
  },

  // PowerPoint
  {
    title: ["PowerPoint Online 시작하기 6", "3D 모델과 번역 기능 쓰기"],
    excerpt: ["PowerPoint Online 시작하기 #6", "데스크톱 앱에서 3D 모델을 넣고, 슬라이드를 다른 언어로 번역해 봅니다."],
  },
  {
    title: ["PowerPoint Online 시작하기 5", "저장하고 공유하기"],
    excerpt: ["PowerPoint Online 시작하기 #5", "검토 탭으로 함께 작업하고, 버전 기록을 보며 여러 형식으로 내보냅니다."],
  },
  {
    title: ["PowerPoint Online 시작하기 4", "전환 효과와 애니메이션 넣기"],
    excerpt: ["PowerPoint Online 시작하기 #4", "슬라이드 전환과 애니메이션에 자막까지 더해 Teams에서 발표합니다."],
  },
  {
    title: ["PowerPoint Online 시작하기 3", "그리기와 디자인 활용하기"],
    excerpt: ["PowerPoint Online 시작하기 #3", "펜으로 슬라이드에 바로 표시하고, 디자인 탭에서 레이아웃을 손쉽게 바꿉니다."],
  },
  {
    title: ["PowerPoint Online 시작하기 2", "텍스트·도형·이미지 넣기"],
    excerpt: ["PowerPoint Online 시작하기 #2 1. PowerPoint 기본 삽입 기능", "슬라이드를 추가하고 글과 도형, 사진·영상을 넣어 안내 팸플릿을 만들어 봅니다."],
  },
  {
    title: ["PowerPoint Online 시작하기 1", "웹 버전 시작하기"],
    excerpt: ["1. PowerPoint web 알아보기", "원하는 폴더에 새 프레젠테이션을 만들고 이름 설정과 기본 메뉴를 익힙니다."],
  },
  {
    title: ["📖 PowerPoint로 쉽게 강의자료 만들기", "강의 자료 쉽게 만들기"],
    excerpt: ["STEP 1. PowerPoint", "웹과 앱 버전의 차이를 알고, 교육용 계정으로 수업 자료를 빠르게 만듭니다."],
  },

  // Excel
  {
    title: ["Excel Online 시작하기 5", "학교 공유 문서 만들기"],
    excerpt: ["Excel Online 시작하기 #5", "연수 확인, 동아리, 물품 구입, 진도표처럼 함께 채우는 학교 문서 예시를 살펴봅니다."],
  },
  {
    title: ["Excel Online 시작하기 4", "공유하고 인쇄하기"],
    excerpt: ["Excel Online 시작하기 #4 1. Excel 공유 및 인쇄 설정", "링크로 공유하고 셀 잠금과 틀 고정을 건 뒤, 원하는 영역만 인쇄합니다."],
  },
  {
    title: ["Excel Online 시작하기 3", "채우기·정렬·필터 활용하기"],
    excerpt: ["Excel Online 시작하기 #3", "연속 데이터와 빠른 채우기로 학번·이름을 정리하고, 정렬과 필터로 찾습니다."],
  },
  {
    title: ["Excel Online 시작하기 2", "데이터 입력하고 서식 바꾸기"],
    excerpt: ["Excel Online 시작하기 #2", "셀에 값을 입력하고 크기, 맞춤, 숫자 서식을 바꾸는 기본기를 익힙니다."],
  },
  {
    title: ["Excel Online 시작하기 1", "웹 버전 시작하기"],
    excerpt: ["1. Excel Web 알아보기", "원하는 폴더에 새 통합 문서를 만들고 이름 설정과 리본 메뉴를 익힙니다."],
  },
  {
    title: ["📖 Excel로 데이터 쉽게 관리하기", "데이터 쉽게 관리하기"],
    excerpt: ["STEP 1. Excel", "웹과 앱 버전을 오가며 학교 데이터를 표로 정리하고 분석하는 첫걸음을 뗍니다."],
  },
  {
    title: ["Excel로 급식지도 담당 한번에 배정하기", "급식 지도 당번 배정하기"],
    excerpt: ["이런 순간, 익숙하지 않으신가요? <br 새 학기가 되고, 학생들이 학교에 오면서 급식지도 당번을 정해야 합니다.  그러나 학급 급식 당번을 배정할 때마다 매번 일정을 맞추고, 중복되지 않도록 관리하는 과정은 생각보다 많은 시간이 듭니다. 특히 업무가 몰리는 시기에는 이 작업만으로도 업", "템플릿에 기본 정보만 넣으면 Copilot이 겹치지 않게 당번을 배정해 줍니다."],
  },
  {
    title: ["Excel로 담당 학급 성적 관리하기", "학급 성적 관리하기"],
    excerpt: ["이런 순간, 익숙하지 않으신가요? <br 시험 기간마다 과목별 담당 교사들이 보내는 성적 엑셀 파일을 모아 하나의 통합 자료로 만드는 일은 생각보다 많은 시간이 걸립니다. 매번 파일을 열어 형식을 맞추고, 피벗테이블을 새로 만들어 학급별·과목별·성별 성적을 다시 분석하다 보면 정작 결과", "폴더에 모은 성적 파일을 자동으로 합치고 피벗 테이블로 바로 분석합니다."],
  },

  // Word
  {
    title: ["Microsoft Word_ 기본 템플릿을 이용하여 학교 현장 활용 방안", "템플릿으로 학교 문서 만들기"],
    excerpt: ["1. 행사 전단 템플릿 활용하여 학교 축제 전단지 만들기", "행사 전단과 학생 보고서 템플릿으로 축제 홍보물과 팀 과제를 만들어 봅니다."],
  },
  {
    title: ["Microsoft Word_ 워드를 사용할 때 반드시 알아야할 꿀팁 모음", "꼭 알아야 할 꿀팁"],
    excerpt: ["1. 스타일 기능을 활용한 상담일지 작성", "스타일로 상담일지를 정리하고, 받아쓰기와 단축키로 작업 속도를 높입니다."],
  },
  {
    title: ["Microsoft Word_ 워드 온라인 인터페이스 한방에 이해하기_02", "메모와 공유 기능 알아보기"],
    excerpt: ["2. 워드 온라인 세부 인터페이스 설명", "메모와 따라잡기, 편집 모드, 공유 메뉴로 함께 쓰는 문서를 관리합니다."],
  },
  {
    title: ["Microsoft Word_ 워드 온라인 인터페이스 한방에 이해하기_01", "화면 구성 알아보기"],
    excerpt: ["1. 워드 온라인 기본 화면 인터페이스 설명", "기본 화면과 레이아웃·검토·보기 탭을 살펴보고, 추천 초기 설정을 해 둡니다."],
  },
  {
    title: ["Microsoft Word_ 글로벌 문서 작업 플랫폼 Word! 온라인 접속 방법 및 데이터 관리", "웹 버전 시작하기"],
    excerpt: ["1. Word 온라인이란?", "설치 없이 브라우저로 접속하는 여러 방법과 파일이 저장되는 위치를 알아봅니다."],
  },

  // Minecraft
  {
    title: ["Minecraft Education 시작하기 7", "PBL 수업하기"],
    excerpt: ["Minecraft Education 시작하기 #7", "미래 도시 설계처럼 현실 문제를 주고, 팀별로 해결하는 프로젝트 수업을 운영합니다."],
  },
  {
    title: ["Minecraft Education 시작하기 6", "명령어와 코딩 수업하기"],
    excerpt: ["Minecraft Education 시작하기 #6", "fill·give 명령어부터 MakeCode로 에이전트를 움직이는 코딩까지 영상으로 익힙니다."],
  },
  {
    title: ["Minecraft Education 시작하기 5", "수업 라이브러리 활용하기"],
    excerpt: ["Minecraft Education 시작하기 #5", "픽셀 초상화 등 처음 해 보기 좋은 추천 수업 3가지를 영상과 함께 소개합니다."],
  },
  {
    title: ["Minecraft Education 시작하기 4", "건축 창작 수업하기"],
    excerpt: ["Minecraft Education 시작하기 #4", "가상 공간에서 직접 설계하고 짓게 하며 공간 감각과 협업 능력을 키웁니다."],
  },
  {
    title: ["Minecraft Education 시작하기 3", "월드 만들고 수업 시작하기"],
    excerpt: ["Minecraft Education 시작하기 #3 \"Minecraft Education: 마인크래프트 수업을 위한 기본 팁과 코딩 수업에 대한 간단한 방법을 제공합니다.\"", "새 월드를 만들거나 수업 라이브러리를 열고, 학생과 함께 접속해 수업을 시작합니다."],
  },
  {
    title: ["Minecraft Education 시작하기 2", "기본 화면과 설정 알아보기"],
    excerpt: ["Minecraft Education 시작하기 #2", "첫 화면 메뉴와 의상·계정 설정, 터치 모드와 월드 백업 위치를 확인합니다."],
  },
  {
    title: ["⛏️ Minecraft와 함께 게임으로 학습하기", "설치하고 시작하기"],
    excerpt: ["STEP 1. Minecraft Education", "교육용 계정으로 설치하고 로그인한 뒤, 수업에 쓸 교육 자료를 둘러봅니다."],
  },
  {
    title: ["Minecraft Education Block Coding", "블록 코딩 시작하기"],
    excerpt: ["이런 순간, 익숙하지 않으신가요? <br 코딩에 처음 입문하는 학생들은 어려운 문법보다, 눈앞에서 바로 반응이 보이는 활동을 더 재미있어 합니다.  Minecraft Education에서 Code Builder로 블록코딩을 하며 Agent를 직접 움직이게 하면, 학생들은 ‘코드 한 줄’", "Code Builder로 블록을 맞춰 에이전트를 움직이며 코딩을 게임처럼 익힙니다."],
  },

  // GitHub
  {
    title: ["깃허브 페이지에 코파일럿 스튜디오 에이전트 배포하기", "Pages에 에이전트 배포하기"],
    excerpt: ["깃허브 페이지에서 코파일럿 스튜디오 에이전트 배포 방법을 알아보겠습니다.", "저장소와 index.html 하나로 에이전트를 내 github.io 주소의 웹앱으로 올립니다."],
  },
  {
    title: ["Copilot Studio로 만든 에이전트를 웹사이트로 만들기", "에이전트를 웹사이트로 만들기"],
    excerpt: ["Copilot Studio로 만든 에이전트를 GitHub Pages로 배포해봐요", "에이전트를 게시한 뒤 저장소를 만들고 Pages로 웹사이트에 띄워 봅니다."],
  },
  {
    title: ["Github Copilot으로 바이브코딩 해보자!", "Copilot으로 바이브 코딩하기"],
    excerpt: ["Github Pages에 배포한 웹앱을 Github Copilot을 활용한 바이브 코딩으로 고도화합니다.", "Pages에 올린 웹앱 코드를 대화로 검사하고 디자인을 고쳐 나만의 웹앱으로 키웁니다."],
  },
  {
    title: ["Copilot Studio로 Multi Model AI Agent 만들고 GitHub Pages에 배포하기", "멀티 모델 에이전트 만들고 배포하기"],
    excerpt: ["Copilot Studio를 활용해 여러 AI 모델이 역할을 나누어 처리하는 Multi Model AI Agent를 만듭니다. 완성된 에이전트를 Copilot Studio의 데모 웹사이트에서 테스트한 후, GitHub Pages를 이용해 나만의 AI 웹앱으로 배포해 보겠습니다.", "Claude와 GPT 등 여러 모델이 역할을 나눠 답하는 에이전트를 만들어 Pages로 배포합니다."],
  },

  // Azure
  {
    title: ["Secret Key 배포 - Azure Function을 통해 GitHub Pages에 안전하게 배포하기", "Secret Key 안전하게 배포하기"],
    excerpt: ["코파일럿 스튜디오 배포의 끝판왕! Secret Key 배포 방식을 Azure Function을 통해 GitHub Pages에 안전하게 배포하는 방법에 대해 알아봅시다.", "Secret은 Functions에 보관하고 단기 토큰만 건네, 브라우저에 키를 노출하지 않습니다."],
  },
];

const normalize = (text) => String(text || '').normalize('NFC').replace(/\s+/g, ' ').trim();

function buildLookup(field) {
  return new Map(
    POST_TEXT_OVERRIDES
      .filter((entry) => entry[field])
      .map((entry) => [normalize(entry[field][0]), entry[field][1]]),
  );
}

const TITLES = buildLookup('title');
const EXCERPTS = buildLookup('excerpt');

/** 게시글의 화면용 제목 (다듬은 제목이 없으면 서버 제목). */
export function getDisplayTitle(post) {
  const title = post?.title;
  return title ? (TITLES.get(normalize(title)) ?? title) : title;
}

/** 게시글의 화면용 부제목 (다듬은 부제목이 없으면 서버 요약). */
export function getDisplayExcerpt(post) {
  const excerpt = post?.excerpt;
  return excerpt ? (EXCERPTS.get(normalize(excerpt)) ?? excerpt) : excerpt;
}
