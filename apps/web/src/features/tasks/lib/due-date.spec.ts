import { describe, expect, it } from "vitest";

import { formatDueDate } from "./due-date";

// the viewer's afternoon of 10 March; due dates arrive as calendar days at UTC midnight
const now = new Date(2026, 2, 10, 15, 0);
const day = (iso: string) => `${iso}T00:00:00.000Z`;

describe("formatDueDate", () => {
  it("has nothing for no date", () => {
    expect(formatDueDate(null, now)).toBeNull();
  });

  it("names today and tomorrow, never overdue, in any time zone", () => {
    expect(formatDueDate(day("2026-03-10"), now)).toEqual({
      label: "Today",
      overdue: false,
    });
    expect(formatDueDate(day("2026-03-11"), now)).toEqual({
      label: "Tomorrow",
      overdue: false,
    });
  });

  it("flags past days as overdue and future days as not", () => {
    expect(formatDueDate(day("2026-03-04"), now)).toEqual({
      label: "Mar 4",
      overdue: true,
    });
    expect(formatDueDate(day("2026-03-20"), now)).toEqual({
      label: "Mar 20",
      overdue: false,
    });
  });
});
