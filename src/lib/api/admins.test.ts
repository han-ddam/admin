import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAdmin, updateAdmin } from './admins';

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

describe('createAdmin', () => {
  it('POST /admin/admins 로 본문을 보낸다', async () => {
    const created = {
      id: '1',
      email: 'a@b.com',
      name: '관리자',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-06-14T00:00:00.000Z',
    };
    const fetchMock = stubFetch(201, created);

    const input = { email: 'a@b.com', password: 'pw12345678', name: '관리자', role: 'ADMIN' as const };
    await expect(createAdmin(input)).resolves.toEqual(created);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/admins$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(input);
  });

  it('409 응답 시 ApiError(409) 를 던진다', async () => {
    stubFetch(409, { message: 'Email already in use' });
    await expect(
      createAdmin({ email: 'a@b.com', password: 'pw12345678', name: 'x' }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('updateAdmin', () => {
  it('PATCH /admin/admins/:id 로 부분 수정 본문을 보낸다', async () => {
    const fetchMock = stubFetch(200, { id: '1', isActive: false });
    await updateAdmin('1', { isActive: false });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/admins\/1$/);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string)).toEqual({ isActive: false });
  });
});
