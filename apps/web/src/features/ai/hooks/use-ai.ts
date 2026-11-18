import { useMutation, useQuery } from "@tanstack/react-query";

import {
  breakdownTask,
  generateTasks,
  summarizeBoard,
} from "@/features/ai/api/ai";
import type { GenerateInput } from "@/features/ai/lib/generate-form";

/** Drafts tasks for a goal; the dialog shows the failure. */
export function useGenerateTasks(boardId: string) {
  return useMutation({
    mutationFn: ({ goal, count }: GenerateInput) =>
      generateTasks(boardId, goal, count),
  });
}

/** Splits a task into subtasks; the caller decides what to do with them and reports a failure. */
export function useBreakdownTask(boardId: string) {
  return useMutation({
    mutationFn: (taskId: string) => breakdownTask(boardId, taskId),
  });
}

/** Written when asked for, and kept a minute: it takes a while and costs a model call. */
export function useBoardSummary(boardId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["boards", "summary", boardId],
    queryFn: () => summarizeBoard(boardId),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
