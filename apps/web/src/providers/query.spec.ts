import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-client";

import { retryQuery } from "./query";

describe("retryQuery", () => {
  it("does not ask again after a refusal", () => {
    expect(retryQuery(0, new ApiError("Not found", 404))).toBe(false);
    expect(retryQuery(0, new ApiError("Your session has ended", 401))).toBe(
      false,
    );
  });

  it("asks again, twice at most, after a server or network failure", () => {
    expect(retryQuery(0, new ApiError("Oops", 503))).toBe(true);
    expect(retryQuery(1, new ApiError("Could not reach the server"))).toBe(
      true,
    );
    expect(retryQuery(2, new ApiError("Oops", 503))).toBe(false);
  });
});
