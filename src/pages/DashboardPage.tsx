import { useAuth } from '../auth/AuthContext';
import { ConnectionStatus } from '../components/ConnectionStatus';

/**
 * 로그인 후 자리표시 화면. 백엔드가 준비되면 여기에 관리자/회원 관리,
 * 통계 등 실제 관리 기능을 붙인다.
 */
export function DashboardPage() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-full bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-bold text-slate-900">한땀 관리자</h1>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <button
            onClick={() => void logout()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">로그인됨</h2>
          <p className="mt-1 text-sm text-slate-500">
            서버 연결과 로그인이 정상 동작합니다. 관리 기능은 백엔드 준비 후 추가됩니다.
          </p>

          {admin && (
            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
              <dt className="text-slate-500">이름</dt>
              <dd className="text-slate-900">{admin.name}</dd>
              <dt className="text-slate-500">이메일</dt>
              <dd className="text-slate-900">{admin.email}</dd>
              <dt className="text-slate-500">역할</dt>
              <dd className="text-slate-900">{admin.role}</dd>
            </dl>
          )}
        </div>
      </main>
    </div>
  );
}
