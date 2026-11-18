import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";

import { boardRoleSchema, type BoardRole } from "@repo/shared/board-role";

import { PrismaService } from "@/lib/database/prisma.service.js";

export interface BoardAccess {
  id: string;
  ownerId: string;
  role: BoardRole;
}

export interface BoardRequest extends Request {
  user: { id: string };
  board: BoardAccess;
}

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<BoardRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    // every route this guard protects is under /boards/:boardId
    const parsedId = z.uuid().safeParse(request.params["boardId"]);

    if (!parsedId.success) {
      throw new BadRequestException("A valid board ID is required");
    }

    const board = await this.prisma.board.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        ownerId: true,
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const role = board.ownerId === userId ? "owner" : board.members[0]?.role;

    if (!role) {
      throw new ForbiddenException("You do not have access to this board");
    }

    request.board = {
      id: board.id,
      ownerId: board.ownerId,
      role: boardRoleSchema.parse(role),
    };

    return true;
  }
}
