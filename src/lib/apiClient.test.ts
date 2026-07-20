import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, assetUrl, withQuery } from './apiClient';

vi.mock('./tokenStore', () => ({ getAccessToken: () => null }));

describe('assetUrl', () => {
  it('상대 경로를 API origin 기준 절대 URL 로 변환', () => {
    // 기본 base = http://localhost:3000/api → origin http://localhost:3000
    expect(assetUrl('/api/places/images/abc')).toBe(
      'http://localhost:3000/api/places/images/abc',
    );
  });

  it('이미 절대 URL 이면 그대로', () => {
    expect(assetUrl('https://cdn.example.com/x.png')).toBe(
      'https://cdn.example.com/x.png',
    );
  });

  it('null/빈값은 null', () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl(undefined)).toBeNull();
    expect(assetUrl('')).toBeNull();
  });
});

describe('withQuery', () => {
  it('undefined/null/빈문자열 값은 생략', () => {
    expect(withQuery('/p', { a: 1, b: undefined, c: null, d: '' })).toBe('/p?a=1');
  });
});

describe('{ result } 언래핑', () => {
  afterEach(() => vi.restoreAllMocks());

  it('성공 응답의 { result: data } 를 data 로 언래핑한다', async () => {
    const payload = { items: [], total: 0, page: 1, limit: 20 };
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (): Promise<Response> =>
          new Response(JSON.stringify({ result: payload }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    await expect(apiFetch('/test')).resolves.toEqual(payload);
  });

  it('에러 응답의 { error: { code, message } } 에서 message 를 추출한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (): Promise<Response> =>
          new Response(
            JSON.stringify({ error: { code: 'NOT_FOUND', message: '대상을 찾을 수 없습니다' } }),
            { status: 404, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );
    await expect(apiFetch('/test')).rejects.toMatchObject({
      status: 404,
      message: '대상을 찾을 수 없습니다',
    });
  });
});
