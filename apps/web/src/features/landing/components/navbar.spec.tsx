import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "./navbar";

const session = vi.hoisted(
  (): { value: { data: { user: { name: string } } | null } } => ({
    value: { data: null },
  }),
);
vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => session.value },
}));

afterEach(() => {
  cleanup();
  session.value = { data: null };
});

const show = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );

describe("Navbar", () => {
  it("offers to sign in or sign up to a visitor", () => {
    show();
    expect(screen.getByRole("link", { name: "Log in" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Get started" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open app" })).toBeNull();
  });

  it("offers to open the app to someone who is already signed in", () => {
    session.value = { data: { user: { name: "Ada" } } };
    show();
    expect(screen.getByRole("link", { name: "Open app" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  });
});
