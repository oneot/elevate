import { useEffect, useId, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

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
  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  const titleId = useId()
  const descId = useId()

  if (!open) return null

  const iconWrapClass =
    variant === 'danger'
      ? 'bg-red-50'
      : 'bg-blue-50'

  const iconClass =
    variant === 'danger'
      ? 'text-red-600'
      : 'text-ms-blue'

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
      : 'bg-ms-blue text-white hover:bg-[#005a9e] focus-visible:ring-ms-blue'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 모달 패널 */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-elevation-4 p-6 space-y-5 animate-slideUp">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${iconWrapClass}`}>
            <AlertTriangle className={`w-5 h-5 ${iconClass}`} />
          </div>
          <div className="space-y-1">
            <h3 id={titleId} className="text-base font-semibold text-neutral-900">{title}</h3>
            {description && (
              <p id={descId} className="text-sm text-neutral-500">{description}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClass}`}
          >
            {loading ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
