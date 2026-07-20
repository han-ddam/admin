import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createWeightConfig,
  deleteWeightConfig,
  listWeightConfigs,
  updateWeightConfig,
} from './weightConfigs';

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

describe('weightConfigs API', () => {
  it('목록에 page/limit 쿼리를 붙인다', async () => {
    const fetchMock = stubFetch(200, { items: [], total: 0, page: 1, limit: 20 });
    await listWeightConfigs({ page: 2, limit: 20 });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/admin/weight-configs?');
    expect(url).toContain('page=2');
  });

  it('생성은 POST 로 본문을 보낸다', async () => {
    const fetchMock = stubFetch(201, { configId: 'c1' });
    const input = { name: '기본', visitWeight: 1, photoWeight: 2 };
    await createWeightConfig(input);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/weight-configs$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });

  it('수정은 PATCH 로 일부 필드를 보낸다', async () => {
    const fetchMock = stubFetch(200, { updated: true });
    await updateWeightConfig('c1', { name: '수정' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/weight-configs\/c1$/);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string)).toEqual({ name: '수정' });
  });

  it('삭제는 DELETE 를 보낸다', async () => {
    const fetchMock = stubFetch(200, { deleted: true });
    await deleteWeightConfig('c1');
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
  });
});
