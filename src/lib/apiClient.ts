import { API_BASE_URL } from './endpoints';
import { getAccessToken } from './tokenStore';

/**
 * 백엔드가 반환하는 상대 경로(예: `/api/places/images/xxx`)를 브라우저에서 열 수
 * 있는 절대 URL로 바꾼다. 이미 절대 URL이면 그대로 둔다.
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  try {
    return new URL(path, API_BASE_URL).href;
  } catch {
    return path;
  }
}

/** 정규화된 API 오류. status 0 = 네트워크/서버 도달 불가. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** 서버에 아예 닿지 못한 경우(서버 다운, CORS, 네트워크). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/** 경로에 쿼리스트링을 붙인다. undefined/null/빈문자열 값은 생략. */
export function withQuery(
  path: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** JSON 직렬화할 본문 */
  body?: unknown;
  /** Bearer 액세스 토큰 첨부 여부 */
  auth?: boolean;
  signal?: AbortSignal;
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 백엔드 에러 응답 `{ error: { code, message } }` 에서 message 를 꺼낸다.
 * 구 형식 `{ message }` 도 폴백으로 지원.
 */
function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    // 백엔드 AllExceptionsFilter: { error: { code, message } }
    const err = (body as Record<string, unknown>).error;
    if (err && typeof err === 'object') {
      const m = (err as Record<string, unknown>).message;
      if (typeof m === 'string') return m;
    }
    // 폴백: { message }
    const m = (body as Record<string, unknown>).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
  }
  return fallback;
}

/**
 * 백엔드 ResponseInterceptor 가 성공 응답을 `{ result: data }` 로 감싼다.
 * 204(빈 응답) 처럼 result 키가 없으면 그대로 반환.
 */
function unwrap(data: unknown): unknown {
  if (data && typeof data === 'object' && 'result' in (data as object)) {
    return (data as { result: unknown }).result;
  }
  return data;
}

/**
 * 백엔드 호출 래퍼. 베이스 URL·공통 헤더(X-Client/Accept-Language)·Bearer 토큰을
 * 붙이고, 응답을 파싱하며, 실패를 ApiError 로 정규화한다.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    // 백엔드 RequestContext 규약 (네이티브 전용 ios/android/admin)
    'X-Client': 'admin',
    'Accept-Language': 'ko',
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (cause) {
    throw new ApiError(0, '서버에 연결할 수 없습니다.', cause);
  }

  const raw = parseBody(await res.text());
  if (!res.ok) {
    throw new ApiError(res.status, messageFrom(raw, res.statusText), raw);
  }
  return unwrap(raw) as T;
}

/**
 * 멀티파트(FormData) 업로드 래퍼. Content-Type 은 브라우저가 boundary 와 함께
 * 자동 지정하므로 직접 넣지 않는다. 이미지/CSV 업로드에 사용.
 */
export async function apiUpload<T>(
  path: string,
  form: FormData,
  options: { auth?: boolean; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'X-Client': 'admin',
    'Accept-Language': 'ko',
  };
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: form,
      signal: options.signal,
    });
  } catch (cause) {
    throw new ApiError(0, '서버에 연결할 수 없습니다.', cause);
  }

  const raw = parseBody(await res.text());
  if (!res.ok) {
    throw new ApiError(res.status, messageFrom(raw, res.statusText), raw);
  }
  return unwrap(raw) as T;
}
