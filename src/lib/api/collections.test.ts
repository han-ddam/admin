import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addCollectionPlace,
  createCollection,
  removeCollectionPlace,
} from './collections';

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

describe('collections API', () => {
  it('생성은 KO 번역 포함 본문을 POST 한다', async () => {
    const fetchMock = stubFetch(201, { collectionId: 'x1' });
    const input = {
      seq: 0,
      status: 'ACTIVE' as const,
      translations: [{ locale: 'KO' as const, title: '봄 여행' }],
    };
    await createCollection(input);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/collections$/);
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });

  it('여행지 추가는 placeId/seq 를 POST 한다', async () => {
    const fetchMock = stubFetch(201, { added: true });
    await addCollectionPlace('x1', 'p1', 3);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/collections\/x1\/places$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ placeId: 'p1', seq: 3 });
  });

  it('여행지 제거는 DELETE 경로에 placeId 를 포함한다', async () => {
    const fetchMock = stubFetch(200, { removed: true });
    await removeCollectionPlace('x1', 'p1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/collections\/x1\/places\/p1$/);
    expect(init?.method).toBe('DELETE');
  });
});
