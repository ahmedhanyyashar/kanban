## What and why

<!-- What changes, and the reason for it. Link the issue if there is one. -->

## How to review

<!-- Where to start, what is risky, what is deliberately left out. Add screenshots or a short recording for UI changes (light and dark, phone width). -->

## Checks only a person can do

<!-- Lint, types, tests, build, API contract, accessibility, Lighthouse and commit messages run in CI; do not tick them here. -->

- [ ] I ran the change locally and used the feature, not only the tests
- [ ] UI: works with the keyboard alone, has visible focus, and reads sensibly to a screen reader
- [ ] UI: checked in light and dark themes and at phone width
- [ ] Database: the migration is safe on existing data and I know how to undo it
- [ ] API: a route or DTO change is regenerated with `pnpm api:generate` and is backward compatible, or the break is described above
- [ ] New environment variables are in the schema and `.env.example`
- [ ] The architecture map (`docs/architecture.md`) is updated if an app, package, feature or module was added or moved
- [ ] A design decision is recorded in `docs/decisions.md`, or there was none
- [ ] No secrets, personal data or debugging leftovers in the diff
