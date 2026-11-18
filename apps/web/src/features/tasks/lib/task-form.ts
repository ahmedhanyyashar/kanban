import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";

import { PRIORITIES, type Priority } from "@/features/tasks/lib/priority";

/** What the form holds: every field is text, as the inputs are. Empty means "not set". */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(LIMITS.taskTitle, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(LIMITS.taskDescription, "Description is too long"),
  priority: z.enum(PRIORITIES),
  /** A calendar day, `YYYY-MM-DD`, or empty. */
  dueDate: z.string(),
  assigneeId: z.string(),
  columnId: z.string().min(1, "Choose a column"),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** What the form hands to the caller: unset fields are `null`. */
export type TaskInput = {
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  assigneeId: string | null;
  columnId: string;
};

/** The parts of a task the form edits. */
export type TaskToEdit = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  columnId: string;
  assignee: { id: string } | null;
};

export function toFormValues(
  task: TaskToEdit | null,
  defaultColumnId: string,
): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    // due dates are calendar days kept at UTC midnight: the first ten characters are the day
    dueDate: task?.dueDate?.slice(0, 10) ?? "",
    assigneeId: task?.assignee?.id ?? "",
    columnId: task?.columnId ?? defaultColumnId,
  };
}

export function toTaskInput(values: TaskFormValues): TaskInput {
  return {
    title: values.title,
    description: values.description || null,
    priority: values.priority,
    dueDate: values.dueDate || null,
    assigneeId: values.assigneeId || null,
    columnId: values.columnId,
  };
}
