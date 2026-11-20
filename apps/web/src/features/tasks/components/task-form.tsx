import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranch, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@repo/ui/blocks/confirm-delete-dialog";
import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";

import { PRIORITIES, priorityMeta } from "@/features/tasks/lib/priority";
import {
  taskFormSchema,
  toFormValues,
  toTaskInput,
  type TaskFormValues,
  type TaskInput,
  type TaskToEdit,
} from "@/features/tasks/lib/task-form";
import { errorMessage } from "@/lib/error-message";

type Option = { value: string; label: string };

type TaskFormProps = {
  /** The task being edited, or null to create one. */
  task: TaskToEdit | null;
  defaultColumnId: string;
  columns: { id: string; title: string }[];
  members: { id: string; name: string }[];
  /** Rejects with the reason when saving fails; the form reports it. */
  onSubmit: (input: TaskInput) => Promise<void>;
  /** Edit only. */
  onDelete: () => void;
  /** Edit only. */
  onBreakdown: () => void;
  breakingDown: boolean;
};

export function TaskForm({
  task,
  defaultColumnId,
  columns,
  members,
  onSubmit,
  onDelete,
  onBreakdown,
  breakingDown,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: toFormValues(task, defaultColumnId),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  // one thing at a time: saving, deleting and the AI each change the task, so none starts while another runs
  const busy = form.formState.isSubmitting || breakingDown;

  // A failed save is reported in a toast and the form stays as it is, so nothing typed is lost.
  async function submit(values: TaskFormValues) {
    try {
      await onSubmit(toTaskInput(values));
    } catch (error) {
      toast.error(
        errorMessage(error, "The task could not be saved. Try again."),
      );
    }
  }

  const priorities: Option[] = PRIORITIES.map((value) => ({
    value,
    label: priorityMeta[value].label,
  }));
  const assignees: Option[] = [
    { value: "", label: "Unassigned" },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];
  const columnOptions: Option[] = columns.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  return (
    <>
      <form
        onSubmit={(event) => void form.handleSubmit(submit)(event)}
        noValidate
      >
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="What needs to be done?"
                  aria-invalid={fieldState.invalid}
                  aria-required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  rows={4}
                  placeholder="Add more detail…"
                />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <OptionField
              control={form.control}
              name="priority"
              label="Priority"
              options={priorities}
            />
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                  <Input {...field} id={field.name} type="date" />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <OptionField
              control={form.control}
              name="assigneeId"
              label="Assignee"
              options={assignees}
            />
            {!task && (
              <OptionField
                control={form.control}
                name="columnId"
                label="Column"
                options={columnOptions}
              />
            )}
          </div>

          <DialogFooter>
            {task && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  disabled={busy}
                >
                  <Trash2 /> Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBreakdown}
                  disabled={busy}
                >
                  <GitBranch />
                  {breakingDown ? "Breaking down…" : "AI breakdown"}
                </Button>
              </>
            )}
            <Button type="submit" disabled={busy}>
              {task ? "Save" : "Create task"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </form>

      {task && (
        <ConfirmDeleteDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete task?"
          description={`“${task.title}” will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete task"
          onConfirm={onDelete}
        />
      )}
    </>
  );
}

type OptionFieldProps = {
  control: Control<TaskFormValues>;
  name: "priority" | "assigneeId" | "columnId";
  label: string;
  options: Option[];
};

function OptionField({ control, name, label, options }: OptionFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            items={options}
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger
              id={field.name}
              className="w-full"
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
