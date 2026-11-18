import type { LucideIcon } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";

/** Whole class names, so Tailwind can see them; all from the theme's tested colours. */
export const summaryTones = {
  done: { text: "text-primary", dot: "bg-primary" },
  progress: { text: "text-priority-medium", dot: "bg-priority-medium" },
  risk: { text: "text-destructive", dot: "bg-destructive" },
  next: { text: "text-priority-low", dot: "bg-priority-low" },
} as const;

type SummarySectionProps = {
  icon: LucideIcon;
  title: string;
  items: string[];
  tone: keyof typeof summaryTones;
};

export function SummarySection({
  icon: Icon,
  title,
  items,
  tone,
}: SummarySectionProps) {
  if (items.length === 0) return null;
  const { text, dot } = summaryTones[tone];
  return (
    <section>
      <h3
        className={cn(
          "mb-2 flex items-center gap-2 text-sm font-semibold",
          text,
        )}
      >
        <Icon className="size-4" /> {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className={cn("mt-2 size-1 shrink-0 rounded-full", dot)}
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
