import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { columnSchema, envelope } from "@repo/shared/contracts/board";

export class ColumnResponseDto extends createZodDto(
  envelope(z.object({ column: columnSchema })),
) {}
