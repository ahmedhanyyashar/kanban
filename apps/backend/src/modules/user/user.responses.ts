import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { envelope, userSummarySchema } from "@repo/shared/contracts/board";

export class UserSearchResponseDto extends createZodDto(
  envelope(z.object({ users: z.array(userSummarySchema) })),
) {}
