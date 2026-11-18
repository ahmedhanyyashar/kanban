import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
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

import {
  generateFormSchema,
  TASK_COUNTS,
  toGenerateInput,
  type GenerateFormValues,
  type GenerateInput,
  type TaskSuggestion,
} from "@/features/ai/lib/generate-form";
import { errorMessage } from "@/lib/error-message";

import { SuggestionList } from "./suggestion-list";

type Option = { value: string; label: string };

type AiGenerateFormProps = {
  columns: { id: string; title: string }[];
  defaultColumnId: string;
  /** Drafts tasks for a goal; saves nothing. */
  onGenerate: (input: GenerateInput) => Promise<TaskSuggestion[]>;
  /** Saves the tasks that were shown. */
  onAdd: (tasks: TaskSuggestion[], columnId: string) => Promise<void>;
};

export function AiGenerateForm({
  columns,
  defaultColumnId,
  onGenerate,
  onAdd,
}: AiGenerateFormProps) {
  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: { goal: "", count: "6", columnId: defaultColumnId },
  });
  const [suggestions, setSuggestions] = useState<TaskSuggestion[] | null>(null);
  const [adding, setAdding] = useState(false);
  const generating = form.formState.isSubmitting;
  const columnId = useWatch({ control: form.control, name: "columnId" });
  const columnTitle = columns.find((c) => c.id === columnId)?.title;

  async function generate(values: GenerateFormValues) {
    setSuggestions(null);
    try {
      setSuggestions(await onGenerate(toGenerateInput(values)));
    } catch (error) {
      toast.error(errorMessage(error, "Could not generate tasks. Try again."));
    }
  }

  async function addAll() {
    if (!suggestions) return;
    setAdding(true);
    try {
      await onAdd(suggestions, columnId);
      toast.success(`Added ${suggestions.length} tasks`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not add the tasks. Try again."));
    } finally {
      setAdding(false);
    }
  }

  const counts: Option[] = TASK_COUNTS.map((n) => ({
    value: n,
    label: `${n} tasks`,
  }));
  const columnOptions: Option[] = columns.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(event) => void form.handleSubmit(generate)(event)}
        noValidate
      >
        <FieldGroup>
          <Controller
            name="goal"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Project goal</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Build an e-commerce checkout flow"
                  aria-invalid={fieldState.invalid}
                  aria-required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <OptionField
              form={form}
              name="count"
              label="Number of tasks"
              options={counts}
            />
            <OptionField
              form={form}
              name="columnId"
              label="Add to column"
              options={columnOptions}
            />
          </div>
          <Button type="submit" disabled={generating || adding}>
            <Sparkles /> {suggestions ? "Regenerate" : "Generate tasks"}
          </Button>
        </FieldGroup>
      </form>

      {/* read out by screen readers; the spinner and the list are the visible side */}
      <p role="status" className="sr-only">
        {generating
          ? "Generating tasks…"
          : suggestions
            ? `${suggestions.length} tasks suggested`
            : ""}
      </p>

      {generating && (
        <div
          aria-hidden
          className="flex items-center justify-center gap-2 py-8 text-muted-foreground"
        >
          <Loader2 className="size-5 animate-spin text-primary" /> Thinking…
        </div>
      )}

      {suggestions && !generating && (
        <>
          <SuggestionList tasks={suggestions} />
          <div className="flex justify-end">
            <Button onClick={() => void addAll()} disabled={adding}>
              <Check /> Add all to {columnTitle}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

type OptionFieldProps = {
  form: ReturnType<typeof useForm<GenerateFormValues>>;
  name: "count" | "columnId";
  label: string;
  options: Option[];
};

function OptionField({ form, name, label, options }: OptionFieldProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            items={options}
            value={field.value}
            onValueChange={(value) => {
              if (value) field.onChange(value);
            }}
          >
            <SelectTrigger
              id={field.name}
              className="w-full"
              onBlur={field.onBlur}
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
        </Field>
      )}
    />
  );
}
