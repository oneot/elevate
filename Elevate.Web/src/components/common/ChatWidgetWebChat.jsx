import ReactWebChat from 'botframework-webchat';

const styleOptions = {
  accent: '#475569',
  subtle: '#64748b',
  botAvatarInitials: null,
  botAvatarImage: null,
  userAvatarInitials: null,
  userAvatarImage: null,
  bubbleBackground: '#ffffff',
  bubbleBorderColor: '#e2e8f0',
  bubbleBorderRadius: 12,
  bubbleTextColor: '#0f172a',
  bubbleFromUserBackground: '#334155',
  bubbleFromUserBorderColor: '#334155',
  bubbleFromUserBorderRadius: 12,
  bubbleFromUserTextColor: 'White',
  rootHeight: '100%',
  rootWidth: '100%',
  backgroundColor: '#f8fafc',
  sendBoxBackground: '#ffffff',
  sendBoxTextColor: '#0f172a',
  sendBoxPlaceholderColor: '#64748b',
  hideUploadButton: true,
  hideTypingIndicator: true,
};

export default function ChatWidgetWebChat({ connection }) {
  const { directLine, store, userID, status, hasReceivedGreeting, isBotTyping } = connection;

  return (
    <div id="webchat-container" className="h-full w-full">
      <ReactWebChat
        directLine={directLine}
        store={store}
        userID={userID}
        disabled={status !== 'connected'}
        styleOptions={styleOptions}
        locale="ko-KR"
      />
      {status === 'connected' && !hasReceivedGreeting && (
        <div className="chat-welcome-note" role="status">
          연결되었습니다. 메시지를 입력해 주세요.
        </div>
      )}
      {isBotTyping && (
        <div className="chat-typing-indicator" role="status" aria-label="답변 작성 중">
          <div className="flex space-x-1.5 p-2" aria-hidden="true">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
}
