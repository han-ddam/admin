import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createPlace,
  deletePlaceImage,
  listPlaces,
  setPlaceStatus,
  setPlaceWeightConfig,
  uploadPlaceImage,
} from './places';

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

describe('listPlaces', () => {
  it('province/page/limit 를 쿼리로 붙인다', async () => {
    const page = { items: [], total: 0, page: 1, limit: 20 };
    const fetchMock = stubFetch(200, page);

    await expect(listPlaces({ province: '11', page: 1, limit: 20 })).resolves.toEqual(page);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/admin/places?');
    expect(url).toContain('province=11');
    expect(url).toContain('page=1');
  });

  it('province 미지정 시 쿼리에서 생략', async () => {
    const fetchMock = stubFetch(200, { items: [], total: 0, page: 1, limit: 20 });
    await listPlaces({ page: 1, limit: 20 });
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('province=');
  });

  it('status 를 쿼리로 붙인다', async () => {
    const fetchMock = stubFetch(200, { items: [], total: 0, page: 1, limit: 20 });
    await listPlaces({ status: 'HIDDEN', page: 1, limit: 20 });
    expect(String(fetchMock.mock.calls[0][0])).toContain('status=HIDDEN');
  });
});

describe('place 상태/가중치/이미지', () => {
  it('상태 변경은 PATCH /:id/status', async () => {
    const fetchMock = stubFetch(200, { id: 'p1', status: 'HIDDEN' });
    await setPlaceStatus('p1', 'HIDDEN');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/p1\/status$/);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'HIDDEN' });
  });

  it('가중치 배정 해제는 configId=null 을 보낸다', async () => {
    const fetchMock = stubFetch(200, { updated: true });
    await setPlaceWeightConfig('p1', null);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/p1\/weight-config$/);
    expect(JSON.parse(init?.body as string)).toEqual({ configId: null });
  });

  it('이미지 업로드는 FormData 를 POST 한다', async () => {
    const fetchMock = stubFetch(201, { imageUrl: '/api/places/images/k' });
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await uploadPlaceImage('p1', file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/p1\/image$/);
    expect(init?.body).toBeInstanceOf(FormData);
  });

  it('이미지 삭제는 DELETE', async () => {
    const fetchMock = stubFetch(200, { imageUrl: null });
    await deletePlaceImage('p1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places\/p1\/image$/);
    expect(init?.method).toBe('DELETE');
  });
});

describe('createPlace', () => {
  it('POST /admin/places 로 본문(번역 포함)을 보낸다', async () => {
    const fetchMock = stubFetch(201, {
      id: '1',
      regionCode: '11110',
      basePoints: 10,
      rarityWeight: 1.5,
    });

    const input = {
      regionCode: '11110',
      basePoints: 10,
      rarityWeight: 1.5,
      tags: ['야경'],
      translations: [{ locale: 'KO' as const, name: '남산타워' }],
    };
    await createPlace(input);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/places$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });
});
