import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { LIMITS } from "@repo/shared/limits";

const createColumnSchema = z.object({
  title: z.string().trim().min(1).max(LIMITS.columnTitle),
});

export class CreateColumnDto extends createZodDto(createColumnSchema) {}

const updateColumnSchema = z
  .object({
    title: z.string().trim().min(1).max(LIMITS.columnTitle).optional(),
    position: z.number().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export class UpdateColumnDto extends createZodDto(updateColumnSchema) {}
