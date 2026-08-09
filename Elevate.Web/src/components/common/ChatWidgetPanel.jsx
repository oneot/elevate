/**
 * @file ChatWidgetPanel.jsx
 * @description Bot Framework WebChat 채팅 패널 컴포넌트.
 *
 * ChatWidget(쉘)이 처음 열릴 때 동적으로 로드된다.
 * 페이지 진입 시 미리 요청한 DirectLine 토큰을 전달받아 연결한다.
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { Bot, RotateCw, ShieldCheck, X } from 'lucide-react';

const ChatWidgetWebChat = lazy(() => import('./ChatWidgetWebChat'));

const LoadingSpinner = () => (
  <div className="flex space-x-1.5 p-2 animate-fade-in-up">
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
  </div>
);

const ChatWidgetPanel = ({ onClose, getToken }) => {
  const [token, setToken] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const getSecureToken = async () => {
      try {
        const secureToken = await getToken({ force: requestKey > 0, consume: true });
        if (isActive) setToken(secureToken);
      } catch (err) {
        if (isActive) {
          console.error("보안 연결 실패:", err);
          setHasError(true);
        }
      }
    };
    getSecureToken();

    return () => {
      isActive = false;
    };
  }, [getToken, requestKey]);

  return (
    <div
      id="chat-widget-panel"
      className="chat-glass-panel pointer-events-auto w-[min(390px,calc(100vw-2rem))]
        h-[min(680px,calc(100dvh-7rem))] min-h-[430px] flex flex-col overflow-hidden relative
        origin-bottom-right animate-fade-in-up"
    >
      <div className="chat-panel-header flex items-center justify-between px-5 shrink-0 z-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="chat-agent-mark" aria-hidden="true">
            <Bot size={21} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">Elevate Agent</h2>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="chat-online-dot" aria-hidden="true" />
              <span>온라인 · 무엇이든 물어보세요</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="chat-icon-button"
        >
          <X size={19} />
        </button>
      </div>

      <div
        role="region"
        aria-label="채팅 대화 영역"
        className="flex-1 min-h-0 overflow-hidden relative"
      >
        {token ? (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm">
              <LoadingSpinner />
              <p className="text-sm font-medium text-slate-500 animate-pulse">대화를 준비하고 있어요</p>
            </div>
          }>
            <ChatWidgetWebChat token={token} />
          </Suspense>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="chat-state-icon"><ShieldCheck size={24} /></div>
            <p className="mt-5 text-sm font-semibold text-slate-800">연결이 잠시 지연되고 있어요</p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">잠시 후 다시 시도해 주세요.</p>
            <button
              onClick={() => {
                setHasError(false);
                setRequestKey(key => key + 1);
              }}
              className="chat-retry-button mt-5"
            >
              <RotateCw size={14} />
              다시 연결
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/40 backdrop-blur-sm">
            <LoadingSpinner />
            <p className="text-sm font-medium text-slate-500 animate-pulse">안전하게 연결하는 중</p>
          </div>
        )}
      </div>
      <div className="chat-privacy-note shrink-0">
        <ShieldCheck size={12} />
        <span>AI가 생성한 답변은 중요한 정보를 확인해 주세요.</span>
      </div>
    </div>
  );
};

export default ChatWidgetPanel;
