/**
 * @file ChatWidget.jsx
 * @description 우측 하단 플로팅 채팅 토글 버튼 쉘 컴포넌트.
 *
 * The app owns the background connection; toggles only change visibility.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWidgetPanel from './ChatWidgetPanel';
import { createWebChatSession } from '../../services/webChatSession';

const ChatWidget = ({ hidden = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [session] = useState(createWebChatSession);
  const connection = useSyncExternalStore(session.subscribe, session.getSnapshot);

  useEffect(() => {
    session.start();
    return () => session.dispose();
  }, [session]);

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
    <div
      className="fixed z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none
        right-4 sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
      style={hidden ? { display: 'none' } : undefined}
    >

      <div
        className="chat-panel-stage"
        style={{
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.985)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <ChatWidgetPanel
          onClose={closeChat}
          connection={connection}
          onRetry={session.retry}
          onRenderError={session.reportRenderError}
        />
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
        {!isOpen && (
          <span className="chat-toggle-status" data-status={connection.status} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;