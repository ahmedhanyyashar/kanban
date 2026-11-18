import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import type { TaskInput, TaskToEdit } from "@/features/tasks/lib/task-form";

import { TaskForm } from "./task-form";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The task being edited, or null to create one. */
  task: TaskToEdit | null;
  /** The column a new task starts in. */
  defaultColumnId: string;
  columns: { id: string; title: string }[];
  members: { id: string; name: string }[];
  /** Create or update, as the caller decides. Rejecting keeps the dialog open. */
  onSubmit: (input: TaskInput) => Promise<void>;
  onDelete: (taskId: string) => void;
};

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultColumnId,
  columns,
  members,
  onSubmit,
  onDelete,
}: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Change the details of this task."
              : "Add a task to this board."}
          </DialogDescription>
        </DialogHeader>
        {/* the form is rebuilt per task, so it always starts from that task's values */}
        <TaskForm
          key={task?.id ?? "new"}
          task={task}
          defaultColumnId={defaultColumnId}
          columns={columns}
          members={members}
          onSubmit={async (input) => {
            await onSubmit(input);
            onOpenChange(false);
          }}
          onDelete={() => {
            if (!task) return;
            onDelete(task.id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
