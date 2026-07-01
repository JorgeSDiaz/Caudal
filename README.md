# Caudal

Personal-finance app for tracking where your money goes **and** where it comes from, designed to grow into a full personal-finance system.

## Features

- **Fast capture** — log an expense or income in seconds (amount, category/source, date, optional note).
- **Expenses & incomes** — opinionated fixed expense categories and income sources (Sueldo, Freelance, Cashback…), tuned for Colombia (COP).
- **Financial periods** — reports and lists use a personal cycle from the 30th to the 30th instead of calendar months.
- **Monthly reports** — expense, income, net balance, averages, breakdowns, and month-over-month comparison.
- **Recurring movements** — create fixed expenses or incomes from the capture forms and review them alongside the workflow.
- **Bento dashboard** — compact sidebar navigation with capture, analysis, recurrentes, and movement lists arranged for daily use.
- **Backup** — export/import all expenses and incomes as a single JSON document.

## Stack

- **Backend** — Python 3.12 · FastAPI · SQLModel · PostgreSQL · Alembic
- **Frontend** — React 19 · TypeScript · Vite · React Router · Tailwind CSS · shadcn/ui · SWR
- **Contract** — OpenAPI schema → generated typed TS client (`src/api/schema.d.ts`)
- **Tooling** — uv (Python) · pnpm workspaces · pyright strict · ruff · Docker

## Running locally

### Option A — full stack in Docker

```bash
docker compose up --build   # first time
docker compose up           # afterwards
```

| Service | URL |
|---------|-----|
| Web | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| DB | localhost:5432 |

### Option B — host (DB in Docker)

```bash
# 1. Start only the database
docker compose up -d db

# 2. Install JS deps (from repo root)
pnpm install

# 3. API — copy .env.example and fill in DATABASE_URL
cd apps/api && cp ../../.env.example .env
uv sync
uv run python -m uvicorn app.main:app --reload

# 4. Web (separate terminal, from repo root)
pnpm --filter web dev
```

> **Windows note:** always use `python -m uvicorn` — Smart App Control blocks unsigned venv `.exe` shims.

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
