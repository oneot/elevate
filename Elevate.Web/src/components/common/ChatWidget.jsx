/**
 * @file ChatWidget.jsx
 * @description 우측 하단 플로팅 채팅 토글 버튼 쉘 컴포넌트.
 *
 * botframework-webchat 번들은 사용자가 채팅 버튼을 처음 클릭할 때 동적으로 로드된다.
 * 실제 WebChat UI와 DirectLine 연결은 ChatWidgetPanel에서 처리한다.
 * 패널은 isOpen 상태에서만 마운트되어 닫힐 때 DirectLine 연결을 정리한다.
 */
import { useState, lazy, Suspense } from 'react';

const ChatWidgetPanel = lazy(() => import('./ChatWidgetPanel'));

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-[9999] flex flex-col items-end gap-4 font-sans pointer-events-none
      right-4 sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]">

      {/* 패널: isOpen 상태에서만 마운트하여 불필요한 DirectLine 연결 방지 */}
      {isOpen && (
        <Suspense fallback={
          <div className="pointer-events-auto w-[340px] sm:w-[380px] h-20 flex items-center justify-center
            bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-2xl shadow-blue-900/15">
            <div className="flex space-x-1.5">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        }>
          <ChatWidgetPanel onClose={() => setIsOpen(false)} />
        </Suspense>
      )}

      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
        aria-expanded={isOpen}
        aria-controls="chat-widget-panel"
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