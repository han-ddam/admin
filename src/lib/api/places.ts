import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type { AdminPlace, CreatePlaceInput, Paginated } from '../types';

/** type 별칭 — withQuery 의 Record 파라미터에 할당 가능해야 함. */
export type PlaceListQuery = {
  /** 상위 지역(시·도) 코드 접두 필터. */
  province?: string;
  page?: number;
  limit?: number;
};

/** 여행지 목록 (province 접두 필터 + 페이지네이션). */
export function listPlaces(params: PlaceListQuery): Promise<Paginated<AdminPlace>> {
  return apiFetch<Paginated<AdminPlace>>(withQuery(endpoints.places, params), {
    auth: true,
  });
}

/** 생성 응답: place 일부 필드만 반환. */
export interface CreatePlaceResult {
  id: string;
  regionCode: string;
  basePoints: number;
  rarityWeight: number;
}

/** 여행지 생성 (KO 번역 필수). */
export function createPlace(input: CreatePlaceInput): Promise<CreatePlaceResult> {
  return apiFetch<CreatePlaceResult>(endpoints.places, {
    method: 'POST',
    auth: true,
    body: input,
  });
}
