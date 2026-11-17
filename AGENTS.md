# AGENTS.md

Guidance for AI coding agents and for people. It holds the rules that are easy to break and not obvious from the code; the rest lives elsewhere:

- [docs/architecture.md](docs/architecture.md): the map of the codebase. Read it before changing structure.
- [docs/decisions.md](docs/decisions.md): why, as numbered decisions.
- [CONTRIBUTING.md](CONTRIBUTING.md): the workflow, commits and the repository rules.

## Commands

```sh
pnpm install        # install the locked dependencies
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm format:check
pnpm docs:check     # every app, package, feature and module is in the architecture map
```

Before declaring a change done run `pnpm lint`, `pnpm check-types` and `pnpm test`, and `pnpm build` when the change can break it. Add a dependency only when the platform and the existing dependencies do not cover the need; versions come from the `catalog:` in `pnpm-workspace.yaml`.

## Conventions

- **TypeScript only**, strict. No `any`, no type assertions (`as`), no `console.log`.
- **Environment:** read configuration only through a validated env module, never `process.env` or `import.meta.env` directly. A new variable goes in the schema and in `.env.example`.
- **UI:** components come from `@repo/ui`, used as they are (no size or radius overrides); add one with the shadcn CLI. Colours come from theme tokens. Icon-only controls get a `title` and an `aria-label`.
- **Accessibility** is part of the work: one `h1` and one `main` per page, a keyboard path for every action, contrast in both themes.

## Documentation

A change that adds or moves an app, package, web feature or API module updates the codemap in `docs/architecture.md`. A design decision is recorded in `docs/decisions.md` in the same pull request.

## Git

- Conventional Commits, small pull requests; each commit builds on its own. Pull requests are rebase-merged. Never bypass the hooks (`--no-verify`).
- Do not commit `.env` files other than `.env.example`, and do not edit `pnpm-lock.yaml` by hand.
