/** 백엔드와 공유하는 도메인 타입 (admin 모듈 계약 기준). */

// 백엔드 admin_role enum 과 일치 (2종으로 축소됨)
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export const ADMIN_ROLES: AdminRole[] = ['SUPER_ADMIN', 'ADMIN'];

export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export type Locale = 'KO' | 'EN' | 'JA' | 'ZH';

export const LOCALES: Locale[] = ['KO', 'EN', 'JA', 'ZH'];

export type PlaceStatus = 'ACTIVE' | 'HIDDEN';

/** 어드민 여행지 목록 행 (place 원본 — 번역/이름은 미포함). */
export interface AdminPlace {
  id: string;
  regionCode: string;
  tourapiContentId: string | null;
  lat: number | null;
  lng: number | null;
  basePoints: number;
  rarityWeight: string | number; // numeric → JSON 문자열로 올 수 있음
  tags: string[];
  status: PlaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceTranslationInput {
  locale: Locale;
  name: string;
  address?: string;
  description?: string;
  mission?: string;
}

export interface CreatePlaceInput {
  regionCode: string;
  tourapiContentId?: string;
  lat?: number;
  lng?: number;
  basePoints: number;
  rarityWeight: number;
  tags?: string[];
  translations: PlaceTranslationInput[];
}

/** 로그인/관리자 목록의 관리자 프로필. (createdAt 은 JSON ISO 문자열) */
export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AdminAuthResult {
  admin: AdminProfile;
  tokens: TokenPair;
}

/** 관리자 회원 관리 뷰. */
export interface MemberView {
  id: string;
  handle: string;
  displayName: string;
  email: string | null;
  status: MemberStatus;
  createdAt: string;
}

/** 목록 엔드포인트 공통 응답. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** 목록 쿼리(page/limit/q). (type 별칭 — withQuery 의 Record 파라미터에 할당 가능) */
export type PageQuery = {
  page?: number;
  limit?: number;
  q?: string;
};
