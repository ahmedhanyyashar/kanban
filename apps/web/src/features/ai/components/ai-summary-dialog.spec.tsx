import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BoardSummary } from "@/features/ai/lib/summary";

import { AiSummaryDialog } from "./ai-summary-dialog";

afterEach(cleanup);

const summary: BoardSummary = {
  headline: "Checkout is two thirds done.",
  completed: ["Cart page"],
  inProgress: [],
  risks: ["Payments are unassigned"],
  recommendations: [],
};

const show = (value: BoardSummary | undefined) =>
  render(<AiSummaryDialog open onOpenChange={vi.fn()} summary={value} />);

describe("AiSummaryDialog", () => {
  it("says it is working until the summary arrives", () => {
    show(undefined);
    expect(screen.getByRole("status").textContent).toContain("Analyzing");
  });

  it("shows the headline and only the sections that have something in them", () => {
    show(summary);
    expect(screen.getByText("Checkout is two thirds done.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Completed" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Risks and blockers" }),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "In progress" })).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Recommendations" }),
    ).toBeNull();
  });

  it("has no axe violations", async () => {
    show(summary);
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
