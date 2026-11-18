import { describe, expect, it } from "vitest";

import { toFormValues, toTaskInput } from "./task-form";

describe("task form values", () => {
  it("sends unset fields as null", () => {
    const input = toTaskInput(toFormValues(null, "c1"));
    expect(input).toEqual({
      title: "",
      description: null,
      priority: "medium",
      dueDate: null,
      assigneeId: null,
      columnId: "c1",
    });
  });

  it("gives an edited task back as it was, whatever the time of day its due date carries", () => {
    const task = {
      id: "t1",
      title: "Write docs",
      description: "Cover the API",
      priority: "high" as const,
      dueDate: "2026-03-04T00:00:00.000Z",
      columnId: "c2",
      assignee: { id: "u1" },
    };
    const values = toFormValues(task, "c1");
    expect(values.dueDate).toBe("2026-03-04");
    expect(toTaskInput(values)).toEqual({
      title: "Write docs",
      description: "Cover the API",
      priority: "high",
      dueDate: "2026-03-04",
      assigneeId: "u1",
      columnId: "c2",
    });
  });
});
