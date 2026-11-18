import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ColumnMenu } from "./column-menu";

afterEach(cleanup);

function open(taskCount: number) {
  render(
    <ColumnMenu
      title="To do"
      taskCount={taskCount}
      onAiGenerate={vi.fn()}
      onRename={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Column actions" }));
}

describe("ColumnMenu", () => {
  it("offers deleting an empty column", async () => {
    open(0);
    const item = await screen.findByRole("menuitem", { name: /Delete column/ });
    expect(item.getAttribute("aria-disabled")).not.toBe("true");
  });

  it("will not delete a column that still has tasks, and says why", async () => {
    open(2);
    const item = await screen.findByRole("menuitem", { name: /Delete column/ });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.textContent).toContain("Empty it first");
  });
});
