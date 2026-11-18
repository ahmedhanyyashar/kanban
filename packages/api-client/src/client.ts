import createClient, { type Client, type ClientOptions } from "openapi-fetch";

import type { paths } from "./generated/schema.js";

// The return type is explicit: inferred, it is emitted into the built .d.ts as
// `createClient.Client<...>`, which does not resolve, and every consumer got an untyped client.
export function createApiClient(options: ClientOptions): Client<paths> {
  return createClient<paths>(options);
}
