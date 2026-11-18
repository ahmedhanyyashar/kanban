import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import {
  boardSummarySchema,
  taskSchema,
  taskSuggestionSchema,
} from "@repo/shared/contracts/board";

import { AppModule } from "@/app.module";
import { AiService } from "@/modules/ai/ai.service";

// The routes over real HTTP and a real database, with the model replaced by a stub: what is proven here
// is who may ask, what is saved and what is not, and the shape of every answer. The provider itself is
// tried by hand.
const ORIGIN = "http://localhost:3100";
const run = Date.now();

const asked: { method: string; title?: string; count?: number }[] = [];
const stub = {
  generateTasksFromGoal: (_goal: string, count = 6) => {
    asked.push({ method: "generate", count });
    return Promise.resolve(drafts(count));
  },
  breakdownTask: (title: string, _description = "", count = 5) => {
    asked.push({ method: "breakdown", title, count });
    return Promise.resolve(drafts(count));
  },
  summarizeBoard: () =>
    Promise.resolve({
      headline: "On track",
      completed: [],
      inProgress: ["Draft"],
      risks: [],
      recommendations: [],
    }),
};

function drafts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    title: `Step ${i + 1}`,
    description: "Do it",
    priority: "medium" as const,
  }));
}

let app: INestApplication;
const cookies: Record<string, string> = {};
let boardId = "";
let todo = "";

const body = z.object({ data: z.unknown() });

async function call(
  who: string | null,
  method: "get" | "post",
  path: string,
  payload?: object,
) {
  const req = request(app.getHttpServer())[method](path).set("Origin", ORIGIN);
  if (who) req.set("Cookie", cookies[who] ?? "");
  const response = await (payload ? req.send(payload) : req);
  const parsed = body.safeParse(response.body);
  return {
    status: response.status,
    data: parsed.success ? parsed.data.data : undefined,
  };
}

async function signUp(name: string) {
  const response = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .set("Origin", ORIGIN)
    .send({
      name,
      email: `${name}-${run}@example.com`,
      password: "password1234",
    });
  expect(response.status).toBe(200);
  cookies[name] = z
    .array(z.string())
    .parse(response.headers["set-cookie"])
    .map((c) => c.split(";")[0])
    .join("; ");
}

const detail = z.object({
  board: z.object({ id: z.string() }),
  columns: z.array(z.object({ id: z.string(), title: z.string() })),
  tasks: z.array(z.object({ id: z.string(), title: z.string() })),
});
const generated = z.discriminatedUnion("persisted", [
  z.object({
    persisted: z.literal(false),
    tasks: z.array(taskSuggestionSchema),
  }),
  z.object({ persisted: z.literal(true), tasks: z.array(taskSchema) }),
]);

const taskCount = async () =>
  detail.parse((await call("owner", "get", `/boards/${boardId}`)).data).tasks
    .length;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AiService)
    .useValue(stub)
    .compile();
  app = moduleRef.createNestApplication();
  await app.init();

  await signUp("owner");
  await signUp("outsider");
  const created = await call("owner", "post", "/boards", { title: "AI" });
  boardId = z
    .object({ board: z.object({ id: z.string() }) })
    .parse(created.data).board.id;
  const opened = detail.parse(
    (await call("owner", "get", `/boards/${boardId}`)).data,
  );
  todo = opened.columns.find((c) => c.title === "Todo")?.id ?? "";
});

afterAll(() => app.close());

describe("task generation", () => {
  it("previews drafts without saving anything", async () => {
    const before = await taskCount();
    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/tasks/generate`,
      {
        goal: "Launch the beta",
        count: 3,
      },
    );

    expect(response.status).toBe(200);
    const result = generated.parse(response.data);
    expect(result.persisted).toBe(false);
    expect(result.tasks).toHaveLength(3);
    expect(await taskCount()).toBe(before);
  });

  it("saves exactly the number asked for, in the column given", async () => {
    const before = await taskCount();
    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/tasks/generate`,
      {
        goal: "Launch the beta",
        count: 2,
        columnId: todo,
      },
    );

    const result = generated.parse(response.data);
    expect(result.persisted).toBe(true);
    expect(result.tasks.every((task) => "id" in task)).toBe(true);
    expect(await taskCount()).toBe(before + 2);
  });

  it("will not save into a column of another board", async () => {
    const other = await call("outsider", "post", "/boards", { title: "Other" });
    const otherId = z
      .object({ board: z.object({ id: z.string() }) })
      .parse(other.data).board.id;
    const foreign = detail.parse(
      (await call("outsider", "get", `/boards/${otherId}`)).data,
    );

    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/tasks/generate`,
      {
        goal: "Sneak in",
        columnId: foreign.columns[0]?.id,
      },
    );
    expect(response.status).toBe(400);
  });

  it("refuses bad input before it reaches the model", async () => {
    const calls = asked.length;
    for (const payload of [{}, { goal: "" }, { goal: "x", count: 99 }]) {
      const response = await call(
        "owner",
        "post",
        `/boards/${boardId}/ai/tasks/generate`,
        payload,
      );
      expect(response.status).toBe(422);
    }
    expect(asked.length).toBe(calls);
  });
});

describe("task breakdown and summary", () => {
  it("breaks down a saved task by its id, using its own title", async () => {
    const opened = detail.parse(
      (await call("owner", "get", `/boards/${boardId}`)).data,
    );
    const task = opened.tasks[0];
    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/tasks/breakdown`,
      {
        taskId: task?.id,
        count: 4,
      },
    );

    expect(response.status).toBe(200);
    expect(
      z.object({ subtasks: z.array(taskSuggestionSchema) }).parse(response.data)
        .subtasks,
    ).toHaveLength(4);
    expect(asked.at(-1)).toMatchObject({
      method: "breakdown",
      title: task?.title,
      count: 4,
    });
  });

  it("needs a task id or a title", async () => {
    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/tasks/breakdown`,
      {},
    );
    expect(response.status).toBe(422);
  });

  it("answers a summary in the contract's shape", async () => {
    const response = await call(
      "owner",
      "post",
      `/boards/${boardId}/ai/summary`,
    );
    expect(response.status).toBe(200);
    expect(
      z.object({ summary: boardSummarySchema }).parse(response.data).summary
        .headline,
    ).toBe("On track");
  });
});

describe("who may ask", () => {
  it("turns away the signed-out and people who are not on the board", async () => {
    const path = `/boards/${boardId}/ai/summary`;
    expect((await call(null, "post", path)).status).toBe(401);
    expect((await call("outsider", "post", path)).status).toBe(403);
  });

  it("limits how often a board can be sent to the model", async () => {
    const path = `/boards/${boardId}/ai/summary`;
    const statuses: number[] = [];
    // two summaries were already asked for above
    for (let i = 0; i < 9; i++)
      statuses.push((await call("owner", "post", path)).status);
    expect(statuses.at(-1)).toBe(429);
  });
});
