import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { boardSchema, taskSchema } from "@repo/shared/contracts/board";

import { AppModule } from "@/app.module";

// Real HTTP against the real app and a real (throwaway) database: what the unit specs cannot prove
// is that the guard, the services and the schema agree about who may do what.

const ORIGIN = "http://localhost:3100";
const PASSWORD = "password1234";
const run = Date.now();

let app: INestApplication;
const cookies: Record<string, string> = {};
const ids: Record<string, string> = {};

const data = z.object({ success: z.literal(true), data: z.unknown() });
const idOf = z.object({ id: z.string() });
// the shared contract is what the web app trusts, so the answers are parsed with it
const boardResponse = z.object({ board: boardSchema });
const taskResponse = z.object({ task: taskSchema });

/** Sends a request as one of the signed-in people and returns status and the unwrapped data. */
async function call(
  who: string | null,
  method: "get" | "post" | "patch" | "delete",
  path: string,
  body?: object,
) {
  const req = request(app.getHttpServer())[method](path).set("Origin", ORIGIN);
  if (who) req.set("Cookie", cookies[who] ?? "");
  const response = await (body ? req.send(body) : req);
  const parsed = data.safeParse(response.body);
  return {
    status: response.status,
    data: parsed.success ? parsed.data.data : undefined,
  };
}

async function signUp(name: string) {
  const response = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .set("Origin", ORIGIN)
    .send({ name, email: `${name}-${run}@example.com`, password: PASSWORD });
  expect(response.status).toBe(200);
  cookies[name] = z
    .array(z.string())
    .parse(response.headers["set-cookie"])
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
  ids[name] = z.object({ user: idOf }).parse(response.body).user.id;
}

const boardPath = () => `/boards/${ids["board"]}`;
const emailOf = (name: string) => `${name}-${run}@example.com`;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();

  for (const name of ["owner", "admin", "member", "outsider"])
    await signUp(name);

  const created = await call("owner", "post", "/boards", { title: "Roadmap" });
  expect(created.status).toBe(201);
  ids["board"] = boardResponse.parse(created.data).board.id;

  await call("owner", "post", `${boardPath()}/members`, {
    email: emailOf("admin"),
    role: "admin",
  });
  await call("owner", "post", `${boardPath()}/members`, {
    email: emailOf("member"),
  });
});

afterAll(() => app.close());

const boardDetail = z.object({
  board: z.object({
    columns: z.array(z.object({ id: z.string(), title: z.string() })),
  }),
});

async function columnId(title: string) {
  const detail = await call("owner", "get", boardPath());
  const column = boardDetail
    .parse(detail.data)
    .board.columns.find((c) => c.title === title);
  if (!column) throw new Error(`no column ${title}`);
  return column.id;
}

describe("who may open a board", () => {
  it("turns away anyone who is signed out", async () => {
    expect((await call(null, "get", boardPath())).status).toBe(401);
  });

  it("turns away a signed-in person who is not on the board", async () => {
    expect((await call("outsider", "get", boardPath())).status).toBe(403);
  });

  it("does not list another person's board", async () => {
    const list = await call("outsider", "get", "/boards");
    expect(
      z.object({ boards: z.array(z.unknown()) }).parse(list.data).boards,
    ).toHaveLength(0);
  });

  it("answers 404 for a board that does not exist and 400 for a malformed id", async () => {
    const missing = "/boards/00000000-0000-4000-8000-000000000000";
    expect((await call("owner", "get", missing)).status).toBe(404);
    expect((await call("owner", "get", "/boards/not-an-id")).status).toBe(400);
  });

  it("opens for the owner and for people who were added", async () => {
    for (const who of ["owner", "admin", "member"])
      expect((await call(who, "get", boardPath())).status).toBe(200);
  });

  it("starts a new board with four columns", async () => {
    const detail = await call("owner", "get", boardPath());
    expect(
      boardDetail.parse(detail.data).board.columns.map((c) => c.title),
    ).toEqual(["Todo", "In Progress", "Review", "Done"]);
  });
});

