import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type {
  Badge,
  CreateBadgeInput,
  Paginated,
  PageQuery,
  UpdateBadgeInput,
} from '../types';

/** 뱃지 목록. */
export function listBadges(params: PageQuery): Promise<Paginated<Badge>> {
  return apiFetch<Paginated<Badge>>(withQuery(endpoints.badges, params), {
    auth: true,
  });
}

/** 뱃지 생성 (KO 번역 필수). */
export function createBadge(input: CreateBadgeInput): Promise<{ badgeId: string }> {
  return apiFetch<{ badgeId: string }>(endpoints.badges, {
    method: 'POST',
    auth: true,
    body: input,
  });
}

/** 뱃지 수정 (code/criteriaType/번역은 변경 불가). */
export function updateBadge(
  id: string,
  patch: UpdateBadgeInput,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(endpoints.badge(id), {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}

/** 뱃지 삭제. */
export function deleteBadge(id: string): Promise<{ deleted: true }> {
  return apiFetch<{ deleted: true }>(endpoints.badge(id), {
    method: 'DELETE',
    auth: true,
  });
}
