import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import type { PrismaClient } from "@/generated/prisma/client";

const settings = vi.hoisted((): { COOKIE_DOMAIN: string | undefined } => ({
  COOKIE_DOMAIN: undefined,
}));
vi.mock("@/env", () => ({
  env: {
    ...settings,
    BETTER_AUTH_SECRET: "x".repeat(32),
    BETTER_AUTH_URL: "http://localhost:3001",
    TRUSTED_ORIGINS: "http://localhost:3100",
    get COOKIE_DOMAIN() {
      return settings.COOKIE_DOMAIN;
    },
  },
}));

async function build() {
  vi.resetModules();
  const { createAuth } = await import("./auth.js");
  return createAuth(mockDeep<PrismaClient>());
}

describe("createAuth", () => {
  it("keeps the session cookie to the API's own host unless told otherwise", async () => {
    settings.COOKIE_DOMAIN = undefined;
    expect((await build()).options.advanced).toBeUndefined();
  });

  it("shares the session cookie with the web app when the two are subdomains of one domain", async () => {
    settings.COOKIE_DOMAIN = ".example.com";
    expect((await build()).options.advanced?.crossSubDomainCookies).toEqual({
      enabled: true,
      domain: ".example.com",
    });
  });

  it("limits sign-in and sign-up in every environment", async () => {
    const { rateLimit } = (await build()).options;
    expect(rateLimit?.enabled).toBe(true);
    expect(rateLimit?.customRules?.["/sign-in/email"]).toEqual({
      window: 60,
      max: 5,
    });
  });
});
