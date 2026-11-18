# web

The single-page app: React 19 on Vite, react-router, TanStack Query, Tailwind and the shadcn components in `packages/ui`.

## Scripts

| Command                         | What it does                                |
| ------------------------------- | ------------------------------------------- |
| `pnpm --filter web dev`         | Run the dev server on http://localhost:3100 |
| `pnpm --filter web build`       | Production build into `dist/`               |
| `pnpm --filter web test`        | Unit and component tests (Vitest)           |
| `pnpm --filter web check-types` | Type-check                                  |
| `pnpm --filter web lint`        | Lint                                        |

## Environment

Declared and validated in `src/env.ts`; see `.env.example`. `VITE_API_URL` is where the API runs (default `http://localhost:3001`). Vite inlines `VITE_*` values into the bundle, so they are public: never put a secret in one. Turborepo includes them in the build's cache key, so a build for another API address is never served from the cache.

## Structure

- `src/pages`: one file per route; they compose features.
- `src/layouts`: the signed-in shell with the session guard.
- `src/lib`: the API and auth clients, and the safe return address after sign-in.
- `src/components`: the providers (theme, query cache, motion, toasts) and pieces used across pages.
- `src/providers`, `src/hooks`, `src/lib`: the query client, shared hooks and helpers.

The whole map is in [docs/architecture.md](../../docs/architecture.md).
