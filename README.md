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
- API: `cd apps/api && uv sync && uv run python -m uvicorn app.main:app --reload`
  (use the `python -m` form; Windows Smart App Control blocks unsigned venv `.exe` shims)
