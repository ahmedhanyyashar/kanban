# Architecture

The map of the codebase: what the pieces are and where to look. Read it first; the reasons behind the larger choices are in [decisions.md](decisions.md).

Keep it current: a pull request that adds or moves an app, package, web feature or API module updates the codemap in the same pull request, and `pnpm docs:check` fails when one is missing.

## Codemap

### Repository root

| Path                                      | What it holds                                                         |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `package.json`, `turbo.json`              | The workspace scripts and the Turborepo task graph                    |
| `pnpm-workspace.yaml`                     | The workspace, and the `catalog:` that holds every dependency version |
| `.github/workflows`                       | CI and the security scans                                             |
| `.github/rulesets`, `.github/settings.sh` | The branch rules and repository settings, applied with the CLI        |
| `docs`                                    | This map and the decisions                                            |
| `scripts`                                 | Repository scripts, such as the check that this map is complete       |

### `packages`

| Path                         | What it holds               |
| ---------------------------- | --------------------------- |
| `packages/eslint-config`     | The shared ESLint configs   |
| `packages/typescript-config` | The shared `tsconfig` bases |
