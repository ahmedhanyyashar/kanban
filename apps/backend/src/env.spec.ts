import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

import { describe, expect, it } from "vitest";

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
