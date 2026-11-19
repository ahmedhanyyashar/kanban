import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { serveWeb } from "./serve-web";

describe("serveWeb", () => {
  const dir = mkdtempSync(join(tmpdir(), "web-"));
  let app: NestExpressApplication;

  beforeAll(async () => {
    mkdirSync(join(dir, "assets"));
    writeFileSync(join(dir, "index.html"), "<!doctype html><title>app</title>");
    writeFileSync(join(dir, "assets", "app-1a2b3c.js"), "console.info(1)");
    const moduleRef = await Test.createTestingModule({}).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    serveWeb(app, dir);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const asBrowser = (path: string) =>
    request(app.getHttpServer()).get(path).set("Accept", "text/html");

  it("serves the app at the root and at any address the app routes itself", async () => {
    for (const path of ["/", "/dashboard", "/board/8f2c"]) {
      const res = await asBrowser(path);
      expect(res.status, path).toBe(200);
      expect(res.text).toContain("<title>app</title>");
      expect(res.headers["cache-control"]).toBe("no-cache");
    }
  });

  it("answers a HEAD request for a page too", async () => {
    const res = await request(app.getHttpServer())
      .head("/board/8f2c")
      .set("Accept", "text/html");
    expect(res.status).toBe(200);
  });

  it("serves built files, which never change, with a long cache", async () => {
    const res = await request(app.getHttpServer()).get("/assets/app-1a2b3c.js");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("immutable");
  });

  it("leaves the API's own paths and non-page requests alone", async () => {
    for (const path of ["/health/live", "/docs", "/api/auth/get-session"]) {
      expect((await asBrowser(path)).text, path).not.toContain("<title>app");
    }
    const json = await request(app.getHttpServer())
      .get("/boards")
      .set("Accept", "application/json");
    expect(json.text).not.toContain("<title>app");
    expect(json.status).toBe(404);
  });
});
