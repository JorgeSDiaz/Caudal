# Caudal — guía de arquitectura y estilo

App de control de gastos. Monorepo: **FastAPI** (`apps/api`) + **React** (`apps/web`) + **Postgres** (`db`).
El contrato front/back es **OpenAPI → cliente TS tipado** (`apps/web/src/api/schema.d.ts`, regenerado desde el backend).

Estas reglas son la referencia. Antes de extender, el código nuevo debe encajar en ellas.

## Principios transversales

- **Interfaces antes que implementaciones.** El consumidor define el contrato que necesita; la
  implementación concreta lo satisface y se conecta en un único punto de composición.
- **Componentes desacoplados.** Un módulo/feature no importa los detalles internos de otro.
  El acoplamiento entre contextos pasa siempre por un contrato, no por el adapter concreto.
- **Complejidad mínima.** Una responsabilidad por unidad (caso de uso, hook, componente, request).
  Funciones cortas, sin anidamiento profundo, sin estado derivado vía efectos cuando se puede derivar en render.
- **Comentarios solo de _por qué_, nunca de _qué_.** El nombre dice qué hace; el comentario explica
  una decisión no obvia (por qué atómico, por qué este orden, por qué este workaround). Si un comentario
  parafrasea el código, sobra: renombra en vez de comentar. Los docstrings de módulo/caso de uso valen
  cuando aportan el _porqué_, no cuando repiten el nombre del archivo.

## Backend (`apps/api`) — Hexagonal + Screaming

La estructura grita el dominio, no el framework. Cada **bounded context** es una carpeta de primer
nivel bajo `app/` (`expenses`, `categories`, `reports`) y repite el mismo patrón interno:

```
<context>/
  domain/        # entidades y value objects puros (sin framework ni persistencia)
  ports/         # contratos como typing.Protocol (interfaces, sin implementación)
  application/   # un caso de uso por archivo; clase con __call__ y un Command/Query frozen
  adapters/
    inbound/http/        # routers + schemas Pydantic (mapean request <-> caso de uso)
    outbound/persistence/ # repos SQLModel que satisfacen los ports (structural typing)
  wiring.py      # composition root: construye casos de uso y expone Annotated deps
```

Reglas:
- **Ports = `typing.Protocol`.** Los adapters los satisfacen estructuralmente, sin herencia.
- **Domain puro.** Nada de FastAPI/SQLModel en `domain/`. Validación de invariantes en `__post_init__`.
- **Desacople entre contextos:** un contexto que necesita algo de otro define su propio port acotado
  (ej. `expenses/ports/category_checker.py` con solo `exists`) y un adapter lo une en `wiring.py`.
  `expenses` no importa el módulo `categories` directamente.
- **Casos de uso** reciben sus dependencias por constructor (los ports), nunca instancian adapters.
- Pyright en modo estricto; Pydantic solo en la frontera HTTP.

## Frontend (`apps/web`) — Screaming feature-sliced

Sigue el _espíritu_ del backend (gritar el dominio, contratos antes que detalles) sin forzar
ports/adapters: en React eso suele ser ceremonia vacía. Cada **feature** vive en `src/features/<feature>/`
con esta estructura replicable:

```
features/<feature>/
  <feature>.ts     # EL OBJETO: tipos del dominio derivados del schema OpenAPI (fuente única)
  api/             # requests al backend (un archivo por operación: create/update/list/...)
  hooks/           # hooks de datos (SWR) que envuelven los requests
  components/       # UI de la feature
```

Ejemplos: `features/expenses/expense.ts`, `features/categories/category.ts`, `features/reports/report.ts`.

Reglas:
- **El tipo del objeto se define una sola vez** en `<feature>.ts` (re-exporta del schema OpenAPI).
  Nadie más redeclara `Expense`/`Category`/`MonthlyReport`; todos importan desde ahí.
- **`api/`** = adapters de salida hacia el backend. Cada función hace un request y mapea errores.
- **`hooks/`** orquestan caché/revalidación (SWR) sobre los requests; no contienen el `fetch` inline.
- **`components/`** consumen hooks y tipos de la feature; no llaman a `api/` directamente para datos
  de lectura (van por el hook), pero sí para mutaciones puntuales (create/update/delete).
- **Código compartido entre features** vive en `src/shared/` (`money.ts`, `dates.ts`, `swr-keys.ts`),
  no dentro de una feature. Si dos features importan algo de una tercera, ese algo es `shared/`.
- `src/components/ui/` es shadcn (no tocar a mano salvo regenerar); `src/lib/utils.ts` es util de shadcn.

## Verificación antes de dar por hecho un cambio

- Web: `pnpm --filter web exec tsc -p tsconfig.app.json --noEmit` y `pnpm --filter web exec eslint src`.
- API: `cd apps/api && uv run pytest -q` (y pyright estricto si está disponible en el entorno).
- Al cambiar el contrato del backend, **regenerar** `apps/web/src/api/schema.d.ts`.
