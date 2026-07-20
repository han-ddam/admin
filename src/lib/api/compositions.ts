import { apiFetch, apiUpload } from '../apiClient';
import { endpoints } from '../endpoints';
import type {
  Composition,
  CompositionImportResult,
  CreateCompositionInput,
} from '../types';

/** 여행지별 구도 목록. */
export function listCompositions(placeId: string): Promise<Composition[]> {
  return apiFetch<Composition[]>(endpoints.placeCompositions(placeId), {
    auth: true,
  });
}

/** 구도 예시 사진 업로드 → imageKey 반환 (생성 시 넘긴다). */
export function uploadCompositionPhoto(
  placeId: string,
  file: File,
): Promise<{ imageKey: string }> {
  const form = new FormData();
  form.append('file', file);
  return apiUpload<{ imageKey: string }>(
    endpoints.placeCompositionPhoto(placeId),
    form,
    { auth: true },
  );
}

/** 구도 생성 (KO 번역 필수). */
export function createComposition(
  placeId: string,
  input: CreateCompositionInput,
): Promise<{ compositionId: string }> {
  return apiFetch<{ compositionId: string }>(
    endpoints.placeCompositions(placeId),
    { method: 'POST', auth: true, body: input },
  );
}

/** 구도 삭제. */
export function deleteComposition(
  compositionId: string,
): Promise<{ deleted: true }> {
  return apiFetch<{ deleted: true }>(endpoints.composition(compositionId), {
    method: 'DELETE',
    auth: true,
  });
}

/** CSV 일괄 등록 (region_code, place_name, seq?, title, description?). */
export function importCompositions(file: File): Promise<CompositionImportResult> {
  const form = new FormData();
  form.append('file', file);
  return apiUpload<CompositionImportResult>(
    endpoints.compositionsImport,
    form,
    { auth: true },
  );
}
