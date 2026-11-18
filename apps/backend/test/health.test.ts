import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, expect, it } from "vitest";

import { AppModule } from "@/app.module";

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(() => app.close());

it("answers the liveness probe in the response envelope", async () => {
  const response = await request(app.getHttpServer()).get("/health/live");
  expect(response.status).toBe(200);
  // every response passes through the envelope: { success, data }, never the raw return value
  expect(response.body.success).toBe(true);
  expect(response.body.data.status).toBe("ok");
});

it("sends a request id back, and keeps the one it was given", async () => {
  const generated = await request(app.getHttpServer()).get("/health/live");
  expect(generated.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);

  const kept = await request(app.getHttpServer())
    .get("/health/live")
    .set("x-request-id", "trace-1");
  expect(kept.headers["x-request-id"]).toBe("trace-1");
});

it("answers a failure in the error envelope", async () => {
  const response = await request(app.getHttpServer()).get("/nothing-here");
  expect(response.status).toBe(404);
  expect(response.body).toMatchObject({
    success: false,
    error: { code: "NOT_FOUND", path: "/nothing-here" },
  });
});
