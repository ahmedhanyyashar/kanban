# web

The single-page app: React 19 on Vite, react-router, TanStack Query, Tailwind and the shadcn components in `packages/ui`.

## Scripts

| Command                         | What it does                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm --filter web dev`         | Run the dev server on http://localhost:3100                                    |
| `pnpm --filter web build`       | Production build into `dist/`                                                  |
| `pnpm --filter web test`        | Unit and component tests (Vitest)                                              |
| `pnpm --filter web test:e2e`    | Playwright tests; they start the API and the app (needs a database, see below) |
| `pnpm --filter web check-types` | Type-check                                                                     |
| `pnpm --filter web lint`        | Lint                                                                           |

## Environment

Declared and validated in `src/env.ts`; see `.env.example`. `VITE_API_URL` is where the API runs (default `http://localhost:3001`). Vite inlines `VITE_*` values into the bundle, so they are public: never put a secret in one. Turborepo includes them in the build's cache key, so a build for another API address is never served from the cache.

## Structure

- `src/pages`: one file per route; they compose features.
- `src/features/<feature>`: `api` (the only calls to the client), `hooks` (queries, mutations, realtime), `lib` (pure logic with tests), `components`.
- `src/layouts`: the signed-in shell with the session guard.
- `src/lib`: the API and auth clients (the session-ended handling is here), the safe return address after sign-in and the error message helper.
- `src/components`: the providers (theme, query cache, motion, toasts) and pieces used across pages.
- `src/providers`, `src/hooks`: the query client, and hooks used across pages.
- `e2e`: Playwright specs. The public-page accessibility scans run in every browser; the signed-in specs run in Chromium against the real API.

The whole map is in [docs/architecture.md](../../docs/architecture.md).

## End-to-end tests

The signed-in specs need the API and a database. Start the local database (`pnpm db:up`, then `pnpm db:deploy`), have a `.env` for the API (copy `apps/backend/.env.example`), and Playwright starts the API and the app for you. Sign-up is rate limited on purpose (five a minute), so the specs share one account per run, made through the API, and use their own only when they sign out or need an empty workspace. Running the suite twice within a minute can fail with a 429: wait and run again. The accessibility check alone (`E2E_API=off pnpm --filter web exec playwright test e2e/a11y.spec.ts --project=chromium`) needs no API.
