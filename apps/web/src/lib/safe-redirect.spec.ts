import { describe, expect, it } from "vitest";

import { getSafeRedirect } from "./safe-redirect";

const fallback = "/dashboard";

describe("getSafeRedirect", () => {
  it("follows a path on this site, with its query and hash", () => {
    expect(getSafeRedirect("/board/42?filter=mine#top", fallback)).toBe(
      "/board/42?filter=mine#top",
    );
  });

  it("falls back when there is no address", () => {
    expect(getSafeRedirect(null, fallback)).toBe(fallback);
    expect(getSafeRedirect("", fallback)).toBe(fallback);
  });

  it.each([
    ["an absolute address", "https://other.example/steal"],
    ["a protocol-relative address", "//other.example"],
    ["a backslash in place of a slash", "/\\other.example"],
    ["a script address", "javascript:alert(1)"],
    ["a tab that the parser strips", "/\t/other.example"],
    ["a newline that the parser strips", "/\n/other.example"],
  ])("never leaves the site through %s", (_name, value) => {
    expect(getSafeRedirect(value, fallback)).toBe(fallback);
  });
});
