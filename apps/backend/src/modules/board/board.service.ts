import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { canManageMembers } from "@repo/shared/board-role";

import { PrismaService } from "@/lib/database/prisma.service.js";

import type {
  AddBoardMemberDto,
  CreateBoardDto,
  UpdateBoardDto,
} from "./board.dto.js";
import { BoardGateway } from "./board.gateway.js";
import type { BoardAccess } from "./board.guard.js";

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Review", "Done"];

interface ActivityInput {
  boardId: string;
  userId: string;
  action: string;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
}

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BoardGateway,
  ) {}

  async listBoards(userId: string) {
    const boards = await this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      boards: boards.map((board) => ({
        ...board,
        isOwner: board.ownerId === userId,
        taskCount: board._count.tasks,
        memberCount: board._count.members,
        _count: undefined,
      })),
    };
  }

  async createBoard(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.$transaction(async (tx) => {
      const createdBoard = await tx.board.create({
        data: {
          title: dto.title,
          description: dto.description || null,
          color: dto.color ?? "#6366f1",
          ownerId: userId,
        },
      });

      // The owner is also a board member, with the owner role.
      await tx.boardMember.create({
        data: {
          boardId: createdBoard.id,
          userId,
          role: "owner",
        },
      });

      await tx.column.createMany({
        data: DEFAULT_COLUMNS.map((title, index) => ({
          boardId: createdBoard.id,
          title,
          position: (index + 1) * 1000,
        })),
      });

      return createdBoard;
    });

    return { board };
  }

  async getBoard(board: BoardAccess) {
    const result = await this.prisma.board.findUnique({
      where: { id: board.id },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
        tasks: {
          orderBy: { position: "asc" },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        members: {
          orderBy: { joinedAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException("Board not found");
    }

    const { members, ...boardData } = result;

    return {
      board: boardData,
      columns: result.columns,
      tasks: result.tasks,
      members: members.map((member) => ({
        ...member.user,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      role: board.role,
    };
  }

  async updateBoard(board: BoardAccess, dto: UpdateBoardDto) {
    const updatedBoard = await this.prisma.board.update({
      where: { id: board.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });

    this.gateway.emitToBoard(board.id, "board:updated", updatedBoard);

    return { board: updatedBoard };
  }

  async deleteBoard(board: BoardAccess) {
    if (board.role !== "owner") {
      throw new ForbiddenException("Only the owner can delete this board");
    }

    await this.prisma.board.delete({
      where: { id: board.id },
    });

    this.gateway.emitToBoard(board.id, "board:deleted", {
      id: board.id,
    });

    return { success: true };
  }

  async getActivity(boardId: string, limit: number) {
    const activities = await this.prisma.activity.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { activities };
  }

  async logActivity(input: ActivityInput) {
    const activity = await this.prisma.activity.create({
      data: {
        boardId: input.boardId,
        userId: input.userId,
        action: input.action,
        message: input.message,
        ...(input.metadata && { metadata: input.metadata }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    this.gateway.emitToBoard(input.boardId, "activity:new", activity);

    return activity;
  }

  async addMember(
    board: BoardAccess,
    actorId: string,
    actorName: string,
    dto: AddBoardMemberDto,
  ) {
    this.assertCanManageMembers(board);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundException("No user found with that email");
    }

    if (user.id === board.ownerId) {
      throw new BadRequestException(
        "The board owner already has the owner role",
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: board.id,
            userId: user.id,
          },
        },
      });

      const member = await tx.boardMember.upsert({
        where: {
          boardId_userId: {
            boardId: board.id,
            userId: user.id,
          },
        },
        create: {
          boardId: board.id,
          userId: user.id,
          role: dto.role,
        },
        update: {
          role: dto.role,
        },
      });

      // Only log an activity when the membership is new or its role changes.
      const changed = !existing || existing.role !== dto.role;

      const activity = changed
        ? await tx.activity.create({
            data: {
              boardId: board.id,
              userId: actorId,
              action: existing ? "member.role_updated" : "member.added",
              message: existing
                ? `${actorName} changed ${user.name}'s role to ${dto.role}`
                : `${actorName} added ${user.name} to the board`,
              metadata: { memberId: user.id },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          })
        : null;

      return { member, activity };
    });

    if (result.activity) {
      this.gateway.emitToBoard(board.id, "activity:new", result.activity);
    }

    return {
      member: {
        ...user,
        role: result.member.role,
      },
    };
  }

  async removeMember(
    board: BoardAccess,
    actorId: string,
    actorName: string,
    userId: string,
  ) {
    this.assertCanManageMembers(board);

    if (userId === board.ownerId) {
      throw new BadRequestException("Cannot remove the board owner");
    }

    const activity = await this.prisma.$transaction(async (tx) => {
      const member = await tx.boardMember.findUnique({
        where: { boardId_userId: { boardId: board.id, userId } },
        include: { user: { select: { name: true } } },
      });

      // removing someone who is not on the board changes nothing and logs nothing
      if (!member) return null;

      await tx.boardMember.delete({
        where: { boardId_userId: { boardId: board.id, userId } },
      });

      return tx.activity.create({
        data: {
          boardId: board.id,
          userId: actorId,
          action: "member.removed",
          message: `${actorName} removed ${member.user.name} from the board`,
          metadata: { memberId: userId },
        },
        include: { user: { select: { id: true, name: true, image: true } } },
      });
    });

    await this.gateway.removeUserFromBoard(board.id, userId);
    if (activity) this.gateway.emitToBoard(board.id, "activity:new", activity);

    return { success: true };
  }

  private assertCanManageMembers(board: BoardAccess): void {
    if (!canManageMembers(board.role)) {
      throw new ForbiddenException("Only owners or admins can manage members");
    }
  }
}
