import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type {
  Paginated,
  PageQuery,
  WeightConfig,
  WeightConfigInput,
} from '../types';

/** 가중치 프리셋 목록. */
export function listWeightConfigs(
  params: PageQuery,
): Promise<Paginated<WeightConfig>> {
  return apiFetch<Paginated<WeightConfig>>(
    withQuery(endpoints.weightConfigs, params),
    { auth: true },
  );
}

/** 가중치 프리셋 생성. */
export function createWeightConfig(
  input: WeightConfigInput,
): Promise<{ configId: string }> {
  return apiFetch<{ configId: string }>(endpoints.weightConfigs, {
    method: 'POST',
    auth: true,
    body: input,
  });
}

/** 가중치 프리셋 수정 (일부 필드). */
export function updateWeightConfig(
  id: string,
  patch: Partial<WeightConfigInput>,
): Promise<{ updated: true }> {
  return apiFetch<{ updated: true }>(endpoints.weightConfig(id), {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}

/** 가중치 프리셋 삭제. */
export function deleteWeightConfig(id: string): Promise<{ deleted: true }> {
  return apiFetch<{ deleted: true }>(endpoints.weightConfig(id), {
    method: 'DELETE',
    auth: true,
  });
}
