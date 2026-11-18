# backend

NestJS API with structured logging (`nestjs-pino`), OpenTelemetry tracing, Zod-validated config (`src/env.ts`), rate limiting and a health probe.

## Scripts

| Command                             | What it does                        |
| ----------------------------------- | ----------------------------------- |
| `pnpm --filter backend dev`         | Run in watch mode                   |
| `pnpm --filter backend build`       | Compile to `dist/`                  |
| `pnpm --filter backend start`       | Run the compiled app                |
| `pnpm --filter backend test`        | Unit and integration tests (Vitest) |
| `pnpm --filter backend check-types` | Type-check                          |
| `pnpm --filter backend lint`        | Lint                                |

## Environment

Declared and validated in `src/env.ts`; the app exits at startup with a clear error if a required variable is missing. See `.env.example`, which a test keeps in step with the schema. `OTEL_EXPORTER_OTLP_ENDPOINT` is where traces are sent; unset disables export.

## Structure

- `src/modules/`: one directory per business concern: controller, service, module and DTOs.
- `src/lib/`: cross-cutting wiring (logging, error filter, response envelope, request ids, shutdown, rate limits). No business logic.
- `test/`: tests that boot the app.

## Responses

Every response is `{ success: true, data }`, or `{ success: false, error: { code, message, timestamp, path } }`. Every response carries an `x-request-id` header: the one the caller sent, or a new one.

## Health

`GET /health/live`.
