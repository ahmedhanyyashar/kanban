import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import type { PrismaClient } from "@/generated/prisma/client";

vi.mock("@/env", () => ({
  env: {
    BETTER_AUTH_SECRET: "x".repeat(32),
    BETTER_AUTH_URL: "http://localhost:3001",
    TRUSTED_ORIGINS: "http://localhost:3100",
  },
}));

async function build() {
  vi.resetModules();
  const { createAuth } = await import("./auth.js");
  return createAuth(mockDeep<PrismaClient>());
}

describe("createAuth", () => {
  it("limits sign-in and sign-up in every environment", async () => {
    const { rateLimit } = (await build()).options;
    expect(rateLimit?.enabled).toBe(true);
    expect(rateLimit?.customRules?.["/sign-in/email"]).toEqual({
      window: 60,
      max: 5,
    });
  });
});
