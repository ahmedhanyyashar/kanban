import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/** What to look for: at least two characters are searched, and a longer text than a name or an address is not. */
export class UserSearchQueryDto extends createZodDto(
  z.object({ q: z.string().trim().max(100).default("") }),
) {}
