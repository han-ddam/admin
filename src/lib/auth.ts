import { apiFetch } from './apiClient';
import { endpoints } from './endpoints';

/** 백엔드 AdminRole 과 동일 (admin 스키마 기준). */
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CURATOR';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AdminAuthResult {
  admin: AdminProfile;
  tokens: TokenPair;
}

/** 이메일+비밀번호로 관리자 로그인. 실패 시 ApiError throw. */
export function login(email: string, password: string): Promise<AdminAuthResult> {
  return apiFetch<AdminAuthResult>(endpoints.adminLogin, {
    method: 'POST',
    body: { email, password },
  });
}

/** 서버측 세션 종료(리프레시 토큰 폐기). 백엔드 준비 후 동작. */
export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>(endpoints.adminLogout, {
    method: 'POST',
    body: { refreshToken },
  });
}

/** 현재 로그인한 관리자 정보. 백엔드 준비 후 동작. */
export function fetchMe(): Promise<AdminProfile> {
  return apiFetch<AdminProfile>(endpoints.adminMe, { auth: true });
}
