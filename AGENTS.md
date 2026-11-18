# AGENTS.md

Guidance for AI coding agents and for people. It holds the rules that are easy to break and not obvious from the code; the rest lives elsewhere:

- [docs/architecture.md](docs/architecture.md): the map of the codebase. Read it before changing structure.
- [docs/decisions.md](docs/decisions.md): why, as numbered decisions. [docs/known-limitations.md](docs/known-limitations.md): known gaps.
- `apps/backend/README.md`, `apps/web/README.md` and each package's README: scripts, environment and structure.
- [CONTRIBUTING.md](CONTRIBUTING.md): the workflow, commits and the repository rules.

## Commands

```sh
pnpm install            # install the locked dependencies
pnpm db:up              # start the local PostgreSQL; pnpm db:deploy applies the migrations
pnpm dev                # run the API (3001) and the web app (3100)
pnpm lint
pnpm check-types
pnpm test               # unit and component tests
pnpm build
pnpm api:generate       # rebuild docs/openapi.json and the typed client
pnpm build:libs         # build the workspace libraries (before running an app or a test by hand)
pnpm auth:seed          # demo accounts and a sample board (local only)
pnpm --filter backend test:e2e   # API end to end on a throwaway PostgreSQL (Docker must run)
pnpm --filter web test:e2e       # browser tests against the real API
pnpm docs:check         # every app, package, feature and module is in the architecture map
```

Before declaring a change done run `pnpm lint`, `pnpm check-types` and `pnpm test`, and `pnpm build` when the change can break it. Add a dependency only when the platform and the existing dependencies do not cover the need; versions come from the `catalog:` in `pnpm-workspace.yaml`.

## Conventions

- **TypeScript only**, strict. No `any`, no type assertions (`as`), no `console.log`; the API logs through `nestjs-pino`.
- **Environment:** read configuration only through the validated `src/env.ts` of each app, never `process.env` or `import.meta.env`. A new variable goes in the schema and in `.env.example`.
- **API responses** are `{ success, data }` or `{ success: false, error }`; throw Nest exceptions and let the filter shape the error. Every route declares its success and error answers, including 401.
- **API contract:** the web app calls the API only through `@repo/api-client`. After changing a route or DTO run `pnpm api:generate`; never edit `generated/` files by hand.
- **Database:** a schema change is committed with its migration, expand before contract. Use the shared Prisma service, never another client.
- **Shared rules:** roles, permissions, limits and response contracts live in `@repo/shared` and are used by both apps.
- **Dates:** a calendar day is a date at UTC midnight (`YYYY-MM-DD` on the wire), not an instant.
- **UI:** components come from `@repo/ui`, used as they are (no size or radius overrides); add one with the shadcn CLI. Colours come from theme tokens. Icon-only controls get a `title` and an `aria-label`. Server data goes through TanStack Query, forms through react-hook-form with a zod schema.
- **Failures** are shown with a toast where the action happens and never swallowed in an empty `catch`.
- **A session that ends** is handled in one place (the API client and the shell layout), not in screens.
- **Accessibility** is part of the work: one `h1` and one `main` per page, a keyboard path for every action, contrast in both themes.

## Tests

- Unit and component tests sit next to the code (`*.spec.ts(x)`). Test your own logic, not the libraries, and assert behaviour, not exact numbers or sentences.
- A fixed bug gets a test that fails without the fix.
- API end-to-end tests use a real database and parse answers with the shared contract schemas. Browser tests share one account made through the API; sign-up is rate limited (five a minute), so a test makes its own only when it signs out or needs an empty workspace.

## Gotchas

- `@repo/shared` is imported by the browser, so it is an ES module. Workspace libraries (`shared`, `api-client`) are built before anything that imports them runs: `pnpm dev`, `pnpm build` and the test tasks do it, and a job that runs code directly starts with `pnpm build:libs`.
- Run one watcher or code generator at a time: a build that clears `dist` stops a running watcher, and two `prisma generate` runs at once leave phantom type errors.
- After a route change, `pnpm api:generate`, or the `api-contract` check fails.

## Documentation

A change that adds or moves an app, package, web feature or API module updates the codemap in `docs/architecture.md`. A design decision is recorded in `docs/decisions.md` in the same pull request; a deliberate gap goes in `docs/known-limitations.md`.

## Git

- Conventional Commits, small pull requests; each commit builds on its own. Pull requests are rebase-merged. Never bypass the hooks (`--no-verify`).
- Do not commit `.env` files other than `.env.example`, and do not edit `pnpm-lock.yaml` by hand.
