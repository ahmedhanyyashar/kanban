import { describe, expect, it } from "vitest";

import { findPeople } from "./team";
import type { WorkspaceMember } from "./workspace";

const person = (name: string, email: string): WorkspaceMember => ({
  id: name,
  name,
  email,
  image: null,
  role: "member",
  boards: [],
});

const people = [
  person("Grace Hopper", "grace@example.com"),
  person("Ada Lovelace", "ada@example.com"),
];

describe("findPeople", () => {
  it("orders by name and leaves the original list alone", () => {
    expect(findPeople(people, "").map((p) => p.name)).toEqual([
      "Ada Lovelace",
      "Grace Hopper",
    ]);
    expect(people[0]?.name).toBe("Grace Hopper");
  });

  it("matches the name or the email, ignoring case and padding", () => {
    expect(findPeople(people, " HOPPER ").map((p) => p.name)).toEqual([
      "Grace Hopper",
    ]);
    expect(findPeople(people, "ada@").map((p) => p.name)).toEqual([
      "Ada Lovelace",
    ]);
    expect(findPeople(people, "nobody")).toEqual([]);
  });
});
