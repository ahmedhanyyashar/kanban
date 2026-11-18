// First: it sets the environment the rest of the app reads. The document is built without a database or Redis,
// so anything that would connect to a service stays inert (NODE_ENV=test).
import "./lib/openapi/export-env";

import { mkdirSync, writeFileSync } from "node:fs";

import { Test } from "@nestjs/testing";

import { AppModule } from "./app.module";
import { PrismaService } from "./lib/database/prisma.service";
import { createDocument } from "./openapi";

// Builds the app without listening or a database and writes its document to docs/openapi.json.
async function main() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  mkdirSync("../../docs", { recursive: true });
  writeFileSync(
    "../../docs/openapi.json",
    JSON.stringify(createDocument(app), null, 2),
  );
  await app.close();
}

void main();
