import { z } from "zod";

import type { components } from "@repo/api-client";
import { LIMITS } from "@repo/shared/limits";

/** A task the generator drafted (the generated type); nothing is saved until the person adds it. */
export type TaskSuggestion =
  components["schemas"]["SubtasksResponseDto"]["data"]["subtasks"][number];

/** How many tasks can be asked for. */
export const TASK_COUNTS = ["4", "6", "8", "10"] as const;

export const generateFormSchema = z.object({
  goal: z.string().trim().min(1, "Describe a goal").max(LIMITS.aiGoal),
  count: z.enum(TASK_COUNTS),
  columnId: z.string().min(1),
});
export type GenerateFormValues = z.infer<typeof generateFormSchema>;

export type GenerateInput = { goal: string; count: number };

export function toGenerateInput(values: GenerateFormValues): GenerateInput {
  return { goal: values.goal, count: Number(values.count) };
}
