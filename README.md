# Caudal

Personal expense-tracking app, designed to grow into a full personal-finance system.

Monorepo: **FastAPI** (`apps/api`) + **React** (`apps/web`) + **Postgres** (`db`).

## Stack
- Backend: Python + FastAPI + SQLModel (pyright strict, Pydantic at the boundaries)
- Frontend: React + TypeScript
- DB: PostgreSQL (Docker)
- Front/back contract: OpenAPI -> generated typed TS client

## Development
- Install (from root): `pnpm install`
- Web: `pnpm --filter web dev` (http://localhost:5173)
- DB:  `docker compose -f db/docker-compose.yml up -d`
- API: `cd apps/api && uv run uvicorn app.main:app --reload`
