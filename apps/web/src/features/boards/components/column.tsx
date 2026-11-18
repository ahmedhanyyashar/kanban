import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import { columnAccent } from "@/features/boards/lib/column-accent";

import { ColumnMenu } from "./column-menu";
import { ColumnTitle } from "./column-title";

type ColumnProps = {
  column: { id: string; title: string };
  /** Position in the board; picks the accent. */
  index: number;
  /** Ids of the tasks in `children`, in order, so they can be sorted. */
  taskIds: string[];
  /** The task cards. */
  children: ReactNode;
  onAddTask: (columnId: string) => void;
  onRename: (columnId: string, title: string) => void;
  onDelete: (columnId: string) => void;
  onAiGenerate: (columnId: string) => void;
};

export function Column({
  column,
  index,
  taskIds,
  children,
  onAddTask,
  onRename,
  onDelete,
  onAiGenerate,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const accent = columnAccent(index);
  const [editing, setEditing] = useState(false);

  return (
    <section
      aria-label={column.title}
      className={cn(
        "flex h-full w-[330px] shrink-0 flex-col rounded-2xl p-2.5 transition-colors",
        accent.surface,
        isOver && cn("ring-2 ring-inset", accent.ring),
      )}
    >
      <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
        <span className={cn("size-2.5 rounded-full", accent.dot)} />
        <ColumnTitle
          title={column.title}
          editing={editing}
          onEditingChange={setEditing}
          onRename={(title) => onRename(column.id, title)}
        />
        <Badge variant="secondary" className="tabular-nums">
          {taskIds.length}
        </Badge>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            title={`Add task to ${column.title}`}
            aria-label={`Add task to ${column.title}`}
            onClick={() => onAddTask(column.id)}
          >
            <Plus />
          </Button>
          <ColumnMenu
            title={column.title}
            taskCount={taskIds.length}
            onAiGenerate={() => onAiGenerate(column.id)}
            onRename={() => setEditing(true)}
            onDelete={() => onDelete(column.id)}
          />
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-1"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2.5">{children}</ul>
        </SortableContext>
        <Button variant="ghost" size="sm" onClick={() => onAddTask(column.id)}>
          <Plus /> Add task
        </Button>
      </div>
    </section>
  );
}
