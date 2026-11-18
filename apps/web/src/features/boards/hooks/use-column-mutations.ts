import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createColumn,
  deleteColumn,
  updateColumn,
  type Column,
  type CreateColumnBody,
} from "@/features/boards/api/columns";
import { useBoardCache } from "@/features/boards/hooks/use-board-cache";
import {
  patchColumn,
  removeColumn,
  upsertColumn,
} from "@/features/boards/lib/board-cache";
import { errorMessage } from "@/lib/error-message";

type Rollback = { rollback: () => void };

/** Adding a column comes from a form, which reports a failure itself; rename and delete toast. */
export function useColumnMutations(boardId: string) {
  const { patch, optimistic } = useBoardCache(boardId);

  const create = useMutation({
    mutationFn: (body: CreateColumnBody) => createColumn(boardId, body),
    onSuccess: (column) => patch((detail) => upsertColumn(detail, column)),
  });

  const rename = useMutation<
    Column,
    Error,
    { columnId: string; title: string },
    Rollback
  >({
    mutationFn: ({ columnId, title }) =>
      updateColumn(boardId, columnId, { title }),
    onMutate: async ({ columnId, title }) => ({
      rollback: await optimistic((detail) =>
        patchColumn(detail, columnId, { title }),
      ),
    }),
    onError: (error, _vars, context) => {
      context?.rollback();
      toast.error(errorMessage(error, "The column could not be renamed."));
    },
    onSuccess: (column) => patch((detail) => upsertColumn(detail, column)),
  });

  // not optimistic: the server refuses a column that still has tasks, and that must not flicker
  const remove = useMutation({
    mutationFn: (columnId: string) => deleteColumn(boardId, columnId),
    onSuccess: (_done, columnId) =>
      patch((detail) => removeColumn(detail, columnId)),
    onError: (error) =>
      toast.error(errorMessage(error, "The column could not be deleted.")),
  });

  return { create, rename, remove };
}
