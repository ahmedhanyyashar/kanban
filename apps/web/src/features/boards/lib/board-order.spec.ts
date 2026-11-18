import { describe, expect, it } from "vitest";

import {
  groupByColumn,
  positionAt,
  resolveMove,
  type PositionedTask,
} from "./board-order";

const t = (id: string, columnId: string, position: number): PositionedTask => ({
  id,
  columnId,
  position,
});

const a = t("a", "todo", 1000);
const b = t("b", "todo", 2000);
const c = t("c", "todo", 3000);
const x = t("x", "done", 1000);
const tasks = [c, a, x, b];
const groups = groupByColumn(["todo", "done", "empty"], tasks);

/** The board after dropping `task` on `overId`, as ids per column, in order. */
function dropOn(task: PositionedTask, overId: string) {
  const move = resolveMove(groups, task, overId);
  if (!move) return null;
  const moved = tasks.map((u) => (u.id === task.id ? { ...u, ...move } : u));
  const after = groupByColumn(["todo", "done", "empty"], moved);
  return Object.fromEntries(
    [...after].map(([column, list]) => [column, list.map((u) => u.id)]),
  );
}

describe("groupByColumn", () => {
  it("orders each column by position and keeps empty ones", () => {
    expect(groups.get("todo")).toEqual([a, b, c]);
    expect(groups.get("empty")).toEqual([]);
  });
});

describe("positionAt", () => {
  it("sorts between its neighbours, before the first and after the last", () => {
    const between = positionAt([a, b], 1);
    expect(between).toBeGreaterThan(a.position);
    expect(between).toBeLessThan(b.position);
    expect(positionAt([a, b], 0)).toBeLessThan(a.position);
    expect(positionAt([a, b], 2)).toBeGreaterThan(b.position);
  });

  it("gives an empty list a usable position", () => {
    expect(positionAt([], 0)).toBeGreaterThan(0);
  });
});

describe("dropping a task", () => {
  it("on an empty column puts it there", () => {
    expect(dropOn(a, "empty")).toMatchObject({
      todo: ["b", "c"],
      empty: ["a"],
    });
  });

  it("on a column puts it at the end", () => {
    expect(dropOn(a, "done")).toMatchObject({ done: ["x", "a"] });
  });

  it("on a task in another column puts it before that task", () => {
    expect(dropOn(a, "x")).toMatchObject({ done: ["a", "x"] });
  });

  it("on the next task down in its own column puts it after that task", () => {
    expect(dropOn(a, "b")).toMatchObject({ todo: ["b", "a", "c"] });
  });

  it("on the task above it puts it before that task", () => {
    expect(dropOn(c, "b")).toMatchObject({ todo: ["a", "c", "b"] });
  });

  it("on itself or on an unknown target changes nothing", () => {
    expect(dropOn(a, "a")).toBeNull();
    expect(dropOn(a, "nope")).toBeNull();
  });
});
