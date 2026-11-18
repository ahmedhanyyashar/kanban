import { PRIORITIES, type Priority } from "@repo/shared/contracts/board";

export { PRIORITIES, type Priority };

/** Whole class names, so Tailwind can see them. */
export const priorityMeta: Record<
  Priority,
  { label: string; tag: string; dot: string }
> = {
  low: {
    label: "Low",
    tag: "bg-priority-low/10 text-priority-low",
    dot: "bg-priority-low",
  },
  medium: {
    label: "Medium",
    tag: "bg-priority-medium/10 text-priority-medium",
    dot: "bg-priority-medium",
  },
  high: {
    label: "High",
    tag: "bg-priority-high/10 text-priority-high",
    dot: "bg-priority-high",
  },
  urgent: {
    label: "Urgent",
    tag: "bg-priority-urgent/10 text-priority-urgent",
    dot: "bg-priority-urgent",
  },
};
