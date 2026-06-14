import type { AdminProfile, TokenPair } from './auth';

/**
 * 토큰·프로필을 localStorage 에 보관해 새로고침 후에도 세션을 복원한다.
 * (관리자 내부 도구 수준에서 허용. 추후 보안 강화 시 교체 가능.)
 */
const ACCESS_KEY = 'handdam.admin.accessToken';
const REFRESH_KEY = 'handdam.admin.refreshToken';
const PROFILE_KEY = 'handdam.admin.profile';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getProfile(): AdminProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export function saveSession(profile: AdminProfile, tokens: TokenPair): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
