# Caudal

Personal expense-tracking app, designed to grow into a full personal-finance system.

Monorepo: **FastAPI** (`apps/api`) + **React** (`apps/web`) + **Postgres** (`db`).

## Stack
- Backend: Python + FastAPI + SQLModel (pyright strict, Pydantic at the boundaries)
- Frontend: React + TypeScript
- DB: PostgreSQL (Docker)
- Front/back contract: OpenAPI -> generated typed TS client

## Development

### Option A — full stack in Docker (one command)
```
docker compose up --build   # first time (builds the per-service images)
docker compose up           # afterwards
```
- Web: http://localhost:5173
- API: http://localhost:8000 (/health, /docs)
- DB:  localhost:5432

### Option B — run on the host
- Install (from root): `pnpm install`
- DB only: `docker compose up -d db`
- Web: `pnpm --filter web dev` (http://localhost:5173)
- API: `cd apps/api && uv sync && uv run python -m uvicorn app.main:app --reload`
  (use the `python -m` form; Windows Smart App Control blocks unsigned venv `.exe` shims)
