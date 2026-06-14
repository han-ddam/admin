import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { login as loginRequest, logout as logoutRequest } from '../lib/auth';
import type { AdminProfile } from '../lib/auth';
import {
  clearSession,
  getProfile,
  getRefreshToken,
  saveSession,
} from '../lib/tokenStore';

interface AuthContextValue {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 새로고침 후에도 세션 복원
  const [admin, setAdmin] = useState<AdminProfile | null>(() => getProfile());

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    saveSession(result.admin, result.tokens);
    setAdmin(result.admin);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // 서버 세션 종료 시도. 백엔드 미준비/오류여도 로컬 로그아웃은 진행.
      await logoutRequest(refreshToken).catch(() => undefined);
    }
    clearSession();
    setAdmin(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
