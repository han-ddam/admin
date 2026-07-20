import { afterEach, describe, expect, it, vi } from 'vitest';
import { login } from './auth';
import { ApiError } from './apiClient';

/** 실제 백엔드 응답 형식: 성공은 { result }, 실패는 { error: { code, message } } */
function mockFetch(status: number, body: unknown) {
  const wrapped =
    body === undefined
      ? undefined
      : status >= 200 && status < 300
        ? { result: body }
        : body; // 에러 응답은 이미 { error: { code, message } } 형태로 전달
  return vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
      new Response(wrapped === undefined ? '' : JSON.stringify(wrapped), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('login', () => {
  const result = {
    admin: { id: '1', email: 'a@b.com', name: '관리자', role: 'ADMIN' },
    tokens: { accessToken: 'acc', refreshToken: 'ref' },
  };

  it('성공 시 관리자 프로필과 토큰을 반환한다', async () => {
    const fetchMock = mockFetch(200, result);
    vi.stubGlobal('fetch', fetchMock);

    await expect(login('a@b.com', 'pw')).resolves.toEqual(result);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/admin\/auth\/login$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'a@b.com',
      password: 'pw',
    });
    expect((init?.headers as Record<string, string>)['X-Client']).toBe('admin');
  });

  it('401 응답 시 ApiError(401)을 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(401, { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } }),
    );

    await expect(login('a@b.com', 'wrong')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    });
  });

  it('네트워크 실패 시 status 0 의 ApiError를 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    const err = await login('a@b.com', 'pw').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).isNetworkError).toBe(true);
  });
});
