import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(currentPage, totalPages, delta = 2) {
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];

  if (left > 1) {
    range.push(1);
    if (left > 2) range.push('...');
  }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages) {
    if (right < totalPages - 1) range.push('...');
    range.push(totalPages);
  }
  return range;
}

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-8 flex justify-center" aria-label="Pagination">
      <ul className="inline-flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl px-2.5 py-2 shadow-sm">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="min-w-9 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 bg-white/85 border border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </li>
        {pages.map((p, i) =>
          p === '...' ? (
            <li key={`ellipsis-${i}`}>
              <span className="min-w-9 px-3.5 py-2 text-sm text-slate-400 flex items-center justify-center">…</span>
            </li>
          ) : (
            <li key={p}>
              <button
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`min-w-9 sm:min-w-10 px-3.5 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ms-blue ${
                  p === currentPage
                    ? 'bg-ms-blue text-white shadow-[0_10px_24px_-12px_rgba(0,120,212,0.95)] border border-ms-blue'
                    : 'bg-white/85 border border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue'
                }`}
              >
                {p}
              </button>
            </li>
          )
        )}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="min-w-9 px-2.5 py-2 rounded-lg text-sm transition-all duration-200 bg-white/85 border border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;

