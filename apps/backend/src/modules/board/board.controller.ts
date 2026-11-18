import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";

import { ApiErrors, DoneResponseDto } from "@/lib/openapi/responses";

import {
  ActivityQueryDto,
  AddBoardMemberDto,
  CreateBoardDto,
  UpdateBoardDto,
} from "./board.dto.js";
import { BoardAccessGuard, type BoardRequest } from "./board.guard.js";
import {
  ActivityListResponseDto,
  BoardDetailResponseDto,
  BoardListResponseDto,
  BoardResponseDto,
  MemberResponseDto,
} from "./board.responses.js";
import { BoardService } from "./board.service.js";

const BOARD_ID_PARAM = { name: "boardId", format: "uuid" };

@ApiErrors()
@Controller("boards")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiOkResponse({ type: BoardListResponseDto })
  @Get()
  listBoards(@Session() session: UserSession) {
    return this.boardService.listBoards(session.user.id);
  }

  @ApiCreatedResponse({ type: BoardResponseDto })
  @Post()
  createBoard(@Session() session: UserSession, @Body() dto: CreateBoardDto) {
    return this.boardService.createBoard(session.user.id, dto);
  }

  @ApiOkResponse({ type: BoardDetailResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Get(":boardId")
  @UseGuards(BoardAccessGuard)
  getBoard(@Req() request: BoardRequest) {
    return this.boardService.getBoard(request.board);
  }

  @ApiOkResponse({ type: BoardResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Patch(":boardId")
  @UseGuards(BoardAccessGuard)
  updateBoard(@Req() request: BoardRequest, @Body() dto: UpdateBoardDto) {
    return this.boardService.updateBoard(request.board, dto);
  }

  @ApiOkResponse({ type: DoneResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Delete(":boardId")
  @UseGuards(BoardAccessGuard)
  deleteBoard(@Req() request: BoardRequest) {
    return this.boardService.deleteBoard(request.board);
  }

  @ApiOkResponse({ type: ActivityListResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Get(":boardId/activities")
  @UseGuards(BoardAccessGuard)
  getActivity(@Req() request: BoardRequest, @Query() query: ActivityQueryDto) {
    return this.boardService.getActivity(request.board.id, query.limit);
  }

  @ApiCreatedResponse({ type: MemberResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Post(":boardId/members")
  @UseGuards(BoardAccessGuard)
  addMember(
    @Req() request: BoardRequest,
    @Session() session: UserSession,
    @Body() dto: AddBoardMemberDto,
  ) {
    return this.boardService.addMember(
      request.board,
      session.user.id,
      session.user.name,
      dto,
    );
  }

  @ApiOkResponse({ type: DoneResponseDto })
  @ApiParam(BOARD_ID_PARAM)
  @Delete(":boardId/members/:userId")
  @UseGuards(BoardAccessGuard)
  removeMember(
    @Req() request: BoardRequest,
    @Session() session: UserSession,
    @Param("userId") userId: string,
  ) {
    return this.boardService.removeMember(
      request.board,
      session.user.id,
      session.user.name,
      userId,
    );
  }
}
