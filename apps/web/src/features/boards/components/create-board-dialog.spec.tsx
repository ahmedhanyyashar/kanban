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

import { CreateBoardDialog } from "./create-board-dialog";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

afterEach(cleanup);

function renderDialog() {
  const props = {
    onOpenChange: vi.fn(),
    onCreate: vi.fn().mockResolvedValue(undefined),
  };
  render(<CreateBoardDialog open {...props} />);
  return props;
}

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Create board" }));
const typeName = (value: string) =>
  fireEvent.change(screen.getByLabelText("Board name"), { target: { value } });

describe("CreateBoardDialog", () => {
  it("will not create a board without a name, and says why", async () => {
    const { onCreate } = renderDialog();
    submit();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Board name is required",
    );
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("creates with the chosen colour, leaves an empty description out, and closes", async () => {
    const { onCreate, onOpenChange } = renderDialog();
    typeName("  Roadmap ");
    fireEvent.click(screen.getByRole("radio", { name: "Teal" }));
    submit();

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onCreate).toHaveBeenCalledWith({
      title: "Roadmap",
      color: "#2c9c8f",
    });
    expect(toast.success).toHaveBeenCalledWith("Board created");
  });

  it("reports a failure and stays open with what was typed", async () => {
    const { onCreate, onOpenChange } = renderDialog();
    onCreate.mockRejectedValueOnce(new Error("Board limit reached"));
    typeName("Roadmap");
    submit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Board limit reached"),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Board name")).toHaveProperty(
      "value",
      "Roadmap",
    );
  });

  it("has no axe violations", async () => {
    renderDialog();
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
