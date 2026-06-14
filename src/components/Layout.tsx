import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ConnectionStatus } from './ConnectionStatus';
import type { AdminRole } from '../lib/types';

interface NavItem {
  to: string;
  label: string;
  /** 이 역할만 메뉴 노출 (없으면 모든 관리자) */
  roles?: AdminRole[];
}

const NAV: NavItem[] = [
  { to: '/members', label: '회원 관리' },
  { to: '/admins', label: '관리자 관리', roles: ['SUPER_ADMIN'] },
];

/** 사이드바 + 헤더로 감싸는 앱 셸. 자식 라우트는 <Outlet/> 에 렌더된다. */
export function Layout() {
  const { admin, logout } = useAuth();
  const items = NAV.filter((n) => !n.roles || (admin && n.roles.includes(admin.role)));

  return (
    <div className="flex min-h-full bg-slate-100">
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-4 text-lg font-bold text-slate-900">한땀 관리자</div>
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <ConnectionStatus />
          <div className="flex items-center gap-3 text-sm">
            {admin && (
              <span className="text-slate-600">
                {admin.name}{' '}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                  {admin.role}
                </span>
              </span>
            )}
            <button
              onClick={() => void logout()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
