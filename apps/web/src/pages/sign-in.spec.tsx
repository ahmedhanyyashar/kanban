import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(
  (): {
    signInEmail: ReturnType<typeof vi.fn>;
    demo: { email: string; password: string } | null;
  } => ({
    signInEmail: vi.fn(),
    demo: { email: "alex@example.com", password: "password1234" },
  }),
);

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: null }),
    signIn: { email: mocks.signInEmail },
  },
}));
vi.mock("@/env", () => ({
  env: {
    get demo() {
      return mocks.demo;
    },
  },
}));

import { SignInPage } from "./sign-in";

const open = () =>
  render(
    <MemoryRouter>
      <SignInPage />
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the demo sign-in", () => {
  it("signs in as the demo account in one click", () => {
    mocks.signInEmail.mockResolvedValue({ error: null });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Try the demo" }));
    expect(mocks.signInEmail).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "password1234",
    });
  });

  it("is not offered when no demo account is configured", () => {
    mocks.demo = null;
    open();
    expect(screen.queryByRole("button", { name: "Try the demo" })).toBeNull();
  });
});
