/**
 * API 경로 집약. 백엔드 라우트가 바뀌면 이 파일만 수정한다.
 * 베이스 URL은 .env 의 VITE_API_BASE_URL 로 주입 (기본 로컬 NestJS).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const endpoints = {
  /** 헬스 체크 (연결 상태 배지) */
  health: '/health',

  // --- 관리자 인증 (admin/auth) ---
  /** 로그인: { email, password } → { admin, tokens } */
  adminLogin: '/admin/auth/login',
  /** 로그아웃: { refreshToken } (204) */
  adminLogout: '/admin/auth/logout',
  /** 토큰 재발급: { refreshToken } */
  adminRefresh: '/admin/auth/refresh',
  /** 내 정보 → { adminId, role } */
  adminMe: '/admin/auth/me',

  // --- 회원 관리 (admin/members, ADMIN·SUPER_ADMIN) ---
  members: '/admin/members',
  member: (id: string) => `/admin/members/${id}`,
  memberStatus: (id: string) => `/admin/members/${id}/status`,

  // --- 관리자 관리 (admin/admins, SUPER_ADMIN) ---
  admins: '/admin/admins',
  admin: (id: string) => `/admin/admins/${id}`,
} as const;
