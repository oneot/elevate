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
import { startClarityWhenIdle } from './services/clarity'
import { startInpMeasurement } from './services/webVitals'
import ErrorBoundary from './components/common/ErrorBoundary'

// LCP 경로의 네트워크 경쟁을 줄이기 위해 Clarity는 유휴 시점에 시작한다.
// VITE_CLARITY_ENABLED=true 이고 VITE_CLARITY_PROJECT_ID가 설정된 경우에만 실제로 초기화된다.
startClarityWhenIdle()
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
