import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axe from "axe-core";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TaskSuggestion } from "@/features/ai/lib/generate-form";

import { AiGenerateDialog } from "./ai-generate-dialog";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

afterEach(cleanup);

const columns = [
  { id: "c1", title: "To do" },
  { id: "c2", title: "Done" },
];
const drafted: TaskSuggestion[] = [
  { title: "Design the cart", description: "Wireframes", priority: "high" },
  { title: "Wire up payments", description: "", priority: "urgent" },
];

function renderDialog() {
  const props = {
    onOpenChange: vi.fn(),
    onGenerate: vi.fn().mockResolvedValue(drafted),
    onAdd: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <AiGenerateDialog open columns={columns} defaultColumnId="c2" {...props} />,
  );
  return props;
}

const generate = (goal: string) => {
  fireEvent.change(screen.getByLabelText("Project goal"), {
    target: { value: goal },
  });
  fireEvent.click(screen.getByRole("button", { name: "Generate tasks" }));
};

describe("AiGenerateDialog", () => {
  it("asks for a goal before generating", async () => {
    const { onGenerate } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Generate tasks" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Describe a goal",
    );
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("shows what was drafted without saving anything", async () => {
    const { onGenerate, onAdd } = renderDialog();
    generate("  Build checkout ");

    expect(await screen.findByText("Design the cart")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("2 tasks");
    expect(onGenerate).toHaveBeenCalledWith({
      goal: "Build checkout",
      count: 6,
    });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("adds exactly the tasks that were shown, to the chosen column, and closes", async () => {
    const { onAdd, onOpenChange } = renderDialog();
    generate("Build checkout");
    fireEvent.click(
      await screen.findByRole("button", { name: "Add all to Done" }),
    );

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onAdd).toHaveBeenCalledWith(drafted, "c2");
    expect(toast.success).toHaveBeenCalledWith("Added 2 tasks");
  });

  it("reports a failed generation and shows no suggestions", async () => {
    const { onGenerate } = renderDialog();
    onGenerate.mockRejectedValueOnce(new Error("Model unavailable"));
    generate("Build checkout");

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Model unavailable"),
    );
    expect(screen.queryByText("Design the cart")).toBeNull();
  });

  it("has no axe violations with suggestions showing", async () => {
    renderDialog();
    generate("Build checkout");
    await screen.findByText("Design the cart");
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
