import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KanbanBoard, type BoardTask } from "./kanban-board";

afterEach(cleanup);

const columns = [
  { id: "c1", title: "To do" },
  { id: "c2", title: "Done" },
];

const task = (id: string, columnId: string, title: string): BoardTask => ({
  id,
  columnId,
  position: 1000,
  title,
  description: null,
  priority: "high",
  dueDate: null,
  assignee: { id: "u1", name: "Ada Lovelace", image: null },
});

const tasks = [task("t1", "c1", "Write docs"), task("t2", "c2", "Ship it")];

function renderBoard(onTaskClick = vi.fn()) {
  const noop = vi.fn();
  const view = render(
    <KanbanBoard
      columns={columns}
      tasks={tasks}
      onTaskClick={onTaskClick}
      onMoveTask={noop}
      onAddTask={noop}
      onAiGenerate={noop}
      onAddColumn={noop}
      onRenameColumn={noop}
      onDeleteColumn={noop}
    />,
  );
  return { ...view, onTaskClick };
}

// Contrast needs real layout and colour, so the browser scan and the theme spec cover it.
describe("KanbanBoard accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = renderBoard();
    const { violations } = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it("opens the focused task with Enter", () => {
    const { onTaskClick } = renderBoard();
    fireEvent.keyDown(screen.getByRole("button", { name: /Write docs/ }), {
      key: "Enter",
    });
    expect(onTaskClick).toHaveBeenCalledOnce();
  });
});
