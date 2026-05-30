/**
 * @file ChatWidgetPanel.jsx
 * @description Bot Framework WebChat 채팅 패널 컴포넌트.
 *
 * ChatWidget(쉘)이 처음 열릴 때 동적으로 로드된다.
 * 마운트 시점에 DirectLine 토큰을 가져와 연결한다.
 */
import { lazy, Suspense, useEffect, useState } from 'react';

const ChatWidgetWebChat = lazy(() => import('./ChatWidgetWebChat'));

const LoadingSpinner = () => (
  <div className="flex space-x-1.5 p-2 animate-fade-in-up">
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
  </div>
);

const ChatWidgetPanel = ({ onClose }) => {
  const [token, setToken] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const getSecureToken = async () => {
      try {
        const endpoint = import.meta.env.VITE_BOT_TOKEN_ENDPOINT;
        if (!endpoint) {
          console.error('[ChatWidget] VITE_BOT_TOKEN_ENDPOINT is not set.');
          setHasError(true);
          return;
        }
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error('토큰을 가져오지 못했습니다.');
        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("보안 연결 실패:", err);
          setHasError(true);
        }
      }
    };
    getSecureToken();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div
      id="chat-widget-panel"
      className={`pointer-events-auto
        w-[340px] sm:w-[380px] h-[70vh] sm:h-[650px] max-w-[calc(100vw-2.5rem)] max-h-[80vh]
        bg-white/80 backdrop-blur-2xl border border-white/60
        rounded-[2.5rem] shadow-2xl shadow-blue-900/15
        flex flex-col overflow-hidden relative
        origin-bottom-right animate-fade-in-up
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
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* WebChat 영역 */}
      <div
        role="region"
        aria-label="채팅 대화 영역"
        className="flex-1 bg-white/40 overflow-y-auto relative p-0"
      >
        {token ? (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm">
              <LoadingSpinner />
              <p className="text-sm font-medium text-[#0078D4]/80 animate-pulse">채팅 모듈 로딩 중...</p>
            </div>
          }>
            <ChatWidgetWebChat token={token} />
          </Suspense>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm px-6 text-center">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-medium text-slate-600">채팅 연결에 실패했습니다.</p>
            <button
              onClick={onClose}
              className="text-xs text-[#0078D4] underline hover:text-[#005fa3] cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm">
            <LoadingSpinner />
            <p className="text-sm font-medium text-[#0078D4]/80 animate-pulse">연결 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidgetPanel;
