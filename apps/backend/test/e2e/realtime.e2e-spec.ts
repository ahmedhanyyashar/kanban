import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { io, type Socket } from "socket.io-client";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { AppModule } from "@/app.module";

// Real sockets against the real app: who is let into a board's room, and who hears what happens in it.
const ORIGIN = "http://localhost:3100";
const run = Date.now();
const WAIT = 3_000;

let app: INestApplication;
let url = "";
const sockets: Socket[] = [];
const cookies: Record<string, string> = {};
const ids: Record<string, string> = {};
let boardId = "";

const ack = z.object({ ok: z.boolean() });
const taskEvent = z.object({ title: z.string(), position: z.number() });

async function signUp(name: string) {
  const email = `${name}-${run}@example.com`;
  const response = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .set("Origin", ORIGIN)
    .send({ name, email, password: "password1234" });
  expect(response.status).toBe(200);
  cookies[name] = z
    .array(z.string())
    .parse(response.headers["set-cookie"])
    .map((c) => c.split(";")[0])
    .join("; ");
  ids[name] = z
    .object({ user: z.object({ id: z.string() }) })
    .parse(response.body).user.id;
  return email;
}

const api = (
  who: string,
  method: "post" | "delete",
  path: string,
  body?: object,
) =>
  request(app.getHttpServer())
    [method](path)
    .set("Origin", ORIGIN)
    .set("Cookie", cookies[who] ?? "")
    .send(body);

async function connect(who: string) {
  const socket = io(url, {
    transports: ["websocket"],
    extraHeaders: { cookie: cookies[who] ?? "" },
  });
  sockets.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("connect_error", reject);
  });
  return socket;
}

const join = async (socket: Socket) =>
  ack.parse(await socket.emitWithAck("board:join", boardId)).ok;

/** The next time `event` arrives, or a failure when it does not. */
const next = (socket: Socket, event: string) =>
  new Promise<unknown>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`no ${event} within ${WAIT}ms`)),
      WAIT,
    );
    socket.once(event, (payload: unknown) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

/** True when `event` does not arrive in the time given: the room is quiet for this socket. */
const stays = (socket: Socket, event: string, ms = 600) =>
  new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(true), ms);
    socket.once(event, () => {
      clearTimeout(timer);
      resolve(false);
    });
  });

async function newTask(title: string) {
  const detail = await request(app.getHttpServer())
    .get(`/boards/${boardId}`)
    .set("Cookie", cookies["owner"] ?? "");
  const columnId = z
    .object({
      data: z.object({ columns: z.array(z.object({ id: z.string() })) }),
    })
    .parse(detail.body).data.columns[0]?.id;
  const made = await api("owner", "post", `/boards/${boardId}/tasks`, {
    columnId,
    title,
  });
  expect(made.status).toBe(201);
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication({ bodyParser: false });
  await app.listen(0);
  url = await app.getUrl();

  await signUp("owner");
  const memberEmail = await signUp("member");
  await signUp("outsider");

  const created = await api("owner", "post", "/boards", { title: "Live" });
  boardId = z
    .object({ data: z.object({ board: z.object({ id: z.string() }) }) })
    .parse(created.body).data.board.id;
  await api("owner", "post", `/boards/${boardId}/members`, {
    email: memberEmail,
  });
});

afterAll(async () => {
  for (const socket of sockets) socket.disconnect();
  await app.close();
});

describe("a board's live room", () => {
  it("lets in people on the board, and refuses a person who is not", async () => {
    expect(await join(await connect("member"))).toBe(true);
    expect(await join(await connect("outsider"))).toBe(false);
  });

  it("tells people in the room what happens, with positions as numbers", async () => {
    const member = await connect("member");
    await join(member);
    const heard = next(member, "task:created");
    await newTask("Heard live");
    const event = taskEvent.parse(await heard);
    expect(event.title).toBe("Heard live");
  });

  it("stops telling a member who was removed", async () => {
    const member = await connect("member");
    await join(member);
    const removed = await api(
      "owner",
      "delete",
      `/boards/${boardId}/members/${ids["member"]}`,
    );
    expect(removed.status).toBe(200);

    const quiet = stays(member, "task:created");
    await newTask("Said to nobody who left");
    expect(await quiet).toBe(true);
  });
});
