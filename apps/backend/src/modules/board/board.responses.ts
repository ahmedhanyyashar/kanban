import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { boardRoleSchema } from "@repo/shared/board-role";
import {
  activitySchema,
  boardListItemSchema,
  boardSchema,
  columnSchema,
  envelope,
  memberSchema,
  taskSchema,
} from "@repo/shared/contracts/board";

export class BoardListResponseDto extends createZodDto(
  envelope(z.object({ boards: z.array(boardListItemSchema) })),
) {}

export class BoardResponseDto extends createZodDto(
  envelope(z.object({ board: boardSchema })),
) {}

export class BoardDetailResponseDto extends createZodDto(
  envelope(
    z.object({
      board: boardSchema,
      columns: z.array(columnSchema),
      tasks: z.array(taskSchema),
      members: z.array(memberSchema),
      /** What the viewer is on this board. */
      role: boardRoleSchema,
    }),
  ),
) {}

export class ActivityListResponseDto extends createZodDto(
  envelope(z.object({ activities: z.array(activitySchema) })),
) {}

export class MemberResponseDto extends createZodDto(
  envelope(z.object({ member: memberSchema })),
) {}
