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

  // --- 여행지 관리 (admin/places, ADMIN·SUPER_ADMIN) ---
  places: '/admin/places',
  placeStatus: (id: string) => `/admin/places/${id}/status`,
  placeWeightConfig: (id: string) => `/admin/places/${id}/weight-config`,
  placeImage: (id: string) => `/admin/places/${id}/image`,

  // --- 구도 가이드 (admin/places/:id/compositions, admin/compositions) ---
  placeCompositions: (id: string) => `/admin/places/${id}/compositions`,
  placeCompositionPhoto: (id: string) => `/admin/places/${id}/compositions/photos`,
  composition: (compositionId: string) =>
    `/admin/places/compositions/${compositionId}`,
  compositionsImport: '/admin/compositions/import',

  // --- 점수 가중치 (admin/weight-configs, ADMIN·SUPER_ADMIN) ---
  weightConfigs: '/admin/weight-configs',
  weightConfig: (id: string) => `/admin/weight-configs/${id}`,

  // --- 뱃지 (admin/badges, ADMIN·SUPER_ADMIN) ---
  badges: '/admin/badges',
  badge: (id: string) => `/admin/badges/${id}`,

  // --- 컬렉션/테마 (admin/collections, ADMIN·SUPER_ADMIN) ---
  collections: '/admin/collections',
  collection: (id: string) => `/admin/collections/${id}`,
  collectionPlaces: (id: string) => `/admin/collections/${id}/places`,
  collectionPlace: (id: string, placeId: string) =>
    `/admin/collections/${id}/places/${placeId}`,
} as const;
