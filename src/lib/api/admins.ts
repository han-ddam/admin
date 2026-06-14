import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type { AdminProfile, AdminRole, Paginated, PageQuery } from '../types';

export interface CreateAdminInput {
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

export interface UpdateAdminInput {
  name?: string;
  role?: AdminRole;
  isActive?: boolean;
}

/** 관리자 목록 (검색 q + 페이지네이션). */
export function listAdmins(params: PageQuery): Promise<Paginated<AdminProfile>> {
  return apiFetch<Paginated<AdminProfile>>(withQuery(endpoints.admins, params), {
    auth: true,
  });
}

/** 관리자 상세. */
export function getAdmin(id: string): Promise<AdminProfile> {
  return apiFetch<AdminProfile>(endpoints.admin(id), { auth: true });
}

/** 관리자 생성. */
export function createAdmin(input: CreateAdminInput): Promise<AdminProfile> {
  return apiFetch<AdminProfile>(endpoints.admins, {
    method: 'POST',
    auth: true,
    body: input,
  });
}

/** 관리자 수정 (name/role/isActive 중 하나 이상). */
export function updateAdmin(
  id: string,
  patch: UpdateAdminInput,
): Promise<AdminProfile> {
  return apiFetch<AdminProfile>(endpoints.admin(id), {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}
