import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageNumbers(currentPage, totalPages, delta = 2) {
  const left = Math.max(1, currentPage - delta)
  const right = Math.min(totalPages, currentPage + delta)
  const pages = []
  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push('gap-left')
  }
  for (let page = left; page <= right; page += 1) pages.push(page)
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push('gap-right')
    pages.push(totalPages)
  }
  return pages
}

/** 공개 사이트 블로그와 같은 알약 모양 페이지 이동. */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <nav className="ea-pager" aria-label="페이지 이동">
      <button type="button" className="ea-pager__step" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} aria-hidden="true" />
        이전
      </button>
      <div className="ea-pager__track">
        {getPageNumbers(page, totalPages).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className="ea-pager__num"
              aria-current={item === page ? 'page' : undefined}
              aria-label={`${item} 페이지`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="ea-pager__gap" aria-hidden="true">…</span>
          )
        ))}
      </div>
      <button type="button" className="ea-pager__step" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        다음
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}
