export const CHAT_TOKEN_TIMEOUT_MS = 15_000;
export const CHAT_CONNECTION_TIMEOUT_MS = 30_000;
const BACKGROUND_RECHECK_MS = 15 * 60 * 1000;

const CONNECTION_STATUS = {
  online: 2,
  expired: 3,
  failed: 4,
  ended: 5,
};

class ChatSessionError extends Error {}

function createChatConnection(directLine) {
  let ended = false;
  return {
    connectionStatus$: directLine.connectionStatus$,
    get token() { return directLine.token; },
    get conversationId() { return directLine.conversationId; },
    get watermark() { return directLine.watermark; },
    get referenceGrammarId() { return directLine.referenceGrammarId; },
    setUserId: userID => directLine.setUserId(userID),
    getSessionId: () => directLine.getSessionId(),
    postActivity: activity => directLine.postActivity(activity),
    end() {
      if (ended) return;
      ended = true;
      directLine.end();
    },
    activity$: {
      subscribe(observer) {
        let subscription;
        let closed = false;
        // DirectLine starts on subscription. Let React's effect replay cancel
        // before starting a request that would leave the SDK stuck Connecting.
        queueMicrotask(() => {
          if (!closed && !ended) {
            subscription = directLine.activity$.subscribe(observer);
            if (closed || ended) subscription.unsubscribe();
          }
        });
        return {
          unsubscribe() {
            closed = true;
            subscription?.unsubscribe();
          },
        };
      },
    },
  };
}

async function requestToken(controller) {
  const endpoint = import.meta.env.VITE_BOT_TOKEN_ENDPOINT;
  if (!endpoint) throw new ChatSessionError('채팅 연결 설정을 확인해 주세요.');

  const { signal } = controller;
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  const timeout = setTimeout(() => controller.abort(
    new ChatSessionError('보안 연결 응답 시간이 초과됐어요. 다시 연결해 주세요.'),
  ), CHAT_TOKEN_TIMEOUT_MS);

  async function fetchToken() {
    const response = await fetch(endpoint, { signal, cache: 'no-store' });
    if (signal.aborted) throw signal.reason;
    if (!response.ok) throw new ChatSessionError('보안 연결을 준비하지 못했어요. 다시 연결해 주세요.');
    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (signal.aborted) throw signal.reason;
      if (error.name === 'SyntaxError') throw new ChatSessionError('채팅 연결 응답 형식이 올바르지 않아요.');
      throw error;
    }
    if (signal.aborted) throw signal.reason;
    if (typeof data?.token !== 'string' || !data.token.trim()) {
      throw new ChatSessionError('채팅 연결 응답 형식이 올바르지 않아요.');
    }
    return data.token;
  }

  try {
    return await Promise.race([fetchToken(), aborted]);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', onAbort);
  }
}

