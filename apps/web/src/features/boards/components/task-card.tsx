import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

import { PriorityTag } from "@/features/tasks/components/priority-tag";
import { formatDueDate } from "@/features/tasks/lib/due-date";
import type { Priority } from "@/features/tasks/lib/priority";
import { UserAvatar } from "@/features/users/components/user-avatar";

export type TaskCardData = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  assignee: { id: string; name: string; image: string | null } | null;
};

type TaskCardProps = Omit<ComponentProps<typeof Card>, "children"> & {
  task: TaskCardData;
  /** The card is being dragged: its slot in the list fades. */
  dragging?: boolean;
  /** The floating copy that follows the pointer. */
  overlay?: boolean;
};

/** The card itself, with no drag behaviour, so the drag overlay can reuse it. */
export function TaskCard({
  task,
  dragging,
  overlay,
  className,
  ...props
}: TaskCardProps) {
  const due = formatDueDate(task.dueDate);

  return (
    <Card
      className={cn(
        "cursor-grab shadow-card outline-none transition-shadow hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        dragging && "opacity-40",
        overlay && "rotate-2 cursor-grabbing shadow-lift",
        className,
      )}
      {...props}
    >
      <CardContent className="flex flex-col gap-2.5">
        <PriorityTag priority={task.priority} />
        <p className="text-[15px] leading-snug font-semibold tracking-tight">
          {task.title}
        </p>
        {task.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between border-t pt-3">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <UserAvatar
                name={task.assignee.name}
                src={task.assignee.image}
                size="sm"
              />
              <span className="max-w-28 truncate text-[11px] text-muted-foreground">
                {task.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Unassigned
            </span>
          )}

          {due && (
            <Badge
              variant={due.overdue ? "destructive" : "secondary"}
              className="tabular-nums"
            >
              <Calendar />
              <span className="sr-only">
                {due.overdue ? "Overdue, due" : "Due"}
              </span>
              {due.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type SortableTaskCardProps<T extends TaskCardData> = {
  task: T;
  onOpen: (task: T) => void;
};

/**
 * A card that can be dragged and dropped within and between columns. A list item, so a column
 * reads as a list of tasks. Space picks it up (see the board's sensors); Enter or a click opens it.
 */
export function SortableTaskCard<T extends TaskCardData>({
  task,
  onOpen,
}: SortableTaskCardProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <TaskCard
        task={task}
        dragging={isDragging}
        onClick={() => {
          if (!isDragging) onOpen(task);
        }}
        // capture, so it does not replace the drag library's own key handler
        onKeyDownCapture={(e) => {
          if (e.key === "Enter" && e.target === e.currentTarget) onOpen(task);
        }}
        {...attributes}
        {...listeners}
      />
    </li>
  );
}
