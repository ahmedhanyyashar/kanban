import type { BoardDetail, BoardListItem } from "@/features/boards/api/boards";

type Task = BoardDetail["tasks"][number];
type Member = BoardDetail["members"][number];

export type WorkspaceTask = Task & {
  boardTitle: string;
  boardColor: string;
  /** The title of the column the task is in. */
  status: string;
};

export type WorkspaceMember = Member & {
  /** The titles of the boards this person is on, here. */
  boards: string[];
};

/**
 * Every board a person can see, flattened: each task tagged with its board and status, and each
 * person once, with the boards they share. A board whose detail has not loaded is left out.
 */
export function aggregateWorkspace(
  boards: BoardListItem[],
  details: (BoardDetail | undefined)[],
): { tasks: WorkspaceTask[]; members: WorkspaceMember[] } {
  const tasks: WorkspaceTask[] = [];
  const people = new Map<string, WorkspaceMember>();

  boards.forEach((listed, index) => {
    const detail = details[index];
    if (!detail) return;
    const { board } = detail;
    const status = new Map(detail.columns.map((c) => [c.id, c.title]));

    for (const task of detail.tasks)
      tasks.push({
        ...task,
        boardTitle: board.title,
        boardColor: listed.color,
        status: status.get(task.columnId) ?? "",
      });

    for (const member of detail.members) {
      const known = people.get(member.id);
      if (!known) people.set(member.id, { ...member, boards: [board.title] });
      else if (!known.boards.includes(board.title))
        known.boards.push(board.title);
    }
  });

  return { tasks, members: [...people.values()] };
}
