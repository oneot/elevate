/**
 * @file Pagination.jsx
 * @description 페이지네이션 네비게이션 컴포넌트.
 *
 * 현재 페이지 주변 숫자와 양 끝 첫/마지막 페이지를 보여주며,
 * 범위 밖 구간은 ellipsis(`…`)로 축약한다.
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 표시할 페이지 번호 배열을 계산한다.
 *
 * 현재 페이지를 기준으로 `±delta` 범위의 숫자를 포함하고,
 * 범위와 양 끝(1, totalPages) 사이에 간격이 있으면 `'...'`을 삽입한다.
 *
 * 예) currentPage=5, totalPages=10, delta=2 → [1, '...', 3, 4, 5, 6, 7, '...', 10]
 *
 * @param {number} currentPage - 현재 페이지 번호
 * @param {number} totalPages - 전체 페이지 수
 * @param {number} [delta=2] - 현재 페이지 좌우에 표시할 페이지 수
 * @returns {(number|string)[]} 페이지 번호 또는 '...' 요소의 배열
 */
function getPageNumbers(currentPage, totalPages, delta = 2) {
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const range = [];

  // 왼쪽 끝(1)과 window 시작 사이에 간격이 있으면 첫 페이지와 ellipsis를 삽입한다.
  if (left > 1) {
    range.push(1);
    if (left > 2) range.push('...');
  }
  for (let i = left; i <= right; i++) range.push(i);
  // 오른쪽 끝(totalPages)과 window 끝 사이에 간격이 있으면 ellipsis와 마지막 페이지를 삽입한다.
  if (right < totalPages) {
    if (right < totalPages - 1) range.push('...');
    range.push(totalPages);
  }
  return range;
}

/**
 * 이전/다음 버튼과 페이지 번호 버튼을 렌더링하는 페이지네이션 컴포넌트.
 *
 * @param {Object} props
 * @param {number} [props.currentPage=1] - 현재 페이지 번호
 * @param {number} [props.totalPages=1] - 전체 페이지 수
 * @param {Function} [props.onPageChange] - 페이지 변경 시 호출되는 콜백 `(page: number) => void`
 * @returns {JSX.Element|null} 총 페이지가 1 이하면 null을 반환한다.
 */
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

