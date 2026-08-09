/**
 * @file ChatWidget.jsx
 * @description 우측 하단 플로팅 채팅 토글 버튼 쉘 컴포넌트.
 *
 * 페이지 진입 시 WebChat과 DirectLine 연결을 백그라운드에서 준비한다.
 * 실제 WebChat UI와 DirectLine 연결은 ChatWidgetPanel에서 처리한다.
 * 패널은 앱 수명 동안 마운트 상태를 유지하고 토글로 표시 여부만 변경한다.
 */
import { useEffect, useState, lazy, Suspense } from 'react';
import { MessageCircle, X } from 'lucide-react';

const ChatWidgetPanel = lazy(() => import('./ChatWidgetPanel'));
const TOKEN_MAX_AGE_MS = 25 * 60 * 1000;

let cachedToken = null;
let cachedTokenAt = 0;
let tokenRequest = null;

const getBotToken = ({ force = false, consume = false } = {}) => {
  const endpoint = import.meta.env.VITE_BOT_TOKEN_ENDPOINT;
  if (!endpoint) {
    return Promise.reject(new Error('VITE_BOT_TOKEN_ENDPOINT is not set.'));
  }

  const hasFreshToken = cachedToken && Date.now() - cachedTokenAt < TOKEN_MAX_AGE_MS;
  let request;
  if (!force && hasFreshToken) {
    request = Promise.resolve(cachedToken);
  } else if (!force && tokenRequest) {
    request = tokenRequest;
  } else {
    tokenRequest = fetch(endpoint)
      .then(response => {
        if (!response.ok) throw new Error('토큰을 가져오지 못했습니다.');
        return response.json();
      })
      .then(data => {
        if (!data?.token) throw new Error('토큰 응답 형식이 올바르지 않습니다.');
        cachedToken = data.token;
        cachedTokenAt = Date.now();
        return cachedToken;
      })
      .finally(() => {
        tokenRequest = null;
      });
    request = tokenRequest;
  }

  return request.then(token => {
    if (consume && cachedToken === token) {
      cachedToken = null;
      cachedTokenAt = 0;
    }
    return token;
  });
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getBotToken().catch(() => {});
  }, []);

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
      return;
    }
    setIsOpen(true);
  };

  return (
    <div className="fixed z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none
      right-4 sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]">

      <div
        className={`chat-panel-stage ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <Suspense fallback={
          <div className="chat-glass-panel pointer-events-auto w-[min(390px,calc(100vw-2rem))] h-20 flex items-center justify-center">
            <div className="flex space-x-1.5" aria-label="채팅 불러오는 중">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        }>
          <ChatWidgetPanel onClose={closeChat} getToken={getBotToken} />
        </Suspense>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
        aria-expanded={isOpen}
        aria-controls="chat-widget-panel"
        className={`chat-toggle pointer-events-auto group ${isOpen ? 'is-open' : ''}`}
      >
        {isOpen ? <X size={23} /> : <MessageCircle size={24} />}
        {!isOpen && <span className="chat-toggle-status" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default ChatWidget;