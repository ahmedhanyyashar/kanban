import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";

import { ApiErrors } from "@/lib/openapi/responses";

import { BoardAccessGuard } from "../board/board.guard.js";
import { TaskService } from "../task/task.service.js";

import { GenerateTasksDto, BreakdownTaskDto } from "./ai.dto.js";
import {
  GenerateTasksResponseDto,
  SubtasksResponseDto,
  SummaryResponseDto,
} from "./ai.responses.js";
import { AiService } from "./ai.service.js";

// a model call is slow and paid, so it is limited more tightly than the rest of the API
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@ApiErrors()
@Controller("boards/:boardId/ai")
@UseGuards(BoardAccessGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly taskService: TaskService,
  ) {}

  @HttpCode(200)
  @ApiOkResponse({ type: GenerateTasksResponseDto })
  @Post("tasks/generate")
  async generateTasks(
    @Param("boardId") boardId: string,
    @Session() session: UserSession,
    @Body() dto: GenerateTasksDto,
  ) {
    const suggestions = await this.aiService.generateTasksFromGoal(
      dto.goal,
      dto.count,
    );

    if (!dto.columnId) {
      return {
        tasks: suggestions,
        persisted: false,
      };
    }

    const tasks = await this.taskService.createGeneratedTasks(
      boardId,
      dto.columnId,
      session.user,
      suggestions,
    );

    return {
      tasks,
      persisted: true,
    };
  }

  @HttpCode(200)
  @ApiOkResponse({ type: SubtasksResponseDto })
  @Post("tasks/breakdown")
  async breakdownTask(
    @Param("boardId") boardId: string,
    @Body() dto: BreakdownTaskDto,
  ) {
    const source = dto.taskId
      ? await this.taskService.getTaskDetails(boardId, dto.taskId)
      : { title: dto.title, description: dto.description };
    if (!source.title)
      throw new BadRequestException("A task ID or title is required");

    const subtasks = await this.aiService.breakdownTask(
      source.title,
      source.description ?? "",
      dto.count,
    );

    return { subtasks };
  }

  @HttpCode(200)
  @ApiOkResponse({ type: SummaryResponseDto })
  @Post("summary")
  async summarizeBoard(@Param("boardId") boardId: string) {
    const summary = await this.aiService.summarizeBoard(boardId);

    return { summary };
  }
}
