import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShellLayout } from "./shell";

// the session store belongs to the auth library: here the layout is only told what it says
const session = vi.hoisted(
  (): { value: { data: null; isPending: boolean } } => ({
    value: { data: null, isPending: false },
  }),
);
vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => session.value },
}));

function SignInStub() {
  const { pathname, search } = useLocation();
  return <p>{`sign-in at ${pathname}${search}`}</p>;
}

function open(path: string, client = new QueryClient()) {
  const router = createMemoryRouter(
    [
      { path: "/sign-in", element: <SignInStub /> },
      { path: "/team", element: <ShellLayout /> },
    ],
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return client;
}

afterEach(() => {
  cleanup();
  session.value = { data: null, isPending: false };
});

describe("ShellLayout without a session", () => {
  it("shows nothing but a note while the session is being read", () => {
    session.value = { data: null, isPending: true };
    open("/team");
    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("sends the person to sign in, remembering the page and its filters", () => {
    open("/team?role=admin");
    expect(
      screen.getByText("sign-in at /sign-in?redirect=%2Fteam%3Frole%3Dadmin"),
    ).toBeTruthy();
  });

  it("empties the cache, so the next person on this tab does not see the last one's data", () => {
    const client = new QueryClient();
    client.setQueryData(["boards"], ["someone else's board"]);

    open("/team", client);

    expect(client.getQueryData(["boards"])).toBeUndefined();
  });
});
