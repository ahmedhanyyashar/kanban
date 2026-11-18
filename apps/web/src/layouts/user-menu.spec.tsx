import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@repo/ui/components/sidebar";

import { UserMenu } from "./user-menu";

// the sidebar provider asks the browser whether the screen is a phone
beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
});

afterEach(cleanup);

describe("UserMenu", () => {
  it("names the account on the button and signs out from the menu", async () => {
    const onSignOut = vi.fn();
    render(
      <SidebarProvider>
        <UserMenu
          user={{ name: "Ada Lovelace", email: "ada@example.com" }}
          onSignOut={onSignOut}
        />
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Account menu" });
    expect(trigger.textContent).toContain("ada@example.com");

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
