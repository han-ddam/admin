import { afterEach, describe, expect, it, vi } from 'vitest';
import { listMembers, setMemberStatus } from './members';

// 인증 토큰 첨부 경로가 localStorage 를 건드리지 않도록 모킹
vi.mock('../tokenStore', () => ({ getAccessToken: () => 'test-token' }));

function stubFetch(status: number, body: unknown) {
  const fn = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
      new Response(body === undefined ? '' : JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.restoreAllMocks());

describe('listMembers', () => {
  it('page/limit/q 를 쿼리스트링으로 붙이고 Bearer 토큰을 보낸다', async () => {
    const page = { items: [], total: 0, page: 2, limit: 20 };
    const fetchMock = stubFetch(200, page);

    await expect(listMembers({ page: 2, limit: 20, q: '서울' })).resolves.toEqual(page);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/admin/members?');
    expect(String(url)).toContain('page=2');
    expect(String(url)).toContain('limit=20');
    expect(String(url)).toContain('q=%EC%84%9C%EC%9A%B8');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
  });

  it('빈 q 는 쿼리에서 생략한다', async () => {
    const fetchMock = stubFetch(200, { items: [], total: 0, page: 1, limit: 20 });
    await listMembers({ page: 1, limit: 20 });
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('q=');
  });
});

describe('setMemberStatus', () => {
  it('PATCH 로 status 본문을 보낸다', async () => {
    const fetchMock = stubFetch(200, { id: '1', status: 'SUSPENDED' });
    await setMemberStatus('1', 'SUSPENDED');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/members\/1\/status$/);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'SUSPENDED' });
  });
});
