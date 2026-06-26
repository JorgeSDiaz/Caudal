# syntax=docker/dockerfile:1
# Build context is the repo ROOT (pnpm workspace), not apps/web.

# ---- base: Node + pnpm via corepack ----
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /repo

# ---- deps: install workspace deps for the web package (cached layer) ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter web --frozen-lockfile

# ---- dev: Vite dev server with HMR; source is bind-mounted by compose ----
FROM deps AS dev
EXPOSE 5173
CMD ["pnpm", "--filter", "web", "dev"]

# ---- build: produce static assets ----
FROM deps AS build
COPY apps/web ./apps/web
RUN pnpm --filter web build

# ---- runtime: serve the built SPA with nginx ----
FROM nginx:alpine AS runtime
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
