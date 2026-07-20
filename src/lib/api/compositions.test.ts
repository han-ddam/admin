import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createComposition,
  deleteComposition,
  importCompositions,
  listCompositions,
  uploadCompositionPhoto,
} from './compositions';

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

describe('compositions API', () => {
  it('여행지별 목록을 조회한다', async () => {
    const fetchMock = stubFetch(200, []);
    await listCompositions('p1');
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/admin\/places\/p1\/compositions$/,
    );
  });

  it('생성은 KO 번역 포함 본문을 POST 한다', async () => {
    const fetchMock = stubFetch(201, { compositionId: 'c1' });
    const input = {
      seq: 0,
      source: 'CURATED' as const,
      translations: [{ locale: 'KO' as const, title: '정면 구도' }],
    };
    await createComposition('p1', input);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });

  it('사진 업로드는 FormData 를 멀티파트로 POST 한다', async () => {
    const fetchMock = stubFetch(201, { imageKey: 'k1' });
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await uploadCompositionPhoto('p1', file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/p1\/compositions\/photos$/);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBeInstanceOf(FormData);
    // JSON Content-Type 을 넣지 않아야 브라우저가 boundary 를 붙인다
    expect((init?.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('CSV import 는 FormData 를 POST 한다', async () => {
    const fetchMock = stubFetch(201, { placesUpdated: 1, imported: 2, skipped: [] });
    const csv = new File(['region_code,place_name,title'], 'a.csv', {
      type: 'text/csv',
    });
    await importCompositions(csv);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/compositions\/import$/);
    expect(init?.body).toBeInstanceOf(FormData);
  });

  it('삭제는 compositionId 경로로 DELETE 한다', async () => {
    const fetchMock = stubFetch(200, { deleted: true });
    await deleteComposition('c1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/compositions\/c1$/);
    expect(init?.method).toBe('DELETE');
  });
});
