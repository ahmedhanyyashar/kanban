import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { generateText } from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mock, mockDeep } from "vitest-mock-extended";

import type { PrismaService } from "@/lib/database/prisma.service";

import { AiService } from "./ai.service";

const settings = vi.hoisted(
  (): { LLM_API_KEY: string | undefined; LLM_MODEL: string } => ({
    LLM_API_KEY: "test-key",
    LLM_MODEL: "gemini-test",
  }),
);

vi.mock("@/env", () => ({ env: settings }));
vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  generateText: vi.fn(),
}));

type Generated = Awaited<ReturnType<typeof generateText>>;
const generate = vi.mocked(generateText);

const suggestions = [
  { title: "Write the spec", description: "", priority: "high" as const },
];

function service(prisma = mockDeep<PrismaService>()) {
  return { ai: new AiService(prisma), prisma };
}

/** The prompt of the model call that was made. */
function promptSent() {
  const options = generate.mock.calls[0]?.[0];
  return typeof options?.prompt === "string" ? options.prompt : "";
}

beforeEach(() => {
  settings.LLM_API_KEY = "test-key";
  generate.mockReset();
  generate.mockResolvedValue(mock<Generated>({ output: suggestions }));
  vi.spyOn(Logger.prototype, "error").mockReturnValue();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("generating tasks", () => {
  it("asks for the number wanted, treats the goal as data, and gives a time limit", async () => {
    const { ai } = service();

    await expect(
      ai.generateTasksFromGoal("Launch the beta", 3),
    ).resolves.toEqual(suggestions);

    expect(promptSent()).toContain("exactly 3");
    expect(promptSent()).toContain("<goal>\nLaunch the beta\n</goal>");
    expect(generate.mock.calls[0]?.[0].abortSignal).toBeInstanceOf(AbortSignal);
  });

  it("says so when AI is not configured, without calling the provider", async () => {
    settings.LLM_API_KEY = undefined;

    await expect(service().ai.generateTasksFromGoal("x")).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(generate).not.toHaveBeenCalled();
  });
});

describe("when the provider fails", () => {
  const failWith = (error: Error) => generate.mockRejectedValue(error);

  it("tells the person about a quota, and nothing else about the provider", async () => {
    failWith(Object.assign(new Error("billing"), { statusCode: 429 }));

    const error = await service()
      .ai.generateTasksFromGoal("x")
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect(error).toHaveProperty("status", 429);
  });

  it("reports a rejected key as a configuration problem and logs the provider's reason", async () => {
    failWith(
      Object.assign(new Error("API key not valid"), { statusCode: 401 }),
    );
    const log = vi.spyOn(Logger.prototype, "error");

    await expect(service().ai.breakdownTask("x")).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("API key not valid"),
    );
  });

  it("answers a general message for any other failure, and logs why", async () => {
    failWith(new Error("socket hang up"));
    const log = vi.spyOn(Logger.prototype, "error");

    await expect(service().ai.generateTasksFromGoal("x")).rejects.toThrow(
      BadGatewayException,
    );
    expect(log).toHaveBeenCalledWith(expect.stringContaining("socket hang up"));
  });

  it("gives up with a gateway timeout when the model is too slow", async () => {
    failWith(new DOMException("The operation timed out", "TimeoutError"));

    await expect(service().ai.generateTasksFromGoal("x")).rejects.toThrow(
      GatewayTimeoutException,
    );
  });
});

describe("summarizing a board", () => {
  function boardWith(tasks: { title: string; dueDate: Date | null }[]) {
    const prisma = mockDeep<PrismaService>();
    const board = {
      id: "b1",
      title: "Roadmap",
      description: null,
      color: "#000000",
      ownerId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        {
          title: "Todo",
          tasks: tasks.map((task) => ({ ...task, priority: "medium" })),
        },
      ],
    };
    prisma.board.findUnique.mockResolvedValue(board);
    return prisma;
  }

  it("marks overdue tasks in code, so the model does not judge dates", async () => {
    vi.useFakeTimers({
      now: new Date("2026-03-10T12:00:00Z"),
      toFake: ["Date"],
    });
    generate.mockResolvedValue(mock<Generated>({ output: { headline: "h" } }));
    const { ai } = service(
      boardWith([
        { title: "Late", dueDate: new Date("2026-03-09T00:00:00Z") },
        { title: "Today", dueDate: new Date("2026-03-10T00:00:00Z") },
        { title: "Later", dueDate: new Date("2026-03-11T00:00:00Z") },
        { title: "Whenever", dueDate: null },
      ]),
    );

    await ai.summarizeBoard("b1");

    expect(promptSent()).toContain(
      "- Late [medium] (due: 2026-03-09, OVERDUE)",
    );
    expect(promptSent()).toContain("- Today [medium] (due: 2026-03-10)");
    expect(promptSent()).toContain("- Later [medium] (due: 2026-03-11)");
    expect(promptSent()).toContain("- Whenever [medium] (due: No due date)");
  });

  it("answers 404 for a board that is not there", async () => {
    const prisma = mockDeep<PrismaService>();
    prisma.board.findUnique.mockResolvedValue(null);

    await expect(service(prisma).ai.summarizeBoard("b1")).rejects.toThrow(
      NotFoundException,
    );
  });
});
