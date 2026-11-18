import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { ButtonLink } from "./button-link";

afterEach(cleanup);

describe("ButtonLink", () => {
  it("is a real link to where it goes, not a button that happens to navigate", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/sign-up">Get started</ButtonLink>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Get started" });
    expect(link.getAttribute("href")).toBe("/sign-up");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
