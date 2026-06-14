/**
 * API 경로 집약. 백엔드 라우트가 확정되면 이 파일만 수정한다.
 * 베이스 URL은 .env 의 VITE_API_BASE_URL 로 주입 (기본 로컬 NestJS).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const endpoints = {
  /** 헬스 체크 (연결 상태 배지) */
  health: '/health',
  /** 관리자 로그인: { email, password } */
  adminLogin: '/admin/auth/login',
  /** 관리자 로그아웃: { refreshToken } — 백엔드 준비 후 사용 */
  adminLogout: '/admin/auth/logout',
  /** 관리자 토큰 재발급: { refreshToken } — 백엔드 준비 후 사용 */
  adminRefresh: '/admin/auth/refresh',
  /** 내 정보 — 백엔드 준비 후 사용 */
  adminMe: '/admin/auth/me',
} as const;
