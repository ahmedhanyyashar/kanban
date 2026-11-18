import { describe, expect, it } from "vitest";

import {
  countDueIn,
  monthGrid,
  shiftMonth,
  tasksByDay,
  todayKey,
} from "./calendar";

describe("monthGrid", () => {
  it("fills whole Sunday-first weeks around the month", () => {
    // January 2026 starts on a Thursday and ends on a Saturday
    const grid = monthGrid({ year: 2026, month: 0 });
    expect(grid).toHaveLength(35);
    expect(grid[0]).toEqual({ key: "2025-12-28", day: 28, inMonth: false });
    expect(grid[4]).toEqual({ key: "2026-01-01", day: 1, inMonth: true });
    expect(grid.at(-1)).toEqual({ key: "2026-01-31", day: 31, inMonth: true });
  });

  it("needs only four weeks when February starts on a Sunday", () => {
    expect(monthGrid({ year: 2026, month: 1 })).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("moves across the year in both directions", () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({
      year: 2025,
      month: 11,
    });
    expect(shiftMonth({ year: 2025, month: 11 }, 1)).toEqual({
      year: 2026,
      month: 0,
    });
  });
});

describe("due dates on the calendar", () => {
  const tasks = [
    { id: "a", dueDate: "2026-03-04T00:00:00.000Z" },
    { id: "b", dueDate: "2026-03-04T00:00:00.000Z" },
    { id: "c", dueDate: "2026-04-01T00:00:00.000Z" },
    { id: "d", dueDate: null },
  ];

  it("groups tasks by the day they are due and skips the undated", () => {
    const days = tasksByDay(tasks);
    expect(days.get("2026-03-04")?.map((t) => t.id)).toEqual(["a", "b"]);
    expect(days.size).toBe(2);
  });

  it("counts what is due in a month", () => {
    expect(countDueIn(tasks, { year: 2026, month: 2 })).toBe(2);
    expect(countDueIn(tasks, { year: 2026, month: 3 })).toBe(1);
  });

  it("names today by the viewer's own date", () => {
    expect(todayKey(new Date(2026, 2, 4, 23, 30))).toBe("2026-03-04");
  });
});
