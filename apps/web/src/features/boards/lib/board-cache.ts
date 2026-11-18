import type { BoardDetail } from "@/features/boards/api/boards";

type Task = BoardDetail["tasks"][number];
type Column = BoardDetail["columns"][number];
type Member = BoardDetail["members"][number];

// Pure edits of a board's cached detail. Optimistic updates and live events both go through them,
// so the cache changes in one way however the news arrives.

const byPosition = (a: { position: number }, b: { position: number }) =>
  a.position - b.position;

export function upsertTask(detail: BoardDetail, task: Task): BoardDetail {
  const known = detail.tasks.some((t) => t.id === task.id);
  return {
    ...detail,
    tasks: known
      ? detail.tasks.map((t) => (t.id === task.id ? task : t))
      : [...detail.tasks, task],
  };
}

/** Changes some fields of a task now (a drag, before the server has answered). */
export function patchTask(
  detail: BoardDetail,
  taskId: string,
  changes: Partial<Task>,
): BoardDetail {
  return {
    ...detail,
    tasks: detail.tasks.map((t) =>
      t.id === taskId ? { ...t, ...changes } : t,
    ),
  };
}

export function removeTask(detail: BoardDetail, taskId: string): BoardDetail {
  return { ...detail, tasks: detail.tasks.filter((t) => t.id !== taskId) };
}

/** Changes some fields of a column now (a rename, before the server has answered). */
export function patchColumn(
  detail: BoardDetail,
  columnId: string,
  changes: Partial<Column>,
): BoardDetail {
  return {
    ...detail,
    columns: detail.columns.map((c) =>
      c.id === columnId ? { ...c, ...changes } : c,
    ),
  };
}

export function upsertColumn(detail: BoardDetail, column: Column): BoardDetail {
  const known = detail.columns.some((c) => c.id === column.id);
  const columns = known
    ? detail.columns.map((c) => (c.id === column.id ? column : c))
    : [...detail.columns, column];
  return { ...detail, columns: columns.sort(byPosition) };
}

/** A column goes with the tasks still in it (the server only deletes empty ones, but others may have). */
export function removeColumn(
  detail: BoardDetail,
  columnId: string,
): BoardDetail {
  return {
    ...detail,
    columns: detail.columns.filter((c) => c.id !== columnId),
    tasks: detail.tasks.filter((t) => t.columnId !== columnId),
  };
}

export function upsertMember(detail: BoardDetail, member: Member): BoardDetail {
  const known = detail.members.some((m) => m.id === member.id);
  return {
    ...detail,
    members: known
      ? detail.members.map((m) => (m.id === member.id ? member : m))
      : [...detail.members, member],
  };
}

export function removeMember(detail: BoardDetail, userId: string): BoardDetail {
  return {
    ...detail,
    members: detail.members.filter((m) => m.id !== userId),
  };
}

export function setBoard(
  detail: BoardDetail,
  board: BoardDetail["board"],
): BoardDetail {
  return { ...detail, board };
}