describe("who may manage the board", () => {
  it("lets an admin invite and a plain member not", async () => {
    const invite = { email: emailOf("outsider") };
    expect(
      (await call("member", "post", `${boardPath()}/members`, invite)).status,
    ).toBe(403);
    expect(
      (await call("admin", "post", `${boardPath()}/members`, invite)).status,
    ).toBe(201);
    // so the later specs can rely on outsider staying outside
    expect(
      (
        await call(
          "owner",
          "delete",
          `${boardPath()}/members/${ids["outsider"]}`,
        )
      ).status,
    ).toBe(200);
  });

  it("never removes the owner", async () => {
    const removed = await call(
      "admin",
      "delete",
      `${boardPath()}/members/${ids["owner"]}`,
    );
    expect(removed.status).toBe(400);
  });

  it("lets only the owner delete the board", async () => {
    expect((await call("admin", "delete", boardPath())).status).toBe(403);
    expect((await call("member", "delete", boardPath())).status).toBe(403);
  });
});

describe("tasks and columns", () => {
  const created = (value: unknown) => taskResponse.parse(value).task;

  it("moves a task to another column and keeps it there", async () => {
    const todo = await columnId("Todo");
    const review = await columnId("Review");
    const made = await call("member", "post", `${boardPath()}/tasks`, {
      columnId: todo,
      title: "Write the spec",
    });
    expect(made.status).toBe(201);
    const { id } = created(made.data);

    const moved = await call(
      "member",
      "patch",
      `${boardPath()}/tasks/${id}/move`,
      { columnId: review, position: 0 },
    );
    expect(moved.status).toBe(200);

    const detail = await call("owner", "get", boardPath());
    const tasks = z
      .object({
        board: z.object({
          tasks: z.array(z.object({ id: z.string(), columnId: z.string() })),
        }),
      })
      .parse(detail.data).board.tasks;
    expect(tasks.find((t) => t.id === id)?.columnId).toBe(review);
  });

  it("refuses to move a task into a column of another board", async () => {
    const other = await call("outsider", "post", "/boards", { title: "Other" });
    const otherId = boardResponse.parse(other.data).board.id;
    const foreign = await call("outsider", "get", `/boards/${otherId}`);
    const foreignColumn = boardDetail.parse(foreign.data).board.columns[0]?.id;

    const made = await call("owner", "post", `${boardPath()}/tasks`, {
      columnId: await columnId("Todo"),
      title: "Stays here",
    });
    const { id } = created(made.data);
    const moved = await call(
      "owner",
      "patch",
      `${boardPath()}/tasks/${id}/move`,
      { columnId: foreignColumn, position: 0 },
    );
    expect(moved.status).toBe(400);
  });

  it("will not delete a column that still holds tasks", async () => {
    const review = await columnId("Review");
    const refused = await call(
      "owner",
      "delete",
      `${boardPath()}/columns/${review}`,
    );
    expect(refused.status).toBe(400);
  });

  it("deletes an empty column", async () => {
    const added = await call("owner", "post", `${boardPath()}/columns`, {
      title: "Scratch",
    });
    expect(added.status).toBe(201);
    const scratch = await columnId("Scratch");
    expect(
      (await call("owner", "delete", `${boardPath()}/columns/${scratch}`))
        .status,
    ).toBe(200);
  });

  it("assigns a task only to someone who is on the board", async () => {
    const todo = await columnId("Todo");
    const stranger = await call("owner", "post", `${boardPath()}/tasks`, {
      columnId: todo,
      title: "For a stranger",
      assigneeId: ids["outsider"],
    });
    expect(stranger.status).toBe(400);

    const colleague = await call("owner", "post", `${boardPath()}/tasks`, {
      columnId: todo,
      title: "For a colleague",
      assigneeId: ids["member"],
    });
    expect(colleague.status).toBe(201);
    const { id, assignee } = created(colleague.data);
    expect(assignee?.id).toBe(ids["member"]);

    const reassigned = await call(
      "owner",
      "patch",
      `${boardPath()}/tasks/${id}`,
      { assigneeId: ids["outsider"] },
    );
    expect(reassigned.status).toBe(400);
  });

  it("answers 400, not a server error, for a malformed task or column id", async () => {
    expect(
      (
        await call("owner", "patch", `${boardPath()}/tasks/not-an-id`, {
          title: "x",
        })
      ).status,
    ).toBe(400);
    expect(
      (await call("owner", "delete", `${boardPath()}/columns/not-an-id`))
        .status,
    ).toBe(400);
  });

  it("records what happened in the activity feed", async () => {
    const feed = await call("owner", "get", `${boardPath()}/activities`);
    expect(feed.status).toBe(200);
    const { activities } = z
      .object({ activities: z.array(z.object({ message: z.string() })) })
      .parse(feed.data);
    expect(activities.length).toBeGreaterThan(0);
    // a removed member is on the record as well as an added one
    expect(activities.some((a) => a.message.includes("removed"))).toBe(true);
  });
});
