/** A month, with `month` from 0 (January) to 11. */
export type MonthRef = { year: number; month: number };

export type CalendarDay = {
  /** `YYYY-MM-DD`: the same text a due date starts with. */
  key: string;
  day: number;
  inMonth: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/**
 * The weeks of a month, Sunday first, padded with the neighbouring days to whole weeks. Days are
 * calendar days, computed in UTC so a daylight-saving change cannot shift one.
 */
export function monthGrid({ year, month }: MonthRef): CalendarDay[] {
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month, 1 - offset + index));
    return {
      key: keyOf(date),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month,
    };
  });
}

export function shiftMonth({ year, month }: MonthRef, by: number): MonthRef {
  const date = new Date(Date.UTC(year, month + by, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export const monthOf = (now = new Date()): MonthRef => ({
  year: now.getFullYear(),
  month: now.getMonth(),
});

export const monthLabel = ({ year, month }: MonthRef) =>
  new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** The viewer's today, in the same form as a calendar day's key. */
export const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** The tasks due on each day, keyed by `YYYY-MM-DD`. Tasks without a due date are left out. */
export function tasksByDay<T extends { dueDate: string | null }>(
  tasks: T[],
): Map<string, T[]> {
  const days = new Map<string, T[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10);
    days.set(key, [...(days.get(key) ?? []), task]);
  }
  return days;
}

export const countDueIn = (
  tasks: { dueDate: string | null }[],
  { year, month }: MonthRef,
) =>
  tasks.filter((task) => task.dueDate?.startsWith(`${year}-${pad(month + 1)}`))
    .length;
