import { createApiClient } from "@repo/api-client";

import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

export const api = createApiClient({
  baseUrl: env.VITE_API_URL,
  credentials: "include",
});

/** What a person is told when the server no longer knows their session. */
export const SESSION_ENDED = "Your session has ended. Sign in again.";

// A refusal for a missing or ended session means the session is over, wherever it ended (another
// device, expiry, a revoke): ask the session store to look again, and the layout around signed-in
// pages sends the person to sign in. One place, so no screen has to know.
api.use({
  onResponse({ response }) {
    if (response.status === 401) authClient.$store.notify("$sessionSignal");
  },
});

/** A failed call: the message to show a person, and the HTTP status when the server answered at all. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The API's `{ error: { message } }` message (a list of them joined), or `fallback`. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null || !("error" in error))
    return fallback;
  const { error: body } = error;
  if (typeof body !== "object" || body === null || !("message" in body))
    return fallback;
  const { message } = body;
  if (typeof message === "string" && message) return message;
  if (Array.isArray(message) && message.every((m) => typeof m === "string"))
    return message.join(". ");
  return fallback;
}

type ApiResult<Data> = {
  data?: { data: Data };
  error?: unknown;
  response?: { status: number };
};

/**
 * The `data` of a successful answer, or a thrown Error whose message is the API's own, so what
 * the caller shows a person (a toast) reads well. A network failure is told apart from a refusal.
 */
export async function unwrap<Data>(
  request: Promise<ApiResult<Data>>,
): Promise<Data> {
  let result: ApiResult<Data>;
  try {
    result = await request;
  } catch {
    throw new ApiError("Could not reach the server. Check your connection.");
  }
  if (result.data === undefined) {
    const status = result.response?.status;
    if (status === 401) throw new ApiError(SESSION_ENDED, status);
    throw new ApiError(
      apiErrorMessage(result.error, "Something went wrong. Try again."),
      status,
    );
  }
  return result.data.data;
}
