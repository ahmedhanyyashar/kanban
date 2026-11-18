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

import { MembersDialog } from "./members-dialog";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

afterEach(cleanup);

const members = [
  {
    id: "u1",
    name: "Grace Hopper",
    email: "grace@example.com",
    image: null,
    role: "owner" as const,
  },
  {
    id: "u2",
    name: "Ada Lovelace",
    email: "ada@example.com",
    image: null,
    role: "member" as const,
  },
];

function renderDialog(canManage = true) {
  const props = {
    onOpenChange: vi.fn(),
    onInvite: vi.fn().mockResolvedValue({ name: "Alan Turing" }),
    onRemove: vi.fn(),
  };
  render(
    <MembersDialog open members={members} canManage={canManage} {...props} />,
  );
  return props;
}

const invite = (email: string) => {
  fireEvent.change(screen.getByLabelText("Invite by email"), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole("button", { name: "Invite" }));
};

describe("MembersDialog", () => {
  it("invites by email, says who was added and clears the field", async () => {
    const { onInvite } = renderDialog();
    invite("  alan@example.com ");

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Alan Turing added"),
    );
    expect(onInvite).toHaveBeenCalledWith("alan@example.com");
    expect(screen.getByLabelText("Invite by email")).toHaveProperty(
      "value",
      "",
    );
  });

  it("rejects an invalid email without asking, and reports a failed invite", async () => {
    const { onInvite } = renderDialog();
    invite("nobody");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "valid email",
    );
    expect(onInvite).not.toHaveBeenCalled();

    onInvite.mockRejectedValueOnce(new Error("No user found with that email"));
    invite("ghost@example.com");
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("No user found with that email"),
    );
    expect(screen.getByLabelText("Invite by email")).toHaveProperty(
      "value",
      "ghost@example.com",
    );
  });

  it("removes a member only after confirming, and never offers to remove the owner", async () => {
    const { onRemove } = renderDialog();
    expect(
      screen.queryByRole("button", { name: "Remove Grace Hopper" }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Ada Lovelace" }),
    );
    const confirm = await screen.findByRole("alertdialog");
    expect(onRemove).not.toHaveBeenCalled();

    fireEvent.click(within(confirm).getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledWith("u2");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("only lists the members when the viewer cannot manage them", () => {
    renderDialog(false);
    expect(screen.queryByLabelText("Invite by email")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("has no axe violations", async () => {
    renderDialog();
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
