import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../lib/errors';
import type { Paginated, PageQuery } from '../lib/types';

export interface UseListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  q: string;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  /** 검색어를 적용하고 1페이지로 이동. */
  search: (q: string) => void;
  /** 현재 page/q 로 다시 불러온다(상태 변경 후 갱신용). */
  reload: () => void;
}

/**
 * 목록 페이지 공통 로직: page/q 상태 관리 + 데이터 패칭 + 로딩/에러.
 * fetcher 는 안정적인 참조여야 한다(모듈 레벨 함수 권장).
 */
export function useList<T>(
  fetcher: (params: PageQuery) => Promise<Paginated<T>>,
  limit = 20,
): UseListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher({ page, limit, q: q || undefined })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(errorMessage(err));
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetcher, page, limit, q, nonce]);

  const search = useCallback((next: string) => {
    setQ(next);
    setPage(1);
  }, []);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    items,
    total,
    page,
    limit,
    q,
    loading,
    error,
    setPage,
    search,
    reload,
  };
}
