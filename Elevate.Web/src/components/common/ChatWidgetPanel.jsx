/**
 * @file ChatWidgetPanel.jsx
 * @description Bot Framework WebChat 채팅 패널 컴포넌트.
 *
 * The lightweight panel renders independently of the asynchronous SDK and token.
 */
import { Component } from 'react';
import { Bot, RotateCw, ShieldCheck, X } from 'lucide-react';

class ChatRenderBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const STATUS_LABELS = {
  preparing: '대화 준비 중',
  connecting: '연결 중',
  reconnecting: '다시 연결 중',
  connected: '연결됨',
  error: '연결 실패',
  expired: '연결 만료',
  ended: '연결 종료',
};

const ChatWidgetPanel = ({ onClose, connection, onRetry, onRenderError }) => {
  const { WebChat, status, error, canResume } = connection;
  const needsNewConversation = status === 'expired' || status === 'ended';

  return (
    <div
      id="chat-widget-panel"
      className="chat-glass-panel pointer-events-auto w-[min(390px,calc(100vw-2rem))]
        h-[min(680px,calc(100dvh-7rem))] flex flex-col overflow-hidden relative
        origin-bottom-right"
    >
      <div className="chat-panel-header flex items-center justify-between px-5 shrink-0 z-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="chat-agent-mark" aria-hidden="true">
            <Bot size={21} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">Elevate Agent</h2>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500" role="status">
              <span className="chat-online-dot" data-status={status} aria-hidden="true" />
              <span>{STATUS_LABELS[status]}</span>
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
        className="chat-panel-body flex-1 min-h-0 overflow-hidden relative"
      >
        {WebChat && (
          <ChatRenderBoundary key={connection.connectionKey} onError={onRenderError}>
            <WebChat connection={connection} />
          </ChatRenderBoundary>
        )}
        {error ? (
          <div className="chat-connection-state" role="alert">
            <div className="chat-state-icon"><ShieldCheck size={24} /></div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{error}</p>
            <button
              onClick={() => onRetry({ newConversation: needsNewConversation })}
              className="chat-retry-button mt-4"
            >
              <RotateCw size={14} />
              {needsNewConversation ? '새 대화로 연결' : '다시 연결'}
            </button>
            {canResume && (
              <button onClick={() => onRetry({ newConversation: true })} className="chat-retry-button mt-2">
                새 대화로 연결
              </button>
            )}
          </div>
        ) : status !== 'connected' && (
          <div className="chat-connection-state" role="status">
            <div className="flex space-x-1.5 p-2" aria-hidden="true">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {status === 'preparing' ? '대화를 준비하고 있어요' : '안전하게 연결하는 중'}
            </p>
          </div>
        )}
      </div>
      <div className="chat-privacy-note shrink-0">
        <ShieldCheck size={12} />
        <span>AI 생성 콘텐츠는 정확하지 않을 수 있습니다</span>
      </div>
    </div>
  );
};

export default ChatWidgetPanel;
