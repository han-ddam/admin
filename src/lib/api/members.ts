import { apiFetch, withQuery } from '../apiClient';
import { endpoints } from '../endpoints';
import type { MemberStatus, MemberView, Paginated, PageQuery } from '../types';

/** 회원 목록 (검색 q + 페이지네이션). */
export function listMembers(params: PageQuery): Promise<Paginated<MemberView>> {
  return apiFetch<Paginated<MemberView>>(withQuery(endpoints.members, params), {
    auth: true,
  });
}

/** 회원 상세. */
export function getMember(id: string): Promise<MemberView> {
  return apiFetch<MemberView>(endpoints.member(id), { auth: true });
}

/** 회원 정지/해제. */
export function setMemberStatus(
  id: string,
  status: MemberStatus,
): Promise<MemberView> {
  return apiFetch<MemberView>(endpoints.memberStatus(id), {
    method: 'PATCH',
    auth: true,
    body: { status },
  });
}
