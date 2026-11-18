import { describe, expect, it } from "vitest";

import { initials } from "./user-avatar";

describe("initials", () => {
  it("takes the first letter of the first two words, in capitals", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("  grace  brewster  hopper ")).toBe("GB");
    expect(initials("madonna")).toBe("M");
  });

  it("falls back to a question mark when there is no name", () => {
    expect(initials("   ")).toBe("?");
  });
});
