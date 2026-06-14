# 한땀 관리자 (admin)

한땀 백엔드(NestJS)용 **관리자 웹 앱**. 현재 범위는 **서버 연결 + 관리자 로그인**까지.
백엔드가 별도 폴더로 정리되고 관리 API가 확정되면 기능을 확장한다.

## 스택
Vite + React + TypeScript + Tailwind CSS v4 + react-router-dom

## 실행
```bash
cd admin
pnpm install               # 또는 npm install
pnpm dev                   # http://localhost:5174
```

백엔드 NestJS API 주소는 `VITE_API_BASE_URL` 환경변수로 주입한다(미설정 시 기본 `http://localhost:3000/api`).

## 스크립트
- `pnpm dev` — 개발 서버
- `pnpm build` — 타입체크 + 프로덕션 빌드
- `pnpm test` — 유닛 테스트(vitest)
- `pnpm lint` — 타입 체크

## API 계약
모든 경로는 `src/lib/endpoints.ts` 에 모여 있다. 백엔드 라우트가 확정되면 이 파일만 수정.

- `POST /api/admin/auth/login` `{ email, password }`
  → `{ admin: { id, email, name, role }, tokens: { accessToken, refreshToken } }`
- `GET /api/health` — 연결 상태 배지용

## 구조
- `src/lib/` — API 클라이언트(`apiClient`), 경로(`endpoints`), 인증 호출(`auth`), 토큰 저장(`tokenStore`)
- `src/auth/AuthContext.tsx` — 로그인 상태 관리(`useAuth`)
- `src/components/` — `ProtectedRoute`, `ConnectionStatus`
- `src/pages/` — `LoginPage`, `DashboardPage`(로그인 후 자리표시)
