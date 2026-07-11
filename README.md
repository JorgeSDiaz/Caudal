# Caudal

Personal-finance app for tracking where your money goes **and** where it comes from, designed to grow into a full personal-finance system.

## Features

- **Fast capture** — log an expense or income in seconds (amount, category/source, date, optional note).
- **Expenses & incomes** — opinionated fixed expense categories and income sources (Sueldo, Freelance, Cashback…), tuned for Colombia (COP).
- **Financial periods** — reports and lists use a personal cycle from the 30th to the 30th instead of calendar months.
- **Monthly reports** — expense, income, net balance, breakdowns, and month-over-month comparison.
- **Recurring movements** — create fixed expenses or incomes and materialize due occurrences into real movements.
- **Bento dashboard** — compact sidebar navigation with capture, analysis, recurrentes, and movement lists arranged for daily use.
- **Backup** — export/import all expenses and incomes as a single JSON document.

## Stack

- **Backend** — Go 1.26 · net/http · GORM · PostgreSQL · goose · slog · testify
- **Frontend** — React 19 · TypeScript · Vite · React Router · Tailwind CSS · shadcn/ui · SWR
- **Contract** — OpenAPI YAML → generated typed TS client (`src/api/schema.d.ts`)
- **Tooling** — Go toolchain · pnpm workspaces · Docker

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
| OpenAPI | http://localhost:8000/openapi.json |
| DB | localhost:5432 |

### Option B — host API and web, DB in Docker

```bash
# 1. Start only the database
docker compose up -d db

# 2. API — copy .env.example and fill in DATABASE_URL if needed
cd apps/api
go mod download
go run ./cmd/api

# 3. Web (separate terminal, from repo root)
pnpm install
pnpm --filter web dev
```

## Useful Commands

```bash
# API
cd apps/api
go test ./...
go build ./cmd/api
gofmt -w cmd internal tools.go

# Web
pnpm --filter web exec tsc -p tsconfig.app.json --noEmit
pnpm --filter web exec eslint src
pnpm --filter web build
pnpm --filter web run generate:api
```

## Architecture

The backend is a modular monolith using screaming + hexagonal architecture. Domain logic lives in each context under `internal/<context>/domain`, contracts live in `ports`, use cases live in `application`, and technical adapters live in `adapters/http` or `adapters/persistence`.

Shared technical code lives in `internal/platform`: config, logging, HTTP helpers, clock, GORM setup, and goose migrations. It must stay free of business rules.

Goose SQL migrations in `apps/api/db/migrations` are the DDL source of truth. GORM models are persistence models only, not domain entities.

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
