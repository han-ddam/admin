import { describe, expect, it } from 'vitest';
import { assetUrl, withQuery } from './apiClient';

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
