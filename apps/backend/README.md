# backend

NestJS API with structured logging (`nestjs-pino`), OpenTelemetry tracing, Swagger docs (`/docs`), Zod-validated config (`src/env.ts`), sign-in with better-auth, rate limiting, health probes and PostgreSQL through Prisma 7.

## Scripts

| Command                             | What it does                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm --filter backend dev`         | Run in watch mode                                                                      |
| `pnpm --filter backend build`       | Compile to `dist/`                                                                     |
| `pnpm --filter backend start`       | Run the compiled app                                                                   |
| `pnpm --filter backend test`        | Unit and integration tests (Vitest)                                                    |
| `pnpm --filter backend test:e2e`    | End-to-end tests against a throwaway Postgres (Testcontainers; Docker must be running) |
| `pnpm --filter backend check-types` | Type-check                                                                             |
| `pnpm --filter backend lint`        | Lint                                                                                   |

## Environment

Declared and validated in `src/env.ts`; the app exits at startup with a clear error if a required variable is missing. See `.env.example`, which a test keeps in step with the schema. `OTEL_EXPORTER_OTLP_ENDPOINT` is where traces are sent; unset disables export.

## Structure

- `src/modules/`: one directory per business concern: controller, service, module and DTOs.
- `src/lib/`: cross-cutting wiring (logging, error filter, response envelope, request ids, shutdown, rate limits). No business logic.
- `test/`: tests that boot the app.

## Responses

Every response is `{ success: true, data }`, or `{ success: false, error: { code, message, timestamp, path } }`. Every response carries an `x-request-id` header: the one the caller sent, or a new one.

## Database

The schema is `prisma/schema.prisma`; the client is generated into `src/generated` (not committed) by `build`, `dev`, `lint`, `check-types` and `test`. Prisma 7 needs a driver adapter, which `PrismaService` provides. The only input is `DATABASE_URL`, a connection string for any PostgreSQL: the one in `compose.yaml` locally, a hosted one in production.

## Sign-in

better-auth keeps accounts and sessions in the four auth tables (`prisma/migrations/0001_init`). Email and password work always; Google sign-in turns on when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Every route needs a session unless it says `@AllowAnonymous()`. Sign-in and sign-up are limited to 5 requests a minute per address, in every environment. `pnpm auth:seed` creates an account per role (`<role>@example.com`); the password is `SEED_PASSWORD`, which outside production defaults to `password1234`.

## Container

`docker build -f apps/backend/Dockerfile .` from the repository root builds the image. It runs as a non-root user, serves no `/docs`, and applies the committed migrations before it starts. The security workflow scans it for known vulnerabilities on every pull request.

## Health

`GET /health/live` answers while the process is up. `GET /health/ready` also asks the database and answers 503 when it does not reply, so a platform can hold traffic back.
