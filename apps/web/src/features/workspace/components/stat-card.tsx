import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

/** Whole class names, from the theme's tested colours. */
const tones = {
  default: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-priority-medium/10 text-priority-medium",
  info: "bg-priority-low/10 text-priority-low",
} as const;

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: keyof typeof tones;
  /** A line of context under the number. */
  hint?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  hint,
}: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-soft">
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </h3>
          <div
            aria-hidden
            className={cn(
              "flex size-10 items-center justify-center rounded-2xl",
              tones[tone],
            )}
          >
            <Icon className="size-[18px]" />
          </div>
        </div>
        <p className="font-display text-4xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
