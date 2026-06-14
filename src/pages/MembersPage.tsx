import { useState } from 'react';
import { listMembers, setMemberStatus } from '../lib/api/members';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { formatDateTime } from '../lib/format';
import { errorMessage } from '../lib/errors';
import type { MemberStatus, MemberView } from '../lib/types';

function StatusBadge({ status }: { status: MemberStatus }) {
  const active = status === 'ACTIVE';
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {active ? '활성' : '정지'}
    </span>
  );
}

export function MembersPage() {
  const list = useList<MemberView>(listMembers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleStatus(m: MemberView) {
    const next: MemberStatus = m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`${m.displayName} 회원을 ${next === 'SUSPENDED' ? '정지' : '해제'}할까요?`)) {
      return;
    }
    setPendingId(m.id);
    setActionError(null);
    try {
      await setMemberStatus(m.id, next);
      list.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">회원 관리</h1>
        <SearchBar placeholder="handle / 이름 / 이메일 검색" onSearch={list.search} />
      </div>

      {actionError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Handle</th>
              <th className="px-4 py-2 font-medium">이름</th>
              <th className="px-4 py-2 font-medium">이메일</th>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium">가입일</th>
              <th className="px-4 py-2 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : list.error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-rose-600">
                  {list.error}
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700">@{m.handle}</td>
                  <td className="px-4 py-2 text-slate-900">{m.displayName}</td>
                  <td className="px-4 py-2 text-slate-600">{m.email ?? '—'}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-2 text-slate-500">{formatDateTime(m.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      disabled={pendingId === m.id}
                      onClick={() => void toggleStatus(m)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      {pendingId === m.id
                        ? '처리 중…'
                        : m.status === 'ACTIVE'
                          ? '정지'
                          : '해제'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={list.page}
        limit={list.limit}
        total={list.total}
        onPage={list.setPage}
      />
    </section>
  );
}
