import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

import { afterEach, describe, expect, it, vi } from "vitest";

import { envSchema } from "./env";

const example = readFileSync(join(__dirname, "../.env.example"), "utf8");

describe(".env.example", () => {
  it("satisfies the schema as it is", () => {
    expect(() => envSchema.parse(parseEnv(example))).not.toThrow();
  });

  it("documents every variable the app reads, and nothing else", () => {
    const documented = [...example.matchAll(/^#?\s*([A-Z][A-Z0-9_]*)=/gm)].map(
      (match) => match[1],
    );
    const read = Object.keys(envSchema.shape).filter((n) => n !== "NODE_ENV");
    expect(documented.sort()).toEqual(read.sort());
  });
});

describe("env on Render", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const load = async (own: string | undefined, set?: string) => {
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/db");
    vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("RENDER_EXTERNAL_URL", own);
    vi.stubEnv("BETTER_AUTH_URL", set);
    vi.stubEnv("TRUSTED_ORIGINS", undefined);
    vi.resetModules();
    return (await import("./env.js")).env;
  };

  it("takes the service's own address as the base URL and the trusted origin", async () => {
    const env = await load("https://kanban.onrender.com");
    expect(env.BETTER_AUTH_URL).toBe("https://kanban.onrender.com");
    expect(env.TRUSTED_ORIGINS).toBe("https://kanban.onrender.com");
  });

  it("lets a value set by hand win", async () => {
    const env = await load("https://kanban.onrender.com", "https://app.test");
    expect(env.BETTER_AUTH_URL).toBe("https://app.test");
  });
});
