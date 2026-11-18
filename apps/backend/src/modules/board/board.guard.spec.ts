import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { mock, mockDeep } from "vitest-mock-extended";

import { PrismaService } from "@/lib/database/prisma.service";

import { BoardAccessGuard, type BoardRequest } from "./board.guard.js";

const boardId = "6f1c1c64-9d7e-4d4c-8b8b-0f6a3a1b2c3d";

type Http = ReturnType<ExecutionContext["switchToHttp"]>;
type Found = { ownerId: string; members: { role: string }[] };

/** Runs the guard as `viewer` against a stored board (or none), for the id in the URL. */
function enter(found: Found | null, id = boardId) {
  const prisma = mockDeep<PrismaService>();
  const board = found && {
    id: boardId,
    title: "Roadmap",
    description: null,
    color: "#2f8159",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...found,
  };
  prisma.board.findUnique.mockResolvedValue(board);

  const request: Partial<BoardRequest> = {
    user: { id: "viewer" },
    params: { boardId: id },
  };
  const http = mock<Http>();
  http.getRequest.mockReturnValue(request);
  const context = mock<ExecutionContext>();
  context.switchToHttp.mockReturnValue(http);

  return {
    request,
    result: new BoardAccessGuard(prisma).canActivate(context),
  };
}

describe("BoardAccessGuard", () => {
  it("gives the owner the owner role and a member the role they were given", async () => {
    const owner = enter({ ownerId: "viewer", members: [] });
    await owner.result;
    expect(owner.request.board?.role).toBe("owner");

    const member = enter({ ownerId: "someone", members: [{ role: "admin" }] });
    await member.result;
    expect(member.request.board?.role).toBe("admin");
  });

  it("refuses a stranger, an unknown board and a malformed id", async () => {
    await expect(
      enter({ ownerId: "someone", members: [] }).result,
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(enter(null).result).rejects.toBeInstanceOf(NotFoundException);
    await expect(enter(null, "nope").result).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
