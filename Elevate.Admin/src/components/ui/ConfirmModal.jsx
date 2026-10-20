import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

/** 모달 패널 내에서 포커스가 벗어나지 않도록 Tab/Shift+Tab 순환을 강제한다. */
function useFocusTrap(panelRef, open) {
  useEffect(() => {
    if (!open || !panelRef.current) return
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const getItems = () => Array.from(panelRef.current?.querySelectorAll(focusable) ?? [])
    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const items = getItems()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, panelRef])
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger',
}) {
  useEffect(() => {
    if (!open) return
    // 모달이 열려 있는 동안 ESC 키로 취소할 수 있도록 이벤트를 등록한다.
    // 클린업 함수에서 리스너를 제거해 메모리 누수를 방지한다.
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  // 모달이 열릴 때 취소 버튼으로 포커스를 이동해 스크린 리더와 키보드 접근성을 보장한다.
  const cancelRef = useRef(null)
  const panelRef = useRef(null)
  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  // 모달이 열린 동안 포커스가 패널 외부로 나가지 않도록 트랩을 설정한다.
  useFocusTrap(panelRef, open)

  const titleId = useId()
  const descId = useId()

  if (!open) return null

  const iconWrapClass = variant === 'danger' ? 'bg-[#fdf3f4]' : 'bg-[#eff6fc]'
  const iconClass = variant === 'danger' ? 'text-[#c50f1f]' : 'text-ms-blue'
  const confirmClass = variant === 'danger' ? 'ea-btn--solid-danger' : 'ea-btn--primary'

  // 페이지 본문(container query 영역) 밖의 body에 그려야 화면 전체를 기준으로 고정된다.
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
        onClick={onCancel}
      />

      {/* 모달 패널 */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md space-y-6 rounded-[22px] bg-white/95 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_30px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl animate-slideUp"
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}>
            <AlertTriangle className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h3 id={titleId} className="text-[17px] font-bold tracking-tight text-[#1d1d1f]">{title}</h3>
            {description && (
              <p id={descId} className="text-sm leading-relaxed text-[#6e6e73]">{description}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="ea-btn ea-btn--secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`ea-btn ${confirmClass}`}
          >
            {loading ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmModal
