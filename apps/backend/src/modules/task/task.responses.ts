import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { envelope, taskSchema } from "@repo/shared/contracts/board";

export class TaskListResponseDto extends createZodDto(
  envelope(z.object({ tasks: z.array(taskSchema) })),
) {}

export class TaskResponseDto extends createZodDto(
  envelope(z.object({ task: taskSchema })),
) {}
