import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axe from "axe-core";
import { Settings } from "lucide-react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { CommandMenu } from "./command-menu";

// jsdom has none of these; the command list uses them to follow the highlighted item
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

function renderMenu() {
  const props = {
    onOpenChange: vi.fn(),
    onNavigate: vi.fn(),
    onCreateBoard: vi.fn(),
  };
  render(
    <CommandMenu
      open
      pages={[{ label: "Settings", to: "/settings", icon: Settings }]}
      boards={[
        { id: "b1", title: "Roadmap", color: "#2f8159" },
        { id: "b2", title: "Marketing", color: "#5f7da6" },
      ]}
      {...props}
    />,
  );
  return props;
}

describe("CommandMenu", () => {
  it("narrows the list as you type, by label, and says when nothing matches", async () => {
    renderMenu();
    const search = screen.getByPlaceholderText(/Search boards/);

    fireEvent.change(search, { target: { value: "road" } });
    await waitFor(() => expect(screen.queryByText("Marketing")).toBeNull());
    expect(screen.getByText("Roadmap")).toBeTruthy();
    expect(screen.queryByText("Settings")).toBeNull();

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(await screen.findByText("No results")).toBeTruthy();
  });

  it("goes to a board, closing the menu first", async () => {
    const { onNavigate, onOpenChange } = renderMenu();
    fireEvent.click(await screen.findByText("Marketing"));

    expect(onNavigate).toHaveBeenCalledWith("/board/b2");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("runs the create-board action", async () => {
    const { onCreateBoard } = renderMenu();
    fireEvent.click(await screen.findByText("Create new board"));
    expect(onCreateBoard).toHaveBeenCalledOnce();
  });

  it("has no axe violations", async () => {
    renderMenu();
    await screen.findByText("Roadmap");
    const { violations } = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
