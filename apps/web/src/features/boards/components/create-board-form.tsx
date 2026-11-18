import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";

import {
  BOARD_COLORS,
  boardFormSchema,
  emptyBoardForm,
  toBoardInput,
  type BoardFormValues,
  type BoardInput,
} from "@/features/boards/lib/board-form";
import { errorMessage } from "@/lib/error-message";

type CreateBoardFormProps = {
  /** Rejects with the reason when the board could not be created. */
  onCreate: (input: BoardInput) => Promise<void>;
};

export function CreateBoardForm({ onCreate }: CreateBoardFormProps) {
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: emptyBoardForm,
  });

  async function submit(values: BoardFormValues) {
    try {
      await onCreate(toBoardInput(values));
      toast.success("Board created");
    } catch (error) {
      toast.error(errorMessage(error, "The board could not be created."));
    }
  }

  return (
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
              <FieldLabel htmlFor={field.name}>Board name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Product Roadmap"
                aria-invalid={fieldState.invalid}
                aria-required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Description (optional)
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={3}
                placeholder="What is this board about?"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="color"
          control={form.control}
          render={({ field }) => (
            // native radios: arrow keys, one tab stop and the selected state come for free
            <FieldSet>
              <FieldLegend variant="label">Accent colour</FieldLegend>
              <div className="flex gap-2">
                {BOARD_COLORS.map((color) => (
                  <label key={color.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value={color.value}
                      checked={field.value === color.value}
                      onChange={() => field.onChange(color.value)}
                      onBlur={field.onBlur}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{color.name}</span>
                    <span
                      aria-hidden
                      className="block size-7 rounded-full transition-transform hover:scale-110 peer-checked:ring-2 peer-checked:ring-foreground/70 peer-checked:ring-offset-2 peer-checked:ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
                      style={{ backgroundColor: color.value }}
                    />
                  </label>
                ))}
              </div>
            </FieldSet>
          )}
        />

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" />}>
            Cancel
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create board
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}
