import { useEffect, useMemo, useRef, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import { Bot } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex space-x-1.5 p-2 animate-fade-in-up">
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
  </div>
);

export default function ChatWidgetWebChat({ token }) {
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [hasReceivedGreeting, setHasReceivedGreeting] = useState(false);
  const typingTimeoutRef = useRef(null);
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => (next) => (action) => {
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const { activity } = action.payload;
          if (activity.type === 'typing' && activity.from.role === 'bot') {
            setIsBotTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsBotTyping(false), 5000);
          }
          if (activity.type === 'message' && activity.from.role === 'bot') {
            setHasReceivedGreeting(true);
            setIsBotTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          }
        }
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
    accent: '#475569',
    botAvatarInitials: null,
    botAvatarImage: null,
    userAvatarInitials: null,
    userAvatarImage: null,
    bubbleBackground: 'rgba(255, 255, 255, 0.54)',
    bubbleBorderColor: 'rgba(255, 255, 255, 0.72)',
    bubbleBorderRadius: 12,
    bubbleFromUserBackground: 'rgba(30, 41, 59, 0.86)',
    bubbleFromUserBorderColor: 'rgba(255, 255, 255, 0.24)',
    bubbleFromUserBorderRadius: 12,
    bubbleFromUserTextColor: 'White',
    rootHeight: '100%',
    rootWidth: '100%',
    backgroundColor: 'transparent',
    hideUploadButton: true,
    hideTypingIndicator: true,
  }), []);

  return (
    <div id="webchat-container" className="h-full w-full">
      <ReactWebChat
        directLine={directLine}
        store={store}
        styleOptions={styleOptions}
        locale="ko-KR"
      />
      {!hasReceivedGreeting && (
        <div className="chat-greeting-loader" role="status" aria-live="polite">
          <div className="chat-greeting-loader-mark" aria-hidden="true">
            <Bot size={24} strokeWidth={1.7} />
          </div>
          <div className="flex space-x-1.5" aria-hidden="true">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p>Elevate Agent를 불러오고 있어요</p>
        </div>
      )}
      {isBotTyping && (
        <div className="absolute bottom-20 left-5 z-50 rounded-xl border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-xl">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
