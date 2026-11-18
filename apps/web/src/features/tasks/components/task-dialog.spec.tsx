import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import axe from "axe-core";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskDialog } from "./task-dialog";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(cleanup);

const columns = [
  { id: "c1", title: "To do" },
  { id: "c2", title: "Done" },
];
const members = [{ id: "u1", name: "Ada Lovelace" }];

const task = {
  id: "t1",
  title: "Write docs",
  description: null,
  priority: "high" as const,
  dueDate: "2026-03-04T00:00:00.000Z",
  columnId: "c2",
  assignee: { id: "u1" },
};

function renderDialog(overrides: { task?: typeof task | null } = {}) {
  const props = {
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
    onBreakdown: vi.fn(),
  };
  render(
    <TaskDialog
      open
      task={overrides.task ?? null}
      defaultColumnId="c1"
      columns={columns}
      members={members}
      breakingDown={false}
      {...props}
    />,
  );
  return props;
}

describe("TaskDialog", () => {
  it("will not save without a title, and says why", async () => {
    const { onSubmit } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Title is required",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("saves what was typed, leaves unset fields null, and closes", async () => {
    const { onSubmit, onOpenChange } = renderDialog();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Ship it " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Ship it",
      description: null,
      priority: "medium",
      dueDate: null,
      assigneeId: null,
      columnId: "c1",
    });
  });

  it("stays open when saving fails", async () => {
    const { onSubmit, onOpenChange } = renderDialog();
    onSubmit.mockRejectedValueOnce(new Error("offline"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Ship it" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("offline"));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Title")).toHaveProperty("value", "Ship it");
  });

  it("offers delete and breakdown only when editing", () => {
    renderDialog();
    expect(screen.queryByRole("button", { name: /Delete/ })).toBeNull();
    cleanup();

    renderDialog({ task });
    expect(screen.getByRole("button", { name: /Delete/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /AI breakdown/ })).toBeTruthy();
    expect(screen.getByLabelText("Title")).toHaveProperty(
      "value",
      "Write docs",
    );
  });

  it("asks before deleting, and only then deletes and closes", async () => {
    const { onDelete, onOpenChange } = renderDialog({ task });
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/ }));

    const confirm = await screen.findByRole("alertdialog");
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(
      within(confirm).getByRole("button", { name: "Delete task" }),
    );
    expect(onDelete).toHaveBeenCalledWith("t1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not delete when the confirmation is cancelled", async () => {
    const { onDelete } = renderDialog({ task });
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/ }));
    const confirm = await screen.findByRole("alertdialog");
    fireEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    renderDialog({ task });
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
