import { describe, expect, it } from "vitest";

import type { BoardDetail } from "@/features/boards/api/boards";

import { applyBoardEvent } from "./board-events";

const at = "2026-03-04T00:00:00.000Z";
const task = {
  id: "t1",
  title: "Write docs",
  description: null,
  position: 1000,
  priority: "medium",
  dueDate: null,
  assigneeId: null,
  assignee: null,
  boardId: "b1",
  columnId: "todo",
  createdBy: "u1",
  createdAt: at,
  updatedAt: at,
};
const detail: BoardDetail = {
  board: {
    id: "b1",
    title: "Roadmap",
    description: null,
    color: "#2f8159",
    ownerId: "u1",
    createdAt: at,
    updatedAt: at,
  },
  columns: [],
  tasks: [],
  members: [],
  role: "owner",
};

describe("applyBoardEvent", () => {
  it("adds, updates and removes a task as the server announces it", () => {
    const created = applyBoardEvent(detail, "task:created", task);
    expect(created.tasks.map((t) => t.id)).toEqual(["t1"]);

    const moved = applyBoardEvent(created, "task:moved", {
      ...task,
      columnId: "done",
      position: 500,
    });
    expect(moved.tasks[0]).toMatchObject({ columnId: "done", position: 500 });

    const deleted = applyBoardEvent(moved, "task:deleted", { id: "t1" });
    expect(deleted.tasks).toEqual([]);
  });

  it("ignores a payload that is not what the contract says, and events it does not know", () => {
    // a position that arrived as text is not a task
    expect(
      applyBoardEvent(detail, "task:created", { ...task, position: "1000" }),
    ).toBe(detail);
    expect(applyBoardEvent(detail, "task:deleted", { nope: true })).toBe(
      detail,
    );
    expect(applyBoardEvent(detail, "presence:join", { user: {} })).toBe(detail);
  });

  it("applies a renamed board", () => {
    const next = applyBoardEvent(detail, "board:updated", {
      ...detail.board,
      title: "Plan",
    });
    expect(next.board.title).toBe("Plan");
  });
});
