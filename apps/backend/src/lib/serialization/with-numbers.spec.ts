import { describe, expect, it } from "vitest";

import { Prisma } from "@/generated/prisma/client";

import { withNumbers } from "./with-numbers";

describe("withNumbers", () => {
  it("turns decimals into numbers, however deep, and leaves everything else alone", () => {
    const day = new Date("2026-03-04T00:00:00.000Z");
    const result = withNumbers({
      task: {
        position: new Prisma.Decimal("2500.5"),
        dueDate: day,
        title: "x",
      },
      columns: [{ position: new Prisma.Decimal(1000) }],
      none: null,
    });

    expect(result).toEqual({
      task: { position: 2500.5, dueDate: day, title: "x" },
      columns: [{ position: 1000 }],
      none: null,
    });
  });
});
