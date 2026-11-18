import { execSync } from "node:child_process";
import path from "node:path";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

// Starts a throwaway Postgres with Testcontainers (Docker must be running), applies the schema
// with the committed migrations, and points DATABASE_URL at it for the specs. The container is
// removed when the run ends.
export default async function setup() {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const url = container.getConnectionUri();
  execSync("pnpm exec prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
  // The committed migrations must produce the schema the client was generated from: a schema change
  // without its migration fails here, not in production.
  execSync(
    "pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code",
    {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
  // Test workers start after this and inherit it.
  process.env["DATABASE_URL"] = url;

  return async () => {
    await container.stop();
  };
}
