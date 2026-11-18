import { describe, expect, it, vi } from "vitest";

import { ApiError, SESSION_ENDED, api, unwrap } from "./api-client";
import { authClient } from "./auth-client";

// the session store belongs to the auth library: here it is only asked to look again
vi.mock("./auth-client", () => ({
  authClient: { $store: { notify: vi.fn() } },
}));

const refused = (status: number, message: string) =>
  Promise.resolve({
    error: { error: { message } },
    response: { status },
  });

describe("a request the server refuses", () => {
  it("tells a person whose session ended to sign in, instead of repeating 'Unauthorized'", async () => {
    await expect(unwrap(refused(401, "Unauthorized"))).rejects.toThrow(
      SESSION_ENDED,
    );
  });

  it("keeps the server's own words for any other refusal", async () => {
    await expect(
      unwrap(refused(403, "Only the owner can do that")),
    ).rejects.toThrow("Only the owner can do that");
  });
});

describe("a failure carries what the caller needs to decide", () => {
  it("keeps the status of a refusal, and has none when the server was not reached", async () => {
    await expect(unwrap(refused(404, "Board not found"))).rejects.toMatchObject(
      {
        status: 404,
      },
    );
    await expect(
      unwrap(Promise.reject(new Error("offline"))),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ApiError && error.status === undefined,
    );
  });
});

describe("any answer that says the session is over", () => {
  it("makes the session store look again, so the signed-in pages let go", async () => {
    const notify = vi.mocked(authClient.$store.notify);

    await api.GET("/boards", {
      fetch: () => Promise.resolve(new Response(null, { status: 401 })),
    });

    expect(notify).toHaveBeenCalledWith("$sessionSignal");
  });

  it("leaves the session alone for a refusal that is about something else", async () => {
    const notify = vi.mocked(authClient.$store.notify);
    notify.mockClear();

    await api.GET("/boards", {
      fetch: () => Promise.resolve(new Response(null, { status: 403 })),
    });

    expect(notify).not.toHaveBeenCalled();
  });
});
