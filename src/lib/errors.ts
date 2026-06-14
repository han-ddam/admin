import { ApiError } from './apiClient';

/** ApiError 등을 사용자에게 보여줄 한국어 메시지로 변환. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError)
      return '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.';
    switch (err.status) {
      case 401:
        return '인증이 만료되었습니다. 다시 로그인하세요.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '대상을 찾을 수 없습니다.';
      case 409:
        return err.message || '이미 존재하는 값입니다.';
      case 423:
        return '시도가 너무 많아 잠겼습니다. 잠시 후 다시 시도하세요.';
      default:
        return err.message || '요청을 처리하지 못했습니다.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}
