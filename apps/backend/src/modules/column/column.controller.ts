import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiParam } from "@nestjs/swagger";

import { ApiErrors, DoneResponseDto } from "@/lib/openapi/responses";

import { BoardAccessGuard, type BoardRequest } from "../board/board.guard.js";

import { CreateColumnDto, UpdateColumnDto } from "./column.dto.js";
import { ColumnResponseDto } from "./column.responses.js";
import { ColumnService } from "./column.service.js";

@ApiParam({ name: "boardId", format: "uuid" })
@ApiErrors()
@Controller("boards/:boardId/columns")
@UseGuards(BoardAccessGuard)
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @ApiCreatedResponse({ type: ColumnResponseDto })
  @Post()
  createColumn(@Req() request: BoardRequest, @Body() dto: CreateColumnDto) {
    return this.columnService.create(request.board, dto);
  }

  @ApiOkResponse({ type: ColumnResponseDto })
  @Patch(":columnId")
  updateColumn(
    @Req() request: BoardRequest,
    @Param("columnId", ParseUUIDPipe) columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnService.update(request.board, columnId, dto);
  }

  @ApiOkResponse({ type: DoneResponseDto })
  @Delete(":columnId")
  deleteColumn(
    @Req() request: BoardRequest,
    @Param("columnId", ParseUUIDPipe) columnId: string,
  ) {
    return this.columnService.delete(request.board, columnId);
  }
}
