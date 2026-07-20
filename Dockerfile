# 한땀 어드민(Vite + React) — 멀티스테이지: node로 빌드 → nginx로 서빙.
# 호스트에 node/pnpm 불필요. backend의 compose.server.yml이 ../admin 을 빌드 컨텍스트로 사용.

# --- build stage ---
FROM node:24.14.0-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
# pnpm-workspace.yaml(allowBuilds: esbuild 등 네이티브 빌드 승인)을 install 전에 두어야
# esbuild/tailwind 네이티브 바이너리가 빌드된다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# 브라우저 → nginx(/api/) → 백엔드 app:3000. 빌드 시 API base 주입.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

# --- serve stage ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx 설정은 compose에서 ./docker/nginx-admin.conf 를 마운트(backend repo에 위치).
EXPOSE 80
