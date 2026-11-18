import { describe, expect, it } from "vitest";

import { boardAnnouncer } from "./board-announcer";

const say = boardAnnouncer(
  [
    { id: "c1", title: "To do" },
    { id: "c2", title: "Done" },
  ],
  [
    { id: "t1", title: "Write docs", columnId: "c1" },
    { id: "t2", title: "Ship it", columnId: "c2" },
  ],
);

describe("boardAnnouncer", () => {
  it("speaks of tasks and columns by name, never by id, and only when there is something to say", () => {
    const sentences = [
      say.start("t1"),
      say.over("t1", "c2"),
      say.over("t1", "t2"),
      say.end("t1", "c2"),
      say.end("t1", undefined),
      say.cancel("t1"),
    ];
    for (const sentence of sentences) {
      expect(sentence).toContain("Write docs");
      expect(sentence).not.toMatch(/\b(t1|t2|c1|c2)\b/);
    }
    expect(say.over("t1", "c2")).toContain("Done");
    expect(say.over("t1", "t2")).toContain("Ship it");
    expect(say.over("t1", "t1")).toBeUndefined();
  });
});
