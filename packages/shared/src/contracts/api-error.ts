import { z } from "zod";

/** What the API answers when a request fails. */
export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.union([z.string(), z.array(z.string())]),
    timestamp: z.string(),
    path: z.string(),
    issues: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional(),
  }),
});
