/** 백엔드와 공유하는 도메인 타입 (admin 모듈 계약 기준). */

// 백엔드 admin_role enum 과 일치 (2종으로 축소됨)
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export const ADMIN_ROLES: AdminRole[] = ['SUPER_ADMIN', 'ADMIN'];

export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export type Locale = 'KO' | 'EN' | 'JA' | 'ZH';

export const LOCALES: Locale[] = ['KO', 'EN', 'JA', 'ZH'];

// place status: HIDDEN/ACTIVE 토글 + 검수대기(PENDING_REVIEW)
export type PlaceStatus = 'ACTIVE' | 'HIDDEN' | 'PENDING_REVIEW';

/** 노출/숨김 토글 가능한 상태(검수대기 제외). */
export type PlaceToggleStatus = 'ACTIVE' | 'HIDDEN';

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
  imageUrl: string | null;
  weightConfigId: string | null;
  status: PlaceStatus;
  createdBy: string | null;
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

// ─── 점수 가중치 (weight-configs) ───────────────────────────────

/** 가중치 프리셋 (visitWeight/photoWeight 는 numeric → 문자열로 옴). */
export interface WeightConfig {
  id: string;
  name: string;
  visitWeight: string | number;
  photoWeight: string | number;
  createdAt: string;
}

export interface WeightConfigInput {
  name: string;
  visitWeight: number;
  photoWeight: number;
}

// ─── 뱃지 (badges) ─────────────────────────────────────────────

export type BadgeStatus = 'ACTIVE' | 'HIDDEN';
export type BadgeCriteriaType = 'LEVEL' | 'VISIT_COUNT';

export const BADGE_CRITERIA_TYPES: BadgeCriteriaType[] = ['LEVEL', 'VISIT_COUNT'];

/** 뱃지 목록 행. */
export interface Badge {
  id: string;
  code: string;
  tier: number;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  status: BadgeStatus;
  seq: number;
}

export interface BadgeTranslationInput {
  locale: Locale;
  name: string;
  description?: string;
}

export interface CreateBadgeInput {
  code: string;
  tier: number;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  iconKey?: string;
  status?: BadgeStatus;
  seq: number;
  translations: BadgeTranslationInput[];
}

/** 뱃지 수정(코드/기준유형/번역 제외). */
export interface UpdateBadgeInput {
  tier?: number;
  criteriaValue?: number;
  iconKey?: string;
  status?: BadgeStatus;
  seq?: number;
}

// ─── 컬렉션/테마 (collections) ─────────────────────────────────

export type CollectionStatus = 'ACTIVE' | 'HIDDEN';

/** 컬렉션 목록 행 (title=KO, total=포함 여행지 수). */
export interface Collection {
  id: string;
  seq: number;
  status: CollectionStatus;
  title: string;
  total: number;
}

export interface CollectionTranslationInput {
  locale: Locale;
  title: string;
  description?: string;
}

export interface CreateCollectionInput {
  seq: number;
  status?: CollectionStatus;
  translations: CollectionTranslationInput[];
}

export interface UpdateCollectionInput {
  seq?: number;
  status?: CollectionStatus;
}

// ─── 구도 가이드 (compositions) ────────────────────────────────

export type CompositionSource = 'CURATED' | 'AI';

export interface CompositionTranslation {
  locale: Locale;
  title: string;
  description: string | null;
}

/** 여행지별 구도 목록 항목. */
export interface Composition {
  id: string;
  seq: number;
  source: CompositionSource;
  exampleImageUrl: string | null;
  translations: CompositionTranslation[];
}

export interface CompositionTranslationInput {
  locale: Locale;
  title: string;
  description?: string;
}

export interface CreateCompositionInput {
  seq: number;
  source?: CompositionSource;
  imageKey?: string;
  translations: CompositionTranslationInput[];
}

/** CSV 일괄 등록 결과. */
export interface CompositionImportResult {
  placesUpdated: number;
  imported: number;
  skipped: { line: number; reason: string }[];
}
