# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# API
cd apps/api
go test ./...                                                # all tests
go test ./internal/expenses/application                      # single package
go test ./... -run TestCreateExpense                         # by test name
gofmt -w cmd internal tools.go                               # format
go build ./cmd/api                                           # compile API

# Web
pnpm --filter web exec tsc -p tsconfig.app.json --noEmit   # typecheck
pnpm --filter web exec eslint src                           # lint
pnpm --filter web build                                     # production build (validates lazy-import paths)
pnpm --filter web run generate:api                          # regenerate schema.d.ts from apps/api/openapi/caudal.yaml
```

The API requires `DATABASE_URL` in `apps/api/.env`. For host dev: `docker compose up -d db` first.
When adding a web dependency, install it inside the running container (the container has a Linux-specific `node_modules` volume that masks the host's).

---

## Architecture

### Backend — Hexagonal + Screaming

Structure screams the domain, not the framework. Every bounded context (`expenses`, `categories`, `reports`, `incomes`) repeats the same internal layout:

```
<context>/
  domain/              # pure Go — no framework, no persistence; invariants in constructors
  ports/               # interfaces owned by this context
  application/         # one use case per file: struct with Execute + Command/Query types
  adapters/
    http/              # net/http handlers + DTOs
    persistence/       # GORM models/repositories satisfying ports

internal/platform/ contains shared technical implementation: config, logging, HTTP helpers, clock, GORM setup, and migrations. It must not contain business rules.
internal/app/router.go is the composition root.
```

### Frontend — Screaming feature-sliced

Each feature in `src/features/<feature>/` follows the same replicable layout:

```
<feature>/
  <feature>.ts   # single source of truth for the domain type (re-exports from OpenAPI schema)
  api/           # one file per backend operation
  hooks/         # SWR hooks — own the cache key and revalidation logic
  components/    # UI
```

Cross-feature helpers go in `src/shared/` (`money.ts`, `dates.ts`, `swr-keys.ts`). `src/components/ui/` is shadcn — regenerate with the CLI, never hand-edit.

---

## Quality rules

These are the non-negotiable constraints. New code must fit them; when in doubt, match the existing pattern rather than introducing a new one.

### Interfaces before implementations
The consumer defines the contract it needs; the concrete implementation satisfies it and is wired at a single composition root. In the backend this is Go `interface` + `internal/app/router.go`. In the frontend this is the hook: components depend on the hook's return shape, not on the fetch implementation.

### Decoupled contexts
A context never imports another context's adapters or internals. Cross-context coupling goes through a port defined by the *consumer*. Example: `expenses` needs to validate categories but defines its own `CategoryChecker` port and wires an implementation in `internal/app/router.go`.

### One responsibility per unit
One use case per file, one request function per `api/` file, one hook per data concern, one component per UI responsibility. If a unit needs a long comment to explain what it does, it is doing too much.

### No framework in the domain
Nothing from `net/http`, GORM, JSON DTOs, or SQL models inside `domain/`. Domain errors map to HTTP status codes in HTTP adapters, not in the domain or application layers.

### Comments explain *why*, never *what*
The name says what; a comment is only warranted when there is a non-obvious constraint, invariant, or workaround that would surprise a future reader. Module-level docstrings that restate the file name are noise — delete them. Class/field docstrings that feed the OpenAPI schema are kept.

### No derived state via effects (frontend)
State that can be computed from existing data is computed during render, not in a `useEffect`. The hook owns async state; the component derives display values from it inline.

### Single source of truth for types (frontend)
Each domain type (`Expense`, `Category`, `MonthlyReport`) is declared once in `<feature>.ts` re-exporting from the OpenAPI schema. No file redeclares a type that already exists elsewhere.

### OpenAPI contract
When backend routes or schemas change, update `apps/api/openapi/caudal.yaml` and regenerate the TS client (`pnpm --filter web run generate:api`). All frontend API types derive from `src/api/schema.d.ts` — never hand-write them.

### Database migrations
Goose SQL migrations are the DDL source of truth, not GORM models. Migration files live in `apps/api/db/migrations/`.
