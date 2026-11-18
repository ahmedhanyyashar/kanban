// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// What the static host sends with every page, and where it falls back for a route the app owns.
const headers = readFileSync(
  new URL("../public/_headers", import.meta.url),
  "utf8",
);
const redirects = readFileSync(
  new URL("../public/_redirects", import.meta.url),
  "utf8",
);

const policy = /Content-Security-Policy: (.*)/.exec(headers)?.[1] ?? "";
const directive = (name: string) =>
  policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `)) ?? "";

describe("public/_headers", () => {
  it("runs scripts from the site itself only", () => {
    expect(directive("script-src")).toBe("script-src 'self'");
    expect(policy).not.toContain("unsafe-eval");
    expect(directive("object-src")).toBe("object-src 'none'");
  });

  it("leaves the API's address for the deploy step to fill in, for both requests and sockets", () => {
    expect(directive("connect-src")).toContain("__API_ORIGIN__");
    expect(directive("connect-src")).toContain("__API_SOCKET_ORIGIN__");
  });

  it("keeps the page out of frames and stops content sniffing", () => {
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
    expect(headers).toContain(
      "Referrer-Policy: strict-origin-when-cross-origin",
    );
  });
});

describe("public/_redirects", () => {
  it("serves the app for any address, so a reload on a route works", () => {
    expect(redirects.trim()).toBe("/* /index.html 200");
  });
});
