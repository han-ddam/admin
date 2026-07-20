import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBadge, deleteBadge, listBadges, updateBadge } from './badges';

vi.mock('../tokenStore', () => ({ getAccessToken: () => 'test-token' }));

function stubFetch(status: number, body: unknown) {
  const wrapped =
    body === undefined ? undefined : status >= 200 && status < 300 ? { result: body } : body;
  const fn = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
      new Response(wrapped === undefined ? '' : JSON.stringify(wrapped), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.restoreAllMocks());

describe('badges API', () => {
  it('목록을 조회한다', async () => {
    const fetchMock = stubFetch(200, { items: [], total: 0, page: 1, limit: 20 });
    await listBadges({ page: 1, limit: 20 });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/admin/badges?');
  });

  it('생성은 KO 번역 포함 본문을 POST 한다', async () => {
    const fetchMock = stubFetch(201, { badgeId: 'b1' });
    const input = {
      code: 'LEVEL_5',
      tier: 1,
      criteriaType: 'LEVEL' as const,
      criteriaValue: 5,
      seq: 0,
      translations: [{ locale: 'KO' as const, name: '레벨 5' }],
    };
    await createBadge(input);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/badges$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });

  it('수정은 PATCH', async () => {
    const fetchMock = stubFetch(200, { id: 'b1' });
    await updateBadge('b1', { tier: 2 });
    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/admin\/badges\/b1$/);
  });

  it('삭제는 DELETE', async () => {
    const fetchMock = stubFetch(200, { deleted: true });
    await deleteBadge('b1');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
  });
});
