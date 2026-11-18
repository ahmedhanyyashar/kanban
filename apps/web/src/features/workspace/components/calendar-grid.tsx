import { Link } from "react-router";

import { cn } from "@repo/ui/lib/utils";

import { priorityMeta } from "@/features/tasks/lib/priority";
import type { CalendarDay } from "@/features/workspace/lib/calendar";
import type { WorkspaceTask } from "@/features/workspace/lib/workspace";

const WEEKDAYS = [
  { short: "S", long: "Sunday" },
  { short: "M", long: "Monday" },
  { short: "T", long: "Tuesday" },
  { short: "W", long: "Wednesday" },
  { short: "T", long: "Thursday" },
  { short: "F", long: "Friday" },
  { short: "S", long: "Saturday" },
];

const SHOWN = 3;

type CalendarGridProps = {
  days: CalendarDay[];
  tasksByDay: Map<string, WorkspaceTask[]>;
  today: string;
};

/** A month as a table: one column per weekday, one row per week, each day listing what is due. */
export function CalendarGrid({ days, tasksByDay, today }: CalendarGridProps) {
  const weeks = Array.from({ length: days.length / 7 }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );

  return (
    <table className="w-full table-fixed border-collapse overflow-hidden rounded-3xl border bg-card">
      <thead className="bg-muted/50">
        <tr>
          {WEEKDAYS.map((weekday) => (
            <th
              key={weekday.long}
              scope="col"
              abbr={weekday.long}
              className="px-3 py-2.5 text-center text-[11px] font-semibold tracking-widest text-muted-foreground uppercase"
            >
              <span className="hidden sm:inline">
                {weekday.long.slice(0, 3)}
              </span>
              <span className="sm:hidden" aria-hidden>
                {weekday.short}
              </span>
              <span className="sr-only sm:hidden">{weekday.long}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]?.key}>
            {week.map((day) => {
              const due = tasksByDay.get(day.key) ?? [];
              return (
                <td
                  key={day.key}
                  className={cn(
                    "h-28 border-t border-l p-2 align-top first:border-l-0",
                    !day.inMonth && "bg-muted/30",
                  )}
                >
                  <div className="mb-1.5 flex justify-end">
                    <time
                      dateTime={day.key}
                      aria-current={day.key === today ? "date" : undefined}
                      className={cn(
                        "grid size-6 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        day.key === today
                          ? "bg-primary text-primary-foreground"
                          : day.inMonth
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {day.day}
                    </time>
                  </div>
                  {due.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {due.slice(0, SHOWN).map((task) => (
                        <li key={task.id}>
                          <Link
                            to={`/board/${task.boardId}`}
                            title={`${task.title} · ${task.boardTitle}`}
                            className="flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-1 text-[11px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                priorityMeta[task.priority].dot,
                              )}
                            />
                            <span className="sr-only">
                              {priorityMeta[task.priority].label} priority:
                            </span>
                            <span className="truncate">{task.title}</span>
                          </Link>
                        </li>
                      ))}
                      {due.length > SHOWN && (
                        <li className="px-1.5 text-[10px] font-medium text-muted-foreground">
                          +{due.length - SHOWN} more
                        </li>
                      )}
                    </ul>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
