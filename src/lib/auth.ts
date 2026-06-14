import { apiFetch } from './apiClient';
import { endpoints } from './endpoints';
import type { AdminAuthResult, AdminRole } from './types';

// 하위 호환: 기존 import 경로 유지
export type {
  AdminRole,
  AdminProfile,
  TokenPair,
  AdminAuthResult,
} from './types';

/** GET /admin/auth/me 응답 (전체 프로필이 아니라 식별 정보만). */
export interface CurrentAdminInfo {
  adminId: string;
  role: AdminRole;
}

/** 이메일+비밀번호로 관리자 로그인. 실패 시 ApiError throw. */
export function login(email: string, password: string): Promise<AdminAuthResult> {
  return apiFetch<AdminAuthResult>(endpoints.adminLogin, {
    method: 'POST',
    body: { email, password },
  });
}

/** 서버측 세션 종료(리프레시 토큰 폐기). */
export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>(endpoints.adminLogout, {
    method: 'POST',
    body: { refreshToken },
  });
}

/** 현재 로그인한 관리자 식별 정보. */
export function fetchMe(): Promise<CurrentAdminInfo> {
  return apiFetch<CurrentAdminInfo>(endpoints.adminMe, { auth: true });
}
