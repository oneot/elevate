import React from 'react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav className="mt-8 flex justify-center" aria-label="Pagination">
      <ul className="inline-flex items-center gap-2 sm:gap-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl px-2.5 py-2 shadow-sm">
        {pages.map((p) => (
          <li key={p}>
            <button
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`min-w-9 sm:min-w-10 px-3.5 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ms-blue ${p === currentPage ? 'bg-ms-blue text-white shadow-[0_10px_24px_-12px_rgba(0,120,212,0.95)] border border-ms-blue' : 'bg-white/85 border border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue'}`}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
