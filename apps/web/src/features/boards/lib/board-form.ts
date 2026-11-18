import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";

/** Accent colours a board can take. The API stores the hex value, so these are data, not styling. */
export const BOARD_COLORS = [
  { name: "Forest", value: "#2f8159" },
  { name: "Teal", value: "#2c9c8f" },
  { name: "Sage", value: "#6f9b54" },
  { name: "Amber", value: "#d4a23c" },
  { name: "Terracotta", value: "#c26a45" },
  { name: "Slate", value: "#5f7da6" },
] as const;

export const boardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Board name is required")
    .max(LIMITS.boardTitle, "Board name is too long"),
  description: z
    .string()
    .trim()
    .max(LIMITS.boardDescription, "Description is too long"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export type BoardFormValues = z.infer<typeof boardFormSchema>;

/** What the form hands to the caller; an empty description is left out. */
export type BoardInput = {
  title: string;
  description?: string;
  color: string;
};

export const emptyBoardForm: BoardFormValues = {
  title: "",
  description: "",
  color: BOARD_COLORS[0].value,
};

export function toBoardInput(values: BoardFormValues): BoardInput {
  return {
    title: values.title,
    ...(values.description && { description: values.description }),
    color: values.color,
  };
}