// A session belongs to the app, not to an open panel. Tokens stay in memory only.
export function createWebChatSession() {
  const listeners = new Set();
  const startedConversations = new Set();
  let state = {
    status: 'preparing',
    error: null,
    WebChat: null,
    directLine: null,
    connectionKey: 0,
    store: null,
    userID: undefined,
    hasReceivedGreeting: false,
    isBotTyping: false,
    canResume: false,
  };
  let active = false;
  let pending = false;
  let generation = 0;
  let controller;
  let directLine;
  let statusSubscription;
  let connectionTimeout;
  let typingTimeout;
  let resume;
  let userID;
  let hiddenAt = null;

  function publish(changes) {
    state = { ...state, ...changes };
    listeners.forEach(listener => listener());
  }

  function stopConnection() {
    clearTimeout(connectionTimeout);
    clearTimeout(typingTimeout);
    statusSubscription?.unsubscribe();
    statusSubscription = null;
    const previous = directLine;
    directLine = null;
    if (previous) {
      // Omitting streamUrl makes the SDK renew the stream and restart token refresh.
      resume = previous.conversationId ? {
        conversationId: previous.conversationId,
        token: previous.token,
        watermark: previous.watermark,
      } : null;
      state.store?.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });
      previous.end();
    }
  }

  function fail(message, status = 'error') {
    if (!active) return;
    generation += 1;
    pending = false;
    controller?.abort();
    stopConnection();
    publish({
      status, error: message, isBotTyping: false,
      canResume: status === 'error' && Boolean(resume),
    });
    console.error('[WebChat]', message);
  }

  function setDeadline() {
    clearTimeout(connectionTimeout);
    connectionTimeout = setTimeout(() => {
      fail('채팅 연결 시간이 초과됐어요. 네트워크를 확인하고 다시 연결해 주세요.');
    }, CHAT_CONNECTION_TIMEOUT_MS);
  }

  function createConversationStore(createStore) {
    return createStore({}, ({ dispatch }) => next => action => {
      const result = next(action);
      if (!active || !directLine) return result;

      if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED' && action.payload?.directLine === directLine) {
        userID = action.meta.userID;
        const id = directLine.conversationId;
        if (id && !startedConversations.has(id)) {
          startedConversations.add(id);
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: { name: 'startConversation', type: 'event' },
          });
        }
      }
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        const activity = action.payload?.activity;
        if (activity?.from?.role === 'bot' && activity.type === 'typing') {
          clearTimeout(typingTimeout);
          publish({ isBotTyping: true });
          typingTimeout = setTimeout(() => publish({ isBotTyping: false }), 5000);
        } else if (activity?.from?.role === 'bot' && activity.type === 'message') {
          clearTimeout(typingTimeout);
          publish({ hasReceivedGreeting: true, isBotTyping: false });
        }
      }
      return result;
    });
  }

  async function prepare({ newConversation = false } = {}) {
    if (!active || pending) return;
    pending = true;
    const attempt = ++generation;
    stopConnection();
    if (newConversation) {
      resume = null;
      userID = undefined;
    }
    const previous = resume;
    controller = new AbortController();
    const attemptController = controller;
    publish({
      status: previous ? 'reconnecting' : 'preparing',
      error: null,
      canResume: false,
      isBotTyping: false,
      ...(newConversation ? { hasReceivedGreeting: false } : {}),
    });
    setDeadline();

    try {
      // The microtask coalesces StrictMode's setup/cleanup replay before any I/O.
      await Promise.resolve();
      if (!active || attempt !== generation) return;
      const [sdk, view, token] = await Promise.all([
        import('botframework-webchat'),
        import('../components/common/ChatWidgetWebChat'),
        previous ? Promise.resolve(previous.token) : requestToken(attemptController),
      ]);
      if (!active || attempt !== generation) return;

      const store = state.store || createConversationStore(sdk.createStore);
      directLine = createChatConnection(sdk.createDirectLine(previous || { token }));
      const connection = directLine;
      publish({
        WebChat: view.default, store, directLine: connection, connectionKey: attempt, userID,
        status: previous ? 'reconnecting' : 'connecting',
      });
      setDeadline();
      statusSubscription = connection.connectionStatus$.subscribe({
        next(status) {
          if (!active || directLine !== connection) return;
          if (status === CONNECTION_STATUS.online) {
            clearTimeout(connectionTimeout);
            pending = false;
            publish({ status: 'connected', error: null });
          } else if (status === CONNECTION_STATUS.expired) {
            fail('연결 시간이 만료됐어요. 이전 기록은 남아 있지만 새 대화로 연결해야 합니다.', 'expired');
          } else if (status === CONNECTION_STATUS.failed) {
            fail(previous
              ? '기존 대화에 다시 연결하지 못했어요. 재시도하거나 새 대화로 연결해 주세요.'
              : '채팅에 연결하지 못했어요. 네트워크를 확인하고 다시 연결해 주세요.');
          } else if (status === CONNECTION_STATUS.ended) {
            fail('대화 연결이 종료됐어요. 이전 기록을 남기고 새 대화로 연결할 수 있습니다.', 'ended');
          } else if (status === 1 && state.status === 'connected') {
            pending = true;
            publish({ status: 'reconnecting' });
            setDeadline();
          }
        },
        error() {
          if (directLine === connection) fail('채팅 연결이 끊어졌어요. 다시 연결해 주세요.');
        },
      });
    } catch (error) {
      if (!active || attempt !== generation) return;
      fail(error instanceof ChatSessionError
        ? error.message
        : '채팅을 준비하지 못했어요. 네트워크를 확인하고 다시 연결해 주세요.');
    }
  }

  function onOffline() {
    fail('네트워크 연결이 끊어졌어요. 인터넷에 연결한 뒤 다시 연결해 주세요.');
  }

  function onVisibilityChange() {
    if (document.hidden) {
      hiddenAt = Date.now();
    } else {
      const needsRecheck = hiddenAt !== null && Date.now() - hiddenAt >= BACKGROUND_RECHECK_MS;
      hiddenAt = null;
      // SDK refreshes tokens every 15 minutes; a suspended tab may miss that timer.
      if (needsRecheck && state.status === 'connected') void prepare();
    }
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      if (active) return;
      active = true;
      hiddenAt = document.hidden ? Date.now() : null;
      window.addEventListener('offline', onOffline);
      document.addEventListener('visibilitychange', onVisibilityChange);
      void prepare();
    },
    retry(options) {
      if (state.status === 'connected') return;
      void prepare(options);
    },
    reportRenderError() {
      fail('채팅 화면을 불러오지 못했어요. 다시 연결해 주세요.');
    },
    dispose() {
      active = false;
      generation += 1;
      pending = false;
      controller?.abort();
      stopConnection();
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
