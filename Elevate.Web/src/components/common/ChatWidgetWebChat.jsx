import { useEffect, useMemo, useRef, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

const LoadingSpinner = () => (
  <div className="flex space-x-1.5 p-2 animate-fade-in-up">
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
  </div>
);

export default function ChatWidgetWebChat({ token }) {
  const [isBotTyping, setIsBotTyping] = useState(false);
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
    hideTypingIndicator: true,
  }), []);

  return (
    <>
      <ReactWebChat
        directLine={directLine}
        store={store}
        styleOptions={styleOptions}
        locale="ko-KR"
      />
      {isBotTyping && (
        <div className="absolute bottom-20 left-5 z-50">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
