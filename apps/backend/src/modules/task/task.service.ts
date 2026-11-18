import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Prisma } from "@/generated/prisma/client";
import { PrismaService } from "@/lib/database/prisma.service.js";

import { BoardGateway } from "../board/board.gateway.js";

import type {
  CreateTaskDto,
  ListTasksQueryDto,
  MoveTaskDto,
  UpdateTaskDto,
} from "./task.dto.js";

const taskInclude = {
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardGateway: BoardGateway,
  ) {}

  private async ensureColumnInBoard(columnId: string, boardId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });

    if (!column) {
      throw new BadRequestException("Column does not belong to this board");
    }
  }

  /** A task is assigned to someone who is on the board; an id from anywhere else is refused. */
  private async ensureAssigneeOnBoard(
    boardId: string,
    assigneeId: string | null | undefined,
  ) {
    if (!assigneeId) return;
    const onBoard = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: assigneeId },
          { members: { some: { userId: assigneeId } } },
        ],
      },
      select: { id: true },
    });

    if (!onBoard) {
      throw new BadRequestException("The assignee is not on this board");
    }
  }

  private emit(boardId: string, event: string, payload: unknown) {
    this.boardGateway.emitToBoard(boardId, event, payload);
  }

  async listTasks(boardId: string, filters: ListTasksQueryDto) {
    const { priority, assignee, column, q } = filters;

    return this.prisma.task.findMany({
      where: {
        boardId,
        ...(priority && { priority }),
        ...(assignee && { assigneeId: assignee }),
        ...(column && { columnId: column }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: taskInclude,
      orderBy: { position: "asc" },
    });
  }

  async createTask(
    boardId: string,
    user: { id: string; name: string },
    dto: CreateTaskDto,
  ) {
    await this.ensureColumnInBoard(dto.columnId, boardId);
    await this.ensureAssigneeOnBoard(boardId, dto.assigneeId);

    // Append the task after the last task in its column.
    const lastTask = await this.prisma.task.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const position = (lastTask?.position.toNumber() ?? 0) + 1000;

    const task = await this.prisma.$transaction(async (tx) => {
      const created = await tx.task.create({
        data: {
          boardId,
          columnId: dto.columnId,
          title: dto.title,
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
          ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
          priority: dto.priority,
          position,
          createdBy: user.id,
        },
        include: taskInclude,
      });

      await tx.activity.create({
        data: {
          boardId,
          userId: user.id,
          action: "task.created",
          message: `${user.name} created "${created.title}"`,
          metadata: { taskId: created.id },
        },
      });

      return created;
    });

    this.emit(boardId, "task:created", task);

    return task;
  }

  async updateTask(boardId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, boardId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    await this.ensureAssigneeOnBoard(boardId, dto.assigneeId);

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.assigneeId !== undefined && {
          assigneeId: dto.assigneeId,
        }),
      },
      include: taskInclude,
    });

    this.emit(boardId, "task:updated", task);

    return task;
  }

  async moveTask(
    boardId: string,
    taskId: string,
    user: { id: string; name: string },
    dto: MoveTaskDto,
  ) {
    await this.ensureColumnInBoard(dto.columnId, boardId);

    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, boardId },
      include: {
        column: { select: { title: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    const movedColumns = existing.columnId !== dto.columnId;

    const task = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: dto.columnId,
          position: dto.position,
        },
        include: taskInclude,
      });

      if (movedColumns) {
        const targetColumn = await tx.column.findUniqueOrThrow({
          where: { id: dto.columnId },
          select: { title: true },
        });

        await tx.activity.create({
          data: {
            boardId,
            userId: user.id,
            action: "task.moved",
            message: `${user.name} moved "${updated.title}" to ${targetColumn.title}`,
            metadata: {
              taskId: updated.id,
              columnId: dto.columnId,
            },
          },
        });
      }

      return updated;
    });

    this.emit(boardId, "task:moved", task);

    return task;
  }

  async deleteTask(
    boardId: string,
    taskId: string,
    user: { id: string; name: string },
  ) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, boardId },
      select: { id: true, title: true },
    });

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });

      await tx.activity.create({
        data: {
          boardId,
          userId: user.id,
          action: "task.deleted",
          message: `${user.name} deleted "${existing.title}"`,
          metadata: { taskId },
        },
      });
    });

    this.emit(boardId, "task:deleted", { id: taskId });

    return { success: true };
  }
}
