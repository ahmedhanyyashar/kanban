import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { BoardDetail } from "@/features/boards/api/boards";
import { boardKeys } from "@/features/boards/api/keys";

/** Edits one board's cached detail, optimistically or from a live event. */
export function useBoardCache(boardId: string) {
  const queryClient = useQueryClient();

  // stable while the board is the same, so an effect can depend on it
  const patch = useCallback(
    (edit: (detail: BoardDetail) => BoardDetail) =>
      queryClient.setQueryData<BoardDetail>(
        boardKeys.detail(boardId),
        (detail) => detail && edit(detail),
      ),
    [queryClient, boardId],
  );

  /** Makes the edit now and returns a function that puts back what was there. */
  const optimistic = async (edit: (detail: BoardDetail) => BoardDetail) => {
    const queryKey = boardKeys.detail(boardId);
    // an answer already on its way would overwrite the edit
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<BoardDetail>(queryKey);
    patch(edit);
    return () => queryClient.setQueryData(queryKey, previous);
  };

  return { patch, optimistic };
}
