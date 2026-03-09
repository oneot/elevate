import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [directLine, setDirectLine] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false); // 봇 타이핑 상태 관리
  const typingTimeoutRef = useRef(null); // 타이핑 타임아웃 관리


  useEffect(() => {
    try {
      // 1. Vite 환경 변수에서 GitHub Secrets로 주입한 키를 직접 꺼내옵니다.
      const secretKey = import.meta.env.VITE_DIRECT_LINE_SECRET;

      if (!secretKey) {
        console.error("환경 변수에서 Secret Key를 찾을 수 없습니다.");
        return;
      }

      // 2. 서버 통신 없이 직접 Secret Key로 Direct Line을 초기화합니다.
      // (주의: 받아온 토큰이 아니므로 'token' 대신 'secret' 파라미터에 넣습니다)
      const dl = createDirectLine({ secret: secretKey });
      
      setDirectLine(dl);
      
    } catch (err) {
      console.error("비상 연결 실패:", err);
    }
    /* [Azure Function 복구 시 기존 코드 롤백 예정]

    const getSecureToken = async () => {
      try {
        const response = await fetch('https://af01-ceh2a2e2ezgda9a6.koreacentral-01.azurewebsites.net/api/GetToken');
        if (!response.ok) throw new Error('토큰을 가져오지 못했습니다.');
        const data = await response.json();
        const dl = createDirectLine({ token: data.token });
        setDirectLine(dl);
      } catch (err) {
        console.error("보안 연결 실패:", err);
      }
    };
    getSecureToken();
    */

  }, []); // 빈 배열 유지 (페이지 로드 시 한 번만 실행)

  // ✅ 로딩 애니메이션 (말풍선 배경 제거됨, 점만 둥둥)
  const LoadingSpinner = () => (
    <div className="flex space-x-1.5 p-2 animate-fade-in-up">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );

  // ✅ 스토어 설정: 봇의 상태(Typing/Message)를 실시간으로 감시
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => (next) => (action) => {
        // 1. 봇의 행동 감지
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const { activity } = action.payload;

          // (A) 봇이 입력 중일 때 -> 로딩 표시 켜기
          if (activity.type === 'typing' && activity.from.role === 'bot') {
            setIsBotTyping(true);
            // 5초 뒤에도 메시지가 안 오면 자동으로 끄기 (안전장치)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsBotTyping(false), 5000);
          }

          // (B) 봇이 메시지를 보냈을 때 -> 로딩 표시 끄기
          if (activity.type === 'message' && activity.from.role === 'bot') {
            setIsBotTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          }
        }

        // 2. 처음 연결 시 인사 유도
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: { name: 'startConversation', type: 'event' },
          });
        }

        return next(action);
      }),
    []
  );

  const styleOptions = useMemo(() => ({
    accent: '#0078D4',
    botAvatarInitials: null,
    botAvatarImage: null,
    userAvatarInitials: null,
    userAvatarImage: null,
    bubbleBackground: '#f1f5f9',
    bubbleBorderRadius: 20,
    bubbleFromUserBackground: '#0078D4',
    bubbleFromUserBorderRadius: 20,
    bubbleFromUserTextColor: 'White',
    rootHeight: '100%',
    rootWidth: '100%',
    backgroundColor: 'transparent',
    hideUploadButton: true,
    hideTypingIndicator: true, // 기본 회색 점 숨기기
  }), []);

  return (
    <div className="fixed z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none
      right-4 sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      {/* 채팅창 컨테이너 */}
      <div
        className={`pointer-events-auto
          w-[340px] sm:w-[380px] h-[70vh] sm:h-[650px] max-w-[calc(100vw-2.5rem)] max-h-[80vh]
          bg-white/80 backdrop-blur-2xl border border-white/60
          rounded-[2.5rem] shadow-2xl shadow-blue-900/15
          flex flex-col overflow-hidden relative
          origin-bottom-right transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 invisible translate-y-12'}
        `}
      >
        {/* 헤더 */}
        <div className="h-20 bg-gradient-to-r from-[#0078D4]/90 to-cyan-500/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl">🤖</div>
            <div className="text-white">
              <h3 className="font-bold text-base tracking-wide">Elevate Agent</h3>
              <div className="flex items-center gap-1.5 opacity-80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium">Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* WebChat 영역 */}
        <div id="webchat-container" className="flex-1 bg-white/40 overflow-y-auto relative p-0" role="main">
          {directLine ? (
            <>
              <ReactWebChat 
                directLine={directLine} 
                store={store} 
                styleOptions={styleOptions} 
                locale="ko-KR" 
              />
              
              {/* ✅ [수정됨] 점 3개 애니메이션 (WebChat 위에 둥둥 떠있음) */}
              {isBotTyping && (
                <div className="absolute bottom-20 left-5 z-50">
                   <LoadingSpinner />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm">
                <LoadingSpinner />
                <p className="text-sm font-medium text-[#0078D4]/80 animate-pulse">연결 중...</p>
            </div>
          )}
        </div>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`pointer-events-auto
          group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full 
          bg-gradient-to-tr from-[#0078D4]/85 to-[#00C7F4]/85 backdrop-blur-md
          border border-white/40 text-white shadow-lg shadow-blue-500/30
          flex items-center justify-center cursor-pointer
          transition-all duration-300 hover:scale-105 active:scale-95
          hover:shadow-blue-500/50 hover:border-white/80
          ${isOpen ? 'bg-slate-700 border-transparent' : 'animate-float-slow'}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-12 drop-shadow-md">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
};

export default ChatWidget;