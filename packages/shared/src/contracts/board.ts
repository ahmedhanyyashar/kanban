import { z } from "zod";

import { boardRoleSchema } from "../board-role.js";
import { LIMITS } from "../limits.js";

// What the API answers for boards, columns, tasks, members and activity. The server documents these
// and the generated client types them; the UI imports the same values (priorities) instead of copying them.
// Dates are ISO strings, positions are numbers, and a nullable text carries a length limit: a bare
// nullable string is described wrongly by the OpenAPI generator.

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const prioritySchema = z.enum(PRIORITIES);
export type Priority = z.infer<typeof prioritySchema>;

const isoDate = z.iso.datetime();

export const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().max(2048).nullable(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().max(LIMITS.taskDescription).nullable(),
  position: z.number(),
  priority: prioritySchema,
  /** A calendar day, at UTC midnight. */
  dueDate: isoDate.nullable(),
  assigneeId: z.string().nullable(),
  assignee: userSummarySchema.nullable(),
  boardId: z.string(),
  columnId: z.string(),
  createdBy: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  boardId: z.string(),
  createdAt: isoDate,
});

export const boardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().max(LIMITS.boardDescription).nullable(),
  color: z.string(),
  ownerId: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const boardListItemSchema = boardSchema.extend({
  isOwner: z.boolean(),
  taskCount: z.number(),
  memberCount: z.number(),
});

export const memberSchema = userSummarySchema.extend({
  role: boardRoleSchema,
  joinedAt: isoDate.optional(),
});

export const activitySchema = z.object({
  id: z.string(),
  action: z.string(),
  message: z.string(),
  boardId: z.string(),
  userId: z.string(),
  createdAt: isoDate,
  user: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().max(2048).nullable(),
  }),
});

/** The success envelope every route answers with. */
export function envelope<T extends z.ZodType>(data: T) {
  return z.object({ success: z.literal(true), data });
}

export const doneSchema = z.object({ success: z.literal(true) });
