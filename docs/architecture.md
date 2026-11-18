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
| `scripts/seed.ts`                                        | An account for each role                                                                                  |
| `test`                                                   | Tests that boot the app                                                                                   |

### `packages`

| Path                         | What it holds                                                           |
| ---------------------------- | ----------------------------------------------------------------------- |
| `packages/ui`                | The design system: the theme (`src/globals.css`), components and blocks |
| `packages/api-client`        | The typed HTTP client, generated from `docs/openapi.json`               |
| `packages/shared`            | What the API and the web app agree on: roles and the error shape        |
| `packages/eslint-config`     | The shared ESLint configs                                               |
| `packages/typescript-config` | The shared `tsconfig` bases                                             |
