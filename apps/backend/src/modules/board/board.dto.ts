import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { boardRoleSchema } from "@repo/shared/board-role";
import { LIMITS } from "@repo/shared/limits";

const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(LIMITS.boardTitle),
  description: z.string().trim().max(LIMITS.boardDescription).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export class CreateBoardDto extends createZodDto(createBoardSchema) {}

const updateBoardSchema = createBoardSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export class UpdateBoardDto extends createZodDto(updateBoardSchema) {}

const addBoardMemberSchema = z.object({
  email: z.email().trim(),
  role: boardRoleSchema.exclude(["owner"]).default("member"),
});

/** How many of the latest changes to return. */
export class ActivityQueryDto extends createZodDto(
  z.object({ limit: z.coerce.number().int().min(1).max(100).default(30) }),
) {}

export class AddBoardMemberDto extends createZodDto(addBoardMemberSchema) {}
