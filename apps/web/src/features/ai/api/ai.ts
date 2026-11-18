import type { components } from "@repo/api-client";

import type { TaskSuggestion } from "@/features/ai/lib/generate-form";
import type { BoardSummary } from "@/features/ai/lib/summary";
import { api, unwrap } from "@/lib/api-client";

type Schemas = components["schemas"];

export type BreakdownBody = Schemas["BreakdownTaskDto"];

/** Drafts tasks for a goal. Nothing is saved: the person adds what they were shown. */
export async function generateTasks(
  boardId: string,
  goal: string,
  count: number,
): Promise<TaskSuggestion[]> {
  const result = await unwrap(
    api.POST("/boards/{boardId}/ai/tasks/generate", {
      params: { path: { boardId } },
      body: { goal, count },
    }),
  );
  if (result.persisted)
    throw new Error("The tasks were saved instead of drafted.");
  return result.tasks;
}

/** Splits a saved task into subtasks (the server reads the task, so only its id is needed). */
export const breakdownTask = (boardId: string, taskId: string, count = 5) =>
  unwrap(
    api.POST("/boards/{boardId}/ai/tasks/breakdown", {
      params: { path: { boardId } },
      // the description is read from the task; the body type asks for one regardless
      body: { taskId, description: "", count },
    }),
  ).then((data) => data.subtasks);

export const summarizeBoard = (boardId: string): Promise<BoardSummary> =>
  unwrap(
    api.POST("/boards/{boardId}/ai/summary", {
      params: { path: { boardId } },
    }),
  ).then((data) => data.summary);
