# @repo/api-client

Typed HTTP client for the backend API, generated from `docs/openapi.json` with `openapi-typescript` and called through `openapi-fetch`.

## Usage

```ts
import { createApiClient } from "@repo/api-client";

const api = createApiClient({
  baseUrl: "http://localhost:3001",
  credentials: "include",
});
const { data } = await api.GET("/health/live"); // paths and response types come from the spec
```

## Regenerate after the API changes

```bash
pnpm api:generate
```

The document (`docs/openapi.json`) and the types (`src/generated`) are committed, and the `api-contract` check in CI fails when a controller changed and they did not.
