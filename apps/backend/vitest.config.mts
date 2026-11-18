import path from "node:path";

import { defineConfig } from "vitest/config";

// Vite's own transformer emits the decorator metadata Nest's dependency injection reads, from the
// experimentalDecorators and emitDecoratorMetadata settings in tsconfig.json: no native add-on is needed.
export default defineConfig({
  // mirrors tsconfig.json's paths so tests import like app code does
  resolve: {
    alias: {
      "@test": path.resolve(import.meta.dirname, "./test"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts", "test/**/*.test.ts"],
    env: {
      PORT: "3001",
      TRUST_PROXY: "0",
      TRUSTED_ORIGINS: "http://localhost:3100",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/kanban",
      BETTER_AUTH_SECRET: "local-development-secret-at-least-32-characters",
      BETTER_AUTH_URL: "http://localhost:3001",
    },
  },
});
