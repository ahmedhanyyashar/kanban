import { describe, expect, it } from "vitest";

import { assignedTo, groupByBoard, taskStats } from "./my-tasks";
import type { WorkspaceTask } from "./workspace";

const at = "2026-03-10T00:00:00.000Z";
const now = new Date(2026, 2, 10, 15, 0);

function task(
  id: string,
  over: Partial<WorkspaceTask> & { due?: string | null } = {},
): WorkspaceTask {
  const { due = null, ...rest } = over;
  return {
    id,
    title: id,
    description: null,
    position: 1,
    priority: "medium",
    dueDate: due ? `${due}T00:00:00.000Z` : null,
    assigneeId: "ada",
    assignee: { id: "ada", name: "Ada", email: "a@example.com", image: null },
    boardId: "b1",
    columnId: "c1",
    createdBy: "ada",
    createdAt: at,
    updatedAt: at,
    boardTitle: "Roadmap",
    boardColor: "#2f8159",
    status: "Doing",
    ...rest,
  };
}

describe("assignedTo", () => {
  it("keeps only the person's tasks, and nothing when nobody is signed in", () => {
    const tasks = [task("a"), task("b", { assignee: null })];
    expect(assignedTo(tasks, "ada").map((t) => t.id)).toEqual(["a"]);
    expect(assignedTo(tasks, undefined)).toEqual([]);
  });
});

describe("taskStats", () => {
  it("counts late and soon-due tasks that are still open, and the finished ones", () => {
    const stats = taskStats(
      [
        task("late", { due: "2026-03-05" }),
        task("today", { due: "2026-03-10" }),
        task("in a week", { due: "2026-03-17" }),
        task("later", { due: "2026-03-18" }),
        task("undated"),
        task("finished late", { due: "2026-03-01", status: "Done" }),
      ],
      now,
    );
    expect(stats).toEqual({ total: 6, overdue: 1, dueThisWeek: 2, done: 1 });
  });
});

describe("groupByBoard", () => {
  it("groups by board in order of first appearance", () => {
    const groups = groupByBoard([
      task("a"),
      task("b", { boardId: "b2", boardTitle: "Marketing" }),
      task("c"),
    ]);
    expect(groups.map((g) => [g.title, g.items.map((t) => t.id)])).toEqual([
      ["Roadmap", ["a", "c"]],
      ["Marketing", ["b"]],
    ]);
  });
});
