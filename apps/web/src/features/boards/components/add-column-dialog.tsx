import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

import { errorMessage } from "@/lib/error-message";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Column name is required")
    .max(LIMITS.columnTitle, "Column name is too long"),
});
type Values = z.infer<typeof schema>;

type AddColumnDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rejects with the reason when the column could not be added. */
  onCreate: (title: string) => Promise<void>;
};

export function AddColumnDialog({
  open,
  onOpenChange,
  onCreate,
}: AddColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a column</DialogTitle>
          <DialogDescription>
            Columns are the stages a task moves through.
          </DialogDescription>
        </DialogHeader>
        {/* rebuilt each time the dialog opens, so the field starts empty */}
        <AddColumnForm
          onCreate={async (title) => {
            await onCreate(title);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddColumnForm({
  onCreate,
}: {
  onCreate: (title: string) => Promise<void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  async function submit({ title }: Values) {
    try {
      await onCreate(title);
    } catch (error) {
      toast.error(errorMessage(error, "The column could not be added."));
    }
  }

  return (
    <form
      onSubmit={(event) => void form.handleSubmit(submit)(event)}
      noValidate
    >
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Column name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="e.g. Blocked"
              aria-invalid={fieldState.invalid}
              aria-required
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <DialogFooter className="mt-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Add column
        </Button>
      </DialogFooter>
    </form>
  );
}
