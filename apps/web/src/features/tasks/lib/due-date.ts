export type DueDate = { label: string; overdue: boolean };

const DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days from the viewer's today to the due day: 0 is today, negative is past. A due date is a
 * calendar day kept at UTC midnight, so it is read in UTC; "today" is the viewer's own day.
 */
export function daysUntilDue(
  date: string | null | undefined,
  now = new Date(),
): number | null {
  if (!date) return null;
  const due = new Date(date);
  const dueDay = Date.UTC(
    due.getUTCFullYear(),
    due.getUTCMonth(),
    due.getUTCDate(),
  );
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return (dueDay - today) / DAY;
}

/** "Today", "Tomorrow" or "Mar 4"; overdue once the day has passed. */
export function formatDueDate(
  date: string | null | undefined,
  now = new Date(),
): DueDate | null {
  const days = daysUntilDue(date, now);
  if (days === null || !date) return null;
  if (days === 0) return { label: "Today", overdue: false };
  if (days === 1) return { label: "Tomorrow", overdue: false };
  return {
    label: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    overdue: days < 0,
  };
}
