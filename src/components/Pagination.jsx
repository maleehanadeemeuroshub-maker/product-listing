import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  total = 0,
  limit = 12,
  currentPage = 1,
  onPageChange,
}) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-900/10 mt-8 w-full font-mono text-xs">
      <div className="text-slate-500">
        Showing{' '}
        <span className="text-cyan-400 font-bold">
          {(currentPage - 1) * limit + 1}
        </span>{' '}
        to{' '}
        <span className="text-cyan-400 font-bold">
          {Math.min(currentPage * limit, total)}
        </span>{' '}
        of <span className="text-slate-900 font-bold">{total}</span> products
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl glass-panel border border-slate-900/10 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-slate-500">
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20 scale-105'
                  : 'glass-panel border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-slate-900/15'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl glass-panel border border-slate-900/10 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
