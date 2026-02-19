import React from 'react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav className="mt-8 flex justify-center" aria-label="Pagination">
      <ul className="inline-flex items-center gap-2 sm:gap-3">
        {pages.map((p) => (
          <li key={p}>
            <button
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`min-w-9 sm:min-w-10 px-3.5 sm:px-4 py-2 rounded-lg text-sm sm:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ms-blue ${p === currentPage ? 'bg-ms-blue text-white shadow-sm' : 'bg-white border text-slate-700'}`}
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
