import { act, cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Root } from "./router";

function Boom(): never {
  throw new Error("a page that cannot render");
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("a page that fails to render", () => {
  it("shows a message instead of a blank screen, and moving to another page clears it", async () => {
    vi.spyOn(console, "error").mockReturnValue();
    const router = createMemoryRouter(
      [
        {
          element: <Root />,
          children: [
            { path: "/boom", element: <Boom /> },
            { path: "/fine", element: <p>All good here</p> },
          ],
        },
      ],
      { initialEntries: ["/boom"] },
    );
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Something went wrong")).toBeTruthy();

    await act(async () => {
      await router.navigate("/fine");
    });
    expect(screen.getByText("All good here")).toBeTruthy();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });
});
