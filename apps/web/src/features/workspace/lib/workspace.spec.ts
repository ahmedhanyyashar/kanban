import { describe, expect, it } from "vitest";

import type { BoardDetail, BoardListItem } from "@/features/boards/api/boards";

import { aggregateWorkspace } from "./workspace";

const at = "2026-03-04T00:00:00.000Z";

const listed = (id: string, title: string): BoardListItem => ({
  id,
  title,
  description: null,
  color: "#2f8159",
  ownerId: "ada",
  createdAt: at,
  updatedAt: at,
  isOwner: true,
  taskCount: 0,
  memberCount: 0,
});

const person = (id: string) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  image: null,
  role: "member" as const,
});

function detail(
  boardId: string,
  title: string,
  people: string[],
  tasks: string[],
): BoardDetail {
  return {
    board: { ...listed(boardId, title) },
    columns: [
      {
        id: `${boardId}-c`,
        title: "Doing",
        position: 1,
        boardId,
        createdAt: at,
      },
    ],
    tasks: tasks.map((id) => ({
      id,
      title: id,
      description: null,
      position: 1,
      priority: "medium" as const,
      dueDate: null,
      assigneeId: null,
      assignee: null,
      boardId,
      columnId: `${boardId}-c`,
      createdBy: "ada",
      createdAt: at,
      updatedAt: at,
    })),
    members: people.map(person),
    role: "owner",
  };
}

describe("aggregateWorkspace", () => {
  const boards = [listed("b1", "Roadmap"), listed("b2", "Marketing")];

  it("tags every task with its board and the title of its column", () => {
    const { tasks } = aggregateWorkspace(boards, [
      detail("b1", "Roadmap", ["ada"], ["t1"]),
      detail("b2", "Marketing", ["ada"], ["t2"]),
    ]);
    expect(tasks.map((t) => [t.id, t.boardTitle, t.status])).toEqual([
      ["t1", "Roadmap", "Doing"],
      ["t2", "Marketing", "Doing"],
    ]);
  });

  it("lists each person once, with every board they share", () => {
    const { members } = aggregateWorkspace(boards, [
      detail("b1", "Roadmap", ["ada", "grace"], []),
      detail("b2", "Marketing", ["ada"], []),
    ]);
    expect(members.map((m) => [m.id, m.boards])).toEqual([
      ["ada", ["Roadmap", "Marketing"]],
      ["grace", ["Roadmap"]],
    ]);
  });

  it("leaves out a board whose detail has not loaded", () => {
    const { tasks } = aggregateWorkspace(boards, [
      undefined,
      detail("b2", "Marketing", [], ["t2"]),
    ]);
    expect(tasks.map((t) => t.id)).toEqual(["t2"]);
  });
});
