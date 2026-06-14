import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { AdminRole } from '../lib/types';

/** 허용된 역할이 아니면 회원 관리로 돌려보낸다. */
export function RequireRole({
  roles,
  children,
}: {
  roles: AdminRole[];
  children: ReactNode;
}) {
  const { admin } = useAuth();
  if (!admin || !roles.includes(admin.role)) {
    return <Navigate to="/members" replace />;
  }
  return <>{children}</>;
}
