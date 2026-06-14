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

## 기능
- **로그인** — 관리자 이메일/비밀번호, 토큰 저장(localStorage), 새로고침 시 세션 복원
- **회원 관리** (`/members`, ADMIN·SUPER_ADMIN) — 목록·검색·페이지네이션, 정지/해제
- **관리자 관리** (`/admins`, SUPER_ADMIN 전용) — 목록·검색, 생성, 수정(이름/역할/활성)
- 역할에 따라 사이드바 메뉴·라우트 접근 제어, `/health` 연결 상태 배지

## API 계약
모든 경로는 `src/lib/endpoints.ts` 에 모여 있다. 백엔드 라우트가 바뀌면 이 파일만 수정.

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/admin/auth/login` | `{email,password}` → `{admin, tokens}` |
| GET | `/api/admin/members?page=&limit=&q=` | 회원 목록 `{items,total,page,limit}` |
| GET | `/api/admin/members/:id` | 회원 상세 |
| PATCH | `/api/admin/members/:id/status` | `{status: ACTIVE\|SUSPENDED}` |
| GET | `/api/admin/admins?page=&limit=&q=` | 관리자 목록 |
| POST | `/api/admin/admins` | `{email,password,name,role?}` |
| PATCH | `/api/admin/admins/:id` | `{name?,role?,isActive?}` |
| GET | `/api/health` | 연결 상태 배지용 |

## 구조
- `src/lib/` — `apiClient`(fetch 래퍼+`withQuery`), `endpoints`, `auth`, `tokenStore`, `types`, `errors`, `format`
- `src/lib/api/` — `members`, `admins` (타입드 호출)
- `src/hooks/useList.ts` — 목록 공통(page/q/로딩/에러)
- `src/auth/AuthContext.tsx` — 로그인 상태(`useAuth`)
- `src/components/` — `Layout`, `ProtectedRoute`, `RequireRole`, `Pagination`, `SearchBar`, `Modal`, `ConnectionStatus`
- `src/pages/` — `LoginPage`, `MembersPage`, `AdminsPage`
