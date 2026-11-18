import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useBoardCache } from "@/features/boards/hooks/use-board-cache";
import {
  patchTask,
  removeTask,
  upsertTask,
} from "@/features/boards/lib/board-cache";
import {
  createTask,
  deleteTask,
  moveTask,
  updateTask,
  type CreateTaskBody,
  type Task,
  type UpdateTaskBody,
} from "@/features/tasks/api/tasks";
import { errorMessage } from "@/lib/error-message";

type Rollback = { rollback: () => void };

/**
 * Create and update are saved from a form, which reports a failure itself, so they only reject.
 * Move and delete happen at once on screen and are put back, with a toast, if the server refuses.
 */
export function useTaskMutations(boardId: string) {
  const { patch, optimistic } = useBoardCache(boardId);

  const create = useMutation({
    mutationFn: (body: CreateTaskBody) => createTask(boardId, body),
    onSuccess: (task) => patch((detail) => upsertTask(detail, task)),
  });

  const update = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: UpdateTaskBody }) =>
      updateTask(boardId, taskId, body),
    onSuccess: (task) => patch((detail) => upsertTask(detail, task)),
  });

  const move = useMutation<
    Task,
    Error,
    { taskId: string; columnId: string; position: number },
    Rollback
  >({
    mutationFn: ({ taskId, columnId, position }) =>
      moveTask(boardId, taskId, { columnId, position }),
    onMutate: async ({ taskId, columnId, position }) => ({
      rollback: await optimistic((detail) =>
        patchTask(detail, taskId, { columnId, position }),
      ),
    }),
    onError: (error, _vars, context) => {
      context?.rollback();
      toast.error(errorMessage(error, "The task could not be moved."));
    },
    onSuccess: (task) => patch((detail) => upsertTask(detail, task)),
  });

  const remove = useMutation<unknown, Error, string, Rollback>({
    mutationFn: (taskId) => deleteTask(boardId, taskId),
    onMutate: async (taskId) => ({
      rollback: await optimistic((detail) => removeTask(detail, taskId)),
    }),
    onError: (error, _taskId, context) => {
      context?.rollback();
      toast.error(errorMessage(error, "The task could not be deleted."));
    },
    onSuccess: () => toast.success("Task deleted"),
  });

  return { create, update, move, remove };
}
