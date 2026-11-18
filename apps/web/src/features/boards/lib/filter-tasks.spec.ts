import { describe, expect, it } from "vitest";

import { filterTasks } from "./filter-tasks";

const tasks = [
  {
    title: "Write docs",
    description: "Cover the API",
    priority: "high" as const,
    assignee: { id: "ada" },
  },
  {
    title: "Ship it",
    description: null,
    priority: "low" as const,
    assignee: null,
  },
];
const none = { q: "", priority: null, assigneeId: null };

describe("filterTasks", () => {
  it("keeps everything when nothing is asked for", () => {
    expect(filterTasks(tasks, none)).toHaveLength(2);
  });

  it("matches the text in the title or the description, ignoring case and padding", () => {
    expect(filterTasks(tasks, { ...none, q: " SHIP " })).toEqual([tasks[1]]);
    expect(filterTasks(tasks, { ...none, q: "api" })).toEqual([tasks[0]]);
  });

  it("combines the priority and the assignee with the text", () => {
    expect(filterTasks(tasks, { ...none, priority: "low" })).toEqual([
      tasks[1],
    ]);
    expect(filterTasks(tasks, { ...none, assigneeId: "ada" })).toEqual([
      tasks[0],
    ]);
    expect(
      filterTasks(tasks, { q: "ship", priority: "high", assigneeId: null }),
    ).toEqual([]);
  });
});
