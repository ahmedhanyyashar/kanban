import { ArrowUpRight, Calendar } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

import { PriorityTag } from "@/features/tasks/components/priority-tag";
import { formatDueDate } from "@/features/tasks/lib/due-date";
import { isDone } from "@/features/workspace/lib/my-tasks";
import type { WorkspaceTask } from "@/features/workspace/lib/workspace";

/** One of the person's tasks, linking to the board it is on. */
export function MyTaskRow({ task }: { task: WorkspaceTask }) {
  const due = formatDueDate(task.dueDate);
  const done = isDone(task);

  return (
    <Link
      to={`/board/${task.boardId}`}
      className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card transition-shadow outline-none hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PriorityTag priority={task.priority} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold tracking-tight",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.status && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {done ? "Done" : task.status}
          </p>
        )}
      </div>
      {due && (
        <Badge
          variant={due.overdue && !done ? "destructive" : "secondary"}
          className="hidden tabular-nums sm:flex"
        >
          <Calendar />
          <span className="sr-only">
            {due.overdue && !done ? "Overdue, due" : "Due"}
          </span>
          {due.label}
        </Badge>
      )}
      <ArrowUpRight
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </Link>
  );
}
