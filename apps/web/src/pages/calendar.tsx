import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@repo/ui/blocks/page-header";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import { PRIORITIES, priorityMeta } from "@/features/tasks/lib/priority";
import { CalendarGrid } from "@/features/workspace/components/calendar-grid";
import { useWorkspace } from "@/features/workspace/hooks/use-workspace";
import {
  countDueIn,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  tasksByDay,
  todayKey,
} from "@/features/workspace/lib/calendar";
import { usePageTitle } from "@/hooks/use-page-title";

export function CalendarPage() {
  usePageTitle("Calendar");
  const { tasks, isPending } = useWorkspace();
  const [month, setMonth] = useState(() => monthOf());

  return (
    <div className="-m-4 flex flex-1 flex-col">
      <PageHeader title="Calendar" description="Tasks by due date" />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            aria-live="polite"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            {monthLabel(month)}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {countDueIn(tasks, month)} due
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => setMonth(monthOf())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Previous month"
              aria-label="Previous month"
              onClick={() => setMonth((current) => shiftMonth(current, -1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Next month"
              aria-label="Next month"
              onClick={() => setMonth((current) => shiftMonth(current, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        {isPending ? (
          <div role="status">
            <span className="sr-only">Loading the calendar</span>
            <Skeleton className="h-[640px]" />
          </div>
        ) : (
          <CalendarGrid
            days={monthGrid(month)}
            tasksByDay={tasksByDay(tasks)}
            today={todayKey()}
          />
        )}

        <ul className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5" aria-hidden /> Dot colour is the
            priority
          </li>
          {PRIORITIES.map((priority) => (
            <li key={priority} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  priorityMeta[priority].dot,
                )}
              />
              {priorityMeta[priority].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
