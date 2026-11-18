import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivitySheet, type ActivityItem } from "./activity-sheet";

afterEach(cleanup);

const activities: ActivityItem[] = [
  {
    id: "a1",
    message: 'Ada Lovelace created "Write docs"',
    createdAt: "2026-03-04T10:00:00.000Z",
    user: { name: "Ada Lovelace", image: null },
  },
];

const show = (value: ActivityItem[] | undefined) =>
  render(<ActivitySheet open onOpenChange={vi.fn()} activities={value} />);

describe("ActivitySheet", () => {
  it("says it is loading until the activity arrives", () => {
    show(undefined);
    expect(screen.getByRole("status").textContent).toContain(
      "Loading activity",
    );
  });

  it("says so when nothing has happened yet", () => {
    show([]);
    expect(screen.getByText("No activity yet.")).toBeTruthy();
  });

  it("lists what happened, with the moment it did as machine-readable time", () => {
    show(activities);
    expect(screen.getByText('Ada Lovelace created "Write docs"')).toBeTruthy();
    expect(screen.getByRole("listitem").querySelector("time")).toHaveProperty(
      "dateTime",
      "2026-03-04T10:00:00.000Z",
    );
  });

  it("has no axe violations", async () => {
    show(activities);
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
