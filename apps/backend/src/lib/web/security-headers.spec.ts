import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { securityHeaders } from "./security-headers";

describe("securityHeaders", () => {
  let app: NestExpressApplication;
  let headers: Record<string, string | string[] | undefined>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({}).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.use(securityHeaders);
    await app.init();
    headers = (await request(app.getHttpServer()).get("/")).headers;
  });

  afterAll(() => app.close());

  const policy = () => String(headers["content-security-policy"]);
  const directive = (name: string) =>
    policy()
      .split(";")
      .find((part) => part.startsWith(`${name} `));

  it("runs scripts from the site itself only, and loads no objects", () => {
    expect(directive("script-src")).toBe("script-src 'self'");
    expect(policy()).not.toContain("unsafe-eval");
    expect(directive("object-src")).toBe("object-src 'none'");
  });

  it("lets the page talk to its own address (requests and sockets) and no other", () => {
    expect(directive("connect-src")).toBe("connect-src 'self'");
  });

  it("keeps the page out of frames, stops sniffing and insists on HTTPS", () => {
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });
});
