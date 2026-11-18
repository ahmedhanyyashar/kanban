import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/lib/database/prisma.service.js";

import { BoardGateway } from "../board/board.gateway.js";
import type { BoardAccess } from "../board/board.guard.js";

import type { CreateColumnDto, UpdateColumnDto } from "./column.dto.js";

/** The gap between neighbouring columns, the same step the first four use; a move picks a number between two. */
const COLUMN_STEP = 1000;

@Injectable()
export class ColumnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BoardGateway,
  ) {}

  async create(board: BoardAccess, dto: CreateColumnDto) {
    const column = await this.prisma.$transaction(async (tx) => {
      const lastColumn = await tx.column.findFirst({
        where: { boardId: board.id },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      return tx.column.create({
        data: {
          boardId: board.id,
          title: dto.title,
          position: (lastColumn?.position.toNumber() ?? 0) + COLUMN_STEP,
        },
      });
    });

    this.gateway.emitToBoard(board.id, "column:created", column);

    return { column };
  }

  async update(board: BoardAccess, columnId: string, dto: UpdateColumnDto) {
    const result = await this.prisma.column.updateMany({
      where: {
        id: columnId,
        boardId: board.id,
      },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException("Column not found");
    }

    const column = await this.prisma.column.findUniqueOrThrow({
      where: { id: columnId },
    });

    this.gateway.emitToBoard(board.id, "column:updated", column);

    return { column };
  }

  async delete(board: BoardAccess, columnId: string) {
    await this.prisma.$transaction(async (tx) => {
      const column = await tx.column.findFirst({
        where: {
          id: columnId,
          boardId: board.id,
        },
        select: { id: true },
      });

      if (!column) {
        throw new NotFoundException("Column not found");
      }

      const taskCount = await tx.task.count({
        where: {
          columnId,
          boardId: board.id,
        },
      });

      if (taskCount > 0) {
        throw new BadRequestException(
          "Cannot delete a column that contains tasks",
        );
      }

      await tx.column.delete({
        where: { id: columnId },
      });
    });

    this.gateway.emitToBoard(board.id, "column:deleted", {
      id: columnId,
    });

    return { success: true };
  }
}
