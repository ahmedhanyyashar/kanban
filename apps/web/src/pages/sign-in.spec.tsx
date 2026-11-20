import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  it("signs in once however often the button is pressed, and holds the form while it does", async () => {
    mocks.signInEmail.mockReturnValue(new Promise(() => undefined));
    open();
    const demo = screen.getByRole("button", { name: "Try the demo" });
    fireEvent.click(demo);
    fireEvent.click(demo);
    await waitFor(() => expect(demo).toHaveProperty("disabled", true));
    expect(mocks.signInEmail).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toHaveProperty("disabled", true);
  });
});
