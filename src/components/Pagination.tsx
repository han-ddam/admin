interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}

/** 이전/다음 + 현재 위치 표시. */
export function Pagination({ page, limit, total, onPage }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>
        총 <span className="font-medium text-slate-900">{total}</span>건 · {page} /{' '}
        {pages} 페이지
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          이전
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  );
}
