# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal expense-tracking app (Caudal). Monorepo: **FastAPI** (`apps/api`) + **React** (`apps/web`) + **Postgres** (`db`). The front/back contract is **OpenAPI → generated typed TS client** (`apps/web/src/api/schema.d.ts`).

---

## Commands

### Full stack (Docker — recommended first run)
```bash
docker compose up --build   # first time
docker compose up           # afterwards
```
Services: web → http://localhost:5173 · api → http://localhost:8000 · db → localhost:5432

### API (`apps/api`) — uses `uv`
```bash
cd apps/api
uv run pytest -q                          # all tests
uv run pytest tests/expenses/test_create_expense.py  # single file
uv run pytest -k "test_create"            # by name pattern
uv run ruff check app                     # lint
uv run ruff format app                    # format
uv run python -m uvicorn app.main:app --reload  # dev server (use -m form on Windows)
```
> The API needs `DATABASE_URL` set. For local dev without Docker: `docker compose up -d db` then set `DATABASE_URL=postgresql+psycopg://...` in `apps/api/.env`.

### Web (`apps/web`) — uses `pnpm`
```bash
pnpm --filter web dev                     # dev server
pnpm --filter web exec tsc -p tsconfig.app.json --noEmit  # typecheck
pnpm --filter web exec eslint src         # lint
pnpm --filter web build                   # production build (catches lazy-import paths)
pnpm --filter web run generate:api        # regenerate schema.d.ts (API must be running)
```

### Adding a web dependency
Install inside the running container or rebuild the image — the container has a Linux-specific `node_modules` volume that masks the host's. See memory note on this.

---

## Architecture

### Backend — Hexagonal + Screaming

Structure screams the domain, not the framework. Each **bounded context** is a top-level folder under `app/` and repeats the same internal pattern:

```
<context>/
  domain/              # pure Python entities and value objects — no framework, no persistence
  ports/               # typing.Protocol contracts owned by this context
  application/         # one use case per file; class with __call__ + frozen Command/Query dataclass
  adapters/
    inbound/http/      # FastAPI router + Pydantic schemas (request ↔ use case mapping)
    outbound/          # concrete adapters satisfying ports (SQLModel repos, cross-context adapters)
  wiring.py            # composition root: builds use cases from adapters, exposes Annotated FastAPI deps
```

Key rules:
- **Ports are `typing.Protocol`** — adapters satisfy them structurally, no inheritance.
- **Domain is pure** — no FastAPI or SQLModel inside `domain/`. Invariants go in `__post_init__`.
- **Cross-context coupling goes through a port** — `expenses` needs categories but defines its own `CategoryChecker` port (`exists(id)` only) and wires it in `wiring.py`. It never imports from `categories/adapters/` directly.
- **Use cases take ports in their constructor** and never instantiate adapters themselves.
- **Error mapping** lives in `app/main.py` (domain error → HTTP status). Don't add HTTP concerns to domain or application layers.
- Pyright strict mode. Pydantic only at the HTTP boundary.

### Frontend — Screaming feature-sliced

Mirrors the backend's spirit (domain first, contracts before details) without forcing ports/adapters, which would be empty ceremony in React. Each **feature** lives in `src/features/<feature>/`:

```
features/<feature>/
  <feature>.ts     # THE OBJECT: domain types re-exported from the OpenAPI schema — single source of truth
  api/             # one file per backend operation (create, update, delete, list…)
  hooks/           # SWR hooks that wrap the api/ functions — own the cache key and revalidation
  components/      # UI components for this feature
```

Shared helpers (used by more than one feature) live in `src/shared/`: `money.ts`, `dates.ts`, `swr-keys.ts`.

Key rules:
- **Each type is declared once** in `<feature>.ts`. Nobody redeclares `Expense`, `Category`, or `MonthlyReport` — they all import from there.
- **`components/`** call `api/` directly for mutations (create/update/delete), but always go through a hook for reads.
- **`src/components/ui/`** is shadcn — regenerate with the CLI, don't hand-edit. `src/lib/utils.ts` is shadcn's `cn` utility.
- State derived from existing data is computed during render, not via `useEffect`.

### OpenAPI contract

When backend routes or schemas change, regenerate the TS client with the API running:
```bash
pnpm --filter web run generate:api
```
This rewrites `apps/web/src/api/schema.d.ts`. All frontend types for API objects derive from it.

### Database migrations

Alembic. Migration files live in `apps/api/migrations/versions/`. The DDL source of truth is the migration, not the SQLModel models.

---

## Code style

- **Comments explain _why_, never _what_**. If a comment paraphrases the code, rename instead. Module-level docstrings that only restate the file name are noise — remove them.
- One responsibility per unit: one use case per file, one request per `api/` file, one hook per concern.
- No effects for derived state — compute during render.
