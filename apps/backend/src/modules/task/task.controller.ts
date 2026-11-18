import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";

import { ApiErrors, DoneResponseDto } from "@/lib/openapi/responses";

import { BoardAccessGuard } from "../board/board.guard.js";

import {
  CreateTaskDto,
  ListTasksQueryDto,
  MoveTaskDto,
  UpdateTaskDto,
} from "./task.dto.js";
import { TaskListResponseDto, TaskResponseDto } from "./task.responses.js";
import { TaskService } from "./task.service.js";

@ApiErrors()
@Controller("boards/:boardId/tasks")
@UseGuards(BoardAccessGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOkResponse({ type: TaskListResponseDto })
  @Get()
  async listTasks(
    @Param("boardId") boardId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    const tasks = await this.taskService.listTasks(boardId, query);
    return {
      tasks,
    };
  }

  @ApiCreatedResponse({ type: TaskResponseDto })
  @Post()
  async createTask(
    @Param("boardId") boardId: string,
    @Session() session: UserSession,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.taskService.createTask(boardId, session.user, dto);

    return { task };
  }

  @ApiOkResponse({ type: TaskResponseDto })
  @Patch(":taskId")
  async updateTask(
    @Param("boardId") boardId: string,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskService.updateTask(boardId, taskId, dto);

    return { task };
  }

  @ApiOkResponse({ type: TaskResponseDto })
  @Patch(":taskId/move")
  async moveTask(
    @Param("boardId") boardId: string,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Session() session: UserSession,
    @Body() dto: MoveTaskDto,
  ) {
    const task = await this.taskService.moveTask(
      boardId,
      taskId,
      session.user,
      dto,
    );

    return { task };
  }

  @ApiOkResponse({ type: DoneResponseDto })
  @Delete(":taskId")
  async deleteTask(
    @Param("boardId") boardId: string,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Session() session: UserSession,
  ) {
    return this.taskService.deleteTask(boardId, taskId, session.user);
  }
}
