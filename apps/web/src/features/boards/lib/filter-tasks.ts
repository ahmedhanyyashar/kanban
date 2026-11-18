import type { Priority } from "@/features/tasks/lib/priority";

export type TaskFilters = {
  /** Matched against the title and the description, ignoring case. */
  q: string;
  priority: Priority | null;
  assigneeId: string | null;
};

type Filterable = {
  title: string;
  description: string | null;
  priority: Priority;
  assignee: { id: string } | null;
};

export function filterTasks<T extends Filterable>(
  tasks: T[],
  { q, priority, assigneeId }: TaskFilters,
): T[] {
  const needle = q.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      (!priority || task.priority === priority) &&
      (!assigneeId || task.assignee?.id === assigneeId) &&
      (!needle ||
        task.title.toLowerCase().includes(needle) ||
        (task.description ?? "").toLowerCase().includes(needle)),
  );
}
