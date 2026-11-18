import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePageTitle } from "./use-page-title";

describe("usePageTitle", () => {
  it("names the page after the app, and follows the title when it changes", () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: "Settings" },
    });
    expect(document.title).toBe("Settings · Flowboard");

    rerender({ title: "Team" });
    expect(document.title).toBe("Team · Flowboard");
  });
});
