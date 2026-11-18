import { describe, expect, it } from "vitest";

import type { BoardListItem } from "@/features/boards/api/boards";

import { busiestBoards, overview, recentBoards } from "./overview";

const board = (
  id: string,
  taskCount: number,
  isOwner: boolean,
  updatedAt: string,
): BoardListItem => ({
  id,
  title: id,
  description: null,
  color: "#2f8159",
  ownerId: "ada",
  createdAt: updatedAt,
  updatedAt,
  isOwner,
  taskCount,
  memberCount: 1,
});

const boards = [
  board("a", 4, true, "2026-03-01T00:00:00.000Z"),
  board("b", 10, false, "2026-03-03T00:00:00.000Z"),
  board("c", 1, true, "2026-03-02T00:00:00.000Z"),
];

describe("overview", () => {
  it("totals the boards and splits them by ownership", () => {
    expect(overview(boards)).toEqual({
      total: 3,
      totalTasks: 15,
      owned: 2,
      shared: 1,
      averageTasks: 5,
      ownedPercent: 67,
    });
  });

  it("is all zeros with no boards, not a division by zero", () => {
    expect(overview([])).toEqual({
      total: 0,
      totalTasks: 0,
      owned: 0,
      shared: 0,
      averageTasks: 0,
      ownedPercent: 0,
    });
  });
});

describe("ranking boards", () => {
  it("lists the busiest first and the most recently changed first, without reordering the input", () => {
    expect(busiestBoards(boards, 2).map((b) => b.id)).toEqual(["b", "a"]);
    expect(recentBoards(boards, 2).map((b) => b.id)).toEqual(["b", "c"]);
    expect(boards.map((b) => b.id)).toEqual(["a", "b", "c"]);
  });
});
