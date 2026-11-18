import { z } from "zod";

import {
  boardSchema,
  columnSchema,
  taskSchema,
} from "@repo/shared/contracts/board";

import type { BoardDetail } from "@/features/boards/api/boards";

import {
  removeColumn,
  removeTask,
  setBoard,
  upsertColumn,
  upsertTask,
} from "./board-cache";

/** The events the server sends to everyone looking at a board, and which this module acts on. */
export const BOARD_EVENTS = [
  "task:created",
  "task:updated",
  "task:moved",
  "task:deleted",
  "column:created",
  "column:updated",
  "column:deleted",
  "board:updated",
] as const;

const removed = z.object({ id: z.string() });

/**
 * What a live event does to the cached board. A payload that is not what the contract says is
 * ignored rather than trusted, and an event this does not know leaves the board as it is.
 */
export function applyBoardEvent(
  detail: BoardDetail,
  event: string,
  payload: unknown,
): BoardDetail {
  switch (event) {
    case "task:created":
    case "task:updated":
    case "task:moved": {
      const task = taskSchema.safeParse(payload);
      return task.success ? upsertTask(detail, task.data) : detail;
    }
    case "task:deleted": {
      const gone = removed.safeParse(payload);
      return gone.success ? removeTask(detail, gone.data.id) : detail;
    }
    case "column:created":
    case "column:updated": {
      const column = columnSchema.safeParse(payload);
      return column.success ? upsertColumn(detail, column.data) : detail;
    }
    case "column:deleted": {
      const gone = removed.safeParse(payload);
      return gone.success ? removeColumn(detail, gone.data.id) : detail;
    }
    case "board:updated": {
      const board = boardSchema.safeParse(payload);
      return board.success ? setBoard(detail, board.data) : detail;
    }
    default:
      return detail;
  }
}
