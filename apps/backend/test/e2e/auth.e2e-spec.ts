import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { AppModule } from "@/app.module";

// Real HTTP against the real app and a real (throwaway) database.
const ORIGIN = "http://localhost:3100";
const PASSWORD = "password1234";
const email = `member-${Date.now()}@example.com`;

let app: INestApplication;
let cookie = "";

const post = (path: string, body: object) =>
  request(app.getHttpServer()).post(path).set("Origin", ORIGIN).send(body);

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication({ bodyParser: false });
  await app.init();
});

afterAll(() => app.close());

describe("sign-in", () => {
  it("signs up and starts a session", async () => {
    const response = await post("/api/auth/sign-up/email", {
      name: "Member",
      email,
      password: PASSWORD,
    });
    expect(response.status).toBe(200);
    cookie = z
      .array(z.string())
      .parse(response.headers["set-cookie"])
      .map((c) => c.split(";")[0])
      .join("; ");

    const session = await request(app.getHttpServer())
      .get("/api/auth/get-session")
      .set("Cookie", cookie);
    expect(
      z.object({ user: z.object({ email: z.string() }) }).parse(session.body)
        .user.email,
    ).toBe(email);
  });

  it("ends the session on sign-out", async () => {
    const out = await request(app.getHttpServer())
      .post("/api/auth/sign-out")
      .set("Origin", ORIGIN)
      .set("Cookie", cookie)
      .send({});
    expect(out.status).toBe(200);

    const session = await request(app.getHttpServer())
      .get("/api/auth/get-session")
      .set("Cookie", cookie);
    expect(session.body).toBeNull();
  });

  it("refuses a wrong password, then slows guessing down", async () => {
    const attempts: number[] = [];
    for (let i = 0; i < 6; i++) {
      const response = await post("/api/auth/sign-in/email", {
        email,
        password: "not-the-password",
      });
      attempts.push(response.status);
    }
    expect(attempts.slice(0, 4)).toEqual([401, 401, 401, 401]);
    expect(attempts.at(-1)).toBe(429);
  });
});
