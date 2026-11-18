import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";

/** A calendar day (`YYYY-MM-DD`), kept as that day at UTC midnight. */
const calendarDay = z.iso.date().transform((day) => new Date(day));

const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export class CreateTaskDto extends createZodDto(
  z.object({
    columnId: z.uuid(),
    title: z.string().trim().min(1).max(LIMITS.taskTitle),
    description: z
      .string()
      .trim()
      .max(LIMITS.taskDescription)
      .nullable()
      .optional(),
    dueDate: calendarDay.nullable().optional(),
    assigneeId: z.string().min(1).max(64).nullable().optional(),
    priority: prioritySchema.default("medium"),
  }),
) {}

export class UpdateTaskDto extends createZodDto(
  z
    .object({
      title: z.string().trim().min(1).max(LIMITS.taskTitle).optional(),
      description: z
        .string()
        .trim()
        .max(LIMITS.taskDescription)
        .nullable()
        .optional(),
      dueDate: calendarDay.nullable().optional(),
      assigneeId: z.string().min(1).max(64).nullable().optional(),
      priority: prioritySchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
) {}

export class MoveTaskDto extends createZodDto(
  z.object({
    columnId: z.uuid(),
    position: z.number().nonnegative(),
  }),
) {}

export class ListTasksQueryDto extends createZodDto(
  z.object({
    priority: prioritySchema.optional(),
    assignee: z.string().min(1).max(64).optional(),
    column: z.uuid().optional(),
    q: z.string().trim().optional(),
  }),
) {}
