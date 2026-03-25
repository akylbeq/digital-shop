import React from 'react';

interface Props {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination = ({ page, totalPages, setPage }: Props) => {
  // if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 text-[10px] uppercase tracking-widest border border-white/10 rounded-sm text-zinc-400 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) => (
            p === '...' ? (
              <span key={`dots-${i}`} className="text-zinc-600 text-[10px] px-1">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-[10px] rounded-sm border transition-all ${
                  page === p
                    ? 'border-white/30 text-white bg-white/5'
                    : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                {p}
              </button>
            )
          ))}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 text-[10px] uppercase tracking-widest border border-white/10 rounded-sm text-zinc-400 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default React.memo(Pagination);