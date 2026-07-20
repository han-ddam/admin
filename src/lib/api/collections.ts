import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type {
  Collection,
  CreateCollectionInput,
  Paginated,
  PageQuery,
  UpdateCollectionInput,
} from '../types';

/** 컬렉션 목록. */
export function listCollections(
  params: PageQuery,
): Promise<Paginated<Collection>> {
  return apiFetch<Paginated<Collection>>(
    withQuery(endpoints.collections, params),
    { auth: true },
  );
}

/** 컬렉션 생성 (KO 번역 필수). */
export function createCollection(
  input: CreateCollectionInput,
): Promise<{ collectionId: string }> {
  return apiFetch<{ collectionId: string }>(endpoints.collections, {
    method: 'POST',
    auth: true,
    body: input,
  });
}

/** 컬렉션 수정 (seq/status). */
export function updateCollection(
  id: string,
  patch: UpdateCollectionInput,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(endpoints.collection(id), {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}

/** 컬렉션 삭제. */
export function deleteCollection(id: string): Promise<{ deleted: true }> {
  return apiFetch<{ deleted: true }>(endpoints.collection(id), {
    method: 'DELETE',
    auth: true,
  });
}

/** 컬렉션에 여행지 추가. */
export function addCollectionPlace(
  id: string,
  placeId: string,
  seq: number,
): Promise<{ added: true }> {
  return apiFetch<{ added: true }>(endpoints.collectionPlaces(id), {
    method: 'POST',
    auth: true,
    body: { placeId, seq },
  });
}

/** 컬렉션에서 여행지 제거. */
export function removeCollectionPlace(
  id: string,
  placeId: string,
): Promise<{ removed: true }> {
  return apiFetch<{ removed: true }>(endpoints.collectionPlace(id, placeId), {
    method: 'DELETE',
    auth: true,
  });
}
