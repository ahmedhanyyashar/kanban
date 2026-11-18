import { describe, expect, it } from "vitest";

import type { BoardDetail } from "@/features/boards/api/boards";

import {
  patchTask,
  removeColumn,
  removeTask,
  upsertColumn,
  upsertTask,
} from "./board-cache";

type Task = BoardDetail["tasks"][number];
type Column = BoardDetail["columns"][number];

const at = "2026-03-04T00:00:00.000Z";
const task = (id: string, columnId: string, position = 1000): Task => ({
  id,
  title: id,
  description: null,
  position,
  priority: "medium",
  dueDate: null,
  assigneeId: null,
  assignee: null,
  boardId: "b1",
  columnId,
  createdBy: "u1",
  createdAt: at,
  updatedAt: at,
});
const column = (id: string, position: number): Column => ({
  id,
  title: id,
  position,
  boardId: "b1",
  createdAt: at,
});

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
  columns: [column("todo", 1000), column("done", 2000)],
  tasks: [task("a", "todo"), task("b", "done")],
  members: [],
  role: "owner",
};

describe("board cache edits", () => {
  it("adds a task it has not seen and replaces one it has, without changing the original", () => {
    const added = upsertTask(detail, task("c", "todo"));
    expect(added.tasks.map((t) => t.id)).toEqual(["a", "b", "c"]);

    const renamed = upsertTask(detail, { ...task("a", "todo"), title: "New" });
    expect(renamed.tasks.map((t) => t.title)).toEqual(["New", "b"]);
    expect(detail.tasks.map((t) => t.title)).toEqual(["a", "b"]);
  });

  it("moves a task by patching its column and position", () => {
    const moved = patchTask(detail, "a", { columnId: "done", position: 500 });
    expect(moved.tasks.find((t) => t.id === "a")).toMatchObject({
      columnId: "done",
      position: 500,
    });
  });

  it("removes a task, and a column together with its tasks", () => {
    expect(removeTask(detail, "a").tasks.map((t) => t.id)).toEqual(["b"]);
    const without = removeColumn(detail, "done");
    expect(without.columns.map((c) => c.id)).toEqual(["todo"]);
    expect(without.tasks.map((t) => t.id)).toEqual(["a"]);
  });

  it("keeps columns in position order when one is added or moved", () => {
    const first = upsertColumn(detail, column("review", 1500));
    expect(first.columns.map((c) => c.id)).toEqual(["todo", "review", "done"]);
    const moved = upsertColumn(first, column("done", 100));
    expect(moved.columns.map((c) => c.id)).toEqual(["done", "todo", "review"]);
  });
});
