# Design decisions

Short records of the choices that shaped the code: what was chosen, why, and what it costs. Newest decisions go at the bottom.

## Index

1. [Where it runs](#1-where-it-runs)
2. [TypeScript and ESLint are held back](#2-typescript-and-eslint-are-held-back)
3. [Browsers and screens under test](#3-browsers-and-screens-under-test)
4. [Review and quality gates from the first pull request](#4-review-and-quality-gates-from-the-first-pull-request)
5. [The codebase is documented in the repository](#5-the-codebase-is-documented-in-the-repository)
6. [The API contract is declared once and typed end to end](#6-the-api-contract-is-declared-once-and-typed-end-to-end)
7. [AI output is a draft: validated, limited and previewed](#7-ai-output-is-a-draft-validated-limited-and-previewed)
8. [Accessibility is checked at four levels](#8-accessibility-is-checked-at-four-levels)
9. [A session that ends is noticed everywhere it was in use](#9-a-session-that-ends-is-noticed-everywhere-it-was-in-use)

## 1. Where it runs

One container service on AWS Lightsail runs the API, which also serves the built web app; the database is on Neon.

- **Why:** one address means the session cookie is first-party and there is no cross-origin traffic, and the project has no domain. Lightsail gives a container an HTTPS address for a flat few dollars a month; Neon is free and does not expire.
- **Alternatives:** the web app on a static host and the API elsewhere (the cookie is then third-party and Safari and Firefox block it, which needs a shared domain to fix); Render or Cloudflare (a card or a paid plan is needed to run a container); App Runner (no documented websocket support, and the live updates need one).
- **Consequences:** the web and the API deploy together, there is no CDN, and a release is pushed by hand (a deploy from CI is a later step).

## 2. TypeScript and ESLint are held back

`typescript-eslint` supports TypeScript below 6.1 only, so the compiler is held at `~6.0.3`. The React, import and accessibility lint plugins support ESLint up to 9, so ESLint is held at `~9.39`. Both move when the plugins do. Three peer warnings remain (`nestjs-zod` and `@nestjs/swagger` ask for older Nest majors, `openapi-typescript` for TypeScript 5); they are warnings only and the code works with them.

## 3. Browsers and screens under test

End-to-end tests run on Chromium, Firefox and WebKit, and on a phone-sized Chromium, from the first test. The accessibility scan runs on Chromium only, because its findings do not depend on the engine. The signed-in specs (a board journey and every page behind the sign-in) also run on Chromium only, against the real API and a Postgres database, because they check how the screens and the API agree, not how an engine renders.

## 4. Review and quality gates from the first pull request

Lint, types, unit tests, build, API contract, end-to-end tests, accessibility, Lighthouse and commit messages are checked on every pull request. The pull request template lists what only a person can check.

## 5. The codebase is documented in the repository

A map ([architecture.md](architecture.md), with diagrams and a codemap), the decisions, the known limitations, a README for each app and package, and `AGENTS.md`: all Markdown, changed in the pull request that changes the code. `pnpm docs:check` fails CI when an app, package, web feature or API module is missing from the map.

- **Why:** documentation in the repository is reviewed with the code, renders on GitHub and cannot be left behind by a separate system; a check keeps the one list that rots fastest, the map, complete.
- **Alternatives:** a documentation site generator (a build, a host and a second place to update); a wiki (it drifts); generated reference for the apps (the OpenAPI document already describes the API, and the apps have no public code API).
- **Consequences:** a site can be built later from the same files. Prose in the map is checked by people, not by the script.

## 6. The API contract is declared once and typed end to end

Every response has a zod schema in `@repo/shared/contracts/board`, wrapped in the success envelope and attached to its route; the exported OpenAPI description and the generated client come from them. Dates are ISO strings, a due date is a calendar day at UTC midnight (`YYYY-MM-DD` in requests), and positions are numbers: the response interceptor turns database decimals into numbers. Board roles and `canManageMembers` live in `@repo/shared/board-role`, used by the API and the web app.

- **Why:** a route with no declared answer gives the client `unknown`, and a decimal that arrives as a string breaks arithmetic. One schema documents, types and (for requests) validates.
- **Checks:** `test/contract.test.ts` fails when a route lacks a success body or a 401; CI regenerates the description and fails on a diff.
- **Consequences:** a nullable text field needs a length limit, or the generator describes it as an array. `@repo/shared` must be built before the API runs or exports.

## 7. AI output is a draft: validated, limited and previewed

Every model call goes through `AiService`. Task suggestions are drafts: the web app shows them and the person adds what they want through the normal task routes, so what is saved is what was shown (the route can also save in one call when given a column). The answer is parsed against a schema with the exact count before it leaves the server. The person's text goes between tags and is called data, a call has a 30 second limit, and each route is limited to 10 requests a minute. Overdue marks are computed in code and written into the prompt, so the model does not judge dates. The provider's reason is logged and the person gets a general message, except for a quota, which is told as one.

- **Why:** a model call is slow, paid and not deterministic; each rule keeps one failure from becoming the product's failure.
- **Checks:** unit tests of the error mapping and the prompt with the provider stubbed; end-to-end tests of the routes with the model stubbed; the real provider by hand.
- **Consequences:** quality depends on the model, there is no quota per person or cost cap, and the model name is an alias that is tried by hand before a release.

## 8. Accessibility is checked at four levels

Lint (`jsx-a11y`) catches mistakes while typing; Vitest with axe-core checks a component's roles, names and structure in jsdom; Playwright with axe scans the real pages in light and dark and drives the keyboard; Lighthouse gates the score. The palette's contrast is tested where it is defined (`theme.contrast.spec.ts`), because a browser scan cannot reach every state or theme.

- **Why:** each level sees what the others cannot (jsdom has no layout or colour, a page scan cannot reach a closed dialog, automated tools find about a third of the issues). Keyboard and screen-reader review stays manual.
- **Conventions:** a link that looks like a button is a `ButtonLink` (a real anchor); every page has one `main` and a skip link; icon-only controls carry a name; motion follows the visitor's reduce-motion setting; drag and drop works from the keyboard and announces names, not ids.
- **Consequences:** a theme change that breaks a contrast pair fails a unit test; the board's keyboard drag has no automated test until a page renders it in a browser.

## 9. A session that ends is noticed everywhere it was in use

- **Decision:** one refusal for a missing session (a 401 on any API call) asks the session store to look again, and the layout around signed-in pages then clears the cached data and sends the person to sign in. The API socket checks every connected session every 30 seconds and drops the ones that ended; the browser looks at its session when the server drops it.
- **Why:** a session can end where no open tab hears of it (another device, expiry, a revoke). Without this the tab kept showing a board, toasted "Unauthorized", and kept receiving that board's live updates; and cached data stayed in memory for the next person to sign in on the tab.
- **Checks:** `board.gateway.spec.ts` (the sweep), `api-client.spec.ts` (the 401 path) and a Playwright test that ends the session over the API while the tab stays open.
