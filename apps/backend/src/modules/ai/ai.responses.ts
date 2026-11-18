import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import {
  boardSummarySchema,
  envelope,
  taskSchema,
  taskSuggestionSchema,
} from "@repo/shared/contracts/board";

/** Drafts when no column was given; the tasks that were saved when one was. */
export class GenerateTasksResponseDto extends createZodDto(
  envelope(
    z.discriminatedUnion("persisted", [
      z.object({
        persisted: z.literal(false),
        tasks: z.array(taskSuggestionSchema),
      }),
      z.object({ persisted: z.literal(true), tasks: z.array(taskSchema) }),
    ]),
  ),
) {}

export class SubtasksResponseDto extends createZodDto(
  envelope(z.object({ subtasks: z.array(taskSuggestionSchema) })),
) {}

export class SummaryResponseDto extends createZodDto(
  envelope(z.object({ summary: boardSummarySchema })),
) {}
