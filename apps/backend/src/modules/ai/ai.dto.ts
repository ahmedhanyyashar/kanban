import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";

export class GenerateTasksDto extends createZodDto(
  z.object({
    goal: z.string().trim().min(1).max(LIMITS.aiGoal),
    count: z.coerce.number().int().min(1).max(15).default(6),
    columnId: z.uuid().optional(),
  }),
) {}

export class BreakdownTaskDto extends createZodDto(
  z
    .object({
      taskId: z.uuid().optional(),
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(2000).default(""),
      count: z.coerce.number().int().min(1).max(12).default(5),
    })
    .refine((data) => data.taskId || data.title, {
      message: "A task ID or title is required",
    }),
) {}
