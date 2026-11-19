# Known limitations

What the project does not do, stated as plain facts. Each is a deliberate boundary of a demonstration project, or a gap that is listed so it is a decision and not a surprise. Items already done (dependency audit and review, CodeQL, container and secret scans, Dependabot, API security headers, a Content Security Policy for the web app, same-site return addresses after sign-in, session end handled in one place, a written release and rollback) are not repeated here.

## Hosting and environments

- **The app sleeps when idle.** Render's free plan stops the service (the API and the web app it serves) after a quiet period; the first request after that can take up to a minute. There is no CDN: every request goes to that one instance.
- **One environment.** There is local and production, with no staging or preview deployments.
- **No documented backup or restore.** The database host's defaults apply; a restore has not been practised and no retention period is stated for any kind of data.
- **Rollback is a revert, and a migration is not undone.** [deploying.md](deploying.md) says how to roll back; migrations are written expand before contract so the previous version keeps working, but a rollback of one has not been rehearsed.
- **No feature flags.** A change goes live, or does not, with the deploy.

## Authentication and sessions

- **Email and password only, no email.** There is no email verification, password reset, list of sessions, "sign out everywhere" or account deletion. Google sign-in works only when its two variables are set, which they are not by default.
- **Session lifetime is the library's default.** Expiry, idle timeout and the number of devices were not decided.
- **The web app and the API share one address.** The API serves the built web app, so the session cookie is first-party. Putting them on unrelated hosts is not supported: browsers may refuse a cookie set by the other site.
- **Rate limits live in memory.** The global limit (120 requests a minute) and the stricter sign-in and sign-up limits count per address and per running instance, so they reset on restart and are not shared if the API runs more than once. There is no per-person limit.
- **A session that ended keeps live updates for up to 30 seconds.** The API checks every connected socket on that interval. The browser leaves the board within seconds in most cases, but a person who closes the lid with a socket open is covered only by the sweep. The check costs one session lookup per connected socket.
- **A draft is lost when the session ends.** Whatever was typed into an open dialog is gone after the redirect to sign-in; the return path keeps the page, not the draft.

## Privacy and abuse

- **Any signed-in person can search every account** by name or email (two characters or more, ten results), limited to 30 searches a minute per address, and inviting an unknown email answers "No user found with that email". Both reveal who has an account.
- **Invites need an existing account.** There are no pending invitations, and nothing is emailed.
- **No per-person caps on sockets or rooms.** One person can open many connections; cursor events are throttled by time only.
- **AI has no per-person quota or cost cap.** Each AI route is limited to 10 requests a minute per address and each call to 30 seconds, but a person on many addresses is not limited. A model call is slow and paid.
- **No privacy policy, terms, cookie notice, data export or data deletion** for people who sign up.
- **Security headers come from the API.** `apps/backend/src/lib/web/security-headers.ts` sets a Content Security Policy and the usual headers on every response, the app's pages included. The policy allows inline styles (the animation library and per-board colours need them) and the Google Fonts stylesheet; it has not been tested against a deployed site.
- **User text is shown as text by convention.** There is no written output-safety policy, no HTML or markdown in descriptions, and no attachments.
- **Errors reach the person with the API's own messages.** They were written for people, but they have not been reviewed for what they confirm about other records.
- **No threat model or penetration test.**

## Data and boards

- **Deleting is permanent.** A task, a column (only when empty) or a whole board (owner only) cannot be recovered or undone, and there is no trash.
- **Two people editing one card: the last save wins,** with no message. Task edits carry no version, so a stale tab overwrites a newer change.
- **Card order is a number the browser chooses.** Positions are fractions that the client computes; the server does not validate or rebalance them, so after many moves in the same gap they can stop separating, and two simultaneous moves are not reconciled.
- **"Done" means a column named Done.** Overdue marks, My tasks, the dashboard counts and the AI summary treat a task as finished by its column's title, so renaming or deleting that column changes the answers. Tasks in a Done column can still be marked overdue for the summary.
- **Nothing is paginated.** A board returns all its columns and tasks, the board list returns every board, and the activity feed returns at most the latest 100.
- **Team, Calendar and My tasks read every board.** They fetch each board separately and combine the results in the browser, so the cost grows with the number of boards.
- **No workspaces or teams above boards,** no admin console and no audit export.
- **No comments, mentions, attachments, notifications or digests.** Realtime updates only reach people who have the board open.
- **No translation, right-to-left layout or time-zone handling.** A due date is a calendar day compared with the viewer's own "today"; dates near midnight were not tested in other zones.
- **The server clock decides "now".** Expiry, the session sweep and overdue marks depend on it; drift between servers was not considered.
- **The migration rule is expand then contract, but a destructive migration has not been rehearsed** against a copy of production data.

