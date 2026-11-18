import { createAuthClient } from "better-auth/react";

import { env } from "@/env";

// The API serves the auth routes, so the client talks to it and sends its cookie along.
export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  fetchOptions: { credentials: "include" },
});
