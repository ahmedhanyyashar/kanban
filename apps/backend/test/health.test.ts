import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

import { AppModule } from "@/app.module";
import { PrismaService } from "@/lib/database/prisma.service";

let app: INestApplication;
const ping = vi.fn();

beforeAll(async () => {
  // a live service (the database) is replaced by a stub, so the test needs nothing running
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ ping })
    .compile();
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

it("is ready when the database answers, and says 503 when it does not", async () => {
  ping.mockResolvedValueOnce(undefined);
  const ready = await request(app.getHttpServer()).get("/health/ready");
  expect(ready.status).toBe(200);
  expect(ready.body.data.checks).toEqual({ prismaService: "ok" });

  ping.mockRejectedValueOnce(new Error("connection refused"));
  const down = await request(app.getHttpServer()).get("/health/ready");
  expect(down.status).toBe(503);
  expect(down.body.data.status).toBe("error");
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
