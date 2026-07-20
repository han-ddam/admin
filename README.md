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

## 서버 배포 (Docker — backend compose가 admin을 빌드·서빙)

admin은 **별도 repo**지만 배포는 backend의 `compose.server.yml`이 담당한다.
admin 컨테이너가 `../admin`(형제 폴더)을 **멀티스테이지 Docker 빌드**(node로 `pnpm build` → nginx 서빙)하므로
**호스트에 node/pnpm이 필요 없다.** (`admin/Dockerfile` 포함되어 있어야 함)

### 폴더 구조 (미니PC — 두 repo를 형제로)
```
~/projects/han-ddam/
├─ backend/     ← git clone. compose.server.yml 을 여기서 실행 (DEPLOY_DIR = 이 경로)
└─ admin/       ← git clone (이 repo). Dockerfile 포함
```

### 처음 한 번 (서버)
```bash
mkdir -p ~/projects/han-ddam && cd ~/projects/han-ddam
git clone <backend-repo> backend
git clone <admin-repo>   admin
# backend/.env 준비 (DB·JWT·GEMINI_API_KEY 등)
```

### 배포 — 자동(CI)
`backend` main 에 push → `.github/workflows/deploy.yml` 이 SSH로 서버 접속 →
`backend` + `admin` 둘 다 `git pull` → `docker compose build app admin` → migrate → `up -d`.
- admin **만** 바뀐 경우: backend를 한 번 push 하거나, GitHub Actions에서 `deploy` 워크플로를 **수동 실행**(workflow_dispatch).

### 배포 — 수동
```bash
cd ~/projects/han-ddam/admin && git pull        # admin 최신화
cd ../backend
docker compose -f compose.server.yml build admin
docker compose -f compose.server.yml up -d admin
```

### 동작 요약
- **API 주소**: 빌드 시 `VITE_API_BASE_URL=/api`(compose build arg 기본값)로 주입 → 브라우저가 `/api/...` 호출 → nginx가 `app:3000` 으로 프록시(설정: `backend/docker/nginx-admin.conf`).
- **포트**: admin nginx → `127.0.0.1:8080`(`.env` 의 `ADMIN_PORT` 로 변경). cloudflared 터널을 `admin.<도메인> → localhost:8080` 으로 붙이면 외부 노출.
- **컨텍스트 경로**: 기본 `../admin`. 다르면 backend `.env` 의 `ADMIN_CONTEXT` 로 지정.
- 호스트에서 직접 `pnpm build` 하던 예전 방식(dist 바인드마운트)은 더 이상 필요 없다.

## 스크립트
- `pnpm dev` — 개발 서버
- `pnpm build` — 타입체크 + 프로덕션 빌드
- `pnpm test` — 유닛 테스트(vitest)
- `pnpm lint` — 타입 체크

## 기능
- **로그인** — 관리자 이메일/비밀번호, 토큰 저장(localStorage), 새로고침 시 세션 복원
- **회원 관리** (`/members`, ADMIN·SUPER_ADMIN) — 목록·검색·페이지네이션, 정지/해제
- **여행지 관리** (`/places`, ADMIN·SUPER_ADMIN) — 목록(지역코드·상태 필터), 생성(좌표·점수·희귀도·태그·KO/EN/JA/ZH 번역), 상태(공개/숨김) 토글, 대표 이미지 업로드·삭제, 가중치 배정, 구도 가이드 관리, 구도 CSV 일괄 등록
- **컬렉션 관리** (`/collections`, ADMIN·SUPER_ADMIN) — 목록·생성·수정·삭제, 여행지 편성(추가/제거)
- **뱃지 관리** (`/badges`, ADMIN·SUPER_ADMIN) — 목록·생성(기준 LEVEL/VISIT_COUNT + 다국어)·수정·삭제
- **점수 가중치** (`/weight-configs`, ADMIN·SUPER_ADMIN) — 방문/사진 가중치 프리셋 목록·생성·수정·삭제
- **관리자 관리** (`/admins`, SUPER_ADMIN 전용) — 목록·검색, 생성, 수정(이름/역할/활성)
- 역할(`SUPER_ADMIN`/`ADMIN` 2종)에 따라 사이드바 메뉴·라우트 접근 제어, `/health` 연결 상태 배지

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
| GET | `/api/admin/places?province=&status=&page=&limit=` | 여행지 목록(place 원본 행, 이름 미포함) |
| POST | `/api/admin/places` | `{regionCode, lat?, lng?, basePoints, rarityWeight, tags?, translations[]}` (KO 필수) |
| PATCH | `/api/admin/places/:id/status` | `{status: ACTIVE\|HIDDEN}` |
| PATCH | `/api/admin/places/:id/weight-config` | `{configId: uuid\|null}` |
| POST/DELETE | `/api/admin/places/:id/image` | 대표 이미지 업로드(multipart)·삭제 |
| GET/POST | `/api/admin/places/:id/compositions` | 구도 목록·생성(KO 필수) |
| POST | `/api/admin/places/:id/compositions/photos` | 구도 예시 사진 업로드(multipart) → `{imageKey}` |
| DELETE | `/api/admin/places/compositions/:compositionId` | 구도 삭제 |
| POST | `/api/admin/compositions/import` | 구도 CSV 일괄 등록(multipart) |
| GET/POST/PATCH/DELETE | `/api/admin/weight-configs` | 점수 가중치 CRUD |
| GET/POST/PATCH/DELETE | `/api/admin/collections` | 컬렉션 CRUD |
| POST/DELETE | `/api/admin/collections/:id/places[/:placeId]` | 컬렉션 여행지 추가·제거 |
| GET/POST/PATCH/DELETE | `/api/admin/badges` | 뱃지 CRUD |
| GET | `/api/health` | 연결 상태 배지용 |

> 여행지 상세/이름 조회, 컬렉션 여행지 목록 조회 등은 백엔드 API가 나오면 추가 예정.

## 구조
- `src/lib/` — `apiClient`(fetch 래퍼+`withQuery`·`apiUpload`·`assetUrl`), `endpoints`, `auth`, `tokenStore`, `types`, `errors`, `format`
- `src/lib/api/` — `members`, `admins`, `places`, `weightConfigs`, `badges`, `collections`, `compositions` (타입드 호출)
- `src/hooks/useList.ts` — 목록 공통(page/q/로딩/에러)
- `src/auth/AuthContext.tsx` — 로그인 상태(`useAuth`)
- `src/components/` — `Layout`, `ProtectedRoute`, `RequireRole`, `Pagination`, `SearchBar`, `Modal`, `ConnectionStatus`, `PlaceManageModal`, `CompositionsModal`, `CompositionImportModal`
- `src/pages/` — `LoginPage`, `MembersPage`, `PlacesPage`, `CollectionsPage`, `BadgesPage`, `WeightConfigsPage`, `AdminsPage`
