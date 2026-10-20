import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const ICONS = {
  error: XCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
}

/** 화면 안 알림 (오류/성공/안내/주의). 오류는 role="alert", 나머지는 role="status"로 읽힌다. */
function Notice({ tone = 'info', children, action }) {
  const Icon = ICONS[tone] || Info
  return (
    <div className={`ea-notice ea-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={17} aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  )
}

export default Notice
