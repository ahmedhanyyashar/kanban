# @repo/shared

What the API and the web app must agree on, in one place.

## What is in it

| Path                         | What it holds                                              |
| ---------------------------- | ---------------------------------------------------------- |
| `src/contracts/api-error.ts` | The error shape                                            |
| `src/permissions.ts`         | The access control statements for the auth library's roles |

## Using it

Each file is imported by name, without an index:

```ts
import { apiErrorSchema } from "@repo/shared/contracts/api-error";
```

Types come from `src`, and the code that runs comes from the built `dist`. Build it before running the API (`pnpm --filter @repo/shared build`); the root `pnpm build` does.

## Rules

- This package is an ES module because the browser imports it: use `"type": "module"` and file extensions in relative imports.
- A rule that both sides need (a limit, a role, a response shape) lives here, never copied.
