# Contributing

## Workflow

1. Branch from an up-to-date `main`, named `<type>/<short-description>`, for example `feat/boards-api`.
2. Keep the change focused: one concern per pull request, with its tests and its decision record.
3. Open a pull request with the template. The required checks must pass and the branch must be up to date with `main`.
4. Pull requests are **rebase-merged**. Every commit lands on `main` exactly as written, so each one is a buildable step with a message that explains it. `main` has a linear history and only changes through pull requests.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org), checked by commitlint in the commit hook and in CI.

```text
<type>(<optional scope>): <imperative summary, lower case, no period>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Put the reason in the body when it is not obvious.

CI tests only the last commit of a pull request, so check each commit before pushing: it installs, type-checks and lints on its own.

## Before pushing

```sh
pnpm lint && pnpm format:check && pnpm check-types && pnpm test && pnpm build
```

The git hooks are part of the workflow; do not bypass them with `--no-verify`.

## Repository settings

The settings that live outside the code are in [`.github/settings.sh`](.github/settings.sh), and the branch rules are in [`.github/rulesets/main.json`](.github/rulesets/main.json). Run `.github/settings.sh <owner>/<repo>` after creating the repository and again after changing either file. What they enforce:

- `main` changes only through a pull request that has passed the required checks and is up to date with `main`.
- History is linear; force pushes and deleting `main` are blocked; the rules apply to administrators too.
- Only rebase merging is enabled, and branches are deleted when a pull request merges.
- Secret scanning with push protection, Dependabot alerts and private vulnerability reporting are on; workflows get a read-only token by default.
- Required signed commits are not enabled. Rebase merging rewrites commits on GitHub, which would drop the signatures.

When a pull request adds a job to a workflow, add its name to the required checks in the ruleset file in the same pull request.

## Conventions

Rules for code, the API contract, the database and the UI are in [AGENTS.md](AGENTS.md); the reasons behind the larger choices are in [docs/decisions.md](docs/decisions.md).