## AI

- **The default model name is an alias, not tested against the provider on a schedule.** `gemini-flash-latest` once answered 503 for high demand; the explicit models available to a key change, and `gemini-2.5-flash` is withdrawn for new keys.
- **Output quality depends on the model.** A small model words risks loosely (for example, calling a finished card "past its deadline"). Dates are compared in code and only marked in the prompt, so wording is the model's own.
- **The real provider is checked by hand.** The routes and the error mapping are tested with the model stubbed, but there is no fixed set of prompts reviewed when the prompt or the model changes, and no test that the provider still answers.

## Operations

- **No error tracking, metrics, alerts or uptime check.** Traces go out only when an OpenTelemetry endpoint is configured; nothing receives browser errors, and nobody is paged.
- **No request id is shown to the person** when something fails, so a report cannot be matched to a log line.
- **No service level objective, on-call, incident process, postmortem template or status page.**
- **No capacity or cost budget,** and no service-level measurement on the liveness and readiness probes that exist.
- **No circuit breaker around the AI provider.** A call times out after 30 seconds and the SDK retries twice, but a provider that is down is still tried on every request.
- **Writes are not idempotent.** A retried or double-clicked create can create two items (the forms disable the button while saving, which covers the common case).

## Front end

- **A failed read is retried twice, a refusal is not.** A network or server failure is asked again, a 4xx is not, and nothing shows the retry. A failed refetch shows a toast or leaves the previous data. A page that fails to render shows a message with a retry button, and moving to another page clears it.
- **The development console shows a warning from the theme library.** `next-themes` renders a `<script>` that React 19 warns about in development builds; production builds do not log it, and the theme still applies before the first paint.
- **No code splitting.** The app ships as one bundle, and the build warns about its size. There is no size budget.
- **Realtime has no visible "reconnecting" or offline state.** A dropped connection refetches the board when it returns.
- **Browser and device support is not written down.** Signed-in pages are tested on Chromium; the engines and the phone profile cover the public pages.
- **Accessibility was verified automatically and in a headless browser.** There has been no screen-reader pass, no keyboard-only pass of every flow in a real browser (the keyboard drag has not been exercised in one), no zoom and reflow review, and no published accessibility statement.

## Tests and pipeline

- **Signed-in end-to-end tests run on Chromium only,** and share one account for the run. Sign-up is rate limited on purpose (five a minute), so a test that signs out or needs an empty workspace makes its own, and running the suite twice within a minute can fail with a 429: wait and run again. WebKit runs only in CI on this author's machine, which cannot run it.
- **No coverage tracking, mutation or property tests** for ordering and permissions, no load or soak test, no visual regression and no test with the network down or the API failing.
- **Realtime is tested with real sockets for who may join and who hears what,** and at the sweep level for ended sessions (a fake server, and once by hand). There is no test of cursor events, reconnection or many connections.
- **Authorization tests cover boards, tasks and columns over HTTP,** not every route (users, activity, AI) for every role.

## Process

- **No CODEOWNERS, changelog or version policy.** The branch rules are committed (`.github/rulesets`), and a release is a merge to `main` that Render puts live once its checks have passed.
- **No on-call runbook.** The architecture map has diagrams, the README says how to run the project, and [deploying.md](deploying.md) covers a release and a rollback; what to do when an alert fires is not written down, because there are no alerts.
- **One dependency advisory is ignored.** picomatch has a high-severity ReDoS (GHSA-fc5q-39xc-vjpf) with no patched release yet; it is reached only through dev tooling. The entry is in `pnpm-workspace.yaml` and is removed once 4.0.8 is published.
- **No SBOM or license check,** and build tooling versions are not pinned beyond the lockfile.
