import { daysUntilDue } from "@/features/tasks/lib/due-date";

import type { WorkspaceTask } from "./workspace";

/**
 * Whether a task is finished. The API has no such flag, so a task counts as done when it sits in a
 * column called "Done"; a board that names its last column otherwise is not counted.
 */
export const isDone = (task: Pick<WorkspaceTask, "status">): boolean =>
  task.status.toLowerCase() === "done";

export const assignedTo = (
  tasks: WorkspaceTask[],
  userId: string | undefined,
) => tasks.filter((task) => userId && task.assignee?.id === userId);

export type TaskStats = {
  total: number;
  overdue: number;
  dueThisWeek: number;
  done: number;
};

/** Counts of the tasks that are still open and late or due within the week, and of those finished. */
export function taskStats(tasks: WorkspaceTask[], now = new Date()): TaskStats {
  let overdue = 0;
  let dueThisWeek = 0;
  for (const task of tasks) {
    const days = daysUntilDue(task.dueDate, now);
    if (isDone(task) || days === null) continue;
    if (days < 0) overdue += 1;
    else if (days <= 7) dueThisWeek += 1;
  }
  return {
    total: tasks.length,
    overdue,
    dueThisWeek,
    done: tasks.filter(isDone).length,
  };
}

export type BoardGroup = {
  id: string;
  title: string;
  color: string;
  items: WorkspaceTask[];
};

/** The tasks grouped by board, in the order the boards first appear. */
export function groupByBoard(tasks: WorkspaceTask[]): BoardGroup[] {
  const groups = new Map<string, BoardGroup>();
  for (const task of tasks) {
    const group = groups.get(task.boardId);
    if (group) group.items.push(task);
    else
      groups.set(task.boardId, {
        id: task.boardId,
        title: task.boardTitle,
        color: task.boardColor,
        items: [task],
      });
  }
  return [...groups.values()];
}
