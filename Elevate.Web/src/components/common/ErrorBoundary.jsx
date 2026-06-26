/**
 * @file ErrorBoundary.jsx
 * @description 렌더링 오류를 포착하는 React Error Boundary 컴포넌트.
 *
 * 하위 컴포넌트 트리에서 발생한 예외를 잡아 흰 화면 대신
 * 사용자 친화적인 오류 메시지와 새로고침 버튼을 표시한다.
 *
 * 사용 예:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
import { Component } from 'react';
import { trackClientDiagnostic } from '../../services/clarity';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || '알 수 없는 오류' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    trackClientDiagnostic('render_error', {
      route: `${window.location.pathname}${window.location.search}`,
      build_id: window.__BUILD_ID__ || 'unknown',
      message: error?.message || 'unknown',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-5xl">💥</span>
          <h2 className="text-xl font-semibold text-slate-700">페이지를 표시할 수 없습니다</h2>
          <p className="text-sm text-slate-500 max-w-sm">{this.state.errorMessage}</p>
          <p className="text-xs text-slate-400">Build {window.__BUILD_ID__ || 'unknown'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 rounded-full bg-ms-blue text-white text-sm hover:bg-ms-blue/90 transition-colors"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
