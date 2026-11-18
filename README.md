# kanban

A collaborative kanban board: web app, API and shared packages in one pnpm and Turborepo workspace.

## Stack

- **Web:** React 19, Vite, react-router, TanStack Query, Tailwind and shadcn (in `packages/ui`).
- **API:** NestJS, Prisma, PostgreSQL, better-auth, OpenAPI.
- **Quality:** Vitest, Testcontainers, Playwright, axe, Lighthouse, GitHub Actions.

## Layout

| Path                  | What it holds                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `apps/web`            | The single-page app                                                                                  |
| `apps/backend`        | The API                                                                                              |
| `packages/ui`         | shadcn components, blocks, theme                                                                     |
| `packages/api-client` | Typed client generated from the API's OpenAPI document                                               |
| `packages/shared`     | Contracts and permissions used by both apps                                                          |
| `docs`                | [Decisions](docs/decisions.md), [known limitations](docs/known-limitations.md), the OpenAPI document |

## Run it locally

Needs Node 24, pnpm and Docker.

```sh
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up
pnpm db:deploy
pnpm dev
```

The web app runs on http://localhost:3100 and the API on http://localhost:3001 (docs at `/docs`).

## Commands

| Command                  | What it does                                      |
| ------------------------ | ------------------------------------------------- |
| `pnpm dev`               | Run every app in watch mode                       |
| `pnpm lint`              | Lint                                              |
| `pnpm check-types`       | Type-check                                        |
| `pnpm test`              | Unit tests                                        |
| `pnpm build`             | Build everything                                  |
| `pnpm api:generate`      | Rebuild the OpenAPI document and the typed client |
| `pnpm db:up` / `db:down` | Start or stop the local database                  |

Per-app scripts, environment and structure are in `apps/backend/README.md` and `apps/web/README.md`. Contributor and agent rules are in [AGENTS.md](AGENTS.md).
