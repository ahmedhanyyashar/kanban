# Architecture

The map of the codebase: what the pieces are and where to look. Read it first; the reasons behind the larger choices are in [decisions.md](decisions.md).

Keep it current: a pull request that adds or moves an app, package, web feature or API module updates the codemap in the same pull request, and `pnpm docs:check` fails when one is missing.

## Codemap

### Repository root

| Path                                      | What it holds                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `package.json`, `turbo.json`              | The workspace scripts and the Turborepo task graph                         |
| `pnpm-workspace.yaml`                     | The workspace, and the `catalog:` that holds every dependency version      |
| `.github/workflows`                       | CI and the security scans                                                  |
| `.github/rulesets`, `.github/settings.sh` | The branch rules and repository settings, applied with the CLI             |
| `docs`                                    | This map, the decisions and the generated API description (`openapi.json`) |
| `scripts`                                 | Repository scripts, such as the check that this map is complete            |

### `apps/backend`: the API

Start at `src/main.ts` (boots the app), then `src/app.module.ts` (lists the modules).

| Path                                                     | What it holds                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/env.ts`                                             | The validated environment; the only place that reads `process.env`                                        |
| `apps/backend/src/modules/board`                         | The realtime gateway (`board.gateway.ts`): rooms per board, presence and the events the services emit     |
| `apps/backend/src/modules/column`                        | Columns of a board; a column with tasks cannot be deleted                                                 |
| `apps/backend/src/modules/task`                          | Tasks, including moving one, and the checks that the column and the assignee are on the board             |
| `apps/backend/src/modules/ai`                            | Task generation, breakdown and board summary, through the model provider                                  |
| `apps/backend/src/modules/user`                          | Searching accounts to invite                                                                              |
| `apps/backend/src/modules/health`                        | Liveness and readiness (readiness asks the database)                                                      |
| `src/lib/auth`                                           | The sign-in setup (email and password, optional Google) and its rate limits                               |
| `src/openapi.ts`, `export-openapi.ts`                    | The OpenAPI document: served at `/docs` outside production, written to `docs/openapi.json` for the client |
| `src/lib/database`                                       | The shared Prisma service                                                                                 |
| `prisma`                                                 | `schema.prisma` (auth, boards, columns, tasks, activity); the migrations are committed beside it          |
| `src/lib/serialization`                                  | Converts database decimals to numbers at the boundary                                                     |
| `src/lib/filters`, `interceptors`                        | The error shape and the `{ success, data }` envelope, applied to every route                              |
| `src/lib/logger`, `request-id`, `rate-limit`, `shutdown` | Logging, request ids, the default rate limit, graceful shutdown                                           |
| `Dockerfile`                                             | The production image of the API (Node 24, non-root); it applies the migrations when it starts             |
| `src/instrumentation.ts`                                 | OpenTelemetry tracing, started only when an endpoint is configured                                        |
| `scripts/seed.ts`                                        | An account for each role and, outside production, a sample board                                          |
| `test`                                                   | Tests that boot the app                                                                                   |

### `apps/web`: the single-page app

Start at `src/main.tsx` (mounts the app), `src/components/providers.tsx` (theme, query cache, motion, toasts) and `src/router.tsx` (every route).

| Path                              | What it holds                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/pages`                       | One file per route; they compose features and hold no data logic                                                     |
| `src/layouts`                     | The signed-in shell: session guard, sidebar, user menu                                                               |
| `apps/web/src/features/boards`    | Boards and the kanban board: `api` (calls), `hooks` (queries, mutations, realtime), `lib` (pure logic), `components` |
| `apps/web/src/features/tasks`     | Tasks: the dialog and form, the mutations, due dates and priorities                                                  |
| `apps/web/src/features/workspace` | Pieces shared by the workspace pages, such as the stat card                                                          |
| `apps/web/src/features/landing`   | The public page: navbar, hero, features, how it works, the AI section and the footer                                 |
| `apps/web/src/features/users`     | The avatar                                                                                                           |
| `src/lib`                         | The API and auth clients (the session-ended handling is here) and the safe return address after sign-in              |
| `src/providers`                   | The query client                                                                                                     |
| `src/hooks`                       | Hooks used across pages, such as the page title                                                                      |
| `src/env.ts`                      | The validated environment (`VITE_*` values are public: Vite inlines them)                                            |
| `e2e`                             | Playwright specs: sign-up and sign-in, public-page accessibility, every signed-in page                               |
| `src/router.tsx`                  | The routes, and the boundary that shows a message when a page fails to render and clears it on navigation            |

### `packages`

| Path                         | What it holds                                                           |
| ---------------------------- | ----------------------------------------------------------------------- |
| `packages/ui`                | The design system: the theme (`src/globals.css`), components and blocks |
| `packages/api-client`        | The typed HTTP client, generated from `docs/openapi.json`               |
| `packages/shared`            | What the API and the web app agree on: roles and the error shape        |
| `packages/eslint-config`     | The shared ESLint configs                                               |
| `packages/typescript-config` | The shared `tsconfig` bases                                             |
