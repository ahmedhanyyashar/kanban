import path from "node:path";

import { defineConfig } from "vitest/config";

// `test/e2e-setup.ts` starts a throwaway Postgres for the run, so specs never touch the dev database.
export default defineConfig({
  resolve: {
    alias: {
      "@test": path.resolve(import.meta.dirname, "./test"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    passWithNoTests: true,
    include: ["test/e2e/**/*.e2e-spec.ts"],
    globalSetup: ["./test/e2e-setup.ts"],
    // Every spec file shares the run's one database.
    fileParallelism: false,
    // Pulling the Postgres image on a first run can take a while.
    hookTimeout: 120_000,
    // No DATABASE_URL here: `test/e2e-setup.ts` sets it to the throwaway database, and a value in this list would replace it.
    env: {
      PORT: "3001",
      TRUST_PROXY: "0",
      TRUSTED_ORIGINS: "http://localhost:3100",
      BETTER_AUTH_SECRET: "local-development-secret-at-least-32-characters",
      BETTER_AUTH_URL: "http://localhost:3001",
      NODE_ENV: "test",
    },
  },
});
