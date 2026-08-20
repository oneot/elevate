/**
 * @file main.jsx
 * @description React 앱 부트스트랩 진입점.
 *
 * 앱 시작 시 Microsoft Clarity 세션 추적을 초기화하고,
 * BrowserRouter(SPA 라우팅)와 HelmetProvider(동적 <head> 관리)로
 * App 컴포넌트를 감싸 DOM에 마운트한다.
 */
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { API_BASE } from './api/client'
import { setClarityTag, startClarityWhenIdle } from './services/clarity'
import { startChunkLoadRecovery } from './services/chunkLoadRecovery'
import { startInpMeasurement } from './services/webVitals'
import ErrorBoundary from './components/common/ErrorBoundary'

function preconnectToApiOrigin() {
  try {
    const origin = new URL(API_BASE).origin;
    if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = '';
    document.head.appendChild(link);
  } catch {
    // API_BASE is validated by api/client; skip preconnect if URL parsing still fails.
  }
}

startChunkLoadRecovery()
preconnectToApiOrigin()
window.whomadeit = `Made by Microsoft Korea Elevate Team
Developer: KeumJae Yoon
Contents: GeunHee Kim & HyeIn Sun`

// LCP 경로의 네트워크 경쟁을 줄이기 위해 Clarity는 유휴 시점에 시작한다.
// VITE_CLARITY_ENABLED=true 이고 VITE_CLARITY_PROJECT_ID가 설정된 경우에만 실제로 초기화된다.
startClarityWhenIdle()
setClarityTag('build_id', window.__BUILD_ID__ || 'unknown')
startInpMeasurement()

createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <HelmetProvider>
                <App />
            </HelmetProvider>
        </BrowserRouter>
    </ErrorBoundary>
)
